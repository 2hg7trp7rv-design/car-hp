// app/sitemaps/sitemap-news.xml/route.ts

import { getLatestNews, type NewsItem } from "@/lib/news";
import { getSiteUrl } from "@/lib/site";
import {
  buildUrlset,
  toDate10,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/seo/sitemap";

// RSS 取得を含むため、実行時生成 + キャッシュで安定させる
export const dynamic = "force-dynamic";
export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$|\s+/g, "");

  let news: NewsItem[] = [];
  try {
    // NOTE: /news 一覧は 200 まで表示する設計なので sitemap も揃える
    news = await getLatestNews(200);
  } catch {
    news = [];
  }

  const entries: SitemapUrlEntry[] = news
    .filter((n) => n && typeof n.id === "string" && n.id.length > 0)
    .map((n) => ({
      loc: `${base}/news/${encodeURIComponent(n.id)}`,
      lastmod: toDate10(n.updatedAt || n.publishedAt || n.createdAt),
      changefreq: "daily",
      priority: 0.4,
    }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
