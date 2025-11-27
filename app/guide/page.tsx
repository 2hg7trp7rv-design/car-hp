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

type GuideTopic = {
  id: string;
  title: string;
  description: string;
  link?: string;
};

type GuideSection = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  icon: string;
  accent?: "default" | "tiffany" | "obsidian" | "glass";
  gridArea?: string;
  topics: GuideTopic[];
};

// 既にファイル内に見えていたセクション情報だけを使用（推測追加なし）
const guideSections: GuideSection[] = [
  {
    id: "money",
    icon: "¥",
    label: "お金と維持費のこと",
    subLabel: "FINANCE & COST",
    description:
      "ローン・残クレ・保険・税金。『総額いくらかかる？』を落ち着いて整理するための実用ノート。",
    accent: "tiffany",
    gridArea: "md:col-span-7 lg:col-span-7 lg:row-span-2",
    topics: [
      {
        id: "loan-plan",
        title: "ローン or 一括、どちらが良い？",
        description:
          "金利だけでなく、出口戦略まで含めて考えるためのチェックポイント。",
      },
      {
        id: "maint-cost",
        title: "維持費シミュレーションの基本",
        description:
          "税金・保険・車検・タイヤ…ざっくり『月いくら』で把握するシンプルな考え方。",
      },
    ],
  },
  {
    id: "sell",
    icon: "↔",
    label: "手放すときの心得",
    subLabel: "SELLING",
    description:
      "乗り換えや売却のときに慌てないために。査定・買取・下取りの違いを静かに整理します。",
    accent: "obsidian",
    gridArea: "md:col-span-5 lg:col-span-5 lg:row-span-2",
    topics: [],
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景装飾レイヤー: メッシュグラデーション */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 h-[50vh] w-full bg-gradient-to-b from-white/80 via-white/40 to-transparent" />
        <div className="absolute -top-[10%] -right-[10%] h-[60vw] w-[60vw] rounded-full bg-tiffany-100/30 blur-[100px]" />
        <div className="absolute bottom-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-slate-200/40 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-16 space-y-6 sm:mb-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-tiffany-600">
                Car Boutique Guide
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="serif-heading text-4xl font-medium leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
              Knowledge as{" "}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-tiffany-500 via-tiffany-600 to-slate-800 bg-clip-text text-transparent">
                Luxury
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-xs font-medium leading-loose text-text-sub sm:text-sm">
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

        {/* Bento Grid */}
        <section className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8">
          {guideSections.map((section, index) => {
            const delay = 300 + index * 100;

            const accentStyles: Record<
              NonNullable<GuideSection["accent"]>,
              string
            > = {
              default: "bg-white/80 border-white/60",
              tiffany:
                "bg-gradient-to-br from-tiffany-50 to-white border-tiffany-100",
              obsidian: "bg-slate-900 border-slate-800 text-white",
              glass: "bg-white/40 backdrop-blur-md border-white/50",
            };

            const accent = section.accent ?? "default";
            const textMainColor =
              accent === "obsidian" ? "text-white" : "text-slate-900";
            const textSubColor =
              accent === "obsidian" ? "text-slate-400" : "text-text-sub";

            return (
              <div
                key={section.id}
                className={section.gridArea ?? "col-span-12"}
              >
                <Reveal delay={delay} className="h-full">
                  <GlassCard
                    as="article"
                    padding="none"
                    interactive
                    className={`
                      group relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8 transition-all duration-500
                      ${accentStyles[accent]}
                    `}
                  >
                    {/* ホバー時の背景エフェクト */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-tiffany-100/20 to-transparent blur-3xl transition-transform duration-700 group-hover:scale-150" />

                    {/* 背景アイコン（巨大透かし） */}
                    <div
                      className={`pointer-events-none absolute -bottom-4 -right-4 select-none text-[120px] font-serif leading-none opacity-5 ${textMainColor}`}
                    >
                      {section.icon}
                    </div>

                    {/* コンテンツ */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                              accent === "obsidian"
                                ? "text-tiffany-400"
                                : "text-tiffany-600"
                            }`}
                          >
                            {section.subLabel}
                          </span>
                          <h2
                            className={`mt-2 serif-heading text-xl font-medium sm:text-2xl ${textMainColor}`}
                          >
                            {section.label}
                          </h2>
                        </div>
                      </div>

                      <p
                        className={`max-w-md text-[11px] leading-relaxed ${textSubColor}`}
                      >
                        {section.description}
                      </p>

                      {section.topics.length > 0 && (
                        <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
                          {section.topics.map((topic) => (
                            <li
                              key={topic.id}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-[6px] h-[3px] w-8 rounded-full bg-tiffany-300" />
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {topic.title}
                                </p>
                                <p className="text-[11px] leading-relaxed text-text-sub">
                                  {topic.description}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </GlassCard>
                </Reveal>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section className="mt-20">
          <Reveal delay={800}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft-strong sm:px-12 sm:py-16">
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
                  特定の車種に関する維持費情報は CARS ページをご覧ください。
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
