import Link from "next/link";
import type { ReactNode } from "react";
import { linkAccent } from "@/lib/ui";

type Props = {
  title: string;
  description?: ReactNode;
  /** 主アクション */
  action?: { href: string; label: string };
  /** 副アクション（テキストリンク） */
  secondaryAction?: { href: string; label: string };
  variant?: "dashed" | "solid";
};

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  variant = "dashed",
}: Props) {
  const box =
    variant === "dashed"
      ? "rounded-2xl border border-dashed border-[#2A2A2A] bg-[#181818]/50 px-6 py-16 text-center"
      : "rounded-2xl border border-[#2A2A2A] bg-[#181818] px-6 py-14 text-center";

  return (
    <div className={box} role="status" aria-live="polite">
      <p className="text-sm font-medium text-white/90">{title}</p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">{description}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {action.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <Link href={secondaryAction.href} className={linkAccent}>
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
