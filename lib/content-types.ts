// lib/content-types.ts

// 共通のステータス
export type ArticleStatus = "draft" | "published" | "archived";

// 共通のtype
export type ArticleType = "GUIDE" | "COLUMN" | "NEWS" | "HERITAGE" | string;

// 記事系すべての共通ベース型
export type ArticleBase = {
  id: string;
  slug: string;
  type: ArticleType;
  category?: string | null;
  status?: ArticleStatus;

  title: string;
  summary: string;

  seoTitle?: string | null;
  seoDescription?: string | null;

  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: string[];
};

// GUIDE専用の拡張
export type GuideItem = ArticleBase & {
  type: "GUIDE";
  readMinutes?: number | null;
  heroImage?: string | null;
  body: string;
  relatedCarSlugs?: string[];
};

// COLUMN専用の拡張
export type ColumnItem = ArticleBase & {
  type: "COLUMN";
  tone?: string | null;
  body: string;
  relatedCarSlugs?: string[];
  readMinutes?: number | null;
};

// NEWS専用の拡張
export type NewsItem = ArticleBase & {
  type: "NEWS";

  titleJa?: string | null;
  excerpt?: string | null;
  commentJa?: string | null;

  maker?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  rssId?: string | null;

  publishedAtJa?: string | null;
  createdAt?: string | null;
};

// HERITAGE専用の拡張
export type HeritageItem = ArticleBase & {
  type: "HERITAGE";
  body: string;
  generationLabel?: string | null;
};
