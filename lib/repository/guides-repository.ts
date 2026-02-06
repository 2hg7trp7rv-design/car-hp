// lib/repository/guides-repository.ts

/**
 * GUIDE Data Source 層
 *
 * 役割:
 * - data/articles/guides/*.json から“生データ”を読み込む
 * - JSON のばらつき(必須項目不足・配列/単体・null混在など)を吸収し、
 * Domain 層(lib/guides.ts) から扱いやすい GuideItem に正規化する
 *
 * 注意:
 * - 並び順や「published のみ」のフィルタリングは Domain 層側で行う
 * - 将来 1 記事 1 ファイル構成になっても、このファイルの normalize ロジックだけ
 * 差し替えれば上位の呼び出し側はそのまま動く想定
 *
 * v1.2対応メモ
 * - relatedGuideSlugs / relatedColumnSlugs / intentTags / ctaVariants を通す（データに未出現でも型で受ける）
 * - monetizeKey は MonetizeKey（content-types.ts）へ寄せる前提だが、
 * データ側が string のままでも “型互換” のため repository では string→そのまま通し、
 * Domain層で厳密化する（※ただし空文字は捨てる）
 */


import { readJsonDir } from "./data-dir";

import type {
  GuideItem,
  ContentStatus,
  GuideCategory,
  MonetizeKey,
  MonetizeType,
  CtaVariant,
} from "@/lib/content-types";

// ----------------------------------------
// Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
// ----------------------------------------

/**
 * JSON の生データ型
 *
 * - 本来 GuideItem で必須な項目も「未入力かもしれない」前提で全部 optional にしておく
 * - Repository 内で normalize することで、Domain 層には「きちんと埋まっている」GuideItem を渡す
 */
type RawGuideRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: ContentStatus;

  // 企画書v4: 公開状態（SEO運用）
  publicState?: unknown;
  parentPillarId?: unknown;
  relatedClusterIds?: unknown;
  primaryQuery?: unknown;
  updateReason?: unknown;
  sources?: unknown;

  title?: string;
  titleJa?: string | null;

  summary?: string | null;
  lead?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: GuideCategory | null;

  readMinutes?: number | null;
  heroImage?: string | null;

  body?: string;

  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: unknown;

  // v1.2 回遊（明示関連）
  relatedCarSlugs?: unknown;
  relatedGuideSlugs?: unknown;
  relatedColumnSlugs?: unknown;
  relatedHeritageSlugs?: unknown;

  // v1.2 回遊（意図）
  intentTags?: unknown;

  // v1.2 CTA出し分け
  ctaVariants?: unknown;

  // ★ マネタイズ & 内部回遊メタ
  monetizeKey?: unknown;
  monetizeType?: unknown;
  affiliateLinks?: unknown;
  internalLinks?: unknown;
};

// ----------------------------
// 小ユーティリティ（揺れ吸収）
// ----------------------------

function coerceString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

function coerceStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
  }
  if (typeof value === "string") {
    const v = value.trim();
    return v.length > 0 ? [v] : [];
  }
  return [];
}

const ALLOWED_PUBLIC_STATE = new Set(["index", "noindex", "draft", "redirect"]);

function coercePublicState(val: unknown, status: ContentStatus): any {
  const s = coerceString(val);
  if (s && ALLOWED_PUBLIC_STATE.has(s)) return s;
  if (status !== "published") return "draft";
  return "noindex";
}


function coerceRecordOfString(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const sv = coerceString(v);
    if (sv) out[k] = sv;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function coerceCtaVariants(value: unknown): CtaVariant[] | null {
  if (!Array.isArray(value)) return null;
  const out: CtaVariant[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;

    const id = coerceString(rec.id);
    if (!id) continue;

    const monetizeKey = coerceString(rec.monetizeKey) as MonetizeKey | null;
    const title = coerceString(rec.title);
    const lead = coerceString(rec.lead);
    const ctaLabel = coerceString(rec.ctaLabel);

    const whenIntentTagsAny = Array.isArray(rec.whenIntentTagsAny)
      ? (rec.whenIntentTagsAny
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v) => v.length > 0) as string[])
      : null;

    const priority =
      typeof rec.priority === "number" ? rec.priority : null;

    out.push({
      id,
      monetizeKey,
      title,
      lead,
      ctaLabel,
      whenIntentTagsAny,
      priority,
    });
  }

  return out.length > 0 ? out : null;
}

