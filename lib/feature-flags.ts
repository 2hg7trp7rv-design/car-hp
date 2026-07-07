// lib/feature-flags.ts

/**
 * Feature flags (production defaults)
 *
 * 方針:
 * - “収益臭” を抑えたい運用では、マネタイズ UI は **デフォルトOFF**
 * - どうしても出したいときだけ、環境変数で明示的にONにする
 */

// NOTE: Next.js は `NEXT_PUBLIC_` のみクライアントへ公開される
export const ENABLE_MONETIZATION =
  process.env.NEXT_PUBLIC_ENABLE_MONETIZATION === "true";
