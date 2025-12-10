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
  HeritageItem as HeritageItemBase,
  HeritageKind,
  ContentStatus,
} from "@/lib/content-types";

// content-types側のHeritageItemをベースに、サイト内で使うメタ情報を少しだけ拡張
export type HeritageItem = HeritageItemBase & {
  /** 和文タイトル(あればこちらを優先して表示したいとき用) */
  titleJa?: string | null;

  /** maker/brandNameの補助用(旧データとの互換) */
  maker?: string | null;

  /** draft/published/archivedなど(ContentStatusと揃える) */
  status?: ContentStatus;

  /** 公開日時/更新日時(JSONにあれば使う) */
  publishedAt?: string | null;
  updatedAt?: string | null;

  /** 情報ソース(メーカー名/媒体名など) */
  sourceName?: string | null;
  sourceUrl?: string | null;
};

export type { HeritageKind } from "@/lib/content-types";

// Data Source層からの生データ
type RawHeritageItem = HeritageRecord;

// ---- 共通ユーティリティ ----

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isPublished(status?: ContentStatus | null): boolean {
  if (!status) return true; // 未指定は公開扱い
  return status === "published";
}

// ---- 生データ→Domain型への変換 ----

function toHeritageItem(
  raw: RawHeritageItem,
  index: number,
): HeritageItem | null {
  if (!raw || typeof raw !== "object") return null;
  const anyRaw = raw as any;

  // ID/slug
  const id = safeString(anyRaw.id) ?? `heritage-${index}`;
  const slug = safeString(anyRaw.slug) ?? id;

  // kind(未指定ならCARとして扱う)
  const rawKind = safeString(anyRaw.kind) as HeritageKind | undefined;
  const kind: HeritageKind = rawKind ?? "CAR";

  // タイトル関連
  const titleJa = safeString(anyRaw.titleJa) ?? null;
  const baseTitle =
    safeString(anyRaw.title) ?? titleJa ?? "タイトル未設定";
  const subtitle = safeString(anyRaw.subtitle) ?? null;

  // 概要/リード
  const summary =
    safeString(anyRaw.summary) ?? safeString(anyRaw.lead) ?? null;
  const lead = safeString(anyRaw.lead) ?? summary;

  // メーカー/ブランド/モデル/世代
  const maker = safeString(anyRaw.maker) ?? null;
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
    null;

  // 画像系
  const heroImage =
    safeString(anyRaw.heroImage) ??
    safeString(anyRaw.imageUrl) ??
    safeString(anyRaw.thumbnail) ??
    null;
  const heroTone = safeString(anyRaw.heroTone) ?? null;

  // 本文(空でも文字列で返す)
  const bodyRaw =
    safeString(anyRaw.body) ?? safeString(anyRaw.content) ?? "";
  const body = bodyRaw;

  // ハイライト
  let highlights: string[] | null = null;
  const rawHighlights = anyRaw.highlights;
  if (Array.isArray(rawHighlights)) {
    const cleaned = rawHighlights
      .map((v: unknown) => String(v).trim())
      .filter((v: string) => v.length > 0);
    if (cleaned.length > 0) {
      highlights = cleaned;
    }
  }

  // タグ
  let tags: string[] | null = null;
  const rawTags = anyRaw.tags;
  if (Array.isArray(rawTags)) {
    const cleaned = rawTags
      .map((t: unknown) => String(t).trim())
      .filter((t: string) => t.length > 0);
    if (cleaned.length > 0) {
      tags = cleaned;
    }
  }

  // 関連CARS
  let relatedCarIds: string[] | null = null;
  const rawRelatedCarIds = anyRaw.relatedCarIds;
  if (Array.isArray(rawRelatedCarIds)) {
    const cleaned = rawRelatedCarIds
      .map((v: unknown) => String(v).trim())
      .filter((v: string) => v.length > 0);
    if (cleaned.length > 0) {
      relatedCarIds = cleaned;
    }
  }

  // ステータス/日付/ソース
  const statusRaw = safeString(anyRaw.status) as
    | ContentStatus
    | undefined;
  const status: ContentStatus | null =
    statusRaw === "draft" ||
    statusRaw === "published" ||
    statusRaw === "archived"
      ? statusRaw
      : null;

  const publishedAt = safeString(anyRaw.publishedAt) ?? null;
  const updatedAt = safeString(anyRaw.updatedAt) ?? null;
  const sourceName = safeString(anyRaw.sourceName) ?? null;
  const sourceUrl = safeString(anyRaw.sourceUrl) ?? null;

  const item: HeritageItem = {
    id,
    slug,
    kind,
    title: baseTitle,
    subtitle,
    lead,
    eraLabel,
    brandName,
    modelName,
    generationCode,
    years,
    heroImage,
    heroTone,
    body,
    highlights,
    // nullをそのまま渡さず、undefinedに正規化
    tags: tags ?? undefined,
    relatedCarIds: relatedCarIds ?? undefined,
    // 拡張メタ
    titleJa,
    maker,
    status: status ?? undefined,
    publishedAt,
    updatedAt,
    sourceName,
    sourceUrl,
  };

  return item;
}

// ---- キャッシュ構築 ----

function buildHeritageCache(): HeritageItem[] {
  const rawItems = findAllHeritage() as RawHeritageItem[];

  const mapped = rawItems
    .map((raw, index) => toHeritageItem(raw, index))
    .filter((item): item is HeritageItem => item !== null)
    .filter((item) => isPublished(item.status))
    .sort((a, b) => {
      // 公開日(なければ更新日)の降順
      const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
      const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);

      if (ad && bd) return bd.getTime() - ad.getTime();
      if (bd && !ad) return 1;
      if (ad && !bd) return -1;

      // 日付が両方ない場合はタイトル順で安定ソート
      const at = a.title.toLowerCase();
      const bt = b.title.toLowerCase();
      if (at < bt) return -1;
      if (at > bt) return 1;
      return 0;
    });

  return mapped;
}

// SSR/ISR前提のモジュール内キャッシュ
let cachedAllHeritage: HeritageItem[] | null = null;

function getAllHeritageSync(): HeritageItem[] {
  if (!cachedAllHeritage) {
    cachedAllHeritage = buildHeritageCache();
  }
  return cachedAllHeritage;
}

// ---- 公開API(App層から使う関数) ----

/**
 * HERITAGEを全件取得(公開済みのみ/ソート済み)
 */
export async function getAllHeritage(): Promise<HeritageItem[]> {
  return getAllHeritageSync();
}

/**
 * 最新のHERITAGEをlimit件取得
 */
export async function getLatestHeritage(
  limit = 20,
): Promise<HeritageItem[]> {
  const all = getAllHeritageSync();
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return all.slice(0, limit);
}

/**
 * slugから1件取得(公開済みのみ)
 */
export async function getHeritageBySlug(
  slug: string,
): Promise<HeritageItem | null> {
  if (!slug) return null;
  const all = getAllHeritageSync();
  const found = all.find(
    (item) => item.slug === slug || item.id === slug,
  );
  return found ?? null;
}

/**
 * 指定した車種slug/idに紐づくHERITAGEを取得
 * 例:CARSの詳細ページから関連HERITAGEを引く用途
 */
export async function getHeritageByRelatedCarSlug(
  carSlugOrId: string,
  limit = 6,
): Promise<HeritageItem[]> {
  const all = getAllHeritageSync();
  const key = carSlugOrId.trim();
  if (!key) return [];

  const matched = all.filter((item) =>
    (item.relatedCarIds ?? []).includes(key),
  );

  if (!Number.isFinite(limit) || limit <= 0) return matched;
  return matched.slice(0, limit);
}
