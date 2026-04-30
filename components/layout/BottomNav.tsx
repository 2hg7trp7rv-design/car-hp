// components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  sub?: string;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "ホーム",
    sub: "トップ",
  },
  {
    href: "/cars",
    label: "車種",
    sub: "車種DB",
  },
  {
    href: "/column",
    label: "視点",
    sub: "読み物",
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ボトムナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-default)] bg-[rgba(246,242,235,0.94)] px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6 lg:hidden"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 justify-center"
              aria-current={active ? "page" : undefined}
            >
              <div
                className={[
                  "inline-flex min-w-[72px] flex-col items-center justify-center rounded-[20px] px-3 py-2 text-[10px] transition",
                  active
                    ? "border border-[rgba(27,63,229,0.24)] bg-[rgba(27,63,229,0.12)] text-[var(--accent-strong)]"
                    : "border border-transparent text-[var(--text-tertiary)] hover:border-[rgba(14,12,10,0.08)] hover:bg-[rgba(251,248,243,0.92)] hover:text-[var(--text-primary)]",
                ].join(" ")}
              >
                <span className="font-semibold tracking-[0.16em]">{item.label}</span>
                {item.sub ? (
                  <span className="mt-0.5 text-[9px] leading-none">
                    {item.sub}
                  </span>
                ) : null}
                <span
                  className={[
                    "mt-1 h-[3px] w-5 rounded-full transition-opacity",
                    active ? "bg-[var(--accent-base)] opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
