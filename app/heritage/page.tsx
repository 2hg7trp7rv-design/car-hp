// app/heritage/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "HERITAGE | ブランドとモデルの系譜 | CAR BOUTIQUE",
  description:
    "名車やブランドの背景、モデルの系譜を静かに眺めるためのHERITAGEエリアです。BMW 5シリーズやGT-Rなど、少しずつ車種を増やしていきます。",
};

type HeritageTimelineItem = {
  id: string;
  era: string;
  title: string;
  summary: string;
  highlight?: string;
  linkHref?: string;
  linkLabel?: string;
};

const timelines: HeritageTimelineItem[] = [
  {
    id: "bmw-5series",
    era: "1972 →",
    title: "BMW 5シリーズの系譜",
    summary:
      "初代E12から現行型に至るまで、『ビジネスセダン』と『ドライバーズカー』のバランスを追い続けてきた5シリーズ。G30は、その中でも静粛性とスポーティさのバランスが洗練された世代です。",
    highlight: "E39・E60・F10・G30の4世代比較なども、将来的に整理予定。",
    linkHref: "/cars/bmw-530i-g30",
    linkLabel: "BMW 530i G30の詳細を見る",
  },
  {
    id: "japan-gt-r",
    era: "1969 →",
    title: "SKYLINE GT-Rと『GT-R』バッジの物語",
    summary:
      "初代ハコスカからR32・R33・R34、そしてR35へ。レースで勝つために生まれたホモロゲーションモデルが、いつしか日本を代表する夢のスポーツカーになっていくプロセスをたどります。",
    highlight: "まずはBNR32のページから、少しずつストーリーを追加予定。",
    linkHref: "/cars/nissan-skyline-gt-r-bnr32",
    linkLabel: "BNR32の詳細を見る",
  },
  {
    id: "urban-suv",
    era: "2000s →",
    title: "都市型SUVというジャンルの成長",
    summary:
      "『背の高いセダン』のような存在だった初期のクロスオーバーから、ライフスタイルを映し出すプロダクトへ。トヨタ ハリアーは、その流れを日本で象徴するモデルのひとつです。",
    highlight: "80系ハリアーを軸に、デザインと快適性の変遷を整理していきます。",
    linkHref: "/cars/toyota-harrier-80",
    linkLabel: "80系ハリアーの詳細を見る",
  },
];

export default function HeritagePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヘッダー */}
      <header className="mb-8 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          HERITAGE
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ブランドとモデルの系譜
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          カタログスペックや最新ニュースから少し離れて、
          「このモデルにはどういう背景があるのか」
          「このブランドは何を大切にしてきたのか」
          を静かに眺めるためのエリアです。
        </p>
      </header>

      {/* 概要カード */}
      <section className="mb-8">
        <GlassCard className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              CONCEPT
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
              HERITAGEでは、年表のような「事実の羅列」だけでなく、
              その時代の空気感やオーナーの視点も含めて、
              少し長いスパンでクルマを眺めていくことを目指します。
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-text-sub">
              まずはBMW 5シリーズ、GT-R、都市型SUVなど、
              いくつかの軸からゆっくりと範囲を広げていきます。
            </p>
          </div>
          <div className="space-y-2 text-[11px] text-text-sub">
            <p className="font-semibold text-slate-700">
              このエリアで今後やりたいこと
            </p>
            <ul className="space-y-1">
              <li>・世代ごとの「キャラクターの違い」の整理</li>
              <li>・主要トピックごとの簡易年表</li>
              <li>・CARS・COLUMN・NEWSとの横断リンク</li>
            </ul>
          </div>
        </GlassCard>
      </section>

      {/* タイムライン的カード群 */}
      <section className="space-y-4">
        {timelines.map((item) => (
          <GlassCard
            key={item.id}
            as="article"
            interactive
            className="flex flex-col gap-3 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                HERITAGE LINE
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-[10px]">
                {item.era}
              </span>
            </div>

            <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
              {item.title}
            </h2>

            <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
              {item.summary}
            </p>

            {item.highlight && (
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {item.highlight}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {item.linkHref && item.linkLabel && (
                <Link
                  href={item.linkHref}
                  className="rounded-full border border-tiffany-400/70 bg-white/80 px-4 py-1.5 font-medium text-tiffany-700 hover:bg-white"
                >
                  {item.linkLabel}
                </Link>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                CARS / COLUMN / NEWS と連携予定
              </span>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* フッターノート */}
      <section className="mt-10">
        <GlassCard className="p-4 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
            NOTE
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-[13px]">
            HERITAGEのコンテンツは、CARSページやコラム、ニュースとリンクしながら、
            長い時間軸で少しずつ厚みを増やしていく予定です。
            まずは今登録している車種の系譜から、静かに整えていきます。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
