// components/layout/SiteHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/cars", label: "車種" },
  { href: "/guide", label: "実用" },
  { href: "/column", label: "考察" },
  { href: "/heritage", label: "系譜" },
];

const DRAWER_SUB: NavItem[] = [
  { href: "/legal/about", label: "このサイトについて" },
  { href: "/legal", label: "運営情報" },
  { href: "/contact", label: "お問い合わせ" },
];

const DRAWER_FEATURE = {
  href: "/guide",
  label: "GUIDE",
  title: "買う前も、乗ったあとも。知っておくだけで役立つ情報を置いています。",
  imageSrc: "/images/hero-top-mobile.jpeg",
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BurgerLine({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "block h-[1px] w-[18px] rounded-full bg-[var(--text-primary)] transition-all duration-200",
        open ? "translate-y-[5px] rotate-45" : "",
      ].join(" ")}
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="border-b border-[rgba(14,12,10,0.08)] bg-[rgba(246,242,235,0.86)] backdrop-blur-md">
          <div className="page-shell flex h-[64px] items-center justify-between gap-4 lg:h-[72px]">
            <Link href="/" className="group flex min-w-0 flex-col leading-none">
              <span
                className="truncate text-[11px] font-semibold tracking-[0.24em] text-[var(--text-primary)] transition-colors duration-150 group-hover:text-[var(--accent-base)] md:text-[12px]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                CAR BOUTIQUE JOURNAL
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="主要ナビゲーション">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.03em] transition-all duration-150",
                      active
                        ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              aria-label={open ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={open}
              aria-controls="cbj-site-drawer"
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] transition-colors duration-150 hover:bg-[var(--surface-2)] lg:hidden"
            >
              <span className="relative flex h-[14px] w-[18px] flex-col items-center justify-center">
                <BurgerLine open={open} />
                <span
                  aria-hidden="true"
                  className={[
                    "mt-[4px] block h-[1px] w-[18px] rounded-full bg-[var(--text-primary)] transition-all duration-200",
                    open ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                />
                <span
                  aria-hidden="true"
                  className={[
                    "mt-[4px] block h-[1px] w-[18px] rounded-full bg-[var(--text-primary)] transition-all duration-200",
                    open ? "-translate-y-[5px] -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-[rgba(14,12,10,0.22)] transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        id="cbj-site-drawer"
        aria-hidden={!open}
        className={[
          "fixed inset-y-0 right-0 z-50 w-full max-w-[420px] border-l border-[var(--border-default)] bg-[var(--bg-stage-2)] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-5">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--text-primary)]">
                CAR BOUTIQUE JOURNAL
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Link
              href={DRAWER_FEATURE.href}
              className="group block overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-[var(--surface-1)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
                <Image
                  src={DRAWER_FEATURE.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 420px) 100vw, 420px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-5">
                <div className="text-[10px] font-semibold tracking-[0.24em] text-[var(--accent-base)] uppercase">
                  {DRAWER_FEATURE.label}
                </div>
                <div className="mt-3 text-[25px] font-semibold leading-[1.22] tracking-[-0.04em] text-[var(--text-primary)]">
                  {DRAWER_FEATURE.title}
                </div>
              </div>
            </Link>

            <nav className="mt-8 grid gap-3" aria-label="モバイルナビゲーション">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-[22px] border px-5 py-4 transition-colors duration-150",
                      active
                        ? "border-[rgba(27,63,229,0.35)] bg-[var(--surface-glow)]"
                        : "border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <div className="text-[16px] font-medium tracking-[-0.02em] text-[var(--text-primary)]">
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-[var(--border-default)] pt-6">
              <div className="mt-4 flex flex-wrap gap-2">
                {DRAWER_SUB.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
