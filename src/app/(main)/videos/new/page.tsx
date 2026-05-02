import Link from "next/link";
import { createVideo } from "@/actions/video";
import { VideoMutationForm } from "@/components/VideoMutationForm";
import { getTagCategoriesForForm } from "@/lib/data/tagCategories";
import { getActiveUsersForSelect } from "@/lib/data/users";

export default async function NewVideoPage() {
  const [tagCategories, users] = await Promise.all([
    getTagCategoriesForForm(),
    getActiveUsersForSelect(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/videos"
          className="text-sm text-[#A1A1AA] transition hover:text-[#3B82F6]"
        >
          ← 一覧へ
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          動画を登録
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          URL・タグ・自社制作・メモを入力してください
        </p>
      </div>

      <VideoMutationForm
        action={createVideo}
        tagCategories={tagCategories}
        users={users}
        submitLabel="登録する"
        cancelHref="/videos"
        showSuccessRepresentative
      />
    </div>
  );
}
