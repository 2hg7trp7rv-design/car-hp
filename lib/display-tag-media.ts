import type { ColumnItem, GuideItem, HeritageItem } from "@/lib/content-types";
import { resolveColumnDisplayTag, resolveGuideDisplayTag, type SharedDisplayTag } from "@/lib/display-tags";
import { resolveHeritageDisplayTag, type HeritageDisplayTag } from "@/lib/heritage-display-tags";

const GUIDE_DISPLAY_TAG_IMAGE_POOLS: Record<SharedDisplayTag, string[]> = {
  "車選び": [
    "/images/cbj/display-tags/guides/car-selection-1.jpg",
    "/images/cbj/guides/how-to-choose-first-sports-car.jpg",
  ],
  "中古車": [
    "/images/cbj/display-tags/guides/used-car-1.jpg",
    "/images/cbj/guides/repair-history-used-car-checklist.jpg",
  ],
  "輸入車": [
    "/images/cbj/display-tags/guides/import-car-1.jpg",
    "/images/cbj/display-tags/guides/import-car-2.jpg",
  ],
  "支払い": [
    "/images/cbj/guides/loan-or-lump-sum.jpg",
    "/images/cbj/guides/car-loan-interest-rate-guide.jpg",
  ],
  "維持費": [
    "/images/cbj/display-tags/guides/maintenance-1.jpg",
    "/images/cbj/guides/oil-change-frequency-guide.jpg",
  ],
  "保険": [
    "/images/cbj/display-tags/guides/insurance-1.jpg",
    "/images/cbj/display-tags/guides/insurance-2.jpg",
  ],
  "売却": [
    "/images/cbj/display-tags/guides/sell-1.jpg",
    "/images/cbj/display-tags/guides/sell-2.jpg",
  ],
  "手続き": [
    "/images/cbj/display-tags/guides/paperwork-1.jpg",
    "/images/cbj/display-tags/guides/paperwork-2.jpg",
  ],
  "トラブル": [
    "/images/cbj/guides/car-accident-first-10-minutes.jpg",
    "/images/cbj/guides/engine-check-light-first-response.jpg",
    "/images/cbj/guides/oil-leak-first-response.jpg",
    "/images/cbj/guides/road-service-choice-guide.jpg",
  ],
};

const COLUMN_DISPLAY_TAG_IMAGE_POOLS: Record<SharedDisplayTag, string[]> = {
  "車選び": [
    "/images/cbj/display-tags/guides/car-selection-1.jpg",
    "/images/cbj/guides/how-to-choose-first-sports-car.jpg",
  ],
  "中古車": [
    "/images/cbj/display-tags/columns/used-car-1.jpg",
    "/images/cbj/columns/usedcar-low-mileage-trap.jpg",
    "/images/cbj/columns/usedcar-100k-km-myth.jpg",
  ],
  "輸入車": [
    "/images/cbj/columns/personal-import-cheap-or-not.jpg",
    "/images/cbj/columns/import-car-hidden-costs-paperwork.jpg",
    "/images/cbj/columns/import-car-maintenance-cost-myth.jpg",
  ],
  "支払い": [
    "/images/cbj/display-tags/columns/payment-1.jpg",
    "/images/cbj/guides/loan-or-lump-sum.jpg",
    "/images/cbj/guides/car-loan-interest-rate-guide.jpg",
  ],
  "維持費": [
    "/images/cbj/display-tags/columns/maintenance-1.jpg",
    "/images/cbj/columns/dealer-shaken-is-expensive-myth.jpg",
    "/images/cbj/guides/oil-change-frequency-guide.jpg",
  ],
  "保険": [
    "/images/cbj/display-tags/columns/insurance-1.jpg",
    "/images/cbj/display-tags/columns/insurance-2.jpg",
    "/images/cbj/display-tags/guides/insurance-1.jpg",
  ],
  "売却": [
    "/images/cbj/columns/tradein-vs-buyback-prep.jpg",
    "/images/cbj/display-tags/columns/sell-1.jpg",
    "/images/cbj/display-tags/columns/sell-2.jpg",
  ],
  "手続き": [
    "/images/cbj/display-tags/columns/paperwork-1.jpg",
    "/images/cbj/display-tags/columns/paperwork-2.jpg",
    "/images/cbj/display-tags/guides/paperwork-1.jpg",
  ],
  "トラブル": [
    "/images/cbj/display-tags/columns/trouble-1.jpg",
    "/images/cbj/display-tags/columns/trouble-2.jpg",
    "/images/cbj/guides/car-accident-first-10-minutes.jpg",
  ],
};

