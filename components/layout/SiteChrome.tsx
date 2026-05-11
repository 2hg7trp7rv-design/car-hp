"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navigation from "@/app/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type SiteChromeProps = { children: ReactNode };

const isCarDetailPath = (pathname: string) =>
  /^\/cars\/[^/]+\/?$/.test(pathname);

const isHeritageDetailPath = (pathname: string) =>
  /^\/heritage\/[^/]+\/?$/.test(pathname);

const isEditorialArticlePath = (pathname: string) =>
  /^\/(?:guide|column)\/[^/]+\/?$/.test(pathname);

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const carDetail = isCarDetailPath(pathname);
  const heritageDetail = isHeritageDetailPath(pathname);
  const editorialArticle = isEditorialArticlePath(pathname);

  if (pathname === "/") {
    return (
      <div
        id="cb-main"
        tabIndex={-1}
        className="min-h-screen bg-[#0A0A0A] text-white outline-none"
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
            : "flex min-h-screen flex-col bg-[var(--bg-stage)]"
      }
    >
      {heritageDetail ? (
        <Navigation />
      ) : (
        <SiteHeader
          variant={
            carDetail
              ? "carArticle"
              : editorialArticle
                ? "editorialArticle"
                : "default"
          }
        />
      )}
      <div
        id="cb-main"
        tabIndex={-1}
        className={
          carDetail || heritageDetail
            ? "flex-1 pt-0 outline-none"
            : "flex-1 pt-[64px] outline-none lg:pt-[72px]"
        }
      >
        {children}
      </div>
      {heritageDetail ? null : (
        <SiteFooter
          variant={
            carDetail
              ? "carArticle"
              : editorialArticle
                ? "editorialArticle"
                : "default"
          }
        />
      )}
    </div>
  );
}
