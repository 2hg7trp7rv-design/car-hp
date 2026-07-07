// lib/search/index.ts

import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";

import {
  buildColumnDescription,
  buildGuideDescription,
  clampText,
  toPlainText,
} from "@/lib/seo/serp";

import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";

type IndexedDoc = SearchDoc & {
  _title: string;
  _haystack: string;
};

type SearchIndex = {
  docs: IndexedDoc[];
  builtAt: number;
};

let indexPromise: Promise<SearchIndex> | null = null;

function normalizeText(input: unknown): string {
  return toPlainText(String(input ?? ""))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u3000\s]+/g, " ")
    .trim();
}

function clampForCard(text: string, maxChars = 96): string {
  return clampText(text, maxChars);
}

function tokenizeQuery(normalizedQuery: string): string[] {
  const q = normalizedQuery.trim();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  const tokens = new Set<string>();
  tokens.add(q);
  for (const p of parts) tokens.add(p);
  return Array.from(tokens);
}

function toEpoch(dateIso?: string): number {
  if (!dateIso) return 0;
  const t = Date.parse(dateIso);
  return Number.isNaN(t) ? 0 : t;
}

function scoreDoc(doc: IndexedDoc, queryNorm: string, tokens: string[]): number {
  if (!queryNorm) return 0;

  const title = doc._title;
  const hay = doc._haystack;
  const isVeryShort = queryNorm.length <= 1;

  let score = 0;

  if (title.includes(queryNorm)) score += 140;
  if (hay.includes(queryNorm)) score += 70;

  for (const t of tokens) {
    if (!t || t === queryNorm) continue;
    if (title.includes(t)) score += 60;
    if (hay.includes(t)) score += 24;
  }

  if (isVeryShort && !title.includes(queryNorm)) return 0;

  switch (doc.type) {
    case "guide":
      score += 8;
      break;
    case "column":
      score += 6;
      break;
  }

  const t = toEpoch(doc.date);
  if (t > 0) {
    const ageDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
    if (ageDays <= 14) score += 18;
    else if (ageDays <= 30) score += 12;
    else if (ageDays <= 90) score += 7;
    else if (ageDays <= 365) score += 3;
  }

  return score;
}

async function buildSearchIndex(): Promise<SearchIndex> {
  const docs: IndexedDoc[] = [];

  const guides = await getAllGuides();
  for (const g of guides) {
    const title = (g.titleJa ?? g.title ?? "").trim();
    const description = clampForCard(
      buildGuideDescription({
        seoDescription: g.seoDescription,
        summary: g.summary,
        lead: g.lead,
        body: g.body,
        title: g.title,
      }),
      104,
    );

    const base: SearchDoc = {
      type: "guide",
      id: g.id,
      slug: g.slug,
      href: `/guide/${encodeURIComponent(g.slug)}`,
      title,
      description,
      category: g.category ?? undefined,
      tags: g.tags ?? undefined,
      date: g.publishedAt ?? g.updatedAt ?? g.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [
          base.title,
          base.category,
          ...(base.tags ?? []),
          base.description,
          g.intentTags?.join(" ") ?? "",
        ].join(" "),
      ),
    });
  }

  const columns = await getAllColumns();
  for (const c of columns) {
    const title = (c.titleJa ?? c.title ?? "").trim();
    const description = clampForCard(
      buildColumnDescription({
        seoDescription: c.seoDescription,
        summary: c.summary,
        body: c.body,
        targetKeyword: c.targetKeyword,
        title: c.title,
      }),
      104,
    );

    const base: SearchDoc = {
      type: "column",
      id: c.id,
      slug: c.slug,
      href: `/column/${encodeURIComponent(c.slug)}`,
      title,
      description,
      category: c.category ?? undefined,
      tags: c.tags ?? undefined,
      date: c.publishedAt ?? c.updatedAt ?? c.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [
          base.title,
          base.category,
          ...(base.tags ?? []),
          base.description,
          c.targetKeyword ?? "",
        ].join(" "),
      ),
    });
  }

  return {
    docs,
    builtAt: Date.now(),
  };
}

export async function getSearchIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    indexPromise = buildSearchIndex();
  }
  return indexPromise;
}

export function __resetSearchIndexForTest(): void {
  indexPromise = null;
}

export async function searchSite(params: {
  q: string;
  type?: SearchDocType | "all";
  limit?: number;
}): Promise<SearchHit[]> {
  const qRaw = String(params.q ?? "");
  const queryNorm = normalizeText(qRaw);

  if (!queryNorm) return [];
  if (queryNorm.length <= 1) return [];

  const type = params.type ?? "all";
  const limit =
    typeof params.limit === "number"
      ? Math.max(1, Math.min(50, Math.floor(params.limit)))
      : 30;

  const index = await getSearchIndex();
  const tokens = tokenizeQuery(queryNorm);

  const hits: SearchHit[] = [];

  for (const doc of index.docs) {
    if (type !== "all" && doc.type !== type) continue;

    const score = scoreDoc(doc, queryNorm, tokens);
    if (score <= 0) continue;

    const { _title: _t, _haystack: _h, ...publicDoc } = doc;
    hits.push({ ...(publicDoc as SearchDoc), score });
  }

  hits.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    const ta = toEpoch(a.date);
    const tb = toEpoch(b.date);
    if (ta !== tb) return tb - ta;
    return a.title.localeCompare(b.title, "ja");
  });

  return hits.slice(0, limit);
}
