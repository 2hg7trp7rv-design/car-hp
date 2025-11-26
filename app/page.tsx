import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animation/Reveal";
import { getAllCars } from "@/lib/cars";
import { getAllColumns } from "@/lib/columns";
import { getLatestNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description: "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
}

export default async function HomePage() {
  const [cars, columns, news] = await Promise.all([
    getAllCars(),
    getAllColumns(),
    getLatestNews(6),
  ]);

  // コンテンツの割り当て
  const featuredColumn = columns |

| null;
  const subColumn = columns[1] |

| null;
  const featuredCar = cars |

| null;
  const latestNewsItems = news.slice(0, 5);

  return (
    <main className="min-h-screen bg-site pb-20 pt-10 sm:pb-28 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. BENTO GRID DASHBOARD */}
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
              <Link href="/news" className="hidden text-[10px] font-bold tracking-widest text-slate-400 hover:text-tiffany-600 sm:block">
                VIEW ALL NEWS →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(180px,auto)] lg:gap-6">
            
            {/* A. MAIN FEATURE (2x2) */}
            {featuredColumn && (
              <Reveal delay={0} className="col-span-1 row-span-1 lg:col-span-2 lg:row-span-2">
                <GlassCard as="article" padding="none" interactive variant="dim" className="group relative h-full min-h-[400px] overflow-hidden">
                  <Link href={`/column/${featuredColumn.slug}`} className="block h-full w-full">
                    <div className="absolute inset-0 z-0">
                      {featuredColumn.heroImage? (
                        <img src={featuredColumn.heroImage} alt={featuredColumn.title} className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
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
                      <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-slate-200">
                        {featuredColumn.summary}
                      </p>
                    </div>
                  </Link>
                </GlassCard>
              </Reveal>
            )}

            {/* B. NEWS TICKER (1x2) */}
            <Reveal delay={100} className="col-span-1 lg:col-span-1 lg:row-span-2">
              <GlassCard className="flex h-full flex-col bg-white/60">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400">NEWS FEED</span>
                  <span className="flex h-2 w-2"><span className="absolute h-2 w-2 animate-ping rounded-full bg-tiffany-400 opacity-75"></span><span className="relative h-2 w-2 rounded-full bg-tiffany-500"></span></span>
                </div>
                <div className="flex flex-1 flex-col divide-y divide-slate-100/80">
                  {latestNewsItems.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`} className="group py-4 hover:bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold tracking-widest text-tiffany-600">{item.maker |

| "NEWS"}</span>
                        <span className="text-[9px] text-slate-300">{formatDate(item.publishedAt)}</span>
                      </div>
                      <h4 className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-800 group-hover:text-tiffany-700">
                        {item.titleJa |

| item.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            {/* C. PICKUP CAR (1x1) */}
            {featuredCar && (
              <Reveal delay={150} className="col-span-1">
                <GlassCard interactive padding="none" className="group relative h-full min-h-[240px] overflow-hidden">
                  <Link href={`/cars/${featuredCar.slug}`} className="block h-full">
                    <div className="absolute inset-0">
                      {featuredCar.mainImage && <img src={featuredCar.mainImage} alt={featuredCar.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-0 w-full p-5 text-white">
                      <p className="text-[9px] font-bold tracking-widest text-tiffany-300">PICK UP CAR</p>
                      <h4 className="mt-1 font-serif text-sm font-medium">{featuredCar.name}</h4>
                    </div>
                  </Link>
                </GlassCard>
              </Reveal>
            )}

            {/* D. SUB COLUMN (1x1) */}
            {subColumn && (
              <Reveal delay={200} className="col-span-1">
                <GlassCard interactive className="flex h-full flex-col justify-between bg-gradient-to-br from-white to-tiffany-50/30 p-6">
                  <div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-500">COLUMN</span>
                    <h4 className="mt-4 font-serif text-sm font-medium leading-relaxed text-slate-900">{subColumn.title}</h4>
                  </div>
                  <Link href={`/column/${subColumn.slug}`} className="mt-4 text-right text-[10px] font-bold tracking-widest text-tiffany-600">READ MORE →</Link>
                </GlassCard>
              </Reveal>
            )}

            {/* E. GUIDE (2x1) */}
            <Reveal delay={250} className="col-span-1 lg:col-span-2">
              <GlassCard interactive className="relative flex h-full flex-col justify-center overflow-hidden bg-slate-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-tiffany-500/20 blur-[80px]" />
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-bold tracking-widest text-tiffany-400">BUYING GUIDE</p>
                  <h3 className="font-serif text-xl text-slate-50">失敗しないクルマ選びと、維持費のリアル。</h3>
                </div>
                <div className="relative z-10 mt-6 sm:mt-0">
                  <Link href="/guide"><Button variant="secondary" className="bg-white text-slate-900 border-none">ガイドを読む</Button></Link>
                </div>
              </GlassCard>
            </Reveal>

          </div>
        </section>
      </div>
    </main>
  );
}
