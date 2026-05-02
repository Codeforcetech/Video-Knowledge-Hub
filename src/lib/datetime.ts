/** 表示用日時（medium + short、Asia/Tokyo で統一） */
export function formatDateTimeJa(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(d);
}

/** 日付のみ（制作日など・Asia/Tokyo） */
export function formatDateJa(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(d);
}

/** YYYY-MM-DD をその日の JST 開始時刻として解釈 */
export function startOfDayJst(dateStr: string): Date {
  return new Date(`${dateStr.trim()}T00:00:00+09:00`);
}

/** YYYY-MM-DD をその日の JST 終了時刻として解釈 */
export function endOfDayJst(dateStr: string): Date {
  return new Date(`${dateStr.trim()}T23:59:59.999+09:00`);
}

/** DBの DateTime を date input 用 YYYY-MM-DD（JSTの暦日） */
export function toDateInputValueJst(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** date input の値を保存用 Date（JST 正午） */
export function parseProducedDateInput(dateStr: string): Date | null {
  const s = dateStr.trim();
  if (!s) return null;
  return new Date(`${s}T12:00:00+09:00`);
}
