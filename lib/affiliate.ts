// lib/affiliate.ts
// アフィリエイトURLの「解決レイヤー」
// - GuideMonetizeBlock はテンプレ文言＋CTA選択に集中
// - 実URLは data/affiliateLinks.(demo|prod).json に集約
// - 環境変数 NEXT_PUBLIC_AFFILIATE_ENV で読み分け

import demoLinks from "@/data/affiliateLinks.demo.json";
import prodLinks from "@/data/affiliateLinks.prod.json";

export type AffiliateLinksMap = Record<string, string>;

export type GuideMonetizeSource = {
  monetizeKey?: string | null;
  affiliateLinks?: AffiliateLinksMap | null;
};

function getAffiliateEnv(): "prod" | "demo" {
  return process.env.NEXT_PUBLIC_AFFILIATE_ENV === "prod" ? "prod" : "demo";
}

function getBaseLinks(): AffiliateLinksMap {
  const env = getAffiliateEnv();
  return (env === "prod"
    ? (prodLinks as AffiliateLinksMap)
    : (demoLinks as AffiliateLinksMap)) ?? {};
}

/**
 * monetizeKey → 必須URLキー（最低1つは必要）
 * - ここで「どの monetizeKey がどのURLを要するか」を決める
 * - GuideMonetizeBlock 側の switch(monetizeKey) と揃える
 */
const REQUIRED_LINK_KEYS: Record<string, (keyof AffiliateLinksMap)[]> = {
  // --- 売却系（Aピラー） ---
  sell_basic_checklist: ["carSellIkkatsuUrl"],
  sell_import_highclass: ["carSellImportUrl"],
  sell_timing: ["carSellIkkatsuUrl"],
  sell_loan_remain: ["carSellLoanRemainUrl"],

  // --- 保険・車検系（Bピラー） ---
  insurance_compare_core: ["insuranceCompareUrl"],
  insurance_saving: ["insuranceCompareUrl"],
  insurance_after_accident: ["insuranceConsultUrl"],
  shaken_rakuten: ["shakenRakutenUrl"],
  insurance_corporate: ["insuranceBizConsultUrl"],

  // --- カー用品（Amazon）（Cピラー） ---
  goods_drive_recorder: ["amazonDriveRecorderUrl"],
  goods_child_seat: ["amazonChildSeatUrl"],
  goods_car_wash_coating: ["amazonCarWashUrl"],
  goods_interior_clean: ["amazonInteriorCleanUrl"],
  goods_jump_starter: ["amazonJumpStarterUrl"],
};

function hasAnyRequiredUrl(key: string, links: AffiliateLinksMap): boolean {
  const required = REQUIRED_LINK_KEYS[key] ?? [];
  if (required.length === 0) return false;

  return required.some((k) => {
    const v = links[k as string];
    return typeof v === "string" && v.trim().length > 0;
  });
}

/**
 * GUIDE（monetizeKey）に応じて、使用可能なリンクMapを返す。
 * - monetizeKey が無い → null
 * - 必須URLが JSON に無い/空 → null（安全に非表示）
 * - guide.affiliateLinks があればベースに上書き（将来運用用）
 */
export function resolveAffiliateLinksForGuide(
  guide: GuideMonetizeSource,
): AffiliateLinksMap | null {
  const monetizeKey = guide.monetizeKey?.trim() ?? "";
  if (!monetizeKey) return null;

  const base = getBaseLinks();
  const merged: AffiliateLinksMap = {
    ...base,
    ...(guide.affiliateLinks ?? {}),
  };

  if (!hasAnyRequiredUrl(monetizeKey, merged)) {
    return null;
  }

  return merged;
}
