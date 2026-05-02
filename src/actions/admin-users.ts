"use server";

import { revalidatePath } from "next/cache";
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

export async function updateUserAdmin(
  userId: string,
  formData: FormData,
): Promise<void> {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = z
    .object({
      name: z.string().max(100),
      role: z.enum(["USER", "ADMIN"]),
      isActive: z.enum(["true", "false"]),
    })
    .safeParse({
      name: String(formData.get("name") ?? "").trim(),
      role: formData.get("role"),
      isActive: formData.get("isActive"),
    });
  if (!parsed.success) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) return;

  const nextRole = parsed.data.role;
  const displayName = parsed.data.name === "" ? null : parsed.data.name;
  const nextActive = parsed.data.isActive === "true";

  if (target.role === "ADMIN" && nextRole === "USER") {
    const admins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (admins <= 1) return;
  }

  if (target.role === "ADMIN" && target.isActive && !nextActive) {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: displayName,
      role: nextRole,
      isActive: nextActive,
    },
  });

  revalidatePath("/admin/users");
}
