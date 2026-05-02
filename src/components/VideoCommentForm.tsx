"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createComment } from "@/actions/comments";
import { buttonPrimary, fieldInput } from "@/lib/ui";
import { ErrorAlert } from "@/components/ErrorAlert";

type Props = { videoId: string };

export function VideoCommentForm({ videoId }: Props) {
  const bound = createComment.bind(null, videoId);
  const [state, formAction, pending] = useActionState(bound, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("コメントを投稿しました");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <label htmlFor="comment-body" className="text-xs font-medium text-[#A1A1AA]">
        コメントを投稿
      </label>
      <textarea
        id="comment-body"
        name="body"
        rows={3}
        maxLength={500}
        required
        placeholder="気づきやフィードバックを共有..."
        className={`${fieldInput} resize-y text-sm`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] text-[#A1A1AA]">500文字まで</span>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "送信中..." : "投稿する"}
        </button>
      </div>
      {state?.ok === false && state.error ? (
        <ErrorAlert message={state.error} />
      ) : null}
    </form>
  );
}
