// lib/heritage.ts

/**
 * HERITAGE Domain層
 *
 * 役割:
 * ・Data Source層(lib/repository/heritage-repository)から上がってくる生データを
 *   画面(App層)で扱いやすい型(HeritageItem)にマッピングする
 * ・ID/slug/公開日などの整形やソートをここで完結させる
 * ・App層はこのファイルだけを見ればよい、という構造にする
 */

import {
  findAllHeritage,
  type HeritageRecord,
} from "@/lib/repository/heritage-repository";

/**
 * 画面(App層)から見るHERITAGE1件分の型
 *
 * できるだけ汎用的にしつつ、CARS/COLUMN/GUIDE/NEWSと揃えやすい構造を意識。
 * 実際のJSONにフィールドが無くても、Domain層で安全にfallbackするようにする。
 */
export type HeritageItem = {
  id: string;
  slug: string;

  // 表示用タイトル
  title: string;
  titleJa?: string | null;

  // メーカー/ブランド名(BMW/FERRARIなど)
  maker?: string | null;

  // 車名・シリーズ名(例:"F40","Testarossa"など)
  modelName?: string | null;

  // 時代・年代(例:"1980s","1990年代"など)
  eraLabel?: string | null;

  // ナビやリストに出す短い概要
  summary?: string | null;

  // 本文(タイムライン形式やストーリー本文をプレーンテキストで)
  body?: string | null;

  // サムネイル・ヒーロー画像
  heroImage?: string | null;

  // 関連するCARSのid/slug
  relatedCarIds?: string[];

  // タグ(レース名/エンジン形式/ボディタイプなど)
  tags?: string[];

  // 公開状態(published/draftなど)
  status?: string | null;

  // 公開日時/更新日時
  publishedAt?: string | null;
  updatedAt?: string | null;

  // 補助的なメタ情報(任意)
  sourceName?: string | null;
  sourceUrl?: string | null;
};

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

// ---- 生データ→Domain型への変換 ----

function toHeritageItem(raw: RawHeritageItem, index: number): HeritageItem | null {
  if (!raw || typeof raw !== "object") return null;

  const anyRaw = raw as any;

  // ID/slug周り
  const id = safeString(anyRaw.id) ?? `heritage-${index}`;
  const slug =
    safeString(anyRaw.slug) ??
    safeString(anyRaw.id) ??
    `heritage-${index}`;

  // タイトル関連
  const title =
    safeString(anyRaw.titleJa) ??
    safeString(anyRaw.title) ??
    "タイトル未設定";

  const titleJa = safeString(anyRaw.titleJa) ?? null;

  // メーカー/モデル/時代
  const maker = safeString(anyRaw.maker) ?? null;
  const modelName =
    safeString(anyRaw.modelName) ??
    safeString(anyRaw.model) ??
    null;
  const eraLabel =
    safeString(anyRaw.eraLabel) ??
    safeString(anyRaw.era) ??
    safeString(anyRaw.period) ??
    null;

  // 概要・本文
  const summary =
    safeString(anyRaw.summary) ??
    safeString(anyRaw.lead) ??
    null;

  const body =
    safeString(anyRaw.body) ??
    safeString(anyRaw.content) ??
    null;

  const heroImage =
    safeString(anyRaw.heroImage) ??
    safeString(anyRaw.thumbnail) ??
    null;

  // 関連CARS
  const rawRelatedCarIds = anyRaw.relatedCarIds;
  let relatedCarIds: string[] | undefined;
  if (Array.isArray(rawRelatedCarIds)) {
    const cleaned = rawRelatedCarIds
      .map((v) => String(v).trim())
      .filter((v) => v.length > 0);
    if (cleaned.length > 0) {
      relatedCarIds = cleaned;
    }
  }

  // タグ
  const rawTags = anyRaw.tags;
  let tags: string[] | undefined;
  if (Array.isArray(rawTags)) {
    const cleaned = rawTags
      .map((t) => String(t).trim())
      .filter((t) => t.length > 0);
    if (cleaned.length > 0) {
      tags = cleaned;
    }
  }

  const status = safeString(anyRaw.status) ?? null;
  const publishedAt = safeString(anyRaw.publishedAt) ?? null;
  const updatedAt = safeString(anyRaw.updatedAt) ?? null;

  const sourceName = safeString(anyRaw.sourceName) ?? null;
  const sourceUrl = safeString(anyRaw.sourceUrl) ?? null;

  return {
    id,
    slug,
    title,
    titleJa,
    maker,
    modelName,
    eraLabel,
    summary,
    body,
    heroImage,
    relatedCarIds,
    tags,
    status,
    publishedAt,
    updatedAt,
    sourceName,
    sourceUrl,
  };
}

// ---- キャッシュ構築 ----

function buildHeritageCache(): HeritageItem[] {
  const rawItems = findAllHeritage() as RawHeritageItem[];

  const mapped = rawItems
    .map((raw, index) => toHeritageItem(raw, index))
    .filter((item): item is HeritageItem => item !== null)
    // 公開日(なければ更新日)の降順ソート
    .sort((a, b) => {
      const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
      const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);
      if (ad && bd) return bd.getTime() - ad.getTime();
      if (bd && !ad) return 1;
      if (ad && !bd) return -1;
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
 * HERITAGEを全件取得(ソート済み)
 */
export async function getAllHeritage(): Promise<HeritageItem[]> {
  return getAllHeritageSync();
}

/**
 * 最新のHERITAGEをlimit件取得
 */
export async function getLatestHeritage(limit = 20): Promise<HeritageItem[]> {
  const all = getAllHeritageSync();
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return all.slice(0, limit);
}

/**
 * slugから1件取得
 */
export async function getHeritageBySlug(
  slug: string,
): Promise<HeritageItem | null> {
  if (!slug) return null;

  const all = getAllHeritageSync();
  const found = all.find((item) => item.slug === slug || item.id === slug);
  return found ?? null;
}
