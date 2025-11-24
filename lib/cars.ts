// lib/cars.ts

export type MaintenanceCostLevel = "low" | "medium" | "high";

export type Car = {
  id: string;
  name: string;
  slug: string;
  maker: string;
  releaseYear: number | null;

  // もともとの項目
  difficulty: string | null;
  summary: string | null;
  specHighlights: string | null;
  pros: string | null;
  cons: string | null;
  changeSummary: string | null;
  referenceUrl: string | null;

  // 追加項目(テンプレ完全版用)
  bodyType: string | null;
  segment: string | null;
  grade: string | null;
  summaryLong: string | null;

  engine: string | null;
  powerPs: number | null;
  torqueNm: number | null;
  transmission: string | null;
  drive: string | null;
  fuel: string | null;
  fuelEconomy: string | null;

  sizeMmLength: number | null;
  sizeMmWidth: number | null;
  sizeMmHeight: number | null;
  wheelbaseMm: number | null;
  weightKg: number | null;

  troubleTrends: string | null;
  maintenanceTips: string | null;

  costNewPriceRange: string | null;
  costUsedPriceRange: string | null;
  maintenanceCostLevel: MaintenanceCostLevel | null;

  recommendFor: string | null;
  notFor: string | null;
};

// JSONファイルから静的に読み込み
import carsData from "../data/cars.json";

// 型アサーションでCar[]として扱う
const CARS: Car[] = carsData as Car[];

export async function getAllCars(): Promise<Car[]> {
  return CARS;
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const car = CARS.find((c) => c.slug === slug);
  return car ?? null;
}