// JSON → GuideItem への正規化
function normalizeGuide(raw: RawGuideRecord, index: number): GuideItem {
  const id = coerceString(raw.id) ?? `guide-${index + 1}`;
  const slug = coerceString(raw.slug) ?? id;

  const status: ContentStatus = raw.status ?? "published";

  const title = coerceString(raw.title) ?? slug;
  const titleJa = raw.titleJa ?? null;

  const lead = coerceString(raw.lead);
  const summary = raw.summary ?? lead ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  // category は null 許容のまま Domain 側で map する前提
  const category: GuideCategory | null =
    typeof raw.category === "string" ? raw.category : null;

  const readMinutes =
    typeof raw.readMinutes === "number" ? raw.readMinutes : null;

  const heroImage = coerceString(raw.heroImage);

  const bodyFromJson = typeof raw.body === "string" ? raw.body : "";

  // Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
  const body = bodyFromJson.trim();

  const createdAt = raw.createdAt ?? null;
  const publishedAt = raw.publishedAt ?? null;
  const updatedAt = raw.updatedAt ?? null;

  const tags = coerceStringArray(raw.tags);

  // v1.2: 明示関連
  const relatedCarSlugs = coerceStringArray(raw.relatedCarSlugs);
  const relatedGuideSlugs = coerceStringArray(raw.relatedGuideSlugs);
  const relatedColumnSlugs = coerceStringArray(raw.relatedColumnSlugs);
  const relatedHeritageSlugs = coerceStringArray(raw.relatedHeritageSlugs);

  // v1.2: intentTags
  const intentTags = coerceStringArray(raw.intentTags);

  // v1.2: CTA variants
  const ctaVariants = coerceCtaVariants(raw.ctaVariants);

  // マネタイズ
  const monetizeKeyRaw = coerceString(raw.monetizeKey);
  const monetizeTypeRaw = coerceString(raw.monetizeType);

  const affiliateLinks = coerceRecordOfString(raw.affiliateLinks);

  const internalLinks = Array.isArray(raw.internalLinks)
    ? raw.internalLinks
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0)
    : null;

  const base: GuideItem = {
    id,
    slug,
    type: "GUIDE",
    status,
    publicState: coercePublicState(raw.publicState, status),
    parentPillarId: coerceString(raw.parentPillarId) ?? "/guide",
    relatedClusterIds: coerceStringArray(raw.relatedClusterIds),
    primaryQuery: coerceString(raw.primaryQuery) ?? title,
    updateReason: coerceString(raw.updateReason) ?? "initial-import",
    sources: coerceStringArray(raw.sources),

    title,
    titleJa,
    summary,
    seoTitle,
    seoDescription,

    category,
    readMinutes,
    heroImage,
    lead,

    body,

    createdAt,
    publishedAt,
    updatedAt,

    tags,

    // v1.2 related*
    relatedCarSlugs: relatedCarSlugs.length > 0 ? relatedCarSlugs : undefined,
    relatedGuideSlugs: relatedGuideSlugs.length > 0 ? relatedGuideSlugs : undefined,
    relatedColumnSlugs: relatedColumnSlugs.length > 0 ? relatedColumnSlugs : undefined,
    relatedHeritageSlugs:
      relatedHeritageSlugs.length > 0 ? relatedHeritageSlugs : undefined,

    // v1.2 intentTags
    intentTags: intentTags.length > 0 ? intentTags : undefined,

    // monetize
    monetizeKey: monetizeKeyRaw ? (monetizeKeyRaw as MonetizeKey) : null,
    // ▼ 修正箇所: 型キャスト(as)ではなく関数呼び出しに変更
    monetizeType: monetizeTypeRaw ? MonetetizeTypeCompat(monetizeTypeRaw) : null,

    // variants
    ctaVariants,
    affiliateLinks,
    internalLinks,
  };

  return base;
}

