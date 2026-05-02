import { NO_THUMBNAIL_PATH } from "@/lib/thumbnail";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** 一覧カードの横並び時：親が高さを持ち、画像を面で覆う */
  fillHeight?: boolean;
  /** 角丸（カードレイアウトに合わせる） */
  roundedClassName?: string;
};

export function VideoThumbnail({
  src,
  alt,
  className = "",
  fillHeight = false,
  roundedClassName = "rounded-t-2xl rounded-b-none",
}: Props) {
  const url =
    src && String(src).trim() !== "" ? String(src).trim() : NO_THUMBNAIL_PATH;

  return (
    <div
      className={[
        "relative w-full overflow-hidden bg-[#111111] ring-1 ring-inset ring-white/5",
        fillHeight
          ? "aspect-video md:aspect-auto md:h-full md:min-h-[200px]"
          : "aspect-video",
        roundedClassName,
        className,
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="h-full w-full max-w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
        loading="lazy"
      />
    </div>
  );
}
