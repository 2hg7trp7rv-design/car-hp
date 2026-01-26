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
    label: "HOME",
    sub: "トップ",
  },
  {
    href: "/cars",
    label: "CARS",
    sub: "車種DB",
  },
  {
    href: "/search",
    label: "SEARCH",
    sub: "検索",
  },
  {
    href: "/column",
    label: "COLUMN",
    sub: "読み物",
  },
  // GUIDEはボトムナビではなく、HeroやHomeNavDrawerから行く導線前提。
  // 将来的にタブを追加したくなったらここに
  // {
  //   href: "/guide",
  //   label: "GUIDE",
  //   sub: "ガイド",
  // },
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
      className="
        fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 
        bg-white/90 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]
        backdrop-blur
        sm:px-6 
        lg:hidden
      "
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
                  "inline-flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-[10px] transition-all",
                  active
                    ? "bg-slate-900 text-white shadow-[0_6px_16px_rgba(15,23,42,0.25)]"
                    : "text-text-sub hover:bg-slate-100",
                ].join(" ")}
              >
                <span className="font-semibold tracking-[0.16em]">
                  {item.label}
                </span>
                {item.sub && (
                  <span
                    className={
                      "mt-0.5 text-[9px] leading-none " +
                      (active ? "text-slate-200" : "text-slate-400")
                    }
                  >
                    {item.sub}
                  </span>
                )}

                {/* アクティブタブ用の小さなインジケーター */}
                <span
                  className={[
                    "mt-1 h-[3px] w-5 rounded-full transition-opacity",
                    active ? "bg-emerald-400 opacity-100" : "opacity-0",
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
