// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars";

const BASE_URL = "https://car-hp.vercel.app";

export async function GET() {
  const now = new Date();
  const isoNow = now.toISOString();

  // 固定ページ
  const staticPaths = [
    { path: "/", freq: "daily", priority: 1.0 },
    { path: "/news", freq: "daily", priority: 0.8 },
    { path: "/cars", freq: "daily", priority: 0.8 },
    { path: "/column", freq: "daily", priority: 0.8 },
    { path: "/guide", freq: "daily", priority: 0.8 },
    { path: "/legal/privacy", freq: "monthly", priority: 0.5 },
    { path: "/legal/disclaimer", freq: "monthly", priority: 0.5 },
    { path: "/legal/copyright", freq: "monthly", priority: 0.5 },
    { path: "/legal/about", freq: "monthly", priority: 0.5 },
    { path: "/contact", freq: "monthly", priority: 0.5 },
  ];

  // 車種ページ
  const cars = await getAllCars();
  const carPaths = cars
    .filter((c) => c.slug)
    .map((c) => ({
      path: `/cars/${c.slug}`,
      freq: "weekly",
      priority: 0.7,
    }));

  const all = [...staticPaths, ...carPaths];

  // XML body 作成
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...all.map(
      (u) =>
        [
          "  <url>",
          `    <loc>${BASE_URL}${u.path}</loc>`,
          `    <lastmod>${isoNow}</lastmod>`,
          `    <changefreq>${u.freq}</changefreq>`,
          `    <priority>${u.priority.toFixed(1)}</priority>`,
          "  </url>",
        ].join("\n")
    ),
    "</urlset>",
    "",
  ].join("\n");

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
