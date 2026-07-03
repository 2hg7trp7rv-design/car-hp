import type { ColumnItem, GuideItem } from "@/lib/content-types";

const GUIDE_FALLBACK_IMAGES = ["/images/cbj/guide-hero.jpg"] as const;
const COLUMN_FALLBACK_IMAGES = ["/images/cbj/column-hero.jpg"] as const;

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

export function resolveGuideCardImage(
  guide: Pick<GuideItem, "slug" | "displayTag" | "category" | "thumbnail" | "heroImage">,
): string | null {
  const articleTopImage = fallbackGuideImage(guide);
  if (articleTopImage) return articleTopImage;

  return GUIDE_FALLBACK_IMAGES[stableIndex(guide.slug || "guide", GUIDE_FALLBACK_IMAGES.length)] ?? null;
}

export function resolveColumnCardImage(
  column: Pick<ColumnItem, "slug" | "displayTag" | "category" | "thumbnail" | "heroImage">,
): string | null {
  const articleTopImage = fallbackColumnImage(column);
  if (articleTopImage) return articleTopImage;

  return COLUMN_FALLBACK_IMAGES[stableIndex(column.slug || "column", COLUMN_FALLBACK_IMAGES.length)] ?? null;
}
