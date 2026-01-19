// lib/columns.ts

import type {
  ColumnItem as ColumnItemBase,
  ColumnCategory as ColumnCategoryBase,
  ContentStatus,
} from "@/lib/content-types";
import {
  findAllColumns,
  findColumnBySlug as repoFindColumnBySlug,
} from "@/lib/repository/columns-repository";

// 既存互換用のエクスポート
export type ColumnItem = ColumnItemBase;
export type ColumnCategory = ColumnCategoryBase;

// ----------------------------------------
// 内部ユーティリティ
// ----------------------------------------

function isPublished(status: ContentStatus): boolean {
  return status === "published";
}

// 日付→timestamp(数値)に正規化
function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

// 公開日(なければ更新日)の新しい順
function compareByPublishedDesc(a: ColumnItem, b: ColumnItem): number {
  const aTime = toTime(a.publishedAt ?? a.updatedAt ?? null);
  const bTime = toTime(b.publishedAt ?? b.updatedAt ?? null);

  if (aTime === bTime) {
    const at = (a.title ?? "").toLowerCase();
    const bt = (b.title ?? "").toLowerCase();
    if (at < bt) return -1;
    if (at > bt) return 1;
    return 0;
  }

  return aTime < bTime ? 1 : -1;
}

// 検索用の簡易スコアリング
function scoreMatch(target: string | undefined | null, keyword: string): number {
  if (!target) return 0;
  const lower = target.toLowerCase();
  return lower.includes(keyword) ? 1 : 0;
}

function intersectionCount(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  let c = 0;
  for (const x of b) if (set.has(x)) c += 1;
  return c;
}

function uniqBySlug(items: ColumnItem[]): ColumnItem[] {
  const seen = new Set<string>();
  const out: ColumnItem[] = [];
  for (const it of items) {
    if (!it?.slug) continue;
    if (seen.has(it.slug)) continue;
    seen.add(it.slug);
    out.push(it);
  }
  return out;
}

type ColumnIndex = {
  // 公開済みコラム全件(公開日降順)
  allPublishedSorted: ColumnItem[];
  // 全件(ステータス問わず)
  allSorted: ColumnItem[];
  // slug→1件（公開済みのみが入る）
  bySlug: Map<string, ColumnItem>;
  // カテゴリ→配列
  byCategory: Map<ColumnCategory, ColumnItem[]>;
  // 車種slug→コラム配列
  byCarSlug: Map<string, ColumnItem[]>;
  // ガイドslug→コラム配列
  byGuideSlug: Map<string, ColumnItem[]>;
  // heritage slug→コラム配列
  byHeritageSlug: Map<string, ColumnItem[]>;
  // タグ(小文字)→コラム配列
  byTag: Map<string, ColumnItem[]>;
};

let columnIndexCache: ColumnIndex | null = null;

function buildColumnIndex(): ColumnIndex {
  const rawAll = findAllColumns();

  const allSorted = [...rawAll].sort(compareByPublishedDesc);

  // 公開済みのみ
  const published = rawAll.filter((c) => isPublished(c.status));

  // 公開日降順
  const sorted = [...published].sort(compareByPublishedDesc);

  const bySlug = new Map<string, ColumnItem>();
  const byCategory = new Map<ColumnCategory, ColumnItem[]>();
  const byCarSlug = new Map<string, ColumnItem[]>();
  const byGuideSlug = new Map<string, ColumnItem[]>();
  const byHeritageSlug = new Map<string, ColumnItem[]>();
  const byTag = new Map<string, ColumnItem[]>();

  for (const c of sorted) {
    // slug
    bySlug.set(c.slug, c);

    // カテゴリインデックス
    if (c.category) {
      const key = c.category as ColumnCategory;
      const list = byCategory.get(key);
      if (list) list.push(c);
      else byCategory.set(key, [c]);
    }

    // 車種紐付けインデックス
    if (Array.isArray(c.relatedCarSlugs)) {
      for (const rawSlug of c.relatedCarSlugs) {
        const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
        if (!slug) continue;
        const list = byCarSlug.get(slug);
        if (list) list.push(c);
        else byCarSlug.set(slug, [c]);
      }
    }

    // ガイド紐付けインデックス
    if (Array.isArray(c.relatedGuideSlugs)) {
      for (const rawSlug of c.relatedGuideSlugs) {
        const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
        if (!slug) continue;
        const list = byGuideSlug.get(slug);
        if (list) list.push(c);
        else byGuideSlug.set(slug, [c]);
      }
    }

    // HERITAGE紐付けインデックス
    if (Array.isArray(c.relatedHeritageSlugs)) {
      for (const rawSlug of c.relatedHeritageSlugs) {
        const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
        if (!slug) continue;
        const list = byHeritageSlug.get(slug);
        if (list) list.push(c);
        else byHeritageSlug.set(slug, [c]);
      }
    }

    // タグインデックス(小文字で揃える)
    if (Array.isArray(c.tags)) {
      for (const rawTag of c.tags) {
        if (typeof rawTag !== "string") continue;
        const tag = rawTag.trim().toLowerCase();
        if (!tag) continue;
        const list = byTag.get(tag);
        if (list) list.push(c);
        else byTag.set(tag, [c]);
      }
    }
  }

  return {
    allPublishedSorted: sorted,
    allSorted,
    bySlug,
    byCategory,
    byCarSlug,
    byGuideSlug,
    byHeritageSlug,
    byTag,
  };
}

