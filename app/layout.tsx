// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Insight Hub",
  description: "新車情報と技術解説をまとめたクルマ特化サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-gray-100">
        <header className="border-b border-gray-800 bg-black/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div className="text-sm font-semibold tracking-wide text-gray-300">
              Car Insight Hub
            </div>
            <nav className="flex gap-4 text-xs text-gray-400">
              <a href="/" className="hover:text-white">
                ホーム
              </a>
              <a href="/cars" className="hover:text-white">
                車種一覧
              </a>
              <a href="/news" className="hover:text-white">
                ニュース
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
