"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type SiteChromeProps = { children: ReactNode };

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <div id="cb-main" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] text-white outline-none">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-stage)]">
      <SiteHeader />
      <div id="cb-main" tabIndex={-1} className="flex-1 pt-[64px] outline-none lg:pt-[72px]">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
