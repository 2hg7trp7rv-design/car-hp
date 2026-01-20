// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

// ✅ 型は正本から参照（content-types.ts を更新して整合させる前提）
import { getAllHeritage, getHeritagePreviewText } from "@/lib/heritage";
import type { HeritageItem } from "@/lib/content-types";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";



type SearchParams = {
  q?: string | string[];
  maker?: string | string[];
  era?: string | string[];
  tag?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};


export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "HERITAGE｜ブランドの系譜と名車の歴史";
  const description =
    "ブランドの系譜や名車の歴史を、年代やメーカーごとに整理してたどれるHERITAGEコンテンツ。";
  const canonical = `${getSiteUrl()}/heritage`;

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

// 共通ユーティリティ
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// 一覧用ソート（新しい公開日優先→タイトル順）
function sortHeritageForList(items: HeritageItem[]): HeritageItem[] {
  return [...items].sort((a, b) => {
    const ad = parseDate(a.publishedAt ?? a.updatedAt ?? null);
    const bd = parseDate(b.publishedAt ?? b.updatedAt ?? null);

    if (ad && bd) return bd.getTime() - ad.getTime();
    if (bd && !ad) return 1;
    if (ad && !bd) return -1;

    const aTitle = (a.titleJa ?? a.title ?? "").toString();
    const bTitle = (b.titleJa ?? b.title ?? "").toString();
    return aTitle.localeCompare(bTitle, "ja");
  });
}

