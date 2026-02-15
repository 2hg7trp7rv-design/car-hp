// components/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "HOME" },
  { href: "/cars", label: "CARS" },
  { href: "/news", label: "NEWS" },
  { href: "/column", label: "COLUMN" },
  { href: "/guide", label: "GUIDE" },
  { href: "/heritage", label: "HERITAGE" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="porcelain fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/92 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto flex max-w-6xl items-stretch justify-between gap-1 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                // 7タブを1列に収めるため、モバイルでは文字サイズ/トラッキングを最適化
                "flex flex-1 basis-0 flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-[9px] font-semibold tracking-[0.08em] transition min-[380px]:text-[10px] min-[440px]:text-[11px]",
                isActive
                  ? "bg-slate-900 text-white shadow-soft"
                  : "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
              ].join(" ")}
            >
              <span className="leading-none">{item.label}</span>
              <span
                className={[
                  "mt-1 h-0.5 w-5 rounded-full transition",
                  isActive ? "bg-tiffany-500" : "bg-transparent",
                ].join(" ")}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
