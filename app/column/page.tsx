// app/column/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
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

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術・歴史";
    default:
      return "コラム";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default async function ColumnPage({ searchParams }: PageProps) {
  const items = await getAllColumns();

  const rawQ = searchParams?.q ?? "";
  const q = normalize(rawQ);
  const categoryFilter = (searchParams?.category ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();

  const categories: string[] = Array.from(
    new Set(items.map((i) => i.category).filter(isNonEmptyString)),
  ).sort();

  const tags: string[] = Array.from(
    new Set(
      items
        .flatMap((i) => i.tags ?? [])
        .filter(isNonEmptyString),
    ),
  ).sort();

  const filtered = items.filter((item) => {
    if (q) {
      const haystack = [
        item.title ?? "",
        item.summary ?? "",
        mapCategoryLabel(item.category),
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (categoryFilter && item.category !== categoryFilter) return false;

    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;

    return true;
  });

  const hasFilter = Boolean(q || categoryFilter || tagFilter);

  // ── 簡易インデックス ──
  const totalArticles = items.length;
  const maintenanceCount = items.filter(
    (i) => i.category === "MAINTENANCE",
  ).length;
  const technicalCount = items.filter(
    (i) => i.category === "TECHNICAL",
  ).length;

  const articlesWithReadMinutes = items.filter(
    (i) => typeof i.readMinutes === "number",
  );
  const avgReadMinutes =
    articlesWithReadMinutes.length > 0
      ? Math.round(
          articlesWithReadMinutes.reduce(
            (acc, i) => acc + (i.readMinutes ?? 0),
            0,
          ) / articlesWithReadMinutes.length,
        )
      : null;

  // クイックプリセット向けに、先頭数件のタグを「人気タグ」として扱う
  const featuredTags = tags.slice(0, 4);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
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

        {/* インデックスパネル */}
        <Reveal delay={190}>
          <section className="mb-6">
            <GlassCard
              padding="md"
              className="relative overflow-hidden border border-white/80 bg-gradient-to-r from-white/96 via-white/88 to-vapor/95 shadow-soft"
            >
              {/* 光レイヤー */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                <div className="absolute -right-24 bottom-[-40%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.22),_transparent_72%)] blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-md">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    COLUMN INDEX
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    現在登録されているコラム数と、メンテナンス系 / 技術・ブランド系の
                    おおまかなバランスです。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] text-slate-700 sm:grid-cols-3">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      TOTAL ARTICLES
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                      {totalArticles}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      MAINTENANCE / TECH
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-emerald-700">
                        {maintenanceCount}
                      </span>
                      <span className="mx-1 text-slate-400">/</span>
                      <span className="font-semibold text-slate-900">
                        {technicalCount}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      AVERAGE READING TIME
                    </p>
                    <p className="mt-1 text-xs text-slate-900">
                      {avgReadMinutes ? (
                        <>
                          約{" "}
                          <span className="font-semibold">
                            {avgReadMinutes}
                          </span>{" "}
                          分
                        </>
                      ) : (
                        <span className="text-slate-400">－</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </Reveal>

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

              {/* クイックプリセット */}
              {featuredTags.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium tracking-[0.22em] text-slate-500">
                    QUICK PRESET
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/column?category=MAINTENANCE"
                      className="rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 tracking-[0.16em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      メンテナンス系だけ
                    </Link>
                    <Link
                      href="/column?category=TECHNICAL"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                    >
                      技術・ブランド系だけ
                    </Link>
                    {featuredTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/column?tag=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ボタン */}
              <div className="mt-3 flex items-center justify-end gap-3">
                {hasFilter && (
                  <Link
                    href="/column"
                    className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                  >
                    CLEAR
                  </Link>
                )}
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  magnetic
                  className="rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                >
                  絞り込み
                </Button>
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
                    {mapCategoryLabel(
                      categoryFilter as ColumnItem["category"],
                    )}
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
                      className="group relative h-full overflow-hidden bg-white/92"
                    >
                      {/* カード内の光 */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {mapCategoryLabel(item.category)}
                          </span>
                          {item.readMinutes && (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                              約{item.readMinutes}分
                            </span>
                          )}
                          {item.publishedAt && (
                            <span className="ml-auto text-[10px] text-slate-400">
                              {formatDate(item.publishedAt)}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
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
