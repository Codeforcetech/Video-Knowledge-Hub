import Link from "next/link";
import { buttonPrimaryBlock } from "@/lib/ui";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#181818] p-10 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-white">
          アクセスできません
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
          このページにアクセスする権限がありません。
        </p>
        <Link href="/" className={`${buttonPrimaryBlock} mt-8`}>
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
