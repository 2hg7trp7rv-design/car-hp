// lib/repository/cars-repository.ts

/**
 * CARS Data Source層
 *
 * 役割:
 * - data/cars.json から“生データ”をそのまま取り出すだけ
 * - Domain層(lib/cars.ts)側ではこのモジュール経由でのみデータ取得する
 */

import carsJson from "@/data/cars.json";

// data/cars.json 1件分の「生の型」
export type CarsJson = typeof carsJson;
export type CarRecord = CarsJson[number];

/**
 * 生の車データを全件返す。
 * ここでは整形・ソート・フィルタは一切しない。
 */
export function findAllCars(): CarRecord[] {
  return carsJson as CarRecord[];
}
