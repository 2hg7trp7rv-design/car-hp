// app/sitemaps/sitemap-heritage/route.ts

import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";
import { buildUrlset, toDate10, xmlResponse, type SitemapUrlEntry } from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const heritage = await getAllHeritage();

  const entries: SitemapUrlEntry[] = heritage
    .filter((h: HeritageItem) => h && h.slug)
    .map((h: HeritageItem) => ({
      loc: `${base}/heritage/${encodeURIComponent(h.slug)}`,
      lastmod: toDate10(h.updatedAt || h.publishedAt || h.createdAt),
      changefreq: "monthly",
      priority: 0.7,
    }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
