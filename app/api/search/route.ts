// app/api/search/route.ts

import { NextResponse } from "next/server";

import { getSearchSuggestions, searchSite } from "@/lib/search";
import type { SearchDocType } from "@/lib/search/types";

export const dynamic = "force-dynamic";

function normalizeType(input: string | null): SearchDocType | "all" {
  const t = (input ?? "").trim().toLowerCase();
  if (!t || t === "all") return "all";

  if (t === "cars" || t === "car") return "cars";
  if (t === "guide" || t === "guides") return "guide";
  if (t === "column" || t === "columns") return "column";
  if (t === "heritage") return "heritage";

  return "all";
}

function parseLimit(input: string | null): number {
  const n = Number.parseInt(input ?? "", 10);
  if (Number.isNaN(n)) return 30;
  return Math.max(1, Math.min(50, n));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  if (q.length > 200) {
    return NextResponse.json({ error: "検索語は200文字以内で入力してください。" }, { status: 400 });
  }
  const type = normalizeType(url.searchParams.get("type"));
  const limit = parseLimit(url.searchParams.get("limit"));

  const started = Date.now();
  const trimmed = q.trim();

  // 空/短いクエリは候補一覧を返す（内部検索UX用）
  if (trimmed.length <= 1) {
    const suggestions = await getSearchSuggestions();

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
