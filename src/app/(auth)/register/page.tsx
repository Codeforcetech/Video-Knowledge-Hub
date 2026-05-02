"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ErrorAlert } from "@/components/ErrorAlert";
import { buttonPrimaryBlock, fieldInput, linkAccent } from "@/lib/ui";

const registerSchema = z
  .object({
    name: z.string().min(1, "氏名を入力してください").max(50, "氏名が長すぎます"),
    email: z.string().email("メールアドレスが不正です"),
    password: z.string().min(8, "パスワードは8文字以上にしてください").max(100),
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(
    () =>
      values.email.trim() &&
      values.password.trim() &&
      values.passwordConfirm.trim() &&
      values.name.trim(),
    [values],
  );

  function set<K extends keyof RegisterValues>(key: K, val: RegisterValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v?.[0]) errors[k] = v[0];
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    setIsLoading(false);

    if (res.ok) {
      router.push("/login");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => null);
    setFormError(data?.error ?? "登録に失敗しました");
  }

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-white">新規登録</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">アカウントを作成します</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-white/90">氏名</label>
          <input
            className={fieldInput}
            type="text"
            autoComplete="name"
            placeholder="山田 太郎"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-200">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/90">メールアドレス</label>
          <input
            className={fieldInput}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-200">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/90">パスワード</label>
          <input
            className={fieldInput}
            type="password"
            autoComplete="new-password"
            placeholder="8文字以上"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
          {fieldErrors.password && (
            <p className="text-xs text-red-200">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/90">パスワード確認</label>
          <input
            className={fieldInput}
            type="password"
            autoComplete="new-password"
            placeholder="同じパスワードを入力"
            value={values.passwordConfirm}
            onChange={(e) => set("passwordConfirm", e.target.value)}
            required
          />
          {fieldErrors.passwordConfirm && (
            <p className="text-xs text-red-200">{fieldErrors.passwordConfirm}</p>
          )}
        </div>

        {formError ? <ErrorAlert message={formError} /> : null}

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className={buttonPrimaryBlock}
        >
          {isLoading ? "登録中..." : "登録する"}
        </button>
      </form>

      <div className="mt-6 text-sm text-[#A1A1AA]">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className={linkAccent}>
          ログインはこちら
        </Link>
      </div>
    </div>
  );
}

