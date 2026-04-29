// components/home/HomeNavDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItemKey = "cars" | "column" | "guide" | "heritage";

const NAV_ITEMS: {
  key: NavItemKey;
  href: string;
  label: string;
  subLabel: string;
}[] = [
  { key: "cars", href: "/cars", label: "車種", subLabel: "車種から探す" },
  { key: "column", href: "/column", label: "視点", subLabel: "トラブル・メンテナンス" },
  { key: "guide", href: "/guide", label: "実用", subLabel: "お金と手放し方" },
  { key: "heritage", href: "/heritage", label: "系譜", subLabel: "ブランドと歴史" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export default function HomeNavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="メインメニューを開閉"
        aria-expanded={open}
        className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.94)] text-[var(--text-primary)] shadow-soft-card transition-transform duration-300 hover:-translate-y-[1px] sm:right-6 sm:top-6"
      >
        <span className="relative block h-4 w-5">
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-[var(--text-primary)] transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-[var(--text-primary)] transition-all duration-300",
              open ? "top-1/2 -translate-y-1/2 opacity-0" : "top-1/2 -translate-y-1/2 opacity-70",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-[var(--text-primary)] transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
            )}
          />
        </span>
      </button>

      {open && (
        <button
          type="button"
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-[45] bg-[rgba(14,12,10,0.16)] backdrop-blur-[1px]"
        />
      )}

      <div
        className={cn(
          "fixed inset-x-4 bottom-6 z-50 mx-auto max-w-xl transition-all duration-300 ease-out md:bottom-10",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-hidden={!open}
      >
        <GlassCard
          padding="lg"
          className="w-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.98)]"
        >
          <div className="space-y-6 text-[var(--text-secondary)]">
            <div>
              <p className="cb-sans-heading text-lg font-medium tracking-[0.12em] text-[var(--text-primary)]">
                CAR BOUTIQUE JOURNAL
              </p>
              <p className="mt-1 text-[10px] tracking-[0.28em] text-[var(--text-tertiary)]">
                視点・買い方・車種・歴史
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                どこから見始めれば良いか迷ったときに、主要4カテゴリだけをまとめたナビです。
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center justify-between rounded-[20px] border px-3 py-3 transition-colors duration-120",
                      active
                        ? "border-[rgba(27,63,229,0.28)] bg-[var(--surface-glow)] text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <div>
                      <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-primary)]">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">{item.subLabel}</p>
                    </div>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-[11px]",
                        active
                          ? "border-[rgba(27,63,229,0.28)] bg-[rgba(228,235,224,0.85)] text-[var(--accent-strong)]"
                          : "border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)]",
                      )}
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button asChild variant="primary" size="sm" fullWidth magnetic className="justify-center">
                <Link href="/cars" onClick={close}>
                  とりあえず車種から探す
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" fullWidth magnetic className="justify-center">
                <Link href="/guide" onClick={close}>
                  実用を見る
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
