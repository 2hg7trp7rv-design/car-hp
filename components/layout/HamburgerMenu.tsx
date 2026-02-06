"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

export function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogId = "cbj-global-menu";

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "HOME" },
      { href: "/guide", label: "GUIDE" },
      { href: "/column", label: "COLUMN" },
      { href: "/heritage", label: "HERITAGE" },
      { href: "/cars", label: "CARS" },    ],
    [],
  );

  // ルート遷移時は閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // スクロールロック
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

  // ESC で閉じる
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* 右上固定：ボタン（PC/スマホで同じ見え方に寄せる） */}
      <button
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "safe-area-top safe-area-right fixed z-50",
          "inline-flex items-center gap-3",
          "border border-[#222222]/10 bg-white/90 px-3 py-2 backdrop-blur",
          "text-[11px] font-medium tracking-[0.34em] text-[#222222]",
          "transition-colors duration-300",
          "hover:border-[#0ABAB5]",
          open && "border-[#0ABAB5]",
        )}
      >
        <HamburgerIcon open={open} />
        <span>MENU</span>
      </button>

      {/* 全画面オーバーレイ */}
      <div
        id={dialogId}
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
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-white"
        />

        {/* 本体 */}
        <div className="safe-area-top safe-area-bottom safe-area-left safe-area-right absolute inset-0 overflow-y-auto">
          <div className="mx-auto flex max-w-5xl flex-col px-4 pb-14 pt-20 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[11px] tracking-[0.34em] text-[#222222]/60">
                  CAR BOUTIQUE JOURNAL
                </p>
                <p className="mt-5 text-[clamp(22px,3vw,34px)] font-medium tracking-[0.12em] text-[#222222]">
                  Menu
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex items-center gap-3",
                  "border-b border-[#222222]/20 pb-2",
                  "text-[11px] font-medium tracking-[0.34em] text-[#222222]",
                  "transition-colors duration-300",
                  "hover:border-[#0ABAB5] hover:text-[#0ABAB5]",
                )}
              >
                CLOSE
                <span aria-hidden="true" className="text-[#222222]/40">
                  ×
                </span>
              </button>
            </div>

            <nav className="mt-12">
              <ul className="space-y-8">
                {items.map((it, idx) => (
                  <li key={it.href} className="border-b border-[#222222]/10 pb-8">
                    <Link
                      href={it.href}
                      className={cn(
                        "group block",
                        "text-[#222222]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ABAB5]/50",
                      )}
                    >
                      <div className="flex items-baseline gap-6">
                        <span className="text-[11px] tracking-[0.34em] text-[#222222]/45">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[18px] font-medium tracking-[0.24em] transition-colors duration-300 group-hover:text-[#0ABAB5]">
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
