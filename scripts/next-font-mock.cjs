/**
 * Local build helper (optional)
 *
 * Next.js' `next/font/google` downloads CSS + font files at build time.
 * In offline / restricted environments, `next build` can fail when it can't
 * reach fonts.googleapis.com.
 *
 * Usage (local only):
 *   NEXT_FONT_GOOGLE_MOCKED_RESPONSES=./scripts/next-font-mock.cjs npm run build
 *
 * This file is safe to keep in the repo because it is only used when the env
 * var is explicitly set.
 */

const MOCK_CSS = `
/* Mocked Google Fonts CSS (offline build) */
@font-face {
  font-family: '__mock__';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/mock.woff2) format('woff2');
}
`;

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      // Next will access by the full URL string.
      if (typeof prop === 'string') return MOCK_CSS;
      return undefined;
    },
  },
);
