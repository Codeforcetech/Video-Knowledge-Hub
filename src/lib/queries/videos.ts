import type { Prisma } from "@/generated/prisma/client";
import type { ReactionType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { endOfDayJst, startOfDayJst } from "@/lib/datetime";
import type { VideoListFilters } from "@/lib/videoListFilters";

export type { ReactionType };
export type { VideoListFilters } from "@/lib/videoListFilters";

export function parseVideoListSearchParams(sp: URLSearchParams): VideoListFilters {
  const qUrl = sp.get("qUrl")?.trim() || undefined;
  const qMemo = sp.get("qMemo")?.trim() || undefined;
  const tagIds = sp.getAll("tag").map(String).filter(Boolean);
  const producerId = sp.get("producer")?.trim() || undefined;
  const producedFrom = sp.get("producedFrom")?.trim() || undefined;
  const producedTo = sp.get("producedTo")?.trim() || undefined;
  const inHouseRaw = sp.get("inHouse");
  let inHouse: boolean | undefined;
  if (inHouseRaw === "true") inHouse = true;
  else if (inHouseRaw === "false") inHouse = false;

  return {
    qUrl,
    qMemo,
    tagIds,
    producerId,
    producedFrom,
    producedTo,
    inHouse,
  };
}

export function searchParamsRecordToURLSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((x) => u.append(k, x));
    else u.set(k, v);
  }
  return u;
}

export async function buildVideoWhereFromFilters(
  filters: VideoListFilters,
): Promise<Prisma.VideoWhereInput> {
  const AND: Prisma.VideoWhereInput[] = [];

  if (filters.qUrl) {
    AND.push({ url: { contains: filters.qUrl, mode: "insensitive" } });
  }
  if (filters.qMemo) {
    AND.push({ memo: { contains: filters.qMemo, mode: "insensitive" } });
  }

  if (filters.producerId) {
    AND.push({ producedById: filters.producerId });
  }

  if (filters.inHouse === true) AND.push({ isInHouse: true });
  if (filters.inHouse === false) AND.push({ isInHouse: false });

  const hasProducedFrom = Boolean(filters.producedFrom);
  const hasProducedTo = Boolean(filters.producedTo);
  if (hasProducedFrom || hasProducedTo) {
    const producedAt: Prisma.DateTimeNullableFilter = { not: null };
    if (hasProducedFrom && filters.producedFrom) {
      producedAt.gte = startOfDayJst(filters.producedFrom);
    }
    if (hasProducedTo && filters.producedTo) {
      producedAt.lte = endOfDayJst(filters.producedTo);
    }
    AND.push({ producedAt });
  }

  if (filters.tagIds.length > 0) {
    const items = await prisma.tagItem.findMany({
      where: {
        id: { in: filters.tagIds },
        isActive: true,
        category: { isActive: true },
      },
      select: { id: true, categoryId: true },
    });

    const byCategory = new Map<string, string[]>();
    for (const it of items) {
      const list = byCategory.get(it.categoryId) ?? [];
      list.push(it.id);
      byCategory.set(it.categoryId, list);
    }

    for (const ids of byCategory.values()) {
      AND.push({
        tags: { some: { tagItemId: { in: ids } } },
      });
    }
  }

  return AND.length > 0 ? { AND } : {};
}

export const videoListInclude = {
  registeredBy: { select: { id: true, name: true, email: true } },
  producedBy: { select: { id: true, name: true, email: true } },
  tags: {
    include: {
      tagItem: {
        include: {
          category: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.VideoInclude;

export async function listVideosForPage(where: Prisma.VideoWhereInput) {
  return prisma.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: videoListInclude,
  });
}

export type VideoListRow = Awaited<ReturnType<typeof listVideosForPage>>[number];

export type VideoFeedStats = {
  commentCount: number;
  goodCount: number;
  badCount: number;
  myReaction: ReactionType | null;
};

export type VideoFeedRow = VideoListRow & { stats: VideoFeedStats };

async function fetchFeedAggregates(
  videoIds: string[],
  currentUserId: string | null,
) {
  const empty = {
    commentCounts: new Map<string, number>(),
    goodCounts: new Map<string, number>(),
    badCounts: new Map<string, number>(),
    myReaction: new Map<string, ReactionType>(),
  };
  if (videoIds.length === 0) return empty;

  const [commentAgg, reactionAgg, mine] = await Promise.all([
    prisma.comment.groupBy({
      by: ["videoId"],
      where: { videoId: { in: videoIds } },
      _count: { _all: true },
    }),
    prisma.videoReaction.groupBy({
      by: ["videoId", "type"],
      where: { videoId: { in: videoIds } },
      _count: { _all: true },
    }),
    currentUserId
      ? prisma.videoReaction.findMany({
          where: { userId: currentUserId, videoId: { in: videoIds } },
          select: { videoId: true, type: true },
        })
      : Promise.resolve([]),
  ]);

  const commentCounts = new Map(
    commentAgg.map((r) => [r.videoId, r._count._all]),
  );
  const goodCounts = new Map<string, number>();
  const badCounts = new Map<string, number>();
  for (const r of reactionAgg) {
    if (r.type === "GOOD") goodCounts.set(r.videoId, r._count._all);
    if (r.type === "BAD") badCounts.set(r.videoId, r._count._all);
  }
  const myReaction = new Map(mine.map((x) => [x.videoId, x.type]));

  return { commentCounts, goodCounts, badCounts, myReaction };
}

function mergeFeedStats(
  videoId: string,
  agg: Awaited<ReturnType<typeof fetchFeedAggregates>>,
): VideoFeedStats {
  return {
    commentCount: agg.commentCounts.get(videoId) ?? 0,
    goodCount: agg.goodCounts.get(videoId) ?? 0,
    badCount: agg.badCounts.get(videoId) ?? 0,
    myReaction: agg.myReaction.get(videoId) ?? null,
  };
}

/** 一覧・タイムライン用: 動画行 + コメント/リアクション集計 + 自分のリアクション */
export async function listVideosFeed(
  where: Prisma.VideoWhereInput,
  currentUserId: string | null,
): Promise<VideoFeedRow[]> {
  const videos = await listVideosForPage(where);
  const ids = videos.map((v) => v.id);
  const agg = await fetchFeedAggregates(ids, currentUserId);
  return videos.map((v) => ({
    ...v,
    stats: mergeFeedStats(v.id, agg),
  }));
}

/** タイムライン（検索なし・新着のみ） */
export async function listVideosForTimeline(currentUserId: string | null) {
  return listVideosFeed({}, currentUserId);
}

export type VideoDetailComment = {
  id: string;
  body: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string | null };
};

export type VideoDetailPayload = {
  video: VideoListRow & {
    comments: VideoDetailComment[];
  };
  stats: VideoFeedStats;
};

export async function getVideoDetailPayload(
  id: string,
  currentUserId: string | null,
): Promise<VideoDetailPayload | null> {
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      ...videoListInclude,
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!video) return null;

  const agg = await fetchFeedAggregates([id], currentUserId);
  return {
    video: {
      ...video,
      comments: video.comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        user: c.user,
      })),
    },
    stats: mergeFeedStats(id, agg),
  };
}
