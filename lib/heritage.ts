// lib/heritage.ts
/**
 * HERITAGE Domain層（v1.2対応）
 *
 * 役割:
 * - repository 層のデータを UI がそのまま安全に使える形に整える
 * - HERITAGE ⇄ CARS の整合性を構造で担保（不足があればビルドを落とす）
 *
 * v1.2 追加:
 * - intentTags / relatedColumnSlugs を通す
 * - sections[].columnSlugs を通す
 * - NextRead棚用: getNextReadHeritageV12 を提供
 */

import {
  findAllHeritage,
  type HeritageRecord,
} from "./repository/heritage-repository";
import { findAllCars } from "./repository/cars-repository";

import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

import type {
  HeritageItem,
  HeritageSection,
  HeritageKind,
  ContentStatus,
} from "@/lib/content-types";

// App 側で import されるため再 export
export type {
  HeritageItem,
  HeritageSection,
  HeritageKind,
  ContentStatus,
} from "@/lib/content-types";

export type RawHeritageItem = HeritageRecord;

// ========================================
// Utility
// ========================================

function safeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function toTime(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * 一覧/カード表示用の短文（preview）を生成
 * - summary があればそれを優先
 * - 無ければ lead → subtitle → body の順でフォールバック
 * - 改行/連続空白を潰して、maxChars で丸める
 */
function normalizePreviewText(raw: string): string {
  const s = (raw ?? "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[#>*\-\s]+/g, "")
    .trim();
  return s;
}

export function getHeritagePreviewText(
  item: Pick<HeritageItem, "summary" | "lead" | "subtitle" | "body">,
  opts?: { maxChars?: number },
): string {
  const maxChars = Math.max(30, opts?.maxChars ?? 160);
  const base =
    safeString((item as any).summary) ??
    safeString((item as any).lead) ??
    safeString((item as any).subtitle) ??
    safeString((item as any).body) ??
    "";

  const normalized = normalizePreviewText(base);
  if (!normalized) return "";

  if (normalized.length <= maxChars) return normalized;

  const sliced = normalized.slice(0, maxChars).replace(/[、。,. ]+$/g, "");
  return `${sliced}…`;
}


/**
 * 配列 / 単発string / null を吸収して string[] に寄せる
 * - 空なら undefined を返す（ノイズ削減）
 */
function toStringArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;

  if (Array.isArray(value)) {
    const arr = value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  }

  if (typeof value === "string") {
    const s = value.trim();
    return s.length > 0 ? [s] : undefined;
  }

  return undefined;
}

function normalizeKind(kind: string | undefined): HeritageKind {
  const k = (kind ?? "").trim().toUpperCase();
  if (k === "ERA" || k === "BRAND" || k === "CAR") return k as HeritageKind;
  return "CAR";
}

function normalizeStatus(status: string | undefined): ContentStatus {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "draft" || s === "published" || s === "archived")
    return s as ContentStatus;
  // v1.2: 未指定は published 寄せ（既存データ互換）
  return "published";
}

function intersectionCount(
  a: string[] | undefined,
  b: string[] | undefined,
): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const set = new Set(a);
  let c = 0;
  for (const x of b) if (set.has(x)) c += 1;
  return c;
}

function uniqBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    if (!it?.slug) continue;
    if (seen.has(it.slug)) continue;
    seen.add(it.slug);
    out.push(it);
  }
  return out;
}

// ========================================
// Normalizer
// ========================================

