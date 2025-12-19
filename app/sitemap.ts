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

  // 静的ページ定義（P2で追加したHUBを含む）
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cars`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    
    // ★追加: P2 新規HUBページ
    { url: `${BASE_URL}/guide/hub-usedcar`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/hub-loan`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guide/hub-sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // 既存 HUB
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

  // 動的ページデータの取得
  const [cars, guides, columns, heritage, news] = await Promise.all([
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
    getAllNews(),
  ]);

  const carPaths: MetadataRoute.Sitemap = cars
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${BASE_URL}/cars/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const guidePaths: MetadataRoute.Sitemap = guides
    .filter((g) => g.slug)
    .map((g) => ({
      url: `${BASE_URL}/guide/${g.slug}`,
      lastModified: new Date(g.updatedAt ?? g.publishedAt ?? now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const columnPaths: MetadataRoute.Sitemap = columns
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${BASE_URL}/column/${c.slug}`,
      lastModified: new Date(c.updatedAt ?? c.publishedAt ?? now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const heritagePaths: MetadataRoute.Sitemap = heritage
    .filter((h) => h.slug)
    .map((h) => ({
      url: `${BASE_URL}/heritage/${h.slug}`,
      lastModified: new Date(h.updatedAt ?? h.publishedAt ?? now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const newsPaths: MetadataRoute.Sitemap = news
    .filter((n) => n.id)
    .map((n) => ({
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
