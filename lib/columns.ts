// lib/columns.ts

import type {
  ColumnItem as ColumnItemBase,
  ColumnCategory as ColumnCategoryBase,
} from "@/lib/content-types";
import {
  findAllColumns,
  findColumnBySlug as repoFindColumnBySlug,
} from "@/lib/repository/columns-repository";

// 既存のインポート互換用エクスポート
export type ColumnItem = ColumnItemBase;
export type ColumnCategory = ColumnCategoryBase;

function isPublished(column: ColumnItem): boolean {
  return column.status === "published";
}

function compareByPublishedDesc(
  a: ColumnItem,
  b: ColumnItem,
): number {
  const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  if (aTime === bTime) return 0;
  return aTime < bTime ? 1 : -1;
}

function sortColumns(items: ColumnItem[]): ColumnItem[] {
  return [...items].sort(compareByPublishedDesc);
}

// 全コラム一覧
export async function getAllColumns(): Promise<ColumnItem[]> {
  const all = findAllColumns();
  const published = all.filter(isPublished);
  return sortColumns(published);
}

// slug指定で1件取得
export async function getColumnBySlug(
  slug: string,
): Promise<ColumnItem | null> {
  const column = repoFindColumnBySlug(slug);
  if (!column) return null;
  if (!isPublished(column)) return null;
  return column;
}

// 最新n件
export async function getLatestColumns(
  limit: number,
): Promise<ColumnItem[]> {
  const all = findAllColumns().filter(isPublished);
  return sortColumns(all).slice(0, limit);
}

// カテゴリ別
export async function getColumnsByCategory(
  category: ColumnCategory,
  limit?: number,
): Promise<ColumnItem[]> {
  const filtered = findAllColumns().filter(
    (c) => isPublished(c) && c.category === category,
  );
  const sorted = sortColumns(filtered);
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

// 関連コラム(タグ＋カテゴリで簡易スコアリング)
export async function getRelatedColumns(
  base: ColumnItem,
  limit = 4,
): Promise<ColumnItem[]> {
  const all = findAllColumns().filter(
    (c) => isPublished(c) && c.id !== base.id,
  );

  const baseTags = base.tags ?? [];
  const baseCategory = base.category ?? null;

  const scored = all.map((c) => {
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
