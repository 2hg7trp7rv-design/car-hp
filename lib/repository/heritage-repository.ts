// lib/repository/heritage-repository.ts

/**
 * HERITAGE用 Data Source層
 *
 * 役割:
 * ・data/heritage.jsonから“生データ”をそのまま取り出すだけ
 * ・Domain層( lib/heritage.ts )がどんな構造で使うかまでは関与しない
 */

import heritageRaw from "@/data/heritage.json";

// JSON1件分の型(生データ)。ここでは汎用的なキー/値の塊として扱う。
export type HeritageRecord = Record<string, unknown>;

/**
 * data/heritage.jsonの全件を生データとして返す。
 * ここでは整形やソートは一切行わない。
 */
export function findAllHeritage(): HeritageRecord[] {
  const items = heritageRaw as unknown;

  if (Array.isArray(items)) {
    return items as HeritageRecord[];
  }

  // 万が一配列でない構造だった場合も、型安全に空配列を返す
  return [];
}
