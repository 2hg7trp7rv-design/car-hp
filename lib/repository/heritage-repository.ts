// lib/repository/heritage-repository.ts

/**
 * HERITAGE用 Data Source層
 *
 * 役割:
 *・data/heritage.json,data/heritage1.jsonから“生データ”をそのまま取り出すだけ
 *・Domain層(lib/heritage.ts)がどんな構造で使うかまでは関与しない
 */

import heritageRaw from "@/data/heritage.json";
import heritageRaw1 from "@/data/heritage1.json";

// JSON1件分の型(生データ)。ここでは汎用的なキー/値の塊として扱う。
export type HeritageRecord = Record<string, unknown>;

/**
 * unknownを「HeritageRecordの配列」に正規化するユーティリティ
 *・配列ならそのまま
 *・オブジェクト1件なら[object]に包む
 *・それ以外は空配列
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

// data/heritage.json + data/heritage1.json をまとめて1本の配列にしてキャッシュ
const ALL_HERITAGE_INTERNAL: HeritageRecord[] = [
  ...toArray(heritageRaw),
  ...toArray(heritageRaw1),
];

/**
 * data/heritage*.jsonの全件を生データとして返す。
 * ここでは整形やソートは一切行わない。
 */
export function findAllHeritage(): HeritageRecord[] {
  return ALL_HERITAGE_INTERNAL;
}
