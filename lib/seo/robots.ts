// lib/seo/robots.ts
import type { Metadata } from "next";

export const INDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/**
 * noindex 用の robots 定義。
 *
 * NOTE:
 * - app/layout.tsx で `robots.googleBot` を指定しているため、
 *   ページ側で `robots` だけ noindex にしても `googlebot` が index のまま残ると、
 *   Google が index と解釈する可能性がある。
 * - そのため、noindex は `googleBot` も明示的に noindex にする。
 */
export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
};
