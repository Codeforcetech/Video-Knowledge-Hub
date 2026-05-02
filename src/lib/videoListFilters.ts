/** 動画一覧の検索条件（Prisma 非依存・クライアントでも利用可） */

export type VideoListFilters = {
  qUrl?: string;
  qMemo?: string;
  tagIds: string[];
  producerId?: string;
  producedFrom?: string;
  producedTo?: string;
  inHouse?: boolean;
};

export function videoListFiltersAreActive(filters: VideoListFilters): boolean {
  return (
    filters.tagIds.length > 0 ||
    Boolean(filters.qUrl?.trim()) ||
    Boolean(filters.qMemo?.trim()) ||
    Boolean(filters.producerId) ||
    Boolean(filters.producedFrom) ||
    Boolean(filters.producedTo) ||
    filters.inHouse !== undefined
  );
}
