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
    <nav aria-label="法務・運営情報の一覧" className="cb-panel p-5 sm:p-6">
      <div className="text-[10px] font-semibold tracking-[0.24em] text-[var(--text-tertiary)] uppercase">
        Documents
      </div>

      <div className="mt-5 space-y-6">
        {LEGAL_NAV_GROUPS.map((group) => (
          <section key={group.id}>
            <div className="text-[13px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              {group.title}
            </div>
            <p className="mt-2 text-[12px] leading-[1.8] text-[var(--text-tertiary)]">
              {group.lead}
            </p>

            <div className="mt-3 grid gap-2">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-[20px] border px-4 py-3 transition-colors duration-150",
                      active
                        ? "border-[rgba(27,63,229,0.3)] bg-[var(--surface-glow)]"
                        : "border-[var(--border-default)] bg-[rgba(251,248,243,0.78)] hover:bg-[var(--surface-2)]",
                    )}
                  >
                    <div
                      className={cn(
                        "text-[13px] font-medium leading-[1.5]",
                        active ? "text-[var(--accent-strong)]" : "text-[var(--text-primary)]",
                      )}
                    >
                      {item.label}
                    </div>
                    <div className="mt-1 text-[11px] leading-[1.7] text-[var(--text-tertiary)]">
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
