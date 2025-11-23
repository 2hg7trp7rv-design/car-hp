// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_JP, Cinzel } from "next/font/google";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["300", "400", "500", "700"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CAR BOUTIQUE",
  description:
    "車のニュースと、その先にある物語を静かに味わうためのカーライフメディア。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${cinzel.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
