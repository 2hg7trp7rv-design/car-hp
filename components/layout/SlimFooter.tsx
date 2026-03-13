// components/layout/SlimFooter.tsx
// 詳細ページ用の簡略フッター（B01）
import Link from "next/link";
import { ConsentManageButton } from "@/components/analytics/ConsentManageButton";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/cars", label: "CARS" },
  { href: "/guide", label: "GUIDE" },
  { href: "/column", label: "COLUMN" },
  { href: "/heritage", label: "HERITAGE" },
] as const;

export function SlimFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-[#07080a] py-8 text-white">
      <div className="page-shell">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="text-[11px] tracking-[0.2em] text-white/50 hover:text-white/80">
            CAR BOUTIQUE JOURNAL
          </Link>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[11px] tracking-[0.18em] text-white/40 transition hover:text-[#0ABAB5]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4 text-[11px] text-white/35">
            <span>© {year}</span>
            <ConsentManageButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
