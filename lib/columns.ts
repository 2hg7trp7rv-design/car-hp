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

function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function compareByPublishedDesc(a: ColumnItem, b: ColumnItem): number {
  const aTime = toTime(a.publishedAt ?? a.updatedAt ?? null);
  const bTime = toTime(b.publishedAt ?? b.updatedAt ?? null);

  if (aTime === bTime) {
    const at = a.title.toLowerCase();
    const bt = b.title.toLowerCase();
    if (at < bt) return -1;
    if (at > bt) return 1;
    return 0;
  }

  return aTime < bTime ? 1 : -1;
}

type ColumnIndex = {
  allPublishedSorted: ColumnItem[];
  bySlug: Map<string, ColumnItem>;
  byCategory: Map<ColumnCategory, ColumnItem[]>;
};

let columnIndexCache: ColumnIndex | null = null;

function buildColumnIndex(): ColumnIndex {
  const rawAll = findAllColumns();

  const published = rawAll.filter((c) => isPublished(c.status));

  const sorted = [...published].sort(compareByPublishedDesc);

  const bySlug = new Map<string, ColumnItem>();
  const byCategory = new Map<ColumnCategory, ColumnItem[]>();

  for (const c of sorted) {
    bySlug.set(c.slug, c);

    if (c.category) {
      const key = c.category as ColumnCategory;
      const list = byCategory.get(key);
      if (list) {
        list.push(c);
      } else {
        byCategory.set(key, [c]);
      }
    }
  }

  return {
    allPublishedSorted: sorted,
    bySlug,
    byCategory,
  };
}

function ensureColumnIndex(): ColumnIndex {
  if (!columnIndexCache) {
    columnIndexCache = buildColumnIndex();
  }
  return columnIndexCache;
}

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
export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | null> {
  const index = ensureColumnIndex();
  const column = index.bySlug.get(slug) ?? repoFindColumnBySlug(slug);
  if (!column) return null;
  if (!isPublished(column.status)) return null;
  return column;
}

// 最新n件
export async function getLatestColumns(
  limit: number,
): Promise<ColumnItem[]> {
  const all = ensureColumnIndex().allPublishedSorted;
  return all.slice(0, limit);
}

// カテゴリ別
export async function getColumnsByCategory(
  category: ColumnCategory,
  limit?: number,
): Promise<ColumnItem[]> {
  const index = ensureColumnIndex();
  const list = index.byCategory.get(category) ?? [];
  if (typeof limit === "number") {
    return list.slice(0, limit);
  }
  return list;
}

// 関連コラム(タグ＋カテゴリで簡易スコアリング)
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

      const tags = c.tags ?? [];
      for (const tag of tags) {
        if (baseTags.includes(tag)) score += 2;
      }

      if (baseCategory && c.category === baseCategory) {
        score += 1;
      }

      return { item: c, score };
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
