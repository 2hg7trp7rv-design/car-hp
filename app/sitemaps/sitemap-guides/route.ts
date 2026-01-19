// app/sitemaps/sitemap-guides/route.ts

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";
import { buildUrlset, toDate10, xmlResponse, type SitemapUrlEntry } from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const guides = await getAllGuides();

  const entries: SitemapUrlEntry[] = guides
    .filter((g: GuideItem) => g && g.slug)
    .map((g: GuideItem) => ({
      loc: `${base}/guide/${encodeURIComponent(g.slug)}`,
      lastmod: toDate10(g.updatedAt || g.publishedAt || g.createdAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
