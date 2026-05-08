// lib/repository/news-repository.ts

/**
 * NEWS Data Source 層
 *
 * 役割:
 * - data/news-latest.json の“生データ”を受け取り
 * - アプリ内部で扱いやすい NewsRecord に正規化する
 * - ドメイン層(lib/news.ts など)はこのモジュール経由でのみニュースデータを取得する
 */

import newsRaw from "@/data/news-latest.json";
import { normalizeExternalNewsSourceUrl } from "@/lib/news-source-policy";

/**
 * JSON の生データ型
 *
 * news-latest.json 側では、最低限以下のような項目を想定しておくと拡張しやすい:
 *
 * - id: string
 * - slug: string
 * - title: string
 * - summary: string | null
 * - body: string
 * - category: string
 * - sourceName: string
 * - sourceUrl: string
 * - sourceType: string ("official" | "media" | "blog" | "rumor" など自由)
 * - status: "draft" | "preview" | "published"
 * - publishedAt: ISO文字列
 * - updatedAt: ISO文字列
 * - tags: string[]
 * - relatedCarSlugs: string[]
 * - relatedColumnSlugs: string[]
 * - relatedGuideSlugs: string[]
 */
type RawNewsRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: string;

  title?: string;
  titleJa?: string;
  excerpt?: string;
  commentJa?: string;
  comment?: string;
  maker?: string;
  imageUrl?: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  category?: string | null;

  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;

  body?: string;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: unknown;
  relatedCarSlugs?: unknown;
  relatedColumnSlugs?: unknown;
  relatedGuideSlugs?: unknown;
};

/**
 * アプリ内部で扱う NEWS の正規化済み型
 *
 * ここを「仕様書」としてモリモリにしておくことで、
 * - 一覧
 * - 詳細ページ
 * - 関連CARS/COLUMN/GUIDE
 * を一元的に扱いやすくする。
 */
export type NewsRecord = {
  /** 識別子 (なければ slug から自動生成) */
  id: string;
  /** パスとして使う slug (/news/[slug]) */
  slug: string;
  /** 固定: "NEWS" */
  type: "NEWS";

  /** コンテンツの状態: draft / preview / published */
  status: "draft" | "preview" | "published";

  /** 記事タイトル */
  title: string;
  /** 日本語タイトル(あれば優先的に表示) */
  titleJa: string | null;
  /** 抄録(元記事要約) */
  excerpt: string | null;
  /** 編集コメント(日本語) */
  commentJa: string | null;
  /** メーカー名 */
  maker: string | null;
  /** サムネイル画像など */
  imageUrl: string | null;
  /** 外部ソースURL(=url) */
  url: string;
  /** サイト内リンク(/news/[slug]) */
  link: string;

  /** リスト用の短い要約 */
  summary: string | null;

  /** SEO用の title/description（なければ通常タイトル・summary を使用） */
  seoTitle: string | null;
  seoDescription: string | null;

  /**
   * カテゴリー:
   * 例) "MODEL_CHANGE" / "NEW_CAR" / "RUMOR" / "TECH" / "BRAND" / "OTHER"
   * ここでは string で緩く持っておいて、将来列挙型にしても良い。
   */
  category: string | null;

  /** 出典: メーカー名/メディア名など */
  sourceName: string | null;
  /** 出典URL (公式サイトやニュース記事) */
  sourceUrl: string | null;
  /** 出典の種別 (公式/メディア/噂など) */
  sourceType: string | null;

  /** 本文: Markdown 風のテキストを想定 */
  body: string;

  /** 公開日(一覧ソートで使用) */
  publishedAt: string | null;
  /** 更新日(なければ publishedAt を基準にしてもよい) */
  updatedAt: string | null;

  /** タグ: "BMW" / "G30" / "セダン" / "LCI" など */
  tags: string[];

  /** 関連する車種 slug (cars.json 側の slug と紐づけ) */
  relatedCarSlugs: string[];

  /** 関連するコラムの slug */
  relatedColumnSlugs: string[];

  /** 関連するガイドの slug */
  relatedGuideSlugs: string[];
};

/**
 * 任意の値を string[] に“それなり”に変換するユーティリティ
 */
function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  // 単一文字列だった場合も配列にしておく
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}

/**
 * news-latest.json を配列として扱うためのユーティリティ
 */
function toArray(data: unknown): RawNewsRecord[] {
  if (Array.isArray(data)) {
    return data as RawNewsRecord[];
  }
  if (data && typeof data === "object") {
    return [data as RawNewsRecord];
  }
  return [];
}

/**
 * RawNewsRecord -> NewsRecord への正規化
 * (足りない項目はここで埋める & 不正な値は潰す)
 */
