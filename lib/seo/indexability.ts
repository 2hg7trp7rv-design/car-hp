// lib/seo/indexability.ts
//
// 企画書v4: “indexさせて良いか？” をコードで判定し、理由とメトリクスを返す。
// - publicState を正とする（index 以外は必ず noindex 扱い）
// - さらに「品質ゲート（文字数 / 構造）」を満たすこと

import type {
  CarItem,
  ColumnItem,
  GuideItem,
  HeritageItem,
  NewsItem,
  PublicState,
} from "@/lib/content-types";

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
  pushText(car.costImpression);
  pushText(car.body);

  // 企画書: Carsルール（判断・維持費）
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
  // 旧データ互換: status 未指定は published 扱い
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

  // hard blockers（ポリシーNGは救済しない）
  if (!slug || !allowIndex) {
    return {
      indexable: false,
      reasons,
      metrics: { slug, state },
    };
  }

  // A基準（企画書の目安）
  const contentText = buildCarContentText(car);
  const contentLen = contentText.length;
  const bodyLen = (car.body ?? "").trim().length;

  const strengths = normalizeList(car.strengths);
  const weaknesses = normalizeList(car.weaknesses);
  const troubles = normalizeList(car.troubleTrends);

  const concernsCount = weaknesses.length + troubles.length;

  const meetsLength = contentLen >= 2000;
  const hasStrengths = strengths.length >= 3;
  const hasConcerns = concernsCount >= 3;
  const hasBullets = hasStrengths || hasConcerns;

  const hasBudget = Boolean(car.purchasePriceSafe) || Boolean(car.priceUsed);
  const hasMaintenanceCost =
    Boolean(car.maintenanceSimulation?.yearlyRoughTotal) ||
    Boolean(car.costImpression) ||
    (typeof car.maintenanceCostYenPerYear === "number" &&
      Number.isFinite(car.maintenanceCostYenPerYear));

  if (!meetsLength) {
    reasons.push("thin:content<2000");
    if (bodyLen < 400) reasons.push("hint:body_missing");
  }
  if (!hasBullets) reasons.push("thin:bullets_missing");
  if (!hasBudget) reasons.push("thin:budget_missing");
  if (!hasMaintenanceCost) reasons.push("thin:maintenance_cost_missing");

  const qualityOk = meetsLength && hasBullets && hasBudget && hasMaintenanceCost;

  return {
    indexable: qualityOk,
    reasons,
    metrics: {
      slug,
      state,
      contentLen,
      bodyLen,
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

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state, allowIndex } = evaluatePolicyGate(column, reasons);

  // hard blockers
  if (!slug || !title || !allowIndex) {
    return {
      indexable: false,
      reasons,
      metrics: { slug, state, titleLen: title.length, bodyLen: body.length },
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

  return {
    indexable: qualityOk,
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

  // hard blockers
  if (!slug || !title || !allowIndex) {
    return {
      indexable: false,
      reasons,
      metrics: { slug, state, titleLen: title.length, bodyLen: body.length },
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

  return {
    indexable: qualityOk,
    reasons,
    metrics: { slug, state, bodyLen, headings },
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

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state, allowIndex } = evaluatePolicyGate(item, reasons);

  // hard blockers
  if (!slug || !title || !allowIndex) {
    return {
      indexable: false,
      reasons,
      metrics: { slug, state, titleLen: title.length, bodyLen: body.length },
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

  return {
    indexable: qualityOk,
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

  // NEWSは常に “詳細 noindex” を基本方針とする
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
