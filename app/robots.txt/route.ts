// app/robots.txt/route.ts

import { getSiteUrl } from "@/lib/site";

// 24h cache (CDN/Edge)
export const revalidate = 60 * 60 * 24;

export function GET(): Response {
  const base = getSiteUrl();

  // robots.txt は「改行区切りのプレーンテキスト」で返す。
  // Google は robots.txt をインデックス除外の仕組みとしては扱わないため、
  // インデックスさせたくないURLは HTML側の noindex を併用する。
  // - 参考: robots.txt はクロール制御であり、インデックス除外は noindex を使う。
  //   (Google Search Central)
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /_internal/",
    "",
    // 冗長でも問題ないため、/sitemap と /sitemap.xml を両方掲示。
    // (どちらかにアクセスできない環境があっても回避できるようにする)
    `Sitemap: ${base}/sitemap`,
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
