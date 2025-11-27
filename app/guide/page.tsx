// app/guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "GUIDE | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険・お金の話など、クルマとの暮らしを少し楽にする実用ガイドコレクション。",
};

/**
 * ガイドの各トピック定義
 * デザイン上のアクセントやグリッドの占有率（col-span/row-span）をここで管理する
 */
type GuideTopic = {
  title: string;
  desc: string;
};

type GuideSection = {
  id: string;
  label: string;
  subLabel: string; // 英語表記のサブタイトル
  description: string;
  topics: GuideTopic;
  // Bento Grid用の配置設定 (Tailwindクラス)
  gridArea?: string; 
  // カードの背景アクセントタイプ
  accent?: "default" | "tiffany" | "obsidian" | "glass";
  // アイコン（装飾用）
  icon?: string;
};

const guideSections: GuideSection =,
  },
  {
    id: "money",
    label: "維持費とお金",
    subLabel: "FINANCE & COST",
    description: "税金、保険、車検。現実的な数字と向き合い、無理のないカーライフを設計する。",
    gridArea: "md:col-span-6 lg:col-span-4 lg:row-span-1",
    accent: "tiffany",
    icon: "¥",
    topics: [
      { title: "維持費の隠れた内訳", desc: "所有するだけでかかるコスト" },
      { title: "任意保険の最適化", desc: "補償内容の無駄を削ぎ落とす" },
    ],
  },
  {
    id: "sell",
    label: "手放す作法",
    subLabel: "SELLING",
    description: "愛車への最後の敬意として、その価値を最大化する売却のタイミングと方法。",
    gridArea: "md:col-span-6 lg:col-span-4 lg:row-span-1",
    accent: "glass",
    icon: "↗",
    topics: [
      { title: "高値売却のタイミング", desc: "走行距離と年式の境界線" },
      { title: "下取り vs 買取専門店", desc: "手間と金額のバランスシート" },
    ],
  },
  {
    id: "trouble",
    label: "トラブル対応",
    subLabel: "TROUBLE & REPAIR",
    description: "予期せぬ故障や事故。その時、慌てずに冷静に動くための初動対応マニュアル。",
    gridArea: "md:col-span-12 lg:col-span-6 lg:row-span-1",
    accent: "obsidian",
    icon: "!",
    topics: [
      { title: "警告灯の意味", desc: "点灯した瞬間の判断基準" },
      { title: "修理工場の選び方", desc: "ディーラーか、専門ショップか" },
      { title: "保証と保険の使い分け", desc: "修理費を抑えるための知恵" },
    ],
  },
  {
    id: "life",
    label: "クルマとの暮らし",
    subLabel: "CAR LIFE",
    description: "保管、洗車、日々のケア。愛車と長く、美しく付き合うためのルーティン。",
    gridArea: "md:col-span-12 lg:col-span-6 lg:row-span-1",
    accent: "default",
    icon: "∞",
    topics: [
      { title: "駐車場選びの極意", desc: "屋根の有無が査定に響く理由" },
      { title: "コーティングの必要性", desc: "美観維持と資産価値の保護" },
      { title: "タイヤの寿命と選び方", desc: "乗り心地を変える靴の選び方" },
    ],
  },
];

