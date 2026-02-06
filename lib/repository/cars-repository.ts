// lib/repository/cars-repository.ts

/**
 * CARS DataSource層
 *
 * 役割:
 * - data/articles/cars/*.json をメタデータの正として読み込む
 * - JSONの揺れ・欠損を吸収し、統一された CarItem 型として提供する
 * - Markdown補完はしない（D.⑩: Markdown+JSON併用禁止）
 */

import type { CarItem, ContentStatus } from "@/lib/content-types";
import { readJsonDir } from "./data-dir";

import {
  normalizeMakerKey,
  normalizeMakerLabel,
} from "@/lib/taxonomy/makers";
import { normalizeBodyTypeLabel } from "@/lib/taxonomy/body-types";
import { normalizeSegmentLabel } from "@/lib/taxonomy/segments";

// ----------------------------------------
// JSON生データの型定義 (入力用)
// ----------------------------------------
// JSONには必須項目が欠けている可能性があるため、すべて optional/unknown で受ける
type RawCarRecord = {
  id?: unknown;
  slug?: unknown;
  status?: unknown;
  noindex?: unknown;

  // 企画書v4: 公開状態（SEO運用）
  publicState?: unknown;
  parentPillarId?: unknown;
  relatedClusterIds?: unknown;
  primaryQuery?: unknown;
  updateReason?: unknown;
  sources?: unknown;
  name?: unknown;
  maker?: unknown;

  releaseYear?: unknown;

  difficulty?: unknown;
  bodyType?: unknown;
  segment?: unknown;
  grade?: unknown;
  engine?: unknown;
  drive?: unknown;
  transmission?: unknown;
  fuel?: unknown;
  powerPs?: unknown;
  torqueNm?: unknown;
  fuelEconomy?: unknown;

  summary?: unknown;
  summaryLong?: unknown;
  costImpression?: unknown;
  body?: unknown;

  heroImage?: unknown;
  mainImage?: unknown;

  relatedNewsIds?: unknown;

  tags?: unknown;
  intentTags?: unknown;

  relatedCarSlugs?: unknown;
  relatedGuideSlugs?: unknown;
  relatedColumnSlugs?: unknown;
  relatedHeritageSlugs?: unknown;

  strengths?: unknown;
  weaknesses?: unknown;
  troubleTrends?: unknown;
  bestFor?: unknown;
  notFor?: unknown;
  maintenanceNotes?: unknown;

  lengthMm?: unknown;
  widthMm?: unknown;
  heightMm?: unknown;
  wheelbaseMm?: unknown;
  weightKg?: unknown;

  priceNew?: unknown;
  priceUsed?: unknown;
  zeroTo100?: unknown;

  // 企画書: Carsルール（判断・維持費）
  purchasePriceSafe?: unknown;
  maintenanceSimulation?: unknown;
  maintenanceCostYenPerYear?: unknown;
};

// ----------------------------------------
// ユーティリティ
// ----------------------------------------

function isString(val: unknown): val is string {
  return typeof val === "string" && val.trim().length > 0;
}

function coerceString(val: unknown): string {
  return isString(val) ? val.trim() : "";
}

function coerceStringNullable(val: unknown): string | null {
  return isString(val) ? val.trim() : null;
}

const ALLOWED_STATUS: ReadonlySet<ContentStatus> = new Set([
  "draft",
  "published",
  "archived",
]);

function coerceStatus(val: unknown): ContentStatus {
  const s = coerceStringNullable(val);
  if (!s) return "published";
  if (ALLOWED_STATUS.has(s as ContentStatus)) return s as ContentStatus;
  return "published";
}

const ALLOWED_PUBLIC_STATE = new Set(["index", "noindex", "draft", "redirect"]);

function coercePublicState(val: unknown, status: ContentStatus, noindex?: boolean): any {
  const s = coerceStringNullable(val);
  if (s && ALLOWED_PUBLIC_STATE.has(s)) return s;

  // フォールバック（安全側）
  if (status !== "published") return "draft";
  if (noindex) return "noindex";
  return "noindex";
}


