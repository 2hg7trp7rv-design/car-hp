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
    window.addEventListener("cbj:open-consent", onOpen as EventListener);
    return () => window.removeEventListener("cbj:open-consent", onOpen as EventListener);
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
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.94)] shadow-[0_18px_44px_rgba(31,28,25,0.12)] backdrop-blur">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-5">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[var(--text-primary)]">
              アクセス解析について
            </p>
            <p className="mt-2 text-[12px] leading-[1.8] text-[var(--text-secondary)]">
              当サイトは品質改善のため、Google Analytics の計測を行う場合があります。
              許可すると閲覧データが匿名で収集されます。
              <Link
                href="/legal/privacy"
                className="ml-2 text-[var(--accent-strong)] underline underline-offset-4"
              >
                詳細
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={deny}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] px-4 text-[12px] font-semibold tracking-[0.08em] text-[var(--text-secondary)] transition hover:border-[rgba(31,28,25,0.16)] hover:text-[var(--text-primary)]"
            >
              拒否
            </button>
            <button
              type="button"
              onClick={accept}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[rgba(122,135,108,0.24)] bg-[rgba(122,135,108,0.12)] px-4 text-[12px] font-semibold tracking-[0.08em] text-[var(--accent-strong)] transition hover:border-[rgba(122,135,108,0.34)] hover:bg-[rgba(122,135,108,0.18)]"
            >
              許可
            </button>
          </div>
        </div>

        <span className="hidden">{pageKey}{consent}</span>
      </div>
    </div>
  );
}
