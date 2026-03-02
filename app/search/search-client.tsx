"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackSiteSearch } from "@/lib/analytics/events";
import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";

type FilterType = "all" | SearchDocType;

export type Suggestions = {
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

export function SearchClient(props: {
  initialQuery?: string;
  initialType?: string;
  initialResults?: SearchHit[];
  initialSuggestions?: Suggestions;
  initialTookMs?: number | null;
}) {
  const initialQuery = String(props.initialQuery ?? "");
  const initialType = normalizeFilterType(props.initialType);
  const initialQueryTrimmed = initialQuery.trim();

  const [q, setQ] = useState<string>(initialQuery);
  const [type, setType] = useState<FilterType>(initialType);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[]>(() =>
    Array.isArray(props.initialResults) ? props.initialResults : [],
  );
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() =>
    props.initialSuggestions ?? null,
  );
  const [tookMs, setTookMs] = useState<number | null>(() =>
    typeof props.initialTookMs === "number" ? props.initialTookMs : null,
  );
  const [error, setError] = useState<string | null>(null);

  const [isUiPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const lastTrackedRef = useRef<string>("");
  const didUseServerSnapshotRef = useRef<boolean>(false);

  const queryTrimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      // URL 反映（SSR再実行しない）
      updateUrl(queryTrimmed, type);

      // SSR で初期候補/初期検索結果が出ている場合、初回だけ API fetch を省略する。
      // （JS 無効/落ちでも HTML が残るようにする狙い）
      const isBlank = queryTrimmed.length <= 1;
      const hasServerSnapshot =
        (!isBlank && queryTrimmed === initialQueryTrimmed && Array.isArray(props.initialResults)) ||
        (isBlank && queryTrimmed === initialQueryTrimmed && !!props.initialSuggestions);

      if (!didUseServerSnapshotRef.current && hasServerSnapshot) {
        didUseServerSnapshotRef.current = true;
        return;
      }

      didUseServerSnapshotRef.current = true;

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

        const took = typeof data.tookMs === "number" ? data.tookMs : null;

        if (isBlank) {
          // React が重いリストを描画している間も入力の応答性を落とさないため、
          // 結果更新は transition で流す（INP 対策）
          startTransition(() => {
            setTookMs(took);
            setResults([]);
            setSuggestions(data.suggestions ?? null);
          });
          return;
        }

        const nextResults = Array.isArray(data.results) ? data.results : [];
        startTransition(() => {
          setTookMs(took);
          setSuggestions(null);
          setResults(nextResults);
        });

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
    <form
      action="/search"
      method="GET"
      // JS が有効なら SPA 的に動かす（Enterでリロードしない）。JS が無効なら通常の GET 検索。
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input type="hidden" name="type" value={type === "all" ? "" : type} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label className="text-[11px] font-semibold tracking-[0.22em] text-[#222222]/55">
            KEYWORD
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="例：BMW 3シリーズ / 警告灯 / ドラレコ / ルーミー"
              className="w-full rounded-2xl border border-[#222222]/12 bg-white px-4 py-3 text-[14px] text-[#222222] shadow-soft outline-none transition focus:border-[#0ABAB5]/45"
              aria-label="サイト内検索"
            />
            {loading ? (
              <div className="shrink-0 text-[11px] text-[#222222]/55">検索中…</div>
            ) : tookMs != null ? (
              <div className="shrink-0 text-[11px] text-[#222222]/55">{tookMs}ms</div>
            ) : null}
          </div>
        </div>

        <div className="sm:pl-4">
          <label className="text-[11px] font-semibold tracking-[0.22em] text-[#222222]/55">
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
                  className={`rounded-full border px-3 py-2 text-[10px] font-semibold tracking-[0.18em] transition ${
                    active
                      ? "border-[#0ABAB5] bg-[#0ABAB5] text-white"
                      : "border-[#222222]/12 bg-white text-[#222222]/85 hover:border-[#0ABAB5]/35"
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

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {loading || isUiPending
          ? "検索中…"
          : error
            ? "検索に失敗しました。"
            : queryTrimmed.length > 1
              ? `${results.length}件の検索結果`
              : "候補を表示中"}
      </div>

      {/* results */}
      {queryTrimmed.length > 1 ? (
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <p className="text-[12px] text-[#222222]/70">
              <span className="font-semibold text-[#222222]">{results.length}</span> 件（{typeLabel(type)}）
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
                <div className="rounded-2xl border border-[#222222]/10 bg-white p-4 shadow-soft transition hover:-translate-y-[1px] hover:border-[#0ABAB5]/35 hover:shadow-soft-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#222222]/5 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-[#222222]/70">
                      {badgeLabel(r.type)}
                    </span>
                    {r.maker ? (
                      <span className="text-[11px] font-semibold text-[#222222]/70">{r.maker}</span>
                    ) : null}
                    {r.category ? (
                      <span className="text-[11px] text-[#222222]/55">{r.category}</span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold leading-relaxed text-[#222222]">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#222222]/70">
                    {r.description}
                  </p>
                </div>
              </TrackedLink>
            ))}

            {!loading && results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#222222]/12 bg-white p-4 text-[12px] text-[#222222]/70">
                該当なし。別の言い方（例：症状 → 部品名、車種 → 型式/シリーズ名）で試してください。
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-[12px] text-[#222222]/70">人気/最新の入口（1文字以上で候補が出ます）</p>

          {suggestions ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <SuggestionBlock title="CARS" items={suggestions.cars} />
              <SuggestionBlock title="GUIDE" items={suggestions.guide} />
              <SuggestionBlock title="COLUMN" items={suggestions.column} />
              <SuggestionBlock title="NEWS" items={suggestions.news} />
              <SuggestionBlock title="HERITAGE" items={suggestions.heritage} />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#222222]/10 bg-white p-4 text-[12px] text-[#222222]/70">
              候補を読み込み中…
            </div>
          )}
        </div>
      )}
      <noscript>
        <div className="mt-5 rounded-2xl border border-dashed border-[#222222]/12 bg-white/70 p-4 text-[12px] text-[#222222]/70">
          JavaScript が無効な場合は、キーワードを入力して「検索」を押してください。
          <div className="mt-3">
            <button
              type="submit"
              className="rounded-full border border-[#222222]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#222222]/80 shadow-soft"
            >
              検索
            </button>
          </div>
        </div>
      </noscript>
    </form>
  );
}

function SuggestionBlock(props: { title: string; items: SearchDoc[] }) {
  const { title, items } = props;
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">{title}</p>
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
            <div className="rounded-2xl border border-[#222222]/10 bg-white p-3 text-[12px] text-[#222222] transition hover:-translate-y-[1px] hover:border-[#0ABAB5]/35 hover:shadow-soft-card">
              <div className="line-clamp-1 font-semibold">{it.title}</div>
              <div className="mt-1 line-clamp-1 text-[11px] text-[#222222]/70">{it.description}</div>
            </div>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
