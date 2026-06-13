"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LEGAL_NAV_GROUPS } from "@/components/legal/legal-nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LegalSidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="法務・運営情報の一覧"
      className="overflow-hidden rounded-[28px] border border-black/10 bg-[#090b0d] text-white shadow-[0_24px_70px_-50px_rgba(3,4,4,0.8)]"
    >
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/[0.34]">
          DOCUMENTS
        </div>
        <p className="mt-3 text-[13px] leading-[1.8] tracking-[0.03em] text-white/[0.58]">
          運営、編集、出典、権利まわりの基準
        </p>
      </div>

      <div className="space-y-7 px-3 py-4 sm:px-4 sm:py-5">
        {LEGAL_NAV_GROUPS.map((group) => (
          <section key={group.id}>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/[0.26]">
              {group.title}
            </div>

            <div className="mt-3 grid gap-1.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative rounded-[18px] px-3.5 py-3.5 transition-colors duration-150",
                      active
                        ? "bg-white text-[#050607]"
                        : "text-white/[0.64] hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity",
                        active ? "bg-[#00708d] opacity-100" : "bg-white/20 opacity-0 group-hover:opacity-100",
                      )}
                    />
                    <div className="text-[13px] font-semibold leading-[1.45] tracking-[-0.01em]">
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 text-[11px] leading-[1.7]",
                        active ? "text-black/[0.54]" : "text-white/[0.36] group-hover:text-white/50",
                      )}
                    >
                      {item.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </nav>
  );
}
