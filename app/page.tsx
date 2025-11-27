// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { getAllCars } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getLatestNews, type NewsItem } from "@/lib/news";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default async function HomePage() {
  const [cars, columns, news] = await Promise.all([
    getAllCars(),
    getAllColumns(),
    getLatestNews(6),
  ]);

  const featuredColumn: ColumnItem | null =
    columns[0] ?? null;
  const subColumn: ColumnItem | null = columns[1] ?? null;
  const featuredCar = cars[0] ?? null;
  const latestNewsItems: NewsItem[] = news.slice(0, 5);

  return (
    <main className="min-h-screen bg-site pb-20 pt-10 sm:pb-28 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. HERO */}
        <HeroSection />

        {/* 2. CURATED FEED / BENTO GRID */}
        <section className="mt-24">
          <Reveal>
            <div className="mb-8 flex items-end justify-between px-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-600">
                  CURATED FEED
                </p>
                <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-slate-900">
                  Latest Stories
                </h2>
              </div>
              <Link
                href="/news"
                className="hidden text-[10px] font-bold tracking-widest text-slate-400 hover:text-tiffany-600 sm:block"
              >
                VIEW ALL NEWS →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:auto-rows-[minmax(180px,auto)] lg:grid-cols-4 lg:gap-6">
            {/* A. FEATURED COLUMN 2x2 */}
            {featuredColumn && (
              <Reveal
                delay={0}
                className="col-span-1 row-span-1 lg:col-span-2 lg:row-span-2"
              >
                <GlassCard
                  as="article"
                  padding="none"
                  interactive
                  variant="dim"
                  className="group relative h-full min-h-[400px] overflow-hidden"
                >
                  <Link
                    href={`/column/${featuredColumn.slug}`}
                    className="block h-full"
                  >
                    <div className="absolute inset-0">
                      {featuredColumn.heroImage ? (
                        <img
                          src={featuredColumn.heroImage}
                          alt={featuredColumn.title}
                          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80" />
                    </div>
                    <div className="relative z-10 flex h-full flex-col justify-end p-8">
                      <span className="mb-3 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-widest text-white backdrop-blur-md">
                        FEATURED
                      </span>
                      <h3 className="font-serif text-2xl font-medium leading-snug text-white sm:text-3xl lg:text-4xl">
                        {featuredColumn.title}
                      </h3>
                      {featuredColumn.summary && (
                        <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-slate-200">
                          {featuredColumn.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              </Reveal>
            )}

            {/* B. NEWS TICKER */}
            <Reveal
              delay={100}
              className="col-span-1 lg:col-span-1 lg:row-span-2"
            >
              <GlassCard className="flex h-full flex-col bg-white/60">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400">
                    NEWS FEED
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-tiffany-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-tiffany-500" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col divide-y divide-slate-100/80">
                  {latestNewsItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.id}`}
                      className="group py-4 hover:bg-slate-50/50"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[9px] font-bold tracking-widest text-tiffany-600">
                          {item.maker ?? "NEWS"}
                        </span>
                        <span className="text-[9px] text-slate-300">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>
                      <h4 className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-800 group-hover:text-tiffany-700">
                        {item.titleJa ?? item.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            {/* C. PICKUP CAR */}
            {featuredCar && (
              <Reveal delay={150} className="col-span-1">
                <GlassCard
                  interactive
                  padding="none"
                  className="group relative h-full min-h-[240px] overflow-hidden"
                >
                  <Link
                    href={`/cars/${featuredCar.slug}`}
                    className="block h-full"
                  >
                    <div className="absolute inset-0">
                      {featuredCar.mainImage && (
                        <img
                          src={featuredCar.mainImage}
                          alt={featuredCar.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-0 w-full p-5 text-white">
                      <p className="text-[9px] font-bold tracking-widest text-tiffany-300">
                        PICK UP CAR
                      </p>
                      <h4 className="mt-1 font-serif text-sm font-medium">
                        {featuredCar.name}
                      </h4>
                    </div>
                  </Link>
                </GlassCard>
              </Reveal>
            )}

            {/* D. SUB COLUMN / ROUTING CARD */}
            {subColumn && (
              <Reveal delay={180} className="col-span-1">
                <GlassCard
                  as="article"
                  interactive
                  className="flex h-full flex-col justify-between bg-white/90"
                >
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                      COLUMN
                    </p>
                    <h3 className="font-serif text-lg font-medium leading-relaxed text-slate-900">
                      {subColumn.title}
                    </h3>
                    {subColumn.summary && (
                      <p className="text-[11px] leading-relaxed text-text-sub line-clamp-3">
                        {subColumn.summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
                    <Link
                      href={`/column/${subColumn.slug}`}
                      className="inline-flex items-center gap-1 font-semibold tracking-[0.2em] text-tiffany-700"
                    >
                      READ COLUMN
                      <span>→</span>
                    </Link>
                    <Link
                      href="/column"
                      className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-600"
                    >
                      COLUMN LIST
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>
            )}
          </div>
        </section>

        {/* 3. クロスリンク CTA */}
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          <Link href="/guide">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                GUIDE
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                お金や維持費の話は、ガイドで整理。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                保険や税金、車検、ローンなど、暮らし寄りの実用情報は
                GUIDE セクションで少しずつ増やしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                ガイド一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>

          <Link href="/news">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                NEWS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                コラムで気になったトピックの最新動向はニュースで。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                メーカー発表や業界ニュースなど、背景となる動きは
                NEWS セクションから辿れるようにしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                ニュース一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
