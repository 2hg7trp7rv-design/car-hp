import localFont from "next/font/local";

export const refbookSans = localFont({
  src: [
    {
      path: "./refbook-fonts/noto-sans-jp-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./refbook-fonts/noto-sans-jp-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./refbook-fonts/noto-sans-jp-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-refbook-sans",
  display: "swap",
  fallback: ["Hiragino Kaku Gothic ProN", "Hiragino Sans", "sans-serif"],
});

export const refbookRounded = localFont({
  src: [
    {
      path: "./refbook-fonts/m-plus-rounded-1c-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-refbook-rounded",
  display: "swap",
  fallback: ["Hiragino Maru Gothic ProN", "Hiragino Sans", "sans-serif"],
});
