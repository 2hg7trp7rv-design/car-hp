// lib/heritage.ts

/**
 * HERITAGE Domain層
 *
 * 役割:
 * - Data Source層(lib/repository/heritage-repository)から上がってくる生データを
 *   画面(App層)で扱いやすい HeritageItem にマッピングする
 * - kind/brand/model/年代などの整形やソートをここで完結させる
 * - CARSやGUIDEなど他コンテンツとの連携を見据えたヘルパーをまとめる
 */

import {
  findAllHeritage,
  type HeritageRecord,
} from "@/lib/repository/heritage-repository";
import type {
  HeritageKind,
  ContentStatus,
} from "@/lib/content-types";

// lib/heritage から HeritageKind も直接使えるようにしておく
export type { HeritageKind } from "@/lib/content-types";

// ========================================
// 型定義
// ========================================

type RawHeritageItem = HeritageRecord;

// sections 用の型
export type HeritageSection = {
  id: string;
  title?: string | null;
  summary?: string | null;
};

/**
 * App層から扱う HERITAGE 用の型
 *
 * data/heritage*.json の素の構造に引きずられないように、
 * 画面でほぼそのまま使える形に正規化しておく。
 */
export type HeritageItem = {
  id: string;
  slug: string;
  type: "HERITAGE";

  // 公開ステータス(draft/published/archived)
  status?: ContentStatus;

  // タイトル/要約
  title: string;
  seoTitle?: string | null;
  titleJa?: string | null;
  subtitle?: string | null;
  lead?: string | null;
  summary?: string | null;

  // HERITAGE の種別(時代/ブランド/車種など)
  kind: HeritageKind;

  // メーカー/ブランド/モデル/世代
  maker?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  generationCode?: string | null;

  // 時代/年式表現
  eraLabel?: string | null; // 例: "第1世代GT-R"
  years?: string | null; // 例: "1969–1973"

  // ヒーローエリア用
  heroTitle?: string | null; // ページ上部で強調するタイトル
  heroCaption?: string | null; // ヒーロー画像の下に置く説明文
  heroImage?: string | null;
  heroImageCredit?: string | null;
  heroTone?: string | null; // ダーク/ライトなど、トーン指定があれば

  // 本文
  body: string;

  // セクション（Ferrari などの章立て用）
  sections?: HeritageSection[] | null;

  // ハイライト/タグ
  highlights?: string[] | null;
  tags?: string[] | null;

  // 代表車種や関連コンテンツ
  keyModels?: string[] | null;
  relatedCarIds?: string[] | null;
  relatedHeritageSlugs?: string[] | null;
  relatedCarSlugs?: string[] | null;
  relatedNewsIds?: string[] | null;
  relatedGuideSlugs?: string[] | null;

  // 日付系
  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;

  // 出典情報など
  sourceName?: string | null;
  sourceUrl?: string | null;

  // 年表などで使う任意の並び順
  timelineOrder?: number | null;

  // 手動で指定する想定の読了時間
  readingTimeMinutes?: number | null;
};

// ========================================
// 小さなユーティリティ
// ========================================

function safeString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function toStringArray(value: unknown): string[] | null {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const arr = value
      .map((v) => safeString(v))
      .filter((v): v is string => !!v);
    return arr.length > 0 ? arr : null;
  }

  const single = safeString(value);
  return single ? [single] : null;
}

function normalizeStatus(
  status: string | null,
): ContentStatus | undefined {
  if (!status) return "draft";
  const lower = status.toLowerCase();
  if (lower === "published") return "published";
  if (lower === "archived") return "archived";
  return "draft";
}

// ========================================
// 生データ → HeritageItem への変換
// ========================================

