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
  { href: "/news", label: "NEWS" },
  { href: "/cars", label: "CARS" },
  { href: "/column", label: "COLUMN" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between px-1.5 py-1.5">
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
                "flex flex-1 flex-col items-center justify-center rounded-full px-2 py-1 text-[10px] font-medium tracking-[0.18em] transition",
                isActive
                  ? "bg-slate-900 text-white shadow-soft"
                  : "text-text-sub hover:bg-slate-100",
              ].join(" ")}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
