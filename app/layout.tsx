// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

import { Manrope, Bodoni_Moda } from "next/font/google";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { MobileBottomNav } from "@/components/MobileBottomNav";

// 🔍 Vercel Analytics / Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

export const metadata: Metadata = {
  title: {
    default: "CAR BOUTIQUE | クルマのニュースとストーリー",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  metadataBase: new URL("https://car-hp.vercel.app"),
  openGraph: {
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
    type: "website",
    url: "https://car-hp.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  },
  // Google Search Console 用サイト確認タグ
  verification: {
    google: "fPw-nBgPqDkI8ogL5QrdlKHKi-80KOsN_65_s_0Lz08",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/80 py-6 text-[10px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="tracking-[0.16em]">
            © {new Date().getFullYear()} CAR BOUTIQUE
          </p>
          <p className="max-w-md leading-relaxed tracking-[0.03em]">
            クルマのニュース コラム 車種データを個人目線で整理している小さなサイト
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] tracking-[0.08em]">
          <Link
            href="/legal/privacy"
            className="transition hover:text-slate-700"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/legal/disclaimer"
            className="transition hover:text-slate-700"
          >
            免責事項
          </Link>
          <Link
            href="/legal/copyright"
            className="transition hover:text-slate-700"
          >
            著作権・引用ポリシー
          </Link>
          <Link
            href="/legal/about"
            className="transition hover:text-slate-700"
          >
            運営者情報
          </Link>
          <Link
            href="/contact"
            className="transition hover:text-slate-700"
          >
            お問い合わせ
          </Link>
        </nav>
      </div>
    </footer>
  );
}

/**
 * PCではヘッダー+フッター、モバイルでは MobileBottomNav を使用。
 * 「スマホメイン」の想定なので、ボトムナビは sm 以上で非表示。
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ja"
      className={`${manrope.variable} ${bodoni.variable}`}
    >
      <body className="min-h-screen bg-site text-text-main antialiased">
        <SmoothScrollProvider>
          {/* グローバル背景メッシュレイヤー */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            {/* ベースの縦グラデーション */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-site" />
            {/* Tiffany の光（右上） */}
            <div className="absolute -top-[18%] -right-[10%] h-[46vw] w-[46vw] rounded-full bg-tiffany-100/40 blur-[100px]" />
            {/* Slate 系の空気感（左中） */}
            <div className="absolute top-[40%] -left-[20%] h-[40vw] w-[40vw] rounded-full bg-slate-200/45 blur-[110px]" />
            {/* 下側の淡い Tiffany */}
            <div className="absolute bottom-[-15%] right-[5%] h-[32vw] w-[32vw] rounded-full bg-tiffany-50/45 blur-[120px]" />
          </div>

          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            {/* スマホ前提だけど、一応PCで見ても崩れないようにしてある */}
            <main className="flex-1 pb-20 pt-10 sm:pb-24 sm:pt-16">
              {children}
            </main>
            <SiteFooter />
          </div>

          {/* モバイル用ボトムナビ */}
          <div className="sm:hidden">
            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>

        {/* Pro プラン計測系 */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
