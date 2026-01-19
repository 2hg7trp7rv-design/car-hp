// app/sitemaps/sitemap-makers/route.ts

import { getAllCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildUrlset,
  toDate10,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/seo/sitemap";
import { buildMakerInfos } from "@/lib/taxonomy/makers";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const allCars = await getAllCars();
  const makers = buildMakerInfos(allCars);

  // makerKey -> lastmod (cars.updatedAt の最大)
  const lastmodByMaker = new Map<string, string>();
  for (const car of allCars) {
    if (!car.makerKey) continue;
    const cur = lastmodByMaker.get(car.makerKey);
    const candidate = toDate10((car.updatedAt ?? new Date().toISOString()).toString());
    if (!cur || candidate > cur) {
      lastmodByMaker.set(car.makerKey, candidate);
    }
  }

  const today = toDate10(new Date().toISOString());

  const entries: SitemapUrlEntry[] = makers.map((m) => ({
    loc: `${base}/cars/makers/${encodeURIComponent(m.key)}`,
    lastmod: lastmodByMaker.get(m.key) ?? today,
    changefreq: "weekly",
    priority: 0.6,
  }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