function coerceBoolean(val: unknown): boolean | undefined {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return undefined;
}

function coerceNumber(val: unknown): number | undefined {
  return typeof val === "number" && !Number.isNaN(val) ? val : undefined;
}

function coerceStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.filter(isString).map((v) => v.trim());
  }
  if (isString(val)) {
    return [val.trim()];
  }
  return [];
}

function coerceMaintenanceSimulation(val: unknown): { yearlyRoughTotal?: string | null } | null {
  if (!val || typeof val !== "object") return null;
  const yearly = (val as any).yearlyRoughTotal;
  const yearlyRoughTotal = coerceStringNullable(yearly);
  if (!yearlyRoughTotal) return null;
  return { yearlyRoughTotal };
}

function toArray(data: unknown): RawCarRecord[] {
  return Array.isArray(data) ? (data as RawCarRecord[]) : [];
}

// ----------------------------------------
// Markdown bodies (content/cars/*.md)
// ----------------------------------------

// ----------------------------------------
// 正規化ロジック (JSON -> CarItem)
// ----------------------------------------

function normalizeCar(raw: RawCarRecord, index: number): CarItem {
  const id =
    coerceStringNullable(raw.id) ??
    coerceStringNullable(raw.slug) ??
    `car-${index}`;

  const slug = coerceStringNullable(raw.slug) ?? id;

  const status = coerceStatus(raw.status);
  const noindex = coerceBoolean(raw.noindex);

  // 長文本文（任意）
  // 1) content/cars/<slug>.md があればそれを優先（スマホ運用・差分管理が楽）
  // 2) なければ JSON の body を使用
  const bodyFromJson = coerceStringNullable(raw.body);
  const body = bodyFromJson;

  const name = coerceString(raw.name);
  const maker = normalizeMakerLabel(coerceString(raw.maker));
  const makerKey = normalizeMakerKey(maker);

  const item: CarItem = {
    type: "CAR",
    status,
    noindex,
    publicState: coercePublicState(raw.publicState, status, noindex),
    parentPillarId: coerceStringNullable(raw.parentPillarId) ?? `/cars/makers/${makerKey}`,
    relatedClusterIds: coerceStringArray(raw.relatedClusterIds),
    primaryQuery: coerceStringNullable(raw.primaryQuery) ?? `${maker} ${name}`.trim(),
    updateReason: coerceStringNullable(raw.updateReason) ?? "initial-import",
    sources: coerceStringArray(raw.sources),

    id,
    slug,
    title: `${maker} ${name}`.trim(),
    name,
    maker,
    makerKey,

    releaseYear: coerceNumber(raw.releaseYear),

    difficulty: coerceStringNullable(raw.difficulty) ?? undefined,
    bodyType: normalizeBodyTypeLabel(coerceStringNullable(raw.bodyType)) || undefined,
    segment: normalizeSegmentLabel(coerceStringNullable(raw.segment)) || undefined,
    grade: coerceStringNullable(raw.grade) ?? undefined,

    engine: coerceStringNullable(raw.engine) ?? undefined,
    drive: coerceStringNullable(raw.drive) ?? undefined,
    transmission: coerceStringNullable(raw.transmission) ?? undefined,
    fuel: coerceStringNullable(raw.fuel) ?? undefined,

    powerPs: coerceNumber(raw.powerPs),
    torqueNm: coerceNumber(raw.torqueNm),
    fuelEconomy: coerceStringNullable(raw.fuelEconomy) ?? undefined,

    summary: coerceStringNullable(raw.summary) ?? undefined,
    summaryLong: coerceStringNullable(raw.summaryLong) ?? undefined,
    costImpression: coerceStringNullable(raw.costImpression) ?? undefined,

    body: body ?? null,

    heroImage: coerceStringNullable(raw.heroImage),
    mainImage: coerceStringNullable(raw.mainImage),

    relatedNewsIds: coerceStringArray(raw.relatedNewsIds),

    tags: coerceStringArray(raw.tags),
    intentTags: coerceStringArray(raw.intentTags),

    relatedCarSlugs: coerceStringArray(raw.relatedCarSlugs),
    relatedGuideSlugs: coerceStringArray(raw.relatedGuideSlugs),
    relatedColumnSlugs: coerceStringArray(raw.relatedColumnSlugs),
    relatedHeritageSlugs: coerceStringArray(raw.relatedHeritageSlugs),

    strengths: coerceStringArray(raw.strengths),
    weaknesses: coerceStringArray(raw.weaknesses),
    troubleTrends: coerceStringArray(raw.troubleTrends),
    bestFor: coerceStringArray(raw.bestFor),
    notFor: coerceStringArray(raw.notFor),
    maintenanceNotes: coerceStringArray(raw.maintenanceNotes),

    lengthMm: coerceNumber(raw.lengthMm),
    widthMm: coerceNumber(raw.widthMm),
    heightMm: coerceNumber(raw.heightMm),
    wheelbaseMm: coerceNumber(raw.wheelbaseMm),
    weightKg: coerceNumber(raw.weightKg),

    priceNew: coerceStringNullable(raw.priceNew) ?? undefined,
    priceUsed: coerceStringNullable(raw.priceUsed) ?? undefined,
    zeroTo100: coerceNumber(raw.zeroTo100),

    purchasePriceSafe: coerceStringNullable(raw.purchasePriceSafe),
    maintenanceSimulation: coerceMaintenanceSimulation(raw.maintenanceSimulation),
    maintenanceCostYenPerYear: coerceNumber(raw.maintenanceCostYenPerYear) ?? null,
  };

  return item;
}

