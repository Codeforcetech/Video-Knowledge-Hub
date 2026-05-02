export default function MainLoading() {
  return (
    <div className="animate-pulse space-y-10" aria-busy="true" aria-label="読み込み中">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-white/[0.08]" />
          <div className="h-4 max-w-md rounded bg-white/[0.06]" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-white/[0.08]" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#181818]"
          >
            <div className="aspect-video bg-white/[0.06]" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-full rounded bg-white/[0.08]" />
              <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-14 rounded-md bg-white/[0.06]" />
                <div className="h-6 w-20 rounded-md bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
