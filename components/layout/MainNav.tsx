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
  { href: "/cars", label: "車種", subLabel: "車種から探す" },
  { href: "/guide", label: "実用", subLabel: "選び方から売却まで" },
  { href: "/column", label: "視点", subLabel: "業界・選び方" },
  { href: "/heritage", label: "系譜", subLabel: "読む展示" },
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
      className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
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
              "relative rounded-full px-3 py-2 transition-colors duration-120",
              active
                ? "bg-[var(--surface-2)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
            ].join(" ")}
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px]">{item.label}</span>
              {item.subLabel && (
                <span className="mt-0.5 text-[9px] tracking-[0.08em] text-[var(--text-tertiary)]">
                  {item.subLabel}
                </span>
              )}
            </div>

            {active && (
              <span className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-[var(--accent-base)]" />
            )}

            {item.badge && (
              <span className="absolute -right-2 -top-1 rounded-full bg-[var(--accent-base)] px-1.5 py-[1px] text-[8px] font-bold tracking-[0.16em] text-[var(--bg-stage)]">
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
