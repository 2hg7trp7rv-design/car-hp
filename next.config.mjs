/** @type {import("next").NextConfig} */

import fs from "node:fs";
import path from "node:path";

function loadDataRedirects() {
  const abs = path.join(process.cwd(), "data", "redirects.json");
  try {
    const raw = fs.readFileSync(abs, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r === "object")
      .map((r) => ({
        source: String(r.source ?? "").trim(),
        destination: String(r.destination ?? "").trim(),
        permanent: Boolean(r.permanent),
      }))
      .filter((r) => r.source.startsWith("/") && r.destination.startsWith("/"));
  } catch {
    return [];
  }
}

const DATA_REDIRECTS = loadDataRedirects();

// メタデータ用のベースURL
// - canonical / sitemap に入る「本番ドメイン」がブレるとインデックスが停滞しやすい。
// - Vercel の `VERCEL_URL` はプレビュー/既定ドメインになるため、未設定時のフォールバックには使わない。
// - 本番は NEXT_PUBLIC_SITE_URL / SITE_URL を明示するのが理想。
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://carboutiquejournal.com";

// 画像最適化の可否
// - Vercel: Next/Image 最適化APIが使える
// - Cloudflare Pages/Workers: 最適化APIが使えないため unoptimized を有効化
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
const IS_CLOUDFLARE = Boolean(
  process.env.CF_PAGES || process.env.CLOUDFLARE || process.env.CF_WORKERS
);

const nextConfig = {
  // React Strict Mode（開発時のみ有効 / Cloudflare 上ではそのままでも問題なし）
  reactStrictMode: true,

  // data/articles の JSON をサーバー実行環境に同梱（fs 読み込み用）
  experimental: {
    outputFileTracingIncludes: {
      "/": ["data/articles/**/*"],
    },
  },


  // セキュリティヘッダ（X-Powered-By を消す）
  poweredByHeader: false,

  // 外部フォント（Google Fonts 等）の build 時フェッチを無効化
  // - CI / オフライン環境で `next build` が失敗するのを防ぐ
  // - フォント自体は app/layout.tsx の <link> で読み込む
  optimizeFonts: false,

  // クライアント・サーバー双方で使う「サイトの絶対URL」
  // ※ generateMetadata などから process.env.NEXT_PUBLIC_SITE_URL 経由で参照する想定
  env: {
    NEXT_PUBLIC_SITE_URL: SITE_URL,
  },

  images: {
    // Cloudflare Pages / Workers では Next の画像最適化APIが使えないため unoptimized を有効化
    // ただし Vercel では最適化を有効にする
    unoptimized: IS_CLOUDFLARE && !IS_VERCEL,

    // remotePatterns は「絶対URLの画像を使えるようにするため」の最低限の設定
    // - いまは https のみ許可しつつ hostname はワイルドカード
    // - 実際に使うホストが固まったら、
    //   ここを allowlist 方式（example.com / images.cdn.example 等）に絞る想定
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async redirects() {
    return [
      // Canonical sitemap endpoint
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },

      // Backward-compat for old (no-extension) sitemap shards
      { source: "/sitemaps/sitemap-static", destination: "/sitemaps/sitemap-static.xml", permanent: true },
      { source: "/sitemaps/sitemap-cars", destination: "/sitemaps/sitemap-cars.xml", permanent: true },
      { source: "/sitemaps/sitemap-makers", destination: "/sitemaps/sitemap-makers.xml", permanent: true },
      { source: "/sitemaps/sitemap-body-types", destination: "/sitemaps/sitemap-body-types.xml", permanent: true },
      { source: "/sitemaps/sitemap-segments", destination: "/sitemaps/sitemap-segments.xml", permanent: true },
      { source: "/sitemaps/sitemap-guides", destination: "/sitemaps/sitemap-guides.xml", permanent: true },
      { source: "/sitemaps/sitemap-columns", destination: "/sitemaps/sitemap-columns.xml", permanent: true },
      { source: "/sitemaps/sitemap-heritage", destination: "/sitemaps/sitemap-heritage.xml", permanent: true },
      { source: "/sitemaps/sitemap-news", destination: "/sitemaps/sitemap-news.xml", permanent: true },

      // Data-driven legacy redirects (data/redirects.json)
      ...DATA_REDIRECTS,

    ];
  },

  async headers() {
    const cache = "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400";
    return [
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: cache },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: cache },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
      {
        source: "/sitemaps/:path*",
        headers: [
          { key: "Cache-Control", value: cache },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
    ];
  },
  // 今後 Cloudflare の OpenNext/next-on-pages 両対応を見据えて、
  // Next.js 標準出力に寄せたまま運用する（output はデフォルトのまま）
  // 必要になればここに rewrites/redirects などを追加していく。
};

export default nextConfig;
