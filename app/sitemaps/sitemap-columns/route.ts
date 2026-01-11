// app/sitemaps/sitemap-columns/route.ts

import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getSiteUrl } from "@/lib/site";
import { buildUrlset, toDate10, xmlResponse, type SitemapUrlEntry } from "@/lib/seo/sitemap";
import { isIndexableColumn } from "@/lib/seo/indexability";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const columns = await getAllColumns();

  const entries: SitemapUrlEntry[] = columns
    .filter((c: ColumnItem) => c && c.slug)
    .filter((c: ColumnItem) => isIndexableColumn(c))
    .map((c: ColumnItem) => ({
      loc: `${base}/column/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt || c.createdAt),
      changefreq: "weekly",
      priority: 0.8,
    }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
