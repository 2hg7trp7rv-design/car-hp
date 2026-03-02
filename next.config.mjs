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

// --- Security headers / CSP ---
// 段階導入（Report-Only → Enforce）
// - デフォルト: Report-Only（壊しにくい）
// - Enforce に切り替える場合: Vercel の環境変数で `CSP_ENFORCE=1`
const CSP_ENFORCE =
  process.env.CSP_ENFORCE === "1" ||
  process.env.CSP_MODE === "enforce" ||
  process.env.CSP_MODE === "enforced";

const IS_PROD =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

function buildCsp() {
  // NOTE:
  // - Next.js の実装上、script/style は inline が混ざり得るため、まずは Report-Only で監視する。
  // - ここで厳格化する場合は、nonce / hash / strict-dynamic を導入してから。
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    // Report-Only の段階では dev / 一部環境の評価系を考慮して unsafe-eval も許可
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' https:",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    // まずは簡易に Report-URI を有効化（収集は /api/csp-report で受ける）
    "report-uri /api/csp-report",
  ];

  return directives.join("; ");
}

function securityHeaders() {
  const csp = buildCsp();
  const headers = [
    // HSTS（本番のみ）
    ...(IS_PROD
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),

    // Clickjacking
    { key: "X-Frame-Options", value: "DENY" },

    // MIME sniffing
    { key: "X-Content-Type-Options", value: "nosniff" },

    // Referrer
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

    // Permissions Policy（必要になったら個別に開ける）
    {
      key: "Permissions-Policy",
      value:
        "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()",
    },

    // Cross-origin isolation 系はトラブル源になり得るため、本番のみで運用。
    // - COEP は外部リソースが多いと壊れやすいので入れない
    ...(IS_PROD
      ? [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ]
      : []),

    // Legacy (disable)
    { key: "X-XSS-Protection", value: "0" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },

    // CSP (Report-Only by default)
    {
      key: CSP_ENFORCE
        ? "Content-Security-Policy"
        : "Content-Security-Policy-Report-Only",
      value: csp,
    },
  ];

  return headers;
}

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

  // `optimizeFonts` は <link rel="stylesheet"> 経由の外部フォント最適化に関する挙動。
  // CBJ は `next/font`（self-host）を採用するため、ここは明示的に false のままにする。
  // NOTE: `next/font/google` は build 時に Google Fonts を取得するが、Vercel/GitHub Actions 前提なら問題になりにくい。
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
        // Security headers for all routes
        source: "/(.*)",
        headers: securityHeaders(),
      },
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
