"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  sub: string;
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block h-5 w-6 transition-transform duration-300", open && "rotate-90")}
    >
      <span
        className={cn(
          "absolute left-0 top-0 block h-[1px] w-full bg-current transition-transform duration-300",
          open && "translate-y-[9px] rotate-45",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[9px] block h-[1px] w-full bg-current transition-opacity duration-300",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[18px] block h-[1px] w-full bg-current transition-transform duration-300",
          open && "-translate-y-[9px] -rotate-45",
        )}
      />
    </span>
  );
}

export function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogId = "cbj-global-menu";

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const skipRestoreFocusRef = useRef(false);
  const prevOpenRef = useRef(false);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/cars", label: "車種", sub: "メーカーや価格帯から探す" },
      { href: "/guide", label: "実用", sub: "選び方から売却まで" },
      { href: "/column", label: "視点", sub: "業界・選び方・オピニオン" },
      { href: "/heritage", label: "系譜", sub: "読む展示" },
    ],
    [],
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (!wasOpen || open) return;

    const skip = skipRestoreFocusRef.current;
    skipRestoreFocusRef.current = false;
    if (skip) return;

    const active = document.activeElement;
    if (dialogRef.current && active && dialogRef.current.contains(active)) {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
      });

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const safeTabIndex = open ? 0 : -1;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "safe-area-top safe-area-right fixed z-50 inline-flex items-center gap-3 rounded-full",
          "cb-tap border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-[var(--text-primary)] shadow-soft-card",
          "transition-colors duration-300 hover:border-[rgba(27,63,229,0.30)]",
          open && "border-[rgba(27,63,229,0.40)] bg-[var(--surface-2)]",
        )}
      >
        <HamburgerIcon open={open} />
        <span>メニュー</span>
      </button>

      <div
        id={dialogId}
        ref={dialogRef}
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={safeTabIndex}
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-[rgba(14,12,10,0.18)] backdrop-blur-[1px]"
        />
        <div className="safe-area-top safe-area-bottom safe-area-left safe-area-right absolute inset-0 overflow-y-auto">
          <div className="mx-auto flex max-w-5xl flex-col px-4 pb-14 pt-20 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.98)] p-6 shadow-[0_28px_64px_rgba(14,12,10,0.16)] sm:p-8">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <p className="text-[11px] tracking-[0.18em] text-[var(--text-tertiary)]">
                    CAR BOUTIQUE JOURNAL
                  </p>
                  <p className="mt-4 text-[clamp(22px,3vw,34px)] font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                    メニュー
                  </p>
                  <p className="mt-3 max-w-[32rem] text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                    主要カテゴリへ移動できるメニューです。
                  </p>
                </div>

                <button
                  ref={closeRef}
                  type="button"
                  tabIndex={safeTabIndex}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "cb-tap inline-flex items-center gap-3 rounded-full border border-[var(--border-default)] px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-[var(--text-primary)] transition-colors duration-300 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(27,63,229,0.42)]",
                  )}
                >
                  CLOSE
                  <span aria-hidden="true" className="text-[var(--text-tertiary)]">
                    ×
                  </span>
                </button>
              </div>

              <nav className="mt-10" aria-label="Global navigation">
                <ul className="space-y-3">
                  {items.map((it, idx) => {
                    const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          aria-current={active ? "page" : undefined}
                          tabIndex={safeTabIndex}
                          onClick={() => {
                            skipRestoreFocusRef.current = true;
                            setOpen(false);
                          }}
                          className={cn(
                            "group block rounded-[22px] border px-4 py-4 transition-colors duration-150",
                            active
                              ? "border-[rgba(27,63,229,0.28)] bg-[var(--surface-glow)]"
                              : "border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(27,63,229,0.42)]",
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-[11px] tracking-[0.18em] text-[var(--text-tertiary)]">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1">
                              <span className="block text-[18px] font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                                {it.label}
                              </span>
                              <span className="mt-1 block text-[12px] leading-[1.75] text-[var(--text-secondary)]">
                                {it.sub}
                              </span>
                            </span>
                            <span className="text-[var(--accent-strong)]">→</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
