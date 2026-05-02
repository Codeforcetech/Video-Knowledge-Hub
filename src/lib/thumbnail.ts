/**
 * サーバー専用: 動画URLからサムネイルURLを解決（DB保存用の絶対URLまたは同一オリジンパス）
 */

import * as cheerio from "cheerio";

export const NO_THUMBNAIL_PATH = "/images/no-thumbnail.png";

const FETCH_TIMEOUT_MS = 12_000;
const CACHE_OK_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const CACHE_NG_TTL_MS = 1000 * 60 * 30; // 30 min (avoid hammering)
const CACHE_IMG_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type CacheEntry<T> = { value: T; expiresAt: number };
const ogCache = new Map<string, CacheEntry<string | null>>();
const imgOkCache = new Map<string, CacheEntry<boolean>>();

function getCache<T>(m: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const hit = m.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    m.delete(key);
    return undefined;
  }
  return hit.value;
}

function setCache<T>(
  m: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number,
) {
  m.set(key, { value, expiresAt: Date.now() + ttlMs });
}

const YT_MAX = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const YT_HQ = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

const UA_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const UA_IG_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36";

export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "m.youtube.com" || host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        const v = u.searchParams.get("v");
        return v && /^[\w-]{11}$/.test(v) ? v : null;
      }
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/")[2];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isInstagramUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    return host === "instagram.com";
  } catch {
    return false;
  }
}

/**
 * Instagram URL 正規化
 * - /reel/{id}, /p/{id}, /tv/{id} のみ対応
 * - クエリ削除
 * - 末尾スラッシュ統一
 * - ドメインを https://www.instagram.com に統一
 *
 * 例: https://www.instagram.com/reel/xxxx/
 */
export function normalizeInstagramUrl(rawUrl: string): string {
  const u = new URL(rawUrl);
  const seg = u.pathname.split("/").filter(Boolean);
  const kind = seg[0];
  const id = seg[1];
  if (!kind || !id) return "https://www.instagram.com/";
  if (kind !== "reel" && kind !== "p" && kind !== "tv") {
    return "https://www.instagram.com/";
  }
  return `https://www.instagram.com/${kind}/${id}/`;
}

async function fetchOkImage(url: string): Promise<boolean> {
  const cached = getCache(imgOkCache, url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "image/*",
        "User-Agent": UA_DESKTOP,
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) {
      setCache(imgOkCache, url, false, CACHE_IMG_TTL_MS);
      return false;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) {
      setCache(imgOkCache, url, false, CACHE_IMG_TTL_MS);
      return false;
    }
    const len = res.headers.get("content-length");
    if (len != null && Number(len) < 2500) {
      setCache(imgOkCache, url, false, CACHE_IMG_TTL_MS);
      return false;
    }
    setCache(imgOkCache, url, true, CACHE_IMG_TTL_MS);
    return true;
  } catch {
    setCache(imgOkCache, url, false, CACHE_NG_TTL_MS);
    return false;
  }
}

/** HEAD が使えないCDN向け: GET で先頭のみ確認 */
async function fetchOkImageGet(url: string): Promise<boolean> {
  const cached = getCache(imgOkCache, url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "image/*",
        Range: "bytes=0-2047",
        "User-Agent": UA_DESKTOP,
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok && res.status !== 206) {
      setCache(imgOkCache, url, false, CACHE_IMG_TTL_MS);
      return false;
    }
    const ct = res.headers.get("content-type") ?? "";
    const ok = ct.startsWith("image/");
    setCache(imgOkCache, url, ok, CACHE_IMG_TTL_MS);
    return ok;
  } catch {
    setCache(imgOkCache, url, false, CACHE_NG_TTL_MS);
    return false;
  }
}

/** Instagram専用: GET + Range(bytes=0-0) で画像かどうか判定 */
async function fetchOkInstagramImage(url: string): Promise<boolean> {
  const cached = getCache(imgOkCache, url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "image/*",
        Range: "bytes=0-0",
        "User-Agent": UA_MOBILE,
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok && res.status !== 206) {
      setCache(imgOkCache, url, false, CACHE_IMG_TTL_MS);
      return false;
    }
    const ct = res.headers.get("content-type") ?? "";
    const ok = ct.startsWith("image/");
    setCache(imgOkCache, url, ok, CACHE_IMG_TTL_MS);
    return ok;
  } catch {
    setCache(imgOkCache, url, false, CACHE_NG_TTL_MS);
    return false;
  }
}