function ensureColumnIndex(): ColumnIndex {
  if (!columnIndexCache) {
    columnIndexCache = buildColumnIndex();
  }
  return columnIndexCache;
}

// テストや将来の再構築用
export function __resetColumnCacheForTest(): void {
  columnIndexCache = null;
}

// ----------------------------------------
// 公開API(Domain層)
// ----------------------------------------

// 全コラム一覧(公開済みのみ/公開日降順)
export async function getAllColumns(): Promise<ColumnItem[]> {
  return ensureColumnIndex().allPublishedSorted;
}

// 全件（ステータス問わず）
export async function getAllColumnsIncludingNonPublished(): Promise<ColumnItem[]> {
  return ensureColumnIndex().allSorted;
}

// slug指定で1件取得(公開済みのみ)
// ※非公開や存在しないslugはnull
export async function getColumnBySlug(slug: string): Promise<ColumnItem | null> {
  const index = ensureColumnIndex();
  const column = index.bySlug.get(slug) ?? repoFindColumnBySlug(slug);
  if (!column) return null;
  if (!isPublished(column.status)) return null;
  return column;
}

// slug指定で1件取得（非公開も許可）
export async function getColumnBySlugIncludingNonPublished(
  slug: string,
): Promise<ColumnItem | null> {
  const c = repoFindColumnBySlug(slug);
  return c ?? null;
}

// 最新n件を取得
export async function getLatestColumns(limit: number): Promise<ColumnItem[]> {
  const all = ensureColumnIndex().allPublishedSorted;
  return all.slice(0, Math.max(0, limit));
}

// カテゴリ別一覧(必要ならlimitで頭からn件)
export async function getColumnsByCategory(
  category: ColumnCategory,
  limit?: number,
): Promise<ColumnItem[]> {
  const index = ensureColumnIndex();
  const list = index.byCategory.get(category) ?? [];
  if (typeof limit === "number") {
    return list.slice(0, Math.max(0, limit));
  }
  return list;
}

// 車種slug紐付けで取得(コラム側のrelatedCarSlugsを利用)
export async function getColumnsByCarSlug(
  carSlug: string,
  limit?: number,
): Promise<ColumnItem[]> {
  const slug = carSlug.trim();
  if (!slug) return [];

  const index = ensureColumnIndex();
  const list = index.byCarSlug.get(slug) ?? [];

  if (typeof limit === "number") {
    return list.slice(0, Math.max(0, limit));
  }
  return list;
}

// ガイドslug紐付けで取得（Column側のrelatedGuideSlugsを利用）
export async function getColumnsByGuideSlug(
  guideSlug: string,
  limit?: number,
): Promise<ColumnItem[]> {
  const slug = guideSlug.trim();
  if (!slug) return [];

  const index = ensureColumnIndex();
  const list = index.byGuideSlug.get(slug) ?? [];

  if (typeof limit === "number") {
    return list.slice(0, Math.max(0, limit));
  }
  return list;
}

// HERITAGE slug紐付けで取得（Column側のrelatedHeritageSlugsを利用）
export async function getColumnsByHeritageSlug(
  heritageSlug: string,
  limit?: number,
): Promise<ColumnItem[]> {
  const slug = heritageSlug.trim();
  if (!slug) return [];

  const index = ensureColumnIndex();
  const list = index.byHeritageSlug.get(slug) ?? [];

  if (typeof limit === "number") {
    return list.slice(0, Math.max(0, limit));
  }
  return list;
}

// タグ指定で取得(タグ名はざっくり小文字一致)
export async function getColumnsByTag(
  tag: string,
  limit?: number,
): Promise<ColumnItem[]> {
  const key = tag.trim().toLowerCase();
  if (!key) return [];

  const index = ensureColumnIndex();
  const list = index.byTag.get(key) ?? [];

  if (typeof limit === "number") {
    return list.slice(0, Math.max(0, limit));
  }
  return list;
}

/**
 * v1.2: 関連コラム（棚ロジック入口）
 * - 明示関連（base.relatedColumnSlugs）を最優先
 * - 次に intentTags
 * - 次に tags
 * - 最後に新着で埋める（0件禁止）
 */
