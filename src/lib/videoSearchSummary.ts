import type { TagCategoryForForm } from "@/lib/data/tagCategories";
import type { UserOption } from "@/lib/data/users";
import {
  videoListFiltersAreActive,
  type VideoListFilters,
} from "@/lib/videoListFilters";

function displayUser(u: UserOption | undefined) {
  if (!u) return "（不明）";
  return u.name?.trim() || u.email || u.id;
}

/**
 * 検索条件の人が読める要約 + 件数メッセージ（条件が1つも無いときは null）
 */
export function buildVideoSearchHitMessage(
  filters: VideoListFilters,
  tagCategories: TagCategoryForForm[],
  users: UserOption[],
  hitCount: number,
): string | null {
  if (!videoListFiltersAreActive(filters)) return null;

  const parts: string[] = [];

  if (filters.qUrl?.trim()) {
    parts.push(`URLに「${filters.qUrl.trim()}」を含む`);
  }
  if (filters.qMemo?.trim()) {
    parts.push(`メモに「${filters.qMemo.trim()}」を含む`);
  }
  if (filters.producerId) {
    const u = users.find((x) => x.id === filters.producerId);
    parts.push(`制作者が「${displayUser(u)}」`);
  }
  if (filters.inHouse === true) {
    parts.push("自社制作のみ");
  }
  if (filters.inHouse === false) {
    parts.push("自社制作以外");
  }
  if (filters.producedFrom?.trim()) {
    parts.push(`制作日が ${filters.producedFrom.trim()} 以降`);
  }
  if (filters.producedTo?.trim()) {
    parts.push(`制作日が ${filters.producedTo.trim()} 以前`);
  }

  if (filters.tagIds.length > 0) {
    const idToName = new Map<string, string>();
    for (const c of tagCategories) {
      for (const it of c.items) {
        idToName.set(it.id, it.name);
      }
    }
    const names = filters.tagIds
      .map((id) => idToName.get(id))
      .filter((n): n is string => Boolean(n));
    if (names.length > 0) {
      parts.push(`タグが「${names.join("」「")}」`);
    }
  }

  const inner = parts.join("、");
  return `「${inner}」という検索条件で、${hitCount}件ヒットしました。`;
}
