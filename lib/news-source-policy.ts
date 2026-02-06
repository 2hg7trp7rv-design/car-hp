// lib/news-source-policy.ts

import { getNewsSourceBaseUrls } from "@/lib/news-sources";

const BASE_URLS = getNewsSourceBaseUrls();

function normalizeUrl(input: string): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  // internal / placeholder
  if (raw.startsWith("/") || raw === "#") return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  // strip fragments
  url.hash = "";

  return url.toString();
}

/**
 * NEWSの出典URLとして掲載/インデックスして良いか。
 * - HTTPSのみ
 * - 公式ニュースソースのベースURL配下のみ
 */
export function isValidNewsSourceUrl(input: string | null | undefined): boolean {
  if (!input) return false;
  const normalized = normalizeUrl(input);
  if (!normalized) return false;

  return BASE_URLS.some((base) => normalized.startsWith(base));
}

export function getNormalizedNewsSourceUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const normalized = normalizeUrl(input);
  if (!normalized) return null;
  return BASE_URLS.some((base) => normalized.startsWith(base)) ? normalized : null;
}

/**
 * Backward-compatible alias used by older code paths.
 */
export function normalizeExternalNewsSourceUrl(input: string | null | undefined): string | null {
  return getNormalizedNewsSourceUrl(input);
}
