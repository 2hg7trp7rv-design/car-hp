// app/sitemap.ts
import type { MetadataRoute } from "next";

const baseUrl = "https://car-hp.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
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
    lastModified: now.toISOString(),
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
