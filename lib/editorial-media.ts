import { EDITORIAL_ASSETS } from "@/lib/editorial-assets";
import { pickExistingLocalPublicAssetPath } from "@/lib/public-assets";

export type EditorialVariant = "guide" | "column" | "car" | "heritage" | "generic";
export type EditorialViewport = "desktop" | "mobile" | "card";

export type ResolvedEditorialImage = {
  src: string;
  hasRealImage: boolean;
};

const FALLBACK_POOLS: Record<EditorialVariant, Record<EditorialViewport, string[]>> = {
  guide: {
    desktop: [EDITORIAL_ASSETS.guideHero],
    mobile: [EDITORIAL_ASSETS.guideHero],
    card: [EDITORIAL_ASSETS.guideHero],
  },
  column: {
    desktop: [EDITORIAL_ASSETS.columnHero],
    mobile: [EDITORIAL_ASSETS.columnHero],
    card: [EDITORIAL_ASSETS.columnHero],
  },
  car: {
    desktop: [EDITORIAL_ASSETS.homeHero],
    mobile: [EDITORIAL_ASSETS.homeHero],
    card: [EDITORIAL_ASSETS.homeHero],
  },
  heritage: {
    desktop: [EDITORIAL_ASSETS.heritageHero],
    mobile: [EDITORIAL_ASSETS.heritageHero],
    card: [EDITORIAL_ASSETS.heritageHero],
  },
  generic: {
    desktop: [EDITORIAL_ASSETS.homeHero],
    mobile: [EDITORIAL_ASSETS.homeHero],
    card: [EDITORIAL_ASSETS.homeHero],
  },
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function resolveExisting(path: string): string | null {
  return pickExistingLocalPublicAssetPath(path, null) ?? null;
}

export function isEditorialPlaceholderAsset(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return true;

  return (
    v === "/ogp-default.jpg" ||
    v === "/ogp-default.png" ||
    v.endsWith("/hero_default.jpg") ||
    v.endsWith("/hero_default.png") ||
    v.endsWith("/placeholder.jpg") ||
    v.endsWith("/placeholder.jpeg") ||
    v.endsWith("/placeholder.png") ||
    v.endsWith("/placeholder.webp")
  );
}

export function hasRealEditorialImage(raw: string | null | undefined): boolean {
  const value = (raw ?? "").trim();
  if (!value || isEditorialPlaceholderAsset(value)) return false;
  const resolved = resolveExisting(value);
  return typeof resolved === "string" && resolved.trim().length > 0;
}

export function pickEditorialFallbackImage(
  variant: EditorialVariant = "generic",
  viewport: EditorialViewport = "card",
  seedKey?: string | null,
): string {
  const rawPool =
    FALLBACK_POOLS[variant]?.[viewport] ??
    FALLBACK_POOLS.generic[viewport] ??
    FALLBACK_POOLS.generic.card;

  const pool = rawPool
    .map((item) => resolveExisting(item) ?? item)
    .filter((item, index, arr) => Boolean(item) && arr.indexOf(item) === index);

  const safePool = pool.length > 0 ? pool : ["/images/hero-top-mobile.jpeg"];
  const index = seedKey ? hashSeed(seedKey) % safePool.length : 0;
  return safePool[index] ?? safePool[0];
}

export function resolveEditorialImage(
  raw: string | null | undefined,
  variant: EditorialVariant = "generic",
  viewport: EditorialViewport = "card",
  seedKey?: string | null,
): ResolvedEditorialImage {
  const fallback = pickEditorialFallbackImage(variant, viewport, seedKey);
  const value = (raw ?? "").trim();

  if (!value || isEditorialPlaceholderAsset(value)) {
    return { src: fallback, hasRealImage: false };
  }

  const resolved = resolveExisting(value);
  if (!resolved) {
    return { src: fallback, hasRealImage: false };
  }

  return { src: resolved, hasRealImage: true };
}

export function pickEditorialImage(
  raw: string | null | undefined,
  variant: EditorialVariant = "generic",
  viewport: EditorialViewport = "card",
  seedKey?: string | null,
): string {
  return resolveEditorialImage(raw, variant, viewport, seedKey).src;
}
