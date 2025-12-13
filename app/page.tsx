// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllNews, type NewsItem } from "@/lib/news";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { CarCard } from "@/components/cars/CarCard";
import { GuideCard } from "@/components/guide/GuideCard";
import { ColumnCard } from "@/components/column/ColumnCard";
import { NewsCard } from "@/components/news/NewsCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "輸入車・国産車のニュースと本音レビューを届けるCAR BOUTIQUE。維持費やトラブル、買い方・売り方まで、大人のクルマ好きが知りたい情報を静かなブティックのような世界観でお届けします。",
  alternates: {
    canonical: "/",
  },
};

function pickTopCars(all: CarItem[]): CarItem[] {
  const score = (c: CarItem) => {
    const maker = (c.maker ?? "").toLowerCase();
    const series = (c.series ?? "").toLowerCase();
    const v =
      (maker.includes("bmw") ? 18 : 0) +
      (maker.includes("mercedes") ? 16 : 0) +
      (maker.includes("porsche") ? 16 : 0) +
      (maker.includes("audi") ? 14 : 0) +
      (maker.includes("toyota") ? 10 : 0) +
      (series.includes("supra") ? 12 : 0) +
      (series.includes("m") ? 6 : 0);
    return v;
  };

  return [...all]
    .sort((a, b) => score(b) - score(a))
    .slice(0, 6);
}

function pickTopGuides(all: GuideItem[]): GuideItem[] {
  // “売却/保険/購入/維持” の入口になりやすいタイトルを優先
  const keywords = [
    "保険",
    "売却",
    "査定",
    "維持費",
    "故障",
    "買い方",
    "中古",
    "ローン",
    "車検",
    "燃費",
  ];

  const score = (g: GuideItem) => {
    const t = g.title ?? "";
    const base =
      (g.category === "MONEY" ? 8 : 0) +
      (g.category === "INSURANCE" ? 8 : 0) +
      (g.category === "SELL" ? 7 : 0) +
      (g.category === "BUY" ? 6 : 0) +
      (g.category === "MAINTENANCE" ? 5 : 0);
    const kw = keywords.reduce((acc, k) => acc + (t.includes(k) ? 2 : 0), 0);
    const recency = (() => {
      const d = new Date(g.publishedAt);
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 14) return 6;
      if (days <= 60) return 3;
      return 0;
    })();
    return base + kw + recency;
  };

  return [...all]
    .sort((a, b) => score(b) - score(a))
    .slice(0, 6);
}

function pickTopColumns(all: ColumnItem[]): ColumnItem[] {
  const recency = (c: ColumnItem) => {
    const d = new Date(c.publishedAt);
    if (Number.isNaN(d.getTime())) return 0;
    return d.getTime();
  };

  return [...all].sort((a, b) => recency(b) - recency(a)).slice(0, 4);
}

function pickTopNews(all: NewsItem[]): NewsItem[] {
  const recency = (n: NewsItem) => {
    const d = new Date(n.publishedAt);
    if (Number.isNaN(d.getTime())) return 0;
    return d.getTime();
  };

  return [...all].sort((a, b) => recency(b) - recency(a)).slice(0, 5);
}

export default async function HomePage() {
  const cars = await getAllCars();
  const guides = await getAllGuides();
  const columns = await getAllColumns();
  const news = await getAllNews();

  const topCars = pickTopCars(cars);
  const topGuides = pickTopGuides(guides);
  const topColumns = pickTopColumns(columns);
  const topNews = pickTopNews(news);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      {/* HERO */}
      <Reveal delay={70}>
        <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/85 px-6 py-10 shadow-soft-card sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(135,206,235,0.18),transparent_55%),radial-gradient(circle_at_82%_18%,rgba(64,224,208,0.18),transparent_60%),radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.35),transparent_50%)]" />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              CURATED AUTOMOTIVE JOURNAL
            </p>
            <h1 className="serif-heading mt-4 text-3xl text-slate-900 sm:text-4xl">
              CAR BOUTIQUE
            </h1>
            <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              輸入車・国産車のニュースと本音レビューを、静かなブティックのような世界観で。
              維持費、トラブル、買い方・売り方まで、“大人のクルマ好き”が知りたい情報を磨いて届けます。
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/cars"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                CARS
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                GUIDE
              </Link>
              <Link
                href="/column"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                COLUMN
              </Link>
              <Link
                href="/heritage"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                HERITAGE
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                NEWS
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* CARS */}
      <Reveal delay={120}>
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                FEATURED
              </p>
              <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                CARS
              </h2>
            </div>
            <Link
              href="/cars"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topCars.map((car, idx) => (
              <Reveal key={car.slug} delay={160 + idx * 40}>
                <CarCard car={car} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* GUIDE */}
      <Reveal delay={140}>
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                PRACTICAL
              </p>
              <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                GUIDE
              </h2>
            </div>
            <Link
              href="/guide"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topGuides.map((g, idx) => (
              <Reveal key={g.slug} delay={180 + idx * 40}>
                <GuideCard guide={g} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* COLUMN */}
      <Reveal delay={160}>
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                EDITORIAL
              </p>
              <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                COLUMN
              </h2>
            </div>
            <Link
              href="/column"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {topColumns.map((c, idx) => (
              <Reveal key={c.slug} delay={200 + idx * 40}>
                <ColumnCard column={c} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* NEWS */}
      <Reveal delay={180}>
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                LATEST
              </p>
              <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                NEWS
              </h2>
            </div>
            <Link
              href="/news"
              className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 hover:text-slate-900"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid gap-4">
            {topNews.map((n, idx) => (
              <Reveal key={n.id} delay={220 + idx * 40}>
                <NewsCard news={n} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* FOOT */}
      <Reveal delay={220}>
        <section className="mt-16">
          <GlassCard
            padding="lg"
            magnetic={false}
            className="border border-slate-100 bg-white/80 shadow-soft-card"
          >
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              ABOUT
            </p>
            <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
              “数字”より先に、価値のある情報を磨く
            </h2>
            <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
              CAR BOUTIQUE は、車を「買う/維持する/手放す」までのリアルに寄り添いながら、
              価値のある判断材料を静かなトーンでまとめるメディアです。
              まずはGUIDEを起点に、必要な情報を最短で拾ってください。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                GUIDEを読む
              </Link>
              <Link
                href="/cars"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                車種データを見る
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                CONTACT
              </Link>
            </div>
          </GlassCard>
        </section>
      </Reveal>
    </div>
  );
}
