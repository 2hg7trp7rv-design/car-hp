// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars";

const BASE_URL = "https://car-hp.vercel.app";

export async function GET() {
  const now = new Date().toISOString();

  // 固定ページ
  const staticPaths = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/news", changefreq: "daily", priority: "0.8" },
    { path: "/cars", changefreq: "daily", priority: "0.8" },
    { path: "/column", changefreq: "daily", priority: "0.8" },
    { path: "/guide", changefreq: "daily", priority: "0.8" },
    { path: "/legal/privacy", changefreq: "monthly", priority: "0.5" },
    { path: "/legal/disclaimer", changefreq: "monthly", priority: "0.5" },
    { path: "/legal/copyright", changefreq: "monthly", priority: "0.5" },
    { path: "/legal/about", changefreq: "monthly", priority: "0.5" },
    { path: "/contact", changefreq: "monthly", priority: "0.5" },
  ];

  // 車種ページ (/cars/[slug])
  const cars = await getAllCars();
  const carPaths = cars.map((car) => ({
    path: `/cars/${car.slug}`,
    changefreq: "weekly",
    priority: "0.7",
  }));

  const allPaths = [...staticPaths, ...carPaths];

  const urlEntries = allPaths
    .map((item) => {
      const loc = `${BASE_URL}${item.path}`;
      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
