"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { VideoActionState } from "@/actions/video";
import type { TagCategoryForForm } from "@/lib/data/tagCategories";
import type { UserOption } from "@/lib/data/users";
import { ErrorAlert } from "@/components/ErrorAlert";
import { RepresentativeNavLoading } from "@/components/RepresentativeNavLoading";
import {
  buttonPrimaryLg,
  buttonSecondaryLg,
  fieldInput,
  formTagChip,
} from "@/lib/ui";

type Props = {
  action: (
    prev: VideoActionState | null,
    formData: FormData,
  ) => Promise<VideoActionState>;
  tagCategories: TagCategoryForForm[];
  users: UserOption[];
  defaultUrl?: string;
  defaultMemo?: string | null;
  defaultIsInHouse?: boolean;
  defaultTagItemIds?: string[];
  defaultProducedById?: string | null;
  defaultProducedAt?: string;
  submitLabel: string;
  cancelHref: string;
  /** 新規登録成功〜詳細表示まで、代表画像の中央ローディングを表示 */
  showSuccessRepresentative?: boolean;
};

function displayUser(u: UserOption) {
  return u.name?.trim() || u.email || u.id;
}

export function VideoMutationForm({
  action,
  tagCategories,
  users,
  defaultUrl = "",
  defaultMemo = "",
  defaultIsInHouse = false,
  defaultTagItemIds = [],
  defaultProducedById = null,
  defaultProducedAt = "",
  submitLabel,
  cancelHref,
  showSuccessRepresentative = false,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const [inHouse, setInHouse] = useState(defaultIsInHouse);
  const [navLoading, setNavLoading] = useState(false);

  const selectedSet = useMemo(
    () => new Set(defaultTagItemIds),
    [defaultTagItemIds],
  );

  useEffect(() => {
    if (!state?.ok) return;
    toast.success("動画を保存しました");
    const videoId = state.videoId;

    if (showSuccessRepresentative) {
      setNavLoading(true);
      const id = requestAnimationFrame(() => {
        router.push(`/videos/${videoId}`);
        router.refresh();
      });
      return () => cancelAnimationFrame(id);
    }

    router.push(`/videos/${videoId}`);
    router.refresh();
  }, [state, router, showSuccessRepresentative]);

  return (
    <>
      {navLoading ? <RepresentativeNavLoading /> : null}
    <form action={formAction} className="max-w-2xl space-y-10">
      <section className="space-y-4 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6">
        <h2 className="text-sm font-semibold text-white">基本情報</h2>
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm text-white/90">
            動画URL <span className="text-red-400">*</span>
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            defaultValue={defaultUrl}
            placeholder="https://..."
            className={fieldInput}
          />
          {state?.ok === false && state.fieldErrors?.url && (
            <p className="text-xs text-red-200">{state.fieldErrors.url}</p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-4">
          {inHouse ? (
            <input type="hidden" name="isInHouse" value="on" />
          ) : null}
          <input
            id="isInHouse"
            type="checkbox"
            checked={inHouse}
            onChange={(e) => setInHouse(e.target.checked)}
            className="mt-1 size-4 rounded border-[#2A2A2A] bg-[#181818] text-[#3B82F6] focus:ring-[#3B82F6]/30"
          />
          <div>
            <label htmlFor="isInHouse" className="text-sm font-medium text-white">
              自社制作
            </label>
            <p className="mt-0.5 text-xs text-[#A1A1AA]">
              ON にすると制作者・制作日を設定できます（任意）
            </p>
          </div>
        </div>

        {inHouse ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="producedById" className="text-sm text-white/90">
                制作者
              </label>
              <select
                id="producedById"
                name="producedById"
                defaultValue={defaultProducedById ?? ""}
                className={fieldInput}
              >
                <option value="">未選択</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {displayUser(u)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="producedAt" className="text-sm text-white/90">
                制作日
              </label>
              <input
                id="producedAt"
                name="producedAt"
                type="date"
                defaultValue={defaultProducedAt}
                className={fieldInput}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="memo" className="text-sm text-white/90">
            メモ
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={5}
            defaultValue={defaultMemo ?? ""}
            placeholder="参考メモ、企画名、クライアント名など"
            className={`${fieldInput} min-h-[120px] resize-y`}
          />
          {state?.ok === false && state.fieldErrors?.memo && (
            <p className="text-xs text-red-200">{state.fieldErrors.memo}</p>
          )}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6">
        <div>
          <h2 className="text-sm font-semibold text-white">タグ</h2>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            カテゴリごとに選択。用途・媒体・縦横・尺は1つだけ、その他は複数可。
          </p>
        </div>

        <div className="space-y-8">
          {tagCategories.map((cat) => (
            <fieldset key={cat.id} className="space-y-3">
              <legend className="text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">
                {cat.name}
              </legend>
              {cat.selection === "multi" ? (
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <label key={item.id} className={formTagChip}>
                      <input
                        type="checkbox"
                        name="tagItemId"
                        value={item.id}
                        defaultChecked={selectedSet.has(item.id)}
                        className="sr-only"
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <label className={formTagChip}>
                    <input
                      type="radio"
                      name={`tagSingle_${cat.slug}`}
                      value=""
                      defaultChecked={
                        !cat.items.some((it) => selectedSet.has(it.id))
                      }
                      className="sr-only"
                    />
                    <span>なし</span>
                  </label>
                  {cat.items.map((item) => (
                    <label key={item.id} className={formTagChip}>
                      <input
                        type="radio"
                        name={`tagSingle_${cat.slug}`}
                        value={item.id}
                        defaultChecked={selectedSet.has(item.id)}
                        className="sr-only"
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
        </div>
      </section>

      {state?.ok === false && state.error ? (
        <ErrorAlert message={state.error} />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={buttonPrimaryLg}>
          {pending ? "送信中..." : submitLabel}
        </button>
        <Link href={cancelHref} className={buttonSecondaryLg}>
          キャンセル
        </Link>
      </div>
    </form>
    </>
  );
}
