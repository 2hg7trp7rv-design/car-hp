// components/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム" },
  { href: "/cars", label: "車種" },
  { href: "/news", label: "ニュース" },
  { href: "/column", label: "視点" },
  { href: "/guide", label: "実用" },
  { href: "/heritage", label: "系譜" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="porcelain fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(31,28,25,0.12)] bg-[rgba(251,248,243,0.96)] backdrop-blur-md sm:hidden"
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
                "flex flex-1 basis-0 flex-col items-center justify-center rounded-[20px] px-1 py-1.5 text-[9px] font-semibold tracking-[0.08em] transition min-[380px]:text-[10px] min-[440px]:text-[11px]",
                isActive
                  ? "bg-[var(--surface-2)] text-[var(--text-primary)] shadow-soft"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] active:bg-[rgba(228,219,207,0.72)]",
              ].join(" ")}
            >
              <span className="leading-none">{item.label}</span>
              <span
                className={[
                  "mt-1 h-0.5 w-5 rounded-full transition",
                  isActive ? "bg-[var(--accent-base)]" : "bg-transparent",
                ].join(" ")}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
