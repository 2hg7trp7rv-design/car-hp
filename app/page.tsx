// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { HeroSection } from "@/components/home/HeroSection";
import { Button } from "@/components/ui/button";

import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  openGraph: {
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
    type: "website",
    url: "https://car-hp.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "クルマのニュース コラム 車種データを個人目線でまとめた小さなサイト",
  },
};

export const runtime = "edge";

type HeroStats = {
  carsCount: number;
  columnsCount: number;
  newsCount: number;
  guidesCount: number;
  heritageCount: number;
};

type CrossTimelineItem = {
  id: string;
  kind: "news" | "column" | "guide" | "heritage";
  title: string;
  href: string;
  dateLabel: string | null;
  meta: string;
};

type HomePageData = {
  latestNews: NewsItem[];
  latestCars: CarItem[];
  latestColumns: ColumnItem[];
  latestGuides: GuideItem[];
  latestHeritage: HeritageItem[];
  crossTimeline: CrossTimelineItem[];
  stats: HeroStats;
};

function safeDateFromISO(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateLabel(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function mapColumnCategoryShort(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術";
    case "OWNER_STORY":
      return "オーナーストーリー";
    default:
      return "コラム";
  }
}

function mapGuideCategoryShort(category?: GuideItem["category"]): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "PROCEDURE":
      return "手続き・名義変更";
    case "INSURANCE":
      return "保険・リスク";
    case "BUY":
      return "購入ガイド";
    case "SELL":
      return "売却ガイド";
    default:
      return "ガイド";
  }
}

function buildCrossTimeline(
  news: NewsItem[],
  columns: ColumnItem[],
  guides: GuideItem[],
  heritage: HeritageItem[],
): CrossTimelineItem[] {
  type ItemWithTime = CrossTimelineItem & { sortTime: number | null };

  const items: ItemWithTime[] = [];

  news.forEach((n) => {
    const d = safeDateFromISO(n.publishedAt ?? null);
    items.push({
      id: `news-${n.id}`,
      kind: "news",
      title: n.titleJa || n.title,
      href: `/news/${encodeURIComponent(n.id)}`,
      dateLabel: formatDateLabel(d),
      meta:
        n.maker && n.category
          ? `${n.maker} · ${n.category}`
          : n.maker || n.category || "NEWS",
      sortTime: d ? d.getTime() : null,
    });
  });

  columns.forEach((c) => {
    const d = safeDateFromISO(c.publishedAt ?? null);
    items.push({
      id: `column-${c.id}`,
      kind: "column",
      title: c.title,
      href: `/column/${encodeURIComponent(c.slug)}`,
      dateLabel: formatDateLabel(d),
      meta: mapColumnCategoryShort(c.category),
      sortTime: d ? d.getTime() : null,
    });
  });

  guides.forEach((g) => {
    const d = safeDateFromISO(g.publishedAt ?? null);
    items.push({
      id: `guide-${g.id}`,
      kind: "guide",
      title: g.title,
      href: `/guide/${encodeURIComponent(g.slug)}`,
      dateLabel: formatDateLabel(d),
      meta: mapGuideCategoryShort(g.category),
      sortTime: d ? d.getTime() : null,
    });
  });

  heritage.forEach((h) => {
    const baseTitle = h.titleJa ?? h.title;
    const d = safeDateFromISO(h.publishedAt ?? h.updatedAt ?? null);
    items.push({
      id: `heritage-${h.id}`,
      kind: "heritage",
      title: baseTitle,
      href: `/heritage/${encodeURIComponent(h.slug)}`,
      dateLabel: formatDateLabel(d),
      meta:
        h.maker && h.eraLabel
          ? `${h.maker} · ${h.eraLabel}`
          : h.maker || h.eraLabel || "HERITAGE",
      sortTime: d ? d.getTime() : null,
    });
  });

  items.sort((a, b) => {
    if (a.sortTime === null && b.sortTime === null) return 0;
    if (a.sortTime === null) return 1;
    if (b.sortTime === null) return -1;
    return b.sortTime - a.sortTime;
  });

  const limited = items.slice(0, 12);
  return limited.map(({ sortTime, ...rest }) => rest);
}

