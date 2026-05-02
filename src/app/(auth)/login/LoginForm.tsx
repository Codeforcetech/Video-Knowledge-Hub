"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { buttonPrimaryBlock, fieldInput, linkAccent } from "@/lib/ui";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (!res || res.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    router.push(nextPath || "/");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-white">ログイン</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Video Knowledge Hub にサインインします
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-white/90">メールアドレス</label>
          <input
            className={fieldInput}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/90">パスワード</label>
          <input
            className={fieldInput}
            type="password"
            autoComplete="current-password"
            placeholder="8文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <ErrorAlert message={error} /> : null}

        <button type="submit" disabled={isLoading} className={buttonPrimaryBlock}>
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <div className="mt-6 text-sm text-[#A1A1AA]">
        アカウントをお持ちでないですか？{" "}
        <Link href="/register" className={linkAccent}>
          新規登録はこちら
        </Link>
      </div>
    </div>
  );
}
