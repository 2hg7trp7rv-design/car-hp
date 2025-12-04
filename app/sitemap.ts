// app/sitemap.ts
import type { MetadataRoute } from "next";

const baseUrl = "https://car-hp.vercel.app";

/**
 * シンプル版サイトマップ
 * まずは主要な固定ページだけを載せておく。
 * 後から車種ページやコラムを追加して拡張できる。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",          // /
    "/news",
    "/cars",
    "/column",
    "/guide",
    "/legal/privacy",
    "/legal/disclaimer",
    "/legal/copyright",
    "/legal/about",
    "/contact",
  ];

  const now = new Date();

  return staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));
}
