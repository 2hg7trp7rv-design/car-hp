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
    default: "CAR BOUTIQUE | クルマのニュースとストーリー",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "輸入車・国産車のニュースと本音レビューを届けるCAR BOUTIQUE。維持費やトラブル、買い方・売り方まで、大人のクルマ好きが知りたい情報を静かなブティックのような世界観でお届けします。",
  alternates: {
    canonical: "/",
  },

  // OGP / SNS 用
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    siteName: "CAR BOUTIQUE",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "輸入車・国産車のニュースと本音レビューを届けるCAR BOUTIQUE。維持費やトラブル、買い方・売り方まで、大人のクルマ好きが知りたい情報を静かなブティックのような世界観でお届けします。",
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
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "輸入車・国産車のニュースと本音レビューを届けるCAR BOUTIQUE。維持費やトラブル、買い方・売り方まで、大人のクルマ好きが知りたい情報を静かなブティックのような世界観でお届けします。",
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
        {/* グローバルの大気メッシュ（Tiffany系グラデーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-site" />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />

            {/* ページ本体 */}
            <div className="flex-1 pt-16 lg:pt-20">{children}</div>

            <SiteFooter />

            {/* モバイル用ボトムナビ */}
            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
