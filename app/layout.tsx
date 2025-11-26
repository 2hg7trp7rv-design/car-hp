// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

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
      <body className="min-h-screen bg-slate-50 text-text-main antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <BottomNav />
        </div>
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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold tracking-[0.18em] text-white">
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

        {/* 右: グローバルナビ（モバイルでは非表示） */}
        <nav className="hidden items-center gap-5 text-[11px] font-medium tracking-[0.18em] text-slate-700 sm:flex">
          <NavLink href="/news" label="NEWS" />
          <NavLink href="/cars" label="CARS" />
          <NavLink href="/column" label="COLUMN" />
          <NavLink href="/guide" label="GUIDE" />
          <NavLink href="/heritage" label="HERITAGE" />
        </nav>
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
      className="relative inline-flex items-center px-1 py-1 transition hover:text-slate-900"
    >
      <span>{label}</span>
      <span className="absolute inset-x-0 -bottom-0.5 h-[1px] scale-x-0 bg-slate-900 transition group-hover:scale-x-100" />
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 text-[11px] text-text-sub">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="tracking-[0.16em] text-slate-500">
          © {new Date().getFullYear()} CAR BOUTIQUE
        </p>
        <p className="text-[10px] leading-relaxed text-slate-500">
          ニュースの先にあるオーナーの物語と、クルマとの現実的な付き合い方を
          そっと整理していく個人プロジェクトです。
        </p>
      </div>
    </footer>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-1.5 text-[10px] text-slate-700 shadow-soft-card backdrop-blur sm:hidden">
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

type BottomNavLinkProps = {
  href: string;
  label: string;
};

function BottomNavLink({ href, label }: BottomNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 transition active:bg-slate-100/80"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span className="text-[9px] tracking-[0.16em] text-slate-700">{label}</span>
    </Link>
  );
}