function toHeritageItem(
  raw: RawHeritageItem,
  index: number,
): HeritageItem | null {
  if (!raw || typeof raw !== "object") return null;
  const anyRaw = raw as Record<string, unknown>;

  // ID/slug
  const id = safeString(anyRaw.id) ?? `heritage-${index}`;
  const slug = safeString(anyRaw.slug) ?? id;

  // kind(未指定ならCARとして扱う)
  const rawKind = safeString(anyRaw.kind) as HeritageKind | null;
  const kind: HeritageKind =
    rawKind === "ERA" || rawKind === "BRAND" || rawKind === "CAR"
      ? rawKind
      : "CAR";

  // タイトル関連
  const titleJa = safeString(anyRaw.titleJa);
  const seoTitle = safeString(anyRaw.seoTitle);
  const baseTitle =
    safeString(anyRaw.title) ?? seoTitle ?? titleJa ?? "タイトル未設定";
  const subtitle = safeString(anyRaw.subtitle);

  // 概要/リード
  const summary =
    safeString(anyRaw.summary) ?? safeString(anyRaw.lead) ?? null;
  const lead = safeString(anyRaw.lead) ?? summary;

  // メーカー/ブランド/モデル/世代
  const maker = safeString(anyRaw.maker);
  const brandName =
    safeString(anyRaw.brandName) ?? maker ?? null;
  const modelName =
    safeString(anyRaw.modelName) ??
    safeString(anyRaw.model) ??
    null;
  const generationCode =
    safeString(anyRaw.generationCode) ??
    safeString(anyRaw.code) ??
    null;

  // 時代/年式表現
  const eraLabel =
    safeString(anyRaw.eraLabel) ??
    safeString(anyRaw.era) ??
    safeString(anyRaw.period) ??
    null;
  const years =
    safeString(anyRaw.years) ??
    safeString(anyRaw.productionYears) ??
    safeString(anyRaw.yearRange) ??
    null;

  // ヒーローエリア用の情報
  const heroTitle = safeString(anyRaw.heroTitle);
  const heroCaption = safeString(anyRaw.heroCaption);
  const heroImage =
    safeString(anyRaw.heroImage) ??
    safeString(anyRaw.imageUrl) ??
    safeString(anyRaw.thumbnail) ??
    null;
  const heroImageCredit = safeString(anyRaw.heroImageCredit);
  const heroTone = safeString(anyRaw.heroTone);

  // 本文
  const body =
    safeString(anyRaw.body) ??
    safeString(anyRaw.content) ??
    summary ??
    "";

  // sections（Ferrari などの章立て）
  let sections: HeritageSection[] | null = null;
  const rawSections = (anyRaw as any).sections;
  if (Array.isArray(rawSections)) {
    const mappedSections: HeritageSection[] = [];
    for (const sec of rawSections) {
      if (!sec || typeof sec !== "object") continue;
      const anySec = sec as Record<string, unknown>;
      const id =
        safeString(anySec.id) ?? `section-${mappedSections.length}`;
      const title = safeString(anySec.title);
      const summary = safeString(anySec.summary);
      mappedSections.push({
        id,
        title: title ?? null,
        summary: summary ?? null,
      });
    }
    if (mappedSections.length > 0) {
      sections = mappedSections;
    }
  }

  // ハイライト/タグ/関連CARS/HERITAGE
  const highlights = toStringArray(anyRaw.highlights);
  const tags = toStringArray(anyRaw.tags);
  const keyModels = toStringArray(anyRaw.keyModels);
  const relatedCarIds = toStringArray(anyRaw.relatedCarIds);
  const relatedHeritageSlugs = toStringArray(
    anyRaw.relatedHeritageSlugs,
  );
  const relatedCarSlugs = toStringArray(anyRaw.relatedCarSlugs);
  const relatedNewsIds = toStringArray(anyRaw.relatedNewsIds);
  const relatedGuideSlugs = toStringArray(
    anyRaw.relatedGuideSlugs,
  );

  // ステータス/日付/ソース
  const status = normalizeStatus(safeString(anyRaw.status));
  const createdAt = safeString(anyRaw.createdAt);
  const publishedAt = safeString(anyRaw.publishedAt);
  const updatedAt = safeString(anyRaw.updatedAt);
  const sourceName = safeString(anyRaw.sourceName);
  const sourceUrl = safeString(anyRaw.sourceUrl);

  // 並び順(数値 or 数値文字列)
  let timelineOrder: number | null = null;
  const rawOrder = (anyRaw as any).timelineOrder;
  if (typeof rawOrder === "number") {
    timelineOrder = Number.isFinite(rawOrder) ? rawOrder : null;
  } else if (typeof rawOrder === "string") {
    const n = Number(rawOrder);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      timelineOrder = n;
    }
  }

  // 読了時間(数値 or 数値文字列)
  let readingTimeMinutes: number | null = null;
  const rawRt = (anyRaw as any).readingTimeMinutes;
  if (typeof rawRt === "number") {
    readingTimeMinutes = Number.isFinite(rawRt) ? rawRt : null;
  } else if (typeof rawRt === "string") {
    const n = Number(rawRt);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      readingTimeMinutes = n;
    }
  }

  const item: HeritageItem = {
    id,
    slug,
    type: "HERITAGE",
    status,
    title: baseTitle,
    seoTitle,
    titleJa: titleJa ?? null,
    subtitle,
    lead,
    summary,
    kind,
    maker,
    brandName,
    modelName,
    generationCode,
    eraLabel,
    years,
    heroTitle,
    heroCaption,
    heroImage,
    heroImageCredit,
    heroTone,
    body,
    sections,
    highlights,
    tags,
    keyModels,
    relatedCarIds,
    relatedHeritageSlugs,
    relatedCarSlugs,
    relatedNewsIds,
    relatedGuideSlugs,
    createdAt,
    publishedAt,
    updatedAt,
    sourceName,
    sourceUrl,
    timelineOrder,
    readingTimeMinutes,
  };

  return item;
}

