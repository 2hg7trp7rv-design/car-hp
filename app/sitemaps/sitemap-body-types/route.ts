// app/sitemaps/sitemap-body-types/route.ts

import { getAllCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildUrlset,
  toDate10,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/seo/sitemap";
import { buildBodyTypeInfos, getBodyTypeKey } from "@/lib/taxonomy/body-type-hubs";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const allCars = await getAllCars();
  const bodyTypes = buildBodyTypeInfos(allCars);

  // bodyTypeKey -> lastmod (cars.updatedAt の最大)
  const lastmodByKey = new Map<string, string>();
  for (const car of allCars) {
    if (!car.bodyType) continue;
    const key = getBodyTypeKey(car.bodyType);
    if (!key) continue;
    const cur = lastmodByKey.get(key);
    const candidate = toDate10((car.updatedAt ?? new Date().toISOString()).toString());
    if (!cur || candidate > cur) {
      lastmodByKey.set(key, candidate);
    }
  }

  const today = toDate10(new Date().toISOString());

  const entries: SitemapUrlEntry[] = bodyTypes.map((b) => ({
    loc: `${base}/cars/body-types/${encodeURIComponent(b.key)}`,
    lastmod: lastmodByKey.get(b.key) ?? today,
    changefreq: "weekly",
    priority: 0.6,
  }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
