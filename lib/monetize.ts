// lib/monetize.ts
//
// ガイド記事のマネタイズ表示条件を一元管理する。
// GuideMonetizeBlock（記事下部のCTAブロック）と MonetizePrBadge（記事上部の
// 「PR/広告を含みます」バッジ）は、必ずこの関数の結果を共有して表示可否を決める。
// これにより「バッジだけ出る／ブロックだけ出る」状態を防ぐ（景表法対応）。

import { ENABLE_MONETIZATION } from "@/lib/feature-flags";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * ガイド記事にマネタイズ導線（PRバッジ＋CTAブロック）を表示できるか。
 *
 * 条件:
 * - NEXT_PUBLIC_ENABLE_MONETIZATION=true でマネタイズ全体が有効
 * - 記事に monetizeKey が付いている
 * - monetizeKey に対応するアフィリエイトリンクが1件以上解決できる
 */
export function canRenderGuideMonetizeBlock(input: {
  monetizeKey?: string | null;
  affiliateLinks?: Record<string, string> | null;
}): boolean {
  if (!ENABLE_MONETIZATION) return false;
  if (!isNonEmptyString(input.monetizeKey)) return false;

  const links = resolveAffiliateLinksForGuide({
    monetizeKey: input.monetizeKey,
    affiliateLinks: (input.affiliateLinks ?? null) as any,
  });

  if (!links || typeof links !== "object") return false;
  return Object.values(links as Record<string, unknown>).some(isNonEmptyString);
}
