"use client";

import { useState } from "react";
import { deleteVideo } from "@/actions/video";
import { buttonSecondaryLg } from "@/lib/ui";

type Props = {
  videoId: string;
};

export function DeleteVideoButton({ videoId }: Props) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={deleteVideo.bind(null, videoId)}
      onSubmit={(e) => {
        if (pending) {
          e.preventDefault();
          return;
        }
        const ok = window.confirm(
          "この動画を削除します。コメントやリアクションも削除されます。よろしいですか？",
        );
        if (!ok) e.preventDefault();
        else setPending(true);
      }}
    >
      <button
        type="submit"
        className={`${buttonSecondaryLg} border-red-500/30 text-red-100 hover:bg-red-500/10`}
        disabled={pending}
      >
        {pending ? "削除中..." : "削除"}
      </button>
    </form>
  );
}

