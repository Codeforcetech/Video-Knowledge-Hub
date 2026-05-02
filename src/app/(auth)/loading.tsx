export default function AuthLoading() {
  return (
    <div
      className="mx-auto w-full max-w-md animate-pulse rounded-2xl border border-[#2A2A2A] bg-[#181818] p-8"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <div className="mb-6 space-y-2">
        <div className="h-7 w-32 rounded-lg bg-white/[0.08]" />
        <div className="h-4 w-full max-w-xs rounded bg-white/[0.06]" />
      </div>
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-white/[0.06]" />
        <div className="h-12 rounded-xl bg-white/[0.06]" />
        <div className="h-11 rounded-xl bg-white/[0.08]" />
      </div>
    </div>
  );
}
