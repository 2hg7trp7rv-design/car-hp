// app/layout.tsx
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { getSiteOrigin, getSiteUrl } from "@/lib/site";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";

// ---- viewport（スマホ前提の表示設定） ----
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // iOS Safari / Lighthouse のアクセシビリティ警告回避（拡大操作を許可）
  // ※デザインは崩れにくいよう上限のみ緩める
  maximumScale: 5,
  viewportFit: "cover",
};

// ---- サイト全体のメタデータ ----
export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: {
    // NOTE: 各ページ側で title を適切に設定する前提。
    // それでも抜けが出た時に SERP の意味が通るよう、default も SEO 寄りの文言にする。
    default: "車の買い方・維持費・故障・相場を整理する",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "輸入車・国産車の車種データベース、コラム、ガイドを横断して、維持費・故障・保険・税金・売却まで判断材料を整理するCAR BOUTIQUE。買ってからの現実と比較の軸がここにあります。",
  // OGP / SNS 用
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    siteName: "CAR BOUTIQUE",
    title: "車の買い方・維持費・故障・相場を整理する | CAR BOUTIQUE",
    description:
      "輸入車・国産車の車種データベース、コラム、ガイドを横断して、維持費・故障・保険・税金・売却まで判断材料を整理するCAR BOUTIQUE。買ってからの現実と比較の軸がここにあります。",
    images: [
      {
        url: "/ogp-default.jpg",
        width: 1200,
        height: 630,
        alt: "CAR BOUTIQUE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "車の買い方・維持費・故障・相場を整理する | CAR BOUTIQUE",
    description:
      "輸入車・国産車の車種データベース、コラム、ガイドを横断して、維持費・故障・保険・税金・売却まで判断材料を整理するCAR BOUTIQUE。買ってからの現実と比較の軸がここにあります。",
    images: ["/ogp-default.jpg"],
  },

  // favicon / PWA 系（画像ファイルは後で置き換えればOK）
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",

  // SEO / クローラー向け
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Google Search Console 用サイト確認タグ
  verification: {
    google: "WosqURlP51rA8r-zabt5_bjCZdK1VYL7MkhoJ7txp-s",
  },
};


// ---- JSON-LD（サイト共通） ----
const WEBSITE_JSON_LD = {
  "@type": "WebSite",
  "@id": `${getSiteUrl()}/#website`,
  url: getSiteUrl(),
  name: "CAR BOUTIQUE",
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: `${getSiteUrl()}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const ORGANIZATION_JSON_LD = {
  "@type": "Organization",
  "@id": `${getSiteUrl()}/#organization`,
  name: "CAR BOUTIQUE",
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/icon-512x512.png`,
};

type RootLayoutProps = {
  children: ReactNode;
};

// ---- ルートレイアウト ----
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <head>
        {/*
          Google Fonts は build 時に取得せず、ランタイムで読み込む。
          - `next/font/google` は build 時に fonts.googleapis.com へアクセスするため、
            CI / オフライン環境で `next build` が失敗することがある。
          - next.config.mjs の `optimizeFonts: false` と併用して、build 時フェッチを避ける。
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Bodoni+Moda:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-brand-black bg-brand-white antialiased overflow-x-hidden selection:bg-brand-blue/30 selection:text-brand-black">
        <div className="fixed inset-0 z-[-1] bg-atmosphere pointer-events-none" />
        <GoogleAnalytics />
        {/* Schema.org: WebSite / Organization */}
        <JsonLd id="jsonld-website" data={WEBSITE_JSON_LD} />
        <JsonLd id="jsonld-organization" data={ORGANIZATION_JSON_LD} />
        {/* グローバルの大気メッシュ（Tiffany系グラデーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-site" />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />

            {/* ページ本体 */}
            <div className="flex-1 pt-16 lg:pt-20">{children}</div>

            <SiteFooter />

            {/* 比較（最大3台）ショートカット */}
            <CompareFloatingBar />

            {/* モバイル用ボトムナビ */}
            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
