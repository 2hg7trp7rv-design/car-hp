/** @type {import("next").NextConfig} */

// メタデータ用のベースURL
// - Cloudflare Pages: 環境変数 SITE_URL / NEXT_PUBLIC_SITE_URL を推奨
// - Vercel: NEXT_PUBLIC_SITE_URL が未設定なら VERCEL_URL から生成
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://carboutiquejournal.com");

const nextConfig = {
  // React Strict Mode（開発時のみ有効 / Cloudflare 上ではそのままでも問題なし）
  reactStrictMode: true,

  // メタデータベースを環境に応じて変える（OG/Canonical などの生成の基準）
  env: {
    SITE_URL,
  },

  // 画像は外部 URL も許可（OGP 画像や車画像など）
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // 今後 Cloudflare の OpenNext/next-on-pages 両対応を見据えて、
  // Next.js 標準出力に寄せたまま運用する（output はデフォルトのまま）
  // 必要になればここに rewrites/redirects などを追加していく。
};

export default nextConfig;
