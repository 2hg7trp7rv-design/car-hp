// lib/analytics/consent.ts

export type AnalyticsConsent = "granted" | "denied" | "unset";

export const CBJ_ANALYTICS_CONSENT_KEY = "cbj_analytics_consent_v1";
export const CBJ_ANALYTICS_CONSENT_COOKIE = "cbj_analytics_consent_v1";

/**
 * Read stored consent (cookie first, then localStorage).
 * Returns "unset" if nothing is stored or in non-browser contexts.
 */
export function getStoredAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return "unset";

  try {
    const cookieMatch = document.cookie.match(
      new RegExp(`(?:^|; )${CBJ_ANALYTICS_CONSENT_COOKIE}=([^;]*)`),
    );
    const cookieValue = cookieMatch ? decodeURIComponent(cookieMatch[1] ?? "") : "";
    if (cookieValue === "granted" || cookieValue === "denied") return cookieValue;

    const ls = window.localStorage.getItem(CBJ_ANALYTICS_CONSENT_KEY);
    if (ls === "granted" || ls === "denied") return ls;
  } catch {
    // ignore
  }

  return "unset";
}

export function setStoredAnalyticsConsent(value: Exclude<AnalyticsConsent, "unset">): void {
  if (typeof window === "undefined") return;

  try {
    // localStorage
    window.localStorage.setItem(CBJ_ANALYTICS_CONSENT_KEY, value);

    // cookie (180 days)
    const maxAge = 60 * 60 * 24 * 180;
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(
      value,
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function clearStoredAnalyticsConsent(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CBJ_ANALYTICS_CONSENT_KEY);
  } catch {
    // ignore
  }

  try {
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function hasAnalyticsConsent(): boolean {
  return getStoredAnalyticsConsent() === "granted";
}

/**
 * Apply consent to gtag Consent Mode (v2).
 * - Keeps ads-related storages denied by default.
 */
export function applyAnalyticsConsent(value: Exclude<AnalyticsConsent, "unset">): void {
  if (typeof window === "undefined") return;

  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  const dataLayer = (window as any).dataLayer as undefined | any[];

  const payload = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: value,
  };

  if (typeof gtag === "function") {
    gtag("consent", "update", payload);
    return;
  }

  // If gtag isn't ready yet, queue into dataLayer (gtag will consume later)
  if (Array.isArray(dataLayer)) {
    dataLayer.push(["consent", "update", payload]);
  }
}
