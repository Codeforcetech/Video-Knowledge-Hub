/** 単一選択UIにするカテゴリ slug（用途・媒体・縦横・尺） */
export const TAG_SINGLE_SELECT_SLUGS = [
  "purpose",
  "platform",
  "orientation",
  "duration",
] as const;

export type TagSingleSelectSlug = (typeof TAG_SINGLE_SELECT_SLUGS)[number];

const SINGLE_SET = new Set<string>(TAG_SINGLE_SELECT_SLUGS);

export function isSingleSelectTagCategory(slug: string): boolean {
  return SINGLE_SET.has(slug);
}
