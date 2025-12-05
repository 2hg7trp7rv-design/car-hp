// lib/content-types.ts

// 共通のステータス
export type ArticleStatus = "draft" | "published" | "archived";

// 既存コード互換用エイリアス（RepositoryなどでContentStatusを使っているため）
export type ContentStatus = ArticleStatus;

// 共通のtype
export type ArticleType = "GUIDE" | "COLUMN" | "NEWS" | "HERITAGE" | string;

// 記事系すべての共通ベース型
export type ArticleBase = {
  id:string;
  slug:string;
  type:ArticleType;
  category?:string | null;
  status?:ArticleStatus;

  title:string;
  summary:string;

  seoTitle?:string | null;
  seoDescription?:string | null;

  publishedAt?:string | null;
  updatedAt?:string | null;

  tags?:string[];

  // 記事共通で使えるメインビジュアル
  heroImage?:string | null;
};

// ============================
// GUIDE
// ============================

export type GuideItem = ArticleBase & {
  type:"GUIDE";
  readMinutes?:number | null;
  body:string;
  relatedCarSlugs?:string[];
};

// ============================
// COLUMN
// ============================

// Columnのカテゴリ型
// いったんstringとしておき、あとで必要に応じて
// "OWNER_STORY"|"MAINTENANCE"|"TECHNICAL"|... のように絞り込む想定
export type ColumnCategory = string;

export type ColumnItem = ArticleBase & {
  type:"COLUMN";
  category?:ColumnCategory | null;
  tone?:string | null;
  body:string;
  relatedCarSlugs?:string[];
  readMinutes?:number | null;
};

// ============================
// NEWS
// ============================

export type NewsItem = ArticleBase & {
  type:"NEWS";

  titleJa?:string | null;
  excerpt?:string | null;
  commentJa?:string | null;

  maker?:string | null;
  sourceName?:string | null;
  sourceUrl?:string | null;
  rssId?:string | null;

  publishedAtJa?:string | null;
  createdAt?:string | null;
};

// ============================
// HERITAGE
// ============================

export type HeritageItem = ArticleBase & {
  type:"HERITAGE";
  body:string;
  generationLabel?:string | null;
};