async function getHomePageData(): Promise<HomePageData> {
  const [news, cars, columns, guides, heritage] = await Promise.all([
    getLatestNews(12),
    getAllCars(),
    getAllColumns(),
    getAllGuides(),
    getAllHeritage(),
  ]);

  const sortedCars = [...cars].sort((a, b) => {
    const yearA = a.releaseYear ?? 0;
    const yearB = b.releaseYear ?? 0;
    if (yearA !== yearB) return yearB - yearA;
    return a.name.localeCompare(b.name, "ja");
  });
  const latestCars = sortedCars.slice(0, 6);

  const sortedColumns = [...columns].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    return a.title.localeCompare(b.title, "ja");
  });
  const latestColumns = sortedColumns.slice(0, 6);

  const sortedGuides = [...guides].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    return a.title.localeCompare(b.title, "ja");
  });
  const latestGuides = sortedGuides.slice(0, 6);

  const sortedHeritage = [...heritage].sort((a, b) => {
    const dateA = a.publishedAt ?? "";
    const dateB = b.publishedAt ?? "";
    if (dateA && dateB && dateA !== dateB) return dateB.localeCompare(dateA);
    const titleA = (a.titleJa ?? a.title ?? "").toString();
    const titleB = (b.titleJa ?? b.title ?? "").toString();
    return titleA.localeCompare(titleB, "ja");
  });
  const latestHeritage = sortedHeritage.slice(0, 4);

  const stats: HeroStats = {
    carsCount: cars.length,
    columnsCount: columns.length,
    newsCount: news.length,
    guidesCount: guides.length,
    heritageCount: heritage.length,
  };

  const crossTimeline = buildCrossTimeline(news, columns, guides, heritage);

  return {
    latestNews: news,
    latestCars,
    latestColumns,
    latestGuides,
    latestHeritage,
    crossTimeline,
    stats,
  };
}

