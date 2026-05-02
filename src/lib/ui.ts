/** 共通 UI クラス（ボタン・リンク・フォーム・チップの統一） */

export const fieldInput =
  "w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20";

export const buttonPrimary =
  "inline-flex items-center justify-center rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:opacity-60";

export const buttonPrimarySm =
  "inline-flex items-center justify-center rounded-xl bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:opacity-60";

export const buttonPrimaryLg =
  "inline-flex items-center justify-center rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:opacity-60";

export const buttonPrimaryBlock =
  "inline-flex w-full items-center justify-center rounded-xl bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:opacity-60";

export const buttonSecondary =
  "inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 disabled:pointer-events-none disabled:opacity-60";

export const buttonSecondaryLg =
  "inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#111111] px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 disabled:pointer-events-none disabled:opacity-60";

export const buttonSecondarySm =
  "inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white/90 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 disabled:opacity-60";

/** 本文内・補助テキスト用の青リンク */
export const linkAccent =
  "text-[#3B82F6] underline-offset-2 transition hover:text-[#60A5FA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 focus-visible:rounded-sm";

/** 外部URL（新規タブ） */
export const linkExternal =
  "break-all text-sm text-[#3B82F6] underline-offset-2 transition hover:text-[#60A5FA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 focus-visible:rounded-sm";

/** ナビ・戻るリンク（グレー→青） */
export const linkMuted =
  "text-sm text-[#A1A1AA] transition hover:text-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 focus-visible:rounded-sm";

export const errorAlertBox =
  "rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100";

/** カード上のタグチップ（視認性重視） */
export const tagChipCard =
  "inline-flex items-center rounded-md border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/95";

/** 詳細ページなどカテゴリ付きタグ */
export const tagChipDetail =
  "inline-flex rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2.5 py-1 text-xs font-medium text-white/90";

export const tagChipNeutral =
  "inline-flex items-center rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/85";

export const formTagChip =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-xs text-[#A1A1AA] transition has-[:checked]:border-[#3B82F6]/55 has-[:checked]:bg-[#3B82F6]/14 has-[:checked]:text-white";
