// lib/seo/sitemap-runtime.ts

import { getSiteUrl } from "@/lib/site";
import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: number;
};

function normalizeBaseUrl(url: string): string {
  return String(url || "").replace(/\/+$/, "");
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isValidIsoDate(value: string | undefined | null): boolean {
  if (!value) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

function pickLastMod(...candidates: Array<string | undefined | null>): string | undefined {
  for (const v of candidates) {
    if (isValidIsoDate(v)) return v as string;
  }
  return undefined;
}

function clampPriority(value: number | undefined): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  if (value < 0) return 0;
  if (value > 1) return 1;
  // 小数第一位程度に丸めておく
  return Math.round(value * 10) / 10;
}

function buildUrlsetXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts: string[] = [];
      parts.push("<url>");
      parts.push(`<loc>${escapeXml(e.loc)}</loc>`);
      if (e.lastmod && isValidIsoDate(e.lastmod)) {
        parts.push(`<lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      }
      if (e.changefreq) {
        parts.push(`<changefreq>${escapeXml(e.changefreq)}</changefreq>`);
      }
      const p = clampPriority(e.priority);
      if (typeof p === "number") {
        parts.push(`<priority>${p.toFixed(1)}</priority>`);
      }
      parts.push("</url>");
      return parts.join("");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
  ].join("\n");
}

/**
 * 拡張子なし(`/sitemap`)でも確実に返せるように、
 * 依存がローカルデータだけで完結する「安定版」サイトマップを生成。
 */
export async function buildRuntimeSitemapXml(): Promise<string> {
  const base = normalizeBaseUrl(getSiteUrl());
  const now = new Date().toISOString();

  const staticPaths: Array<{ path: string; changefreq?: ChangeFreq; priority?: number }> = [
    { path: "/", changefreq: "daily", priority: 1.0 },
    { path: "/cars", changefreq: "daily", priority: 0.9 },
    { path: "/news", changefreq: "hourly", priority: 0.8 },
    { path: "/guide", changefreq: "weekly", priority: 0.8 },
    { path: "/column", changefreq: "weekly", priority: 0.7 },
    { path: "/heritage", changefreq: "weekly", priority: 0.6 },
    { path: "/contact", changefreq: "yearly", priority: 0.3 },

    // GUIDE Hub
    { path: "/guide/insurance", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/lease", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/maintenance", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-loan", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-usedcar", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-shaken", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-consumables", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-paperwork", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-import-trouble", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-sell", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-sell-compare", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-sell-prepare", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-sell-loan", changefreq: "monthly", priority: 0.5 },
    { path: "/guide/hub-sell-price", changefreq: "monthly", priority: 0.5 },

    // LEGAL
    { path: "/legal/about", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/editorial-policy", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/sources-factcheck", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/ads-affiliate-policy", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/privacy", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/disclaimer", changefreq: "yearly", priority: 0.2 },
    { path: "/legal/copyright", changefreq: "yearly", priority: 0.2 },
  ];

  const entries: SitemapEntry[] = staticPaths.map((p) => ({
    loc: `${base}${p.path}`,
    lastmod: now,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  // CARS
  try {
    const cars = await getAllCars();
    for (const c of cars) {
      if (!c?.slug) continue;
      const lastmod = pickLastMod(c.updatedAt, c.publishedAt, c.createdAt);
      entries.push({
        loc: `${base}/cars/${encodeURIComponent(c.slug)}`,
        lastmod,
        changefreq: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // ignore
  }

  // GUIDES
  try {
    const guides = await getAllGuides();
    for (const g of guides) {
      if (!g?.slug) continue;
      const lastmod = pickLastMod(g.updatedAt, g.publishedAt, g.createdAt);
      entries.push({
        loc: `${base}/guide/${encodeURIComponent(g.slug)}`,
        lastmod,
        changefreq: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // ignore
  }

  // COLUMNS
  try {
    const columns = await getAllColumns();
    for (const c of columns) {
      if (!c?.slug) continue;
      const lastmod = pickLastMod(c.updatedAt, c.publishedAt, c.createdAt);
      entries.push({
        loc: `${base}/column/${encodeURIComponent(c.slug)}`,
        lastmod,
        changefreq: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // ignore
  }

  // HERITAGE
  try {
    const heritage = await getAllHeritage();
    for (const h of heritage) {
      if (!h?.slug) continue;
      const lastmod = pickLastMod(h.updatedAt, h.publishedAt, h.createdAt);
      entries.push({
        loc: `${base}/heritage/${encodeURIComponent(h.slug)}`,
        lastmod,
        changefreq: "yearly",
        priority: 0.4,
      });
    }
  } catch {
    // ignore
  }

  return buildUrlsetXml(entries);
}
