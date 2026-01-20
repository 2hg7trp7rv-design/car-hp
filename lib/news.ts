// lib/news.ts

/**
 * NEWS Domain層
 *
 * 役割:
 * - Data Source層(lib/repository/news-repository)から上がってくる生データを
 *   画面(App層)で扱いやすい NewsItem に正規化する
 * - 公開状態・ソート順・インデックス作成・関連記事レコメンドなど
 *   “ビジネスロジック寄り”の処理をここで完結させる
 * - App層は data/news-latest.json ではなく、このファイルの公開関数だけを見る
 */

import { findAllNews, type NewsRecord } from "@/lib/repository/news-repository";
import type {
  NewsItem as NewsItemBase,
  ContentStatus,
} from "@/lib/content-types";

import { fetchOfficialNewsRecords } from "@/lib/rss-feed";
import { isAllowedNewsUrl } from "@/lib/news-sources";

// 既存互換用のエクスポート（画面側からはこれを使う）
export type NewsItem = NewsItemBase;

// ----------------------------------------
// 内部ユーティリティ
// ----------------------------------------

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateJa(iso?: string | null): string | null {
  const d = parseDate(iso ?? undefined);
  if (!d) return null;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeStatus(value: unknown): ContentStatus {
  if (value === "draft" || value === "archived" || value === "published") {
    return value;
  }
  // 指定がない・未知の値は「とりあえず公開扱い」
  return "published";
}

function normalizeKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return v.length > 0 ? v : null;
}

function isPublished(status: ContentStatus): boolean {
  return status === "published";
}

function compareByPublishedDesc(a: NewsItem, b: NewsItem): number {
  const aTime =
    parseDate(a.publishedAt ?? a.updatedAt ?? a.createdAt ?? null)?.getTime() ??
    0;
  const bTime =
    parseDate(b.publishedAt ?? b.updatedAt ?? b.createdAt ?? null)?.getTime() ??
    0;

  if (aTime !== bTime) {
    return bTime - aTime;
  }

  // 日付が同じ場合はタイトルで安定ソート
  const at = (a.titleJa ?? a.title ?? "").toLowerCase();
  const bt = (b.titleJa ?? b.title ?? "").toLowerCase();
  if (at < bt) return -1;
  if (at > bt) return 1;
  return 0;
}

function buildIdVariants(id: string): string[] {
  const set = new Set<string>();
  if (!id) return [];
  set.add(id);

  try {
    const decoded = decodeURIComponent(id);
    set.add(decoded);
  } catch {
    // ignore
  }

  try {
    const encoded = encodeURIComponent(id);
    set.add(encoded);
  } catch {
    // ignore
  }

  return Array.from(set);
}

// ----------------------------------------
// 生データ → Domain型 変換
// ----------------------------------------

type RawNewsItem = NewsRecord;

function toNewsItem(raw: RawNewsItem, index: number): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;

  const anyRaw = raw as any;

  // ID/slug/type/status
  const id = safeString(anyRaw.id) ?? `news-${index}`;
  const slug = safeString(anyRaw.slug) ?? id;
  const status: ContentStatus = normalizeStatus(anyRaw.status);
  const type: NewsItem["type"] = "NEWS";

  // タイトルまわり
  const titleJa = safeString(anyRaw.titleJa) ?? null;
  const title =
    titleJa ??
    safeString(anyRaw.title) ??
    "タイトル未設定";

  // URL系
  const url = safeString(anyRaw.url) ?? safeString(anyRaw.sourceUrl) ?? "#";

  // サイト内リンク:
  //  - JSONにlinkがあればそれを優先
  //  - なければ /news/[slug] 形式で組み立て
  const jsonLink = safeString(anyRaw.link);
  const link =
    jsonLink ??
    `/news/${encodeURIComponent(slug)}`;

  // 要約・SEO
  const excerpt = safeString(anyRaw.excerpt) ?? null;
  const summary =
    safeString(anyRaw.summary) ??
    excerpt ??
    safeString(anyRaw.commentJa) ??
    null;

  const seoTitle =
    safeString(anyRaw.seoTitle) ??
    titleJa ??
    title;

  const seoDescription =
    safeString(anyRaw.seoDescription) ??
    summary ??
    excerpt ??
    null;

  // メーカー・カテゴリ・ソース
  const maker = safeString(anyRaw.maker) ?? null;
  const category = safeString(anyRaw.category) ?? null;
  const sourceName = safeString(anyRaw.sourceName) ?? null;
  const rssId = safeString(anyRaw.rssId) ?? null;

  // コメント・エディターノート
  const editorNote = safeString(anyRaw.editorNote) ?? null;
  const commentJa = safeString(anyRaw.commentJa) ?? editorNote ?? null;

  // 日付
  const publishedAt = safeString(anyRaw.publishedAt) ?? null;
  const updatedAt = safeString(anyRaw.updatedAt) ?? null;
  const createdAt = safeString(anyRaw.createdAt) ?? null;
  const publishedAtJa =
    safeString(anyRaw.publishedAtJa) ??
    formatDateJa(publishedAt ?? createdAt ?? null);

  // サムネイル
  const imageUrl =
    safeString(anyRaw.imageUrl) ??
    safeString(anyRaw.heroImage) ??
    null;

  // タグ
  let tags: string[] | undefined;
  if (Array.isArray(anyRaw.tags)) {
    const cleaned = anyRaw.tags
      .map((t: unknown) => String(t).trim())
      .filter((t: string) => t.length > 0);
    if (cleaned.length > 0) {
      tags = cleaned;
    }
  }

  // 関連車種(slug)
  let relatedCarSlugs: string[] | undefined;
  if (Array.isArray(anyRaw.relatedCarSlugs)) {
    const cleaned = anyRaw.relatedCarSlugs
      .map((v: unknown) => String(v).trim())
      .filter((v: string) => v.length > 0);
    if (cleaned.length > 0) {
      relatedCarSlugs = cleaned;
    }
  }

  const item: NewsItem = {
    // BaseContentMeta
    id,
    slug,
    type,
    status,
    title,
    summary,
    seoTitle,
    seoDescription,
    publishedAt,
    updatedAt,
    tags,
    relatedCarSlugs,

    // NewsItem固有
    url,
    link,
    titleJa,
    excerpt,
    commentJa,
    maker,
    category,
    sourceName,
    rssId,
    publishedAtJa,
    createdAt,
    editorNote,
    imageUrl,
  };

  return item;
}