function normalizeHeritage(raw: HeritageRecord, index: number): HeritageItem {
  const id = safeString(raw.id) ?? `heritage-${index + 1}`;
  const slug = safeString(raw.slug) ?? id;

  const title = safeString(raw.title) ?? safeString(raw.seoTitle) ?? slug;

  // sections（必ず配列で返す）
  let sections: HeritageSection[] = [];
  const rawSections = (raw as Record<string, unknown>).sections;

  if (Array.isArray(rawSections)) {
    sections = (rawSections as unknown[])
      .map((sec: unknown, i: number): HeritageSection | null => {
        if (!sec || typeof sec !== "object") return null;
        const s = sec as Record<string, unknown>;

        // id が空は採用しない（アンカー事故回避）
        const sid = safeString(s.id) ?? "";
        if (!sid) return null;

        return {
          id: sid,
          title: safeString(s.title),
          summary: safeString(s.summary),

          carSlugs: toStringArray(s.carSlugs),
          guideSlugs: toStringArray(s.guideSlugs),

          // v1.2
          columnSlugs: toStringArray(s.columnSlugs),
        };
      })
      .filter((s: HeritageSection | null): s is HeritageSection => Boolean(s));
  }

  type HeroLayout = HeritageItem["heroLayout"];
  const heroLayout = safeString((raw as any).heroLayout);

  return {
    id,
    slug,
    type: "HERITAGE",

    status: normalizeStatus(safeString(raw.status)),
    kind: normalizeKind(safeString(raw.kind)),

    title,
    titleJa: safeString(raw.titleJa) ?? undefined,

    summary: safeString(raw.summary),
    seoTitle: safeString(raw.seoTitle),
    seoDescription: safeString(raw.seoDescription),

    createdAt: safeString(raw.createdAt),
    publishedAt: safeString(raw.publishedAt),
    updatedAt: safeString(raw.updatedAt),

    canonicalUrl: safeString((raw as any).canonicalUrl),
    ogImageUrl: safeString((raw as any).ogImageUrl),
    noindex:
      typeof (raw as any).noindex === "boolean"
        ? ((raw as any).noindex as boolean)
        : undefined,

    tags: toStringArray(raw.tags),

    // v1.2: intentTags
    intentTags: toStringArray((raw as any).intentTags),

    // 回遊データ群（v1.2: relatedColumnSlugs を通す）
    relatedCarSlugs: toStringArray(raw.relatedCarSlugs),
    relatedGuideSlugs: toStringArray(raw.relatedGuideSlugs),
    relatedColumnSlugs: toStringArray((raw as any).relatedColumnSlugs),
    relatedHeritageSlugs: toStringArray(raw.relatedHeritageSlugs),

    // legacy/互換
    relatedCarIds: toStringArray(raw.relatedCarIds),
    relatedNewsIds: toStringArray(raw.relatedNewsIds),

    subtitle: safeString(raw.subtitle),
    lead: safeString(raw.lead),

    eraLabel: safeString(raw.eraLabel),

    brandName: safeString(raw.brandName),
    maker: safeString(raw.maker),
    modelName: safeString(raw.modelName),
    generationCode: safeString(raw.generationCode),
    years: safeString(raw.years),

    heroTitle: safeString(raw.heroTitle),
    heroCaption: safeString(raw.heroCaption),
    heroImage: safeString(raw.heroImage),
    heroImageCredit: safeString(raw.heroImageCredit),
    heroTone: safeString(raw.heroTone),
    heroLayout: (heroLayout ?? null) as HeroLayout,

    body: safeString(raw.body) ?? "",

    // ★ 必ず配列
    sections,

    highlights: toStringArray(raw.highlights),

    keyModels: toStringArray(raw.keyModels),

    timelineOrder: safeNumber(raw.timelineOrder),
    readingTimeMinutes: safeNumber((raw as any).readingTimeMinutes),

    sourceName: safeString(raw.sourceName),
    sourceUrl: safeString(raw.sourceUrl),

    isFeatured:
      typeof (raw as any).isFeatured === "boolean"
        ? ((raw as any).isFeatured as boolean)
        : undefined,
    isPinned:
      typeof (raw as any).isPinned === "boolean"
        ? ((raw as any).isPinned as boolean)
        : undefined,
    priority: safeNumber((raw as any).priority) ?? null,

    seriesId: safeString((raw as any).seriesId),
    seriesTitle: safeString((raw as any).seriesTitle),
    seriesOrder: safeNumber((raw as any).seriesOrder) ?? null,
  };
}

// ========================================
// Cache
// ========================================

type HeritageIndex = {
  allSorted: HeritageItem[]; // status問わず（archived含む）
  allPublishedSorted: HeritageItem[]; // publishedのみ
  bySlug: Map<string, HeritageItem>;
};

let heritageIndexCache: HeritageIndex | null = null;

function compareHeritageForNav(a: HeritageItem, b: HeritageItem): number {
  // timelineOrder が両方あるなら昇順（時代棚向け）
  if (a.timelineOrder != null && b.timelineOrder != null) {
    if (a.timelineOrder !== b.timelineOrder)
      return a.timelineOrder - b.timelineOrder;
  }

  // 次に publishedAt / updatedAt / createdAt の新しい順
  const aTime = toTime(a.publishedAt ?? a.updatedAt ?? a.createdAt ?? null);
  const bTime = toTime(b.publishedAt ?? b.updatedAt ?? b.createdAt ?? null);
  if (aTime !== bTime) return aTime < bTime ? 1 : -1;

  // 最後にタイトル
  return a.title.localeCompare(b.title, "ja");
}

