"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navigation from "@/app/components/Navigation";

type SiteChromeProps = { children: ReactNode; footer: ReactNode; articleFooter: ReactNode };

const isCarDetailPath = (pathname: string) =>
  /^\/cars\/[^/]+\/?$/.test(pathname);

const isHeritageDetailPath = (pathname: string) =>
  /^\/heritage\/[^/]+\/?$/.test(pathname);

const isEditorialArticlePath = (pathname: string) =>
  /^\/(?:guide|column)\/[^/]+\/?$/.test(pathname);

export function SiteChrome({ children, footer, articleFooter }: SiteChromeProps) {
  const pathname = usePathname();
  const carDetail = isCarDetailPath(pathname);
  const heritageDetail = isHeritageDetailPath(pathname);
  const editorialArticle = isEditorialArticlePath(pathname);

  if (pathname === "/") {
    return (
      <div
        id="cb-main"
        tabIndex={-1}
        className="min-h-screen bg-[#fffdf8] text-[#2b2b33] outline-none"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={
        carDetail
          ? "flex min-h-screen flex-col bg-[#0b0b0b]"
          : heritageDetail
            ? "cbj-heritage-chrome flex min-h-screen flex-col bg-[#0b0b0a]"
            : editorialArticle
              ? "flex min-h-screen flex-col bg-white"
              : "flex min-h-screen flex-col bg-[var(--bg-stage)]"
      }
    >
      {editorialArticle ? null : <Navigation />}
      <div id="cb-main" tabIndex={-1} className="flex-1 pt-0 outline-none">
        {children}
      </div>
      {editorialArticle ? articleFooter : footer}
    </div>
  );
}