export default function GuideIndexPage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景装飾レイヤー: メッシュグラデーション */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-white/80 via-white/40 to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-tiffany-100/30 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-slate-200/40 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* ヘッダーセクション */}
        <header className="mb-16 space-y-6 sm:mb-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600 uppercase">
                Car Boutique Guide
              </p>
            </div>
          </Reveal>
          
          <Reveal delay={100}>
            <h1 className="serif-heading text-4xl font-medium leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Knowledge as <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-tiffany-500 via-tiffany-600 to-slate-800 bg-clip-text text-transparent">
                Luxury
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-xs leading-loose text-text-sub sm:text-sm font-medium">
                所有の喜びは、知ることから深まります。選び方から維持、そして手放す瞬間まで。
                <br />
                賢く美しいカーライフのための、実用的な知恵をアンソロジー形式で。
              </p>
              
              {/* 関連リンクへの誘導 */}
              <Link 
                href="/column"
                className="group flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-slate-800 transition-colors hover:text-tiffany-600"
              >
                <span>READ COLUMNS</span>
                <span className="block h-[1px] w-8 bg-slate-300 transition-all group-hover:w-12 group-hover:bg-tiffany-400" />
              </Link>
            </div>
          </Reveal>
        </header>

        {/* Bento Grid Layout */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8 auto-rows-min">
          {guideSections.map((section, index) => {
            // Staggerアニメーション用のディレイ計算
            // indexが増えるごとに少しずつ遅らせる (Base 300ms + 100ms * index)
            const delay = 300 + index * 100;

            // アクセントに応じたスタイル定義
            const accentStyles = {
              default: "bg-white/80 border-white/60",
              tiffany: "bg-gradient-to-br from-tiffany-50 to-white border-tiffany-100",
              obsidian: "bg-slate-900 border-slate-800 text-white",
              glass: "bg-white/40 backdrop-blur-md border-white/50",
            };

            const textMainColor = section.accent === "obsidian"? "text-white" : "text-slate-900";
            const textSubColor = section.accent === "obsidian"? "text-slate-400" : "text-text-sub";
            const iconColor = section.accent === "obsidian"? "text-tiffany-400" : "text-tiffany-200";

            return (
              <div
                key={section.id}
                className={`${section.gridArea |

| "col-span-12"}`}
              >
                <Reveal delay={delay} className="h-full">
                  <GlassCard
                    as="article"
                    padding="none"
                    interactive
                    className={`
                      group relative h-full flex flex-col justify-between overflow-hidden p-6 sm:p-8 transition-all duration-500
                      ${accentStyles[section.accent |

| "default"]}
                    `}
                  >
                    {/* ホバー時の背景エフェクト */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-tiffany-100/20 to-transparent blur-3xl transition-transform duration-700 group-hover:scale-150" />
                    
                    {/* 背景アイコン（巨大透かし） */}
                    <div className={`absolute -bottom-4 -right-4 text-[120px] font-serif leading-none opacity-5 select-none ${textMainColor}`}>
                      {section.icon}
                    </div>

                    {/* コンテンツ上部 */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className={`text-[10px] font-bold tracking-[0.22em] uppercase ${section.accent === "obsidian"? "text-tiffany-400" : "text-tiffany-600"}`}>
                            {section.subLabel}
                           </span>
                           <h2 className={`mt-2 serif-heading text-xl sm:text-2xl font-medium ${textMainColor}`}>
                             {section.label}
                           </h2>
                        </div>
                        {/* 矢印アイコン */}
                        <span className={`transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 ${textSubColor}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${textSubColor} max-w-[90%]`}>
                        {section.description}
                      </p>
                    </div>

                    {/* トピックリスト */}
                    <div className="relative z-10 mt-8 pt-8 border-t border-dashed border-current opacity-80" style={{ borderColor: section.accent === 'obsidian'? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                      <ul className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-2">
                        {section.topics.map((topic) => (
                          <li key={topic.title} className="flex flex-col gap-1">
                            <span className={`text-[11px] font-bold tracking-wide ${textMainColor}`}>
                              {topic.title}
                            </span>
                            <span className={`text-[10px] ${textSubColor}`}>
                              {topic.desc}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* View More Indication */}
                      <div className={`mt-6 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase transition-opacity opacity-0 group-hover:opacity-100 ${textMainColor}`}>
                        <span>View Details</span>
                        <span className="block h-[1px] w-4 bg-current" />
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              </div>
            );
          })}
        </section>

        {/* CTA セクション */}
        <section className="mt-20">
            <Reveal delay={800}>
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft-strong sm:px-12 sm:py-16">
                     {/* 背景エフェクト */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-tiffany-900/40 via-slate-900 to-slate-900" />
                     <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03]" />
                     
                     <div className="relative z-10 flex flex-col items-center">
                        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                            NEXT STEP
                        </span>
                        <h3 className="serif-heading mb-6 text-2xl text-white sm:text-3xl">
                            Curated for Owners
                        </h3>
                        <p className="mx-auto mb-8 max-w-lg text-xs leading-relaxed text-slate-400 sm:text-sm">
                            各ガイドの詳細は、コラムセクションの記事と連動して随時アップデートされます。
                            特定の車種に関する維持費情報はCARSページをご覧ください。
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/column"
                                className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-bold tracking-[0.16em] text-slate-900 transition-transform hover:scale-105 active:scale-95"
                            >
                                COLUMN LIST
                            </Link>
                            <Link
                                href="/cars"
                                className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                            >
                                CAR DATABASE
                            </Link>
                        </div>
                     </div>
                </div>
            </Reveal>
        </section>
      </div>
    </main>
  );
}
