// lib/seo/indexability.ts
//
// Indexing policy:
// - publicState/status/noindex を正として、公開可否だけで index/noindex を決める。
// - 文字数・見出し数・関連リンク数などの品質ゲートは noindex 理由にしない。
// - 品質不足は scripts/content-audit.mjs 側の改善レポートで扱う。

import type {
  CarItem,
  ColumnItem,
  GuideItem,
  HeritageItem,
  NewsItem,
  PublicState,
} from "@/lib/content-types";
import {
  countDecisionMarkdownHeadings,
  getDecisionColumnAuditBody,
  isDecisionColumn,
} from "@/lib/decision-article";

export type IndexabilityResult = {
  indexable: boolean;
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
  pushText(car.costImpression);
  pushText(car.body);
  pushText(car.purchasePriceSafe);
  pushText(car.maintenanceSimulation?.yearlyRoughTotal ?? null);

  const mCost = car.maintenanceCostYenPerYear;
  if (typeof mCost === "number" && Number.isFinite(mCost)) {
    parts.push(String(mCost));
  }

  for (const item of normalizeList(car.bestFor)) parts.push(item);
  for (const item of normalizeList(car.notFor)) parts.push(item);
  for (const item of normalizeList(car.strengths)) parts.push(item);
  for (const item of normalizeList(car.weaknesses)) parts.push(item);
  for (const item of normalizeList(car.troubleTrends)) parts.push(item);
  for (const item of normalizeList(car.maintenanceNotes)) parts.push(item);

  return parts.join("\n").trim();
}

function isPublished(status?: string | null): boolean {
  return !status || status === "published";
}

function getPublicState(item: { publicState?: unknown } | null | undefined): PublicState | null {
  const s = typeof item?.publicState === "string" ? item.publicState.trim().toLowerCase() : null;
  if (s === "index" || s === "noindex" || s === "draft" || s === "redirect") return s as PublicState;
  return null;
}

function evaluatePolicyGate(
  item: { status?: string | null; noindex?: boolean | null; publicState?: unknown } | null | undefined,
  reasons: string[]
): { published: boolean; state: PublicState | null; allowIndex: boolean } {
  const published = isPublished(item?.status ?? null);
  const state = getPublicState(item);

  if (!published) reasons.push("status:not_published");
  if (!state) reasons.push("missing:publicState");
  if (state && state !== "index") reasons.push(`publicState:${state}`);
  if (item?.noindex === true) reasons.push("flag:noindex");

  const allowIndex = published && state === "index" && item?.noindex !== true;
  return { published, state, allowIndex };
}

export function evaluateCarIndexability(car: CarItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!car) return { indexable: false, reasons: ["missing:car"], metrics: {} };

  const slug = (car.slug ?? "").trim();
  if (!slug) reasons.push("missing:slug");

  const { state, allowIndex } = evaluatePolicyGate(car, reasons);
  const contentText = buildCarContentText(car);
  const contentLen = contentText.length;
  const bodyLen = (car.body ?? "").trim().length;

  if (contentLen === 0) reasons.push("empty:content");

  return {
    indexable: Boolean(slug) && allowIndex && contentLen > 0,
    reasons,
    metrics: {
      slug,
      state,
      contentLen,
      bodyLen,
      strengthsCount: normalizeList(car.strengths).length,
      concernsCount: normalizeList(car.weaknesses).length + normalizeList(car.troubleTrends).length,
      relatedCarsCount: normalizeList(car.relatedCarSlugs).length,
      relatedGuidesCount: normalizeList(car.relatedGuideSlugs).length,
      relatedColumnsCount: normalizeList(car.relatedColumnSlugs).length,
      relatedHeritageCount: normalizeList(car.relatedHeritageSlugs).length,
    },
  };
}

export function isIndexableCar(car: CarItem): boolean {
  return evaluateCarIndexability(car).indexable;
}

export function evaluateColumnIndexability(column: ColumnItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!column) return { indexable: false, reasons: ["missing:column"], metrics: {} };

  const slug = (column.slug ?? "").trim();
  const title = (column.title ?? "").trim();
  const body = isDecisionColumn(column) ? getDecisionColumnAuditBody(column) : (column.body ?? "").trim();

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state, allowIndex } = evaluatePolicyGate(column, reasons);
  const bodyLen = body.length;
  const headings = isDecisionColumn(column) ? countDecisionMarkdownHeadings(body) : countMarkdownHeadings(body);

  if (bodyLen === 0) reasons.push("empty:body");

  return {
    indexable: Boolean(slug) && Boolean(title) && allowIndex && bodyLen > 0,
    reasons,
    metrics: { slug, state, bodyLen, headings },
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

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state, allowIndex } = evaluatePolicyGate(guide, reasons);
  const bodyLen = body.length;
  const headings = countMarkdownHeadings(body);

  if (bodyLen === 0) reasons.push("empty:body");

  return {
    indexable: Boolean(slug) && Boolean(title) && allowIndex && bodyLen > 0,
    reasons,
    metrics: { slug, state, bodyLen, headings },
  };
}

export function isIndexableGuide(guide: GuideItem): boolean {
  return evaluateGuideIndexability(guide).indexable;
}

export function evaluateHeritageIndexability(item: HeritageItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!item) return { indexable: false, reasons: ["missing:heritage"], metrics: {} };

  const slug = (item.slug ?? "").trim();
  const title = (item.title ?? "").trim();
  const body = (item.body ?? "").trim();

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state, allowIndex } = evaluatePolicyGate(item, reasons);
  const bodyLen = body.length;
  const chapters = countHeritageChapters(body);
  const headings = countMarkdownHeadings(body);

  if (bodyLen === 0) reasons.push("empty:body");

  return {
    indexable: Boolean(slug) && Boolean(title) && allowIndex && bodyLen > 0,
    reasons,
    metrics: { slug, state, bodyLen, chapters, headings },
  };
}

export function isIndexableHeritage(item: HeritageItem): boolean {
  return evaluateHeritageIndexability(item).indexable;
}

/**
 * NEWS（詳細）は原則 noindex。
 * - 公式URLへ送客が主目的
 * - 重複/瞬間性が高い
 */
export function evaluateNewsIndexability(news: NewsItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!news) return { indexable: false, reasons: ["missing:news"], metrics: {} };

  const slug = (news.slug ?? news.id ?? "").trim();
  if (!slug) reasons.push("missing:slug");

  const { state } = evaluatePolicyGate(news, reasons);
  reasons.push("default:noindex");

  return {
    indexable: false,
    reasons,
    metrics: { slug, state },
  };
}

export function isIndexableNews(news: NewsItem): boolean {
  return evaluateNewsIndexability(news).indexable;
}
