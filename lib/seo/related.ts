import type { PublicState } from "@/lib/content-types";

type MaybeIndexable = {
  slug?: string | null;
  status?: string | null;
  publicState?: PublicState | string | null;
  noindex?: boolean | null;
};

type RelatedOptions<T extends MaybeIndexable> = {
  limit?: number;
  getGroupKey: (_item: T) => string | null | undefined;
  getFallbackGroupKey?: (_item: T) => string | null | undefined;
  getSecondaryScore?: (_base: T, _item: T) => number;
};

function normalizeKey(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function stableNoise(seed: string, slug: string): number {
  return hashSeed(`${seed}:${slug}`) / 0xffffffff;
}

function isVisibleIndexable(item: MaybeIndexable): boolean {
  if (!item?.slug) return false;
  if (item.status && item.status !== "published") return false;
  if (item.publicState && item.publicState !== "index") return false;
  if (item.noindex === true) return false;
  return true;
}

export function pickRelatedSameGroup<T extends MaybeIndexable>(
  base: T,
  pool: T[],
  options: RelatedOptions<T>,
): T[] {
  const limit = Math.max(1, options.limit ?? 3);
  const baseSlug = String(base.slug ?? "");
  const primary = normalizeKey(options.getGroupKey(base));
  const fallback = normalizeKey(options.getFallbackGroupKey?.(base));

  const scored = pool
    .filter((item) => item.slug !== base.slug)
    .filter(isVisibleIndexable)
    .map((item) => {
      const itemPrimary = normalizeKey(options.getGroupKey(item));
      const itemFallback = normalizeKey(options.getFallbackGroupKey?.(item));
      let groupScore = 0;

      if (primary && itemPrimary === primary) groupScore += 100;
      if (fallback && itemFallback === fallback) groupScore += 35;

      const secondary = options.getSecondaryScore?.(base, item) ?? 0;
      const noise = stableNoise(baseSlug, String(item.slug ?? ""));

      return { item, score: groupScore + secondary + noise };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.item);
}

export function tagOverlapScore(
  a?: (string | null | undefined)[] | null,
  b?: (string | null | undefined)[] | null,
): number {
  const aa = new Set((a ?? []).map((v) => normalizeKey(v ?? "")).filter(Boolean));
  if (aa.size === 0) return 0;
  let score = 0;
  for (const raw of b ?? []) {
    const key = normalizeKey(raw ?? "");
    if (key && aa.has(key)) score += 4;
  }
  return score;
}
