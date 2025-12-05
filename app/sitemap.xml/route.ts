// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars";

const BASE_URL = "https://car-hp.vercel.app";

type ChangeFreq = "daily" | "weekly" | "monthly";

type UrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: ChangeFreq;
  priority: number;
};

function toIsoString(date: Date): string {
  return date.toISOString();
}

function buildXml(urls: UrlEntry[]): string {
  const urlsXml = urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${u.lastmod}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    )
    .join("\n");

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urlsXml +
    "\n</urlset>\n"
  );
}

export async function GET(): Promise<NextResponse> {
  const now = new Date();
  const lastmod = toIsoString(now);
  const urls: UrlEntry[] = [];

  const push = (path: string, changefreq: ChangeFreq, priority: number) => {
    urls.push({
      loc: `${BASE_URL}${path}`,
      lastmod,
      changefreq,
      priority,
    });
  };

  // ── 固定ページ ──────────────────────────────
  push("/", "daily", 1.0);
  push("/news", "daily", 0.8);
  push("/cars", "daily", 0.8);
  push("/column", "daily", 0.8);
  push("/guide", "daily", 0.8);

  push("/legal/privacy", "monthly", 0.5);
  push("/legal/disclaimer", "monthly", 0.5);
  push("/legal/copyright", "monthly", 0.5);
  push("/legal/about", "monthly", 0.5);
  push("/contact", "monthly", 0.5);

  // ── 車種ページ（/cars/[slug]） ────────────────
  try {
    const cars = await getAllCars();

    for (const car of cars) {
      if (!car.slug) continue;
      push(`/cars/${car.slug}`, "weekly", 0.7);
    }
  } catch (error) {
    // ここでエラーになっても、固定ページだけの sitemap は返せるようにしておく
    console.error("[sitemap.xml] failed to load cars:", error);
  }

  const xmlBody = buildXml(urls);

  return new NextResponse(xmlBody, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // 検索エンジン向けに1日キャッシュ（お好みで調整可）
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
