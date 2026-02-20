"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-5 w-6",
        "transition-transform duration-300",
        open && "rotate-90",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 block h-[1px] w-full bg-current",
          "transition-transform duration-300",
          open && "translate-y-[9px] rotate-45",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[9px] block h-[1px] w-full bg-current",
          "transition-opacity duration-300",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[18px] block h-[1px] w-full bg-current",
          "transition-transform duration-300",
          open && "-translate-y-[9px] -rotate-45",
        )}
      />
    </span>
  );
}

/**
 * Global navigation (modal)
 * - focus trap + restore focus
 * - tabIndex control when closed (prevents hidden links from being focusable)
 * - keeps the existing visual tone
 */
export function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogId = "cbj-global-menu";

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Avoid focus restore when closing because of route navigation.
  const skipRestoreFocusRef = useRef(false);
  const prevOpenRef = useRef(false);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "HOME" },
      { href: "/guide", label: "GUIDE" },
      { href: "/column", label: "COLUMN" },
      { href: "/heritage", label: "HERITAGE" },
      { href: "/cars", label: "CARS" },
    ],
    [],
  );

  // Route transition closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll lock
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

  // Focus management (open → focus close)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // Restore focus (close → focus trigger) unless closing by navigation.
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

  // ESC + focus trap
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
      {/* 右上固定：ボタン（PC/スマホで同じ見え方に寄せる） */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "safe-area-top safe-area-right fixed z-50",
          "inline-flex items-center gap-3 rounded-full",
          "cb-tap border border-white/15 bg-black/35 px-3 py-2 backdrop-blur",
          "text-[11px] font-medium tracking-[0.18em] text-white",
          "transition-colors duration-300",
          "hover:border-white/30",
          open && "border-[#0ABAB5]/70",
        )}
      >
        <HamburgerIcon open={open} />
        <span>MENU</span>
      </button>

      {/* 全画面オーバーレイ */}
      <div
        id={dialogId}
        ref={dialogRef}
        className={cn(
          "fixed inset-0 z-40",
          "transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        {/* 背景 */}
        <button
          type="button"
          tabIndex={safeTabIndex}
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/90"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/85 to-black/95" />
          <div className="absolute -inset-[20%] opacity-[0.10] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0_1px,rgba(0,0,0,0)_1px_2px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0_1px,rgba(0,0,0,0)_1px_3px)] [transform:rotate(7deg)]" />
        </div>

        {/* 本体 */}
        <div className="safe-area-top safe-area-bottom safe-area-left safe-area-right absolute inset-0 overflow-y-auto">
          <div className="mx-auto flex max-w-5xl flex-col px-4 pb-14 pt-20 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[11px] tracking-[0.18em] text-white/60">
                  CAR BOUTIQUE JOURNAL
                </p>
                <p className="mt-5 text-[clamp(22px,3vw,34px)] font-medium tracking-[0.06em] text-white">
                  MENU
                </p>
              </div>

              <button
                ref={closeRef}
                type="button"
                tabIndex={safeTabIndex}
                onClick={() => setOpen(false)}
                className={cn(
                  "cb-tap inline-flex items-center gap-3 px-2",
                  "border-b border-white/20 pb-2",
                  "text-[11px] font-medium tracking-[0.18em] text-white",
                  "transition-colors duration-300",
                  "hover:border-[#0ABAB5] hover:text-[#0ABAB5]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ABAB5]/50",
                )}
              >
                CLOSE
                <span aria-hidden="true" className="text-white/40">
                  ×
                </span>
              </button>
            </div>

            <nav className="mt-12" aria-label="Global navigation">
              <ul className="space-y-8">
                {items.map((it, idx) => (
                  <li key={it.href} className="border-b border-white/10 pb-8">
                    <Link
                      href={it.href}
                      tabIndex={safeTabIndex}
                      onClick={() => {
                        // Let the new page decide focus; don't snap back to MENU button.
                        skipRestoreFocusRef.current = true;
                        setOpen(false);
                      }}
                      className={cn(
                        "group block cb-tap py-2",
                        "text-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ABAB5]/50",
                      )}
                    >
                      <div className="flex items-baseline gap-6">
                        <span className="text-[11px] tracking-[0.18em] text-white/45">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[18px] font-medium tracking-[0.06em] transition-colors duration-300 group-hover:text-[#0ABAB5]">
                          {it.label}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
