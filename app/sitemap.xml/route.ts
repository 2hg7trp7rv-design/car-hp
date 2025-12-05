// app/sitemap.xml/route.ts
import type { MetadataRoute } from "next";

import { getAllCars } from "@/lib/cars";
import { getAllGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { getAllHeritage } from "@/lib/heritage";
import { getAllNews } from "@/lib/news";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://car-hp.vercel.app";

// publishedAt などから lastModified を安全に生成するヘルパー
function safeDateFromString(value?: string | null): Date {
  if (!value) return new Date();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ここで lib の全データをビルド時に読み込む
  const [cars, guides, columns, heritage, news] = await Promise.all([
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
    getAllNews(),
  ]);

  // 固定ページ
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/column`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cars`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/heritage`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // CARS: Ferrari系・BMW系を含む全CarItem（cars.json/cars1.json/cars2.json/cars3.jsonなど）を網羅
  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${BASE_URL}/cars/${car.slug}`,
    // CarItemInternal に updatedAt があればそれを、無ければ現在時刻
    lastModified: safeDateFromString(
      // @ts-expect-error: updatedAt は一部のデータだけ持っている想定
      (car as any).updatedAt ?? undefined,
    ),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // GUIDE
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${BASE_URL}/guide/${guide.slug}`,
    lastModified: safeDateFromString(guide.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // COLUMN
  const columnRoutes: MetadataRoute.Sitemap = columns.map((column) => ({
    url: `${BASE_URL}/column/${column.slug}`,
    lastModified: safeDateFromString(column.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // HERITAGE（Ferrari系のヒストリー記事など）
  const heritageRoutes: MetadataRoute.Sitemap = heritage.map((item) => ({
    url: `${BASE_URL}/heritage/${item.slug}`,
    lastModified: safeDateFromString(item.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // NEWS（個別ニュースページ）
  const newsRoutes: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${BASE_URL}/news/${item.id}`,
    lastModified: safeDateFromString(item.publishedAt),
    changeFrequency: "hourly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...carRoutes,
    ...guideRoutes,
    ...columnRoutes,
    ...heritageRoutes,
    ...newsRoutes,
  ];
}
