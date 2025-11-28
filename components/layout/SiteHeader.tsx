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
  { href: "/news", label: "NEWS", subLabel: "アップデート" },
  { href: "/cars", label: "CARS", subLabel: "車種データベース" },
  { href: "/column", label: "COLUMN", subLabel: "技術・メンテナンス" },
  { href: "/guide", label: "GUIDE", subLabel: "お金と手放し方" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // ルート切り替えでモバイルメニューを閉じる
    setOpen(false);
  }, [pathname]);

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
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 transition-all duration-300 sm:px-6 lg:px-8",
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
              CAR BOUTIQUE
            </span>
            <span className="mt-[2px] text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
              News · Columns · Database
            </span>
          </div>
        </Link>

        {/* PCナビゲーション */}
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
                      active ? "scale-x-100 bg-tiffany-400" : "scale-x-0 group-hover:scale-x-100",
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

        {/* モバイルハンバーガー */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[
            "relative flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/70 text-slate-800 shadow-soft backdrop-blur sm:hidden",
            open ? "shadow-soft-strong" : "",
          ].join(" ")}
          aria-label="メニューを開く"
        >
          <span className="sr-only">Toggle navigation</span>
          <span
            className={[
              "block h-[1px] w-4 transform rounded-full bg-slate-700 transition-transform duration-200",
              open ? "translate-y-[3px] rotate-45" : "-translate-y-[3px]",
            ].join(" ")}
          />
          <span
            className={[
              "absolute block h-[1px] w-4 rounded-full bg-slate-700 transition-all duration-200",
              open ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />
          <span
            className={[
              "block h-[1px] w-4 transform rounded-full bg-slate-700 transition-transform duration-200",
              open ? "-translate-y-[3px] -rotate-45" : "translate-y-[3px]",
            ].join(" ")}
          />
        </button>
      </div>

      {/* ガラスの下地：スクロール時に少し濃くなる */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0 top-0 -z-20 h-[68px] bg-gradient-to-b from-white/70 via-white/40 to-transparent backdrop-blur-xl transition-all duration-300 sm:h-[76px]",
          scrolled ? "from-white/85 via-white/70" : "",
        ].join(" ")}
      />

      {/* モバイルメニュー */}
      <div
        className={[
          "sm:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto mt-1 w-full max-w-6xl px-4 transition-transform duration-300 sm:px-6 lg:px-8",
            open ? "translate-y-0" : "-translate-y-2",
          ].join(" ")}
        >
          <div className="rounded-3xl border border-white/70 bg-white/90 p-3 text-[11px] text-slate-700 shadow-soft-glow backdrop-blur-xl">
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname ?? "", item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center justify-between rounded-2xl px-3 py-2 transition-colors",
                      active
                        ? "bg-tiffany-50/80 text-slate-900"
                        : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold tracking-[0.18em]">
                        {item.label}
                      </span>
                      {item.subLabel && (
                        <span className="text-[10px] text-slate-400">
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/cars" className="flex-1">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-[10px] tracking-[0.16em]"
                >
                  車種一覧を開く
                </Button>
              </Link>
              <Link href="/guide" className="flex-[0.9]">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-200/80 bg-white text-[10px] tracking-[0.16em]"
                >
                  GUIDE を読む
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
