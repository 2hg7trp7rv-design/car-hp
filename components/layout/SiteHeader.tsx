// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  subLabel?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/cars", label: "CARS", subLabel: "車種データベース" },
  { href: "/news", label: "NEWS", subLabel: "公式アップデート" },
  { href: "/column", label: "COLUMN", subLabel: "技術・メンテナンス" },
  { href: "/guide", label: "GUIDE", subLabel: "お金と手放し方" },
  { href: "/heritage", label: "HERITAGE", subLabel: "ヒストリー" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* 背景の“光”レイヤー：ヘッダー専用 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.28),_transparent_70%)] blur-3xl" />
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.32),_transparent_72%)] blur-3xl" />
      </div>

      {/* メインバー */}
      <div
        className={[
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "py-2" : "py-3",
        ].join(" ")}
      >
        {/* ブランドロゴ */}
        <Link
          href="/"
          className="group relative flex items-center gap-2 rounded-full"
        >
          {/* 小さな Tiffany の光点 */}
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute h-7 w-7 rounded-full bg-white/40 shadow-glass-inner" />
            <span className="relative h-2 w-2 rounded-full bg-gradient-to-br from-tiffany-300 via-tiffany-500 to-tiffany-600 shadow-glow" />
          </span>

          <div className="flex flex-col leading-none">
            <span className="serif-heading text-[15px] tracking-[0.26em] text-slate-900">
              CAR BOUTIQUE JOURNAL
            </span>
            <span className="mt-[2px] text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Columns · Database · Guide · Heritage
            </span>
          </div>
        </Link>

        {/* PCナビゲーション（モバイルでは非表示） */}
        <nav className="hidden items-center gap-4 text-[10px] font-semibold tracking-[0.22em] text-slate-600 sm:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname ?? "", item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group relative inline-flex flex-col items-start rounded-full px-3 py-1.5 transition-colors",
                  active
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
              >
                <span className="flex items-center gap-1">
                  <span>{item.label}</span>
                  <span
                    className={[
                      "h-[1px] w-4 origin-left rounded-full bg-slate-300 transition-transform duration-300",
                      active
                        ? "scale-x-100 bg-tiffany-400"
                        : "scale-x-0 group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </span>
                {item.subLabel && (
                  <span className="mt-1 text-[9px] font-normal tracking-[0.05em] text-slate-400">
                    {item.subLabel}
                  </span>
                )}
              </Link>
            );
          })}

          

          


          {/* 目的から探す（START） */}
          <Link href="/start">
            <Button
              variant="glass"
              size="sm"
              magnetic
              className="border-tiffany-500/30 bg-white/35 text-[10px] font-semibold tracking-[0.18em] text-slate-900 shadow-soft-glow backdrop-blur-lg hover:bg-white/70"
            >
              START
            </Button>
          </Link>

          {/* ショートカットボタン：CARSへ */}
          <Link href="/cars">
            <Button
              variant="glass"
              size="sm"
              magnetic
              className="hidden border-tiffany-500/40 bg-white/40 text-[10px] font-semibold tracking-[0.18em] text-slate-900 shadow-soft-glow backdrop-blur-lg hover:bg-white/70 lg:inline-flex"
            >
              OPEN CAR LIST
            </Button>
          </Link>
        </nav>

        {/* モバイル：STARTのみ表示 */}
        <div className="flex items-center sm:hidden">
          <Link href="/start">
            <Button
              variant="outline"
              size="sm"
              magnetic
              className="border-slate-300/70 bg-white/90 text-[10px] font-semibold tracking-[0.18em] text-slate-900 shadow-soft backdrop-blur-lg hover:bg-white"
            >
              START
            </Button>
          </Link>

        </div>
      </div>

      {/* ガラスの下地：スクロール時に少し濃くなる */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0 top-0 -z-20 h-[68px] bg-gradient-to-b from-white/70 via-white/40 to-transparent backdrop-blur-xl transition-all duration-300 sm:h-[76px]",
          scrolled ? "from-white/85 via-white/70" : "",
        ].join(" ")}
      />
    </header>
  );
}

export default SiteHeader;
