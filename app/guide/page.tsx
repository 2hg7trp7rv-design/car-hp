// app/guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "GUIDE | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険・税金など、クルマとの付き合い方を整理するための実用ガイド集です。",
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

// 実ガイド記事へのリンク付きセクション（実用トーン）
const guideSections: GuideSection[] = [
  {
    id: "money",
    icon: "¥",
    label: "お金と維持費のこと",
    subLabel: "FINANCE & COST",
    description:
      "ローン、残価設定ローン、保険、税金など、クルマにかかる費用の全体像を整理するためのガイドです。",
    accent: "tiffany",
    gridArea: "md:col-span-7 lg:col-span-7 lg:row-span-2",
    topics: [
      {
        id: "loan-or-lump-sum",
        title: "ローン or 一括、どちらが良い？",
        description:
          "金利・返済期間・売却タイミングなどを比較しながら検討するための基本的なチェックポイント。",
        link: "/guide/loan-or-lump-sum",
      },
      {
        id: "maintenance-cost-simulation",
        title: "維持費シミュレーションの基本",
        description:
          "税金、保険、車検、タイヤなどを「月いくら」の目安で把握するためのシンプルな考え方。",
        link: "/guide/maintenance-cost-simulation",
      },
    ],
  },
  {
    id: "sell",
    icon: "↔",
    label: "手放すときのポイント",
    subLabel: "SELLING",
    description:
      "乗り換えや売却を検討するときに確認しておきたい、査定・買取・下取りの違いや注意点をまとめます。",
    accent: "obsidian",
    gridArea: "md:col-span-5 lg:col-span-5 lg:row-span-2",
    topics: [
      {
        id: "selling-without-rush",
        title: "『急いで売らない』ための段取り",
        description:
          "下取り、買取、個人売買の特徴とメリット・デメリットを整理し、スケジュールに余裕を持たせるための基本的な手順。",
        link: "/guide/selling-without-rush",
      },
    ],
  },
];

