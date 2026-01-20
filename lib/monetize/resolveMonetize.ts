// lib/monetize/resolveMonetize.ts

import monetizeMap from "@/data/monetizeMap.json";

export type MonetizeKey = string;

export type MonetizeConfig = {
  monetizeKey: string;
  partner: string;
  disclosure: "PR" | string;
  primaryLabel: string;
  primaryUrl: string;
};

type MonetizeMapJson = Record<
  string,
  {
    partner: string;
    disclosure?: string;
    primaryLabel: string;
    primaryUrl: string;
  }
>;

export function resolveMonetize(monetizeKey?: MonetizeKey | null): MonetizeConfig | null {
  if (!monetizeKey) return null;

  const map = monetizeMap as unknown as MonetizeMapJson;
  const cfg = map[monetizeKey];
  if (!cfg) return null;

  return {
    monetizeKey,
    partner: cfg.partner,
    disclosure: (cfg.disclosure ?? "PR") as any,
    primaryLabel: cfg.primaryLabel,
    primaryUrl: cfg.primaryUrl,
  };
}

/**
 * URLにトラッキング等を付けたい場合のフック（今はそのまま返す）
 * - 後でA/Bや計測が必要ならここだけ触れば良い
 */
export function withTracking(url: string): string {
  return url;
}