// ----------------------------------------
// データ統合（cars.json + cars2.json）
// ----------------------------------------

/**
 * cars.json + cars2.json を「生配列」としてまとめる
 *
 * - ファイルごとの優先順位: 後ろに書かれているファイルほど“後勝ち”になる
 * - 上書き更新の運用（slug重複）のために、後続ファイルを末尾に置く
 */
const RAW_ALL: RawCarRecord[] = readJsonDir("data/articles/cars");

const ALL_CARS_INTERNAL: CarItem[] = (() => {
  const map = new Map<string, CarItem>();

  RAW_ALL.forEach((raw, idx) => {
    const item = normalizeCar(raw, idx);
    if (!item.slug) return;
    // slug 後勝ち（修正・上書き耐性）
    map.set(item.slug, item);
  });

  return Array.from(map.values());
})();

// ----------------------------------------
// 公開API
// ----------------------------------------

export function findAllCars(): CarItem[] {
  return ALL_CARS_INTERNAL;
}

export function findCarBySlug(slug: string): CarItem | undefined {
  return ALL_CARS_INTERNAL.find((c) => c.slug === slug);
}

export function findCarById(id: string): CarItem | undefined {
  return ALL_CARS_INTERNAL.find((c) => c.id === id);
}

export function findCarsByMaker(maker: string): CarItem[] {
  return ALL_CARS_INTERNAL.filter((c) => c.maker === maker);
}

export function findCarsByMakerKey(makerKey: string): CarItem[] {
  const key = makerKey.trim();
  if (!key) return [];
  return ALL_CARS_INTERNAL.filter((c) => c.makerKey === key);
}

export function findCarsByBodyType(bodyType: string): CarItem[] {
  return ALL_CARS_INTERNAL.filter((c) => c.bodyType === bodyType);
}

export function findCarsBySegment(segment: string): CarItem[] {
  return ALL_CARS_INTERNAL.filter((c) => c.segment === segment);
}

export function getCarsCount(): number {
  return ALL_CARS_INTERNAL.length;
}

// メタ情報取得（TypeScript安全）
export function listAllMakers(): string[] {
  return Array.from(
    new Set(ALL_CARS_INTERNAL.map((c) => c.maker).filter(isString))
  ).sort();
}

export function listAllBodyTypes(): string[] {
  return Array.from(
    new Set(ALL_CARS_INTERNAL.map((c) => c.bodyType).filter(isString))
  ).sort();
}

export function listAllSegments(): string[] {
  return Array.from(
    new Set(ALL_CARS_INTERNAL.map((c) => c.segment).filter(isString))
  ).sort();
}
