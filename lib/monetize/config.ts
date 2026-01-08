// lib/monetize/config.ts

import type { MonetizeKey as ContentMonetizeKey } from "@/lib/content-types";
import { resolveOutboundUrl } from "@/lib/affiliate";

// Cars詳細などで使っている「旧キー」も互換として許容
export type MonetizeKey = ContentMonetizeKey | "ins_compare";

export interface MonetizeConfig {
  key: MonetizeKey;
  url: string;
  label: string;
  description?: string;
}

type ConfigBase = Omit<MonetizeConfig, "url">;

const MONETIZE_CONFIG: Record<string, ConfigBase> = {
  car_search_conditions: {
    key: "car_search_conditions",
    label: "条件で在庫を探す",
    description: "近い条件の個体を探す",
  },
  car_search_price: {
    key: "car_search_price",
    label: "中古相場を見る",
    description: "価格帯と傾向を把握する",
  },
  loan_estimate: {
    key: "loan_estimate",
    label: "月々の目安を出す",
    description: "支払いイメージをつかむ",
  },
  loan_precheck: {
    key: "loan_precheck",
    label: "ローン審査を確認",
    description: "事前に条件を揃える",
  },
  sell_price_check: {
    key: "sell_price_check",
    label: "愛車の相場を知る",
    description: "まずは現在の価値を把握",
  },
  sell_prepare: {
    key: "sell_prepare",
    label: "損しない準備を確認する",
    description: "査定前の重要チェック",
  },

  // 互換: 旧キー
  ins_compare: {
    key: "ins_compare",
    label: "条件を揃えて見直す",
    description: "維持費の最適化",
  },
};

export const getMonetizeConfig = (
  key: MonetizeKey,
  opts?: { carName?: string | null },
): MonetizeConfig => {
  const base = MONETIZE_CONFIG[key] ?? { key, label: "詳細を見る" };

  const url =
    resolveOutboundUrl({
      monetizeKey: key,
      carName: opts?.carName ?? null,
    }) ?? "";

  return {
    ...base,
    key,
    url,
  };
};
