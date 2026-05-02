import { prisma } from "@/lib/prisma";
import { isSingleSelectTagCategory } from "@/lib/tagSelection";

export async function validateAndNormalizeTagItemIds(rawIds: string[]): Promise<
  | { ok: true; ids: string[] }
  | { ok: false; error: string }
> {
  const uniq = [...new Set(rawIds.filter(Boolean))];
  if (uniq.length === 0) return { ok: true, ids: [] };

  const items = await prisma.tagItem.findMany({
    where: {
      id: { in: uniq },
      isActive: true,
      category: { isActive: true },
    },
    include: {
      category: { select: { slug: true } },
    },
  });

  const found = new Set(items.map((i) => i.id));
  const missing = uniq.filter((id) => !found.has(id));
  if (missing.length > 0) {
    return { ok: false, error: "無効なタグが含まれています" };
  }

  const bySlug = new Map<string, string[]>();
  for (const it of items) {
    const slug = it.category.slug;
    const arr = bySlug.get(slug) ?? [];
    arr.push(it.id);
    bySlug.set(slug, arr);
  }

  for (const [slug, ids] of bySlug) {
    if (isSingleSelectTagCategory(slug) && ids.length > 1) {
      return { ok: false, error: "単一選択のタグカテゴリで複数選ばれています" };
    }
  }

  return { ok: true, ids: uniq };
}
