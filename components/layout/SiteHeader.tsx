"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/news", label: "NEWS" },
  { href: "/cars", label: "CARS" },
  { href: "/column", label: "COLUMN" },
  { href: "/guide", label: "GUIDE" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    // ルートが変わったらモバイルメニューを閉じる
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex justify-center",
        "pointer-events-none",
      )}
    >
      <div className="pointer-events-auto mt-3 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative flex items-center justify-between gap-4 rounded-full border bg-white/65 px-4 py-2.5 text-[11px] shadow-glass-edge backdrop-blur-xl transition-all duration-300",
            isScrolled
              ? "border-white/60 shadow-soft-glow"
              : "border-white/40 shadow-soft",
          )}
        >
          {/* 左：ロゴ / サイト名 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold tracking-[0.28em] text-slate-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-tiffany-50 text-[11px] font-bold text-tiffany-600 shadow-glass-inner">
              CB
            </span>
            <span className="hidden sm:inline">
              CAR&nbsp;BOUTIQUE
            </span>
          </Link>

          {/* 中央：ナビ（PC） */}
          <nav className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors",
                    active
                      ? "text-slate-900"
                      : "text-slate-400 hover:text-slate-800",
                  )}
                >
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "absolute -bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-tiffany-400/90 transition-all duration-300",
                      active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* 右：CTA + メニュー */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* PC: CTA */}
            <div className="hidden items-center gap-2 md:flex">
              <Button
                asChild
                variant="glass"
                size="sm"
                magnetic
                className="px-4"
              >
                <Link href="/cars">OPEN CARS DB</Link>
              </Button>
              <Button
                asChild
                variant="subtle"
                size="sm"
                className="px-4"
              >
                <Link href="/column">COLUMN &amp; GUIDE</Link>
              </Button>
            </div>

            {/* モバイル: メニューアイコン */}
            <button
              type="button"
              aria-label="メニュー"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-700 shadow-soft transition hover:border-tiffany-300 hover:text-tiffany-600 md:hidden",
              )}
            >
              <span
                className={cn(
                  "block h-[1px] w-4 origin-center transform bg-current transition-all duration-200",
                  open ? "translate-y-[3px] rotate-45" : "-translate-y-[3px]",
                )}
              />
              <span
                className={cn(
                  "block h-[1px] w-4 bg-current transition-all duration-200",
                  open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-70",
                )}
              />
              <span
                className={cn(
                  "block h-[1px] w-4 origin-center transform bg-current transition-all duration-200",
                  open ? "-translate-y-[3px] -rotate-45" : "translate-y-[3px]",
                )}
              />
            </button>
          </div>

          {/* モバイル：ドロップダウンメニュー */}
          <div
            className={cn(
              "absolute left-0 right-0 top-full mt-2 origin-top rounded-3xl border border-slate-200/80 bg-white/95 p-3 text-[11px] text-slate-700 shadow-soft-card backdrop-blur-xl transition-all duration-200 md:hidden",
              open
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <nav className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-2 transition",
                      active
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-100",
                    )}
                  >
                    <span className="font-semibold tracking-[0.2em]">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {active ? "CURRENT" : "OPEN"}
                    </span>
                  </Link>
                );
              })}
              <div className="mt-2 flex gap-2">
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <Link href="/cars">CARS DB</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Link href="/guide">GUIDE</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
