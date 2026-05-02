"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { TagCategoryForForm } from "@/lib/data/tagCategories";
import type { UserOption } from "@/lib/data/users";
import {
  videoListFiltersAreActive,
  type VideoListFilters,
} from "@/lib/videoListFilters";
import { buttonPrimary, fieldInput } from "@/lib/ui";

const inputClass = `${fieldInput} py-2.5 text-sm`;

const labelClass = "text-xs font-medium text-[#A1A1AA]";

function displayUser(u: UserOption) {
  return u.name?.trim() || u.email || u.id;
}

/** 自社制作・制作者・制作日のいずれかが指定されている */
function hasProductionBundleFilters(f: VideoListFilters): boolean {
  return (
    f.inHouse !== undefined ||
    Boolean(f.producerId) ||
    Boolean(f.producedFrom?.trim()) ||
    Boolean(f.producedTo?.trim())
  );
}

type Props = {
  initial: VideoListFilters;
  tagCategories: TagCategoryForForm[];
  users: UserOption[];
};

export function VideoSearchForm({ initial, tagCategories, users }: Props) {
  const selectedTags = new Set(initial.tagIds);
  const filtersActive = videoListFiltersAreActive(initial);
  /** 検索実行後は閉じた状態から見せる（URLに条件が付いていても開かない） */
  const [open, setOpen] = useState(false);
  /** 自社制作セット（自社制作・制作者・制作日）— 条件が付いていれば開いておく */
  const [inHouseOpen, setInHouseOpen] = useState(() =>
    hasProductionBundleFilters(initial),
  );
  const headerId = useId();
  const panelId = useId();
  const inHouseHeaderId = useId();
  const inHousePanelId = useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#181818]">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <button
          type="button"
          id={headerId}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 -m-1 p-1"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-lg border border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">検索</span>
              {!open && filtersActive ? (
                <span className="rounded-md border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[11px] font-medium text-[#93C5FD]">
                  条件あり
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#A1A1AA]">
              条件は URL に反映されます。タグはカテゴリ間 AND・同一カテゴリ内 OR です。
            </span>
          </span>
        </button>
        <Link
          href="/videos"
          className="inline-flex w-fit shrink-0 items-center justify-center self-start rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-2 text-xs text-[#A1A1AA] transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:self-center"
        >
          条件クリア
        </Link>
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <form
            method="get"
            action="/videos"
            className="space-y-6 border-t border-[#2A2A2A] px-5 pb-5 pt-5 sm:px-6 sm:pb-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="qUrl">
                  URL（部分一致）
                </label>
                <input
                  id="qUrl"
                  name="qUrl"
                  type="search"
                  defaultValue={initial.qUrl ?? ""}
                  placeholder="youtube.com など"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="qMemo">
                  メモ（部分一致）
                </label>
                <input
                  id="qMemo"
                  name="qMemo"
                  type="search"
                  defaultValue={initial.qMemo ?? ""}
                  placeholder="キーワード"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111111]/80">
                  <button
                    type="button"
                    id={inHouseHeaderId}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]/35"
                    aria-expanded={inHouseOpen}
                    aria-controls={inHousePanelId}
                    onClick={() => setInHouseOpen((v) => !v)}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg border border-[#2A2A2A] bg-[#181818] text-[#A1A1AA] transition-transform duration-200 ${
                        inHouseOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
                        自社制作・制作者・制作日で絞り込む
                        {!inHouseOpen &&
                        hasProductionBundleFilters(initial) ? (
                          <span className="flex flex-wrap gap-1.5">
                            {initial.inHouse !== undefined ? (
                              <span className="rounded-md border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[11px] font-medium text-[#93C5FD]">
                                {initial.inHouse === true
                                  ? "自社制作のみ"
                                  : "自社制作以外"}
                              </span>
                            ) : null}
                            {initial.producerId ? (
                              <span className="rounded-md border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[11px] font-medium text-[#93C5FD]">
                                制作者指定
                              </span>
                            ) : null}
                            {initial.producedFrom?.trim() ||
                            initial.producedTo?.trim() ? (
                              <span className="rounded-md border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[11px] font-medium text-[#93C5FD]">
                                制作日指定
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#A1A1AA]">
                        自社制作の有無・制作者・制作日はここでまとめて指定できます
                      </span>
                    </span>
                  </button>
                  <div
                    id={inHousePanelId}
                    role="region"
                    aria-labelledby={inHouseHeaderId}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      inHouseOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="space-y-4 border-t border-[#2A2A2A] px-4 py-4">
                        <div className="space-y-2">
                          <label className={labelClass}>自社制作</label>
                          <select
                            name="inHouse"
                            defaultValue={
                              initial.inHouse === true
                                ? "true"
                                : initial.inHouse === false
                                  ? "false"
                                  : ""
                            }
                            className={inputClass}
                          >
                            <option value="">指定なし</option>
                            <option value="true">自社制作のみ</option>
                            <option value="false">自社制作以外</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass} htmlFor="producer">
                            制作者
                          </label>
                          <select
                            id="producer"
                            name="producer"
                            defaultValue={initial.producerId ?? ""}
                            className={inputClass}
                          >
                            <option value="">指定なし</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {displayUser(u)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              className={labelClass}
                              htmlFor="producedFrom"
                            >
                              制作日（開始）
                            </label>
                            <input
                              id="producedFrom"
                              name="producedFrom"
                              type="date"
                              defaultValue={initial.producedFrom ?? ""}
                              className={inputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={labelClass} htmlFor="producedTo">
                              制作日（終了）
                            </label>
                            <input
                              id="producedTo"
                              name="producedTo"
                              type="date"
                              defaultValue={initial.producedTo ?? ""}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-[#2A2A2A] pt-6">
              <p className={labelClass}>
                タグ（カテゴリごとに OR、カテゴリ間は AND）
              </p>
              <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
                {tagCategories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <p className="text-xs text-white/80">{cat.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <label
                          key={item.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#111111] px-2.5 py-1.5 text-xs text-[#A1A1AA] has-[:checked]:border-[#3B82F6]/50 has-[:checked]:bg-[#3B82F6]/10 has-[:checked]:text-white"
                        >
                          <input
                            type="checkbox"
                            name="tag"
                            value={item.id}
                            defaultChecked={selectedTags.has(item.id)}
                            className="sr-only"
                          />
                          <span>{item.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className={`${buttonPrimary} px-6`}>
                この条件で検索
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
