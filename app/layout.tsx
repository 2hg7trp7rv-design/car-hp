// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新車情報ダッシュボード",
  description: "新車情報・新機能・改善点と比較をまとめた個人用ポータル",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
