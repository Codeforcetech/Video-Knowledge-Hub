import { prisma } from "@/lib/prisma";
import { isSingleSelectTagCategory } from "@/lib/tagSelection";

export type TagCategoryForForm = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  selection: "single" | "multi";
  items: { id: string; name: string; sortOrder: number }[];
};

export async function getTagCategoriesForForm(): Promise<TagCategoryForForm[]> {
  const rows = await prisma.tagCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, sortOrder: true },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
    selection: isSingleSelectTagCategory(c.slug) ? "single" : "multi",
    items: c.items,
  }));
}
