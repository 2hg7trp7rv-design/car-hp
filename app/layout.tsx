// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";

import "./globals.css";
import { getSiteOrigin, getSiteUrl } from "@/lib/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { fontVariables } from "./fonts";

// NOTE:
// 固定ヘッダーを廃止し、右上のハンバーガーのみで全ページを回遊させる。

const BRAND = "CAR BOUTIQUE JOURNAL";
const BRAND_DESC =
  "Cars / Guides / Columns / Heritage を横断し、維持費・故障・相場まで判断材料を整理しながら、時代の文脈として保存するアーカイブ。";

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
    // それでも抜けが出た時に SERP の意味が通るよう、default も “ブランドとして成立する” 文言に寄せる。
    default: BRAND,
    template: `%s | ${BRAND}`,
  },
  description: BRAND_DESC,
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    siteName: BRAND,
    title: BRAND,
    description: BRAND_DESC,
    images: [
      {
        url: "/ogp-default.jpg",
        width: 1200,
        height: 630,
        alt: BRAND,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND,
    description: BRAND_DESC,
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
  name: BRAND,
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
  name: BRAND,
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/icon-512x512.png`,
};

type RootLayoutProps = {
  children: ReactNode;
};

// ---- ルートレイアウト ----
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={`${fontVariables} cb-mono`}>
      {/*
        Site-wide canvas (temporary):
        - Requested: 全ページを白背景 / 黒文字（モノクロ）
        - To revert: remove `cb-mono` from <html> and restore the dark stage body classes.
      */}
      <body className="font-sans bg-white text-black antialiased overflow-x-hidden">
        <a href="#cb-main" className="cb-skip-link">本文へスキップ</a>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <PageViewTracker />
          <ConsentBanner />
        </Suspense>
        {/* Schema.org: WebSite / Organization */}
        <JsonLd id="jsonld-website" data={WEBSITE_JSON_LD} />
        <JsonLd id="jsonld-organization" data={ORGANIZATION_JSON_LD} />

        {/* 右上固定：ハンバーガー（固定ヘッダーの代替） */}
        <HamburgerMenu />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            {/* ページ本体（固定ヘッダーは無いので上部paddingは足さない） */}
            <div id="cb-main" tabIndex={-1} className="flex-1">{children}</div>

            <SiteFooter />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
