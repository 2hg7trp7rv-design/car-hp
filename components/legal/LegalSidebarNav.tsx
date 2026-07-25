"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LEGAL_NAV_GROUPS } from "@/components/legal/legal-nav";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LegalSidebarNav({ compact = false }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="法務・運営情報の一覧"
      className={cn(
        "overflow-hidden border border-black/10 bg-[var(--navy)] text-white shadow-[0_24px_70px_-50px_rgba(3,4,4,0.8)]",
        compact ? "rounded-[24px]" : "rounded-[28px]",
      )}
    >
      <div className={cn("border-b border-white/10", compact ? "px-4 py-4" : "px-5 py-5 sm:px-6")}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/[0.34]">
          DOCUMENTS
        </div>
        <p className={cn("mt-3 leading-[1.8] tracking-[0.03em] text-white/[0.58]", compact ? "text-[12px]" : "text-[13px]")}> 
          運営、編集、出典、権利まわりの基準
        </p>
      </div>

      <div className={cn(compact ? "space-y-5 px-3 py-4" : "space-y-7 px-3 py-4 sm:px-4 sm:py-5")}>
        {LEGAL_NAV_GROUPS.map((group) => (
          <section key={group.id}>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/[0.26]">
              {group.title}
            </div>

            <div className={cn("grid", compact ? "mt-2 gap-1" : "mt-3 gap-1.5")}>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative rounded-[17px] transition-colors duration-150",
                      compact ? "px-3 py-3" : "px-3.5 py-3.5",
                      active
                        ? "bg-white text-[var(--navy)]"
                        : "text-white/[0.64] hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity",
                        compact ? "h-6" : "h-7",
                        active ? "bg-[var(--teal)] opacity-100" : "bg-white/20 opacity-0 group-hover:opacity-100",
                      )}
                    />
                    <div className="text-[13px] font-semibold leading-[1.45] tracking-[-0.01em]">
                      {item.label}
                    </div>
                    {!compact ? (
                      <div
                        className={cn(
                          "mt-1.5 text-[11px] leading-[1.7]",
                          active ? "text-black/[0.54]" : "text-white/[0.36] group-hover:text-white/50",
                        )}
                      >
                        {item.description}
                      </div>
                    ) : null}
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
