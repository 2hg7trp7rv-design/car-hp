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

type BottomNavLinkProps = {
  href: string;
  label: string;
};

function BottomNavLink({ href, label }: BottomNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 transition active:bg-slate-100/80"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span className="text-[9px] tracking-[0.16em] text-slate-700">
        {label}
      </span>
    </Link>
  );
}

/**
 * PCではヘッダー+フッター、モバイルでは専用ボトムナビも併用。
 * 「スマホメイン」の想定なので、ボトムナビは sm 以上で非表示にしている。
 */
function InlineBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 py-1 text-[10px] text-slate-600 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1 px-3">
        <BottomNavLink href="/" label="HOME" />
        <BottomNavLink href="/news" label="NEWS" />
        <BottomNavLink href="/cars" label="CARS" />
        <BottomNavLink href="/column" label="COLUMN" />
        <BottomNavLink href="/guide" label="GUIDE" />
      </div>
    </nav>
  );
}

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

          {/* モバイル用ボトムナビ（既存+フォールバック） */}
          <div className="sm:hidden">
            <MobileBottomNav />
            <InlineBottomNav />
          </div>
        </SmoothScrollProvider>

        {/* 🔍 Pro プランで使える計測系（レイアウトには影響しない） */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
