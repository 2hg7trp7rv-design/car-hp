// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE",
  description:
    "車のニュース、オーナーコラム、買い方ガイド、車種データベースを揃えた大人のクルマメディア「CAR BOUTIQUE」。",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body
        className={cn(
          "min-h-screen bg-body font-sans antialiased",
          inter.className,
        )}
      >
        <SiteHeader />

        {/* ボトムナビ分の余白を確保するためにmainにpb-20を付与 */}
        <main className="pb-20">{children}</main>

        {/* スマホ専用ボトムナビ（lg以上ではBottomNav側のクラスで非表示） */}
        <BottomNav />
      </body>
    </html>
  );
}