const HERITAGE_DISPLAY_TAG_IMAGE_POOLS: Record<HeritageDisplayTag, string[]> = {
  "日本スポーツの転換点": [
    "/images/cbj/display-tags/heritage/jdm-turning-1.jpg",
    "/images/cbj/display-tags/heritage/jdm-turning-2.jpg",
  ],
  "日本名車の系譜": [
    "/images/cbj/display-tags/heritage/japan-lineage-1.jpg",
    "/images/cbj/display-tags/heritage/japan-lineage-2.jpg",
  ],
  "フェラーリの系譜": [
    "/images/cbj/display-tags/heritage/ferrari-lineage-1.jpg",
    "/images/cbj/display-tags/heritage/ferrari-lineage-2.jpg",
  ],
  "スーパーカーの思想": [
    "/images/cbj/display-tags/heritage/supercar-thought-1.jpg",
    "/images/cbj/display-tags/heritage/supercar-thought-2.jpg",
  ],
  "GTと高級車の思想": [
    "/images/cbj/display-tags/heritage/gt-luxury-1.jpg",
    "/images/cbj/display-tags/heritage/gt-luxury-2.jpg",
  ],
  "工学と設計思想": [
    "/images/cbj/display-tags/heritage/engineering-1.jpg",
    "/images/cbj/display-tags/heritage/engineering-2.jpg",
  ],
};

function stableIndex(seed: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

function fallbackGuideImage(guide: Pick<GuideItem, "thumbnail" | "heroImage">): string | null {
  return guide.thumbnail ?? guide.heroImage ?? null;
}

function fallbackColumnImage(column: Pick<ColumnItem, "thumbnail" | "heroImage">): string | null {
  return column.thumbnail ?? column.heroImage ?? null;
}

function fallbackHeritageImage(heritage: Pick<HeritageItem, "heroImage" | "thumbnail" | "ogImageUrl">): string | null {
  return heritage.thumbnail ?? heritage.heroImage ?? heritage.ogImageUrl ?? null;
}

export function resolveGuideCardImage(
  guide: Pick<GuideItem, "slug" | "displayTag" | "category" | "thumbnail" | "heroImage">,
): string | null {
  const tag = resolveGuideDisplayTag(guide);
  const pool = GUIDE_DISPLAY_TAG_IMAGE_POOLS[tag] ?? [];
  if (pool.length === 0) return fallbackGuideImage(guide);
  return pool[stableIndex(guide.slug || tag, pool.length)] ?? fallbackGuideImage(guide);
}

export function resolveColumnCardImage(
  column: Pick<ColumnItem, "slug" | "displayTag" | "category" | "thumbnail" | "heroImage">,
): string | null {
  const tag = resolveColumnDisplayTag(column);
  const pool = COLUMN_DISPLAY_TAG_IMAGE_POOLS[tag] ?? [];
  if (pool.length === 0) return fallbackColumnImage(column);
  return pool[stableIndex(column.slug || tag, pool.length)] ?? fallbackColumnImage(column);
}

export function resolveHeritageCardImage(
  heritage: Pick<HeritageItem, "slug" | "displayTag" | "tags" | "title" | "brandName" | "maker" | "heroImage" | "thumbnail" | "ogImageUrl">,
): string | null {
  const tag = resolveHeritageDisplayTag(heritage);
  const pool = HERITAGE_DISPLAY_TAG_IMAGE_POOLS[tag] ?? [];
  if (pool.length === 0) return fallbackHeritageImage(heritage);
  return pool[stableIndex(heritage.slug || tag, pool.length)] ?? fallbackHeritageImage(heritage);
}
