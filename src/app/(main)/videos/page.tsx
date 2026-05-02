import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { VideoCard } from "@/components/VideoCard";
import { VideoSearchForm } from "@/components/VideoSearchForm";
import { getCurrentUser } from "@/lib/session";
import { getTagCategoriesForForm } from "@/lib/data/tagCategories";
import { getActiveUsersForSelect } from "@/lib/data/users";
import {
  buildVideoWhereFromFilters,
  listVideosFeed,
  parseVideoListSearchParams,
  searchParamsRecordToURLSearchParams,
} from "@/lib/queries/videos";
import { videoListFiltersAreActive } from "@/lib/videoListFilters";
import { buildVideoSearchHitMessage } from "@/lib/videoSearchSummary";
import { buttonPrimary, linkAccent } from "@/lib/ui";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VideosPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const usp = searchParamsRecordToURLSearchParams(sp);
  const filters = parseVideoListSearchParams(usp);

  const where = await buildVideoWhereFromFilters(filters);
  const user = await getCurrentUser();

  const [tagCategories, users, list] = await Promise.all([
    getTagCategoriesForForm(),
    getActiveUsersForSelect(),
    listVideosFeed(where, user?.id ?? null),
  ]);

  const hasActiveFilters = videoListFiltersAreActive(filters);
  const searchHitMessage = hasActiveFilters
    ? buildVideoSearchHitMessage(filters, tagCategories, users, list.length)
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            動画一覧
          </h1>
          <p className="mt-1.5 text-sm text-[#A1A1AA]">
            登録済みの動画を新着順で表示します（
            <span className="tabular-nums text-white/80">{list.length}</span>{" "}
            件）
          </p>
        </div>
        <Link href="/videos/new" className={`${buttonPrimary} w-fit`}>
          動画を登録
        </Link>
      </div>

      <VideoSearchForm
        initial={filters}
        tagCategories={tagCategories}
        users={users}
      />

      {searchHitMessage ? (
        <p
          className="rounded-2xl border border-[#2A2A2A] bg-[#181818] px-4 py-3 text-sm leading-relaxed text-[#A1A1AA]"
          role="status"
        >
          {searchHitMessage}
        </p>
      ) : null}

      {list.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="該当する動画がありません"
            description={
              <span>
                検索条件を変えるか、
                <Link href="/videos/new" className={`${linkAccent} mx-0.5`}>
                  新規登録
                </Link>
                するか、
                <Link href="/videos" className={`${linkAccent} mx-0.5`}>
                  条件をクリア
                </Link>
                してください。
              </span>
            }
            variant="solid"
          />
        ) : (
          <EmptyState
            title="まだ動画が登録されていません"
            description="タイムラインや一覧に表示するには、動画を1本以上登録してください。"
            action={{ href: "/videos/new", label: "動画を登録" }}
            variant="solid"
          />
        )
      ) : (
        <ul className="grid gap-5">
          {list.map((v) => (
            <li key={v.id}>
              <VideoCard video={v} variant="list" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
