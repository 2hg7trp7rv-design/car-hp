// app/heritage/page.tsx
import type { Metadata } from "next";
// import Image from "next/image"; // 画像アセットがある場合に有効化
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "HERITAGE | The Timeline",
  description: "名車たちが紡いできた歴史の系譜。技術と哲学の進化を辿る旅。",
};

// タイムラインデータの型定義
type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  image?: string;
  tags: string;
};

// モックデータ: 将来的にはCMSまたはJSONから取得
const TIMELINE_DATA: TimelineEvent =,
    // image: "/images/heritage/e12.jpg"
  },
  {
    year: "1989",
    title: "Godzilla Awakens (BNR32)",
    description: "16年の沈黙を破り、GT-Rのバッジが復活。R32型スカイラインGT-RはグループAレースで無敗の記録を打ち立て、世界にその名を轟かせた。",
    tags:,
    // image: "/images/heritage/r32.jpg"
  },
  {
    year: "1997",
    title: "Hybrid Revolution (Prius)",
    description: "トヨタが世界初の量産ハイブリッド乗用車「プリウス」を発売。「21世紀に間に合いました」というキャッチコピーと共に、パワートレーンの歴史を変えた。",
    tags:,
  },
  {
    year: "2017",
    title: "Digital Maturity (G30)",
    description: "第7世代5シリーズが登場。高度な運転支援システムと軽量化技術を融合させ、走りの楽しさと快適性をかつてない次元で両立させた。",
    tags:,
    // image: "/images/heritage/g30.jpg"
  }
];

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-site pb-24 pt-24">
      {/* イントロダクション */}
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="serif-heading mb-4 text-4xl text-slate-900 md:text-5xl">
            Lineage & <span className="italic text-tiffany-500">Legacy</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
            現代のクルマを知ることは、その祖先を知ること。
            エンジニアたちの情熱と技術革新が織りなす、終わりのない進化の物語。
          </p>
        </Reveal>
      </div>

      {/* タイムラインコンテナ */}
      <div className="relative mx-auto mt-20 max-w-5xl px-4 sm:px-6">
        
        {/* 中央線 - Tiffany Blueのグラデーション */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-tiffany-300 to-transparent md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-24">
          {TIMELINE_DATA.map((item, index) => {
            // 偶数・奇数でレイアウトを左右反転させる
            const isEven = index % 2 === 0;
            return (
              <Reveal key={index} className="relative">
                <div className={`flex flex-col md:flex-row md:items-center ${isEven? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* デスクトップレイアウトのバランス用スペーサー */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* タイムラインノード (点) */}
                  <div className="absolute left-4 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-tiffany-500 shadow-soft md:left-1/2 md:top-1/2 md:-translate-y-1/2">
                     <div className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  {/* コンテンツカード */}
                  <div className={`pl-12 md:w-1/2 md:pl-0 ${isEven? 'md:pr-16' : 'md:pl-16'}`}>
                    <GlassCard className="group relative overflow-hidden transition-colors hover:bg-white">
                      
                      {/* 年号バッジ */}
                      <span className="mb-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-widest text-slate-600">
                        {item.year}
                      </span>

                      {/* 画像エリア (アセットがあれば表示) */}
                      {item.image && (
                         <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-slate-200">
                           {/* プレースホルダー表示 */}
                           <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                             <span className="text-xs tracking-widest">ARCHIVE PHOTO</span>
                           </div>
                           {/* 
                           <Image src={item.image} alt={item.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                           */}
                         </div>
                      )}

                      <h3 className="serif-heading mb-2 text-xl text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-xs leading-relaxed text-slate-600">
                        {item.description}
                      </p>

                      <div className="flex gap-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-medium uppercase tracking-wider text-tiffany-600">
                            #{tag}
                          </span>
                        ))}
                      </div>

                    </GlassCard>
                  </div>

                </div>
              </Reveal>
            );
          })}
        </div>

        {/* タイムライン終端 */}
        <div className="mt-24 text-center">
           <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
             <span className="text-xl">↓</span>
           </div>
           <p className="mt-4 text-[10px] tracking-widest text-slate-400">HISTORY CONTINUES</p>
        </div>

      </div>
    </main>
  );
}
