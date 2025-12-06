// lib/cars.ts

/**
 * CARS Domain層
 *
 * 役割:
 * - Data Source層(lib/repository/cars-repository)から上がってくる生データを
 *   画面(App層)で扱いやすい CarItem に正規化する
 * - ソートや難易度の正規化など、“ビジネスロジック寄り”はここで完結させる
 * - App層は data/*.json ではなく、このファイルの公開関数だけを見る
 */

import {
  findAllCars,
  type CarRecord,
} from "@/lib/repository/cars-repository";

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

// Data Source層から上がってくる“生”の1件分
type RawCar = CarRecord;

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

function normalizeSlug(item: Partial<RawCar>, fallbackId: string): string {
  if (item.slug && item.slug.length > 0) return item.slug as string;
  if (item.id && (item.id as string).length > 0) return item.id as string;
  return fallbackId;
}

function normalizeCar(raw: RawCar, index: number): CarItem | null {
  // 最低限：name が無いものだけ除外
  if (!raw.name) return null;

  const anyRaw = raw as any;

  const id = anyRaw.id ?? anyRaw.slug ?? `car-${index}`;
  const slug = normalizeSlug(raw, id);

  // summary が無い場合はダミーテキストを詰める（一覧に出したいので）
  const summaryRaw = anyRaw.summary ?? anyRaw.summaryLong ?? "";
  const summary =
    String(summaryRaw).trim().length > 0
      ? String(summaryRaw)
      : "この車種の説明は準備中です。";

  const normalized: CarItem = {
    id,
    name: anyRaw.name,
    slug,
    maker: anyRaw.maker ?? "OTHER",
    releaseYear: anyRaw.releaseYear ?? undefined,
    difficulty: normalizeDifficulty(anyRaw.difficulty),
    bodyType: anyRaw.bodyType,
    segment: anyRaw.segment,
    grade: anyRaw.grade,
    summary,
    summaryLong: anyRaw.summaryLong,
    engine: anyRaw.engine,
    powerPs: anyRaw.powerPs ?? undefined,
    torqueNm: anyRaw.torqueNm ?? undefined,
    transmission: anyRaw.transmission,
    drive: anyRaw.drive,
    fuel: anyRaw.fuel,
    fuelEconomy: anyRaw.fuelEconomy,
    priceNew: anyRaw.priceNew,
    priceUsed: anyRaw.priceUsed,
    tags: anyRaw.tags,
    heroImage: anyRaw.heroImage,
    mainImage: anyRaw.mainImage,
    lengthMm: anyRaw.lengthMm,
    widthMm: anyRaw.widthMm,
    heightMm: anyRaw.heightMm,
    wheelbaseMm: anyRaw.wheelbaseMm,
    weightKg: anyRaw.weightKg,
    tiresFront: anyRaw.tiresFront,
    tiresRear: anyRaw.tiresRear,
    strengths: anyRaw.strengths,
    weaknesses: anyRaw.weaknesses,
    troubleTrends: anyRaw.troubleTrends,
    costImpression: anyRaw.costImpression,
  };

  return normalized;
}

function buildAllCars(): CarItem[] {
  const seen = new Map<string, CarItem>();

  const rawList = findAllCars();

  rawList.forEach((raw, index) => {
    const normalized = normalizeCar(raw as RawCar, index);
    if (!normalized) return;

    // slug が被っているものは最初の1件だけ採用
    if (seen.has(normalized.slug)) return;

    seen.set(normalized.slug, normalized);
  });

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
