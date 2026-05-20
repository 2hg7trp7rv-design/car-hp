import { getSiteUrl } from "@/lib/site";

// Category labels used for UI badges and breadcrumb display.
// (The keys align with GuideCategory values in lib/content-types.ts)
export const CATEGORY_LABEL: Record<string, string> = {
  MONEY: "お金・維持費",
  BUY: "購入",
  SELL: "売却",
  MAINTENANCE: "メンテナンス",
  TROUBLE: "保険・緊急対応",
  LIFE: "カーライフ",
  BEGINNER: "初心者",
  ADVANCED: "上級者",
  MAINTENANCE_COST: "維持費",
  KNOWLEDGE: "知識",
};

export function canonicalGuideUrl(slug: string) {
  const base = getSiteUrl();
  const safe = String(slug || "").replace(/^\//, "");
  return `${base}/guide/${safe}`;
}
