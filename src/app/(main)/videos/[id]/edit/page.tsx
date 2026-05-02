import Link from "next/link";
import { notFound } from "next/navigation";
import { updateVideo } from "@/actions/video";
import { VideoMutationForm } from "@/components/VideoMutationForm";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getTagCategoriesForForm } from "@/lib/data/tagCategories";
import { getActiveUsersForSelect } from "@/lib/data/users";
import { toDateInputValueJst } from "@/lib/datetime";

type Props = { params: Promise<{ id: string }> };

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params;
  const [video, tagCategories, users] = await Promise.all([
    prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        memo: true,
        isInHouse: true,
        registeredById: true,
        producedById: true,
        producedAt: true,
        tags: { select: { tagItemId: true } },
      },
    }),
    getTagCategoriesForForm(),
    getActiveUsersForSelect(),
  ]);
  if (!video) notFound();

  const user = await getCurrentUser();
  const canEdit =
    user &&
    (user.id === video.registeredById || user.role === "ADMIN");
  if (!canEdit) notFound();

  const boundUpdate = updateVideo.bind(null, video.id);
  const defaultTagItemIds = video.tags.map((t) => t.tagItemId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/videos/${video.id}`}
          className="text-sm text-[#A1A1AA] transition hover:text-[#3B82F6]"
        >
          ← 詳細へ
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          動画を編集
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          URL・タグ・自社制作・メモを更新できます
        </p>
      </div>

      <VideoMutationForm
        action={boundUpdate}
        tagCategories={tagCategories}
        users={users}
        defaultUrl={video.url}
        defaultMemo={video.memo}
        defaultIsInHouse={video.isInHouse}
        defaultTagItemIds={defaultTagItemIds}
        defaultProducedById={video.producedById}
        defaultProducedAt={toDateInputValueJst(video.producedAt)}
        submitLabel="更新する"
        cancelHref={`/videos/${video.id}`}
      />
    </div>
  );
}