// ----------------------------------------
// インデックス構築
// ----------------------------------------

type NewsIndex = {
  allPublishedSorted: NewsItem[];
  byId: Map<string, NewsItem>;
  bySlug: Map<string, NewsItem>;
  byMaker: Map<string, NewsItem[]>; // key: maker(normalized)
  byCategory: Map<string, NewsItem[]>; // key: category(normalized)
  byTag: Map<string, NewsItem[]>; // key: tag(normalized)
  byRelatedCarSlug: Map<string, NewsItem[]>; // key: carSlug(そのまま)
};

let newsIndexPromise: Promise<NewsIndex> | null = null;

async function buildNewsIndex(): Promise<NewsIndex> {
  // Local JSON (manual entries) + official RSS/Atom (auto)
  const localRaw = findAllNews() as RawNewsItem[];
  // NOTE: 運用想定で最大200件まで拾う（一覧表示と合わせる）
  const rssRaw = (await fetchOfficialNewsRecords({ perSourceLimit: 20, totalLimit: 200 })) as RawNewsItem[];

  const combined = [...rssRaw, ...localRaw];

  // Keep only official external URLs (avoid placeholders like example.com, internal demo links, etc.)
  const filtered = combined.filter((raw) => {
    // データソースごとにキーが揺れる（url / sourceUrl の両対応）
    const url =
      typeof (raw as any)?.url === "string"
        ? (raw as any).url
        : typeof (raw as any)?.sourceUrl === "string"
          ? (raw as any).sourceUrl
          : "";
    return url.startsWith("http") && isAllowedNewsUrl(url);
  });

  const mapped = filtered
    .map((raw, i) => toNewsItem(raw, i))
    .filter((item): item is NewsItem => item !== null);

  const published = mapped.filter((item) => isPublished(item.status));
  const sorted = [...published].sort(compareByPublishedDesc);

  const byId = new Map<string, NewsItem>();
  const bySlug = new Map<string, NewsItem>();
  const byMaker = new Map<string, NewsItem[]>();
  const byCategory = new Map<string, NewsItem[]>();
  const byTag = new Map<string, NewsItem[]>();
  const byRelatedCarSlug = new Map<string, NewsItem[]>();

  for (const item of sorted) {
    byId.set(item.id, item);
    bySlug.set(item.slug, item);

    const makerKey = normalizeKey(item.maker ?? undefined);
    if (makerKey) {
      const list = byMaker.get(makerKey);
      if (list) list.push(item);
      else byMaker.set(makerKey, [item]);
    }

    const categoryKey = normalizeKey(item.category ?? undefined);
    if (categoryKey) {
      const list = byCategory.get(categoryKey);
      if (list) list.push(item);
      else byCategory.set(categoryKey, [item]);
    }

    if (item.tags && item.tags.length > 0) {
      for (const tag of item.tags) {
        const key = normalizeKey(tag);
        if (!key) continue;
        const list = byTag.get(key);
        if (list) list.push(item);
        else byTag.set(key, [item]);
      }
    }

    if (item.relatedCarSlugs && item.relatedCarSlugs.length > 0) {
      for (const carSlug of item.relatedCarSlugs) {
        const key = carSlug.trim();
        if (!key) continue;
        const list = byRelatedCarSlug.get(key);
        if (list) list.push(item);
        else byRelatedCarSlug.set(key, [item]);
      }
    }
  }

  return {
    allPublishedSorted: sorted,
    byId,
    bySlug,
    byMaker,
    byCategory,
    byTag,
    byRelatedCarSlug,
  };
}

