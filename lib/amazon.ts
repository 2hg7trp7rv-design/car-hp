// lib/amazon.ts

export const DEFAULT_AMAZON_TAG = "carboutique-22";

/**
 * Amazon URL に tag= を必ず付与（既存 tag があっても上書き）。
 * - NEXT_PUBLIC_AMAZON_TAG があればそれを優先
 * - Amazon以外のURLはそのまま返す
 */
export function withAmazonTag(href: string): string {
  if (!href) return href;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  const host = (url.hostname ?? "").toLowerCase();
  const isAmazon = host.includes("amazon.");
  if (!isAmazon) return href;

  const tag =
    (process.env.NEXT_PUBLIC_AMAZON_TAG ?? DEFAULT_AMAZON_TAG).trim() ||
    DEFAULT_AMAZON_TAG;

  url.searchParams.set("tag", tag);
  return url.toString();
}
