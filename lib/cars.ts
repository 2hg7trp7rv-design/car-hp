// lib/cars.ts

import carsData from "@/data/cars.json";

export type CarDifficulty = "basic" | "intermediate" | "advanced";

export type CarItem = {
  id: string;
  name: string;
  slug: string;
  maker: string;
  releaseYear?: number;
  difficulty?: CarDifficulty;
  bodyType?: string;
  segment?: string;
  grade?: string;
  summary: string;
  summaryLong?: string;
  engine?: string;
  powerPs?: number;
  torqueNm?: number;
  transmission?: string;
  drive?: string;
  fuel?: string;
  fuelEconomy?: string;
  priceNew?: string;
  priceUsed?: string;
  tags?: string[];
  heroImage?: string;
  mainImage?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;
  tiresFront?: string;
  tiresRear?: string;

  // OWNERSHIP NOTES 系
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];

  // 維持費のざっくり印象
  costImpression?: string;
};

type RawCar = (typeof carsData)[number];

function normalizeMaker(rawMaker: string | undefined): string {
  if (!rawMaker) return "OTHER";
  return rawMaker.toUpperCase();
}

function normalizeDifficulty(
  raw: string | undefined,
): CarDifficulty | undefined {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  if (value === "basic" || value === "intermediate" || value === "advanced") {
    return value;
  }
  return undefined;
}

function normalizeSlug(item: Partial<RawCar>): string {
  if (item.slug && item.slug.length > 0) return item.slug;
  if (item.id && item.id.length > 0) return item.id;
  return "";
}

function normalizeCar(item: RawCar): CarItem | null {
  const slug = normalizeSlug(item);
  if (!slug) return null;

  const maker = normalizeMaker(item.maker);

  // summary が空でも一覧に出したいので、プレースホルダーを用意
  const summaryRaw = item.summary ?? item.summaryLong ?? "";
  const summary =
    summaryRaw.trim().length > 0
      ? summaryRaw
      : "この車種の説明は準備中です。";

  // name が無いものだけ除外（summary はプレースホルダーで埋める）
  if (!item.name) {
    return null;
  }

  const normalized: CarItem = {
    id: item.id,
    name: item.name,
    slug,
    maker,
    releaseYear: item.releaseYear ?? undefined,
    difficulty: normalizeDifficulty(item.difficulty),
    bodyType: item.bodyType,
    segment: item.segment,
    grade: item.grade,
    summary,
    summaryLong: item.summaryLong,
    engine: item.engine,
    powerPs: item.powerPs ?? undefined,
    torqueNm: item.torqueNm ?? undefined,
    transmission: item.transmission,
    drive: item.drive,
    fuel: item.fuel,
    fuelEconomy: item.fuelEconomy,
    priceNew: item.priceNew,
    priceUsed: item.priceUsed,
    tags: item.tags,
    heroImage: item.heroImage,
    mainImage: (item as any).mainImage,
    lengthMm: (item as any).lengthMm,
    widthMm: (item as any).widthMm,
    heightMm: (item as any).heightMm,
    wheelbaseMm: (item as any).wheelbaseMm,
    weightKg: (item as any).weightKg,
    tiresFront: (item as any).tiresFront,
    tiresRear: (item as any).tiresRear,

    strengths: (item as any).strengths,
    weaknesses: (item as any).weaknesses,
    troubleTrends: (item as any).troubleTrends,
    costImpression: (item as any).costImpression,
  };

  return normalized;
}

function buildAllCars(): CarItem[] {
  const seen = new Map<string, CarItem>();

  for (const raw of carsData) {
    const normalized = normalizeCar(raw as RawCar);
    if (!normalized) continue;

    if (seen.has(normalized.slug)) continue;
    seen.set(normalized.slug, normalized);
  }

  const result = Array.from(seen.values());

  // 年式の新しい順 → 同年なら名前順
  result.sort((a, b) => {
    const yearA = a.releaseYear ?? 0;
    const yearB = b.releaseYear ?? 0;

    if (yearA !== yearB) return yearB - yearA;

    const nameA = a.name ?? "";
    const nameB = b.name ?? "";
    return nameA.localeCompare(nameB, "ja");
  });

  return result;
}

// ランタイム共通のキャッシュ
const ALL_CARS: CarItem[] = buildAllCars();

// サーバー用（従来どおり async）
export async function getAllCars(): Promise<CarItem[]> {
  return ALL_CARS;
}

// クライアントコンポーネント等から使う同期版
export function getAllCarsSync(): CarItem[] {
  return ALL_CARS;
}

export async function getCarBySlug(
  slug: string,
): Promise<CarItem | undefined> {
  return ALL_CARS.find((car) => car.slug === slug);
}
