// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const year = new Date().getFullYear();

  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          {/* ヘッダー */}
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="text-[11px] font-semibold tracking-[0.32em] text-slate-900"
              >
                CAR BOUTIQUE
              </Link>

              {/* PCナビ */}
              <nav className="hidden items-center gap-5 text-[11px] text-text-sub sm:flex">
                <Link href="/news" className="hover:text-slate-900">
                  NEWS
                </Link>
                <Link href="/column" className="hover:text-slate-900">
                  COLUMN
                </Link>
                <Link href="/guide" className="hover:text-slate-900">
                  GUIDE
                </Link>
                <Link href="/cars" className="hover:text-slate-900">
                  CARS
                </Link>
                <Link href="/heritage" className="hover:text-slate-900">
                  HERITAGE
                </Link>
              </nav>
            </div>
          </header>

          {/* メイン */}
          <main className="flex-1 pb-16">{children}</main>

          {/* PCフッター */}
          <footer className="hidden border-t border-slate-200 bg-white/90 text-[11px] text-text-sub sm:block">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <p>© {year} CAR BOUTIQUE</p>
              <p className="text-[10px]">
                NEWSの出典は各メーカー公式サイトおよび外部メディアの記事です。
              </p>
            </div>
          </footer>

          {/* モバイル用ボトムナビ */}
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}
