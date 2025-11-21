// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CAR BOUTIQUE | 静かなトーンのクルマメディア",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "ティファニーのようなやわらかなブルーをアクセントに、静かなトーンでクルマのニュースや試乗記、技術解説、中古車情報を届けるカーサイト。",
  openGraph: {
    title: "CAR BOUTIQUE | 静かなトーンのクルマメディア",
    description:
      "ティファニーのようなやわらかなブルーをアクセントに、静かなトーンでクルマのニュースや試乗記、技術解説、中古車情報を届けるカーサイト。",
    url: "https://car-hp.vercel.app",
    siteName: "CAR BOUTIQUE",
    locale: "ja_JP",
    type: "website",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} bg-neutral-50 text-neutral-900 text-[13px]`}
      >
        <div className="flex min-h-screen flex-col">
          {/* グローバルヘッダー */}
          <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="text-[11px] font-semibold tracking-[0.32em] text-sky-700"
              >
                CAR BOUTIQUE
              </Link>
              <nav className="flex flex-wrap gap-3 text-[11px] text-neutral-700">
                <Link href="/news" className="hover:text-sky-700">
                  News
                </Link>
                <Link href="/reviews" className="hover:text-sky-700">
                  Drive Note
                </Link>
                <Link href="/tech" className="hover:text-sky-700">
                  Tech
                </Link>
                <Link href="/used" className="hover:text-sky-700">
                  Used
                </Link>
                <Link href="/heritage" className="hover:text-sky-700">
                  Heritage
                </Link>
              </nav>
            </div>
          </header>

          {/* ページ本体 */}
          <main className="flex-1">{children}</main>

          {/* フッター */}
          <footer className="border-t border-neutral-200 bg-white/80">
            <div className="mx-auto max-w-6xl px-4 py-4 text-[11px] text-neutral-500 sm:px-6 lg:px-8">
              <p>© 2025 CAR BOUTIQUE</p>
              <p className="mt-1 text-neutral-400">
                シンプルな余白に、少しだけティファニーブルーを添えて。
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
