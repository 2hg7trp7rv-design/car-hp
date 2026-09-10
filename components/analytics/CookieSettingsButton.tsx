"use client";

import { openConsentSettings } from "@/lib/analytics/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      Cookie設定
    </button>
  );
}
