// components/analytics/ConsentBanner.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  applyAnalyticsConsent,
  getStoredAnalyticsConsent,
  setStoredAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Minimal CMP-style banner (analytics only)
 * - Shows when consent is unset, or when "open" event is triggered.
 * - Stores consent in cookie + localStorage.
 * - Applies Consent Mode update.
 *
 * Note:
 * - We do NOT manually fire an extra page_view on accept.
 *   Page views are already sent by PageViewTracker and will be cookieless when analytics_storage='denied'.
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent>("unset");

  const pageKey = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const stored = getStoredAnalyticsConsent();
    setConsent(stored);
    setOpen(stored === "unset");
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("cbj:open-consent", onOpen as any);
    return () => window.removeEventListener("cbj:open-consent", onOpen as any);
  }, []);

  const accept = () => {
    setStoredAnalyticsConsent("granted");
    applyAnalyticsConsent("granted");
    setConsent("granted");
    setOpen(false);
  };

  const deny = () => {
    setStoredAnalyticsConsent("denied");
    applyAnalyticsConsent("denied");
    setConsent("denied");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:pb-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/12 bg-[#0b0c10]/92 shadow-[0_16px_60px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold tracking-[0.12em] text-white/90">
              アクセス解析について
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/70">
              当サイトは品質改善のため、Google Analyticsの計測を行う場合があります。
              許可すると閲覧データが匿名で収集されます。
              <Link href="/legal/privacy" className="ml-2 text-[#0ABAB5] underline underline-offset-4">
                詳細
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={deny}
              className="rounded-xl border border-white/18 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80 hover:bg-white/10"
            >
              拒否
            </button>
            <button
              type="button"
              onClick={accept}
              className="rounded-xl bg-[#0ABAB5] px-4 py-2 text-[12px] font-semibold text-[#061013] hover:brightness-110"
            >
              許可
            </button>
          </div>
        </div>

        {/* keep references so SPA navigation doesn't tree-shake hooks */}
        <span className="hidden">{pageKey}{consent}</span>
      </div>
    </div>
  );
}
