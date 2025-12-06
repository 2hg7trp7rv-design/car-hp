// lib/news.ts
//
// NEWSドメイン層
// ・公開/非公開の判定
// ・公開日降順ソート
// ・IDのエンコード揺れ吸収
// ・2万件前提のインメモリインデックス
//

import {
  findAllNews,
  type NewsItem as NewsItemBase,
} from "@/lib/repository/news-repository";

// 既存import互換
export type NewsItem = NewsItemBase;

// -------- 共通ユーティリティ --------

// 日付文字列→タイムスタンプ(不正な場合は0)
function toTime(value?: string | null): number {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

// 公開ステータスかどうか
function isPublished(item: NewsItem): boolean {
  return item.status === "published";
}

// 公開日降順(最新→古い順)
function compareByPublishedDesc(a: NewsItem, b: NewsItem): number {
  const at = toTime(a.publishedAt ?? a.createdAt ?? null);
  const bt = toTime(b.publishedAt ?? b.createdAt ?? null);
  if (at === bt) return 0;
  return at < bt ? 1 : -1;
}

function normalizeId(raw: string): string {
  return raw.trim();
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// URLエンコード揺れを吸収するID候補一覧
function buildIdVariants(raw: string): string[] {
  const base = normalizeId(raw);
  if (!base) return [];

  const decodedOnce = decodeURIComponentSafe(base);
  const decodedTwice = decodeURIComponentSafe(decodedOnce);
  const encodedOnce = encodeURIComponent(base);
  const encodedTwice = encodeURIComponent(encodedOnce);

  const variants = new Set<string>([
    base,
    decodedOnce,
    decodedTwice,
    encodedOnce,
    encodedTwice,
  ]);

  return Array.from(variants).filter(Boolean);
}

// -------- モジュールロード時に一度だけインデックス構築 --------

const ALL_PUBLISHED_SORTED: NewsItem[] = (() => {
  const all = findAllNews();
  const published = all.filter(isPublished);
  return [...published].sort(compareByPublishedDesc);
})();

const NEWS_BY_ID: Map<string, NewsItem> = (() => {
  const map = new Map<string, NewsItem>();
  for (const item of ALL_PUBLISHED_SORTED) {
    map.set(item.id, item);
  }
  return map;
})();

// -------- 公開API(getAll*/getLatest*/getById) --------

// 全NEWS(公開済みのみ 公開日降順)
export async function getAllNews(): Promise<NewsItem[]> {
  return ALL_PUBLISHED_SORTED;
}

// 最新n件(公開済みのみ)
export async function getLatestNews(
  limit: number,
): Promise<NewsItem[]> {
  if (!Number.isFinite(limit) || limit <= 0) {
    return ALL_PUBLISHED_SORTED;
  }
  return ALL_PUBLISHED_SORTED.slice(0, limit);
}

// ID指定(エンコード揺れ吸収付き)
export async function getNewsById(
  id: string,
): Promise<NewsItem | null> {
  const variants = buildIdVariants(id);
  if (variants.length === 0) return null;

  for (const key of variants) {
    const found = NEWS_BY_ID.get(key);
    if (found) return found;
  }

  return null;
}
