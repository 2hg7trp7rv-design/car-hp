// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

import { Manrope, Bodoni_Moda } from "next/font/google";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { MobileBottomNav } from "@/components/MobileBottomNav";

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
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
  metadataBase: new URL("https://car-hp.vercel.app"),
  openGraph: {
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
    type: "website",
    url: "https://car-hp.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/80 py-6 text-[10px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="tracking-[0.16em]">
          © {new Date().getFullYear()} CAR BOUTIQUE
        </p>
        <p className="max-w-md leading-relaxed tracking-[0.03em]">
          派手さよりも、静かで上質なクルマ時間を大切にするための小さなデジタルブティックです。
        </p>
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
 * PCではヘッダー + フッター、モバイルでは専用ボトムナビも併用。
 * 既存の MobileBottomNav コンポーネントがあるが、
 * 万一中身が空でも最低限の導線を維持するためのフォールバックナビ。
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
      {/* 
        Manrope / Bodoni Moda を CSS 変数として付与。
        Tailwind 側で var(--font-manrope), var(--font-bodoni) を
        font-family にマップして使う前提。
      */}
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
            <main className="flex-1 pb-20 pt-10 sm:pb-24 sm:pt-16">
              {children}
            </main>
            <SiteFooter />
          </div>

          {/* モバイル用ボトムナビ（既存 + フォールバック） */}
          <div className="sm:hidden">
            <MobileBottomNav />
            <InlineBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
