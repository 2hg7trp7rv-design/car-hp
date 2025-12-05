// lib/guides.ts
// Domain層:GUIDEのドメインロジック(ソート/フィルタ/関連記事など)を担当

import { findAllGuides, findGuideBySlug } from "@/lib/repository/guides-repository";
import type { GuideItem } from "@/lib/content-types";

// カテゴリは data-model の設計どおり「任意の string」とする
export type GuideCategory = string;

// 公開用の型はこれまでどおりlib/guidesからもimportできるように再エクスポート
export type { GuideItem } from "@/lib/content-types;

// 日付文字列→タイムスタンプ(不正な場合は0)
function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return 0;
  return t;
}

// 公開日降順→タイトル昇順でソート
function sortGuides(items: GuideItem[]): GuideItem[] {
  const result = [...items];

  result.sort((a, b) => {
    const aTime = toTime(a.publishedAt);
    const bTime = toTime(b.publishedAt);

    if (aTime !== bTime) {
      return bTime - aTime;
    }

    return a.title.localeCompare(b.title, "ja");
  });

  return result;
}

// 起動時にRepositoryから取得してソート済みキャッシュを用意
const ALL_GUIDES: GuideItem[] = sortGuides(findAllGuides());

// App層から呼び出すためのDomain API
export async function getAllGuides(): Promise<GuideItem[]> {
  return ALL_GUIDES;
}

export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  const guide = findGuideBySlug(slug);
  return guide ?? null;
}

// 今後、カテゴリ別取得・関連記事取得などのロジックもここに追加していく想定
// 例:
// export async function getGuidesByCategory(category: GuideCategory): Promise<GuideItem[]> {
//   return ALL_GUIDES.filter((g) => g.category === category);
// }
