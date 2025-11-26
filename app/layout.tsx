import "./globals.css";
import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google"; // [5, 6]
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";

// Variable Fontの設定
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  // オプティカルサイジング（文字サイズに応じた太さ調整）を有効化
  axes: ["opsz"], 
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description: "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-site text-obsidian antialiased selection:bg-tiffany-100 selection:text-tiffany-700">
        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col">
            {/* ヘッダー等は既存のコンポーネントを使用 */}
            <SiteHeader /> 
            <main className="flex-1 pb-16 pt-4 sm:pt-8 lg:pt-10">
              {children}
            </main>
            <SiteFooter />
            <BottomNav />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}


function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[11px] text-text-sub sm:px-6 lg:px-8">
        {/* 左: ロゴテキスト */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-tiffany-300 to-tiffany-500 text-[10px] font-semibold tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(15,23,42,0.45)]">
            CB
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-900">
              CAR BOUTIQUE
            </span>
            <span className="text-[10px] tracking-[0.16em] text-slate-500">
              NEWS / COLUMN / GUIDE / CARS
            </span>
          </div>
        </Link>

        {/* 右: PCナビ */}
        <nav className="hidden items-center gap-5 text-[11px] font-medium tracking-[0.18em] text-slate-700 sm:flex">
          <NavLink href="/news" label="NEWS" />
          <NavLink href="/cars" label="CARS" />
          <NavLink href="/column" label="COLUMN" />
          <NavLink href="/guide" label="GUIDE" />
          <NavLink href="/heritage" label="HERITAGE" />
        </nav>

        {/* 右: モバイルのマグネティックボタン */}
        <div className="flex items-center sm:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

type NavLinkProps = {
  href: string;
  label: string;
};

function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="relative px-1 py-0.5 text-[11px] tracking-[0.18em] text-slate-600 transition hover:text-slate-900"
    >
      {label}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/80 py-6 text-[10px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="tracking-[0.16em]">
          © {new Date().getFullYear()} CAR BOUTIQUE
        </p>
        <p className="max-w-md leading-relaxed tracking-[0.03em]">
          派手さよりも、静かで上質なクルマ時間を大切にするための小さなデジタルブティックです。
        </p>
      </div>
    </footer>
  );
}

type BottomNavLinkProps = {
  href: string;
  label: string;
};

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 px-3 py-2 text-[10px] text-slate-700 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1">
        <BottomNavLink href="/" label="HOME" />
        <BottomNavLink href="/news" label="NEWS" />
        <BottomNavLink href="/cars" label="CARS" />
        <BottomNavLink href="/column" label="COLUMN" />
        <BottomNavLink href="/guide" label="GUIDE" />
      </div>
    </nav>
  );
}

function BottomNavLink({ href, label }: BottomNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 transition active:bg-slate-100/80"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span className="text-[9px] tracking-[0.16em] text-slate-700">
        {label}
      </span>
    </Link>
  );
}
