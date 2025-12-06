// lib/repository/cars-repository.ts

/**
 * CARS用 Data Source層
 *
 * 役割:
 * ・data/cars.jsonから“生データ”をそのまま取り出すだけ
 * ・Domain層(lib/cars.ts)がどんな構造で使うかまでは関与しない
 */

import carsRaw from "@/data/cars.json";

// JSON1件分の型(生データ)。ここでは汎用的なキー/値の塊として扱う。
export type CarRecord = Record<string, unknown>;

/**
 * data/cars.jsonの全件を生データとして返す。
 * ここでは整形やソートは一切行わない。
 */
export function findAllCars(): CarRecord[] {
  const items = carsRaw as unknown;

  if (Array.isArray(items)) {
    return items as CarRecord[];
  }

  // 万が一配列でない構造だった場合も、型安全に空配列を返す
  return [];
}
