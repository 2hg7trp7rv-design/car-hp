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

type ColumnIndex = {
  // 公開済みコラム全件(公開日降順)
  allPublishedSorted: ColumnItem[];
  // slug→1件
  bySlug: Map<string, ColumnItem>;
  // カテゴリ→配列
  byCategory: Map<ColumnCategory, ColumnItem[]>;
  // 車種slug→コラム配列
  byCarSlug: Map<string, ColumnItem[]>;
  // タグ(小文字)→コラム配列
  byTag: Map<string, ColumnItem[]>;
};

let columnIndexCache: ColumnIndex | null = null;

function buildColumnIndex(): ColumnIndex {
  const rawAll = findAllColumns();

  // 公開済みのみ
  const published = rawAll.filter((c) => isPublished(c.status));

  // 公開日降順
  const sorted = [...published].sort(compareByPublishedDesc);

  const bySlug = new Map<string, ColumnItem>();
  const byCategory = new Map<ColumnCategory, ColumnItem[]>();
  const byCarSlug = new Map<string, ColumnItem[]>();
  const byTag = new Map<string, ColumnItem[]>();

  for (const c of sorted) {
    // slug
    bySlug.set(c.slug, c);

    // カテゴリインデックス
    if (c.category) {
      const key = c.category as ColumnCategory;
      const list = byCategory.get(key);
      if (list) {
        list.push(c);
      } else {
        byCategory.set(key, [c]);
      }
    }

    // 車種紐付けインデックス
    if (Array.isArray(c.relatedCarSlugs)) {
      for (const rawSlug of c.relatedCarSlugs) {
        if (typeof rawSlug !== "string") continue;
        const slug = rawSlug.trim();
        if (!slug) continue;
        const list = byCarSlug.get(slug);
        if (list) {
          list.push(c);
        } else {
          byCarSlug.set(slug, [c]);
        }
      }
    }

    // タグインデックス(小文字で揃える)
    if (Array.isArray(c.tags)) {
      for (const rawTag of c.tags) {
        if (typeof rawTag !== "string") continue;
        const tag = rawTag.trim().toLowerCase();
        if (!tag) continue;
        const list = byTag.get(tag);
        if (list) {
          list.push(c);
        } else {
          byTag.set(tag, [c]);
        }
      }
    }
  }

  return {
    allPublishedSorted: sorted,
    bySlug,
    byCategory,
    byCarSlug,
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

// slug指定で1件取得(公開済みのみ)
// ※非公開や存在しないslugはnull
export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | null> {
  const index = ensureColumnIndex();
  const column = index.bySlug.get(slug) ?? repoFindColumnBySlug(slug);
  if (!column) return null;
  if (!isPublished(column.status)) return null;
  return column;
}

// 最新n件を取得
export async function getLatestColumns(
  limit: number,
): Promise<ColumnItem[]> {
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

// 関連コラム(タグ＋カテゴリで簡易スコアリング)
// ページ下部の関連記事用
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
