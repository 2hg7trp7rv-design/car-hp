// lib/repository/heritage-repository.ts

/**
 * HERITAGE DataSource層
 *
 * 役割:
 * - data/heritage.json の生データを読み込み HeritageItem に正規化
 * - JSONの揺れ（bodyの欠損をlead/summaryで補完、carSlugsの継承など）をこの層で吸収
 */

import heritageRaw0 from "@/data/heritage.json";
import heritageRaw1 from "@/data/heritage2.json";
import type {
  HeritageItem,
  HeritageKind,
  ContentStatus,
  HeritageSection,
} from "@/lib/content-types";

export type HeritageRecord = HeritageItem;

type RawHeritageRecord = Record<string, unknown>;

function toArray(data: unknown): RawHeritageRecord[] {
  if (Array.isArray(data)) return data as RawHeritageRecord[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as RawHeritageRecord[];
    if (Array.isArray(obj.heritage)) return obj.heritage as RawHeritageRecord[];
    return [data as RawHeritageRecord];
  }
  return [];
}

function safeString(v: unknown): string | undefined {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}

function toStringArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) => safeString(x))
      .filter((s): s is string => Boolean(s));
  }
  const s = safeString(v);
  return s ? [s] : [];
}

function toOptionalStringArray(v: unknown): string[] | undefined {
  const arr = toStringArray(v);
  return arr.length > 0 ? arr : undefined;
}

function normalizeStatus(v: unknown): ContentStatus {
  const s = safeString(v)?.toLowerCase();
  if (s === "draft" || s === "published" || s === "archived") return s;
  return "published";
}

function normalizeKind(v: unknown): HeritageKind {
  const k = safeString(v)?.toUpperCase();
  if (k === "BRAND" || k === "ERA" || k === "CAR") return k as HeritageKind;
  return "CAR";
}

/**
 * セクションの正規化
 * @param v 
 * @param fallbackCarSlugs 章に車が指定されていない場合に使用するリスト
 */
function normalizeSections(v: unknown, fallbackCarSlugs: string[]): HeritageSection[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;

  const out: HeritageSection[] = [];

  for (const sec of v) {
    if (!sec || typeof sec !== "object") continue;
    const s = sec as Record<string, unknown>;

    // IDがない場合は自動生成（目次リンク等のために必須）
    const id = safeString(s.id) ?? `section-${out.length + 1}`;

    // 章に固有の車がなければ、記事全体の関連車(relatedCarSlugs)を表示させる
    const sectionCars = toStringArray(s.carSlugs);
    const carSlugs = sectionCars.length > 0 ? sectionCars : fallbackCarSlugs;

    out.push({
      id,
      title: safeString(s.title),
      summary: safeString(s.summary),
      image: safeString(s.image),
      carSlugs,
      guideSlugs: toStringArray(s.guideSlugs),
      columnSlugs: toStringArray(s.columnSlugs),
      stockCarQuery: safeString(s.stockCarQuery) ?? undefined,
    });
  }

  return out.length > 0 ? out : null;
}

function normalizeHeritage(raw: RawHeritageRecord, index: number): HeritageItem {
  const id = safeString(raw.id) ?? `heritage-${index + 1}`;
  const slug = safeString(raw.slug) ?? id;
  const title = safeString(raw.title) ?? slug;

  const kind = normalizeKind(raw.kind);
  const status = normalizeStatus(raw.status);

  // 記事全体で設定されている車を取得
  const relatedCarSlugs = toStringArray(raw.relatedCarSlugs);

  // 章データを処理（車が空なら全体の関連車を渡す）
  const sections = normalizeSections(raw.sections, relatedCarSlugs);

  // 分量不足の対策: bodyが空なら lead > summary の順で内容を埋める
  const body = safeString(raw.body) ?? safeString(raw.lead) ?? safeString(raw.summary) ?? "";

  return {
    id,
    slug,
    type: "HERITAGE",
    status,

    title,
    titleJa: safeString(raw.titleJa),
    summary: safeString(raw.summary),
    seoTitle: safeString(raw.seoTitle),
    seoDescription: safeString(raw.seoDescription),

    createdAt: safeString(raw.createdAt),
    publishedAt: safeString(raw.publishedAt),
    updatedAt: safeString(raw.updatedAt),

    tags: toStringArray(raw.tags),
    intentTags: toOptionalStringArray(raw.intentTags),

    relatedCarSlugs: relatedCarSlugs.length > 0 ? relatedCarSlugs : undefined,
    relatedGuideSlugs: toOptionalStringArray(raw.relatedGuideSlugs),
    relatedColumnSlugs: toOptionalStringArray(raw.relatedColumnSlugs),
    relatedHeritageSlugs: toOptionalStringArray(raw.relatedHeritageSlugs),

    kind,

    subtitle: safeString(raw.subtitle),
    lead: safeString(raw.lead),

    eraLabel: safeString(raw.eraLabel),
    brandName: safeString(raw.brandName),

    maker: safeString(raw.maker),
    modelName: safeString(raw.modelName),
    years: safeString(raw.years),

    heroImage: safeString(raw.heroImage) ?? safeString(raw.imageUrl),
    heroTone: (safeString(raw.heroTone) as any) ?? "dark",
    heroTitle: safeString(raw.heroTitle),
    heroCaption: safeString(raw.heroCaption),
    heroImageCredit: safeString(raw.heroImageCredit),

    body, // lead/summaryで補完された本文

    sections,

    highlights: toOptionalStringArray(raw.highlights) ?? null,
    keyModels: toOptionalStringArray(raw.keyModels) ?? null,

    readingTimeMinutes: (raw.readingTimeMinutes as number) ?? null,

    canonicalUrl: safeString(raw.canonicalUrl),
    ogImageUrl: safeString(raw.ogImageUrl),
  } as HeritageItem;
}

/**
 * heritage.json + heritage2.json を「生配列」としてまとめる
 * - ファイルごとの優先順位: 後ろに書かれているファイルほど“後勝ち”になる
 */
const RAW_ALL = [...toArray(heritageRaw0), ...toArray(heritageRaw1)];

/**
 * 一度だけ正規化 & 重複 slug の解消（後勝ち）
 */
const ALL_HERITAGE_INTERNAL: HeritageItem[] = (() => {
  const normalized = RAW_ALL.map(normalizeHeritage);
  const map = new Map<string, HeritageItem>();

  for (const h of normalized) {
    const key = h.slug || h.id;
    if (!key) continue;

    if (map.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[heritage-repository] Duplicate heritage key "${key}" detected. Later entry will override earlier one.`,
        );
      }
    }

    map.set(key, h);
  }

  return Array.from(map.values());
})();

export function findAllHeritage(): HeritageRecord[] {
  return ALL_HERITAGE_INTERNAL;
}

export function findHeritageBySlug(slug: string): HeritageRecord | undefined {
  const key = slug.trim().toLowerCase();
  if (!key) return undefined;
  return ALL_HERITAGE_INTERNAL.find((h) => h.slug.toLowerCase() === key);
}
