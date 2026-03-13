"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SlimFooter } from "@/components/layout/SlimFooter";

const SLIM_FOOTER_EXCLUSIONS = new Set([
  "/cars/makers",
  "/cars/body-types",
  "/cars/segments",
  "/guide/hub-consumables",
  "/guide/hub-import-trouble",
  "/guide/hub-loan",
  "/guide/hub-paperwork",
  "/guide/hub-sell",
  "/guide/hub-sell-compare",
  "/guide/hub-sell-loan",
  "/guide/hub-sell-prepare",
  "/guide/hub-sell-price",
  "/guide/hub-shaken",
  "/guide/hub-usedcar",
  "/guide/insurance",
  "/guide/lease",
  "/guide/maintenance",
  "/guide/road-service-choice-guide",
]);

function shouldUseSlimFooter(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SLIM_FOOTER_EXCLUSIONS.has(pathname)) return false;

  return (
    /^\/cars\/[^/]+$/.test(pathname) ||
    /^\/guide\/[^/]+$/.test(pathname) ||
    /^\/column\/[^/]+$/.test(pathname) ||
    /^\/heritage\/[^/]+$/.test(pathname)
  );
}

export function FooterSwitcher() {
  const pathname = usePathname();
  return shouldUseSlimFooter(pathname) ? <SlimFooter /> : <SiteFooter />;
}
