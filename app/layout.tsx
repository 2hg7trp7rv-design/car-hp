// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Manrope, Bodoni_Moda } from "next/font/google";

import "./globals.css";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";

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

// ---- サイト全体のメタデータ ----
export const metadata: Metadata = {
  title: {
    default: "CAR BOUTIQUE | クルマのニュースとストーリー",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "輸入車・国産車のニュースと本音レビューを届けるCAR BOUTIQUE。維持費やトラブル、買い方・売り方まで、大人のクルマ好きが知りたい情報を静かなブティックのような世界観でお届けします。",
  metadataBase: new URL("https://car-hp.vercel.app"),

  // OGP / SNS 用
  openGraph: {
    type: "website",
    url: "https://car-hp.vercel.app",
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
        {/* グローバルの大気メッシュ（Tiffany系グラデーション） */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-site" />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />

            <div className="flex-1 pt-16 lg:pt-20">{children}</div>

            {/* モバイル用ボトムナビ */}
            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
