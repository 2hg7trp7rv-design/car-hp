// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";
import { getAllNews } from "@/lib/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getSiteUrl();
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cars`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/column`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/heritage`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/legal/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const cars = getAllCars();
  const guides = getAllGuides();
  const columns = getAllColumns();
  const heritage = getAllHeritage();
  const news = getAllNews();

  const carPaths: MetadataRoute.Sitemap = cars.map((c) => ({
    url: `${BASE_URL}/cars/${c.slug}`,
    lastModified: new Date(c.updatedAt ?? c.publishedAt ?? now),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const guidePaths: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/guide/${g.slug}`,
    lastModified: new Date(g.updatedAt ?? g.publishedAt ?? now),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const columnPaths: MetadataRoute.Sitemap = columns.map((c) => ({
    url: `${BASE_URL}/column/${c.slug}`,
    lastModified: new Date(c.updatedAt ?? c.publishedAt ?? now),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const heritagePaths: MetadataRoute.Sitemap = heritage.map((h) => ({
    url: `${BASE_URL}/heritage/${h.slug}`,
    lastModified: new Date(h.updatedAt ?? h.publishedAt ?? now),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const newsPaths: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${BASE_URL}/news/${n.id}`,
    lastModified: new Date(n.publishedAt ?? now),
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
