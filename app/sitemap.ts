// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllCars } from "@/lib/cars";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = "https://car-hp.vercel.app";
  const now = new Date();

  // 1. 固定ページの定義
  // changeFrequency や priority は Next.js が自動でタグ化してくれます
  const staticPaths: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cars`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/column`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/copyright`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. 車種ページ（動的ページ）の取得
  const cars = await getAllCars();

  const carPaths: MetadataRoute.Sitemap = cars
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${BASE_URL}/cars/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // 3. 全てを結合して返す（Next.jsがこれをXMLに変換します）
  return [...staticPaths, ...carPaths];
}
