// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";
import { getAllNews } from "@/lib/news";

// 生成の揺れ/負荷を抑える（1日キャッシュ）
export const revalidate = 60 * 60 * 24;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const toDate = (value: unknown, fallback: Date) => {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? fallback : d;
};

const pickLastModified = (item: any, fallback: Date) =>
  toDate(item?.updatedAt ?? item?.publishedAt ?? item?.lastModified, fallback);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = normalizeBaseUrl(getSiteUrl());
  const now = new Date();

  // 静的ページ（HUB含む）
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cars`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "daily", priority: 0.9 },

    { url: `${BASE_URL}/guide/hub-usedcar`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/hub-loan`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/hub-sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    { url: `${BASE_URL}/guide/insurance`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/lease`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/maintenance`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    { url: `${BASE_URL}/column`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/heritage`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },

    { url: `${BASE_URL}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/legal/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/legal/copyright`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/legal/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const [cars, guides, columns, heritage, news] = await Promise.all([
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
    getAllNews(),
  ]);

  const carPaths: MetadataRoute.Sitemap = cars
    .filter((c: any) => c?.slug)
    .map((c: any) => ({
      url: `${BASE_URL}/cars/${c.slug}`,
      lastModified: pickLastModified(c, now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const guidePaths: MetadataRoute.Sitemap = guides
    .filter((g: any) => g?.slug)
    .map((g: any) => ({
      url: `${BASE_URL}/guide/${g.slug}`,
      lastModified: pickLastModified(g, now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const columnPaths: MetadataRoute.Sitemap = columns
    .filter((c: any) => c?.slug)
    .map((c: any) => ({
      url: `${BASE_URL}/column/${c.slug}`,
      lastModified: pickLastModified(c, now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const heritagePaths: MetadataRoute.Sitemap = heritage
    .filter((h: any) => h?.slug)
    .map((h: any) => ({
      url: `${BASE_URL}/heritage/${h.slug}`,
      lastModified: pickLastModified(h, now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const newsPaths: MetadataRoute.Sitemap = news
    .filter((n: any) => n?.id)
    .map((n: any) => ({
      url: `${BASE_URL}/news/${n.id}`,
      lastModified: toDate(n?.publishedAt, now),
      changeFrequency: "daily",
      priority: 0.5,
    }));

  return [
    ...staticPaths,
    ...carPaths,
    ...guidePaths,
    ...columnPaths,
    ...heritagePaths,
    ...newsPaths,
  ];
}
