"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navigation from "@/app/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";

type SiteChromeProps = { children: ReactNode };

const isEditorialArticlePath = (pathname: string) =>
  /^\/(?:guide|column)\/[^/]+\/?$/.test(pathname) || pathname === "/article-system-preview";

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const editorialArticle = isEditorialArticlePath(pathname);

  if (pathname === "/") {
    return (
      <div id="cb-main" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] text-white outline-none">
        {children}
      </div>
    );
  }

  return (
    <div className={editorialArticle ? "flex min-h-screen flex-col bg-white" : "flex min-h-screen flex-col bg-[var(--bg-stage)]"}>
      {editorialArticle ? null : <Navigation />}
      <div id={editorialArticle ? undefined : "cb-main"} tabIndex={editorialArticle ? undefined : -1} className="flex-1 pt-0 outline-none">
        {children}
      </div>
      {editorialArticle ? null : <SiteFooter />}
    </div>
  );
}
