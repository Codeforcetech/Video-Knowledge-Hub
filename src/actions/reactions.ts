"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export type ReactionActionState =
  | { ok: true }
  | { ok: false; error: string };

/**
 * intent と現在の状態で GOOD/BAD を付与・切替・解除
 * - 未選択で Good → GOOD 作成
 * - GOOD で Good 再押し → 削除（解除）
 * - GOOD で Bad → BAD に更新
 * - BAD で Bad 再押し → 削除
 * - BAD で Good → GOOD に更新
 */
export async function applyVideoReaction(
  videoId: string,
  intent: "GOOD" | "BAD",
): Promise<ReactionActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true },
  });
  if (!video) return { ok: false, error: "動画が見つかりません" };

  const existing = await prisma.videoReaction.findUnique({
    where: {
      videoId_userId: { videoId, userId: user.id },
    },
    select: { id: true, type: true },
  });

  if (!existing) {
    await prisma.videoReaction.create({
      data: { videoId, userId: user.id, type: intent },
    });
  } else if (existing.type === intent) {
    await prisma.videoReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.videoReaction.update({
      where: { id: existing.id },
      data: { type: intent },
    });
  }

  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/videos");
  revalidatePath("/");
  return { ok: true };
}
