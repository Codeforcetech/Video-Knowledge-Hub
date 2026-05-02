import Link from "next/link";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { VideoReactions } from "@/components/VideoReactions";
import { formatDateJa, formatDateTimeJa } from "@/lib/datetime";
import { linkAccent, tagChipCard, tagChipNeutral } from "@/lib/ui";
import type { VideoFeedRow } from "@/lib/queries/videos";

type Props = {
  video: VideoFeedRow;
  variant: "list" | "timeline";
};

function regName(v: VideoFeedRow) {
  return (
    v.registeredBy.name?.trim() ||
    v.registeredBy.email ||
    "（不明）"
  );
}

function prodName(v: VideoFeedRow) {
  if (!v.producedBy) return null;
  return (
    v.producedBy.name?.trim() ||
    v.producedBy.email ||
    "（不明）"
  );
}

export function VideoCard({ video: v, variant }: Props) {
  const isTimeline = variant === "timeline";
  const tagShow = isTimeline ? v.tags.slice(0, 6) : v.tags.slice(0, 4);
  const producer = prodName(v);

  const thumbRounded = isTimeline
    ? "rounded-t-2xl rounded-b-none"
    : "rounded-t-2xl rounded-b-none md:rounded-l-2xl md:rounded-tr-none md:rounded-br-none";

  return (
    <article
      className={[
        "group max-w-full overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#181818]",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_24px_56px_rgba(0,0,0,0.55)]",
        isTimeline ? "flex flex-col" : "flex min-w-0 flex-col md:flex-row md:items-stretch",
      ].join(" ")}
    >
      <div
        className={
          isTimeline
            ? "relative min-w-0"
            : "relative w-full min-w-0 md:shrink-0 md:w-[min(38%,300px)] md:self-stretch"
        }
      >
        <Link
          href={`/videos/${v.id}`}
          className={[
            "block w-full min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]/40",
            !isTimeline
              ? "md:relative md:h-full md:min-h-[200px]"
              : "",
          ].join(" ")}
        >
          {!isTimeline ? (
            <span className="block w-full min-w-0 md:absolute md:inset-0">
              <VideoThumbnail
                src={v.thumbnailUrl}
                alt=""
                fillHeight
                roundedClassName={thumbRounded}
              />
            </span>
          ) : (
            <VideoThumbnail
              src={v.thumbnailUrl}
              alt=""
              roundedClassName={thumbRounded}
            />
          )}
        </Link>
      </div>

      <div
        className={
          isTimeline
            ? "flex flex-1 flex-col px-6 pb-6 pt-5"
            : "flex min-w-0 flex-1 flex-col p-5 md:px-6 md:py-6"
        }
      >
        <Link
          href={`/videos/${v.id}`}
          className="block min-w-0 space-y-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181818]"
        >
          <p className="line-clamp-2 break-all text-sm font-medium text-[#60A5FA] transition group-hover:text-[#93C5FD]">
            {v.url}
          </p>
          <p className="text-xs text-[#3B82F6]/85 transition group-hover:text-[#60A5FA]">
            詳細を見る →
          </p>

          {v.memo ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-white/75">
              {v.memo}
            </p>
          ) : null}

          {tagShow.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {tagShow.map((t) => (
                <span key={t.tagItemId} className={tagChipCard}>
                  {t.tagItem.name}
                </span>
              ))}
              {v.tags.length > tagShow.length ? (
                <span className="self-center text-[11px] tabular-nums text-[#A1A1AA]">
                  +{v.tags.length - tagShow.length}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-1 text-xs text-[#A1A1AA]">
            {v.isInHouse ? (
              <span className={tagChipNeutral}>自社制作</span>
            ) : null}
            {v.isInHouse && producer ? (
              <span>制作者: {producer}</span>
            ) : null}
            {v.isInHouse && v.producedAt ? (
              <>
                <span className="text-[#3F3F46]">·</span>
                <span className="tabular-nums">
                  制作: {formatDateJa(v.producedAt)}
                </span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
            <span>登録者: {regName(v)}</span>
            <span className="text-[#3F3F46]">·</span>
            <span className="tabular-nums">{formatDateTimeJa(v.createdAt)}</span>
          </div>
        </Link>

        <div
          className={[
            "mt-5 flex flex-col gap-3 border-t border-[#2A2A2A] pt-5 sm:flex-row sm:items-center sm:justify-between",
            isTimeline ? "mt-auto" : "",
          ].join(" ")}
        >
          <VideoReactions
            videoId={v.id}
            goodCount={v.stats.goodCount}
            badCount={v.stats.badCount}
            myReaction={v.stats.myReaction}
            compact
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
            <span className="tabular-nums" title="コメント">
              💬 {v.stats.commentCount}
            </span>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkAccent} text-xs font-medium`}
            >
              再生（新しいタブ）↗
            </a>
            <Link href={`/videos/${v.id}`} className={`${linkAccent} text-xs`}>
              詳細
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
