// components/analytics/GoogleAnalytics.tsx
"use client";

import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * GA4 loader (gtag.js) + Consent Mode (v2)
 *
 * - Use `afterInteractive` to reduce missed short visits / fast bounces (vs `lazyOnload`).
 * - Disable auto page_view here; PageViewTracker sends page views to support App Router SPA navigation.
 * - Consent Mode:
 *   - default: analytics_storage denied (until user choice is stored)
 *   - stored choice: read from cookie/localStorage key `cbj_analytics_consent_v1`
 *   - update: ConsentBanner applies `gtag('consent','update', ...)`
 *
 * Optional debug: set NEXT_PUBLIC_GA_DEBUG=1
 */
export function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
  const DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === "1";

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          // Read stored consent (cookie first, then localStorage)
          var cbjStoredConsent = (function () {
            try {
              var m = document.cookie.match(/(?:^|; )cbj_analytics_consent_v1=([^;]*)/);
              if (m && m[1]) return decodeURIComponent(m[1]);
            } catch (e) {}
            try {
              var v = window.localStorage.getItem('cbj_analytics_consent_v1');
              if (v) return v;
            } catch (e) {}
            return null;
          })();

          var cbjAnalyticsConsent = (cbjStoredConsent === 'granted') ? 'granted' : 'denied';

          // Consent Mode (v2): ads storages stay denied; analytics depends on stored consent
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: cbjAnalyticsConsent,
            wait_for_update: 500
          });

          gtag('js', new Date());

          var cbjGaConfig = {
            send_page_view: false,
            transport_type: 'beacon'
          };

          if (${DEBUG ? "true" : "false"}) {
            cbjGaConfig.debug_mode = true;
          }

          gtag('config', '${GA_ID}', cbjGaConfig);
        `}
      </Script>
    </>
  );
}
