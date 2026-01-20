// app/column/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllColumns, type ColumnItem } from "@/lib/columns";


export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const title = "COLUMN｜故障・メンテ・技術・市場のコラム";
  const description =
    "症状/トラブルの原因と対処、修理費の目安、ブランドの歴史・技術解説、相場・価格動向まで。クルマまわりの情報を短く整理したコラム集。";
  const canonical = `${getSiteUrl()}/column`;

  const hasParams = hasMeaningfulSearchParams(searchParams as any);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    // NOTE: app/layout.tsx で `robots.googleBot` を指定しているため、
    // noindex は googleBot も明示的に noindex にする。
    robots: hasParams ? NOINDEX_ROBOTS : undefined,
  };
}


const PER_PAGE = 10;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  tag?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

// ----------------------------------------
// ユーティリティ
// ----------------------------------------

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function firstOf(param?: string | string[]): string {
  if (!param) return "";
  return Array.isArray(param) ? param[0] ?? "" : param;
}

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術・歴史";
    case "OWNER_STORY":
      return "オーナー体験談";
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

type QueryParams = {
  q?: string;
  category?: string;
  tag?: string;
  page?: string;
};

function buildQueryString(params: QueryParams) {
  const sp = new URLSearchParams();

  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.tag) sp.set("tag", params.tag);
  // page=1 は省略しておく
  if (params.page && params.page !== "1") sp.set("page", params.page);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default async function ColumnPage({ searchParams }: PageProps) {
  const allItems = await getAllColumns();

  // /column（一覧）では「回遊専用（indirect）」のコラムを除外する
  // - 詳細ページ（/column/[slug]）はそのまま閲覧できる
  // - 他ページの回遊棚からのみ到達させる意図
  const items = allItems.filter(
    (item) => (item as any).articleType !== "indirect",
  );

  const rawQ = firstOf(searchParams?.q);
  const q = normalize(rawQ);
  const categoryFilter = firstOf(searchParams?.category).trim();
  const tagFilter = firstOf(searchParams?.tag).trim();
  const rawPage = firstOf(searchParams?.page);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "COLUMN",
        item: `${getSiteUrl()}/column`,
      },
    ],
  };

  const categories: string[] = Array.from(
    new Set(items.map((i) => i.category).filter(isNonEmptyString)),
  ).sort();

  const tagCounts = new Map<string, number>();
  items.forEach((i) => {
    (i.tags ?? []).filter(isNonEmptyString).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  const tagsByCount = Array.from(tagCounts.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0], "ja"))
    .map(([tag]) => tag);

  const tagsForSelectBase = tagsByCount.slice(0, 30);
  const tagsForSelect =
    tagFilter && !tagsForSelectBase.includes(tagFilter)
      ? [tagFilter, ...tagsForSelectBase]
      : tagsForSelectBase;

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

  // 新しい順に並べ替え（公開日 → タイトル）
  const sortedFiltered = [...filtered].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    if (ta !== tb) return tb - ta;
    return (a.title ?? "").localeCompare(b.title ?? "", "ja");
  });

  // ページング（CARS と同じ考え方）
  const requestedPage = Number(rawPage || "1") || 1;
  const totalFiltered = sortedFiltered.length;
  const maxPage =
    totalFiltered === 0 ? 1 : Math.max(1, Math.ceil(totalFiltered / PER_PAGE));
  const currentPage =
    requestedPage < 1
      ? 1
      : requestedPage > maxPage
      ? maxPage
      : requestedPage;

  const startIndex = (currentPage - 1) * PER_PAGE;
  const pageItems = sortedFiltered.slice(startIndex, startIndex + PER_PAGE);

  // 現在ページ内のハイライト＋残り
  const featured = pageItems[0] ?? null;
  const rest = featured ? pageItems.slice(1) : pageItems;

  // ── 簡易インデックス ──
  const totalArticles = items.length;
  const maintenanceCount = items.filter(
    (i) => i.category === "MAINTENANCE",
  ).length;
  const technicalCount = items.filter(
    (i) => i.category === "TECHNICAL",
  ).length;
  const ownerStoryCount = items.filter(
    (i) => i.category === "OWNER_STORY",
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

  // クイックプリセット向け「人気タグ」
  const featuredTags = tagsByCount.slice(0, 4);

  const baseQuery: QueryParams = {
    q: rawQ || undefined,
    category: categoryFilter || undefined,
    tag: tagFilter || undefined,
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-column-index-breadcrumb" data={breadcrumbData} />
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
        <header className="mb-12 space-y-6 lg:mb-16">
          <Reveal>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
                TECH &amp; MAINTENANCE COLUMN
              </p>
              <div className="hidden gap-2 text-[10px] text-slate-500 sm:flex">
                <Link
                  href="/guide"
                  className="rounded-full bg-white/80 px-3 py-1 tracking-[0.18em] hover:bg-white hover:text-tiffany-700"
                >
                  VIEW GUIDE
                </Link>
                <Link
                  href="/cars"
                  className="rounded-full bg-white/70 px-3 py-1 tracking-[0.18em] hover:bg-white hover:text-tiffany-700"
                >
                  CAR DATABASE
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
              COLUMN
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                トラブル・整備・ブランド・技術のコラム
              </p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="rounded-full bg-white/80 px-3 py-1">
                  TOTAL{" "}
                  <span className="font-semibold text-slate-900">
                    {totalArticles}
                  </span>{" "}
                  COLUMNS
                </span>
                {avgReadMinutes && (
                  <span className="hidden rounded-full bg-white/80 px-3 py-1 sm:inline">
                    平均読了時間 約{" "}
                    <span className="font-semibold text-slate-900">
                      {avgReadMinutes}
                    </span>{" "}
                    分
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </header>

        {/* インデックスパネル */}
        <Reveal delay={190}>
          <section className="mb-8">
            <GlassCard
              padding="md"
              className="relative overflow-hidden border border-white/80 bg-gradient-to-r from-white/95 via-white/88 to-vapor/95 shadow-soft"
            >
              {/* 光レイヤー */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                <div className="absolute -right-24 bottom-[-40%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.22),_transparent_72%)] blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-md">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    COLUMN INDEX
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    コラム数とカテゴリ内訳
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[10px] text-slate-700 sm:grid-cols-4">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      TOTAL
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                      {totalArticles}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      MAINTENANCE
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-emerald-700">
                        {maintenanceCount}
                      </span>
                      <span className="ml-1 text-slate-400">記事</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      TECH / BRAND
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-slate-900">
                        {technicalCount}
                      </span>
                      <span className="ml-1 text-slate-400">記事</span>
                    </p>
                  </div>
                  {ownerStoryCount > 0 && (
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        OWNER STORY
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="font-semibold text-slate-900">
                          {ownerStoryCount}
                        </span>
                        <span className="ml-1 text-slate-400">記事</span>
                      </p>
                    </div>
                  )}
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
                    {tagsForSelect.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    タグはよく使われるものを表示（上位30）。その他はキーワード検索で。
                  </p>
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
                      rel="nofollow"
                      className="rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 tracking-[0.16em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      メンテナンス系だけ
                    </Link>
                    <Link
                      href="/column?category=TECHNICAL"
                      rel="nofollow"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                    >
                      技術 ブランド系だけ
                    </Link>
                    {featuredTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/column?tag=${encodeURIComponent(tag)}`}
                        rel="nofollow"
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

        {/* 一覧（GUIDE 風アニメーション + CARS 風ページング） */}
        <section className="space-y-6" aria-label="コラム一覧">
          {/* 上部: 見出し + メタ情報 */}
          <Reveal delay={260}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                  COLUMN LIST
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  新しい順に並べ替え済み 気になるテーマがあればタイトルから詳細へ
                </p>
              </div>
              <div className="flex flex-col items-end text-[10px] text-slate-400">
                <span>
                  TOTAL{" "}
                  <span className="font-semibold text-slate-800">
                    {items.length}
                  </span>{" "}
                  ARTICLES
                </span>
                {totalFiltered !== items.length && (
                  <span>
                    FILTERED{" "}
                    <span className="font-semibold text-tiffany-600">
                      {totalFiltered}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {/* ハイライト */}
          {featured && (
            <Reveal delay={280}>
              <GlassCard
                as="section"
                padding="lg"
                interactive
                className="relative mb-2 overflow-hidden border border-tiffany-100 bg-gradient-to-br from-tiffany-50 via-white to-white text-slate-900 shadow-soft-card"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.22),_transparent_70%)] blur-3xl" />
                  <div className="absolute -right-24 bottom-[-40%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.2),_transparent_70%)] blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
                      <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-50">
                        FEATURED
                      </span>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-[10px]">
                        {mapCategoryLabel(featured.category)}
                      </span>
                      {featured.readMinutes && (
                        <span className="rounded-full bg-white/80 px-2 py-1 text-[10px]">
                          約{featured.readMinutes}分
                        </span>
                      )}
                      {featured.publishedAt && (
                        <span className="ml-auto text-[10px] text-slate-500">
                          {formatDate(featured.publishedAt)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/column/${encodeURIComponent(featured.slug)}`}
                      className="block"
                    >
                      <h2 className="serif-heading text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
                        {featured.title}
                      </h2>
                    </Link>

                    {featured.summary && (
                      <p className="text-[11px] leading-relaxed text-text-sub sm:text-xs">
                        {featured.summary}
                      </p>
                    )}
                  </div>

                  {(featured.tags?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-600 sm:mt-0 sm:max-w-xs sm:justify-end">
                      {featured.tags!.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/80 px-2 py-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </Reveal>
          )}

          {/* 残り一覧 */}
          {totalFiltered === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
              条件に合うコラムはなし 絞り込み条件を少し緩めて再検索する想定
            </p>
          ) : rest.length === 0 && featured ? (
            // 現在ページに featured 1件だけ
            <p className="rounded-2xl border border-slate-100 bg_white/80 p-6 text-center text-[11px] text-slate-500">
              絞り込み条件に合うコラムは 現在表示中の1本のみ
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rest.map((item, index) => (
                <Reveal key={item.slug} delay={320 + index * 40}>
                  <Link href={`/column/${encodeURIComponent(item.slug)}`}>
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
                          <h3 className="text-sm font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
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
                </Reveal>
              ))}
            </div>
          )}

          {/* ページネーション（CARS 風） */}
          {totalFiltered > 0 && maxPage > 1 && (
            <div className="mt-8 flex justify-center">
              <nav
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] shadow-soft-sm"
                aria-label="COLUMN pagination"
              >
                {/* PREV */}
                <Link
                  href={`/column${buildQueryString({
                    ...baseQuery,
                    page: String(
                      currentPage > 1 ? currentPage - 1 : currentPage,
                    ),
                  })}`}
                  rel="nofollow"
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "cursor-default rounded-full px-3 py-1 text-slate-400"
                      : "rounded-full px-3 py-1 text-slate-700 hover:bg-slate-50"
                  }
                >
                  ← PREV
                </Link>

                {/* ページ番号 */}
                {Array.from({ length: maxPage }).map((_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;
                  return (
                    <Link
                      key={page}
                      href={`/column${buildQueryString({
                        ...baseQuery,
                        page: String(page),
                      })}`}
                      rel="nofollow"
                      className={
                        isActive
                          ? "min-w-[32px] rounded-full bg-slate-900 px-2 py-1 text-center text-white"
                          : "min-w-[32px] rounded-full px-2 py-1 text-center text-slate-700 hover:bg-slate-50"
                      }
                    >
                      {page}
                    </Link>
                  );
                })}

                {/* NEXT */}
                <Link
                  href={`/column${buildQueryString({
                    ...baseQuery,
                    page: String(
                      currentPage < maxPage ? currentPage + 1 : currentPage,
                    ),
                  })}`}
                  rel="nofollow"
                  aria-disabled={currentPage === maxPage}
                  className={
                    currentPage === maxPage
                      ? "cursor-default rounded-full px-3 py-1 text-slate-400"
                      : "rounded-full px-3 py-1 text-slate-700 hover:bg-slate-50"
                  }
                >
                  NEXT →
                </Link>
              </nav>
            </div>
          )}
        </section>

        {/* 下部 CTA：COLUMN と他コンテンツの関係 */}
        <section className="mt-24 lg:mt-28">
          <Reveal delay={320}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft-strong sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(10,186,181,0.36),_transparent_60%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.85),_transparent_65%)]" />
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04]" />

              <div className="relative z-10 flex flex-col items-center">
                <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                  COLUMN &amp; OTHER CONTENTS
                </span>
                <h3 className="serif-heading mb-6 text-2xl text-white sm:text-3xl">
                  COLUMN と GUIDE CARS の役割分担
                </h3>
                <p className="mx-auto mb-8 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                  COLUMN では トラブルや技術 背景ストーリーをじっくり整理
                  お金の整理や段取りは GUIDE
                  車種ごとのスペックや基本情報は CARS
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    variant="primary"
                    size="sm"
                    magnetic
                    className="min-w-[160px] rounded-full px-6 py-3 text-[11px] tracking-[0.18em]"
                  >
                    <Link href="/guide">VIEW GUIDE</Link>
                  </Button>
                  <Button
                    asChild
                    variant="glass"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-white/30 bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-100 backdrop-blur-sm hover:bg-white/10"
                  >
                    <Link href="/cars">CAR DATABASE</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
