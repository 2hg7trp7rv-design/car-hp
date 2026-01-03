// app/robots.ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// 生成の揺れ/負荷を抑える（1日キャッシュ）
export const revalidate = 60 * 60 * 24;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  const base = normalizeBaseUrl(getSiteUrl());

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 明示しておくと無駄クロールが減る（SEO上は無害・運用上は有利）
        disallow: ["/api/", "/_next/"],
      },
    ],
    // sitemap は public/ 配下で静的に配信する（Route Handler に依存しない）
    sitemap: `${base}/sitemap.xml`,
  };
}
