import type { Metadata } from "next";
import { Cormorant_Garamond, Shippori_Mincho } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${shippori.variable}`}>
      {/* body全体に明朝体を適用。
        Tailwindのfont-serifが効くように、変数をCSS変数として渡しています。
      */}
      <body className={`font-serif text-slate-700 antialiased min-h-screen bg-white selection:bg-[#0ABAB5] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
