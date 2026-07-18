// lib/seo/indexability.ts
//
// Indexing policy:
// - publicState/status/noindex を正として、公開可否だけで index/noindex を決める。
// - 文字数・見出し数・関連リンク数などの品質ゲートは noindex 理由にしない。

import type { ColumnItem, GuideItem, PublicState } from "@/lib/content-types";
import {
  hasSubstantiveArticleContent,
  isArticleDiscoverable,
} from "@/lib/content/discoverability";
import {
  countDecisionMarkdownHeadings,
  getDecisionColumnAuditBody,
  getDecisionGuideAuditBody,
  isDecisionColumn,
  isDecisionGuide,
} from "@/lib/decision-article";

export type IndexabilityResult = {
  indexable: boolean;
  reasons: string[];
  metrics: Record<string, number | string | boolean | null | undefined>;
};

function countMarkdownHeadings(body: string): number {
  const lines = body.split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    if (/^#{2,3}\s+/.test(line.trim())) count += 1;
  }
  return count;
}

function isPublished(status?: string | null): boolean {
  return status === "published";
}

function getPublicState(item: { publicState?: unknown } | null | undefined): PublicState | null {
  const s = typeof item?.publicState === "string" ? item.publicState.trim().toLowerCase() : null;
  if (s === "index" || s === "noindex" || s === "draft" || s === "redirect") return s as PublicState;
  return null;
}

function evaluatePolicyGate(
  item: { status?: string | null; noindex?: boolean | null; publicState?: unknown } | null | undefined,
  reasons: string[],
): { published: boolean; state: PublicState | null; allowIndex: boolean } {
  const published = isPublished(item?.status ?? null);
  const explicitState = getPublicState(item);
  const state = explicitState;

  if (!published) reasons.push("status:not_published");
  if (!explicitState) reasons.push("missing:publicState");
  if (state !== "index") reasons.push(`publicState:${state}`);
  if (item?.noindex === true) reasons.push("flag:noindex");
  if (item?.noindex !== true && item?.noindex !== false) reasons.push("missing:noindex");

  const allowIndex = published && state === "index" && item?.noindex === false;
  return { published, state, allowIndex };
}

export function evaluateColumnIndexability(column: ColumnItem): IndexabilityResult {
  const reasons: string[] = [];
  if (!column) return { indexable: false, reasons: ["missing:column"], metrics: {} };

  const slug = (column.slug ?? "").trim();
  const title = (column.title ?? "").trim();
  const body = isDecisionColumn(column) ? getDecisionColumnAuditBody(column) : (column.body ?? "").trim();

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state } = evaluatePolicyGate(column, reasons);
  const bodyLen = body.length;
  const headings = isDecisionColumn(column) ? countDecisionMarkdownHeadings(body) : countMarkdownHeadings(body);

  if (!hasSubstantiveArticleContent(column)) reasons.push("empty:body");

  return {
    indexable: isArticleDiscoverable(column),
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
  const body = isDecisionGuide(guide) ? getDecisionGuideAuditBody(guide) : (guide.body ?? "").trim();

  if (!slug) reasons.push("missing:slug");
  if (!title) reasons.push("missing:title");

  const { state } = evaluatePolicyGate(guide, reasons);
  const bodyLen = body.length;
  const headings = isDecisionGuide(guide) ? countDecisionMarkdownHeadings(body) : countMarkdownHeadings(body);

  if (!hasSubstantiveArticleContent(guide)) reasons.push("empty:body");

  return {
    indexable: isArticleDiscoverable(guide),
    reasons,
    metrics: { slug, state, bodyLen, headings },
  };
}

export function isIndexableGuide(guide: GuideItem): boolean {
  return evaluateGuideIndexability(guide).indexable;
}
