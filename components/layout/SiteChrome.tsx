"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type SiteChromeProps = { children: ReactNode };
const isCarDetailPath = (pathname: string) => /^\/cars\/[^/]+\/?$/.test(pathname);

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const carDetail = isCarDetailPath(pathname);

  if (pathname === "/") {
    return (
      <div id="cb-main" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] text-white outline-none">
        {children}
      </div>
    );
  }

  return (
    <div className={carDetail ? "flex min-h-screen flex-col bg-[#0b0b0b]" : "flex min-h-screen flex-col bg-[var(--bg-stage)]"}>
      <SiteHeader variant={carDetail ? "carArticle" : "default"} />
      <div id="cb-main" tabIndex={-1} className={carDetail ? "flex-1 pt-0 outline-none" : "flex-1 pt-[64px] outline-none lg:pt-[72px]"}>
        {children}
      </div>
      <SiteFooter variant={carDetail ? "carArticle" : "default"} />
    </div>
  );
}
