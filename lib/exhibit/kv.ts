// lib/exhibit/kv.ts
// Exhibit KV set (local assets) for CAR BOUTIQUE JOURNAL.
// - 20 images are stored under /public/images/exhibit
// - Use stable hashing to assign a KV to a page/card based on slug/href.

export const EXHIBIT_KV_COUNT = 20 as const;

type Variant = "desktop" | "mobile";

function fnv1a32(input: string): number {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  const s = String(input ?? "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    // h *= 16777619 (but in 32-bit)
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}

function normalizeSeed(seed: string): string {
  const s = String(seed ?? "").trim();
  if (!s) return "cbj";
  // strip query/hash just in case
  return s.replace(/[?#].*$/, "");
}

function indexFromSeed(seed: string): number {
  const h = fnv1a32(normalizeSeed(seed));
  return (h % EXHIBIT_KV_COUNT) + 1; // 1..20
}

export function pickExhibitKvPaths(seed: string): {
  index: number;
  desktop: string;
  mobile: string;
} {
  const i = indexFromSeed(seed);
  const nn = String(i).padStart(2, "0");
  return {
    index: i,
    desktop: `/images/exhibit/kv-${nn}.webp`,
    mobile: `/images/exhibit/kv-${nn}-m.webp`,
  };
}

export function pickExhibitKvFromSeed(seed: string, variant: Variant = "desktop"): string {
  const kv = pickExhibitKvPaths(seed);
  return variant === "mobile" ? kv.mobile : kv.desktop;
}

export function pickExhibitKvFromSlug(slug: string, variant: Variant = "desktop"): string {
  return pickExhibitKvFromSeed(slug, variant);
}

export function pickExhibitKvFromHref(href: string, variant: Variant = "desktop"): string {
  const h = String(href ?? "").trim();
  // Use pathname only for stable assignment.
  const pathname = h.replace(/^https?:\/\/[^/]+/i, "").replace(/[?#].*$/, "");
  return pickExhibitKvFromSeed(pathname || h || "cbj", variant);
}
