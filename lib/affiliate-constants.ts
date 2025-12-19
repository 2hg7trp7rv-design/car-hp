// アフィリエイトや外部サービスのURLを一元管理する定義ファイル

export const AFFILIATE_URLS = {
  // 中古車検索・提案サービス
  SEARCH_INVENTORY: "https://example.com/search", // ズバット車販売など
  
  // 車買取・査定
  SELL_ASSESSMENT: "https://example.com/sell", // MOTA車買取など
  
  // 保証・保険
  WARRANTY: "https://example.com/warranty", // 輸入車保証サービスなど
  
  // その他 (必要に応じて追加)
  PARTS: "https://example.com/parts",
};

// 特定の車種名などをクエリに含める場合のヘルパー関数例
export function getSearchUrl(carName?: string) {
  if (!carName) return AFFILIATE_URLS.SEARCH_INVENTORY;
  // 例: https://example.com/search?q=Porsche911
  return `${AFFILIATE_URLS.SEARCH_INVENTORY}?q=${encodeURIComponent(carName)}`;
}
