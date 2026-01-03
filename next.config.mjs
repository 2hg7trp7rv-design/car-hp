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

  // 今後 Cloudflare の OpenNext/next-on-pages 両対応を見据えて、
  // Next.js 標準出力に寄せたまま運用する（output はデフォルトのまま）
  // 必要になればここに rewrites/redirects などを追加していく。
};

export default nextConfig;
