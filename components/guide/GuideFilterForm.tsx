"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackGuideFilterApply } from "@/lib/analytics/events";

export type GuideCategoryOption = {
  key: string;
  label: string;
  count: number;
};

type Props = {
  initialQ: string;
  initialSort: string;
  initialCategory: string;
  initialTag: string;
  categories: GuideCategoryOption[];
  tags: string[];
  popularTags: string[];
};

function normalize(value: string): string {
  return value.trim();
}

function buildUrl(pathname: string, next: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    const nv = normalize(v);
    if (!nv) continue;
    params.set(k, nv);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function GuideFilterForm(props: Props) {
  const {
    initialQ,
    initialSort,
    initialCategory,
    initialTag,
    categories,
    tags,
    popularTags,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState(initialSort);
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);

  const debounceRef = useRef<number | null>(null);

  // URL変更（戻る/進む）に追随
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setSort(searchParams.get("sort") ?? "newest");
    setCategory(searchParams.get("category") ?? "");
    setTag(searchParams.get("tag") ?? "");
  }, [searchParams]);

  const applied = useMemo(() => {
    return {
      q: normalize(q),
      sort: normalize(sort) || "newest",
      category: normalize(category),
      tag: normalize(tag),
    };
  }, [q, sort, category, tag]);

  const apply = (next: Partial<typeof applied>) => {
    const merged = {
      ...applied,
      ...next,
    };

    // ページングは常にリセット
    const url = buildUrl(pathname, {
      q: merged.q,
      sort: merged.sort === "newest" ? "" : merged.sort,
      category: merged.category,
      tag: merged.tag,
    });

    trackGuideFilterApply({
      q: merged.q,
      sort: merged.sort,
      category: merged.category,
      tag: merged.tag,
    });

    router.push(url);
  };

  const applyDebounced = (next: Partial<typeof applied>) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      apply(next);
    }, 450);
  };

  const hasAnyFilter =
    applied.q.length > 0 ||
    applied.category.length > 0 ||
    applied.tag.length > 0 ||
    (applied.sort && applied.sort !== "newest");

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-soft-card">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-400">FILTER</p>
        {hasAnyFilter && (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-[10px] tracking-[0.18em] text-slate-500 hover:text-tiffany-700"
            onClick={() => apply({ q: "", category: "", tag: "", sort: "newest" })}
          >
            クリア
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="block text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            キーワード
          </label>
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              applyDebounced({ q: v });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply({ q });
              }
            }}
            placeholder="例：一括査定 / 車検 / 自動車保険"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-tiffany-300"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              apply({ category: v });
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-tiffany-300"
          >
            <option value="">すべて</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            タグ
          </label>
          <input
            list="guide-tag-list"
            value={tag}
            onChange={(e) => {
              const v = e.target.value;
              setTag(v);
              applyDebounced({ tag: v });
            }}
            placeholder="例：一括見積もり"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-tiffany-300"
          />
          <datalist id="guide-tag-list">
            {tags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            並び順
          </label>
          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              setSort(v);
              apply({ sort: v });
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-tiffany-300"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="title">タイトル順</option>
            <option value="category">カテゴリ順</option>
          </select>
        </div>
      </div>

      {popularTags.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            よく使われるタグ
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {popularTags.map((t) => {
              const active = applied.tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTag(t);
                    apply({ tag: t });
                  }}
                  className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.12em] transition ${
                    active
                      ? "border-tiffany-300 bg-tiffany-50 text-tiffany-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-tiffany-200 hover:bg-tiffany-50"
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(applied.q || applied.category || applied.tag) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
            適用中
          </p>
          {applied.q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                apply({ q: "" });
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] tracking-[0.12em] text-slate-600 hover:border-tiffany-200 hover:bg-tiffany-50"
            >
              キーワード：{applied.q} ×
            </button>
          )}
          {applied.category && (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                apply({ category: "" });
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] tracking-[0.12em] text-slate-600 hover:border-tiffany-200 hover:bg-tiffany-50"
            >
              カテゴリ：{applied.category} ×
            </button>
          )}
          {applied.tag && (
            <button
              type="button"
              onClick={() => {
                setTag("");
                apply({ tag: "" });
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] tracking-[0.12em] text-slate-600 hover:border-tiffany-200 hover:bg-tiffany-50"
            >
              タグ：{applied.tag} ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
