// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Shippori_Mincho } from "next/font/google";

import "./globals.css";
import GlobalSearch from "@/components/GlobalSearch";
import { getSearchIndex } from "@/lib/news";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | Driving Elegance",
  description: "車のニュースと、その先にある物語を。",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const searchIndex = await getSearchIndex();

  return (
    <html lang="ja" className={`${cormorant.variable} ${shippori.variable}`}>
      <body className="font-serif text-slate-700 antialiased min-h-screen bg-white selection:bg-[#0ABAB5] selection:text-white">
        {/* グローバル検索モーダル */}
        <GlobalSearch searchIndex={searchIndex} />

        <div className="min-h-screen flex flex-col">
          {/* 共通ヘッダー */}
          <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              {/* ロゴ */}
              <Link href="/" className="flex items-baseline gap-2">
                <span className="text-[11px] tracking-[0.25em] text-slate-700">
                  CAR BOUTIQUE
                </span>
                <span className="hidden text-[11px] text-slate-400 sm:inline">
                  Driving Elegance
                </span>
              </Link>

              {/* ナビゲーション（PC） */}
              <nav className="hidden items-center gap-5 text-[11px] tracking-[0.18em] uppercase text-slate-500 sm:flex">
                <Link href="/news" className="hover:text-slate-900">
                  News
                </Link>
                <Link href="/cars" className="hover:text-slate-900">
                  Cars
                </Link>
                <Link href="/heritage" className="hover:text-slate-900">
                  Heritage
                </Link>
                <Link href="/reviews" className="hover:text-slate-900">
                  Reviews
                </Link>
                <Link href="/tech" className="hover:text-slate-900">
                  Tech
                </Link>
                <Link href="/used" className="hover:text-slate-900">
                  Used
                </Link>
              </nav>

              {/* モバイル用ナビ（横スクロール） */}
              <nav className="flex items-center gap-3 text-[10px] text-slate-500 sm:hidden overflow-x-auto">
                <Link
                  href="/news"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  News
                </Link>
                <Link
                  href="/cars"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  Cars
                </Link>
                <Link
                  href="/heritage"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  Heritage
                </Link>
                <Link
                  href="/reviews"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  Reviews
                </Link>
                <Link
                  href="/tech"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  Tech
                </Link>
                <Link
                  href="/used"
                  className="whitespace-nowrap hover:text-slate-900"
                >
                  Used
                </Link>
              </nav>
            </div>
          </header>

          {/* ページ本体 */}
          <main className="flex-1">{children}</main>

          {/* フッター */}
          <footer className="border-t border-slate-100 bg-white/80">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-[10px] text-slate-400">
              <span>© {new Date().getFullYear()} CAR BOUTIQUE</span>
              <span className="hidden sm:inline">
                Driving Elegance for Car Enthusiasts
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
