// components/layout/MobileMenu.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "HOME", sub: "トップ" },
  { href: "/news", label: "NEWS", sub: "ニュース" },
  { href: "/column", label: "COLUMN", sub: "コラム" },
  { href: "/guide", label: "GUIDE", sub: "ガイド" },
  { href: "/cars", label: "CARS", sub: "車種データ" },
  { href: "/heritage", label: "HERITAGE", sub: "ヒストリー" },
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

  function handlePointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
  ): void {
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
      x: clampedX * 0.3,
      y: clampedY * 0.3,
    });
  }

  function resetMagnet() {
    setMagnet({ x: 0, y: 0 });
  }

  const transform = `translate3d(${magnet.x}px, ${magnet.y}px, 0) scale(${
    open ? 0.92 : 1.02
  })`;

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        onClick={toggle}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetMagnet}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-[0_18px_40px_rgba(15,23,42,0.55)] ring-1 ring-slate-700/70 transition-transform duration-200"
        style={{ transform }}
        aria-label="メニューを開く"
        aria-expanded={open}
      >
        <span className="relative flex h-4 w-4 flex-col justify-between">
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-white transition-transform duration-200 " +
              (open ? "translate-y-[6px] rotate-45" : "")
            }
          />
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-white transition-opacity duration-150 " +
              (open ? "opacity-0" : "opacity-80")
            }
          />
          <span
            className={
              "block h-[1.5px] w-full rounded-full bg-white transition-transform duration-200 " +
              (open ? "-translate-y-[6px] -rotate-45" : "")
            }
          />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={close}
          />
          <nav className="absolute inset-x-4 top-16 rounded-3xl bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.4)]">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              MENU
            </p>
            <ul className="mt-3 space-y-1">
              {items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={[
                        "flex items-center justify-between rounded-2xl px-3 py-2",
                        "transition",
                        active
                          ? "bg-slate-900 text-slate-50"
                          : "bg-transparent text-slate-800 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold tracking-[0.24em]">
                          {item.label}
                        </span>
                        {item.sub && (
                          <span
                            className={
                              "mt-0.5 text-[10px] tracking-[0.04em] " +
                              (active
                                ? "text-slate-200"
                                : "text-slate-500")
                            }
                          >
                            {item.sub}
                          </span>
                        )}
                      </div>
                      {active && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-tiffany-400">
                          now
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