function normalizeNews(raw: RawNewsRecord, index: number): NewsRecord {
  const slug = (raw.slug && raw.slug.trim()) || `news-${index + 1}`;
  const id = (raw.id && raw.id.trim()) || slug;

  const rawStatus = (raw.status || "published").toLowerCase();
  const status: NewsRecord["status"] =
    rawStatus === "draft" || rawStatus === "preview" || rawStatus === "published"
      ? rawStatus
      : "published";

  const title = raw.title?.trim() || slug;

  const titleJa =
    typeof raw.titleJa === "string" && raw.titleJa.trim().length > 0
      ? raw.titleJa.trim()
      : null;

  const excerpt =
    typeof raw.excerpt === "string" && raw.excerpt.trim().length > 0
      ? raw.excerpt.trim()
      : null;

  const commentJa =
    typeof raw.commentJa === "string" && raw.commentJa.trim().length > 0
      ? raw.commentJa.trim()
      : typeof raw.comment === "string" && raw.comment.trim().length > 0
        ? raw.comment.trim()
        : null;

  const maker =
    typeof raw.maker === "string" && raw.maker.trim().length > 0
      ? raw.maker.trim()
      : null;

  const imageUrl =
    typeof raw.imageUrl === "string" && raw.imageUrl.trim().length > 0
      ? raw.imageUrl.trim()
      : null;

  const summary =
    typeof raw.summary === "string" && raw.summary.trim().length > 0
      ? raw.summary.trim()
      : excerpt ?? commentJa ?? null;

  const seoTitle =
    typeof raw.seoTitle === "string" && raw.seoTitle.trim().length > 0
      ? raw.seoTitle.trim()
      : null;

  const seoDescription =
    typeof raw.seoDescription === "string" &&
    raw.seoDescription.trim().length > 0
      ? raw.seoDescription.trim()
      : summary;

  const category =
    typeof raw.category === "string" && raw.category.trim().length > 0
      ? raw.category.trim()
      : null;

  const sourceName =
    typeof raw.sourceName === "string" && raw.sourceName.trim().length > 0
      ? raw.sourceName.trim()
      : null;

  const sourceUrl =
    typeof raw.sourceUrl === "string" && raw.sourceUrl.trim().length > 0
      ? normalizeExternalNewsSourceUrl(raw.sourceUrl.trim())
      : null;

  const link = `/news/${encodeURIComponent(slug)}`;

  // 外部リンクは「安全なURLのみ」許可。未確定の場合は '#' にしてリンク表示を抑止する。
  const url = sourceUrl ?? "#";

  const sourceType =
    typeof raw.sourceType === "string" && raw.sourceType.trim().length > 0
      ? raw.sourceType.trim()
      : null;

  const body = typeof raw.body === "string" ? raw.body : "";

  const publishedAt =
    typeof raw.publishedAt === "string" && raw.publishedAt.trim().length > 0
      ? raw.publishedAt.trim()
      : null;

  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt.trim().length > 0
      ? raw.updatedAt.trim()
      : null;

  const tags = toStringArray(raw.tags);
  const relatedCarSlugs = toStringArray(raw.relatedCarSlugs);
  const relatedColumnSlugs = toStringArray(raw.relatedColumnSlugs);
  const relatedGuideSlugs = toStringArray(raw.relatedGuideSlugs);

  return {
    id,
    slug,
    type: "NEWS",
    status,
    title,
    titleJa,
    excerpt,
    commentJa,
    maker,
    imageUrl,
    url,
    link,
    summary,
    seoTitle,
    seoDescription,
    category,
    sourceName,
    sourceUrl,
    sourceType,
    body,
    publishedAt,
    updatedAt,
    tags,
    relatedCarSlugs,
    relatedColumnSlugs,
    relatedGuideSlugs,
  };
}

// ----------------------------------------
// 正規化 & キャッシュ
// ----------------------------------------

// 将来、news-archive.json などを増やす場合はここに足すだけでOK
const RAW_ALL: RawNewsRecord[] = [...toArray(newsRaw)];

const ALL_NEWS_INTERNAL: NewsRecord[] = RAW_ALL.map(normalizeNews);

// ----------------------------------------
// Repository API
// ----------------------------------------

/**
 * すべての NEWS (ステータス問わず) を返す。
 * ドメイン層で status によるフィルタやソートを行う前提。
 */
export function findAllNews(): NewsRecord[] {
  return ALL_NEWS_INTERNAL;
}

/**
 * slug から 1 件取得 (ステータスは問わない)
 */
export function findNewsBySlug(slug: string): NewsRecord | undefined {
  return ALL_NEWS_INTERNAL.find((item) => item.slug === slug);
}

/**
 * 公開済み(published)のみを抽出
 */
export function findPublishedNews(): NewsRecord[] {
  return ALL_NEWS_INTERNAL.filter((item) => item.status === "published");
}

/**
 * 公開済みの NEWS を公開日の新しい順で並べて、指定件数返す
 * (publishedAt がないものは一番古い扱い)
 */
export function findLatestPublishedNews(limit: number): NewsRecord[] {
  const published = findPublishedNews();

  const sorted = [...published].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  if (limit <= 0) return sorted;
  return sorted.slice(0, limit);
}

/**
 * カテゴリーでフィルタ (公開済みのみ)
 */
export function findPublishedNewsByCategory(
  category: string,
): NewsRecord[] {
  const key = category.trim().toLowerCase();
  if (!key) return findPublishedNews();

  return findPublishedNews().filter((item) => {
    if (!item.category) return false;
    return item.category.toLowerCase() === key;
  });
}

/**
 * 関連 car slug からフィルタ (公開済みのみ)
 * 例: 車種詳細ページから「この車種に関連するニュース」として呼ぶ想定
 */
export function findPublishedNewsByRelatedCarSlug(
  carSlug: string,
): NewsRecord[] {
  const key = carSlug.trim();
  if (!key) return [];
  return findPublishedNews().filter((item) =>
    item.relatedCarSlugs.includes(key),
  );
}
