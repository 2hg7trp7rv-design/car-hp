// lib/cars.ts

/**
 * CARS Domain層
 *
 * 役割:
 * - Data Source層(lib/repository/cars-repository)から上がってくる生データを
 *   画面(App層)で扱いやすい CarItem に正規化する
 * - ソートや難易度の正規化など、“ビジネスロジック寄り”はここで完結させる
 * - App層は data/*.json ではなく、このファイルの公開関数だけを見る
 *
 * 追加要素(全部載せ):
 * - CarItemInternal(一覧・詳細で使う拡張フィールド付き)
 * - 難易度ラベルやサイズラベルなどの表示用フィールド
 * - cars.json と BMW G30専用テンプレ(g30拡張)のブリッジ
 * - CARS×COLUMN×GUIDE×NEWS×HERITAGE の関連付けヘルパー
 * - 一覧用の検索・フィルタ用ユーティリティ
 */

import {
  findAllCars,
  type CarRecord,
} from "@/lib/repository/cars-repository";
import { findAllColumns } from "@/lib/repository/columns-repository";
import { findAllGuides } from "@/lib/repository/guides-repository";
import {
  findAllHeritage,
  type HeritageRecord,
} from "@/lib/repository/heritage-repository";
import {
  findAllNews,
  type NewsRecord,
} from "@/lib/repository/news-repository";
import {
  getG30TemplateBySlug,
  type G30CarTemplate,
} from "@/lib/car-bmw-530i-g30";

import type { ColumnItem, GuideItem } from "@/lib/content-types";

// ----------------------------------------
// 基本の型定義
// ----------------------------------------

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

  // 画像系
  heroImage?: string;
  mainImage?: string;

  // サイズ系
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

/**
 * 一覧・詳細向けの内部拡張型
 * (フィルタ・表示用の加工済みフィールドを含む)
 */
export type CarItemInternal = CarItem & {
  // 絞り込み・グルーピング用
  makerKey: string;
  bodyTypeKey?: string;
  segmentKey?: string;

  // 表示用ラベル
  difficultyLabel?: string;
  sizeLabel?: string;

  // ざっくりカテゴリ(セダン系・SUV系など)が増えたらここに載せていく想定
};

/**
 * 一覧用の検索・フィルタ入力
 */
export type CarSearchParams = {
  q?: string;
  maker?: string;
  difficulty?: CarDifficulty | "all";
  bodyType?: string;
  segment?: string;
  tag?: string;
};

// Data Source層から上がってくる“生”の1件分
type RawCar = CarRecord;

// ----------------------------------------
// 正規化ヘルパー
// ----------------------------------------

function normalizeDifficulty(
  raw: string | undefined,
): CarDifficulty | undefined {
  if (!raw) return undefined;
  const value = String(raw).toLowerCase();
  if (value === "basic" || value === "intermediate" || value === "advanced") {
    return value;
  }
  return undefined;
}

function difficultyToLabel(
  difficulty: CarDifficulty | undefined,
): string | undefined {
  switch (difficulty) {
    case "basic":
      return "維持しやすい";
    case "intermediate":
      return "手間とコストは中くらい";
    case "advanced":
      return "維持に手間とコストがかかる";
    default:
      return undefined;
  }
}

function normalizeSlug(item: Partial<RawCar>, fallbackId: string): string {
  const anyItem = item as any;
  if (anyItem.slug && String(anyItem.slug).length > 0) {
    return String(anyItem.slug);
  }
  if (anyItem.id && String(anyItem.id).length > 0) {
    return String(anyItem.id);
  }
  return fallbackId;
}

function normalizeMaker(maker: unknown): string {
  if (!maker) return "OTHER";
  const text = String(maker).trim();
  if (!text) return "OTHER";
  return text;
}

function buildMakerKey(maker: string): string {
  return maker.toUpperCase();
}

function normalizeFacetValue(value: unknown): string | undefined {
  if (!value) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  return text;
}

function buildSizeLabel(raw: any): string | undefined {
  const l = raw.lengthMm;
  const w = raw.widthMm;

  if (typeof l === "number" && typeof w === "number") {
    const lStr = `${Math.round(l)}`;
    const wStr = `${Math.round(w)}`;
    return `${lStr}×${wStr}mmクラス`;
  }

  // 既に sizeLabel 的なものがJSON側にあればそのまま尊重
  if (typeof raw.sizeLabel === "string" && raw.sizeLabel.trim().length > 0) {
    return raw.sizeLabel.trim();
  }

  return undefined;
}

/**
 * 生データ1件→CarItemInternalへの正規化
 */
