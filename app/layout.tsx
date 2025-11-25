// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-site text-slate-900 antialiased">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-100/60 bg-white/70 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-[11px] text-slate-500 sm:px-6 lg:px-8">
              <p className="font-body-light tracking-[0.18em]">
                CAR BOUTIQUE
              </p>
              <p className="text-[10px]">
                © {new Date().getFullYear()} CAR BOUTIQUE
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
