// app/sitemaps/sitemap-static/route.ts

import { getSiteUrl } from "@/lib/site";
import { buildUrlset, toDate10, xmlResponse, type SitemapUrlEntry } from "@/lib/seo/sitemap";

export const revalidate = 60 * 60; // 1h

export async function GET() {
  const base = getSiteUrl().replace(/\/+$/, "");
  const today = toDate10(new Date().toISOString());

  const staticPaths = [
    "/",
    "/start",
    "/cars",
    "/cars/makers",
    "/cars/body-types",
    "/cars/segments",
    "/news",
    "/site-map",
    "/guide",
    "/guide/insurance",
    "/guide/lease",
    "/guide/maintenance",
    "/guide/hub-loan",
    "/guide/hub-usedcar",
    "/guide/hub-shaken",
    "/guide/hub-consumables",
    "/guide/hub-paperwork",
    "/guide/hub-import-trouble",
    "/guide/hub-sell",
    "/guide/hub-sell-compare",
    "/guide/hub-sell-prepare",
    "/guide/hub-sell-loan",
    "/guide/hub-sell-price",
    "/column",
    "/heritage",
    "/contact",
    "/legal/about",
    "/legal/ads-affiliate-policy",
    "/legal/copyright",
    "/legal/disclaimer",
    "/legal/editorial-policy",
    "/legal/privacy",
    "/legal/sources-factcheck",
  ];

  const entries: SitemapUrlEntry[] = staticPaths.map((p) => ({
    loc: `${base}${p}`,
    lastmod: today,
    changefreq: p === "/" || p === "/news" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : p === "/news" ? 0.8 : 0.7,
  }));

  return xmlResponse(buildUrlset(entries), 60 * 60);
}
