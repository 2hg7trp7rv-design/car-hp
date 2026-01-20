"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackSiteSearch } from "@/lib/analytics/events";
import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";

type FilterType = "all" | SearchDocType;

type Suggestions = {
  cars: SearchDoc[];
  guide: SearchDoc[];
  column: SearchDoc[];
  news: SearchDoc[];
  heritage: SearchDoc[];
};

type ApiResponse = {
  q: string;
  type: string;
  results: SearchHit[];
  suggestions?: Suggestions;
  tookMs?: number;
};

function normalizeFilterType(raw: string | undefined): FilterType {
  const t = String(raw ?? "").trim().toLowerCase();
  if (!t || t === "all") return "all";
  if (t === "cars" || t === "car") return "cars";
  if (t === "guide" || t === "guides") return "guide";
  if (t === "column" || t === "columns") return "column";
  if (t === "news") return "news";
  if (t === "heritage") return "heritage";
  return "all";
}

function typeLabel(t: FilterType): string {
  if (t === "all") return "ALL";
  if (t === "cars") return "CARS";
  if (t === "guide") return "GUIDE";
  if (t === "column") return "COLUMN";
  if (t === "news") return "NEWS";
  if (t === "heritage") return "HERITAGE";
  return "ALL";
}

function badgeLabel(t: SearchDocType): string {
  if (t === "cars") return "CARS";
  if (t === "guide") return "GUIDE";
  if (t === "column") return "COLUMN";
  if (t === "news") return "NEWS";
  if (t === "heritage") return "HERITAGE";
  return "";
}

function updateUrl(query: string, type: FilterType) {
  try {
    const url = new URL(window.location.href);

    const q = query.trim();
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");

    if (type !== "all") url.searchParams.set("type", type);
    else url.searchParams.delete("type");

    // Next の router を叩かずに URL だけ更新（入力中のSSR再実行を避ける）
    window.history.replaceState(null, "", url.toString());
  } catch {
    // noop
  }
}

export function SearchClient(props: { initialQuery?: string; initialType?: string }) {
  const [q, setQ] = useState<string>(String(props.initialQuery ?? ""));
  const [type, setType] = useState<FilterType>(normalizeFilterType(props.initialType));

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [tookMs, setTookMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastTrackedRef = useRef<string>("");

  const queryTrimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      // URL 反映（SSR再実行しない）
      updateUrl(queryTrimmed, type);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const url = `/api/search?q=${encodeURIComponent(queryTrimmed)}&type=${encodeURIComponent(
          type,
        )}&limit=30`;

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!res.ok) {
          throw new Error(`Search API error: ${res.status}`);
        }

        const data = (await res.json()) as ApiResponse;

        const isBlank = queryTrimmed.length <= 1;

        setTookMs(typeof data.tookMs === "number" ? data.tookMs : null);

        if (isBlank) {
          setResults([]);
          setSuggestions(data.suggestions ?? null);
          return;
        }

        const nextResults = Array.isArray(data.results) ? data.results : [];
        setSuggestions(null);
        setResults(nextResults);

        // GA4: site_search（同じ入力で連打しない）
        const trackKey = `${type}__${queryTrimmed}__${nextResults.length}`;
        if (lastTrackedRef.current !== trackKey) {
          lastTrackedRef.current = trackKey;
          trackSiteSearch({
            query: queryTrimmed,
            filter_type: type,
            results_count: nextResults.length,
            page_type: "search",
            content_id: "search",
          });
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError("検索に失敗しました。時間を置いて再度お試しください。");
        setResults([]);
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 240);

    return () => window.clearTimeout(handle);
  }, [queryTrimmed, type]);

  const filterButtons: Array<{ key: FilterType; label: string }> = [
    { key: "all", label: "ALL" },
    { key: "cars", label: "CARS" },
    { key: "guide", label: "GUIDE" },
    { key: "column", label: "COLUMN" },
    { key: "news", label: "NEWS" },
    { key: "heritage", label: "HERITAGE" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
            KEYWORD
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="例：BMW 3シリーズ / 警告灯 / ドラレコ / ルーミー"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 shadow-sm outline-none transition focus:border-tiffany-300 focus:ring-2 focus:ring-tiffany-100"
              aria-label="サイト内検索"
            />
            {loading ? (
              <div className="shrink-0 text-[11px] text-slate-500">検索中…</div>
            ) : tookMs != null ? (
              <div className="shrink-0 text-[11px] text-slate-500">{tookMs}ms</div>
            ) : null}
          </div>
        </div>

        <div className="sm:pl-4">
          <label className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
            TYPE
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {filterButtons.map((b) => {
              const active = type === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setType(b.key)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "border-tiffany-300 bg-tiffany-50 text-tiffany-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                  aria-pressed={active}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-[12px] text-red-600">{error}</p>
      ) : null}

      {/* results */}
      {queryTrimmed.length > 1 ? (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <p className="text-[12px] text-slate-600">
              <span className="font-semibold text-slate-900">{results.length}</span> 件（{typeLabel(type)}）
            </p>
          </div>

          <div className="mt-3 grid gap-3">
            {results.map((r) => (
              <TrackedLink
                key={`${r.type}:${r.slug}`}
                href={r.href}
                toType={r.type as any}
                toId={r.slug}
                shelfId="search_results"
                ctaId={`search_${r.type}`}
              >
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-slate-600">
                      {badgeLabel(r.type)}
                    </span>
                    {r.maker ? (
                      <span className="text-[11px] font-semibold text-slate-600">{r.maker}</span>
                    ) : null}
                    {r.category ? (
                      <span className="text-[11px] text-slate-500">{r.category}</span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold leading-relaxed text-slate-900">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-600">
                    {r.description}
                  </p>
                </div>
              </TrackedLink>
            ))}

            {!loading && results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-[12px] text-slate-600">
                該当なし。別の言い方（例：症状 → 部品名、車種 → 型式/シリーズ名）で試してください。
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-[12px] text-slate-600">人気/最新の入口（1文字以上で候補が出ます）</p>

          {suggestions ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <SuggestionBlock title="CARS" items={suggestions.cars} />
              <SuggestionBlock title="GUIDE" items={suggestions.guide} />
              <SuggestionBlock title="COLUMN" items={suggestions.column} />
              <SuggestionBlock title="NEWS" items={suggestions.news} />
              <SuggestionBlock title="HERITAGE" items={suggestions.heritage} />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/60 p-4 text-[12px] text-slate-600">
              候補を読み込み中…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionBlock(props: { title: string; items: SearchDoc[] }) {
  const { title, items } = props;
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">{title}</p>
      <div className="mt-2 grid gap-2">
        {items.slice(0, 6).map((it) => (
          <TrackedLink
            key={`${it.type}:${it.slug}`}
            href={it.href}
            toType={it.type as any}
            toId={it.slug}
            shelfId="search_suggestions"
            ctaId={`suggest_${it.type}`}
          >
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 text-[12px] text-slate-900 transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
              <div className="line-clamp-1 font-semibold">{it.title}</div>
              <div className="mt-1 line-clamp-1 text-[11px] text-slate-600">{it.description}</div>
            </div>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