export default function GuidePage() {
  const totalTopics = guideSections.reduce(
    (sum, section) => sum + section.topics.length,
    0,
  );

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* --- 背景：Tiffanyメッシュ + ラジアル光源 --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* 上層のホワイトレイヤー（紙のトーン） */}
        <div className="absolute left-0 top-0 h-[50vh] w-full bg-gradient-to-b from-white/90 via-white/60 to-transparent" />
        {/* 左上 Tiffany 光 */}
        <div className="absolute -left-[18%] -top-[18%] h-[52vw] w-[52vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.22),_transparent_70%)] blur-[110px]" />
        {/* 右下 Obsidian 系の落ち着いた光 */}
        <div className="absolute bottom-[-20%] -right-[18%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.25),_transparent_75%)] blur-[110px]" />
        {/* うっすらノイズ */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">GUIDE</span>
        </nav>

        {/* --- ヘッダー --- */}
        <header className="mb-16 space-y-6 sm:mb-20 lg:mb-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-tiffany-600">
                CAR BOUTIQUE GUIDE
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="serif-heading text-4xl font-medium leading-[1.1] text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              買い方・維持費・売却を
              <br className="hidden sm:block" />
              落ち着いて整理するためのガイド
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-xs font-medium leading-loose text-text-sub sm:text-sm">
                クルマを「買う・維持する・手放す」ときに必要になる、お金や手続きまわりの情報を
                小さな読み物としてまとめたエリアです。具体的な金額の目安というよりも、
                「どこから考え始めると楽か」を整理するための道しるべとして使えることを目指しています。
              </p>

              {/* 関連コンテンツへの導線（Glassボタン） */}
              <div className="flex flex-col items-start gap-3 text-[11px] sm:items-end">
                <Button
                  asChild
                  variant="glass"
                  size="sm"
                  magnetic
                  className="rounded-full px-5 py-2 tracking-[0.2em]"
                >
                  <Link href="/column">VIEW COLUMNS</Link>
                </Button>
                <p className="max-w-xs text-[10px] leading-relaxed text-slate-500">
                  実際のトラブル事例や、ブランド・技術の背景は COLUMN セクションで少しずつ掘り下げています。
                </p>
              </div>
            </div>
          </Reveal>

          {/* --- GUIDE ナビ（セクション内アンカー） --- */}
          <Reveal delay={260}>
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                  GUIDE NAV
                </span>
                <span className="hidden text-[10px] tracking-[0.12em] text-slate-500 sm:inline">
                  全 {totalTopics} 本のガイドを、テーマ別に整理しています。
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {guideSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 tracking-[0.16em] text-slate-700 transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                    <span>{section.subLabel}</span>
                    <span className="text-[9px] text-slate-400">
                      ({section.topics.length})
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </header>

        {/* --- Bento Grid 本体 --- */}
        <section className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8">
          {guideSections.map((section, index) => {
            const delay = 320 + index * 120;

            const accentStyles: Record<
              NonNullable<GuideSection["accent"]>,
              string
            > = {
              default: "bg-white/80 border-white/60",
              tiffany:
                "bg-gradient-to-br from-tiffany-50 to-white border-tiffany-100",
              obsidian:
                "bg-slate-900 border-slate-800 text-white shadow-soft-strong",
              glass: "bg-white/40 backdrop-blur-md border-white/50",
            };

            const accent = section.accent ?? "default";
            const textMainColor =
              accent === "obsidian" ? "text-white" : "text-slate-900";
            const textSubColor =
              accent === "obsidian" ? "text-slate-300" : "text-text-sub";

            return (
              <div
                key={section.id}
                id={section.id}
                className={section.gridArea ?? "md:col-span-6"}
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
                    {/* ホバー時の光のにじみ */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-24 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.25),_transparent_65%)] blur-3xl" />
                    </div>

                    {/* 背景アイコン（巨大透かし） */}
                    <div
                      className={`pointer-events-none absolute -bottom-4 -right-4 select-none text-[120px] font-serif leading-none opacity-[0.05] sm:text-[150px] ${textMainColor}`}
                    >
                      {section.icon}
                    </div>

                    {/* コンテンツ */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                              accent === "obsidian"
                                ? "text-tiffany-300"
                                : "text-tiffany-700"
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
                        {/* セクション内の件数バッジ */}
                        <span
                          className={`hidden rounded-full px-3 py-1 text-[10px] tracking-[0.16em] sm:inline-flex ${
                            accent === "obsidian"
                              ? "bg-white/10 text-slate-100"
                              : "bg-white/70 text-slate-600"
                          }`}
                        >
                          {section.topics.length} GUIDES
                        </span>
                      </div>

                      <p
                        className={`max-w-md text-[11px] leading-relaxed ${textSubColor}`}
                      >
                        {section.description}
                      </p>

                      {/* トピックリスト */}
                      {section.topics.length > 0 && (
                        <ul className="mt-4 space-y-3 text-[11px]">
                          {section.topics.map((topic, topicIndex) => {
                            const content = (
                              <>
                                <div className="mb-0.5 flex items-center gap-2">
                                  <span className="text-[9px] tracking-[0.18em] text-slate-400">
                                    STEP {topicIndex + 1}
                                  </span>
                                  <p
                                    className={`font-semibold ${
                                      accent === "obsidian"
                                        ? "text-slate-50"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {topic.title}
                                  </p>
                                </div>
                                <p
                                  className={`text-[11px] leading-relaxed ${
                                    accent === "obsidian"
                                      ? "text-slate-300"
                                      : "text-text-sub"
                                  }`}
                                >
                                  {topic.description}
                                </p>
                              </>
                            );

                            return (
                              <li
                                key={topic.id}
                                className="flex items-start gap-2"
                              >
                                <span
                                  className={`mt-[7px] h-[3px] w-8 rounded-full ${
                                    accent === "obsidian"
                                      ? "bg-tiffany-400/80"
                                      : "bg-tiffany-300"
                                  }`}
                                />
                                <div>
                                  {topic.link ? (
                                    <Link
                                      href={topic.link}
                                      className="group/link inline-block"
                                    >
                                      <div className="inline-flex items-end gap-1">
                                        <span className="relative">
                                          {/* 下線アニメーション */}
                                          <span className="absolute -bottom-0.5 left-0 h-[1px] w-full origin-left scale-x-0 bg-tiffany-400 transition-transform duration-300 group-hover/link:scale-x-100" />
                                          <span className="relative">
                                            {content}
                                          </span>
                                        </span>
                                        <span
                                          className={`mb-0.5 text-[9px] ${
                                            accent === "obsidian"
                                              ? "text-tiffany-300"
                                              : "text-tiffany-500"
                                          }`}
                                        >
                                          → READ GUIDE
                                        </span>
                                      </div>
                                    </Link>
                                  ) : (
                                    content
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </GlassCard>
                </Reveal>
              </div>
            );
          })}
        </section>

        {/* --- 下部 CTA：ガイドと他コンテンツの関係性を説明 --- */}
        <section className="mt-24 lg:mt-28">
          <Reveal delay={800}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft-strong sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(10,186,181,0.36),_transparent_60%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.85),_transparent_65%)]" />
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04]" />

              <div className="relative z-10 flex flex-col items-center">
                <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                  INFORMATION
                </span>
                <h3 className="serif-heading mb-6 text-2xl text-white sm:text-3xl">
                  ガイドと、ニュース / コラム / 車種ページのつながり
                </h3>
                <p className="mx-auto mb-8 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
                  ここで扱うのは「お金や段取りの全体像」の部分です。
                  実際のトラブル事例や、ブランドごとの考え方、車種ごとの維持難易度は
                  NEWS・COLUMN・CARS の各ページで少しずつ補っていくイメージになっています。
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    variant="primary"
                    size="sm"
                    magnetic
                    className="min-w-[160px] rounded-full px-6 py-3 text-[11px] tracking-[0.18em]"
                  >
                    <Link href="/cars">CAR DATABASE</Link>
                  </Button>
                  <Button
                    asChild
                    variant="glass"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-white/30 bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-100 backdrop-blur-sm hover:bg-white/10"
                  >
                    <Link href="/column">READ COLUMNS</Link>
                  </Button>
                  <Button
                    asChild
                    variant="subtle"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-white/10 bg-transparent px-6 py-3 text-[11px] tracking-[0.18em] text-slate-200 hover:bg-white/5"
                  >
                    <Link href="/news">NEWS FEED</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
