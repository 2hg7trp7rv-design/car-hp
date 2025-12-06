// lib/guides.ts

import type {
  GuideItem as GuideItemBase,
  GuideCategory as GuideCategoryBase,
  ContentStatus,
} from "@/lib/content-types";
import {
  findAllGuides,
  findGuideBySlug as repoFindGuideBySlug,
} from "@/lib/repository/guides-repository";

// 既存インポート互換用エクスポート
export type GuideItem = GuideItemBase;
export type GuideCategory = GuideCategoryBase;

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

function compareByPublishedDesc(a: GuideItem, b: GuideItem): number {
  const aTime = toTime(a.publishedAt ?? a.updatedAt ?? null);
  const bTime = toTime(b.publishedAt ?? b.updatedAt ?? null);

  if (aTime === bTime) {
    // 日付が同じ場合はタイトルで安定ソート
    const at = a.title.toLowerCase();
    const bt = b.title.toLowerCase();
    if (at < bt) return -1;
    if (at > bt) return 1;
    return 0;
  }

  return aTime < bTime ? 1 : -1;
}

type GuideIndex = {
  allPublishedSorted: GuideItem[];
  bySlug: Map<string, GuideItem>;
  byCategory: Map<GuideCategory, GuideItem[]>;
};

let guideIndexCache: GuideIndex | null = null;

function buildGuideIndex(): GuideIndex {
  const rawAll = findAllGuides();

  const published = rawAll.filter((g) => isPublished(g.status));

  const sorted = [...published].sort(compareByPublishedDesc);

  const bySlug = new Map<string, GuideItem>();
  const byCategory = new Map<GuideCategory, GuideItem[]>();

  for (const g of sorted) {
    bySlug.set(g.slug, g);

    if (g.category) {
      const key = g.category as GuideCategory;
      const list = byCategory.get(key);
      if (list) {
        list.push(g);
      } else {
        byCategory.set(key, [g]);
      }
    }
  }

  return {
    allPublishedSorted: sorted,
    bySlug,
    byCategory,
  };
}

function ensureGuideIndex(): GuideIndex {
  if (!guideIndexCache) {
    guideIndexCache = buildGuideIndex();
  }
  return guideIndexCache;
}

// App Routerのホットリロードなどで再構築したい場合に備えたリセット関数(今は未使用)
export function __resetGuideCacheForTest(): void {
  guideIndexCache = null;
}

// ----------------------------------------
// 公開API(Domain層)
// ----------------------------------------

// 全GUIDE一覧(公開済みのみ/公開日降順)
export async function getAllGuides(): Promise<GuideItem[]> {
  return ensureGuideIndex().allPublishedSorted;
}

// slug指定で1件取得(公開済みのみ)
export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  const index = ensureGuideIndex();
  const guide = index.bySlug.get(slug) ?? repoFindGuideBySlug(slug);
  if (!guide) return null;
  if (!isPublished(guide.status)) return null;
  return guide;
}

// 最新n件
export async function getLatestGuides(
  limit: number,
): Promise<GuideItem[]> {
  const all = ensureGuideIndex().allPublishedSorted;
  return all.slice(0, limit);
}

// カテゴリ別
export async function getGuidesByCategory(
  category: GuideCategory,
  limit?: number,
): Promise<GuideItem[]> {
  const index = ensureGuideIndex();
  const list = index.byCategory.get(category) ?? [];
  if (typeof limit === "number") {
    return list.slice(0, limit);
  }
  return list;
}

// 関連GUIDE(タグ＋カテゴリベースの簡易レコメンド)
export async function getRelatedGuides(
  base: GuideItem,
  limit = 4,
): Promise<GuideItem[]> {
  const { allPublishedSorted } = ensureGuideIndex();

  const baseTags = base.tags ?? [];
  const baseCategory = base.category ?? null;

  const scored = allPublishedSorted
    .filter((g) => g.id !== base.id)
    .map((g) => {
      let score = 0;

      const tags = g.tags ?? [];
      for (const tag of tags) {
        if (baseTags.includes(tag)) score += 2;
      }

      if (baseCategory && g.category === baseCategory) {
        score += 1;
      }

      return { item: g, score };
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
