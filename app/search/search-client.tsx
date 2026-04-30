"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { trackSiteSearch } from "@/lib/analytics/events";
import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";
import { cn } from "@/lib/utils";

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
  if (t === "all") return "すべて";
  if (t === "cars") return "車種";
  if (t === "guide") return "実用";
  if (t === "column") return "視点";
  if (t === "news") return "ニュース";
  if (t === "heritage") return "系譜";
  return "すべて";
}

function badgeLabel(t: SearchDocType): string {
  if (t === "cars") return "車種";
  if (t === "guide") return "実用";
  if (t === "column") return "視点";
  if (t === "news") return "ニュース";
  if (t === "heritage") return "系譜";
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

    window.history.replaceState(null, "", url.toString());
  } catch {
    // noop
  }
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[11px] font-medium tracking-[0.04em] transition",
        active
          ? "border-[rgba(27,63,229,0.32)] bg-[var(--accent-subtle)] text-[var(--accent-strong)]"
          : "border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] text-[var(--text-secondary)] hover:border-[rgba(27,63,229,0.24)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
      )}
    >
      {label}
    </button>
  );
}

function SearchResultCard({ hit }: { hit: SearchHit }) {
  return (
    <TrackedLink
      href={hit.href}
      toType={hit.type as any}
      toId={hit.slug}
      shelfId="search_results"
      ctaId={`search_${hit.type}`}
    >
      <div className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] p-4 transition hover:-translate-y-[1px] hover:border-[rgba(27,63,229,0.24)] hover:bg-[var(--surface-2)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgba(27,63,229,0.18)] bg-[var(--surface-glow)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-[var(--accent-strong)]">
            {badgeLabel(hit.type)}
          </span>
          {hit.maker ? (
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">{hit.maker}</span>
          ) : null}
          {hit.category ? (
            <span className="text-[11px] text-[var(--text-tertiary)]">{hit.category}</span>
          ) : null}
        </div>

        <h3 className="mt-3 line-clamp-2 text-[16px] font-semibold leading-[1.5] text-[var(--text-primary)]">
          {hit.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          {hit.description}
        </p>
      </div>
    </TrackedLink>
  );
}

function SuggestionBlock(props: { title: string; items: SearchDoc[] }) {
  const { title, items } = props;
  if (!items?.length) return null;

  return (
    <section>
      <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)] uppercase">
        {title}
      </p>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 6).map((item) => (
          <TrackedLink
            key={`${item.type}:${item.slug}`}
            href={item.href}
            toType={item.type as any}
            toId={item.slug}
            shelfId="search_suggestions"
            ctaId={`suggest_${item.type}`}
          >
            <div className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] p-3 transition hover:-translate-y-[1px] hover:border-[rgba(27,63,229,0.24)] hover:bg-[var(--surface-2)]">
              <div className="line-clamp-1 text-[13px] font-medium leading-[1.5] text-[var(--text-primary)]">
                {item.title}
              </div>
              <div className="mt-1 line-clamp-2 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                {item.description}
              </div>
            </div>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
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
  const initialResults = props.initialResults;
  const initialSuggestions = props.initialSuggestions;

  const [q, setQ] = useState<string>(initialQuery);
  const [type, setType] = useState<FilterType>(initialType);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[]>(() =>
    Array.isArray(initialResults) ? initialResults : [],
  );
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() => initialSuggestions ?? null);
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
      updateUrl(queryTrimmed, type);

      const isBlank = queryTrimmed.length <= 1;
      const hasServerSnapshot =
        (!isBlank && queryTrimmed === initialQueryTrimmed && Array.isArray(initialResults)) ||
        (isBlank && queryTrimmed === initialQueryTrimmed && !!initialSuggestions);

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
  }, [initialQueryTrimmed, initialResults, initialSuggestions, queryTrimmed, type]);

  const filterButtons: Array<{ key: FilterType; label: string }> = [
    { key: "all", label: "すべて" },
    { key: "cars", label: "車種" },
    { key: "guide", label: "実用" },
    { key: "column", label: "視点" },
    { key: "news", label: "ニュース" },
    { key: "heritage", label: "系譜" },
  ];

  return (
    <form
      action="/search"
      method="GET"
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="space-y-6"
    >
      <input type="hidden" name="type" value={type === "all" ? "" : type} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <div>
          <label className="cb-field-label" htmlFor="cbj-search-query">
            キーワード
          </label>
          <div className="flex items-center gap-3">
            <input
              id="cbj-search-query"
              name="q"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="例：BMW 3シリーズ / 警告灯 / ドラレコ / ルーミー"
              className="cb-input h-12 rounded-[20px] px-4 text-[14px]"
              aria-label="サイト内検索"
            />
            {loading ? (
              <div className="shrink-0 text-[11px] text-[var(--text-tertiary)]">検索中…</div>
            ) : tookMs != null ? (
              <div className="shrink-0 text-[11px] text-[var(--text-tertiary)]">{tookMs}ms</div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="cb-field-label">絞り込み</div>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <FilterButton
                key={button.key}
                active={type === button.key}
                label={button.label}
                onClick={() => setType(button.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="text-[12px] text-[var(--state-danger)]">{error}</p> : null}

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {loading || isUiPending
          ? "検索中…"
          : error
            ? "検索に失敗しました。"
            : queryTrimmed.length > 1
              ? `${results.length}件の検索結果`
              : "候補を表示中"}
      </div>

      {queryTrimmed.length > 1 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(14,12,10,0.08)] pt-5">
            <p className="text-[13px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{results.length}</span> 件を表示中（
              {typeLabel(type)}）
            </p>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              型式・シリーズ名・症状名まで入れると絞り込みやすくなります。
            </p>
          </div>

          <div className="grid gap-3">
            {results.map((result) => (
              <SearchResultCard key={`${result.type}:${result.slug}`} hit={result} />
            ))}

            {!loading && results.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(251,248,243,0.68)] p-5 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                該当なし。別の言い方で試してください。
                <div className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                  例：症状 → 部品名、車種 → 型式 / シリーズ名、使い方 → 「維持費」「中古」「故障」など。
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-4 border-t border-[rgba(14,12,10,0.08)] pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-[13px] leading-[1.85] text-[var(--text-secondary)]">
              人気・最新の候補を表示しています。1文字以上の入力で、その場で候補が切り替わります。
            </p>
            <p className="text-[11px] text-[var(--text-tertiary)]">ショートカット: / または Ctrl/⌘ + K</p>
          </div>

          {suggestions ? (
            <div className="grid gap-6 md:grid-cols-2">
              <SuggestionBlock title="車種" items={suggestions.cars} />
              <SuggestionBlock title="実用" items={suggestions.guide} />
              <SuggestionBlock title="視点" items={suggestions.column} />
              <SuggestionBlock title="ニュース" items={suggestions.news} />
              <SuggestionBlock title="系譜" items={suggestions.heritage} />
            </div>
          ) : (
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.68)] p-5 text-[13px] text-[var(--text-secondary)]">
              候補を読み込み中…
            </div>
          )}
        </div>
      )}

      <noscript>
        <div className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] p-5 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
          JavaScript が無効な場合は、キーワード入力後に検索ボタンを押してください。
          <div className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.88)] px-4 py-2 text-[11px] font-medium text-[var(--text-primary)] transition hover:border-[rgba(27,63,229,0.24)] hover:bg-[var(--surface-2)]"
            >
              検索する
            </button>
          </div>
        </div>
      </noscript>
    </form>
  );
}
