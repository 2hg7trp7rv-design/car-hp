// app/sitemaps/sitemap-segments/route.ts

import { getAllCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildUrlset,
  toDate10,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/seo/sitemap";
import { buildSegmentInfos, getSegmentKey } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const allCars = await getAllCars();
  const segments = buildSegmentInfos(allCars);

  // segmentKey -> lastmod (cars.updatedAt の最大)
  const lastmodByKey = new Map<string, string>();
  for (const car of allCars) {
    if (!car.segment) continue;
    const key = getSegmentKey(car.segment);
    if (!key) continue;
    const cur = lastmodByKey.get(key);
    const candidate = toDate10((car.updatedAt ?? new Date().toISOString()).toString());
    if (!cur || candidate > cur) {
      lastmodByKey.set(key, candidate);
    }
  }

  const today = toDate10(new Date().toISOString());

  const entries: SitemapUrlEntry[] = segments.map((s) => ({
    loc: `${base}/cars/segments/${encodeURIComponent(s.key)}`,
    lastmod: lastmodByKey.get(s.key) ?? today,
    changefreq: "weekly",
    priority: 0.6,
  }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
