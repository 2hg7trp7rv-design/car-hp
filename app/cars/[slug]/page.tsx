// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCarBySlug, getAllCars } from "@/lib/cars";
import { getLatestNews } from "@/lib/news";
import { getAllColumns } from "@/lib/columns";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { CompareSlider } from "@/components/car/CompareSlider"; 

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return { title: "Not Found | CAR BOUTIQUE" };
  return {
    title: `${car.name} | Specifications & Story`,
    description: car.summary,
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  // 関連データの並列取得
  const [allCars, latestNews, allColumns] = await Promise.all([
    getAllCars(),
    getLatestNews(50),
    getAllColumns()
  ]);

  // 関連車種の抽出（同じメーカーまたは同じセグメント）
  const relatedCars = allCars
   .filter(c => c.slug!== car.slug && (c.maker === car.maker |

| c.segment === car.segment))
   .slice(0, 3);

  // 関連コンテンツのマッチング（メーカー名やタグをキーワードとして使用）
  const keywords = [car.maker, car.name.split(' '),...(car.tags ||)];
  
  const relatedNews = latestNews.filter(n => 
    keywords.some(k => (n.title + (n.titleJa||"")).toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 3);

  const relatedColumns = allColumns.filter(c =>
    keywords.some(k => (c.title + c.summary).toLowerCase().includes(k.toLowerCase()))
  ).slice(0, 2);

  return (
    <main className="min-h-screen bg-site text-slate-900 pb-20">
      
      {/* 1. ヒーローセクション: 没入型フルワイド画像 */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={car.heroImage |

| car.mainImage |
| "/images/placeholder-car.jpg"}
            alt={car.name}
            fill
            className="object-cover"
            priority
          />
          {/* 画像上のテキスト可読性を確保するグラデーションオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/20 to-slate-900/30" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
          <Reveal>
            <div className="mx-auto max-w-7xl">
              <span className="mb-4 inline-block rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold tracking-widest text-white backdrop-blur-md">
                {car.maker} / {car.releaseYear}
              </span>
              <h1 className="serif-heading text-4xl text-slate-900 drop-shadow-sm sm:text-5xl md:text-6xl">
                {car.name}
              </h1>
              {car.grade && (
                <p className="mt-2 text-lg font-light tracking-wide text-slate-700">
                  {car.grade}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          
          {/* 左カラム: メインコンテンツ */}
          <div className="space-y-16">
            
            {/* ストーリー & 性格解説 */}
            <Reveal delay={100}>
               <h2 className="mb-6 text-xs font-bold tracking-[0.25em] text-slate-400">CHARACTER</h2>
               <p className="text-lg font-light leading-relaxed text-slate-800 sm:text-xl">
                 {car.summaryLong |

| car.summary}
               </p>
            </Reveal>

            {/* インタラクティブ比較スライダー */}
            <Reveal delay={200}>
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                   <h2 className="text-xs font-bold tracking-[0.25em] text-slate-400">VISUAL ANALYSIS</h2>
                   <p className="text-[10px] text-tiffany-600">DRAG TO COMPARE</p>
                </div>
                {/* 
                  注: 実際の運用ではJSONに `imageExterior` `imageInterior` などのフィールドを追加し、
                  ここで出し分けることが望ましい。現状は同じ画像をプレースホルダーとして使用し、
                  スライダーの動作確認を行う構成としている。
                */}
                <CompareSlider 
                  beforeImage={car.heroImage |

| ""} 
                  beforeLabel="EXTERIOR / FORM"
                  afterImage={car.mainImage |

| car.heroImage |
| ""} 
                  afterLabel="CONTEXT / DETAIL"
                  className="aspect-[16/9]"
                />
                <p className="text-[11px] italic text-slate-500">
                  * スライダーを操作して、デザインの細部や新旧の違いを確認できます。
                </p>
              </div>
            </Reveal>

            {/* スペック詳細グリッド */}
            <Reveal delay={300}>
              <h2 className="mb-6 text-xs font-bold tracking-[0.25em] text-slate-400">TECHNICAL DATA</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <GlassCard className="space-y-4">
                   <h3 className="border-b border-slate-100 pb-2 text-[10px] font-bold tracking-widest text-tiffany-600">POWERTRAIN</h3>
                   <dl className="space-y-3 text-xs">
                     <SpecItem label="Engine" value={car.engine} />
                     <SpecItem label="Power" value={car.powerPs? `${car.powerPs} PS` : undefined} />
                     <SpecItem label="Torque" value={car.torqueNm? `${car.torqueNm} Nm` : undefined} />
                     <SpecItem label="Transmission" value={car.transmission} />
                     <SpecItem label="Drive" value={car.drive} />
                   </dl>
                </GlassCard>

                <GlassCard className="space-y-4">
                   <h3 className="border-b border-slate-100 pb-2 text-[10px] font-bold tracking-widest text-tiffany-600">DIMENSIONS & RUNNING</h3>
                   <dl className="space-y-3 text-xs">
                     <SpecItem label="Length" value={car.lengthMm? `${car.lengthMm} mm` : undefined} />
                     <SpecItem label="Width" value={car.widthMm? `${car.widthMm} mm` : undefined} />
                     <SpecItem label="Weight" value={car.weightKg? `${car.weightKg} kg` : undefined} />
                     <SpecItem label="Fuel Economy" value={car.fuelEconomy} />
                     <SpecItem label="New Price" value={car.priceNew} />
                   </dl>
                </GlassCard>
              </div>
            </Reveal>

            {/* 関連コラム (リッチコンテンツ統合) */}
            {relatedColumns.length > 0 && (
              <Reveal delay={400}>
                 <h2 className="mb-6 text-xs font-bold tracking-[0.25em] text-slate-400">OWNERSHIP STORIES</h2>
                 <div className="grid gap-4 sm:grid-cols-2">
                    {relatedColumns.map(col => (
                      <Link key={col.id} href={`/column/${col.slug}`} className="group">
                        <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-soft-card">
                           <span className="mb-2 block text-[9px] font-bold tracking-widest text-tiffany-500">{col.category}</span>
                           <h3 className="font-serif mb-2 text-lg leading-tight text-slate-900 transition-colors group-hover:text-tiffany-600">{col.title}</h3>
                           <p className="line-clamp-3 text-xs text-slate-500">{col.summary}</p>
                        </article>
                      </Link>
                    ))}
                 </div>
              </Reveal>
            )}
          </div>

          {/* 右カラム: サイドバー / Sticky */}
          <aside className="space-y-8">
            {/* サマリー & アクションカード */}
            <div className="sticky top-24 space-y-6">
              <GlassCard padding="lg" className="border-t-4 border-t-tiffany-400 bg-white/90">
                 <h3 className="mb-1 text-xs font-bold tracking-widest text-slate-400">VERDICT</h3>
                 <div className="serif-heading mb-4 text-3xl font-medium text-slate-900">
                   {car.difficulty === 'basic'? 'Beginner Friendly' : 
                    car.difficulty === 'advanced'? 'Enthusiast Only' : 'Standard Choice'}
                 </div>
                 <p className="mb-6 text-xs leading-relaxed text-slate-600">
                   維持費の目安、信頼性データ、運転の難易度に基づいた判定です。
                 </p>
                 <div className="flex flex-col gap-2">
                   <button className="flex w-full items-center justify-center rounded-full bg-slate-900 py-3 text-[10px] font-bold tracking-[0.2em] text-white transition hover:bg-tiffany-600">
                     市場価格を調べる
                   </button>
                   <Link href="/guide" className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-transparent py-3 text-[10px] font-bold tracking-[0.2em] text-slate-600 transition hover:bg-slate-50">
                     購入ガイドを見る
                   </Link>
                 </div>
              </GlassCard>

              {/* 関連ニュースウィジェット */}
              {relatedNews.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <h3 className="mb-4 text-[10px] font-bold tracking-widest text-slate-400">LATEST NEWS</h3>
                  <ul className="space-y-4">
                    {relatedNews.map(news => (
                      <li key={news.id}>
                        <Link href={`/news/${news.id}`} className="group block">
                          <span className="text-[9px] text-slate-400">{news.publishedAt?.split('T')}</span>
                          <h4 className="mt-0.5 text-xs font-medium text-slate-800 transition-colors group-hover:text-tiffany-600">
                            {news.titleJa |

| news.title}
                          </h4>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

// スペック表示用ヘルパー
function SpecItem({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
