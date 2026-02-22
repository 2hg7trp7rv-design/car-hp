// components/analytics/PageViewTracker.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * PageView tracker for Next.js App Router (SPA navigation)
 *
 * Why:
 * - In App Router, client-side navigation does not always trigger GA4 page_view automatically.
 * - This ensures each route change emits a single, clean page_view.
 *
 * Consent Mode:
 * - Consent state is controlled by `gtag('consent', ...)` in GoogleAnalytics.
 * - Even when analytics_storage='denied', Google tags can send cookieless pings.
 *   (So we do NOT hard-block page_view here.)
 */
export function PageViewTracker() {
  const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pagePath = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === "undefined") return;

    const gtag = window.gtag;
    if (!gtag) return;

    gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location?.href ?? pagePath,
      page_title: document?.title ?? "",
    });
  }, [GA_ID, pagePath]);

  return null;
}