export default async function HomePage() {
  const {
    latestNews,
    latestCars,
    latestColumns,
    latestGuides,
    latestHeritage,
    crossTimeline,
    stats,
  } = await getHomePageData();

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* ヒーロー（セダン × Tiffany メッシュ） */}
      <HeroSection stats={stats} />

      {/* メインコンテンツ */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <div className="space-y-12 sm:space-y-14">
          {/* OVERVIEW セクション */}
          <section aria-labelledby="section-overview">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-6 sm:space-y-8">
                {/* セクション見出し */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <Reveal>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
                        OVERVIEW
                      </p>
                      <h2
                        id="section-overview"
                        className="serif-heading mt-2 text-xl font-medium tracking-tight text-slate-900 sm:text-2xl"
                      >
                        このサイトでできること
                      </h2>
                    </div>
                  </Reveal>

                  <Reveal delay={80}>
                    <p className="max-w-md text-[11px] leading-relaxed text-text-sub sm:text-xs">
                      メーカー公式サイトへのニュースリンクをまとめて確認
                      車種ごとのスペックと簡単なコメントを一覧で確認
                      トラブル 整備 お金まわりの話をコラムで整理
                      購入 売却 維持費の考え方をガイドで整理
                      名車やブランドの歴史をHERITAGEとして整理
                      <br />
                      <br />
                      クルマとの付き合い方を
                      一度ここでざっくり整理しておくイメージ
                    </p>
                  </Reveal>
                </header>

                {/* Bento レイアウト */}
                <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 lg:gap-6">
                  {/* NEWS: メインカード */}
                  <Reveal className="md:col-span-7 lg:col-span-7 lg:row-span-2">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="group relative flex h-full flex-col justify-between overflow-hidden border-slate-200/70 bg-gradient-to-br from-tiffany-50 via-white to-white shadow-soft-card"
                    >
                      {/* 背景の光 */}
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-24 -top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.22),_transparent_70%)] blur-3xl" />
                        <div className="absolute -right-24 bottom-[-10%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.16),_transparent_70%)] blur-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-transparent" />
                      </div>

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                              NEWS
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                              新型車とモデルチェンジのニュース
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href="/news">OPEN</Link>
                            </Button>
                            <Button
                              asChild
                              variant="primary"
                              size="sm"
                              className="hidden whitespace-nowrap sm:inline-flex"
                            >
                              <Link href="/news">OPEN NEWS LIST</Link>
                            </Button>
                          </div>
                        </div>

                        <p className="text-[11px] leading-relaxed text-text-sub sm:text-xs">
                          メーカー公式サイトなどの情報をもとに
                          新型車 モデルチェンジ 新しい装備の動きをピックアップ
                          <br />
                          <br />
                          流れとポイントだけここで確認
                          細かい内容や全文は
                          ニュースごとのリンク先でチェックする前提
                        </p>

                        <div className="mt-4 space-y-2">
                          {latestNews.slice(0, 4).map((n) => (
                            <Link
                              key={n.id}
                              href={`/news/${encodeURIComponent(n.id)}`}
                            >
                              <article className="group flex items-baseline gap-3 rounded-xl bg-white/80 px-3 py-2 text-[11px] transition hover:bg-white">
                                <div className="mt-[5px] h-[3px] w-7 rounded-full bg-gradient-to-r from-tiffany-300 to-tiffany-500" />
                                <div className="flex-1">
                                  <h4 className="line-clamp-2 leading-snug text-slate-900 group-hover:underline">
                                    {n.titleJa || n.title}
                                  </h4>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-slate-500">
                                    {n.maker && (
                                      <span className="rounded-full bg-slate-50 px-2 py-0.5">
                                        {n.maker}
                                      </span>
                                    )}
                                    {n.category && (
                                      <span className="rounded-full bg-slate-50 px-2 py-0.5">
                                        {n.category}
                                      </span>
                                    )}
                                    {n.publishedAt && (
                                      <span className="text-[9px] text-slate-400">
                                        {new Date(
                                          n.publishedAt,
                                        ).toLocaleDateString("ja-JP", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </article>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>

                  {/* CARS: 車種カード */}
                  <Reveal className="md:col-span-5 lg:col-span-5">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="relative overflow-hidden border-slate-200/80 bg-white/90"
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-20 top-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,216,208,0.35),_transparent_70%)] blur-3xl" />
                        <div className="absolute -right-20 bottom-[-10%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.35),_transparent_70%)] blur-3xl" />
                      </div>

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                              CARS DATABASE
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                              気になる車種を並べて見る
                            </h3>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden whitespace-nowrap sm:inline-flex"
                          >
                            <Link href="/cars">OPEN</Link>
                          </Button>
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                          気になっている車種について
                          サイズ スペック 維持のしやすさ セグメントを一覧で確認
                          <br />
                          <br />
                          もっと詳しく見たい車種は
                          詳細ページからニュース コラム ガイドもあわせてチェックする想定
                        </p>

                        <div className="mt-4 space-y-2">
                          {latestCars.slice(0, 3).map((car) => (
                            <Link
                              key={car.slug}
                              href={`/cars/${encodeURIComponent(car.slug)}`}
                            >
                              <article className="group flex items-baseline gap-3 rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-[11px] transition hover:border-tiffany-300 hover:bg-white">
                                <div className="mt-[6px] h-[3px] w-7 rounded-full bg-slate-300" />
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="line-clamp-1 font-medium text-slate-900 group-hover:underline">
                                      {car.name}
                                    </h4>
                                    {car.maker && (
                                      <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
                                        {car.maker}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500">
                                    {car.summary}
                                  </p>
                                </div>
                              </article>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>

                  {/* COLUMN: トラブル/整備コラム */}
                  <Reveal className="md:col-span-7 lg:col-span-5">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="relative overflow-hidden border-slate-200/80 bg-slate-950 text-slate-50"
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-24 bottom-[-28%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.35),_transparent_70%)] blur-3xl" />
                        <div className="absolute -right-16 top-[-36%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.3),_transparent_70%)] blur-3xl" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-400">
                              COLUMN
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-white">
                              トラブルと整備のコラム
                            </h3>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden whitespace-nowrap sm:inline-flex"
                          >
                            <Link href="/column">OPEN COLUMNS</Link>
                          </Button>
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-slate-300 sm:text-xs">
                          実際によくあるトラブル
                          どこから手を付けると良いかという整備の優先度
                          セダン SUV などボディタイプごとの乗り味
                          エンジンの違いによるキャラクター
                          <br />
                          <br />
                          カタログでは分かりにくい部分を
                          あとから読み返せるノートのような感覚で置いておく
                        </p>

                        <div className="mt-4 space-y-1.5">
                          {latestColumns.slice(0, 3).map((c) => (
                            <Link
                              key={c.slug}
                              href={`/column/${encodeURIComponent(c.slug)}`}
                            >
                              <article className="flex items-baseline gap-3 rounded-2xl bg-slate-50/90 px-3 py-2 text-[11px] transition hover:bg-white">
                                <span className="mt-[7px] h-[3px] w-6 rounded-full bg-tiffany-300" />
                                <div className="flex-1">
                                  <p className="text-[9px] tracking-[0.18em] text-slate-400">
                                    {c.category === "MAINTENANCE"
                                      ? "MAINTENANCE"
                                      : c.category === "TECHNICAL"
                                      ? "TECHNICAL"
                                      : c.category === "OWNER_STORY"
                                      ? "OWNER STORY"
                                      : "COLUMN"}
                                  </p>
                                  <p className="line-clamp-2 font-medium text-slate-900">
                                    {c.title}
                                  </p>
                                </div>
                              </article>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>

                  {/* GUIDE: お金・維持・売却 */}
                  <Reveal className="md:col-span-5 lg:col-span-7">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-vapor to-white"
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-24 -bottom-[30%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                              GUIDE
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                              お金と手続きのガイド
                            </h3>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden whitespace-nowrap sm:inline-flex"
                          >
                            <Link href="/guide">OPEN GUIDES</Link>
                          </Button>
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                          いくらくらいまでなら無理せず買えるか
                          ローン 一括 残価設定のおおまかな違い
                          売るとき どんな流れになるか
                          <br />
                          <br />
                          クルマを買う前と手放す前に
                          一回だけ確認しておきたいポイントをまとめたエリア
                        </p>

                        <div className="mt-4 space-y-1.5 text-[11px]">
                          {latestGuides.map((g) => (
                            <Link
                              key={g.slug}
                              href={`/guide/${encodeURIComponent(g.slug)}`}
                            >
                              <article className="flex items-baseline gap-3 rounded-2xl bg-white/85 px-3 py-2 transition hover:bg-white">
                                <span className="mt-[7px] h-[3px] w-6 rounded-full bg-slate-300" />
                                <div className="flex-1">
                                  <p className="text-[9px] tracking-[0.18em] text-slate-400">
                                    {g.category === "MONEY"
                                      ? "MONEY"
                                      : g.category === "PROCEDURE"
                                      ? "PROCEDURE"
                                      : g.category === "INSURANCE"
                                      ? "INSURANCE"
                                      : "GUIDE"}
                                  </p>
                                  <p className="line-clamp-2 font-medium text-slate-900">
                                    {g.title}
                                  </p>
                                </div>
                              </article>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>

                  {/* HERITAGE: 名車・ブランドの系譜 */}
                  <Reveal className="md:col-span-12">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="relative overflow-hidden border-slate-200/80 bg-white/90 shadow-soft-card"
                    >
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-28 top-[-30%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,210,245,0.35),_transparent_70%)] blur-3xl" />
                        <div className="absolute -right-20 bottom-[-30%] h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.25),_transparent_70%)] blur-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-transparent" />
                      </div>

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                              HERITAGE
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                              名車とブランドの系譜をたどる
                            </h3>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden whitespace-nowrap sm:inline-flex"
                          >
                            <Link href="/heritage">OPEN HERITAGE</Link>
                          </Button>
                        </div>

                        <p className="mt-1 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                          F40 M3 GT-R など
                          クルマ文化をつくってきたモデルの背景や時代性を
                          メーカーごとの「系譜」として整理した読み物エリア
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                          {latestHeritage.length > 0 ? (
                            latestHeritage.map((h) => (
                              <Link
                                key={h.slug}
                                href={`/heritage/${encodeURIComponent(h.slug)}`}
                              >
                                <article className="group flex h-full flex-col gap-1 rounded-2xl bg-white/90 px-3 py-2 text-[11px] transition hover:bg-white">
                                  <p className="text-[9px] tracking-[0.18em] text-slate-400">
                                    {h.maker ?? "BRAND"}
                                    {h.eraLabel ? ` · ${h.eraLabel}` : ""}
                                  </p>
                                  <p className="line-clamp-2 font-medium text-slate-900 group-hover:underline">
                                    {h.titleJa ?? h.title}
                                  </p>
                                  {h.summary && (
                                    <p className="line-clamp-2 text-[10px] leading-snug text-slate-600">
                                      {h.summary}
                                    </p>
                                  )}
                                </article>
                              </Link>
                            ))
                          ) : (
                            <p className="text-[11px] text-text-sub">
                              HERITAGEの記事はまだ準備中です。
                              まずはCARSやCOLUMNから順番に増やしていく予定です。
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* サイト全体の横断タイムライン */}
          <section className="mt-10 border-t border-slate-200/70 pt-8">
            <Reveal>
              <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                    CROSS CONTENT TIMELINE
                  </p>
                  <h2 className="serif-heading mt-1 text-lg font-medium tracking-tight text-slate-900 sm:text-xl">
                    サイト全体の「最近の動き」
                  </h2>
                </div>
                <p className="max-w-sm text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  NEWS COLUMN GUIDE HERITAGE をまとめて
                  公開日の新しい順に並べたタイムライン
                  いま何が追加・更新されているかを一目で確認するためのエリア
                </p>
              </header>
            </Reveal>

            <Reveal delay={120}>
              {crossTimeline.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-xs text-slate-500">
                  まだ横断的に表示できるコンテンツがありません。
                  NEWS COLUMN GUIDE HERITAGE を追加していくと ここに時系列で並びます。
                </p>
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-soft sm:p-5">
                  <ol className="space-y-3 text-xs">
                    {crossTimeline.map((item) => (
                      <li
                        key={item.id}
                        className="group relative flex items-start gap-3"
                      >
                        <div className="mt-[6px] h-[9px] w-[9px] flex-shrink-0 rounded-full bg-gradient-to-br from-tiffany-400 to-slate-400" />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-slate-600">
                              {item.kind === "news"
                                ? "NEWS"
                                : item.kind === "column"
                                ? "COLUMN"
                                : item.kind === "guide"
                                ? "GUIDE"
                                : "HERITAGE"}
                            </span>
                            {item.meta && (
                              <span className="text-[10px] text-slate-500">
                                {item.meta}
                              </span>
                            )}
                            {item.dateLabel && (
                              <span className="ml-auto text-[10px] text-slate-400">
                                {item.dateLabel}
                              </span>
                            )}
                          </div>
                          <Link href={item.href}>
                            <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-relaxed text-slate-900 group-hover:underline">
                              {item.title}
                            </p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Reveal>
          </section>

          {/* CARS ハイライトセクション */}
          <section className="mt-14 border-t border-slate-200/70 pt-10">
            <Reveal>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                    HIGHLIGHT
                  </p>
                  <h2 className="serif-heading mt-1 text-lg font-medium tracking-tight text-slate-900 sm:text-xl">
                    最近追加された車種
                  </h2>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/cars">OPEN CARS DATABASE</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {latestCars.map((car) => (
                  <Link
                    key={car.slug}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                  >
                    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-xs shadow-soft-sm transition hover:border-tiffany-400 hover:bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                            {car.maker}
                          </p>
                          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-900 group-hover:underline">
                            {car.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-[9px] text-slate-500">
                          {car.releaseYear && (
                            <span>{car.releaseYear}年頃</span>
                          )}
                          {car.difficulty && (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5">
                              {car.difficulty === "basic"
                                ? "扱いやすさ：やさしめ"
                                : car.difficulty === "intermediate"
                                ? "扱いやすさ：ふつう"
                                : "扱いやすさ：しっかり準備"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                        {car.bodyType && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.bodyType}
                          </span>
                        )}
                        {car.segment && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.segment}
                          </span>
                        )}
                        {car.drive && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.drive}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-3 text-[11px] leading-snug text-slate-600">
                        {car.summary}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        </div>
      </section>
    </main>
  );
}
