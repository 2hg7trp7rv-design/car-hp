// lib/monetize.ts

/**
 * マネタイズ導線の単一ソース
 *
 * - パートナー一覧は data/monetize/partners.json のみに置く
 * - url が "#" のものはプレースホルダー（正式なアフィリエイトURL未設定）
 * - 表示は ENABLE_MONETIZATION（NEXT_PUBLIC_ENABLE_MONETIZATION=true）のときだけ行う
 */

import partnersJson from "@/data/monetize/partners.json";

export type MonetizeCategory = "sell" | "inspection" | "insurance";

export type MonetizePartner = {
  id: string;
  category: MonetizeCategory;
  name: string;
  url: string;
  ctaLabel: string;
  description: string;
};

const raw = (partnersJson as { partners?: unknown }).partners;

export const MONETIZE_PARTNERS: MonetizePartner[] = Array.isArray(raw)
  ? (raw as MonetizePartner[]).filter(
      (p) => p && typeof p.id === "string" && typeof p.category === "string",
    )
  : [];

export function getPartnerById(id: string): MonetizePartner | undefined {
  return MONETIZE_PARTNERS.find((p) => p.id === id);
}

export function getPartnersByCategory(
  category: MonetizeCategory,
): MonetizePartner[] {
  return MONETIZE_PARTNERS.filter((p) => p.category === category);
}

/** プレースホルダー（正式URL未設定）かどうか */
export function isPlaceholderPartner(partner: MonetizePartner): boolean {
  return !partner.url || partner.url.trim() === "#";
}
