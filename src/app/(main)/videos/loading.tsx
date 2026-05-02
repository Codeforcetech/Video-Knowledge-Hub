export default function VideosLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-label="読み込み中">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-lg bg-white/[0.08]" />
          <div className="h-4 w-56 rounded bg-white/[0.06]" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-white/[0.08]" />
      </div>
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#181818] p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
      <ul className="grid gap-5">
        {[1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#181818] md:flex"
          >
            <div className="aspect-video bg-white/[0.06] md:w-[300px] md:shrink-0 md:aspect-auto md:min-h-[200px]" />
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
              <div className="h-4 w-1/2 rounded bg-white/[0.06]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
