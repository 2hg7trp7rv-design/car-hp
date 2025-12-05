// lib/guides.ts

import type {
  GuideItem as GuideItemBase,
  GuideCategory as GuideCategoryBase,
} from "@/lib/content-types";
import {
  findAllGuides,
  findGuideBySlug as repoFindGuideBySlug,
} from "@/lib/repository/guides-repository";

// 既存のインポート側互換のため再エクスポート
export type GuideItem = GuideItemBase;
export type GuideCategory = GuideCategoryBase;

function isPublished(guide: GuideItem): boolean {
  return guide.status === "published";
}

function compareByPublishedDesc(a: GuideItem, b: GuideItem): number {
  const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
  const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
  if (aTime === bTime) return 0;
  return aTime < bTime ? 1 : -1;
}

function sortGuides(items: GuideItem[]): GuideItem[] {
  return [...items].sort(compareByPublishedDesc);
}

// 一覧用 全件取得
export async function getAllGuides(): Promise<GuideItem[]> {
  const all = findAllGuides();
  // 将来statusがdraft等になったときのためにフィルタしておく
  const published = all.filter(isPublished);
  return sortGuides(published);
}

// 詳細ページ用 slug指定取得
export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  const guide = repoFindGuideBySlug(slug);
  if (!guide) return null;
  if (!isPublished(guide)) return null;
  return guide;
}

// トップやGUIDE一覧で使える最新n件
export async function getLatestGuides(
  limit: number,
): Promise<GuideItem[]> {
  const all = findAllGuides().filter(isPublished);
  return sortGuides(all).slice(0, limit);
}

// カテゴリ別取得
export async function getGuidesByCategory(
  category: GuideCategory,
  limit?: number,
): Promise<GuideItem[]> {
  const filtered = findAllGuides().filter(
    (g) => isPublished(g) && g.category === category,
  );
  const sorted = sortGuides(filtered);
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

// 関連ガイド取得用の簡易スコアリング
export async function getRelatedGuides(
  base: GuideItem,
  limit = 4,
): Promise<GuideItem[]> {
  const all = findAllGuides().filter(
    (g) => isPublished(g) && g.id !== base.id,
  );

  const baseTags = base.tags ?? [];
  const baseCategory = base.category ?? null;

  const scored = all.map((g) => {
    let score = 0;
    const tags = g.tags ?? [];

    // タグ一致を強めに
    for (const tag of tags) {
      if (baseTags.includes(tag)) score += 2;
    }

    // カテゴリ一致
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
