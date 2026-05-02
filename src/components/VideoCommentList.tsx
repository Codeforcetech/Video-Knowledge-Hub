"use client";

import { useTransition } from "react";
import { deleteComment } from "@/actions/comments";
import { formatDateTimeJa } from "@/lib/datetime";
import type { VideoDetailComment } from "@/lib/queries/videos";

type Props = {
  comments: VideoDetailComment[];
  currentUserId: string;
  isAdmin: boolean;
};

function authorName(u: VideoDetailComment["user"]) {
  return u.name?.trim() || u.email || "ユーザー";
}

export function VideoCommentList({ comments, currentUserId, isAdmin }: Props) {
  const [pending, start] = useTransition();

  if (comments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#111111]/50 px-4 py-8 text-center text-sm text-[#A1A1AA]">
        まだコメントはありません。最初のコメントを投稿してみましょう。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#2A2A2A] rounded-2xl border border-[#2A2A2A] bg-[#181818]">
      {comments.map((c) => {
        const canDelete = c.user.id === currentUserId || isAdmin;
        return (
          <li key={c.id} className="px-4 py-4 first:rounded-t-2xl last:rounded-b-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium text-white">
                    {authorName(c.user)}
                  </span>
                  <time
                    dateTime={c.createdAt.toISOString()}
                    className="text-xs text-[#A1A1AA]"
                  >
                    {formatDateTimeJa(c.createdAt)}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#A1A1AA]">
                  {c.body}
                </p>
              </div>
              {canDelete && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("このコメントを削除しますか？")) return;
                    start(async () => {
                      await deleteComment(c.id);
                    });
                  }}
                  className="shrink-0 rounded-lg border border-[#2A2A2A] px-2 py-1 text-[10px] text-[#A1A1AA] transition hover:border-red-500/40 hover:text-red-200"
                >
                  削除
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
