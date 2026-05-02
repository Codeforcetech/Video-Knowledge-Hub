"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const bodySchema = z
  .string()
  .trim()
  .min(1, "コメントを入力してください")
  .max(500, "500文字以内で入力してください");

export type CommentActionState =
  | { ok: true }
  | { ok: false; error: string };

export async function createComment(
  videoId: string,
  _prev: CommentActionState | null,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true },
  });
  if (!video) return { ok: false, error: "動画が見つかりません" };

  const parsed = bodySchema.safeParse(String(formData.get("body") ?? ""));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors[0] ?? "入力が不正です" };
  }

  await prisma.comment.create({
    data: {
      videoId,
      userId: user.id,
      body: parsed.data,
    },
  });

  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/videos");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteComment(commentId: string): Promise<CommentActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const c = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, videoId: true, userId: true },
  });
  if (!c) return { ok: false, error: "コメントが見つかりません" };

  const isAdmin = user.role === "ADMIN";
  if (c.userId !== user.id && !isAdmin) {
    return { ok: false, error: "削除する権限がありません" };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/videos/${c.videoId}`);
  revalidatePath("/videos");
  revalidatePath("/");
  return { ok: true };
}
