// components/layout/MainNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  subLabel?: string;
  badge?: "NEW" | "PREP";
};

const items: NavItem[] = [
  {
    href: "/canvas",
    label: "CANVAS",
    subLabel: "判断軸",
    badge: "NEW",
  },
  {
    href: "/column",
    label: "COLUMN",
    subLabel: "コラム",
  },
  {
    href: "/guide",
    label: "GUIDE",
    subLabel: "ガイド",
  },
  {
    href: "/cars",
    label: "CARS",
    subLabel: "車種DB",
  },
  {
    href: "/heritage",
    label: "HERITAGE",
    subLabel: "ヘリテイジ",
    badge: "NEW", // ルートが未完成なら "PREP" に変えるなど運用で調整
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-4 text-xs font-medium text-slate-600"
      aria-label="メインナビゲーション"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "relative px-2 py-1 tracking-[0.18em] uppercase",
              "transition-colors",
              active
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900",
            ].join(" ")}
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px]">{item.label}</span>
              {item.subLabel && (
                <span className="mt-0.5 text-[9px] tracking-[0.08em] text-slate-400">
                  {item.subLabel}
                </span>
              )}
            </div>

            {active && (
              <span className="absolute inset-x-1 -bottom-1 h-[2px] rounded-full bg-tiffany-500" />
            )}

            {item.badge && (
              <span className="absolute -right-3 -top-1 rounded-full bg-tiffany-500 px-1.5 py-[1px] text-[8px] font-bold tracking-[0.16em] text-white">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default MainNav;
