// lib/repository/guides-repository.ts

/**
 * GUIDE Data Source 層
 *
 * 役割:
 * - data/guides*.json から“生データ”をそのまま読み込む
 * - JSON のばらつき(必須項目不足・配列/単体・null混在など)を吸収し、
 *   Domain 層(lib/guides.ts) から扱いやすい GuideItem に正規化する
 *
 * 注意:
 * - 並び順や「published のみ」のフィルタリングは Domain 層側で行う
 * - 将来 1 記事 1 ファイル構成になっても、このファイルの normalize ロジックだけ
 *   差し替えれば上位の呼び出し側はそのまま動く想定
 */

import guidesRaw from "@/data/guides.json";
import guidesRaw1 from "@/data/guides1.json";
import guidesRaw2 from "@/data/guides2.json";
import guidesRaw3 from "@/data/guides3.json";
import guidesRaw4 from "@/data/guides4.json"; // 既存
import guidesRaw5 from "@/data/guides5.json"; // ★ 15本ガイド用

import type {
  GuideItem,
  ContentStatus,
  GuideCategory,
} from "@/lib/content-types";

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

  title?: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: GuideCategory | null;

  readMinutes?: number | null;
  heroImage?: string | null;

  body?: string;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];
  relatedCarSlugs?: string[];

  // ★ 追加: マネタイズ用メタ
  monetizeKey?: string | null;
  affiliateLinks?: Record<string, string> | null;
};

// JSON → GuideItem への正規化
function normalizeGuide(raw: RawGuideRecord, index: number): GuideItem {
  const id = raw.id ?? `guide-${index + 1}`;
  const slug = raw.slug ?? id;

  const status: ContentStatus = raw.status ?? "published";

  const title = raw.title ?? slug;

  const summary = raw.summary ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  // category は null 許容のまま Domain 側で map する前提
  const category: GuideCategory | null =
    typeof raw.category === "string" ? raw.category : null;

  const readMinutes =
    typeof raw.readMinutes === "number" ? raw.readMinutes : null;

  const heroImage = typeof raw.heroImage === "string" ? raw.heroImage : null;

  const body = raw.body ?? "";

  const publishedAt = raw.publishedAt ?? null;
  const updatedAt = raw.updatedAt ?? null;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : [];

  const relatedCarSlugs = Array.isArray(raw.relatedCarSlugs)
    ? raw.relatedCarSlugs.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
    : [];

  // ベースの GuideItem
  const base: any = {
    id,
    slug,
    type: "GUIDE",
    status,
    title,
    summary,
    seoTitle,
    seoDescription,
    category,
    readMinutes,
    heroImage,
    body,
    publishedAt,
    updatedAt,
    tags,
    relatedCarSlugs,
  };

  // ★ 追加: マネタイズ用メタをそのまま通す
  if (typeof raw.monetizeKey === "string") {
    base.monetizeKey = raw.monetizeKey;
  }

  if (raw.affiliateLinks && typeof raw.affiliateLinks === "object") {
    base.affiliateLinks = raw.affiliateLinks;
  }

  return base as GuideItem;
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
const RAW_ALL: RawGuideRecord[] = [
  ...toArray(guidesRaw),
  ...toArray(guidesRaw1),
  ...toArray(guidesRaw2),
  ...toArray(guidesRaw3),
  ...toArray(guidesRaw4),
  ...toArray(guidesRaw5), // ★ ここで guides5.json を取り込む
];

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

    if (!key) {
      // slug も id もない異常値は捨てる（今後必要ならここで ID を採番してもよい）
      continue;
    }

    if (map.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        // ここはあくまで開発者向けのヒントなので、本番では出さない
        // eslint-disable-next-line no-console
        console.warn(
          `[guides-repository] Duplicate guide key "${key}" detected. Later entry will override earlier one.`,
        );
      }
    }

    map.set(key, guide);
  }

  return Array.from(map.values());
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
