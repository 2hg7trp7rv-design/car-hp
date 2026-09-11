"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  applyAnalyticsConsent,
  getStoredAnalyticsConsent,
  setStoredAnalyticsConsent,
  CONSENT_SETTINGS_EVENT,
} from "@/lib/analytics/consent";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredAnalyticsConsent();
    setOpen(stored === "unset");
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, onOpen);
  }, []);

  const accept = () => {
    setStoredAnalyticsConsent("granted");
    applyAnalyticsConsent("granted");
    setOpen(false);
  };

  const deny = () => {
    setStoredAnalyticsConsent("denied");
    applyAnalyticsConsent("denied");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <section role="region" aria-label="アクセス解析の設定" className="fixed inset-x-0 bottom-0 z-[110] px-4 pb-4 sm:pb-6">
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

      </div>
    </section>
  );
}
