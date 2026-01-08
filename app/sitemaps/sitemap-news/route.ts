// app/sitemaps/sitemap-news/route.ts

import { getAllNews, type NewsItem } from "@/lib/news";
import { getSiteUrl } from "@/lib/site";
import {
  buildUrlset,
  toDate10,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");

  let news: NewsItem[] = [];
  try {
    news = await getAllNews();
  } catch {
    news = [];
  }

  const entries: SitemapUrlEntry[] = news
    .filter((n) => n && (n.id || n.slug))
    .map((n) => {
      const id = n.id || n.slug;
      return {
        loc: `${base}/news/${encodeURIComponent(id)}`,
        lastmod: toDate10(n.updatedAt || n.publishedAt || n.createdAt),
        changefreq: "weekly",
        priority: 0.5,
      };
    });

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
