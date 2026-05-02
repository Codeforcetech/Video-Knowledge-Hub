"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonPrimary, linkMuted } from "@/lib/ui";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#2A2A2A] bg-[#181818] px-6 py-12 text-center">
      <h1 className="text-lg font-semibold text-white">表示できませんでした</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
        一時的な問題か、データの取得に失敗した可能性があります。しばらくしてから再度お試しください。
      </p>
      {error.message ? (
        <p className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-200/90">
          {error.message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={() => reset()} className={buttonPrimary}>
          再試行
        </button>
        <Link href="/" className={linkMuted}>
          タイムラインへ
        </Link>
      </div>
    </div>
  );
}