// ========================================
// キャッシュ構築 & 公開関数
// ========================================

function buildHeritageCache(): HeritageItem[] {
  const rawList = findAllHeritage();
  const mapped: HeritageItem[] = [];

  rawList.forEach((raw, index) => {
    const item = toHeritageItem(raw, index);
    if (!item) return;
    mapped.push(item);
  });

  // 並び順:
  //  1. publishedAt/createdAt の降順
  //  2. timelineOrder の昇順
  //  3. タイトルの五十音順
  return mapped.sort((a, b) => {
    const aDate = a.publishedAt ?? a.createdAt ?? "";
    const bDate = b.publishedAt ?? b.createdAt ?? "";
    if (aDate && bDate && aDate !== bDate) {
      return aDate > bDate ? -1 : 1;
    }

    if (a.timelineOrder != null && b.timelineOrder != null) {
      if (a.timelineOrder !== b.timelineOrder) {
        return a.timelineOrder - b.timelineOrder;
      }
    }

    return a.title.localeCompare(b.title, "ja");
  });
}

// SSR/ISR前提のモジュール内キャッシュ
let cachedAllHeritage: HeritageItem[] | null = null;

function getAllHeritageSync(): HeritageItem[] {
  if (!cachedAllHeritage) {
    cachedAllHeritage = buildHeritageCache();
  }
  return cachedAllHeritage;
}

/**
 * 公開用: HERITAGE をすべて取得（archived は除外）
 */
export async function getAllHeritage(): Promise<HeritageItem[]> {
  const all = getAllHeritageSync();
  return all.filter((item) => item.status !== "archived");
}

/**
 * slug から 1 件取得
 */
export async function getHeritageBySlug(
  slug: string,
): Promise<HeritageItem | null> {
  const all = await getAllHeritage();
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  const hit =
    all.find((item) => item.slug.toLowerCase() === key) ??
    all.find((item) => item.id.toLowerCase() === key);

  return hit ?? null;
}

/**
 * CARS 側の car.slug or car.id から関連 HERITAGE を取る場合用
 */
export async function getHeritageByRelatedCarSlug(
  carSlugOrId: string,
  limit = 6,
): Promise<HeritageItem[]> {
  const key = carSlugOrId.trim();
  if (!key) return [];

  const all = await getAllHeritage();
  const matched = all.filter((item) =>
    (item.relatedCarIds ?? []).includes(key),
  );

  if (!Number.isFinite(limit) || limit <= 0) return matched;
  return matched.slice(0, limit);
}
