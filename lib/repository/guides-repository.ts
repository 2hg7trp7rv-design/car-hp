// lib/repository/guides-repository.ts

// Repository層:GUIDEデータ取得専用(現在はJSON固定)
// 将来CMS/DBに移行するときは、このファイルだけ差し替える想定

import rawGuides from "@/data/guides.json";
import type { GuideItem, ArticleStatus } from "@/lib/content-types";

// data/guides.jsonの素の型
type RawGuide = (typeof rawGuides)[number];

function normalizeStatus(status: unknown): ArticleStatus {
  if (status === "draft" || status === "archived" || status === "published") {
    return status;
  }
  // 既存JSONにはstatusが無いので、当面はpublished扱いに統一
  return "published";
}

function normalizeGuide(item: RawGuide): GuideItem {
  // JSON側にはtype/status/seo系が無いので、ここで補完してGuideItemに揃える
  const {
    id,
    slug,
    title,
    summary,
    category,
    body,
    publishedAt,
    updatedAt,
    tags,
    readMinutes,
    heroImage,
    relatedCarSlugs,
    seoTitle,
    seoDescription,
    status,
  } = item as RawGuide & {
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: ArticleStatus;
    updatedAt?: string | null;
    tags?: string[];
    readMinutes?: number | null;
    heroImage?: string | null;
    relatedCarSlugs?: string[];
  };

  return {
    id,
    slug,
    type: "GUIDE",
    category: category ?? null,
    status: normalizeStatus(status),

    title,
    summary,

    seoTitle: seoTitle ?? title,
    seoDescription: seoDescription ?? summary,

    publishedAt: publishedAt ?? null,
    updatedAt: updatedAt ?? null,

    tags: tags ?? [],

    readMinutes: readMinutes ?? null,
    heroImage: heroImage ?? null,
    body,
    relatedCarSlugs: relatedCarSlugs ?? [],
  };
}

// 起動時に一度だけ正規化してメモリに展開
const ALL_GUIDES_INTERNAL: GuideItem[] = (rawGuides as RawGuide[]).map(
  normalizeGuide,
);

// Repositoryの公開API
export function findAllGuides(): GuideItem[] {
  // 呼び出し側で破壊されないようコピーを返す
  return [...ALL_GUIDES_INTERNAL];
}

export function findGuideBySlug(slug: string): GuideItem | undefined {
  return ALL_GUIDES_INTERNAL.find((g) => g.slug === slug);
}
