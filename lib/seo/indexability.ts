// lib/seo/indexability.ts

import type {
  CarItem,
  ColumnItem,
  GuideItem,
  HeritageItem,
  NewsItem,
} from "@/lib/content-types";
import {
  getIndexingOverrideForContent,
  type IndexingOverrideAction,
} from "@/lib/seo/indexing-overrides";

/**
 * “今 index させて良いページか？” の判定 + 理由を返す。
 *
 * 目的:
 * - 下書き/薄いページをクロールさせ続けるとサイト全体の評価が伸びづらい
 * - 「完成してから index」させる運用をコードで担保する
 *
 * NOTE:
 * - forceIndex は “品質条件のみ” を緩める（draft/noindex は救済しない）
 * - forceNoindex は最優先で noindex
 */

export type IndexabilityResult = {
  indexable: boolean;
  overriddenBy?: IndexingOverrideAction;
  reasons: string[];
  metrics: Record<string, number | string | boolean | null | undefined>;
};

function normalizeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

function countMarkdownHeadings(body: string): number {
  const lines = body.split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    if (/^#{2,3}\s+/.test(line.trim())) count += 1;
  }
  return count;
}

// HERITAGE は「【章タイトル】」で章立てされる前提が多い
function countHeritageChapters(body: string): number {
  const lines = body.split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("【") && t.includes("】")) count += 1;
  }
  return count;
}

function buildCarContentText(car: CarItem): string {
  const parts: string[] = [];

  const pushText = (v: unknown) => {
    if (typeof v !== "string") return;
    const s = v.trim();
    if (s) parts.push(s);
  };

  pushText(car.summaryLong);
  pushText(car.summary);
  pushText((car as any).costImpression);
  pushText((car as any).maintenanceSimulation);
  pushText((car as any).purchasePriceSafe);

  for (const item of normalizeList(car.strengths)) parts.push(item);
  for (const item of normalizeList(car.weaknesses)) parts.push(item);
  for (const item of normalizeList((car as any).troubleTrends)) parts.push(item);
  for (const item of normalizeList((car as any).maintenanceNotes)) parts.push(item);

  return parts.join("\n").trim();
}

function isPublished(status?: string | null): boolean {
  return !status || status === "published";
}

export function evaluateCarIndexability(car: CarItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!car) return { indexable: false, reasons: ["missing:car"], metrics: {} };

  const slug = (car.slug ?? "").trim();
  const published = isPublished(car.status);

  const override = slug ? getIndexingOverrideForContent("CAR", slug) : null;

  if (!slug) reasons.push("missing:slug");
  if (!published) reasons.push("status:not_published");

  if (override === "forceNoindex") {
    return {
      indexable: false,
      overriddenBy: "forceNoindex",
      reasons: ["override:forceNoindex", ...reasons],
      metrics: { slug },
    };
  }

  // hard blockers（forceIndexでも救済しない）
  if (!slug || !published) {
    return {
      indexable: false,
      overriddenBy: override ?? undefined,
      reasons,
      metrics: { slug },
    };
  }

  // A基準（企画書の目安）
  const contentText = buildCarContentText(car);
  const contentLen = contentText.length;

  const strengths = normalizeList(car.strengths);
  const weaknesses = normalizeList(car.weaknesses);
  const troubles = normalizeList((car as any).troubleTrends);

  const concernsCount = weaknesses.length + troubles.length;

  const meetsLength = contentLen >= 2000;
  const hasStrengths = strengths.length >= 3;
  const hasConcerns = concernsCount >= 3;
  const hasBullets = hasStrengths || hasConcerns;

  if (!meetsLength) reasons.push("thin:content<2000");
  if (!hasBullets) reasons.push("thin:bullets_missing");

  const qualityOk = meetsLength && hasBullets;

  if (!qualityOk && override === "forceIndex") {
    return {
      indexable: true,
      overriddenBy: "forceIndex",
      reasons: ["override:forceIndex", ...reasons],
      metrics: {
        slug,
        contentLen,
        strengthsCount: strengths.length,
        concernsCount,
      },
    };
  }

  return {
    indexable: qualityOk,
    overriddenBy: override ?? undefined,
    reasons,
    metrics: {
      slug,
      contentLen,
      strengthsCount: strengths.length,
      concernsCount,
    },
  };
}

export function isIndexableCar(car: CarItem): boolean {
  return evaluateCarIndexability(car).indexable;
}

export function evaluateColumnIndexability(column: ColumnItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!column)
    return { indexable: false, reasons: ["missing:column"], metrics: {} };

  const slug = (column.slug ?? "").trim();
  const title = (column.title ?? "").trim();
  const body = (column.body ?? "").trim();
  const published = isPublished(column.status);

  const override = slug ? getIndexingOverrideForContent("COLUMN", slug) : null;

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");
  if (column.noindex) reasons.push("flag:noindex");
  if (!published) reasons.push("status:not_published");

  if (override === "forceNoindex") {
    return {
      indexable: false,
      overriddenBy: "forceNoindex",
      reasons: ["override:forceNoindex", ...reasons],
      metrics: { slug },
    };
  }

  // hard blockers
  if (!slug || !title || column.noindex || !published) {
    return {
      indexable: false,
      overriddenBy: override ?? undefined,
      reasons,
      metrics: { slug, titleLen: title.length, bodyLen: body.length },
    };
  }

  // 企画書の目安: 1200〜2500文字（まずは1200以上を合格とする）
  const bodyLen = body.length;
  const headings = countMarkdownHeadings(body);

  const meetsLength = bodyLen >= 1200;
  const hasStructure = headings >= 3;

  if (!meetsLength) reasons.push("thin:body<1200");
  if (!hasStructure) reasons.push("thin:headings<3");

  const qualityOk = meetsLength && hasStructure;

  if (!qualityOk && override === "forceIndex") {
    return {
      indexable: true,
      overriddenBy: "forceIndex",
      reasons: ["override:forceIndex", ...reasons],
      metrics: { slug, bodyLen, headings },
    };
  }

  return {
    indexable: qualityOk,
    overriddenBy: override ?? undefined,
    reasons,
    metrics: { slug, bodyLen, headings },
  };
}

