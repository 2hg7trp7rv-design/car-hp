// lib/repository/columns-repository.ts

/**
 * COLUMN DataSource層
 *
 * 役割
 * - data/articles/columns/*.json の生データを読み込み ColumnItem に正規化
 * - JSONの揺れ（legacy key / 型ブレ）をこの層で完全吸収
 *
 * 設計原則（仕様書 v1.2）
 * - 回遊は slug ベースで完結（related*Slugs）
 * - legacy の *Ids は DataSource 層でのみ吸収（＝可能ならslugへ正規化）
 * - Domain 層へは「揺れのない ColumnItem」を渡す
 */

import { readJsonDir } from "./data-dir";

import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

/* ========================================
 * Raw 型（JSON 揺れ吸収専用）
 * ===================================== */

// ----------------------------------------
// Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
// ----------------------------------------

type RawColumnRecord = {
  id?: unknown;
  slug?: unknown;
  type?: unknown;
  status?: unknown;

  // 企画書v4: 公開状態（SEO運用）
  publicState?: unknown;
  parentPillarId?: unknown;
  relatedClusterIds?: unknown;
  primaryQuery?: unknown;
  updateReason?: unknown;
  sources?: unknown;

  title?: unknown;
  titleJa?: unknown;
  subtitle?: unknown;

  summary?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;

  createdAt?: unknown;
  publishedAt?: unknown;
  updatedAt?: unknown;

  canonicalUrl?: unknown;
  ogImageUrl?: unknown;
  noindex?: unknown;

  category?: unknown;
  readMinutes?: unknown;
  heroImage?: unknown;
  body?: unknown;

  tags?: unknown;

  // v1.2: 意図タグ
  intentTags?: unknown;

  // 回遊（slug / legacy id 混在吸収）
  relatedCarSlugs?: unknown;
  relatedCarIds?: unknown;

  relatedGuideSlugs?: unknown;

  relatedColumnSlugs?: unknown; // ★ v1.2（Column→Column）
  relatedHeritageSlugs?: unknown;
  relatedHeritageIds?: unknown;

  // 編集・SEO
  ctaType?: unknown;
  ctaNote?: unknown;
  searchIntent?: unknown;
  targetKeyword?: unknown;
  targetStep?: unknown;
  articleType?: unknown;

  // 編集計画（internal）
  planPriority?: unknown;
};

/* ========================================
 * helpers
 * ===================================== */

const asString = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

const asBooleanOrUndefined = (v: unknown): boolean | undefined => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return undefined;
};

const asStringArray = (v: unknown): string[] => {
  if (v == null) return [];
  // 配列
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter((s) => s.length > 0);
  }
  // 単発string
  if (typeof v === "string") {
    const s = v.trim();
    return s.length > 0 ? [s] : [];
  }
  return [];
};

const asOptionalStringArray = (v: unknown): string[] | undefined => {
  const arr = asStringArray(v);
  return arr.length > 0 ? arr : undefined;
};

const asNumberOrNull = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const asContentStatus = (v: unknown): ContentStatus => {
  const s = asString(v);
  if (s === "draft" || s === "published" || s === "archived") return s;
  return "published";
};

const ALLOWED_PUBLIC_STATE = new Set(["index", "noindex", "draft", "redirect"]);

const asPublicState = (v: unknown, status: ContentStatus, noindex?: boolean): any => {
  const s = asString(v);
  if (s && ALLOWED_PUBLIC_STATE.has(s)) return s;
  if (status !== "published") return "draft";
  if (noindex) return "noindex";
  return "noindex";
};


/* ========================================
 * JSON → Array
 * ===================================== */

function toArray(data: unknown): RawColumnRecord[] {
  if (Array.isArray(data)) return data as RawColumnRecord[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.columns)) {
      return obj.columns as RawColumnRecord[];
    }
    return [data as RawColumnRecord];
  }
  return [];
}

/* ========================================
 * 正規化（核心）
 * ===================================== */