async function resolveYouTubeThumbnail(videoId: string): Promise<string> {
  const maxUrl = YT_MAX(videoId);
  const hqUrl = YT_HQ(videoId);
  if (await fetchOkImage(maxUrl)) return maxUrl;
  if (await fetchOkImageGet(maxUrl)) return maxUrl;
  if (await fetchOkImage(hqUrl)) return hqUrl;
  if (await fetchOkImageGet(hqUrl)) return hqUrl;
  return NO_THUMBNAIL_PATH;
}

function parseOgImage(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const raw = m[1].trim();
      if (!raw) continue;
      try {
        return new URL(raw, pageUrl).href;
      } catch {
        continue;
      }
    }
  }
  return null;
}

function parseInstagramOgImageCheerio(html: string, pageUrl: string): string | null {
  const $ = cheerio.load(html);
  const og = $("meta[property='og:image']").attr("content")?.trim();
  const tw = $("meta[name='twitter:image']").attr("content")?.trim();
  const raw = og || tw;
  if (!raw) return null;
  try {
    return new URL(raw, pageUrl).href;
  } catch {
    return null;
  }
}

async function fetchHtml(url: string, ua: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": ua,
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    return res;
  } catch {
    return null;
  }
}

export async function resolveInstagramThumbnail(url: string): Promise<string> {
  const norm = normalizeInstagramUrl(url);
  const cacheKey = `ig:${norm}`;
  const cached = getCache(ogCache, cacheKey);
  if (cached !== undefined) return cached ?? NO_THUMBNAIL_PATH;

  // Mobile UA 優先 → 失敗したら Android UA で再試行
  const resA = await fetchHtml(norm, UA_MOBILE);
  const resB = !resA || !resA.ok ? await fetchHtml(norm, UA_IG_ANDROID) : null;
  const res = resA?.ok ? resA : resB?.ok ? resB : resA || resB;

  if (!res || !res.ok) {
    setCache(ogCache, cacheKey, null, CACHE_NG_TTL_MS);
    return NO_THUMBNAIL_PATH;
  }

  const html = await res.text();
  const img = parseInstagramOgImageCheerio(html, res.url || norm);
  if (!img) {
    setCache(ogCache, cacheKey, null, CACHE_NG_TTL_MS);
    return NO_THUMBNAIL_PATH;
  }

  const ok = await fetchOkInstagramImage(img);
  if (!ok) {
    setCache(ogCache, cacheKey, null, CACHE_NG_TTL_MS);
    return NO_THUMBNAIL_PATH;
  }

  setCache(ogCache, cacheKey, img, CACHE_OK_TTL_MS);
  return img;
}

async function resolveOgThumbnail(pageUrl: string): Promise<string | null> {
  const cached = getCache(ogCache, pageUrl);
  if (cached !== undefined) return cached;

  try {
    const resA = await fetchHtml(pageUrl, UA_DESKTOP);
    const resB =
      !resA || !resA.ok ? await fetchHtml(pageUrl, UA_MOBILE) : null;
    const res = resA?.ok ? resA : resB?.ok ? resB : resA || resB;
    if (!res || !res.ok) {
      setCache(ogCache, pageUrl, null, CACHE_NG_TTL_MS);
      return null;
    }

    const html = await res.text();
    const img = parseOgImage(html, res.url || pageUrl);
    if (!img) {
      setCache(ogCache, pageUrl, null, CACHE_NG_TTL_MS);
      return null;
    }
    if (await fetchOkImage(img)) {
      setCache(ogCache, pageUrl, img, CACHE_OK_TTL_MS);
      return img;
    }
    if (await fetchOkImageGet(img)) {
      setCache(ogCache, pageUrl, img, CACHE_OK_TTL_MS);
      return img;
    }
    setCache(ogCache, pageUrl, null, CACHE_NG_TTL_MS);
    return null;
  } catch {
    setCache(ogCache, pageUrl, null, CACHE_NG_TTL_MS);
    return null;
  }
}

/** 動画ページURLからサムネイルURL（失敗時は NO_THUMBNAIL_PATH） */
export async function resolveThumbnailForVideoUrl(
  videoUrl: string,
): Promise<string> {
  const yt = extractYouTubeVideoId(videoUrl);
  if (yt) {
    return resolveYouTubeThumbnail(yt);
  }

  if (isInstagramUrl(videoUrl)) {
    return resolveInstagramThumbnail(videoUrl);
  }

  const og = await resolveOgThumbnail(videoUrl);
  if (og) return og;
  return NO_THUMBNAIL_PATH;
}
