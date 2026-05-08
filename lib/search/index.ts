// lib/search/index.ts

import { getAllCarsSync } from "@/lib/cars";
import { getAllColumns } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import { getAllNews } from "@/lib/news";

import {
  buildCarDescription,
  buildColumnDescription,
  buildGuideDescription,
  buildHeritageDescription,
  buildNewsDescription,
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

  // 短すぎるクエリはノイズが多いので、強い一致を要求
  const isVeryShort = queryNorm.length <= 1;

  let score = 0;

  // フレーズ一致
  if (title.includes(queryNorm)) score += 140;
  if (hay.includes(queryNorm)) score += 70;

  // トークン一致
  for (const t of tokens) {
    if (!t || t === queryNorm) continue;
    if (title.includes(t)) score += 60;
    if (hay.includes(t)) score += 24;
  }

  if (isVeryShort) {
    // 1文字はタイトルに含まれていないと返さない
    if (!title.includes(queryNorm)) return 0;
  }

  // タイプ優先（入口に寄せる）
  switch (doc.type) {
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
    case "news":
      score += 2;
      break;
    default:
      break;
  }

  // 新しさブースト（News/Column/Guide が効く）
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
        (car as any).body ?? "",
      ].join(" "),
    );

    docs.push({ ...base, _title, _haystack });
  }

  // --- GUIDE ---
  const guides = await getAllGuides();
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
  const columns = await getAllColumns();
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
  const heritage = await getAllHeritage();
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

  // --- NEWS ---
  // NEWS は数が増えやすいので上限を設ける（内部検索用途: 最新寄り）
  const newsAll = await getAllNews();
  const news = newsAll.slice(0, 1200);

  for (const n of news) {
    const title = (n.titleJa ?? n.title ?? "").trim();
    const description = clampForCard(
      buildNewsDescription({
        seoDescription: n.seoDescription,
        excerpt: (n as any).excerpt,
        commentJa: (n as any).commentJa,
      }),
      104,
    );

    const idOrSlug = (n.id ?? n.slug).trim();

    const base: SearchDoc = {
      type: "news",
      id: idOrSlug,
      slug: idOrSlug,
      href: `/news/${encodeURIComponent(idOrSlug)}`,
      title,
      description,
      maker: (n as any).maker ?? undefined,
      category: (n as any).category ?? undefined,
      tags: n.tags ?? undefined,
      date: n.publishedAt ?? n.updatedAt ?? n.createdAt ?? undefined,
    };

    docs.push({
      ...base,
      _title: normalizeText(base.title),
      _haystack: normalizeText(
        [base.title, base.maker, base.category, ...(base.tags ?? []), base.description].join(
          " ",
        ),
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
    const { _title: _t, _haystack: _h, ...publicDoc } = doc;
    hits.push({ ...(publicDoc as SearchDoc), score });
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
