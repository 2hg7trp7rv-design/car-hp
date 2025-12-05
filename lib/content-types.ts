// lib/content-types.ts

// 記事系コンテンツの共通種別
export type ContentType = "GUIDE" | "COLUMN" | "NEWS" | "HERITAGE";

// 公開ステータス
export type ContentStatus = "draft" | "published" | "archived";

// 全記事系で共通に持つベース項目
export type BaseContentItem = {
  id: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  summary: string;
  category?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  tags?: string[];
};

// ========== GUIDE ==========

export type GuideCategory = string;

export type GuideItem = BaseContentItem & {
  type: "GUIDE";
  category?: GuideCategory | null;
  readMinutes?: number | null;
  heroImage?: string | null;
  body: string;
  relatedCarSlugs?: string[];
};

// ========== COLUMN ==========

// 代表的なカテゴリ(これ以外の文字列も許容)
export type ColumnCategoryBase =
  | "OWNER_STORY"
  | "MAINTENANCE"
  | "TECHNICAL";

export type ColumnCategory = ColumnCategoryBase | string;

export type ColumnItem = BaseContentItem & {
  type: "COLUMN";
  category: ColumnCategory;
  readMinutes?: number | null;
  heroImage?: string | null;
  body: string;
  relatedCarSlugs?: string[];
};

// ========== NEWS ==========

export type NewsItem = BaseContentItem & {
  type: "NEWS";

  // 元記事へのリンク
  url: string;
  // Next.js の Link 用(基本は`/news/[id]`)
  link: string;

  // 元記事タイトル(英語等)
  titleJa?: string | null;
  // 要約
  excerpt?: string | null;

  // メーカーや媒体などメタ情報
  maker?: string | null;
  sourceName?: string | null;

  // 生成日時など
  createdAt?: string | null;

  // 編集部コメント(生)と画面用コメント
  editorNote?: string | null;
  commentJa?: string | null;

  // 「2025年4月1日」のような整形済み日付
  publishedAtJa?: string | null;
};

// ========== HERITAGE ==========

export type HeritageKind = "ERA" | "BRAND" | "CAR";

export type HeritageItem = {
  id: string;
  slug: string;
  kind: HeritageKind;

  title: string;
  subtitle?: string;
  lead?: string;

  // ラベル系
  eraLabel?: string | null;
  brandLabel?: string | null;
  carLabel?: string | null;

  // 系譜表示用
  chainKey?: string | null;
  chainOrder?: number | null;

  tags?: string[];
  publishedAt?: string | null;
  updatedAt?: string | null;

  meta?: Record<string, string | number | null | undefined>;

  // Markdownライク本文
  body: string;
};

// ========== CARS ==========

export type CarDifficulty = "basic" | "intermediate" | "advanced";

export type CarItem = {
  id: string;
  name: string;
  slug: string;
  maker: string;

  releaseYear?: number;
  difficulty?: CarDifficulty;
  bodyType?: string;
  segment?: string;
  grade?: string;

  summary: string;
  summaryLong?: string;

  heroImage?: string;
  mainImage?: string;
  imageUrl?: string;
  gallery?: string[];

  engine?: string;
  powerPs?: number;
  torqueNm?: number;
  transmission?: string;
  drive?: string;

  fuel?: string;
  fuelEconomy?: string;
  priceNew?: string;
  priceUsed?: string;

  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;

  relatedNewsIds?: string[];
  relatedColumnSlugs?: string[];
  relatedHeritageIds?: string[];

  tags?: string[];
};