export async function getRelatedColumnsV12(
  base: ColumnItem,
  limit = 4,
): Promise<ColumnItem[]> {
  const { allPublishedSorted } = ensureColumnIndex();
  const pool = allPublishedSorted.filter((c) => c.slug !== base.slug);

  const picked: ColumnItem[] = [];
  const seen = new Set<string>();

  const push = (c: ColumnItem) => {
    if (!c?.slug) return;
    if (c.slug === base.slug) return;
    if (seen.has(c.slug)) return;
    seen.add(c.slug);
    picked.push(c);
  };

  // 1) 明示関連（入力順尊重）
  const explicit = base.relatedColumnSlugs ?? [];
  if (explicit.length > 0) {
    const map = new Map(pool.map((c) => [c.slug, c] as const));
    for (const slug of explicit) {
      const c = map.get(slug);
      if (!c) continue;
      push(c);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 2) intentTags一致
  const intent = base.intentTags ?? [];
  if (intent.length > 0) {
    const scored = pool
      .filter((c) => !seen.has(c.slug))
      .map((c) => ({
        c,
        score: intersectionCount(intent, c.intentTags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareByPublishedDesc(a.c, b.c);
      });

    for (const x of scored) {
      push(x.c);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 3) tags一致
  const tags = base.tags ?? [];
  if (tags.length > 0) {
    const scored = pool
      .filter((c) => !seen.has(c.slug))
      .map((c) => ({
        c,
        score: intersectionCount(tags, c.tags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareByPublishedDesc(a.c, b.c);
      });

    for (const x of scored) {
      push(x.c);
      if (picked.length >= limit) return picked.slice(0, limit);
    }
  }

  // 4) フォールバック（新着）
  for (const c of pool) {
    if (picked.length >= limit) break;
    if (seen.has(c.slug)) continue;
    push(c);
  }

  return uniqBySlug(picked).slice(0, limit);
}

/**
 * 既存互換: 関連コラム(タグ＋カテゴリで簡易スコアリング)
 * - 旧実装を残すが、今後は getRelatedColumnsV12 を使用推奨
 */
export async function getRelatedColumns(
  base: ColumnItem,
  limit = 4,
): Promise<ColumnItem[]> {
  const { allPublishedSorted } = ensureColumnIndex();

  const baseTags = base.tags ?? [];
  const baseCategory = base.category ?? null;

  const scored = allPublishedSorted
    .filter((c) => c.id !== base.id)
    .map((c) => {
      let score = 0;

      // タグ一致(2点ずつ加点)
      const tags = c.tags ?? [];
      for (const tag of tags) {
        if (baseTags.includes(tag)) score += 2;
      }

      // カテゴリ一致(1点)
      if (baseCategory && c.category === baseCategory) {
        score += 1;
      }

      return { item: c, score };
    });

  // スコア→公開日の順
  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return compareByPublishedDesc(a.item, b.item);
  });

  return scored
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.item);
}

/**
 * v1.2: slug配列からColumnを引く（棚の部品）
 * - 入力順を尊重
 * - 見つからないslugは無視
 * - 重複排除
 */
export async function getColumnsBySlugs(
  slugs: string[],
  limit?: number,
): Promise<ColumnItem[]> {
  const { allPublishedSorted } = ensureColumnIndex();
  const map = new Map(allPublishedSorted.map((c) => [c.slug, c] as const));

  const out: ColumnItem[] = [];
  const seen = new Set<string>();

  for (const s of slugs) {
    const slug = s?.trim();
    if (!slug) continue;
    const c = map.get(slug);
    if (!c) continue;
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    out.push(c);
    if (typeof limit === "number" && out.length >= limit) break;
  }

  return out;
}

// キーワード検索(タイトル・概要・本文・タグをざっくり検索)
// ※とりあえず小規模前提の簡易実装
export async function searchColumns(
  keyword: string,
  options?: {
    limit?: number;
    category?: ColumnCategory;
  },
): Promise<ColumnItem[]> {
  const q = keyword.trim().toLowerCase();
  const limit = options?.limit ?? 20;
  const categoryFilter = options?.category;

  const { allPublishedSorted } = ensureColumnIndex();

  if (!q) {
    // キーワード未指定なら単純に最新からlimit件
    return allPublishedSorted.slice(0, Math.max(0, limit));
  }

  const results = allPublishedSorted
    .filter((c) => {
      if (categoryFilter && c.category !== categoryFilter) return false;
      return true;
    })
    .map((c) => {
      let score = 0;

      score += scoreMatch(c.title, q) * 5;
      score += scoreMatch(c.summary ?? c.seoDescription, q) * 3;
      score += scoreMatch((c as any).body, q) * 2;

      if (Array.isArray(c.tags)) {
        for (const rawTag of c.tags) {
          if (typeof rawTag !== "string") continue;
          if (rawTag.toLowerCase().includes(q)) {
            score += 4;
          }
        }
      }

      return { item: c, score };
    })
    .filter((entry) => entry.score > 0);

  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return compareByPublishedDesc(a.item, b.item);
  });

  return results.slice(0, Math.max(0, limit)).map((entry) => entry.item);
}
