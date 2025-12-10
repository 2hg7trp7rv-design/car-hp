// components/home/HeroSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

type HeroStats = {
  carsCount: number;
  columnsCount: number;
  newsCount: number;
  guidesCount: number;
  heritageCount: number;
};

type HeroSectionProps = {
  stats?: HeroStats;
};

type HoverBlock = "news" | "columns" | "guide" | "cars" | null;

/**
 * TOPページのヒーローセクション
 * - 左: キャッチコピー/概要/CTA
 * - 右: NEWS/COLUMN/GUIDE/CARSへのBentoダッシュボード
 * - 背景: セダン写真＋Tiffany系グラデーション
 */
export function HeroSection({ stats }: HeroSectionProps) {
  const [hoveredBlock, setHoveredBlock] = useState<HoverBlock>(null);

  return (
    <section
      aria-label="CAR BOUTIQUE トップコンテンツ概要"
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      {/* 背景レイヤー：セダン画像 + ティファニーブルー系グラデーション */}
      <div aria-hidden="true" className="absolute inset-0">
        {/* セダン写真 */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-sedan.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
        </div>

        {/* グラデーションレイヤー */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,216,208,0.35),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(15,23,42,0.6),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(10,186,181,0.4),transparent_55%)]" />

        {/* ハイライト＋トーン調整 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.3),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.45),transparent_60%)]" />

        {/* 最後に暗めのオーバーレイを重ねて文字の視認性を確保 */}
        <div className="absolute inset-0 bg-slate-950/55" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-14 sm:gap-14 sm:px-6 sm:pb-20 sm:pt-16 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        {/* 左側：キャッチコピー + CTA */}
        <div className="relative z-10 max-w-xl text-white">
          {/* ラベル行 */}
          <Reveal delay={60}>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] text-slate-100/80">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                CAR BOUTIQUE
              </span>
              <span className="hidden h-[1px] w-6 bg-slate-300/70 sm:inline-block" />
              <span className="hidden text-slate-200/75 sm:inline">
                NEWS·COLUMNS·CAR DATABASE·GUIDE·HERITAGE
              </span>
            </div>
          </Reveal>

          {/* 見出し */}
          <Reveal delay={160}>
            <h1 className="serif-heading mt-4 text-[1.7rem] font-semibold leading-tight text-white sm:text-[2.1rem] lg:text-[2.5rem]">
              車のニュースと本音を
              <br className="hidden sm:block" />
              落ち着いて整理できる小さなサイト
            </h1>
          </Reveal>

          {/* リード文 */}
          <Reveal delay={260}>
            <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-slate-200/90 sm:text-[13px]">
              新車情報
              よくあるトラブルやメンテナンスの話
              気になる車種のスペックや維持のしやすさ
              <br />
              <br />
              クルマを検討するときに必要な情報を
              一度ここでざっくり整理してから
              メーカーサイトや他のメディアを見に行く前提のサイトです。
            </p>
          </Reveal>

          {/* CTAボタン群 */}
          <Reveal delay={380}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/cars" aria-label="車種データベースを見る">
                <Button variant="primary" size="lg" magnetic>
                  EXPLORE CARS
                </Button>
              </Link>

              <Link href="/column" aria-label="コラム一覧を読む">
                <Button
                  variant="glass"
                  size="lg"
                  magnetic
                  className="border-white/30 text-xs text-white"
                >
                  READ COLUMNS
                </Button>
              </Link>

              {/* 補助テキスト（PCのみ） */}
              <div className="hidden min-w-[190px] flex-1 text-[10px] text-slate-200/85 sm:block">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="tracking-[0.16em]">
                      NEWS/COLUMN/CARS/GUIDE/HERITAGEを横断して回遊
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed tracking-[0.03em] text-slate-100/85">
                    気になる車種のページを起点に
                    関連ニュースやコラム
                    ガイドやHERITAGEに移動しながら
                    検討中の一台についてゆっくり考えられる構成です。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* サイト全体インデックス */}
          <Reveal delay={480}>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-4 text-[10px] text-slate-200/90">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="tracking-[0.18em]">
                    CONTENT INDEX
                  </span>
                </div>

                <p className="hidden text-[10px] tracking-[0.06em] text-slate-200/80 sm:inline">
                  トラブル·維持費コラムとガイド
                  HERITAGEを連動させて読む前提
                </p>
              </div>

              {stats && (
                <div className="max-w-xl rounded-2xl border border-white/22 bg-slate-950/35 px-4 py-3 text-[10px] text-slate-100 shadow-glass-edge backdrop-blur-md">
                  <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-300/85">
                    CURRENT COVERAGE
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {stats.carsCount}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        MODELS
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {stats.newsCount}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        NEWS
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {stats.columnsCount}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        COLUMNS
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {stats.guidesCount}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        GUIDES
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {stats.heritageCount}
                      </span>
                      <span className="text-[9px] text-slate-300">
                        HERITAGE
                      </span>
                    </div>
                    <p className="mt-1 w-full text-[9px] text-slate-200/85">
                      今は輸入車やプレミアム系が中心
                      順番に国産車や軽自動車も増やしていく予定です。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* 右側：Bento風インタラクションパネル */}
        <div className="relative z-10 flex-1">
          {/* 右パネル内の光レイヤー */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-[-12%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,216,208,0.55),_transparent_70%)] blur-3xl" />
            <div className="absolute -right-12 bottom-[-8%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.7),_transparent_70%)] blur-3xl" />
          </div>

          {/* タイル群 */}
          <Reveal delay={220}>
            <div className="relative grid grid-cols-2 gap-3 text-[11px] text-slate-900 sm:gap-4 lg:grid-cols-2">
              {/* NEWS */}
              <Link
                href="/news"
                onMouseEnter={() => setHoveredBlock("news")}
                onMouseLeave={() =>
                  setHoveredBlock((prev) => (prev === "news" ? null : prev))
                }
                className="group relative flex h-32 flex-col justify-between rounded-2xl border border-white/55 bg-white/90 p-3 text-left shadow-soft-glass transition hover:-translate-y-0.5 hover:shadow-glow-lg sm:h-36"
              >
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.24em] text-slate-500">
                    NEWS
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-slate-900">
                    メーカー公式ニュースの概要
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="max-w-[70%] text-[10px] leading-relaxed text-slate-500">
                    新型車やモデルチェンジの動きを
                    静かな画面で一覧しやすく整理。
                  </p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                    →
                  </span>
                </div>
              </Link>

              {/* COLUMN */}
              <Link
                href="/column"
                onMouseEnter={() => setHoveredBlock("columns")}
                onMouseLeave={() =>
                  setHoveredBlock((prev) => (prev === "columns" ? null : prev))
                }
                className="group relative flex h-32 flex-col justify-between rounded-2xl border border-white/45 bg-white/85 p-3 text-left shadow-soft-glass transition hover:-translate-y-0.5 hover:shadow-glow-lg sm:h-36"
              >
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.24em] text-slate-500">
                    COLUMN
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-slate-900">
                    トラブルと整備の話
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="max-w-[70%] text-[10px] leading-relaxed text-slate-500">
                    実際によくあるトラブルや
                    整備の優先度を
                    あとで見返せるノートのように蓄積。
                  </p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                    →
                  </span>
                </div>
              </Link>

              {/* GUIDE */}
              <Link
                href="/guide"
                onMouseEnter={() => setHoveredBlock("guide")}
                onMouseLeave={() =>
                  setHoveredBlock((prev) => (prev === "guide" ? null : prev))
                }
                className="group relative flex h-32 flex-col justify-between rounded-2xl border border-white/40 bg-slate-950/80 p-3 text-left text-slate-50 shadow-soft-glass transition hover:-translate-y-0.5 hover:shadow-glow-lg sm:h-36"
              >
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.24em] text-slate-200">
                    GUIDE
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-slate-50">
                    お金と手続きの話
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="max-w-[70%] text-[10px] leading-relaxed text-slate-200/90">
                    いくらまでなら無理せず買えるか
                    買う前と手放す前に
                    一度だけ確認しておきたいポイント。
                  </p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-500/60 bg-slate-900/60 text-[10px] text-slate-100">
                    →
                  </span>
                </div>
              </Link>

              {/* CARS */}
              <Link
                href="/cars"
                onMouseEnter={() => setHoveredBlock("cars")}
                onMouseLeave={() =>
                  setHoveredBlock((prev) => (prev === "cars" ? null : prev))
                }
                className="group relative flex h-32 flex-col justify-between rounded-2xl border border-white/50 bg-white/92 p-3 text-left shadow-soft-glass transition hover:-translate-y-0.5 hover:shadow-glow-lg sm:h-36"
              >
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.24em] text-slate-500">
                    CARS DATABASE
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-slate-900">
                    気になる車種の一覧
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="max-w-[70%] text-[10px] leading-relaxed text-slate-500">
                    サイズ
                    スペック
                    維持のしやすさを並べて比較するためのベース。
                  </p>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </Reveal>

          {/* ホバー状態の説明パネル */}
          <Reveal delay={260}>
            <div className="relative mt-5">
              <div className="rounded-2xl border border-white/35 bg-slate-950/80 px-4 py-3 text-[10px] text-slate-100 shadow-soft-glow backdrop-blur">
                <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-300/85">
                  HOW TO USE
                </p>
                <p className="mt-1 leading-relaxed text-slate-100/92">
                  {hoveredBlock === "news" &&
                    "まずはNEWSで全体の動きをざっと見てから、気になったメーカーや車種をCARSやCOLUMNに辿っていく前提です。"}
                  {hoveredBlock === "columns" &&
                    "COLUMNではトラブルや乗り味など、カタログだけでは分かりにくい部分をメモ帳感覚でストックしていきます。"}
                  {hoveredBlock === "guide" &&
                    "GUIDEはお金や手続きの流れをざっくり整理するための場所です。買う前と手放す前に1回だけ読み直すイメージです。"}
                  {hoveredBlock === "cars" &&
                    "CARSでは気になる車種を並べて、サイズやセグメント、維持のしやすさを比べてから次の候補に進むためのベースとして使います。"}
                  {!hoveredBlock &&
                    "NEWS/COLUMN/GUIDE/CARS/HERITAGEを行き来しながら、検討中の一台についての情報を静かな画面でゆっくり整理できるようにすることを目指しています。"}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
