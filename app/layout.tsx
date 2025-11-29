// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

import { Manrope, Bodoni_Moda } from "next/font/google";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { MobileBottomNav } from "@/components/MobileBottomNav";

// ---- フォント設定（next/font） ----
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  display: "swap",
});

// ---- メタデータ ----
export const metadata: Metadata = {
  title: {
    default: "CAR BOUTIQUE | クルマのニュースとストーリー",
    template: "%s | CAR BOUTIQUE",
  },
  description:
    "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  metadataBase: new URL("https://car-hp.vercel.app"),
  openGraph: {
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
    type: "website",
    url: "https://car-hp.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/80 py-6 text-[10px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="tracking-[0.16em]">
          © {new Date().getFullYear()} CAR BOUTIQUE
        </p>
        <p className="max-w-md leading-relaxed tracking-[0.03em]">
          クルマを検討するときに
          あとで見返せるメモ置き場のような位置づけ
        </p>
      </div>
    </footer>
  );
}

type BottomNavLinkProps = {
  href: string;
  label: string;
};

function BottomNavLink({ href, label }: BottomNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium tracking-[0.18em] text-slate-500 transition hover:bg-slate-100/80"
    >
      <span className="h-[2px] w-4 rounded-full bg-slate-300" />
      <span>{label}</span>
    </Link>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={`${manrope.variable} ${bodoni.variable}`}>
      <body className="min-h-screen bg-ice-vapor font-sans antialiased">
        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />

            <div className="flex-1 pb-16 sm:pb-0">{children}</div>

            <SiteFooter />

            <MobileBottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