async function ensureNewsIndex(): Promise<NewsIndex> {
  if (!newsIndexPromise) {
    newsIndexPromise = buildNewsIndex();
  }
  return newsIndexPromise;
}

// App Routerのホットリロードやテスト用
export function __resetNewsCacheForTest(): void {
  newsIndexPromise = null;
}

// ----------------------------------------
// 公開API(Domain層)
// ----------------------------------------

/**
 * 全ニュース一覧(公開済みのみ / 日付降順)
 */
export async function getAllNews(): Promise<NewsItem[]> {
  return (await ensureNewsIndex()).allPublishedSorted;
}

/**
 * 最新ニュースをlimit件取得
 */
export async function getLatestNews(limit = 80): Promise<NewsItem[]> {
  const all = (await ensureNewsIndex()).allPublishedSorted;
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return all.slice(0, limit);
}

/**
 * IDまたはslugから1件取得
 *
 * Next.jsの動的ルートで渡されるIDがURLエンコード/デコードで
 * ズレるケースを吸収するため、複数パターンで探す。
 */
export async function getNewsById(idOrSlug: string): Promise<NewsItem | null> {
  if (!idOrSlug) return null;

  const index = await ensureNewsIndex();

  // まずは slug としてダイレクトに探す
  const directSlugHit = index.bySlug.get(idOrSlug);
  if (directSlugHit) return directSlugHit;

  // ID候補(生値/encode/decode)として探す
  const candidates = buildIdVariants(idOrSlug);
  for (const cand of candidates) {
    const byIdHit = index.byId.get(cand);
    if (byIdHit) return byIdHit;
    const bySlugHit = index.bySlug.get(cand);
    if (bySlugHit) return bySlugHit;
  }

  return null;
}

/**
 * メーカー別ニュース一覧
 */
export async function getNewsByMaker(
  maker: string,
  limit?: number,
): Promise<NewsItem[]> {
  const key = normalizeKey(maker);
  if (!key) return [];
  const list = (await ensureNewsIndex()).byMaker.get(key) ?? [];
  if (typeof limit === "number") return list.slice(0, limit);
  return list;
}

/**
 * カテゴリ別ニュース一覧
 */
export async function getNewsByCategory(
  category: string,
  limit?: number,
): Promise<NewsItem[]> {
  const key = normalizeKey(category);
  if (!key) return [];
  const list = (await ensureNewsIndex()).byCategory.get(key) ?? [];
  if (typeof limit === "number") return list.slice(0, limit);
  return list;
}

/**
 * タグ別ニュース一覧
 */
export async function getNewsByTag(
  tag: string,
  limit?: number,
): Promise<NewsItem[]> {
  const key = normalizeKey(tag);
  if (!key) return [];
  const list = (await ensureNewsIndex()).byTag.get(key) ?? [];
  if (typeof limit === "number") return list.slice(0, limit);
  return list;
}

/**
 * 車種slug別のニュース一覧
 * CARSページや詳細ページから「関連NEWS」を出す用途を想定。
 */
export async function getNewsByRelatedCarSlug(
  carSlug: string,
  limit?: number,
): Promise<NewsItem[]> {
  const key = carSlug.trim();
  if (!key) return [];
  const list = (await ensureNewsIndex()).byRelatedCarSlug.get(key) ?? [];
  if (typeof limit === "number") return list.slice(0, limit);
  return list;
}

/**
 * 関連ニュース(タグ + メーカー + カテゴリで簡易スコアリング)
 */
export async function getRelatedNews(
  base: NewsItem,
  limit = 8,
): Promise<NewsItem[]> {
  const { allPublishedSorted } = await ensureNewsIndex();

  const baseTags = base.tags ?? [];
  const baseMakerKey = normalizeKey(base.maker ?? undefined);
  const baseCategoryKey = normalizeKey(base.category ?? undefined);

  const scored = allPublishedSorted
    .filter((n) => n.id !== base.id)
    .map((n) => {
      let score = 0;

      // タグマッチ: 1タグごとに+2
      const tags = n.tags ?? [];
      for (const tag of tags) {
        if (baseTags.includes(tag)) score += 2;
      }

      // メーカー一致:+2
      const makerKey = normalizeKey(n.maker ?? undefined);
      if (baseMakerKey && makerKey && baseMakerKey === makerKey) {
        score += 2;
      }

      // カテゴリ一致:+1
      const categoryKey = normalizeKey(n.category ?? undefined);
      if (
        baseCategoryKey &&
        categoryKey &&
        baseCategoryKey === categoryKey
      ) {
        score += 1;
      }

      return { item: n, score };
    });

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return compareByPublishedDesc(a.item, b.item);
  });

  return scored
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.item);
}
