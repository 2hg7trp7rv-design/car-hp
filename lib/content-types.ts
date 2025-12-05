// lib/content-types.ts

export type ContentType = "GUIDE" | "COLUMN" | "NEWS" | "HERITAGE";

export type ContentStatus = "draft" | "published" | "archived";

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

// GUIDE用

export type GuideCategory = string;

export type GuideItem = BaseContentItem & {
  type: "GUIDE";
  category?: GuideCategory | null;
  readMinutes?: number | null;
  heroImage?: string | null;
  body: string;
  relatedCarSlugs?: string[];
};
