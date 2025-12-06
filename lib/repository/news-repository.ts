// lib/repository/news-repository.ts
// NEWSの永続化層(JSON/CMS/DBを隠蔽するレイヤー)

import type { NewsItem, ContentStatus } from "@/lib/content-types";
import newsRaw from "@/data/news-latest.json";

// data/news-latest.json 1件分の生データ
type RawNewsRecord = {
  id: string;
  sourceUrl?: string | null;
  title: string;
  titleJa?: string | null;
  excerpt?: string | null;
  comment?: string | null;
  maker?: string | null;
  category?: string | null;
  tags?: string[] | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
};

// -------- 小さなユーティリティ --------

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const arr = value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);

  return arr.length > 0 ? arr : null;
}

function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const ts = Date.parse(trimmed);
  if (!Number.isFinite(ts)) return null;

  return new Date(ts).toISOString();
}

function defaultStatus(): ContentStatus {
  return "published";
}

function buildSlug(id: string): string {
  // 今はidをそのまま使うが、将来ルールを変える場合はここだけ触ればよい
  return id;
}

// Raw → ドメイン型(NewsItem)への変換
function toNewsItem(raw: RawNewsRecord): NewsItem {
  const id = raw.id;
  const slug = buildSlug(id);

  const publishedAtIso = toIsoDate(raw.publishedAt);
  const tags = normalizeStringArray(raw.tags) ?? [];

  const title = normalizeString(raw.title) ?? id;
  const summary =
    normalizeString(raw.excerpt) ??
    normalizeString(raw.comment) ??
    null;

  const maker = normalizeString(raw.maker);
  const category = normalizeString(raw.category);

  const url = normalizeString(raw.sourceUrl) ?? "#";
  const link = `/news/${encodeURIComponent(id)}`;

  return {
    // BaseContentMeta
    id,
    slug,
    type: "NEWS",
    status: defaultStatus(),
    title,
    summary,
    seoTitle: null,
    seoDescription: null,
    publishedAt: publishedAtIso,
    updatedAt: null,
    tags,
    relatedCarSlugs: [],

    // NewsItem固有
    url,
    link,
    titleJa: normalizeString(raw.titleJa),
    excerpt: normalizeString(raw.excerpt),
    commentJa: normalizeString(raw.comment),
    maker,
    category: category ?? null,
    sourceName: maker ?? null,
    rssId: null,
    publishedAtJa: null,
    createdAt: publishedAtIso,
    editorNote: null,
    imageUrl: normalizeString(raw.imageUrl),
  };
}

// -------- JSON全件をNewsItem配列に変換してキャッシュ --------

const RAW_ITEMS: RawNewsRecord[] = Array.isArray(newsRaw)
  ? (newsRaw as RawNewsRecord[])
  : [];

const ALL_NEWS: NewsItem[] = RAW_ITEMS.map(toNewsItem);

// ID→NewsItemインデックス(2万件でもO(1)で引ける)
const NEWS_BY_ID: Map<string, NewsItem> = (() => {
  const map = new Map<string, NewsItem>();
  for (const item of ALL_NEWS) {
    map.set(item.id, item);
  }
  return map;
})();

// -------- Repositoryの公開API --------

/**
 * 全NEWS(ステータスはここでは絞らない)
 * ソートや公開判定はドメイン層(lib/news.ts)で行う
 */
export function findAllNews(): NewsItem[] {
  return ALL_NEWS;
}

/**
 * id完全一致で1件取得
 * エンコード揺れ吸収などはドメイン層側で行う
 */
export function findNewsByIdExact(
  id: string,
): NewsItem | undefined {
  if (!id) return undefined;
  return NEWS_BY_ID.get(id);
}
