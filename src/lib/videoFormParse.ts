import { TAG_SINGLE_SELECT_SLUGS } from "@/lib/tagSelection";

export function collectTagIdsFromForm(formData: FormData): string[] {
  const multi = formData.getAll("tagItemId").map(String).filter(Boolean);
  const singles: string[] = [];
  for (const slug of TAG_SINGLE_SELECT_SLUGS) {
    const v = formData.get(`tagSingle_${slug}`);
    const s = v != null ? String(v).trim() : "";
    if (s) singles.push(s);
  }
  return [...new Set([...multi, ...singles])];
}
