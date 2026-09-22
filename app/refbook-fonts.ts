import localFont from "next/font/local";

// Body text uses the reader's system Japanese face. A subset web font for body copy
// has to carry every character the site can render; anything it misses falls back
// mid-sentence and the mismatch is visible. Headings keep the rounded face below,
// whose subset is generated from every reference surface by scripts/subset-refbook-fonts.py.
export const refbookRounded = localFont({
  src: [
    {
      path: "./refbook-fonts/m-plus-rounded-1c-800-subset.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-refbook-rounded",
  display: "swap",
  fallback: ["Hiragino Maru Gothic ProN", "Hiragino Sans", "sans-serif"],
});
