// app/sitemaps/sitemap-cars/route.ts

import { getAllCars, type CarItem } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { isIndexableCar } from "@/lib/seo/indexability";
import { buildUrlset, toDate10, xmlResponse, type SitemapUrlEntry } from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const cars = await getAllCars();

  const entries: SitemapUrlEntry[] = cars
    .filter((c: CarItem) => c && c.slug)
    .filter((c: CarItem) => isIndexableCar(c))
    .map((c: CarItem) => ({
      loc: `${base}/cars/${encodeURIComponent(c.slug)}`,
      lastmod: toDate10(c.updatedAt || c.publishedAt || c.createdAt),
      changefreq: "monthly",
      priority: 0.6,
    }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
