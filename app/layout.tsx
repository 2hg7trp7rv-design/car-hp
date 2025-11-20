// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Car Insight Hub",
  description: "新型車と装備の違いにフォーカスしたクルマ情報サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-black/60 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-sm font-semibold tracking-wide">
                <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs text-sky-300">
                  beta
                </span>
                <span className="ml-2 align-middle">Car Insight Hub</span>
              </Link>
              <nav className="flex gap-6 text-xs text-slate-300">
                <Link href="/" className="hover:text-white">
                  ホーム
                </Link>
                <Link href="/cars" className="hover:text-white">
                  車種一覧
                </Link>
                <Link href="/news" className="hover:text-white">
                  ニュース
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
