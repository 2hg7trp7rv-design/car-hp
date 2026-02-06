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

function hasCarSection(body: string, pattern: RegExp): boolean {
  const src = (body ?? "").toString();
  if (!src) return false;
  return pattern.test(src);
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
  const meetsBody = bodyLen >= 1000;
  const hasStrengths = strengths.length >= 3;
  const hasConcerns = concernsCount >= 3;
  const hasBullets = hasStrengths || hasConcerns;

  const hasBudget = Boolean(car.purchasePriceSafe) || Boolean(car.priceUsed);
  const hasMaintenanceCost =
    Boolean(car.maintenanceSimulation?.yearlyRoughTotal) ||
    Boolean(car.costImpression) ||
    (typeof car.maintenanceCostYenPerYear === "number" &&
      Number.isFinite(car.maintenanceCostYenPerYear));

  // 企画書: Carsルール（向く/向かない・チェック・弱点・維持費・中古・比較・関連リンク）
  const body = (car.body ?? "").toString();
  const hasConclusion = hasCarSection(body, /(^|\n)##\s+結論/m);
  const hasSuitability = hasCarSection(body, /(^|\n)##\s+.*(向く人|向かない人)/m);
  const hasCheck = hasCarSection(body, /(^|\n)##\s+.*(買う前|チェック)/m);
  const hasTrouble = hasCarSection(body, /(^|\n)##\s+.*(弱点|故障|トラブル)/m);
  const hasMaintenance = hasCarSection(body, /(^|\n)##\s+.*(維持費|維持|ランニングコスト)/m);
  const hasUsed = hasCarSection(body, /(^|\n)##\s+.*中古/m);
  const hasCompare = hasCarSection(body, /(^|\n)##\s+.*比較/m);
  const hasLinks = hasCarSection(body, /(^|\n)##\s+.*(関連リンク|リンク)/m);

  const bestFor = normalizeList(car.bestFor);
  const notFor = normalizeList(car.notFor);
  const maintenanceNotes = normalizeList(car.maintenanceNotes);

  const hasBestFor = bestFor.length >= 2;
  const hasNotFor = notFor.length >= 2;
  const hasMaintenanceNotes = maintenanceNotes.length >= 2;

  const relatedCars = normalizeList(car.relatedCarSlugs);
  const relatedGuides = normalizeList(car.relatedGuideSlugs);
  const relatedColumns = normalizeList(car.relatedColumnSlugs);
  const relatedHeritage = normalizeList(car.relatedHeritageSlugs);

  const hasRelatedCars = relatedCars.length >= 1 && relatedCars.length <= 3;
  const hasRelatedGuides = relatedGuides.length >= 2;
  const hasRelatedColumns = relatedColumns.length >= 1;
  const hasRelatedHeritage = relatedHeritage.length >= 1;

  if (!meetsLength) {
    reasons.push("thin:content<2000");
    if (bodyLen < 400) reasons.push("hint:body_missing");
  }
  if (!meetsBody) reasons.push("thin:body<1000");
  if (!hasBullets) reasons.push("thin:bullets_missing");
  if (!hasBudget) reasons.push("thin:budget_missing");
  if (!hasMaintenanceCost) reasons.push("thin:maintenance_cost_missing");

  if (!hasConclusion) reasons.push("thin:section:conclusion");
  if (!hasSuitability) reasons.push("thin:section:suitability");
  if (!hasCheck) reasons.push("thin:section:check");
  if (!hasTrouble) reasons.push("thin:section:trouble");
  if (!hasMaintenance) reasons.push("thin:section:maintenance");
  if (!hasUsed) reasons.push("thin:section:used");
  if (!hasCompare) reasons.push("thin:section:compare");
  if (!hasLinks) reasons.push("thin:section:links");

  if (!hasBestFor) reasons.push("thin:bestFor<2");
  if (!hasNotFor) reasons.push("thin:notFor<2");
  if (!hasMaintenanceNotes) reasons.push("thin:maintenanceNotes<2");

  if (!hasRelatedCars) reasons.push("thin:relatedCars:1to3");
  if (!hasRelatedGuides) reasons.push("thin:relatedGuides<2");
  if (!hasRelatedColumns) reasons.push("thin:relatedColumns<1");
  if (!hasRelatedHeritage) reasons.push("thin:relatedHeritage<1");

  const hasSections =
    hasConclusion &&
    hasSuitability &&
    hasCheck &&
    hasTrouble &&
    hasMaintenance &&
    hasUsed &&
    hasCompare &&
    hasLinks;

  const hasDecisionLists = hasBestFor && hasNotFor && hasMaintenanceNotes;
  const hasRelated = hasRelatedCars && hasRelatedGuides && hasRelatedColumns && hasRelatedHeritage;

  const qualityOk =
    meetsLength &&
    meetsBody &&
    hasBullets &&
    hasBudget &&
    hasMaintenanceCost &&
    hasSections &&
    hasDecisionLists &&
    hasRelated;

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
      bestForCount: bestFor.length,
      notForCount: notFor.length,
      maintenanceNotesCount: maintenanceNotes.length,
      relatedCarsCount: relatedCars.length,
      relatedGuidesCount: relatedGuides.length,
      relatedColumnsCount: relatedColumns.length,
      relatedHeritageCount: relatedHeritage.length,
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
