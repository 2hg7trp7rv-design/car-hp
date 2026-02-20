// lib/public-assets.ts

/**
 * Public asset safety helpers.
 *
 * - `data/_internal/public-assets.json` is generated at build time by
 *   scripts/generate-public-assets.mjs.
 * - Use these helpers when rendering local assets from content JSON.
 */

import manifest from "@/data/_internal/public-assets.json";

type Manifest = {
  generatedAt?: string;
  count?: number;
  paths?: string[];
};

const PATH_SET = new Set<string>(((manifest as unknown as Manifest)?.paths ?? []).map(String));

export function isExistingLocalPublicAssetPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const p = value.trim();
  if (!p.startsWith("/")) return false;
  return PATH_SET.has(p);
}

export function resolveOgImageUrl(
  raw: string | null | undefined,
  siteUrl: string,
  fallbackPath = "/ogp-default.jpg",
): string {
  const v = (raw ?? "").trim();
  const base = siteUrl.replace(/\/+$/g, "");

  if (!v) return `${base}${fallbackPath}`;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/") && PATH_SET.has(v)) return `${base}${v}`;

  return `${base}${fallbackPath}`;
}

export function pickExistingLocalPublicAssetPath(
  raw: string | null | undefined,
  fallback: string | null = null,
): string | null {
  const v = (raw ?? "").trim();
  if (!v) return fallback;
  if (v.startsWith("/") && PATH_SET.has(v)) return v;
  return fallback;
}

export function __publicAssetCountForDebug(): number {
  return PATH_SET.size;
}
