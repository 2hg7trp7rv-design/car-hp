// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";

import "./globals.css";
import { getSiteOrigin, getSiteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { fontVariables } from "./fonts";

const BRAND = "CAR BOUTIQUE JOURNAL";
const BRAND_DESC =
  "車種、実用、考察、系譜を整理する自動車エディトリアル";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: {
    default: BRAND,
    template: `%s | ${BRAND}`,
  },
  description: BRAND_DESC,
  openGraph: {
    type: "website",
    url: getSiteUrl(),
    siteName: BRAND,
    title: BRAND,
    description: BRAND_DESC,
    images: [
      {
        url: "/ogp-default.jpg",
        width: 1200,
        height: 630,
        alt: BRAND,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND,
    description: BRAND_DESC,
    images: ["/ogp-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "WosqURlP51rA8r-zabt5_bjCZdK1VYL7MkhoJ7txp-s",
  },
};

const WEBSITE_JSON_LD = {
  "@type": "WebSite",
  "@id": `${getSiteUrl()}/#website`,
  url: getSiteUrl(),
  name: BRAND,
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: `${getSiteUrl()}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const ORGANIZATION_JSON_LD = {
  "@type": "Organization",
  "@id": `${getSiteUrl()}/#organization`,
  name: BRAND,
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/icon-512x512.png`,
};

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={fontVariables}>
      <body className="overflow-x-hidden bg-[var(--bg-stage)] font-sans text-[var(--text-primary)] antialiased">
        <a href="#cb-main" className="cb-skip-link">
          本文へスキップ
        </a>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <PageViewTracker />
          <ConsentBanner />
        </Suspense>
        <JsonLd id="jsonld-website" data={WEBSITE_JSON_LD} />
        <JsonLd id="jsonld-organization" data={ORGANIZATION_JSON_LD} />

        <SiteHeader />

        <SmoothScrollProvider>
          <div className="flex min-h-screen flex-col bg-[var(--bg-stage)]">
            <div id="cb-main" tabIndex={-1} className="flex-1 pt-[64px] lg:pt-[72px]">
              {children}
            </div>
            <SiteFooter />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
