"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseProducedDateInput } from "@/lib/datetime";
import { getCurrentUser } from "@/lib/session";
import { validateAndNormalizeTagItemIds } from "@/lib/tagValidation";
import { collectTagIdsFromForm } from "@/lib/videoFormParse";
import { resolveThumbnailForVideoUrl } from "@/lib/thumbnail";
import { z } from "zod";
import { redirect } from "next/navigation";

const videoInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URLを入力してください")
    .url("有効なURLを入力してください"),
  memo: z
    .string()
    .trim()
    .max(10000, "メモが長すぎます")
    .transform((s) => (s === "" ? null : s)),
  isInHouse: z.boolean(),
});

function parseVideoForm(formData: FormData) {
  const isInHouse = formData.get("isInHouse") === "on";
  return videoInputSchema.safeParse({
    url: String(formData.get("url") ?? ""),
    memo: String(formData.get("memo") ?? ""),
    isInHouse,
  });
}

async function resolveProducedFields(
  formData: FormData,
  isInHouse: boolean,
): Promise<
  | { producedById: string | null; producedAt: Date | null }
  | { error: string }
> {
  if (!isInHouse) {
    return { producedById: null, producedAt: null };
  }

  const producedByRaw = String(formData.get("producedById") ?? "").trim();
  const producedById = producedByRaw === "" ? null : producedByRaw;

  const dateRaw = String(formData.get("producedAt") ?? "").trim();
  const producedAt = dateRaw ? parseProducedDateInput(dateRaw) : null;

  if (producedById) {
    const u = await prisma.user.findFirst({
      where: { id: producedById, isActive: true },
      select: { id: true },
    });
    if (!u) return { error: "制作者が見つからないか無効です" };
  }

  return { producedById, producedAt };
}

export type VideoActionState =
  | { ok: true; videoId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createVideo(
  _prev: VideoActionState | null,
  formData: FormData,
): Promise<VideoActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "入力内容を確認してください",
      fieldErrors: {
        url: fe.url?.[0],
        memo: fe.memo?.[0],
      } as Record<string, string>,
    };
  }

  const { url, memo, isInHouse } = parsed.data;

  const tagIdsRaw = collectTagIdsFromForm(formData);
  const tagCheck = await validateAndNormalizeTagItemIds(tagIdsRaw);
  if (!tagCheck.ok) return { ok: false, error: tagCheck.error };

  const produced = await resolveProducedFields(formData, isInHouse);
  if ("error" in produced) return { ok: false, error: produced.error };

  const thumbnailUrl = await resolveThumbnailForVideoUrl(url);

  try {
    const video = await prisma.$transaction(async (tx) => {
      const v = await tx.video.create({
        data: {
          url,
          memo,
          isInHouse,
          registeredById: user.id,
          producedById: produced.producedById,
          producedAt: produced.producedAt,
          thumbnailUrl,
        },
      });
      if (tagCheck.ids.length > 0) {
        await tx.videoTag.createMany({
          data: tagCheck.ids.map((tagItemId) => ({ videoId: v.id, tagItemId })),
        });
      }
      return v;
    });

    revalidatePath("/videos");
    revalidatePath("/");
    return { ok: true, videoId: video.id };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "このURLは既に登録されています" };
    }
    return { ok: false, error: "登録に失敗しました" };
  }
}

export async function updateVideo(
  videoId: string,
  _prev: VideoActionState | null,
  formData: FormData,
): Promise<VideoActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  const existing = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, registeredById: true, url: true },
  });
  if (!existing) return { ok: false, error: "動画が見つかりません" };

  const isAdmin = user.role === "ADMIN";
  if (existing.registeredById !== user.id && !isAdmin) {
    return { ok: false, error: "編集する権限がありません" };
  }

  const parsed = parseVideoForm(formData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "入力内容を確認してください",
      fieldErrors: {
        url: fe.url?.[0],
        memo: fe.memo?.[0],
      } as Record<string, string>,
    };
  }

  const { url, memo, isInHouse } = parsed.data;

  const tagIdsRaw = collectTagIdsFromForm(formData);
  const tagCheck = await validateAndNormalizeTagItemIds(tagIdsRaw);
  if (!tagCheck.ok) return { ok: false, error: tagCheck.error };

  const produced = await resolveProducedFields(formData, isInHouse);
  if ("error" in produced) return { ok: false, error: produced.error };

  const thumbnailUrl =
    existing.url !== url
      ? await resolveThumbnailForVideoUrl(url)
      : undefined;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.video.update({
        where: { id: videoId },
        data: {
          url,
          memo,
          isInHouse,
          producedById: produced.producedById,
          producedAt: produced.producedAt,
          ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        },
      });
      await tx.videoTag.deleteMany({ where: { videoId } });
      if (tagCheck.ids.length > 0) {
        await tx.videoTag.createMany({
          data: tagCheck.ids.map((tagItemId) => ({
            videoId,
            tagItemId,
          })),
        });
      }
    });

    revalidatePath("/videos");
    revalidatePath(`/videos/${videoId}`);
    revalidatePath(`/videos/${videoId}/edit`);
    revalidatePath("/");
    return { ok: true, videoId };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "このURLは既に別の動画で使われています" };
    }
    return { ok: false, error: "更新に失敗しました" };
  }
}

/** 自分が登録した動画は削除可。ADMIN は全件削除可。 */
export async function deleteVideo(
  videoId: string,
  _formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, registeredById: true },
  });
  if (!video) redirect("/videos");

  const isAdmin = user.role === "ADMIN";
  if (video.registeredById !== user.id && !isAdmin) {
    redirect("/forbidden");
  }

  await prisma.video.delete({ where: { id: videoId } });

  revalidatePath("/videos");
  revalidatePath("/");
  redirect("/videos");
}
