// lib/operator.ts

/**
 * 運営者情報の単一ソース（single source of truth）
 *
 * - 実データは data/site/operator.json のみに置く
 * - サイト内で運営者名・連絡先等を表示する場合は必ずこのモジュール経由で参照する
 * - 未設定値は「要設定」のまま表示し、設定漏れが画面上で分かるようにする
 *   （セットアップ手順は docs/operator-setup.md を参照）
 */

import operatorJson from "@/data/site/operator.json";

export type OperatorProfile = {
  siteName: string;
  operatorName: string;
  operatorType: string;
  representative: string;
  address: string;
  contactEmail: string;
  established: string;
  businessDescription: string;
};

const FALLBACK = "要設定";

function readValue(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : FALLBACK;
}

const raw = operatorJson as Record<string, unknown>;

export const OPERATOR: OperatorProfile = {
  siteName: readValue(raw.siteName),
  operatorName: readValue(raw.operatorName),
  operatorType: readValue(raw.operatorType),
  representative: readValue(raw.representative),
  address: readValue(raw.address),
  contactEmail: readValue(raw.contactEmail),
  established: readValue(raw.established),
  businessDescription: readValue(raw.businessDescription),
};

/** 運営者情報が未設定（要設定のまま）かどうか */
export function isOperatorUnset(value: string): boolean {
  return value === FALLBACK;
}
