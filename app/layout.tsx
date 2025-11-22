// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAR BOUTIQUE",
  description: "静かなトーンで愉しむクルマメディア",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={
          inter.className +
          " min-h-screen bg-gradient-to-r from-[#d6f5f1] via-[#ecf9fb] to-white"
        }
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