/**
 * monetizeType は content-types.ts で union だが、
 * データ側が任意文字列運用になっている可能性があるため、
 * Repositoryでは “既知の値なら採用 / それ以外は null” に寄せる。
 */
function MonetetizeTypeCompat(value: string): MonetizeType | null {
  const v = value.trim();
  if (v === "direct" || v === "indirect" || v === "ad") return v;
  return null;
}

// JSON を配列化するユーティリティ
function toArray(data: unknown): RawGuideRecord[] {
  if (Array.isArray(data)) return data as RawGuideRecord[];
  if (data && typeof data === "object") {
    return [data as RawGuideRecord];
  }
  return [];
}

/**
 * guides.json + guides1〜5.json を「生配列」としてまとめる
 *
 * - 将来ファイルが増えた場合も、この配列に追加するだけで OK
 * - ファイルごとの優先順位: 後ろに書かれているファイルほど“後勝ち”になる
 */
const RAW_ALL: RawGuideRecord[] = readJsonDir("data/articles/guides");

// ---- 開発時の軽い警告（throwしない / 1回だけ） ----
let didWarnOnce = false;

function warnIfV12FieldsMissingOnce(list: GuideItem[]) {
  if (didWarnOnce) return;
  didWarnOnce = true;

  if (process.env.NODE_ENV === "production") return;

  const hasRelatedGuide = list.some((g) => (g.relatedGuideSlugs?.length ?? 0) > 0);
  const hasRelatedColumn = list.some((g) => (g.relatedColumnSlugs?.length ?? 0) > 0);
  const hasIntentTags = list.some((g) => (g.intentTags?.length ?? 0) > 0);
  const hasCtaVariants = list.some((g) => (g.ctaVariants?.length ?? 0) > 0);

  if (!hasRelatedGuide) {
    console.warn(
      "[guides-repository] relatedGuideSlugs がデータ内に見つかりません。v1.2の関連棚（Guide→Guide）で利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasRelatedColumn) {
    console.warn(
      "[guides-repository] relatedColumnSlugs がデータ内に見つかりません。v1.2の世界観棚（Guide→Column）で利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasIntentTags) {
    console.warn(
      "[guides-repository] intentTags がデータ内に見つかりません。v1.2の関連ランキングに利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasCtaVariants) {
    console.warn(
      "[guides-repository] ctaVariants がデータ内に見つかりません。v1.2のCTA出し分け（任意機能）を使う場合は guides*.json 側へ追加してください。",
    );
  }
}

/**
 * ビルド時に一度だけ正規化 & 重複 slug/id の解消を行う
 *
 * - 同じ slug (なければ id) が複数定義されている場合は「後勝ちマージ」
 * - 開発時のみ console.warn で重複を通知する
 */
const ALL_GUIDES_INTERNAL: GuideItem[] = (() => {
  const normalized = RAW_ALL.map(normalizeGuide);

  const map = new Map<string, GuideItem>();

  for (const guide of normalized) {
    const key = guide.slug || guide.id;

    if (!key) continue;

    if (map.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[guides-repository] Duplicate guide key "${key}" detected. Later entry will override earlier one.`,
        );
      }
    }

    map.set(key, guide);
  }

  const list = Array.from(map.values());
  warnIfV12FieldsMissingOnce(list);
  return list;
})();

// ----------------------------------------
// Repository が外部に提供する API
// ----------------------------------------

/**
 * すべての GUIDE 記事(ステータス問わず)を返す。
 *
 * - 並び順はファイルの定義順＋重複解消の結果に依存
 * - 「公開済みのみ」「日付順」のような絞り込みやソートは lib/guides.ts 側で行う
 */
export function findAllGuides(): GuideItem[] {
  return ALL_GUIDES_INTERNAL;
}

/**
 * slug で 1 件取得 (ステータスは問わない)
 */
export function findGuideBySlug(slug: string): GuideItem | undefined {
  return ALL_GUIDES_INTERNAL.find((g) => g.slug === slug);
}

