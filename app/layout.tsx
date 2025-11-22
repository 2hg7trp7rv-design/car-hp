// app/layout.tsx
import type { Metadata } from "next";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = await getSearchIndex();

  return (
    <html lang="ja" className={`${cormorant.variable} ${shippori.variable}`}>
      <body className="font-serif text-slate-700 antialiased min-h-screen bg-white selection:bg-[#0ABAB5] selection:text-white">
        <GlobalSearch searchIndex={searchIndex} />
        {children}
      </body>
    </html>
  );
}