function buildHeritageIndex(): HeritageIndex {
  const rawAll = findAllHeritage();
  const mapped = rawAll.map(normalizeHeritage);

  const allSorted = [...mapped].sort(compareHeritageForNav);

  const published = mapped.filter((h) => h.status === "published");
  const publishedSorted = [...published].sort(compareHeritageForNav);

  const bySlug = new Map<string, HeritageItem>();
  for (const h of publishedSorted) {
    bySlug.set(h.slug.toLowerCase(), h);
  }

  return {
    allSorted,
    allPublishedSorted: publishedSorted,
    bySlug,
  };
}

function ensureHeritageIndex(): HeritageIndex {
  if (!heritageIndexCache) heritageIndexCache = buildHeritageIndex();
  return heritageIndexCache;
}

export function __resetHeritageCacheForTest(): void {
  heritageIndexCache = null;
}

// ========================================
// Public API
// ========================================

export async function getAllHeritage(): Promise<HeritageItem[]> {
  return ensureHeritageIndex().allPublishedSorted;
}

export async function getAllHeritageIncludingNonPublished(): Promise<
  HeritageItem[]
> {
  // archived含む。必要なら呼び出し側で絞る
  return ensureHeritageIndex().allSorted;
}

export async function getHeritageBySlug(
  slug: string,
): Promise<HeritageItem | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  const index = ensureHeritageIndex();
  const hit = index.bySlug.get(key);
  if (hit) return hit;

  // 念のため id一致も（公開済みからのみ）
  const all = index.allPublishedSorted;
  return all.find((h) => h.id.toLowerCase() === key) ?? null;
}

/**
 * Prev / Next（HERITAGE ページ遷移用）
 * 並び順は compareHeritageForNav に完全準拠（publishedのみ）
 */
export async function getPreviousHeritage(
  slug: string,
): Promise<HeritageItem | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  const all = await getAllHeritage();
  const index = all.findIndex((h) => h.slug.toLowerCase() === key);

  if (index <= 0) return null;
  return all[index - 1] ?? null;
}

export async function getNextHeritage(
  slug: string,
): Promise<HeritageItem | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  const all = await getAllHeritage();
  const index = all.findIndex((h) => h.slug.toLowerCase() === key);

  if (index < 0) return null;
  return all[index + 1] ?? null;
}

// ========================================
// v1.2: 抽出ヘルパ
// ========================================

/**
 * HERITAGE から「関連GUIDEの slug」を抽出して返す
 * - heritage.relatedGuideSlugs
 * - heritage.sections[].guideSlugs
 */