// ページング付き一覧ページ
export default async function HeritageIndexPage({ searchParams }: PageProps) {
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
        name: "HERITAGE",
        item: `${getSiteUrl()}/heritage`,
      },
    ],
  };

  const all = await getAllHeritage();
  const published = all; // 公開・非公開の区別が必要になったらここでフィルタ

  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const makerFilter = toSingle(searchParams?.maker).trim();
  const eraFilter = toSingle(searchParams?.era).trim();
  const tagFilter = toSingle(searchParams?.tag).trim();
  const rawPage = toSingle(searchParams?.page);

  const makers: string[] = Array.from(
    new Set(
      published
        .map((i) => i.brandName ?? i.maker)
        .filter(isNonEmptyString),
    ),
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const eras: string[] = Array.from(
    new Set(published.map((i) => i.eraLabel).filter(isNonEmptyString)),
  ).sort();

  const tags: string[] = Array.from(
    new Set(published.flatMap((i) => i.tags ?? []).filter(isNonEmptyString)),
  ).sort();

  const filtered = published.filter((item) => {
    const haystack = [
      item.title ?? "",
      item.titleJa ?? "",
      item.summary ?? "",
      getHeritagePreviewText(item, { maxChars: 260 }),
      item.brandName ?? "",
      item.maker ?? "",
      item.eraLabel ?? "",
      ...(item.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) return false;
    if (makerFilter && (item.brandName ?? item.maker) !== makerFilter) {
      return false;
    }
    if (eraFilter && item.eraLabel !== eraFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) {
      return false;
    }

    return true;
  });

  const hasFilter = Boolean(q || makerFilter || eraFilter || tagFilter);

  const totalHeritage = published.length;
  const totalMakers = makers.length;
  const totalEras = eras.length;

  // 一覧用にソート（メーカー単位でのグルーピングはやめてフラットに）
  const sorted = sortHeritageForList(filtered);

  // ── ページング設定 ─────────────────────────────
  const PER_PAGE = 10;
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  const parsedPage = Number.parseInt(rawPage || "1", 10);
  const currentPage =
    !Number.isNaN(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, totalPages)
      : 1;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginatedItems = sorted.slice(start, end);

  // ページリンク用クエリ生成
  const buildPageHref = (page: number): string => {
    const params = new URLSearchParams();
    if (rawQ) params.set("q", rawQ);
    if (makerFilter) params.set("maker", makerFilter);
    if (eraFilter) params.set("era", eraFilter);
    if (tagFilter) params.set("tag", tagFilter);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    return qs ? `/heritage?${qs}` : "/heritage";
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-heritage-index-breadcrumb" data={breadcrumbData} />
      {/* ヒーロー */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white/40 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.18),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal className="text-sm text-slate-600">
            <span className="tracking-[0.2em]">HOME / HERITAGE</span>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
            <Reveal className="space-y-6" delay={80}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tiffany-600">
                BRAND HERITAGE
              </p>
              <h1 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                ブランドの系譜と名車の歴史
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                名車・ブランドの背景と時代性
              </p>
            </Reveal>

            <Reveal className="md:justify-self-end" delay={140}>
              <GlassCard
                padding="lg"
                variant="crystal"
                interactive={false}
                magnetic={false}
                className="max-w-md border border-white/40 bg-white/90 text-slate-900 shadow-soft"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-700">
                    HERITAGE INDEX
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        total
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalHeritage}
                      </div>
                      <div className="text-[0.7rem] text-slate-500">
                        articles
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        makers
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalMakers}
                      </div>
                      <div className="text-[0.7rem] text-slate-500">
                        brands
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                        eras
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {totalEras}
                      </div>
                      <div className="text-[0.7rem] text-slate-500">
                        periods
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* フィルターエリア＋一覧 */}
      <section className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        {/* フィルター */}
        <Reveal>
          <GlassCard
            padding="lg"
            variant="dim"
            interactive={false}
            className="border border-slate-200/80 bg-white/80"
          >
            <form action="/heritage" method="get" className="space-y-8">
              {/* キーワード */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                  KEYWORD
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={rawQ}
                  placeholder="モデル名・ブランド名・キーワードで検索"
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                />
              </div>

              {/* セレクト3種 */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerFilter || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {makers.map((maker) => (
                      <option key={maker} value={maker}>
                        {maker}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                    ERA
                  </label>
                  <select
                    name="era"
                    defaultValue={eraFilter || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {eras.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                    TAG
                  </label>
                  <select
                    name="tag"
                    defaultValue={tagFilter || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition focus:border-tiffany-300/70 focus:ring-2 focus:ring-tiffany-300/40"
                  >
                    <option value="">すべて</option>
                    {tags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* クイックナビ */}
              {(makers.length > 0 || eras.length > 0 || tags.length > 0) && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-slate-600">
                      QUICK NAV
                    </span>
                    {makers.slice(0, 8).map((maker) => (
                      <Link
                        key={maker}
                        href={{ pathname: "/heritage", query: { maker } }}
                        rel="nofollow"
                        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[0.7rem] text-slate-800 hover:border-tiffany-200 hover:text-tiffany-700"
                      >
                        {maker}
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {eras.slice(0, 6).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.65rem] tracking-[0.2em] text-slate-500">
                          ERA
                        </span>
                        {eras.slice(0, 6).map((era) => (
                          <Link
                            key={era}
                            href={{ pathname: "/heritage", query: { era } }}
                            rel="nofollow"
                            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[0.7rem] text-slate-800 hover:border-tiffany-200 hover:text-tiffany-700"
                          >
                            {era}
                          </Link>
                        ))}
                      </div>
                    )}

                    {tags.slice(0, 6).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.65rem] tracking-[0.2em] text-slate-500">
                          TAG
                        </span>
                        {tags.slice(0, 6).map((tag) => (
                          <Link
                            key={tag}
                            href={{ pathname: "/heritage", query: { tag } }}
                            rel="nofollow"
                            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[0.7rem] text-slate-800 hover:border-tiffany-200 hover:text-tiffany-700"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ボタン行 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {hasFilter && (
                  <div className="text-xs text-slate-600">
                    <span className="mr-2 text-[0.7rem] font-semibold tracking-[0.2em] text-slate-600">
                      ACTIVE FILTERS
                    </span>
                    <span>
                      {q && <span className="mr-2">keyword:“{rawQ}”</span>}
                      {makerFilter && (
                        <span className="mr-2">maker:{makerFilter}</span>
                      )}
                      {eraFilter && <span className="mr-2">era:{eraFilter}</span>}
                      {tagFilter && <span className="mr-2">tag:{tagFilter}</span>}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  {hasFilter && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/heritage">CLEAR</Link>
                    </Button>
                  )}
                  <Button type="submit" size="sm">
                    絞り込み
                  </Button>
                </div>
              </div>
            </form>
          </GlassCard>
        </Reveal>

        {/* 一覧ヘッダー */}
        <Reveal delay={60}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 pt-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-600">
                HERITAGE LIST
              </h2>
              <p className="text-xs text-slate-600">
                TOTAL {published.length} ARTICLES
                {filtered.length !== published.length && (
                  <> / FILTERED {filtered.length}</>
                )}
              </p>
            </div>
            {totalItems > 0 && (
              <p className="text-[0.7rem] text-slate-500">
                PAGE {currentPage} / {totalPages}
              </p>
            )}
          </div>
        </Reveal>

        {/* 一覧本体 */}
        {paginatedItems.length === 0 ? (
          <Reveal delay={120}>
            <div className="mt-8 rounded-2xl border border-dashed border-slate-200/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-600">
              条件に合うHERITAGEはありません。
              <br />
              絞り込み条件を少し緩めて再検索する想定です。
            </div>
          </Reveal>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {paginatedItems.map((item, index) => {
                const itemTags = item.tags ?? [];
                const labelMaker = item.brandName ?? item.maker;
                const era = item.eraLabel ?? "ERA";
                const preview = getHeritagePreviewText(item, { maxChars: 180 });

                return (
                  <Reveal key={item.id} delay={index * 70}>
                    <Link href={`/heritage/${item.slug}`} className="block">
                      <GlassCard
                        padding="lg"
                        interactive
                        variant="dim"
                        className="h-full border border-white/40 bg-white/90 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.55)]"
                      >
                        <div className="flex h-full flex-col gap-3 text-slate-900">
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-800">
                            <span className="rounded-full border border-rose-200/80 bg-rose-50/90 px-3 py-1 text-[0.7rem] font-medium text-rose-600">
                              {era}
                            </span>
                            {labelMaker && (
                              <span className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                {labelMaker}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-serif text-base font-semibold text-slate-900 sm:text-lg">
                              {item.titleJa ?? item.title}
                            </h4>
                            {item.modelName && (
                              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-rose-500">
                                {item.modelName}
                              </p>
                            )}
                            {preview && (
                              <p className="line-clamp-3 text-[0.8rem] leading-relaxed text-slate-800 sm:text-sm">
                                {preview}
                              </p>
                            )}
                          </div>

                          {itemTags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-2 text-[0.7rem] text-slate-800">
                              {itemTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-slate-300/80 bg-white/80 px-2.5 py-1"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav
                  aria-label="HERITAGE pagination"
                  className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs text-slate-700 shadow-soft"
                >
                  {/* Prev */}
                  {currentPage > 1 ? (
                    <Link
                      href={buildPageHref(currentPage - 1)}
                      rel="nofollow"
                      className="rounded-full px-3 py-1 text-[0.7rem] text-slate-500 hover:bg-slate-100"
                    >
                      ← PREV
                    </Link>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-[0.7rem] text-slate-400">
                      ← PREV
                    </span>
                  )}

                  {/* ページ番号 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Link
                          key={page}
                          href={buildPageHref(page)}
                          rel="nofollow"
                          className={
                            page === currentPage
                              ? "flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[0.75rem] font-semibold text-slate-50"
                              : "flex h-7 w-7 items-center justify-center rounded-full text-[0.75rem] text-slate-600 hover:bg-slate-100"
                          }
                        >
                          {page}
                        </Link>
                      ),
                    )}
                  </div>

                  {/* Next */}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildPageHref(currentPage + 1)}
                      rel="nofollow"
                      className="rounded-full px-3 py-1 text-[0.7rem] text-slate-500 hover:bg-slate-100"
                    >
                      NEXT →
                    </Link>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-[0.7rem] text-slate-400">
                      NEXT →
                    </span>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
