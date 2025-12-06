// lib/content-types.ts

// ----------------------------------------
// 共通で使う基本型
// ----------------------------------------

export type ArticleType =
  | "GUIDE"
  | "COLUMN"
  | "NEWS"
  | "HERITAGE"
  | "CARS"
  | "OTHER";

export type ArticleStatus = "draft" | "published" | "archived";

// 既存コード互換用エイリアス
export type ContentStatus = ArticleStatus;

export type ArticleBase = {
  /** 不変ID */
  id: string;
  /** URL用スラッグ (/guide/[slug] など) */
  slug: string;
  /** コンテンツ種別 */
  type: ArticleType;
  /** サブカテゴリ (MONEY / MAINTENANCE / TECHNICAL など) */
  category?: string | null;
  /** 公開状態 */
  status?: ArticleStatus;

  /** 記事タイトル */
  title: string;
  /** 一覧・カードに出す要約 */
  summary: string;

  /** 明示的なSEOタイトル (なければtitleを使う) */
  seoTitle?: string | null;
  /** 明示的なSEOディスクリプション (なければsummaryを使う) */
  seoDescription?: string | null;

  /** 公開日時(ISO) */
  publishedAt?: string | null;
  /** 最終更新日時(ISO) */
  updatedAt?: string | null;

  /** タグ */
  tags?: string[];

  /** 一覧やディテールで使うヒーロー画像 */
  heroImage?: string | null;
};

// ----------------------------------------
// GUIDE
// ----------------------------------------

export type GuideCategory = string;

export type GuideItem = ArticleBase & {
  type: "GUIDE";
  category?: GuideCategory | null;

  /** 読了目安(分) */
  readMinutes?: number;

  /** 本文(Markdown想定) */
  body: string;

  /** 関連する車種(slugの配列) */
  relatedCarSlugs?: string[];
};

// ----------------------------------------
// COLUMN
// ----------------------------------------

export type ColumnCategory = "MAINTENANCE" | "TECHNICAL";

export type ColumnItem = ArticleBase & {
  type: "COLUMN";
  /** コラムのカテゴリー */
  category: ColumnCategory;

  /** 読了目安(分) */
  readMinutes?: number;

  /** 本文(Markdown想定) */
  body: string;

  /** 関連する車種(slugの配列) */
  relatedCarSlugs?: string[];
};

// ----------------------------------------
// NEWS
// ----------------------------------------

export type NewsItem = ArticleBase & {
  type: "NEWS";

  /** メーカー公式など元記事のURL */
  url: string;

  /**
   * Next.js側でのリンク用エイリアス。
   * 現状は /news/[id] なので id をそのまま使う想定。
   */
  link: string;

  /** 日本語タイトル */
  titleJa?: string | null;

  /** 要約・リード文 */
  excerpt?: string | null;

  /** ソース名 (メーカー公式サイト名など) */
  sourceName?: string | null;

  /** 編集部コメント(テキスト) */
  editorNote?: string | null;

  /** 日本語コメント(表示用) */
  commentJa?: string | null;

  /** 日本語の整形済み日付文字列 */
  publishedAtJa?: string | null;

  /** メーカー名 (BMW / TOYOTA など) */
  maker?: string | null;

  /** カテゴリ(NEW_MODEL / RECALL など任意文字列) */
  category?: string | null;

  /** サムネイル画像 */
  heroImage?: string | null;
};

// ----------------------------------------
// HERITAGE (将来拡張用)
// ----------------------------------------

export type HeritageItem = ArticleBase & {
  type: "HERITAGE";

  /** 年代や世代を表すラベル (例: "1960s", "1st-Gen" など) */
  era?: string | null;

  /** 対応する車種slug (あれば) */
  carSlug?: string | null;

  /** 本文(Markdown想定) */
  body: string;
};
