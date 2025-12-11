// lib/repository/heritage-repository.ts

/**
 * HERITAGE 用 Data Source 層
 *
 * 役割:
 * - data/heritage.json から“生データ”をそのまま取り出すだけ
 * - Domain 層 (lib/heritage.ts) がどんな構造で使うかまでは関与しない
 */

import heritageRaw from "@/data/heritage.json";
import heritageRaw from "@/data/heritage1.json";

// JSON 1 件分の型 (生データ)。ここでは汎用的なキー/値の塊として扱う。
export type HeritageRecord = Record<string, unknown>;

/**
 * unknown を「HeritageRecord の配列」に正規化するユーティリティ
 * - 配列ならそのまま
 * - オブジェクト 1 件なら [object] に包む
 * - それ以外は空配列
 */
function toArray(data: unknown): HeritageRecord[] {
  if (Array.isArray(data)) {
    return data as HeritageRecord[];
  }
  if (data && typeof data === "object") {
    return [data as HeritageRecord];
  }
  return [];
}

// data/heritage.json を配列に正規化してキャッシュ
const ALL_HERITAGE_INTERNAL: HeritageRecord[] = toArray(heritageRaw);

/**
 * data/heritage.json の全件を生データとして返す。
 * ここでは整形やソートは一切行わない。
 */
export function findAllHeritage(): HeritageRecord[] {
  return ALL_HERITAGE_INTERNAL;
}
