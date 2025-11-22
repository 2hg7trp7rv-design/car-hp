// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Shippori_Mincho } from "next/font/google";
import "./globals.css";

// 追加
import GlobalSearch from "@/components/GlobalSearch";
import { getSearchIndex } from "@/lib/news";

// 英語見出し用のエレガントなセリフ体
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

// 日本語本文用の美しい明朝体
const shippori = Shippori_Mincho({
  subsets: ["latin"], // Next.jsの仕様上latin指定でOK（日本語は自動ロード）
  weight: ["400", "500", "700"],
  variable: "--font-shippori",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | Driving Elegance",
  description: "車のニュースと、その先にある物語を。",
};

// RootLayoutをasyncに変更して、searchIndexを取得
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = await getSearchIndex();

  return (
    <html lang="ja" className={`${cormorant.variable} ${shippori.variable}`}>
      <body className="font-serif text-slate-700 antialiased min-h-screen bg-white selection:bg-[#0ABAB5] selection:text-white">
        {/* グローバル検索（Cmd+K / Ctrl+Kで開く） */}
        <GlobalSearch searchIndex={searchIndex} />
        {children}
      </body>
    </html>
  );
}
