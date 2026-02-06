// app/api/search/route.ts

import { NextResponse } from "next/server";

import { getSearchIndex, searchSite } from "@/lib/search";
import type { SearchDocType } from "@/lib/search/types";

export const dynamic = "force-dynamic";

function normalizeType(input: string | null): SearchDocType | "all" {
  const t = (input ?? "").trim().toLowerCase();
  if (!t || t === "all") return "all";

  if (t === "cars" || t === "car") return "cars";
  if (t === "guide" || t === "guides") return "guide";
  if (t === "column" || t === "columns") return "column";
  if (t === "heritage") return "heritage";
  if (t === "news") return "news";

  return "all";
}

function parseLimit(input: string | null): number {
  const n = Number.parseInt(input ?? "", 10);
  if (Number.isNaN(n)) return 30;
  return Math.max(1, Math.min(50, n));
}

function stripInternal<T extends Record<string, any>>(
  doc: T,
): Omit<T, "_title" | "_haystack"> {
  const { _title, _haystack, ...pub } = doc as any;
  return pub;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const type = normalizeType(url.searchParams.get("type"));
  const limit = parseLimit(url.searchParams.get("limit"));

  const started = Date.now();
  const trimmed = q.trim();

  // 空/短いクエリは候補一覧を返す（内部検索UX用）
  if (trimmed.length <= 1) {
    const index = await getSearchIndex();

    const pick = (t: SearchDocType, n: number) =>
      index.docs
        .filter((d) => d.type === t)
        .slice(0, n)
        .map((d) => stripInternal(d));

    const suggestions = {
      cars: pick("cars", 6),
      guide: pick("guide", 6),
      column: pick("column", 6),
      news: pick("news", 6),
      heritage: pick("heritage", 6),
    };

    return NextResponse.json(
      {
        q: trimmed,
        type,
        results: [],
        suggestions,
        tookMs: Date.now() - started,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const results = await searchSite({ q: trimmed, type, limit });

  return NextResponse.json(
    {
      q: trimmed,
      type,
      results,
      tookMs: Date.now() - started,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
