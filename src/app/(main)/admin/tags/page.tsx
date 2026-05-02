import Link from "next/link";
import {
  createTagCategory,
  createTagItem,
  moveTagCategoryForm,
  moveTagItemForm,
  updateTagCategory,
  updateTagItem,
} from "@/actions/admin-tags";
import { prisma } from "@/lib/prisma";
import {
  buttonPrimarySm,
  buttonSecondarySm,
  fieldInput,
  linkMuted,
} from "@/lib/ui";

export default async function AdminTagsPage() {
  const categories = await prisma.tagCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-10">
      <div>
        <Link href="/" className={linkMuted}>
          ← トップ
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          タグ管理
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          カテゴリとタグ項目の追加・編集・並び順・有効/無効を管理します。
        </p>
      </div>

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6">
        <h2 className="text-sm font-semibold text-white">カテゴリを追加</h2>
        <form action={createTagCategory} className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-[#A1A1AA]">slug</label>
            <input
              name="slug"
              required
              placeholder="e.g. industry"
              className={`${fieldInput} py-2 text-sm mt-1`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-[#A1A1AA]">表示名</label>
            <input
              name="name"
              required
              placeholder="業種"
              className={`${fieldInput} py-2 text-sm mt-1`}
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className={buttonPrimarySm}>
              カテゴリを作成
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-6">
        {categories.map((cat) => (
          <section
            key={cat.id}
            className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-6"
          >
            <div className="flex flex-col gap-4 border-b border-[#2A2A2A] pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="text-lg font-semibold text-white">{cat.name}</h2>
                <form
                  action={updateTagCategory.bind(null, cat.id)}
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div>
                    <label className="text-xs text-[#A1A1AA]">slug</label>
                    <input
                      name="slug"
                      defaultValue={cat.slug}
                      required
                      className={`${fieldInput} py-2 text-sm mt-1`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA]">表示名</label>
                    <input
                      name="name"
                      defaultValue={cat.name}
                      required
                      className={`${fieldInput} py-2 text-sm mt-1`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA]">並び順</label>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={cat.sortOrder}
                      className={`${fieldInput} py-2 text-sm mt-1`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA]">状態</label>
                    <select
                      name="isActive"
                      defaultValue={cat.isActive ? "true" : "false"}
                      className={`${fieldInput} py-2 text-sm mt-1`}
                    >
                      <option value="true">有効</option>
                      <option value="false">無効</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <button type="submit" className={buttonPrimarySm}>
                      カテゴリを保存
                    </button>
                  </div>
                </form>
              </div>
              <div className="flex gap-2">
                <form action={moveTagCategoryForm}>
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" className={buttonSecondarySm} title="上へ">
                    ↑
                  </button>
                </form>
                <form action={moveTagCategoryForm}>
                  <input type="hidden" name="categoryId" value={cat.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" className={buttonSecondarySm} title="下へ">
                    ↓
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">
                タグ項目
              </h3>
              <ul className="space-y-4">
                {cat.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                      <form
                        action={updateTagItem.bind(null, item.id)}
                        className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                      >
                        <div className="min-w-0 flex-1 sm:min-w-[200px]">
                          <label className="text-xs text-[#A1A1AA]">名前</label>
                          <input
                            name="name"
                            defaultValue={item.name}
                            required
                            className={`${fieldInput} py-2 text-sm mt-1`}
                          />
                        </div>
                        <div className="w-full sm:w-24">
                          <label className="text-xs text-[#A1A1AA]">順</label>
                          <input
                            name="sortOrder"
                            type="number"
                            defaultValue={item.sortOrder}
                            className={`${fieldInput} py-2 text-sm mt-1`}
                          />
                        </div>
                        <div className="w-full sm:w-32">
                          <label className="text-xs text-[#A1A1AA]">状態</label>
                          <select
                            name="isActive"
                            defaultValue={item.isActive ? "true" : "false"}
                            className={`${fieldInput} py-2 text-sm mt-1`}
                          >
                            <option value="true">有効</option>
                            <option value="false">無効</option>
                          </select>
                        </div>
                        <button type="submit" className={buttonPrimarySm}>
                          保存
                        </button>
                      </form>
                      <div className="flex gap-2 lg:flex-col">
                        <form action={moveTagItemForm}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="categoryId" value={cat.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" className={buttonSecondarySm}>
                            ↑
                          </button>
                        </form>
                        <form action={moveTagItemForm}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="categoryId" value={cat.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button type="submit" className={buttonSecondarySm}>
                            ↓
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form
                action={createTagItem}
                className="flex flex-col gap-2 rounded-xl border border-dashed border-[#2A2A2A] bg-[#0B0B0B]/50 p-4 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="categoryId" value={cat.id} />
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-[#A1A1AA]">新規項目名</label>
                  <input
                    name="name"
                    required
                    placeholder="項目を追加"
                    className={`${fieldInput} py-2 text-sm mt-1`}
                  />
                </div>
                <button type="submit" className={buttonPrimarySm}>
                  項目を追加
                </button>
              </form>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
