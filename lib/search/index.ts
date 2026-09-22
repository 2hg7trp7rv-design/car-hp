// lib/search/index.ts

import { articleText } from "@/lib/content/article-text";
import { getAllCarsSync } from "@/lib/cars";
import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import { learningSearchDocuments } from "@/lib/search/learning";

import {
  buildCarDescription,
  buildColumnDescription,
  buildGuideDescription,
  buildHeritageDescription,
  clampText,
  toPlainText,
} from "@/lib/seo/serp";

import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";

type IndexedDoc = SearchDoc & {
  _title: string;
  _haystack: string;
  _body: string;
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

  // 短すぎるクエリはノイズが多いので、強い一致を要求
  const isVeryShort = queryNorm.length <= 1;

  let score = 0;

  // フレーズ一致
  if (title.includes(queryNorm)) score += 140;
  if (hay.includes(queryNorm)) score += 70;
  if (doc._body.includes(queryNorm)) score += 30;

  // トークン一致
  for (const t of tokens) {
    if (!t || t === queryNorm) continue;
    if (title.includes(t)) score += 60;
    if (hay.includes(t)) score += 24;
    if (doc._body.includes(t)) score += 10;
  }

  if (isVeryShort) {
    // 1文字はタイトルに含まれていないと返さない
    if (!title.includes(queryNorm)) return 0;
  }

  // Popularity/recency rank matches; they must never create a match.
  if (score === 0) return 0;

  // タイプ優先（入口に寄せる）
  switch (doc.type) {
    case "learn":
      score += 8;
      break;
    case "cars":
      score += 10;
      break;
    case "guide":
      score += 8;
      break;
    case "column":
      score += 6;
      break;
    case "heritage":
      score += 4;
      break;
    default:
      break;
  }

  // 新しさブースト（Column/Guide が効く）
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

  // --- CARS (sync cache) ---
  const [guides, columns, heritage] = await Promise.all([
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
  ]);
  const cars = getAllCarsSync();
  for (const car of cars) {
    const title = `${car.maker ?? ""} ${car.name ?? ""} ${car.grade ?? ""}`
      .replace(/\s+/g, " ")
      .trim();

    const description = clampForCard(
      buildCarDescription({
        seoDescription: car.seoDescription,
        summaryLong: (car as any).summaryLong,
        summary: car.summary,
        maker: car.maker,
        name: car.name,
        grade: (car as any).grade,
      }),
      104,
    );

    const base: SearchDoc = {
      type: "cars",
      id: car.id,
      slug: car.slug,
      href: `/cars/${encodeURIComponent(car.slug)}`,
      title: title || car.title,
      description,
      maker: car.maker,
      category: car.segment ?? car.bodyType ?? undefined,
      tags: car.tags ?? undefined,
      date: car.updatedAt ?? car.publishedAt ?? car.createdAt ?? undefined,
    };

    const _title = normalizeText(base.title);
    const _haystack = normalizeText(
      [
        base.title,
        base.maker,
        base.category,
        ...(base.tags ?? []),
        base.description,
        (car as any).troubleTrends?.join(" ") ?? "",
        (car as any).maintenanceNotes?.join(" ") ?? "",
      ].join(" "),
    );

    docs.push({ ...base, _title, _haystack, _body: normalizeText(car.body) });
  }

  // --- GUIDE ---
  for (const g of guides) {
    const title = (g.titleJa ?? g.title ?? "").trim();
    const description = clampForCard(
      buildGuideDescription({
        seoDescription: g.seoDescription,
        summary: g.summary,
        lead: (g as any).lead,
        body: (g as any).body,
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
      category: (g as any).category ?? undefined,
      tags: g.tags ?? undefined,
      date: g.publishedAt ?? g.updatedAt ?? g.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _body: normalizeText(articleText(g)),
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [
          base.title,
          base.category,
          ...(base.tags ?? []),
          base.description,
          (g as any).intentTags?.join(" ") ?? "",
        ].join(" "),
      ),
    });
  }

  // --- COLUMN ---
  for (const c of columns) {
    const title = (c.titleJa ?? c.title ?? "").trim();
    const description = clampForCard(
      buildColumnDescription({
        seoDescription: c.seoDescription,
        summary: c.summary,
        body: (c as any).body,
        targetKeyword: (c as any).targetKeyword,
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
      category: (c as any).category ?? undefined,
      tags: c.tags ?? undefined,
      date: c.publishedAt ?? c.updatedAt ?? c.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _body: normalizeText(articleText(c)),
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [
          base.title,
          base.category,
          ...(base.tags ?? []),
          base.description,
          (c as any).targetKeyword ?? "",
        ].join(" "),
      ),
    });
  }

  // --- HERITAGE ---
  for (const h of heritage) {
    const title = (h.titleJa ?? h.title ?? "").trim();
    const description = clampForCard(
      buildHeritageDescription({
        seoDescription: h.seoDescription,
        summary: h.summary,
        lead: (h as any).lead,
        subtitle: (h as any).subtitle,
        body: (h as any).body,
        title: h.title,
        titleJa: h.titleJa,
        maker: (h as any).maker,
      }),
      104,
    );

    const base: SearchDoc = {
      type: "heritage",
      id: h.id,
      slug: h.slug,
      href: `/heritage/${encodeURIComponent(h.slug)}`,
      title,
      description,
      maker: (h as any).maker ?? undefined,
      category: (h as any).kind ?? undefined,
      tags: h.tags ?? undefined,
      date: h.publishedAt ?? h.updatedAt ?? h.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _body: normalizeText(h.body),
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [
          base.title,
          base.maker,
          base.category,
          ...(base.tags ?? []),
          base.description,
          (h as any).brandName ?? "",
          (h as any).modelName ?? "",
        ].join(" "),
      ),
    });
  }

  for (const { doc, body } of learningSearchDocuments()) {
    docs.push({
      ...doc,
      description: clampForCard(doc.description, 104),
      _title: normalizeText(doc.title),
      _haystack: normalizeText([doc.title, doc.description, doc.category, ...(doc.tags ?? [])].join(" ")),
      _body: normalizeText(body),
    });
  }

  return {
    docs,
    builtAt: Date.now(),
  };
}

async function getSearchIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    indexPromise = buildSearchIndex().catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
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

  // 1文字検索は誤爆が多いので基本不可（記号なども）
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

    // internal fields を落として返す
    hits.push({ ...publicSearchDoc(doc), score });
  }

  hits.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    const ta = toEpoch(a.date);
    const tb = toEpoch(b.date);
    if (ta !== tb) return tb - ta;
    return a.title.localeCompare(b.title);
  });

  return hits.slice(0, limit);
}

function publicSearchDoc(doc: IndexedDoc): SearchDoc {
  const { _title: _t, _haystack: _h, _body: _b, ...publicDoc } = doc;
  return publicDoc;
}

export async function getSearchSuggestions(): Promise<Record<SearchDocType, SearchDoc[]>> {
  const { docs } = await getSearchIndex();
  const pick = (type: SearchDocType) => docs.filter((doc) => doc.type === type).slice(0, 6).map(publicSearchDoc);
  return { cars: pick("cars"), guide: pick("guide"), column: pick("column"), heritage: pick("heritage"), learn: pick("learn") };
}