function normalizeColumn(raw: RawColumnRecord, index: number): ColumnItem {
  const fallbackId = `column-${index + 1}`;

  const id = asString(raw.id) ?? fallbackId;
  const slug = asString(raw.slug) ?? id;

  const status: ContentStatus = asContentStatus(raw.status);

  const title = asString(raw.title) ?? slug;
  const titleJa = asString(raw.titleJa);
  const subtitle = asString(raw.subtitle) ?? null;

  const summary = asString(raw.summary);
  const seoTitle = asString(raw.seoTitle);
  const seoDescription = asString(raw.seoDescription) ?? summary ?? null;

  const createdAt = asString(raw.createdAt);
  const publishedAt = asString(raw.publishedAt);
  const updatedAt = asString(raw.updatedAt);

  const canonicalUrl = asString(raw.canonicalUrl);
  const ogImageUrl = asString(raw.ogImageUrl);
  const noindex = asBooleanOrUndefined(raw.noindex);

  const category: ColumnCategory =
    (asString(raw.category) as ColumnCategory) ?? "TECHNICAL";

  const readMinutes = asNumberOrNull(raw.readMinutes);
  const heroImage = asString(raw.heroImage);
  const bodyFromJson = asString(raw.body) ?? "";

  // Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
  const body = bodyFromJson.trim();

  const tags = asStringArray(raw.tags);

  /**
   * v1.2: intentTags
   */
  const intentTags = asOptionalStringArray(raw.intentTags);

  /**
   * 回遊は slug に完全正規化
   * legacy の *Ids はここでのみ吸収
   *
   * NOTE:
   * - legacy id が数値などで入っている場合、slugへ変換するには別マップが必要。
   *   本層では “文字列として入っている場合のみ” 吸収し、変換は行わない。
   */
  const relatedCarSlugs =
    asOptionalStringArray(raw.relatedCarSlugs) ??
    asOptionalStringArray(raw.relatedCarIds);

  const relatedGuideSlugs = asOptionalStringArray(raw.relatedGuideSlugs);

  const relatedColumnSlugs = asOptionalStringArray(raw.relatedColumnSlugs);

  const relatedHeritageSlugs =
    asOptionalStringArray(raw.relatedHeritageSlugs) ??
    asOptionalStringArray(raw.relatedHeritageIds);

  return {
    id,
    slug,
    type: "COLUMN",
    status,
    publicState: asPublicState(raw.publicState, status, noindex),
    parentPillarId: asString(raw.parentPillarId) ?? "/column",
    relatedClusterIds: asStringArray(raw.relatedClusterIds),
    primaryQuery: asString(raw.primaryQuery) ?? (title ?? slug ?? ""),
    updateReason: asString(raw.updateReason) ?? "initial-import",
    sources: asStringArray(raw.sources),

    title,
    titleJa: titleJa ?? null,
    subtitle,

    summary: summary ?? null,
    seoTitle: seoTitle ?? null,
    seoDescription,

    createdAt: createdAt ?? null,
    publishedAt: publishedAt ?? null,
    updatedAt: updatedAt ?? null,

    canonicalUrl: canonicalUrl ?? null,
    ogImageUrl: ogImageUrl ?? null,
    noindex,

    category,
    readMinutes,
    heroImage: heroImage ?? null,
    body,

    tags,

    // v1.2
    intentTags,

    // related*
    relatedCarSlugs,
    relatedGuideSlugs,
    relatedColumnSlugs,
    relatedHeritageSlugs,

    // 編集・SEO
    ctaType: asString(raw.ctaType),
    ctaNote: asString(raw.ctaNote),
    searchIntent: asString(raw.searchIntent),
    targetKeyword: asString(raw.targetKeyword),
    targetStep: asNumberOrNull(raw.targetStep),
    planPriority: asNumberOrNull(raw.planPriority),
    articleType: asString(raw.articleType),
  };
}

/* ========================================
 * Internal Cache
 * ===================================== */

/**
 * columns.json + columns2.json を「生配列」としてまとめる
 * - ファイルごとの優先順位: 後ろに書かれているファイルほど“後勝ち”になる
 */
const RAW_ALL = readJsonDir("data/articles/columns");

/**
 * 一度だけ正規化 & 重複 slug の解消（後勝ち）
 */
const ALL_COLUMNS_INTERNAL: ColumnItem[] = (() => {
  const normalized = RAW_ALL.map(normalizeColumn);
  const map = new Map<string, ColumnItem>();

  for (const col of normalized) {
    const key = col.slug || col.id;
    if (!key) continue;

    if (map.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[columns-repository] Duplicate column key "${key}" detected. Later entry will override earlier one.`,
        );
      }
    }

    map.set(key, col);
  }

  return Array.from(map.values());
})();

// ---- 開発時の軽い警告（throwしない / 1回だけ） ----
let didWarnOnce = false;

function warnIfV12FieldsMissingOnce(list: ColumnItem[]) {
  if (didWarnOnce) return;
  didWarnOnce = true;

  if (process.env.NODE_ENV === "production") return;

  const hasIntentTags = list.some((c) => (c.intentTags?.length ?? 0) > 0);
  const hasRelatedColumn = list.some(
    (c) => (c.relatedColumnSlugs?.length ?? 0) > 0,
  );

  if (!hasIntentTags) {
    // eslint-disable-next-line no-console
    console.warn(
      "[columns-repository] intentTags がデータ内に見つかりません。v1.2の関連ランキングに利用する場合は data/columns.json 側へ追加してください。",
    );
  }
  if (!hasRelatedColumn) {
    // eslint-disable-next-line no-console
    console.warn(
      "[columns-repository] relatedColumnSlugs がデータ内に見つかりません。v1.2のColumn→Column棚を使う場合は data/columns.json 側へ追加してください。",
    );
  }
}

warnIfV12FieldsMissingOnce(ALL_COLUMNS_INTERNAL);

/* ========================================
 * Repository API（slug 完結）
 * ===================================== */

export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL;
}

export function findColumnBySlug(slug: string): ColumnItem | undefined {
  const s = slug.trim();
  if (!s) return undefined;
  return ALL_COLUMNS_INTERNAL.find((c) => c.slug === s);
}

export function findPublishedColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL.filter((c) => c.status === "published");
}

export function findColumnsByRelatedCarSlug(carSlug: string): ColumnItem[] {
  const s = carSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) => c.relatedCarSlugs?.includes(s));
}

export function findColumnsByRelatedGuideSlug(guideSlug: string): ColumnItem[] {
  const s = guideSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) => c.relatedGuideSlugs?.includes(s));
}

export function findColumnsByRelatedHeritageSlug(
  heritageSlug: string,
): ColumnItem[] {
  const s = heritageSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) =>
    c.relatedHeritageSlugs?.includes(s),
  );
}

export function findColumnsByRelatedColumnSlug(
  columnSlug: string,
): ColumnItem[] {
  const s = columnSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) =>
    c.relatedColumnSlugs?.includes(s),
  );
}