function normalizeCar(raw: RawCar, index: number): CarItemInternal | null {
  const anyRaw = raw as any;

  // 最低限: name が無いものだけ除外
  if (!anyRaw.name) return null;

  const id = anyRaw.id ?? anyRaw.slug ?? `car-${index + 1}`;
  const slug = normalizeSlug(raw, id);
  const maker = normalizeMaker(anyRaw.maker);

  // summary が無い場合はダミーテキストを詰める(一覧に出したいので)
  const summaryRaw = anyRaw.summary ?? anyRaw.summaryLong ?? "";
  const summary =
    String(summaryRaw).trim().length > 0
      ? String(summaryRaw)
      : "この車種の説明は準備中です。";

  const difficulty = normalizeDifficulty(anyRaw.difficulty);
  const difficultyLabel = difficultyToLabel(difficulty);

  const bodyType = anyRaw.bodyType;
  const segment = anyRaw.segment;

  const sizeLabel = buildSizeLabel(anyRaw);

  const base: CarItem = {
    id: String(id),
    name: String(anyRaw.name),
    slug,
    maker,
    releaseYear:
      typeof anyRaw.releaseYear === "number" ? anyRaw.releaseYear : undefined,
    difficulty,
    bodyType,
    segment,
    grade: anyRaw.grade,
    summary,
    summaryLong: anyRaw.summaryLong,
    engine: anyRaw.engine,
    powerPs:
      typeof anyRaw.powerPs === "number" ? anyRaw.powerPs : undefined,
    torqueNm:
      typeof anyRaw.torqueNm === "number" ? anyRaw.torqueNm : undefined,
    transmission: anyRaw.transmission,
    drive: anyRaw.drive,
    fuel: anyRaw.fuel,
    fuelEconomy: anyRaw.fuelEconomy,
    priceNew: anyRaw.priceNew,
    priceUsed: anyRaw.priceUsed,
    tags: Array.isArray(anyRaw.tags) ? anyRaw.tags : undefined,
    heroImage: anyRaw.heroImage,
    mainImage: anyRaw.mainImage,
    lengthMm:
      typeof anyRaw.lengthMm === "number" ? anyRaw.lengthMm : undefined,
    widthMm:
      typeof anyRaw.widthMm === "number" ? anyRaw.widthMm : undefined,
    heightMm:
      typeof anyRaw.heightMm === "number" ? anyRaw.heightMm : undefined,
    wheelbaseMm:
      typeof anyRaw.wheelbaseMm === "number"
        ? anyRaw.wheelbaseMm
        : undefined,
    weightKg:
      typeof anyRaw.weightKg === "number" ? anyRaw.weightKg : undefined,
    tiresFront: anyRaw.tiresFront,
    tiresRear: anyRaw.tiresRear,
    strengths: Array.isArray(anyRaw.strengths)
      ? anyRaw.strengths
      : undefined,
    weaknesses: Array.isArray(anyRaw.weaknesses)
      ? anyRaw.weaknesses
      : undefined,
    troubleTrends: Array.isArray(anyRaw.troubleTrends)
      ? anyRaw.troubleTrends
      : undefined,
    costImpression: anyRaw.costImpression,
  };

  const internal: CarItemInternal = {
    ...base,
    makerKey: buildMakerKey(maker),
    bodyTypeKey: normalizeFacetValue(bodyType),
    segmentKey: normalizeFacetValue(segment),
    difficultyLabel,
    sizeLabel,
  };

  return internal;
}

// ----------------------------------------
// 全件ビルド & キャッシュ
// ----------------------------------------