export function isIndexableColumn(column: ColumnItem): boolean {
  return evaluateColumnIndexability(column).indexable;
}

export function evaluateGuideIndexability(guide: GuideItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!guide) return { indexable: false, reasons: ["missing:guide"], metrics: {} };

  const slug = (guide.slug ?? "").trim();
  const title = (guide.title ?? "").trim();
  const body = (guide.body ?? "").trim();
  const published = isPublished(guide.status);

  const override = slug ? getIndexingOverrideForContent("GUIDE", slug) : null;

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");
  if (guide.noindex) reasons.push("flag:noindex");
  if (!published) reasons.push("status:not_published");

  if (override === "forceNoindex") {
    return {
      indexable: false,
      overriddenBy: "forceNoindex",
      reasons: ["override:forceNoindex", ...reasons],
      metrics: { slug },
    };
  }

  // hard blockers
  if (!slug || !title || guide.noindex || !published) {
    return {
      indexable: false,
      overriddenBy: override ?? undefined,
      reasons,
      metrics: { slug, titleLen: title.length, bodyLen: body.length },
    };
  }

  const bodyLen = body.length;
  const headings = countMarkdownHeadings(body);

  // 企画書の目安: 2500〜5000
  const meetsLength = bodyLen >= 2500;
  const hasStructure = headings >= 4;

  if (!meetsLength) reasons.push("thin:body<2500");
  if (!hasStructure) reasons.push("thin:headings<4");

  const qualityOk = meetsLength && hasStructure;

  if (!qualityOk && override === "forceIndex") {
    return {
      indexable: true,
      overriddenBy: "forceIndex",
      reasons: ["override:forceIndex", ...reasons],
      metrics: { slug, bodyLen, headings },
    };
  }

  return {
    indexable: qualityOk,
    overriddenBy: override ?? undefined,
    reasons,
    metrics: { slug, bodyLen, headings },
  };
}

export function isIndexableGuide(guide: GuideItem): boolean {
  return evaluateGuideIndexability(guide).indexable;
}

export function evaluateHeritageIndexability(item: HeritageItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!item)
    return { indexable: false, reasons: ["missing:heritage"], metrics: {} };

  const slug = (item.slug ?? "").trim();
  const title = (item.title ?? "").trim();
  const body = (item.body ?? "").trim();
  const published = isPublished(item.status);

  const override = slug ? getIndexingOverrideForContent("HERITAGE", slug) : null;

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");
  if (item.noindex) reasons.push("flag:noindex");
  if (!published) reasons.push("status:not_published");

  if (override === "forceNoindex") {
    return {
      indexable: false,
      overriddenBy: "forceNoindex",
      reasons: ["override:forceNoindex", ...reasons],
      metrics: { slug },
    };
  }

  // hard blockers
  if (!slug || !title || item.noindex || !published) {
    return {
      indexable: false,
      overriddenBy: override ?? undefined,
      reasons,
      metrics: { slug, titleLen: title.length, bodyLen: body.length },
    };
  }

  const bodyLen = body.length;
  const chapters = countHeritageChapters(body);
  const headings = countMarkdownHeadings(body);

  // 企画書の目安: 6000〜10000
  const meetsLength = bodyLen >= 6000;
  const hasStructure = chapters >= 3 || headings >= 4;

  if (!meetsLength) reasons.push("thin:body<6000");
  if (!hasStructure) reasons.push("thin:structure_missing");

  const qualityOk = meetsLength && hasStructure;

  if (!qualityOk && override === "forceIndex") {
    return {
      indexable: true,
      overriddenBy: "forceIndex",
      reasons: ["override:forceIndex", ...reasons],
      metrics: { slug, bodyLen, chapters, headings },
    };
  }

  return {
    indexable: qualityOk,
    overriddenBy: override ?? undefined,
    reasons,
    metrics: { slug, bodyLen, chapters, headings },
  };
}

export function isIndexableHeritage(item: HeritageItem): boolean {
  return evaluateHeritageIndexability(item).indexable;
}

/**
 * NEWS（詳細）は基本 noindex（重複/瞬間性が高い & 公式URLへ送客が主目的）
 * - 例外的に index したい場合は overrides で forceIndex を使う
 */
export function evaluateNewsIndexability(news: NewsItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!news) return { indexable: false, reasons: ["missing:news"], metrics: {} };

  const slug = (news.slug ?? news.id ?? "").trim();
  const override = slug ? getIndexingOverrideForContent("NEWS", slug) : null;

  if (override === "forceNoindex") {
    return {
      indexable: false,
      overriddenBy: "forceNoindex",
      reasons: ["override:forceNoindex"],
      metrics: { slug },
    };
  }

  // default: noindex
  reasons.push("default:noindex");

  if (override === "forceIndex") {
    return {
      indexable: true,
      overriddenBy: "forceIndex",
      reasons: ["override:forceIndex", ...reasons],
      metrics: { slug },
    };
  }

  return {
    indexable: false,
    overriddenBy: override ?? undefined,
    reasons,
    metrics: { slug },
  };
}

export function isIndexableNews(news: NewsItem): boolean {
  return evaluateNewsIndexability(news).indexable;
}
