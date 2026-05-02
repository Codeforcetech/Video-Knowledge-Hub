"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { applyVideoReaction } from "@/actions/reactions";
import type { ReactionType } from "@/lib/queries/videos";

type Props = {
  videoId: string;
  goodCount: number;
  badCount: number;
  myReaction: ReactionType | null;
  /** 一覧カード内でコンパクト表示 */
  compact?: boolean;
};

const btnBase =
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/35 disabled:pointer-events-none disabled:opacity-50";

export function VideoReactions({
  videoId,
  goodCount,
  badCount,
  myReaction,
  compact,
}: Props) {
  const [pending, start] = useTransition();

  function onGood() {
    start(async () => {
      try {
        const res = await applyVideoReaction(videoId, "GOOD");
        if (!res.ok) toast.error(res.error);
      } catch {
        toast.error("リアクションを更新できませんでした");
      }
    });
  }

  function onBad() {
    start(async () => {
      try {
        const res = await applyVideoReaction(videoId, "BAD");
        if (!res.ok) toast.error(res.error);
      } catch {
        toast.error("リアクションを更新できませんでした");
      }
    });
  }

  const goodOn = myReaction === "GOOD";
  const badOn = myReaction === "BAD";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "gap-3"}`}
      role="group"
      aria-label="リアクション"
    >
      <button
        type="button"
        disabled={pending}
        onClick={onGood}
        className={[
          btnBase,
          goodOn
            ? "border-[#3B82F6]/60 bg-[#3B82F6]/15 text-white shadow-[0_0_20px_rgba(59,130,246,0.12)]"
            : "border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] hover:border-white/20 hover:text-white",
        ].join(" ")}
      >
        <span aria-hidden>👍</span>
        <span>Good</span>
        <span className="tabular-nums text-white/80">{goodCount}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onBad}
        className={[
          btnBase,
          badOn
            ? "border-red-500/50 bg-red-500/10 text-red-100"
            : "border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] hover:border-white/20 hover:text-white",
        ].join(" ")}
      >
        <span aria-hidden>👎</span>
        <span>Bad</span>
        <span className="tabular-nums text-white/80">{badCount}</span>
      </button>
    </div>
  );
}
