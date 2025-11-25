// components/layout/MainNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/news", label: "NEWS" },
  { href: "/column", label: "COLUMN" },
  { href: "/guide", label: "GUIDE" },
  { href: "/cars", label: "CARS" },
  { href: "/heritage", label: "HERITAGE" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-xs font-medium text-slate-600">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "relative px-2 py-1 tracking-[0.18em] uppercase",
              "transition-colors",
              isActive
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900",
            ].join(" ")}
          >
            {item.label}
            {isActive && (
              <span className="absolute inset-x-1 -bottom-1 h-[2px] rounded-full bg-tiffany-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