export function extractHeritageGuideSlugs(heritage: HeritageItem): string[] {
  const slugs = [
    ...(heritage.relatedGuideSlugs ?? []),
    ...((heritage.sections ?? []).flatMap((s) => s.guideSlugs ?? []) ?? []),
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  return Array.from(new Set(slugs));
}

/**
 * v1.2: HERITAGE から「関連COLUMNの slug」を抽出して返す
 * - heritage.relatedColumnSlugs
 * - heritage.sections[].columnSlugs
 */
export function extractHeritageColumnSlugs(heritage: HeritageItem): string[] {
  const slugs = [
    ...((heritage as any).relatedColumnSlugs ?? []),
    ...((heritage.sections ?? [])
      .flatMap((s) => (s as any).columnSlugs ?? []) ?? []),
  ]
    .map((s: string) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(slugs));
}

/**
 * HERITAGE から「登場車（carSlugs）」を抽出して返す
 * - heritage.relatedCarSlugs
 * - heritage.sections[].carSlugs
 */
export function extractHeritageCarSlugs(heritage: HeritageItem): string[] {
  const slugs = [
    ...(heritage.relatedCarSlugs ?? []),
    ...((heritage.sections ?? []).flatMap((s) => s.carSlugs ?? []) ?? []),
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  return Array.from(new Set(slugs));
}

// ========================================
// v1.2: NextRead棚（HERITAGE → HERITAGE）
// ========================================

/**
 * 優先順位:
 * 1) base.relatedHeritageSlugs（入力順尊重）
 * 2) intentTags一致
 * 3) tags一致
 * 4) フォールバック（新着）
 */
export async function getNextReadHeritageV12(
  base: HeritageItem,
  limit = 4,
): Promise<HeritageItem[]> {
  const { allPublishedSorted } = ensureHeritageIndex();
  const pool = allPublishedSorted.filter((h) => h.slug !== base.slug);

  const picked: HeritageItem[] = [];
  const seen = new Set<string>();

  const push = (h: HeritageItem) => {
    if (!h?.slug) return;
    if (h.slug === base.slug) return;
    if (seen.has(h.slug)) return;
    seen.add(h.slug);
    picked.push(h);
  };

  // 1) 明示（入力順）
  const explicit = base.relatedHeritageSlugs ?? [];
  if (explicit.length > 0) {
    const map = new Map(pool.map((h) => [h.slug, h] as const));
    for (const slug of explicit) {
      const h = map.get(slug);
      if (!h) continue;
      push(h);
      if (picked.length >= limit) return uniqBySlug(picked).slice(0, limit);
    }
  }

  // 2) intentTags
  const intent = base.intentTags ?? [];
  if (intent.length > 0) {
    const scored = pool
      .filter((h) => !seen.has(h.slug))
      .map((h) => ({
        h,
        score: intersectionCount(intent, h.intentTags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareHeritageForNav(a.h, b.h);
      });

    for (const x of scored) {
      push(x.h);
      if (picked.length >= limit) return uniqBySlug(picked).slice(0, limit);
    }
  }

  // 3) tags
  const tags = base.tags ?? [];
  if (tags.length > 0) {
    const scored = pool
      .filter((h) => !seen.has(h.slug))
      .map((h) => ({
        h,
        score: intersectionCount(tags, h.tags ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareHeritageForNav(a.h, b.h);
      });

    for (const x of scored) {
      push(x.h);
      if (picked.length >= limit) return uniqBySlug(picked).slice(0, limit);
    }
  }

  // 4) フォールバック（新着）
  for (const h of pool) {
    if (picked.length >= limit) break;
    if (seen.has(h.slug)) continue;
    push(h);
  }

  return uniqBySlug(picked).slice(0, limit);
}

// ========================================
// CARS → HERITAGE 逆流
// ========================================

export async function getHeritageByRelatedCarSlug(
  carSlugOrId: string,
  limit = 6,
): Promise<HeritageItem[]> {
  const key = carSlugOrId.trim();
  if (!key) return [];

  const all = await getAllHeritage();

  const matched = all.filter((h) => {
    if ((h.relatedCarIds ?? []).includes(key)) return true;
    if ((h.relatedCarSlugs ?? []).includes(key)) return true;
    if ((h.sections ?? []).some((s) => (s.carSlugs ?? []).includes(key)))
      return true;
    return false;
  });

  return !Number.isFinite(limit) || limit <= 0 ? matched : matched.slice(0, limit);
}

// ========================================
// 義務チェック（ビルド時安全装置）
// ========================================

/**
 * HERITAGE に登場する carSlugs が
 * CARS に存在しない場合はビルドを落とす
 */
export function assertHeritageCarsExist(heritage: HeritageItem) {
  const cars = findAllCars();

  const slugs = extractHeritageCarSlugs(heritage);

  if (slugs.length === 0) return;

  const missing = slugs.filter((slug) =>
    !cars.some((c) => {
      const s = safeString((c as any)?.slug);
      return s === slug;
    }),
  );

  if (missing.length > 0) {
    throw new Error(
      `[HERITAGE ERROR] "${heritage.slug}" missing cars: ${missing.join(", ")}`,
    );
  }
}

/**
 * HERITAGE Next Read（段別フォールバック厳密保証）
 * 優先: related* -> intentTags -> tags -> popular(未実装ならskip) -> recent
 * 各段は可能な限り最低2件、基本は3件。
 */
export async function getNextReadForHeritage(
  slug: string,
  opts?: { limit?: number; min?: number },
): Promise<{ columns: ColumnItem[]; cars: CarItem[]; guides: GuideItem[] }> {
  const limit = Math.max(2, Math.min(5, opts?.limit ?? 3));
  const min = Math.max(1, Math.min(limit, opts?.min ?? 2));

  const heritage = await getHeritageBySlug(slug);
  if (!heritage) return { columns: [], cars: [], guides: [] };

  const allCars: CarItem[] = await getAllCars();
  const allGuides: GuideItem[] = await getAllGuides();
  const allColumns: ColumnItem[] = await getAllColumns();

  const isNonEmptyString = (v: unknown): v is string =>
    typeof v === "string" && v.trim().length > 0;

  const normalizeKeys = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter(isNonEmptyString).map((s) => s.trim());
  };

  const uniqBySlug = <T extends { slug: string }>(items: T[]) => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const it of items) {
      const s = String(it.slug || "").toLowerCase();
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(it);
    }
    return out;
  };

  const bySlugs = <T extends { slug: string }>(slugs: unknown, all: T[]) => {
    const want = Array.isArray(slugs)
      ? slugs.map((s) => String(s || "").toLowerCase()).filter(Boolean)
      : [];
    if (want.length === 0) return [] as T[];
    const map = new Map(all.map((x) => [String(x.slug).toLowerCase(), x]));

    const resolved = want
      .map((s) => map.get(s))
      .filter((x): x is T => Boolean(x));

    return uniqBySlug(resolved);
  };

  // ✅ FIX: slug を必須にして、uniqBySlug の型崩れ（{slug}扱い/anyキャスト）を発生させない
  const matchBy = <
    T extends { slug: string; tags?: string[]; intentTags?: string[] }
  >(
    kind: "intent" | "tags",
    keys: string[],
    all: T[],
  ) => {
    const wanted = keys
      .filter(isNonEmptyString)
      .map((s) => s.toLowerCase());

    if (wanted.length === 0) return [] as T[];

    return uniqBySlug(
      all.filter((x) => {
        const arr = (kind === "intent" ? x.intentTags : x.tags) ?? [];
        const set = new Set(arr.map((t) => String(t || "").toLowerCase()));
        return wanted.some((k) => set.has(k));
      }),
    );
  };

  // ★ 最小修正ここだけ：publishedAt/updatedAt が null を取りうる型に合わせる
  const sortRecent = <
    T extends { slug: string; publishedAt?: string | null; updatedAt?: string | null }
  >(
    arr: T[],
  ): T[] => {
    // updatedAt を優先（compareHeritageForNav と方向性を揃える）
    const score = (x: T) =>
      Date.parse(x.updatedAt ?? x.publishedAt ?? "") || 0;
    return [...arr].sort((a, b) => score(b) - score(a));
  };

  const pick = <T extends { slug: string }>(
    sources: Array<{ label: string; items: T[] }>,
  ): T[] => {
    const out: T[] = [];
    const seen = new Set<string>();
    for (const src of sources) {
      for (const it of src.items) {
        const s = String(it.slug || "").toLowerCase();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        out.push(it);
        if (out.length >= limit) return out;
      }
    }
    return out;
  };

  const intentKeys = normalizeKeys((heritage as any).intentTags);
  const tagKeys = normalizeKeys((heritage as any).tags);

  const columns = pick<ColumnItem>([
    {
      label: "explicit",
      items: bySlugs((heritage as any).relatedColumnSlugs, allColumns),
    },
    { label: "intent", items: matchBy("intent", intentKeys, allColumns) },
    { label: "tags", items: matchBy("tags", tagKeys, allColumns) },
    { label: "recent", items: sortRecent<ColumnItem>(allColumns) },
  ]);

  const cars = pick<CarItem>([
    { label: "explicit", items: bySlugs((heritage as any).relatedCarSlugs, allCars) },
    { label: "intent", items: matchBy("intent", intentKeys, allCars) },
    { label: "tags", items: matchBy("tags", tagKeys, allCars) },
    { label: "recent", items: sortRecent<CarItem>(allCars) },
  ]);

  const guides = pick<GuideItem>([
    {
      label: "explicit",
      items: bySlugs((heritage as any).relatedGuideSlugs, allGuides),
    },
    { label: "intent", items: matchBy("intent", intentKeys, allGuides) },
    { label: "tags", items: matchBy("tags", tagKeys, allGuides) },
    { label: "recent", items: sortRecent<GuideItem>(allGuides) },
  ]);

  // 最低件数保証（実データが足りない場合はそのまま返し、UI側でempty state）
  return {
    columns,
    cars,
    guides,
  };
}
