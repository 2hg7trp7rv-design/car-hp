// lib/guides.ts
//
// GUIDEコンテンツのDomain層。
// Repository層から受け取ったデータをソート・重複排除して
// app層に渡す責務を持つ。

import type { GuideItem, GuideCategory } from "@/lib/content-types";
import { findAllGuides, findGuideBySlug } from "@/lib/repository/guides-repository";

// 型はこれまで通りlib/guidesからもimportできるように再エクスポート
export type { GuideItem, GuideCategory } from "@/lib/content-types";

// 日付文字列→タイムスタンプ(不正な場合は0)
function toTime(value?: string | null): number {
  if (!value) return 0;
  const d = new Date(value);
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * 重複slugを統合しつつ、公開日降順→タイトル昇順でソート
 */
function buildAllGuidesSorted(): GuideItem[] {
  const raw = findAllGuides();
  const map = new Map<string, GuideItem>();

  for (const item of raw) {
    const key = item.slug;
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      continue;
    }

    const existingTime = toTime(existing.publishedAt);
    const nextTime = toTime(item.publishedAt);

    if (nextTime > existingTime) {
      map.set(key, item);
    }
  }

  const result = Array.from(map.values());

  result.sort((a, b) => {
    const at = toTime(a.publishedAt);
    const bt = toTime(b.publishedAt);

    if (at !== bt) {
      return bt - at;
    }

    return a.title.localeCompare(b.title, "ja");
  });

  return result;
}

const ALL_GUIDES_SORTED: GuideItem[] = buildAllGuidesSorted();

/**
 * 全GUIDE記事を返す(Domain層ソート済み)。
 */
export async function getAllGuides(): Promise<GuideItem[]> {
  return ALL_GUIDES_SORTED;
}

/**
 * slugでGUIDE記事を1件取得。
 * 見つからなければ null。
 */
export async function getGuideBySlug(
  slug: string,
): Promise<GuideItem | null> {
  if (!slug) return null;

  const item = findGuideBySlug(slug);
  return item ?? null;
}
