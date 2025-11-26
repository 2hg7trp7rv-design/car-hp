// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllCars } from "@/lib/cars";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "CARS | CURATED SHOWROOM",
  description:
    "CAR BOUTIQUEが厳選した車種データベース。スペックだけでなく、そのクルマが持つ物語と性格を整理したデジタル・ショールーム。",
};

type Props = {
  searchParams?: {
    q?: string;
    maker?: string;
    bodyType?: string;
    difficulty?: string;
    segment?: string;
  };
};

/**
 * 検索クエリの正規化ヘルパー
 */
function normalize(value: string | undefined | null): string {
  return (value?? "").trim().toLowerCase();
}

/**
 * Bento Grid用クラス生成ヘルパー
 * インデックスに応じてグリッドの占有サイズを変化させ、視覚的リズムを作る。
 * パターン: [小, 小, 大(横長), 小, 小, 大(横長)...]
 */
function getGridSpanClass(index: number): string {
  const pattern = index % 3;
  // 3番目の要素（index 2, 5, 8...）を横長に強調表示
  if (pattern === 2) {
    return "md:col-span-2 md:row-span-1"; 
  }
  return "md:col-span-1 md:row-span-1";
}

export default async function CarsPage({ searchParams }: Props) {
  const all = await getAllCars();

  // --- フィルタリングロジック ---
  const q = normalize(searchParams?.q);
  const makerFilter = (searchParams?.maker?? "").trim();
  const bodyTypeFilter = (searchParams?.bodyType?? "").trim();
  const difficultyFilter = (searchParams?.difficulty?? "").trim();
  const segmentFilter = (searchParams?.segment?? "").trim();

  // フィルタ用の一意な値リストを抽出
  const makers = Array.from(new Set(all.map((c) => c.maker).filter(Boolean))) as string;
  const bodyTypes = Array.from(new Set(all.map((c) => c.bodyType).filter(Boolean))) as string;
  const difficulties = Array.from(new Set(all.map((c) => c.difficulty).filter(Boolean))) as string;
  const segments = Array.from(new Set(all.map((c) => c.segment).filter(Boolean))) as string;

  // 条件に合致する車種を抽出
  const cars = all.filter((car) => {
    if (q) {
      const haystack =.filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (makerFilter && car.maker!== makerFilter) return false;
    if (bodyTypeFilter && car.bodyType!== bodyTypeFilter) return false;
    if (difficultyFilter && car.difficulty!== difficultyFilter) return false;
    if (segmentFilter && car.segment!== segmentFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-site text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        
        {/* ヘッダーセクション */}
        <header className="mb-12 space-y-4 text-center sm:text-left">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.32em] text-tiffany-600">
              The Collection
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium text-slate-900 sm:text-4xl md:text-5xl">
              Curated <span className="italic text-tiffany-500">Inventory</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="max-w-xl text-xs leading-relaxed text-text-sub sm:text-sm">
              単なるスペックの羅列ではなく、一台一台の「性格」や「付き合い方」まで含めて
              セレクトされたコレクション。気になる条件で絞り込み、あなたに合う物語を探してください。
            </p>
          </Reveal>
        </header>

        {/* フィルターバー (Glassmorphism + Sticky) */}
        <Reveal delay={200}>
          <section className="sticky top-20 z-20 mb-10 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur-md transition-all">
            <form action="/cars" method="get" className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                
                {/* キーワード検索 */}
                <div className="flex-1">
                  <label className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-slate-400">
                    KEYWORDS
                  </label>
                  <div className="relative">
                    <input
                      name="q"
                      defaultValue={searchParams?.q?? ""}
                      placeholder="車名、型式、キーワードで検索..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-tiffany-400 focus:bg-white focus:ring-1 focus:ring-tiffany-200"
                    />
                  </div>
                </div>

                {/* セレクトボックス群 */}
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                  <FilterSelect label="MAKER" name="maker" options={makers} current={makerFilter} />
                  <FilterSelect label="BODY" name="bodyType" options={bodyTypes} current={bodyTypeFilter} />
                  <FilterSelect label="LEVEL" name="difficulty" options={difficulties} current={difficultyFilter} />
                  <FilterSelect label="SEGMENT" name="segment" options={segments} current={segmentFilter} />
                </div>

                {/* 絞り込みボタン */}
                <button
                  type="submit"
                  className="h-[42px] min-w-[100px] rounded-xl bg-slate-900 px-6 text-[10px] font-bold tracking-[0.2em] text-white transition hover:bg-tiffany-600 hover:shadow-soft-strong active:scale-95 lg:w-auto"
                >
                  FILTER
                </button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* Bento Grid 本体 */}
        <section>
           <div className="mb-6 flex items-baseline justify-between border-b border-slate-200/60 pb-2">
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500">
              AVAILABLE MODELS
            </h2>
            <span className="text-[10px] font-medium text-tiffany-600">
              {cars.length} VEHICLES FOUND
            </span>
          </div>

          {cars.length === 0? (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-sm text-slate-500">条件に一致する車種が見つかりませんでした。</p>
              <Link href="/cars" className="mt-4 text-xs font-bold text-tiffany-600 underline underline-offset-4">
                条件をクリアして全件表示
              </Link>
            </div>
          ) : (
            <div className="grid auto-rows-[minmax(320px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, index) => (
                <Reveal key={car.id} delay={index * 50} className={`h-full ${getGridSpanClass(index)}`}>
                  <Link href={`/cars/${car.slug}`} className="group block h-full">
                    <GlassCard 
                      as="article" 
                      padding="none" 
                      interactive 
                      className="flex h-full flex-col justify-between overflow-hidden bg-white"
                    >
                      {/* 画像エリア */}
                      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:flex-1">
                        {/* ホバー時のオーバーレイ効果 */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
                        
                        {car.heroImage |

| car.mainImage? (
                          <Image
                            src={car.heroImage |

| car.mainImage |
| ""}
                            alt={car.name}
                            fill
                            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                            <span className="text-[10px] tracking-widest">NO IMAGE</span>
                          </div>
                        )}

                        {/* フローティングバッジ */}
                        <div className="absolute top-3 right-3 z-20 flex gap-1">
                          {car.difficulty && (
                            <span className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-wider text-white backdrop-blur-md ${
                              car.difficulty === 'advanced'? 'bg-rose-500/80' : 'bg-slate-900/50'
                            }`}>
                              {car.difficulty.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* コンテンツエリア */}
                      <div className="flex flex-col p-5">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-tiffany-600">
                          <span>{car.maker}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                          <span>{car.releaseYear}</span>
                        </div>
                        
                        <h3 className="serif-heading mb-2 text-lg font-medium text-slate-900 transition-colors group-hover:text-tiffany-600">
                          {car.name}
                        </h3>
                        
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {car.summary}
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex gap-2">
                             {car.tags?.slice(0, 2).map(tag => (
                               <span key={tag} className="text-[9px] text-slate-400">#{tag}</span>
                             ))}
                          </div>
                          <span className="flex items-center text-[10px] font-bold tracking-widest text-slate-900 transition-transform group-hover:translate-x-1">
                            VIEW DETAILS →
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// フィルター用セレクトボックスコンポーネント
function FilterSelect({ label, name, options, current }: { label: string, name: string, options: string, current: string }) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-bold tracking-[0.2em] text-slate-400">
        {label}
      </label>
      <select
        name={name}
        defaultValue={current}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-2.5 text-xs text-slate-800 outline-none transition focus:border-tiffany-400 focus:bg-white"
      >
        <option value="">ALL</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
