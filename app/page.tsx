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

type HomePageData = {
  latestNews: NewsItem[];
  latestCars: CarItem[];
  latestColumns: ColumnItem[];
  latestGuides: GuideItem[];
};

async function getHomePageData(): Promise<HomePageData> {
  const [news, cars, columns, guides] = await Promise.all([
    getLatestNews(12),
    getAllCars(),
    getAllColumns(),
    getAllGuides(),
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

  return {
    latestNews: news,
    latestCars,
    latestColumns,
    latestGuides,
  };
}

export default async function HomePage() {
  const { latestNews, latestCars, latestColumns, latestGuides } =
    await getHomePageData();

  const stats = {
    carsCount: latestCars.length,
    columnsCount: latestColumns.length,
    newsCount: latestNews.length,
    guidesCount: latestGuides.length,
  };

  return (
    <main className="min-h-screen bg-ice-vapor">
      <HeroSection stats={stats} />

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
                      <h2 className="serif-heading mt-2 text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
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
                      <br />
                      <br />
                      クルマとの付き合い方を
                      一度ここでざっくり整理しておくイメージ
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
                              variant="glass"
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

                  {/* CARS：車種カード（右側） */}
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

                        {/* ハイライト車種 */}
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

                  {/* COLUMN：トラブル / 整備コラム */}
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
                            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                              COLUMN
                            </p>
                            <h3 className="serif-heading mt-2 text-lg font-medium text-slate-900">
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

                        <p className="mt-3 text-[11px] leading-relaxed text-text-sub sm:text-xs">
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

                  {/* GUIDE：お金・維持・売却 */}
                  <Reveal className="md:col-span-5 lg:col-span-7">
                    <GlassCard
                      as="section"
                      padding="lg"
                      interactive
                      className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-ice-vapor to-white"
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
                            variant="subtle"
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
                </div>
              </div>
            </div>
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
