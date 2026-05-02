"use client";

import { useEffect, useState } from "react";

/** ローディング中央に表示する代表画像（毎回ランダムに1枚） */
const LOADING_REPRESENTATIVE_IMAGES = [
  "/images/success-representative.png",
  "/images/loading-representative-2.png",
  "/images/loading-representative-3.png",
  "/images/loading-representative-4.png",
  "/images/loading-representative-5.png",
  "/images/loading-representative-6.png",
] as const;

function pickRandomSrc(): string {
  const i = Math.floor(Math.random() * LOADING_REPRESENTATIVE_IMAGES.length);
  return LOADING_REPRESENTATIVE_IMAGES[i];
}

/**
 * 動画新規登録 → 詳細への遷移中など、代表画像＋回転リングのフルスクリーンローディング
 */
export function RepresentativeNavLoading() {
  const [imageSrc, setImageSrc] = useState<string>(
    LOADING_REPRESENTATIVE_IMAGES[0],
  );

  useEffect(() => {
    setImageSrc(pickRandomSrc());
  }, []);

  return (
    <div
      className="vkh-rep-load-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-[#0B0B0B]/94 px-6"
      role="status"
      aria-live="polite"
      aria-label="読み込み中"
    >
      <div className="relative flex size-[min(300px,78vmin)] items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-white/[0.08] border-t-[#3B82F6] border-r-[#3B82F6]/35 shadow-[0_0_40px_rgba(59,130,246,0.12)] animate-spin"
          style={{ animationDuration: "1.1s" }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          className="relative z-10 max-h-[68%] max-w-[68%] rounded-2xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/15"
        />
      </div>
      <p className="text-sm text-[#A1A1AA]">読み込み中…</p>
    </div>
  );
}
