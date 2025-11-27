// app/column/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "コラムとストーリー | CAR BOUTIQUE",
  description:
    "トラブルや修理の実例、ブランドの歴史や技術解説など、クルマに関する情報を整理して読めるコラム集です。",
};

type SearchParams = {
  q?: string;
  category?: string;
  tag?: string;
};

type PageProps = {
  searchParams?: SearchParams;
};

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術・歴史";
    case "OWNER_STORY":
    default:
      return "コラム";
  }
}

export default async function ColumnPage({ searchParams }: PageProps) {
  const items = await getAllColumns();

  const rawQ = searchParams?.q ?? "";
  const q = normalize(rawQ);
  const categoryFilter = (searchParams?.category ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ).sort();

  const tags = Array.from(
    new Set(
      items
        .flatMap((i) => i.tags ?? [])
        .filter((t): t is string => Boolean(t)),
    ),
  ).sort();

  const filtered = items.filter((item) => {
    if (q) {
      const haystack = `${item.title ?? ""} ${item.summary ?? ""} ${mapCategoryLabel(
        item.category,
      )} ${(item.tags ?? []).join(" ")}`.toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (categoryFilter && item.category !== categoryFilter) return false;

    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;

    return true;
  });

  const hasFilter = Boolean(q || categoryFilter || tagFilter);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">COLUMN</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              TECH &amp; MAINTENANCE COLUMN
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              トラブル・修理と、ブランドや技術のコラム集
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
              メンテナンスやトラブルの実例、ブランドの歴史、技術的な背景などをまとめた読み物です。
              車種選びや維持の判断材料として、必要な情報だけを落ち着いて確認できることを目指しています。
            </p>
          </Reveal>
        </header>

        {/* フィルターエリア */}
        <Reveal delay={220}>
          <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-soft">
            <form className="space-y-4 text-xs sm:text-[11px]">
              <div className="grid gap-3 md:grid-cols-3">
                {/* キーワード */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="タイトルや本文のキーワードで検索"
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    defaultValue={categoryFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {mapCategoryLabel(c as ColumnItem["category"])}
                      </option>
                    ))}
                  </select>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    TAG
                  </label>
                  <select
                    name="tag"
                    defaultValue={tagFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-2 flex items-center justify-end gap-3">
                {hasFilter && (
                  <Link
                    href="/column"
                    className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                  >
                    CLEAR
                  </Link>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  絞り込み
                </button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {hasFilter && (
          <Reveal delay={250}>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                ACTIVE FILTERS
              </span>
              {q && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  keyword: <span className="font-semibold">“{rawQ}”</span>
                </span>
              )}
              {categoryFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  category:{" "}
                  <span className="font-semibold">
                    {mapCategoryLabel(categoryFilter as ColumnItem["category"])}
                  </span>
                </span>
              )}
              {tagFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  tag: <span className="font-semibold">{tagFilter}</span>
                </span>
              )}
            </div>
          </Reveal>
        )}

        {/* 一覧 */}
        <Reveal delay={260}>
          <section className="space-y-4" aria-label="コラム一覧">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                COLUMN LIST
              </h2>
              <div className="flex flex-col items-end text-[10px] text-slate-400">
                <span>
                  TOTAL{" "}
                  <span className="font-semibold text-slate-800">
                    {items.length}
                  </span>{" "}
                  ARTICLES
                </span>
                {filtered.length !== items.length && (
                  <span>
                    FILTERED{" "}
                    <span className="font-semibold text-tiffany-600">
                      {filtered.length}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                条件に合致するコラムが見つかりませんでした。
                絞り込み条件を少し緩めて、もう一度お試しください。
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/column/${encodeURIComponent(item.slug)}`}
                  >
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="h-full bg-white/90"
                    >
                      <div className="flex h-full flex-col gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold tracking-[0.24em] text-tiffany-600">
                            {mapCategoryLabel(item.category)}
                          </p>
                          <h3 className="text-sm font-semibold leading-relaxed text-slate-900">
                            {item.title}
                          </h3>
                          {item.summary && (
                            <p className="text-[11px] leading-relaxed text-text-sub line-clamp-3">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          {(item.tags ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-50 px-2 py-1"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </main>
  );
}
