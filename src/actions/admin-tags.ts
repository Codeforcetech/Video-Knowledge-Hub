"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u || u.role !== "ADMIN") {
    return { ok: false as const, error: "権限がありません" };
  }
  return { ok: true as const, user: u };
}

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/, "slug は英小文字・数字・アンダースコア（先頭は英字）");

export async function createTagCategory(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = z
    .object({
      slug: slugSchema,
      name: z.string().trim().min(1).max(100),
    })
    .safeParse({
      slug: formData.get("slug"),
      name: formData.get("name"),
    });
  if (!parsed.success) return;

  const max = await prisma.tagCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  try {
    await prisma.tagCategory.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        sortOrder,
        isActive: true,
      },
    });
    revalidatePath("/admin/tags");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return;
    }
  }
}

export async function updateTagCategory(
  categoryId: string,
  formData: FormData,
): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = z
    .object({
      slug: slugSchema,
      name: z.string().trim().min(1).max(100),
      sortOrder: z.coerce.number().int().min(0).max(99999),
      isActive: z.enum(["true", "false"]),
    })
    .safeParse({
      slug: formData.get("slug"),
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
  if (!parsed.success) return;

  try {
    await prisma.tagCategory.update({
      where: { id: categoryId },
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive === "true",
      },
    });
    revalidatePath("/admin/tags");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return;
    }
  }
}

export async function moveTagCategoryForm(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = formData.get("direction");
  if (!categoryId || (direction !== "up" && direction !== "down")) return;

  const cats = await prisma.tagCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  const i = cats.findIndex((c) => c.id === categoryId);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= cats.length) return;
  const a = cats[i];
  const b = cats[j];
  await prisma.$transaction([
    prisma.tagCategory.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.tagCategory.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  revalidatePath("/admin/tags");
}

export async function createTagItem(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  const parsed = z
    .object({
      name: z.string().trim().min(1).max(100),
    })
    .safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  const max = await prisma.tagItem.aggregate({
    where: { categoryId },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  try {
    await prisma.tagItem.create({
      data: {
        categoryId,
        name: parsed.data.name,
        sortOrder,
        isActive: true,
      },
    });
    revalidatePath("/admin/tags");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return;
    }
  }
}

export async function updateTagItem(
  itemId: string,
  formData: FormData,
): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = z
    .object({
      name: z.string().trim().min(1).max(100),
      sortOrder: z.coerce.number().int().min(0).max(99999),
      isActive: z.enum(["true", "false"]),
    })
    .safeParse({
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
  if (!parsed.success) return;

  try {
    await prisma.tagItem.update({
      where: { id: itemId },
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive === "true",
      },
    });
    revalidatePath("/admin/tags");
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return;
    }
  }
}

export async function moveTagItemForm(formData: FormData): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const itemId = String(formData.get("itemId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = formData.get("direction");
  if (!itemId || !categoryId || (direction !== "up" && direction !== "down"))
    return;

  const items = await prisma.tagItem.findMany({
    where: { categoryId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });
  const i = items.findIndex((x) => x.id === itemId);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= items.length) return;
  const a = items[i];
  const b = items[j];
  await prisma.$transaction([
    prisma.tagItem.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.tagItem.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  revalidatePath("/admin/tags");
}
