// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      {/* 
        Font:
        - ベースは globals.css で定義した --font-sans / --font-serif を使用
        - body には font-sans を敷いて、見出し側で font-serif を個別指定する方針
      */}
      <body className="min-h-screen bg-transparent font-sans text-text-main antialiased">
        <SmoothScrollProvider>
          {/* Tiffany × White の radial / mesh 背景レイヤー */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            {/* ベース：白 60%, Tiffany 40% を意識したラジアル */}
            <div className="absolute inset-0 bg-gradient-radial from-white via-white to-tiffany-50" />

            {/* Mesh 的な “光だまり” を Tiffany で追加 */}
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-tiffany-200/75 blur-3xl" />
            <div className="absolute right-[-60px] top-32 h-80 w-80 rounded-full bg-tiffany-300/65 blur-3xl" />
            <div className="absolute bottom-[-80px] left-10 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
          </div>

          {/* コンテンツレイヤー */}
          <div className="relative z-10 flex min-h-screen flex-col">
            {/* 上部固定ヘッダー（ガラス調は SiteHeader 側で制御） */}
            <SiteHeader />

            {/* メインコンテンツ */}
            <main className="flex-1">
              {children}
            </main>

            {/* モバイル専用のボトムナビ */}
            <div className="block md:hidden">
              <MobileBottomNav />
            </div>
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