function buildAllCarsInternal(): CarItemInternal[] {
  const seen = new Map<string, CarItemInternal>();
  const rawList = findAllCars();

  rawList.forEach((raw, index) => {
    const normalized = normalizeCar(raw as RawCar, index);
    if (!normalized) return;

    // slug が被っているものは最初の1件だけ採用
    if (seen.has(normalized.slug)) return;
    seen.set(normalized.slug, normalized);
  });

  const result = Array.from(seen.values());

  // 年式の新しい順 → 同年なら名前順(日本語考慮)
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
const ALL_CARS_INTERNAL: CarItemInternal[] = buildAllCarsInternal();

// ----------------------------------------
// 公開API:一覧・単体取得
// ----------------------------------------

/**
 * 全車種(表示用)を取得
 * Next.js App Router側からは基本この関数を使う想定
 */
export async function getAllCars(): Promise<CarItem[]> {
  return ALL_CARS_INTERNAL as CarItem[];
}

/**
 * クライアントコンポーネント等から使う同期版
 */
export function getAllCarsSync(): CarItem[] {
  return ALL_CARS_INTERNAL as CarItem[];
}

/**
 * 内部向け:拡張フィールド付きで取得したい場合はこちら
 */
export function getAllCarsInternalSync(): CarItemInternal[] {
  return ALL_CARS_INTERNAL;
}

/**
 * slugで1件取得(シンプル版)
 */
export async function getCarBySlug(
  slug: string,
): Promise<CarItem | undefined> {
  const hit = ALL_CARS_INTERNAL.find((car) => car.slug === slug);
  return hit as CarItem | undefined;
}

/**
 * slugで1件取得(拡張フィールド付き)
 */
export function getCarInternalBySlug(
  slug: string,
): CarItemInternal | undefined {
  return ALL_CARS_INTERNAL.find((car) => car.slug === slug);
}

// ----------------------------------------
// 一覧用検索・フィルタ
// ----------------------------------------

/**
 * シンプルなテキストマッチ用
 */
function matchesQuery(car: CarItemInternal, q?: string): boolean {
  if (!q) return true;
  const keyword = q.trim().toLowerCase();
  if (!keyword) return true;

  const haystack = [
    car.name,
    car.maker,
    car.summary,
    car.summaryLong,
    car.bodyType,
    car.segment,
    car.grade,
    ...(car.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword);
}

/**
 * 一覧ページなどで使うフィルタ用
 */
export function filterCars(params: CarSearchParams): CarItemInternal[] {
  const { q, maker, difficulty, bodyType, segment, tag } = params;

  return ALL_CARS_INTERNAL.filter((car) => {
    if (!matchesQuery(car, q)) return false;

    if (maker) {
      const mk = maker.toUpperCase();
      if (car.makerKey !== mk) return false;
    }

    if (difficulty && difficulty !== "all") {
      if (car.difficulty !== difficulty) return false;
    }

    if (bodyType) {
      if (!car.bodyTypeKey) return false;
      if (car.bodyTypeKey !== bodyType && car.bodyType !== bodyType) {
        return false;
      }
    }

    if (segment) {
      if (!car.segmentKey) return false;
      if (car.segmentKey !== segment && car.segment !== segment) {
        return false;
      }
    }

    if (tag) {
      const t = tag.toLowerCase();
      if (!car.tags || !car.tags.some((x) => x.toLowerCase() === t)) {
        return false;
      }
    }

    return true;
  });
}

// ----------------------------------------
// 関連コンテンツ(FK連携)ヘルパー
// ----------------------------------------

export type CarRelations = {
  columns: ColumnItem[];
  guides: GuideItem[];
  heritage: HeritageRecord[];
  news: NewsRecord[];
  g30Template?: G30CarTemplate | null;
};

export type CarWithRelations = CarItemInternal & {
  relations: CarRelations;
};

/**
 * COLUMN/GUIDE/NEWS/HERITAGE側の relatedCarSlugs,carSlug 等をもとに
 * 1車種にひもづくコンテンツをまとめて取得するヘルパー。
 *
 * data側が未整備なうちは件数0になるだけで、例外は投げない設計。
 */
export async function getCarWithRelations(
  slug: string,
): Promise<CarWithRelations | null> {
  const car = getCarInternalBySlug(slug);
  if (!car) return null;

  // ここはすべて同期関数なので、そのまま呼び出し
  const columns = findAllColumns();
  const guides = findAllGuides();
  const heritageAll = findAllHeritage();
  const newsAll = findAllNews();

  const relatedColumns = columns.filter((c) =>
    Array.isArray(c.relatedCarSlugs)
      ? c.relatedCarSlugs.includes(slug)
      : false,
  );

  const relatedGuides = guides.filter((g) =>
    Array.isArray(g.relatedCarSlugs)
      ? g.relatedCarSlugs.includes(slug)
      : false,
  );

  const relatedHeritage = heritageAll.filter((h) => {
    const anyH = h as any;
    if (
      typeof anyH.carSlug === "string" &&
      String(anyH.carSlug) === slug
    ) {
      return true;
    }
    if (Array.isArray(anyH.relatedCarSlugs)) {
      return anyH.relatedCarSlugs.includes(slug);
    }
    return false;
  });

  const relatedNews = newsAll.filter((n) => {
    const anyN = n as any;
    if (
      typeof anyN.carSlug === "string" &&
      String(anyN.carSlug) === slug
    ) {
      return true;
    }
    if (Array.isArray(anyN.relatedCarSlugs)) {
      return anyN.relatedCarSlugs.includes(slug);
    }
    return false;
  });

  const g30Template = getG30TemplateBySlug(slug);

  const relations: CarRelations = {
    columns: relatedColumns,
    guides: relatedGuides,
    heritage: relatedHeritage,
    news: relatedNews,
    g30Template,
  };

  return {
    ...car,
    relations,
  };
}
