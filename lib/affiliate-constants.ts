// lib/affiliate-constants.ts
//
// Columnページなど「簡易CTA」で使うためのURL定義（非アフィ含む）。
// 本体のアフィ解決は lib/affiliate.ts を優先。

import { withAmazonTag } from "@/lib/amazon";

export const AFFILIATE_URLS = {
  // 在庫確認（通常URL）
  SEARCH_INVENTORY: "https://www.carsensor.net/usedcar/",

  // 車買取（通常URL）
  SELL_ASSESSMENT: "https://kaitori.carsensor.net/",

  // 保証（通常URL）
  WARRANTY: "https://www.carsensor.net/trust/hosyou-syousai.html",

  // 車検（通常URL）
  SHAKEN: "https://car.rakuten.co.jp/shaken/",

  // ローン比較（通常URL）
  LOAN_COMPARE: "https://kakaku.com/loan/auto-loan/",

  // Amazon（tagは強制付与される）
  AMAZON_PARTS: withAmazonTag("https://www.amazon.co.jp/s?k=%E3%82%AB%E3%83%BC%E7%94%A8%E5%93%81"),
};

export function getSearchUrl(carName?: string) {
  if (!carName) return AFFILIATE_URLS.SEARCH_INVENTORY;
  const kw = encodeURIComponent(carName).replace(/%20/g, "+");
  // Carsensor: フリーワード検索
  return `https://www.carsensor.net/usedcar/freeword/${kw}/index.html`;
}
