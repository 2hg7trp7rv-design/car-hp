// components/layout/MobileMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "HOME" },
  { href: "/news", label: "NEWS" },
  { href: "/column", label: "COLUMN" },
  { href: "/guide", label: "GUIDE" },
  { href: "/cars", label: "CARS" },
  { href: "/heritage", label: "HERITAGE" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="メニューを開く"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 shadow-soft hover:bg-slate-50"
      >
        <span
          className={[
            "absolute h-[1.5px] w-4 bg-slate-800 transition-transform duration-200",
            open ? "translate-y-0 rotate-45" : "-translate-y-1.5",
          ].join(" ")}
        />
        <span
          className={[
            "absolute h-[1.5px] w-4 bg-slate-800 transition-opacity duration-150",
            open ? "opacity-0" : "opacity-100",
          ].join(" ")}
        />
        <span
          className={[
            "absolute h-[1.5px] w-4 bg-slate-800 transition-transform duration-200",
            open ? "translate-y-0 -rotate-45" : "translate-y-1.5",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute inset-x-4 top-16 rounded-3xl bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.35)]">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              MENU
            </p>
            <ul className="mt-3 space-y-1">
              {items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between rounded-2xl px-3 py-2 text-sm",
                        "transition-colors",
                        isActive
                          ? "bg-tiffany-50 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="tracking-[0.18em]">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-tiffany-600">
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
