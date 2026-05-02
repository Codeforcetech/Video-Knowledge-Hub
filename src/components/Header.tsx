"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { buttonSecondarySm } from "@/lib/ui";

const navBase = [
  { href: "/", label: "タイムライン" },
  { href: "/videos", label: "動画一覧" },
  { href: "/videos/new", label: "動画登録" },
] as const;

const navAdmin = [
  { href: "/admin/tags", label: "タグ管理" },
  { href: "/admin/users", label: "ユーザー管理" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-white/10 text-white"
          : "text-[#A1A1AA] hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { data } = useSession();
  const role = (data?.user as any)?.role as string | undefined;
  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#0B0B0B]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white">
            Video Knowledge Hub
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navBase.map((x) => (
            <NavLink key={x.href} href={x.href} label={x.label} />
          ))}
          {isAdmin &&
            navAdmin.map((x) => (
              <NavLink key={x.href} href={x.href} label={x.label} />
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={buttonSecondarySm}
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-5 md:hidden">
        <div className="flex flex-wrap gap-2">
          {navBase.map((x) => (
            <NavLink key={x.href} href={x.href} label={x.label} />
          ))}
          {isAdmin &&
            navAdmin.map((x) => (
              <NavLink key={x.href} href={x.href} label={x.label} />
            ))}
        </div>
      </div>
    </header>
  );
}

