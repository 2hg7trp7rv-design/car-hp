// app/fonts.ts
// Font strategy (WAVE 15)
// - Use `next/font/google` to self-host fonts.
// - Avoid runtime fetch to fonts.googleapis.com/fonts.gstatic.com.
// - Keep typography tokens stable via CSS variables.

import {
  Allura,
  Cormorant_Garamond,
  Inter,
  Noto_Serif_JP,
  Parisienne,
  Playfair_Display,
} from "next/font/google";

// UI / Latin
export const inter = Inter({
  // Inter is primarily used for UI, labels, and numbers.
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Premium display (Latin)
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  // Keep the upper weights that are used by hero headings.
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
});

// Editorial serif (Latin)
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

// Japanese serif (core reading font)
// NOTE:
// - CJK fonts are heavy. We intentionally limit weights to the ones we actually use.
// - If you later see missing mid-weights in QA (e.g., 500), add it back rather than widening everything.
export const notoSerifJp = Noto_Serif_JP({
  // Noto Serif JP is a Japanese family; we keep latin for mixed headings.
  // NOTE: Next.js' generated TypeScript subset definitions for CJK fonts can be inconsistent.
  // Using only `latin` keeps builds strict/clean. Japanese glyph coverage is still provided by the font family.
  // If you ever see Japanese falling back to system fonts, we will switch to local self-hosted JP fonts.
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-jp",
});

// Handwriting (used only in the intro)
// - Do not preload to avoid impacting LCP.
export const parisienne = Parisienne({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  preload: false,
  variable: "--font-parisienne",
});

export const allura = Allura({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  preload: false,
  variable: "--font-allura",
});

// Helper for RootLayout.
export const fontVariables = [
  inter.variable,
  playfairDisplay.variable,
  cormorantGaramond.variable,
  notoSerifJp.variable,
  parisienne.variable,
  allura.variable,
].join(" ");
