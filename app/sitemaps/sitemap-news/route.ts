// app/sitemaps/sitemap-news/route.ts
//
// NOTE:
// NEWS詳細(/news/[id])は「一次情報リンク集」として運用し、当面 noindex。
// Sitemap に含めると Search Console で
//  - 「送信された URL が noindex です」
//  - 重複/薄いページ扱い
// などのノイズが増えるため、ここは空で返す（将来 index したいときに復活）。

import { buildUrlset, xmlResponse } from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  // 意図的に空
  return xmlResponse(buildUrlset([]), 60 * 60);
}
