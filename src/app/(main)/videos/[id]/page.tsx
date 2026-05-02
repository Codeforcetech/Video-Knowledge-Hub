import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VideoCommentForm } from "@/components/VideoCommentForm";
import { VideoCommentList } from "@/components/VideoCommentList";
import { VideoReactions } from "@/components/VideoReactions";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { formatDateJa, formatDateTimeJa } from "@/lib/datetime";
import { getVideoDetailPayload } from "@/lib/queries/videos";
import { getCurrentUser } from "@/lib/session";
import { DeleteVideoButton } from "@/components/DeleteVideoButton";
import {
  buttonSecondary,
  linkExternal,
  linkMuted,
  tagChipDetail,
} from "@/lib/ui";

type Props = { params: Promise<{ id: string }> };

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = await getVideoDetailPayload(id, user.id);
  if (!payload) notFound();

  const { video, stats } = payload;

  const canEdit =
    user &&
    (user.id === video.registeredById || user.role === "ADMIN");
  const canDelete = canEdit;

  const who =
    video.registeredBy.name?.trim() ||
    video.registeredBy.email ||
    "（不明）";

  const producerWho =
    video.producedBy &&
    (video.producedBy.name?.trim() ||
      video.producedBy.email ||
      "（不明）");

  const tagChips = [...video.tags]
    .sort((a, b) =>
      a.tagItem.category.name.localeCompare(b.tagItem.category.name, "ja"),
    )
    .map((t) => ({
      id: t.tagItemId,
      label: `${t.tagItem.category.name}: ${t.tagItem.name}`,
    }));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/videos" className={linkMuted}>
          ← 一覧へ
        </Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              動画詳細
            </h1>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkExternal}
            >
              {video.url}
            </a>
          </div>
          {canEdit ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/videos/${video.id}/edit`}
                className={`${buttonSecondary} w-fit shrink-0`}
              >
                編集
              </Link>
              {canDelete ? <DeleteVideoButton videoId={video.id} /> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="group max-w-3xl overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
        <VideoThumbnail
          src={video.thumbnailUrl}
          alt="動画サムネイル"
          roundedClassName="rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-5 sm:flex-row sm:items-center sm:justify-between">
        <VideoReactions
          videoId={video.id}
          goodCount={stats.goodCount}
          badCount={stats.badCount}
          myReaction={stats.myReaction}
        />
        <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
          <span className="tabular-nums">💬 コメント {stats.commentCount}</span>
          <span className="tabular-nums">👍 Good {stats.goodCount}</span>
          <span className="tabular-nums">👎 Bad {stats.badCount}</span>
        </div>
      </div>

      {tagChips.length > 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">
            タグ
          </h2>
          <div className="flex flex-wrap gap-2">
            {tagChips.map((t) => (
              <span key={t.id} className={tagChipDetail}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">メモ</h2>
          {video.memo ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#A1A1AA]">
              {video.memo}
            </p>
          ) : (
            <p className="text-sm text-[#A1A1AA]/70">メモはありません</p>
          )}
        </div>

        <aside className="space-y-4 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6">
          <h2 className="text-sm font-semibold text-white">情報</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-[#A1A1AA]">自社制作</dt>
              <dd className="mt-1 text-white">
                {video.isInHouse ? "はい" : "いいえ"}
              </dd>
            </div>
            {video.isInHouse ? (
              <>
                <div>
                  <dt className="text-xs text-[#A1A1AA]">制作者</dt>
                  <dd className="mt-1 text-white">
                    {producerWho ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A1A1AA]">制作日</dt>
                  <dd className="mt-1 text-white">
                    {video.producedAt
                      ? formatDateJa(video.producedAt)
                      : "—"}
                  </dd>
                </div>
              </>
            ) : null}
            <div>
              <dt className="text-xs text-[#A1A1AA]">登録者</dt>
              <dd className="mt-1 text-white">{who}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#A1A1AA]">登録日時</dt>
              <dd className="mt-1 text-white">
                {formatDateTimeJa(video.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#A1A1AA]">更新日時</dt>
              <dd className="mt-1 text-white">
                {formatDateTimeJa(video.updatedAt)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className="space-y-6 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6">
        <div>
          <h2 className="text-sm font-semibold text-white">コメント</h2>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            チーム内のフィードバックやメモを残せます（{stats.commentCount}{" "}
            件）
          </p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
          <VideoCommentForm videoId={video.id} />
        </div>

        <VideoCommentList
          comments={video.comments}
          currentUserId={user.id}
          isAdmin={user.role === "ADMIN"}
        />
      </section>
    </div>
  );
}
