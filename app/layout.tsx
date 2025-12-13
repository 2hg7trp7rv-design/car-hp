// app/layout.tsx
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Manrope, Bodoni_Moda } from "next/font/google";

import "./globals.css";
import { getSiteOrigin, getSiteUrl } from "@/lib/site";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

// ---- フォント設定（next/font） ----
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  adjustFontFallback: false,
});

// ---- viewport（スマホ前提の表示設定） ----
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
    <html
      lang="ja"
      className={`${manrope.variable} ${bodoni.variable}`}
    >
      <body className="min-h-screen bg-background text-text-main antialiased">
        <GoogleAnalytics />
        {/* グローバルの大気メッシュ（Tiffany系グラデーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-site" />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />

            {/* ページ本体 */}
            <div className="flex-1 pt-16 lg:pt-20">{children}</div>

            {/* モバイル用ボトムナビ */}
            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
