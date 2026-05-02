import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { VideoCard } from "@/components/VideoCard";
import { getCurrentUser } from "@/lib/session";
import { listVideosForTimeline } from "@/lib/queries/videos";
import { buttonPrimary } from "@/lib/ui";

export default async function TimelinePage() {
  const user = await getCurrentUser();
  const list = await listVideosForTimeline(user?.id ?? null);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-3 border-b border-[#2A2A2A]/80 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            タイムライン
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA] sm:text-[15px]">
            社内に登録された動画が新着順で流れます。Good / Bad
            やコメントでナレッジを育てられます。
          </p>
        </div>
        <Link href="/videos/new" className={`${buttonPrimary} shrink-0`}>
          動画を登録
        </Link>
      </header>

      {list.length === 0 ? (
        <EmptyState
          title="まだ動画がありません"
          description="最初の1本を登録して、チームのタイムラインを始めましょう。"
          action={{ href: "/videos/new", label: "動画を登録" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} variant="timeline" />
          ))}
        </div>
      )}
    </div>
  );
}
