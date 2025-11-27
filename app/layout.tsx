// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

type RootLayoutProps = {
  children: React.ReactNode;
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
 * Cloudflare / Vercel 双方で確実に動くよう、このファイル内にも
 * シンプルな BottomNav を定義しておく。
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
    <html lang="ja">
      {/*
        ※ next/font / Bodoni Moda をここで一切使わないことで
           「Failed to find font override values for font `Bodoni Moda`」
           エラーを根本的に回避しています。
           フォント指定は globals.css / Tailwind 側の font-family で行う想定。
      */}
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(186,230,253,0.55),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(125,211,252,0.4),_transparent_60%),radial-gradient(circle_at_top_left,_rgba(56,189,248,0.35),_transparent_60%),#f8fafc] text-slate-900 antialiased">
        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 pb-20 pt-10 sm:pb-24 sm:pt-16">
              {children}
            </main>
            <SiteFooter />
          </div>

          {/* モバイル用ボトムナビ（既存コンポーネントを優先、フォールバックでインライン実装） */}
          <div className="sm:hidden">
            <MobileBottomNav />
            {/* もし MobileBottomNav 内部実装が空でも、最低限の導線を維持 */}
            <InlineBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
