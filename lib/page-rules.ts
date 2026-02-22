// lib/page-rules.ts

export type PageType =
  | "home"
  | "heritage_index"
  | "heritage_detail"
  | "cars_index"
  | "cars_detail"
  | "guide_index"
  | "guide_detail"
  | "column_index"
  | "column_detail"
  | "news_index"
  | "news_detail";

/**
 * 外部CTA（アフィリンク等）を許可するページ種別
 * - HERITAGE/CARS/COLUMN/NEWS は「内部リンクのみ」
 * - GUIDE（特にHUB）で外部導線を集中させる
 */
export function allowExternalCta(pageType: PageType): boolean {
  if (
    pageType === "heritage_index" ||
    pageType === "heritage_detail" ||
    pageType === "cars_index" ||
    pageType === "cars_detail" ||
    pageType === "column_index" ||
    pageType === "column_detail" ||
    pageType === "news_index" ||
    pageType === "news_detail"
  ) {
    return false;
  }
  if (pageType === "guide_index" || pageType === "guide_detail") {
    return true;
  }
  return false;
}

/**
 * HERITAGE末尾の「次に読む」固定棚を常に表示するか
 * - 方針：必ず出す（データが無い場合は空状態UIを表示）
 */
export function mustShowNextReadBlock(pageType: PageType): boolean {
  return pageType === "heritage_detail";
}
