// components/layout/MobileMenu.tsx
"use client";

import { useState, useRef, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/cars", label: "車種", sub: "車種から探す" },
  { href: "/guide", label: "実用", sub: "選び方から売却まで" },
  { href: "/column", label: "視点", sub: "業界・選び方" },
  { href: "/heritage", label: "系譜", sub: "読む展示" },
];

type MagnetState = {
  x: number;
  y: number;
};

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [magnet, setMagnet] = useState<MagnetState>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  function toggle() {
    setOpen((prev) => !prev);
  }

  function close() {
    setOpen(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    const max = 18;
    const clampedX = Math.max(-max, Math.min(max, deltaX));
    const clampedY = Math.max(-max, Math.min(max, deltaY));

    setMagnet({
      x: clampedX * 0.25,
      y: clampedY * 0.25,
    });
  }

  function resetMagnet() {
    setMagnet({ x: 0, y: 0 });
  }

  const transform = `translate3d(${magnet.x}px, ${magnet.y}px, 0) scale(${open ? 0.96 : 1.01})`;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={toggle}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetMagnet}
        className="fixed bottom-6 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.96)] text-[var(--text-primary)] shadow-soft-card transition-transform duration-200 sm:bottom-8 sm:right-6"
        style={{ transform }}
        aria-label="メニューを開く"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="relative flex h-4 w-4 flex-col justify-between">
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-[var(--text-primary)] transition-transform duration-200 " +
              (open ? "translate-y-[6px] rotate-45" : "")
            }
          />
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-[var(--text-primary)] transition-opacity duration-150 " +
              (open ? "opacity-0" : "opacity-80")
            }
          />
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-[var(--text-primary)] transition-transform duration-200 " +
              (open ? "-translate-y-[6px] -rotate-45" : "")
            }
          />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-modal="true"
          role="dialog"
          aria-label="グローバルメニュー"
        >
          <div
            className="absolute inset-0 bg-[rgba(31,28,25,0.18)] backdrop-blur-[1px]"
            onClick={close}
          />

          <nav className="porcelain absolute inset-x-4 top-16 mx-auto max-w-md rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.98)] p-5 shadow-[0_24px_60px_rgba(31,28,25,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="serif-heading text-[15px] font-medium tracking-[0.16em] text-[var(--text-primary)]">
                  CAR BOUTIQUE JOURNAL
                </p>
                <p className="mt-1 text-[9px] tracking-[0.26em] text-[var(--text-tertiary)]">
                  視点・ガイド・車種・歴史
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[11px] text-[var(--text-tertiary)]"
                aria-label="メニューを閉じる"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              主要カテゴリへすぐ移動できるスマホ向けメニューです。
            </p>

            <ul className="mt-4 space-y-2">
              {items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={[
                        "flex items-center justify-between rounded-[20px] border px-3 py-3 transition-colors duration-120",
                        active
                          ? "border-[rgba(122,135,108,0.24)] bg-[var(--surface-moss)] text-[var(--text-primary)]"
                          : "border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
                      ].join(" ")}
                    >
                      <div className="flex flex-col">
                        <span className="text-[12px] font-semibold tracking-[0.18em]">{item.label}</span>
                        {item.sub && (
                          <span className="mt-0.5 text-[10px] tracking-[0.04em] text-[var(--text-tertiary)]">
                            {item.sub}
                          </span>
                        )}
                      </div>
                      {active ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                          now
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-tertiary)]">→</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                asChild
                variant="primary"
                size="sm"
                fullWidth
                className="justify-center text-[11px]"
              >
                <Link href="/cars" onClick={close}>
                  車種から探す
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                fullWidth
                className="justify-center text-[11px]"
              >
                <Link href="/guide" onClick={close}>
                  お金と手続きのガイド
                </Link>
              </Button>
            </div>

            <p className="mt-4 border-t border-[var(--border-default)] pt-3 text-[9px] leading-relaxed text-[var(--text-tertiary)]">
              車種、ガイド、視点、系譜へ移動。
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
