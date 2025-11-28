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
import HomeNavDrawer from "@/components/home/HomeNavDrawer";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュース・車種データベース・整備やトラブルのコラム・購入/売却ガイドをまとめて確認できるクルマ情報サイトです。",
  openGraph: {
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "ニュース・車種データベース・整備やトラブルのコラム・購入/売却ガイドをまとめて確認できるクルマ情報サイトです。",
    type: "website",
    url: "https://car-hp.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAR BOUTIQUE | クルマのニュースとストーリー",
    description:
      "ニュース・車種データベース・整備やトラブルのコラム・購入/売却ガイドをまとめて確認できるクルマ情報サイトです。",
  },
};

function formatNewsDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function pickFeaturedNews(list: NewsItem[], countSub = 2) {
  const main = list[0] ? [list[0]] : [];
  const sub = list.slice(1, 1 + countSub);
  return { main, sub };
}

function pickHighlightCars(cars: CarItem[], count = 3) {
  // とりあえず最新追加順/配列先頭から抜粋
  return cars.slice(0, count);
}

function pickLatestColumns(columns: ColumnItem[], count = 3) {
  return columns.slice(0, count);
}

function pickLatestGuides(guides: GuideItem[], count = 2) {
  return guides.slice(0, count);
}

export default async function HomePage() {
  const [news, cars, columns, guides] = await Promise.all([
    getLatestNews(10),
    getAllCars(),
    getAllColumns(),
    getAllGuides(),
  ]);

  const { main: featuredNewsMain, sub: featuredNewsSub } =
    pickFeaturedNews(news);
  const highlightCars = pickHighlightCars(cars);
  const latestColumns = pickLatestColumns(columns);
  const latestGuides = pickLatestGuides(guides);

  const stats = {
    carsCount: cars.length,
    columnsCount: columns.length,
    newsCount: news.length,
    guidesCount: guides.length,
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 右上ボタン＋ナビカード（開閉ドロワー） */}
      <HomeNavDrawer />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="mb-20 sm:mb-24 lg:mb-28">
          {/* HeroSection 側は stats を受け取る props 実装になっている前提 */}
          <HeroSection stats={stats} />
        </section>

        {/* BENTO GRID */}
        <section
          aria-label="CAR BOUTIQUE overview"
          className="space-y-6 sm:space-y-8"
        >
          {/* セクション見出し */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <div>
                <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
                  OVERVIEW
                </p>
                <h2 className="serif-heading mt-2 text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
                  いまこのサイトで確認できること
                </h2>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <p className="max-w-md text-[11px] leading-relaxed text-text-sub sm:text-xs">
                公式ニュースへのリンク、車種データベース、トラブルや整備のコラム、
                購入・売却の実用ガイドを、1つの画面から行き来できるように整理しています。
              </p>
            </Reveal>
          </header>

          {/* Bento レイアウト */}
          <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 lg:gap-6">
            {/* NEWS：メインカード（左上・大きめ） */}
            <Reveal className="md:col-span-7 lg:col-span-7 lg:row-span-2">
              <GlassCard
                as="section"
                padding="lg"
                interactive
                className="group relative flex h-full flex-col justify-between overflow-hidden border border-tiffany-100 bg-gradient-to-br from-tiffany-50 via-white to-white shadow-soft-card"
              >
                {/* 背景の光（Tiffany を“光”として扱う） */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.22),_transparent_70%)] blur-3xl" />
                  <div className="absolute -right-24 bottom-[-40%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.16),_transparent_70%)] blur-3xl" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-tiffany-700">
                        NEWS FEED
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900 sm:text-xl">
                        メーカー公式のニュースをまとめて確認
                      </h3>
                    </div>
                    <Button
                      asChild
                      variant="glass"
                      size="sm"
                      className="hidden whitespace-nowrap sm:inline-flex"
                    >
                      <Link href="/news">OPEN NEWS LIST</Link>
                    </Button>
                  </div>

                  <p className="text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    各メーカー公式サイトなどの一次情報へのリンクを中心に、新型車や
                    改良情報、リコール、キャンペーン情報を一覧で追えるように整理しています。
                  </p>

                  {/* メインニュース */}
                  <div className="mt-2 space-y-3">
                    {featuredNewsMain.map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${encodeURIComponent(item.id)}`}
                      >
                        <article className="rounded-2xl bg-white/85 p-3 text-[11px] shadow-soft hover:shadow-soft-card">
                          <p className="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                            FEATURED
                          </p>
                          <h4 className="mt-1 line-clamp-2 font-semibold leading-relaxed text-slate-900">
                            {item.titleJa ?? item.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            {item.sourceName && (
                              <span className="tracking-[0.16em]">
                                {item.sourceName}
                              </span>
                            )}
                            {(item.publishedAtJa || item.publishedAt) && (
                              <span className="tracking-[0.16em]">
                                {item.publishedAtJa ??
                                  formatNewsDate(item.publishedAt)}
                              </span>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}

                    {/* サブニュース */}
                    {featuredNewsSub.length > 0 && (
                      <div className="space-y-1.5">
                        {featuredNewsSub.map((item) => (
                          <Link
                            key={item.id}
                            href={`/news/${encodeURIComponent(item.id)}`}
                          >
                            <article className="group/news flex items-baseline gap-2 rounded-xl bg-white/70 px-3 py-2 text-[11px] transition hover:bg-white">
                              <span className="mt-[3px] h-[3px] w-6 rounded-full bg-tiffany-300 transition-transform group-hover/news:translate-x-[1px]" />
                              <div className="flex-1">
                                <p className="line-clamp-2 leading-relaxed text-slate-800">
                                  {item.titleJa ?? item.title}
                                </p>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      全 {news.length} 件中、最新{" "}
                      {Math.min(news.length, 3)} 件を表示中
                    </span>
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-1 tracking-[0.16em] text-tiffany-700 hover:underline"
                    >
                      NEWS LIST
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* CARS：検索導線＋ハイライトカード（右上） */}
            <Reveal className="md:col-span-5 lg:col-span-5">
              <GlassCard
                as="section"
                padding="lg"
                interactive
                className="group relative flex h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-16 bottom-[-30%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.25),_transparent_70%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                        CARS DATABASE
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                        維持の難易度やボディタイプから探せる車種一覧
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
                    現在登録されている車種の基本スペックと、維持の難易度・ボディタイプ・
                    セグメント情報を一覧で確認できます。気になる車種は詳細ページから、
                    関連ニュースやコラムもあわせて参照できます。
                  </p>

                  {/* クイックフィルター */}
                  <div className="mt-4">
                    <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      QUICK FILTER
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <Link
                        href="/cars?bodyType=セダン"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                      >
                        SEDAN
                      </Link>
                      <Link
                        href="/cars?bodyType=SUV"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                      >
                        SUV
                      </Link>
                      <Link
                        href="/cars?difficulty=basic"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                      >
                        やさしい維持費
                      </Link>
                      <Link
                        href="/cars?difficulty=advanced"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] hover:border-tiffany-300 hover:bg-white"
                      >
                        気を使うモデル
                      </Link>
                    </div>
                  </div>

                  {/* ハイライト車種 */}
                  {highlightCars.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                        HIGHLIGHT MODELS
                      </p>
                      <div className="space-y-1.5">
                        {highlightCars.map((car) => (
                          <Link
                            key={car.slug}
                            href={`/cars/${encodeURIComponent(car.slug)}`}
                          >
                            <article className="flex items-baseline gap-2 rounded-2xl bg-slate-50/80 px-3 py-2 text-[11px] transition hover:bg-white">
                              <span className="mt-[5px] h-[2px] w-5 rounded-full bg-slate-300" />
                              <div className="flex-1">
                                <p className="text-[9px] tracking-[0.18em] text-slate-400">
                                  {car.maker}
                                </p>
                                <p className="line-clamp-1 font-semibold text-slate-900">
                                  {car.name}
                                </p>
                                {car.summary && (
                                  <p className="line-clamp-2 text-[10px] text-slate-500">
                                    {car.summary}
                                  </p>
                                )}
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </Reveal>

            {/* COLUMN：メンテナンス・トラブル系 */}
            <Reveal className="md:col-span-7">
              <GlassCard
                as="section"
                padding="lg"
                interactive
                className="group relative flex h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -right-16 top-[-20%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.3),_transparent_70%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                        COLUMN
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                        トラブルや整備、技術の背景を文章で整理
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

                  <p className="mt-3 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    実際に起きがちなトラブルの話や、整備の優先度、セダンとSUVの乗り味の違い、
                    エンジン形式の特徴など、検討や維持の判断材料になりそうなテーマを中心に
                    コラム形式でまとめています。
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {latestColumns.slice(0, 3).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/column/${encodeURIComponent(c.slug)}`}
                      >
                        <article className="flex items-baseline gap-2 rounded-2xl bg-slate-50/90 px-3 py-2 text-[11px] transition hover:bg-white">
                          <span className="mt-[7px] h-[3px] w-6 rounded-full bg-tiffany-300" />
                          <div className="flex-1">
                            <p className="text-[9px] tracking-[0.18em] text-slate-400">
                              {c.category === "MAINTENANCE"
                                ? "MAINTENANCE"
                                : "TECH / HISTORY"}
                            </p>
                            <p className="line-clamp-1 font-semibold text-slate-900">
                              {c.title}
                            </p>
                            {c.summary && (
                              <p className="line-clamp-2 text-[10px] text-slate-500">
                                {c.summary}
                              </p>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* GUIDE：お金・売却ガイド＋導線 */}
            <Reveal className="md:col-span-5">
              <GlassCard
                as="section"
                padding="lg"
                interactive
                className="group relative flex h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-gradient-to-br from-vapor to-white"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-24 -bottom-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                        GUIDE
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
                        お金・維持・売却を事前に整理するためのガイド
                      </h3>
                    </div>
                    <Button
                      asChild
                      variant="subtle"
                      size="sm"
                      className="hidden whitespace-nowrap sm:inline-flex"
                    >
                      <Link href="/guide">OPEN GUIDE</Link>
                    </Button>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    ローンと一括の違い、維持費のざっくり試算、手放すときの段取りなど、
                    ライフプラン寄りの内容をまとめたガイドです。コラムとは別に、
                    判断のためのチェックポイントだけを整理して読める構成にしています。
                  </p>

                  <div className="mt-4 space-y-1.5 text-[11px]">
                    {latestGuides.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/guide/${encodeURIComponent(g.slug)}`}
                      >
                        <article className="flex items-baseline gap-2 rounded-2xl bg-white/85 px-3 py-2 transition hover:bg-white">
                          <span className="mt-[7px] h-[3px] w-6 rounded-full bg-slate-300" />
                          <div className="flex-1">
                            <p className="text-[9px] tracking-[0.18em] text-slate-400">
                              {g.category === "MONEY"
                                ? "MONEY / COST"
                                : "SELL / REPLACE"}
                            </p>
                            <p className="line-clamp-2 font-semibold text-slate-900">
                              {g.title}
                            </p>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <Link
                      href="/guide?category=MONEY"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
                    >
                      お金・維持費まわり
                    </Link>
                    <Link
                      href="/guide?category=SELL"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
                    >
                      手放すときの整理
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
