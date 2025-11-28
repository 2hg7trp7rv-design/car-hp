// components/home/HeroSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

type HeroStats = {
  carsCount: number;
  columnsCount: number;
  newsCount: number;
  guidesCount: number;
};

type HeroSectionProps = {
  stats?: HeroStats;
};

export function HeroSection({ stats }: HeroSectionProps) {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden rounded-[2.5rem] border border-white/40 bg-obsidian shadow-soft-strong">
      {/* VIDEO / IMAGE BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="h-full w-full object-cover opacity-55"
            poster="/images/hero-sedan.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center opacity-70"
            style={{ backgroundImage: "url(/images/hero-sedan.jpg)" }}
          />
        )}

        {/* 光のレイヤー（Tiffanyを“光”として扱う） */}
        {/* 左上：Tiffany Light */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.55),_transparent_65%)] blur-3xl" />
        {/* 右下：やや深めのシアン〜オブシディアン */}
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)] blur-3xl" />
        {/* 全体トーン補正（Obsidianグラデーション） */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-obsidian/55 to-obsidian/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          {/* ラベル行 */}
          <Reveal delay={0}>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.32em] text-tiffany-200">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-8 bg-tiffany-300" />
                CAR BOUTIQUE
              </span>
              <span className="hidden h-[1px] w-6 bg-slate-600/60 sm:inline-block" />
              <span className="hidden text-slate-300/70 sm:inline">
                NEWS · COLUMNS · CAR DATABASE · GUIDE
              </span>
            </div>
          </Reveal>

          {/* 見出し */}
          <Reveal delay={160}>
            <h1 className="serif-heading text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-[2.8rem]">
              クルマのニュースとデータを、
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-tiffany-100 to-tiffany-300 bg-clip-text text-transparent">
                静かな画面でまとめて確認できる場所。
              </span>
            </h1>
          </Reveal>

          {/* リード文（「何ができるか」を明示） */}
          <Reveal delay={260}>
            <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-slate-200/85 sm:text-[13px]">
              新型車のニュース、トラブルやメンテナンスのコラム、維持の難易度や
              ボディタイプで絞り込める車種データベースをひとつにまとめたサイトです。
              「検討中の一台」について、情報を落ち着いて整理したい人向けの
              デジタルブティックを目指しています。
            </p>
          </Reveal>

          {/* CTA群 */}
          <Reveal delay={380}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/cars">
                <Button variant="primary" size="lg" magnetic>
                  EXPLORE CARS
                </Button>
              </Link>

              <Link href="/column">
                <Button
                  variant="glass"
                  size="lg"
                  magnetic
                  className="border-white/30 text-xs text-white"
                >
                  READ COLUMNS
                </Button>
              </Link>

              {/* 補助情報（PCでのみ表示） */}
              <div className="hidden min-w-[190px] flex-1 text-[10px] text-slate-300/80 sm:block">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 shadow-glass-edge backdrop-blur">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="tracking-[0.16em]">
                    NEWS / COLUMN / CARS / GUIDE 連動
                  </span>
                </div>
                <p className="mt-2 leading-relaxed tracking-[0.03em]">
                  まずは気になる車種のページから、
                  関連ニュースとコラム、ガイドをセットで読み進めるイメージです。
                </p>
              </div>
            </div>
          </Reveal>

          {/* 小さな統計・特徴チップ＋サイト全体のインデックス */}
          <Reveal delay={480}>
            <div className="mt-8 space-y-3">
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-200/80">
                <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                  <span className="tracking-[0.14em]">
                    IMPORT &amp; PREMIUM MODELS FOCUSED
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 backdrop-blur">
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="tracking-[0.12em]">
                    維持難易度 / ボディタイプで検索
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 backdrop-blur">
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="tracking-[0.12em]">
                    トラブル・修理コラムとガイドを連動
                  </span>
                </div>
              </div>

              {stats && (
                <div className="max-w-xl rounded-2xl border border-white/20 bg-black/35 px-4 py-3 text-[10px] text-slate-100 shadow-glass-edge backdrop-blur">
                  <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-300/80">
                    CURRENT INDEX
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
                    <p className="mt-1 w-full text-[9px] text-slate-300/80">
                      情報は少しずつ増えていく前提で、サイト自体も一緒に更新されていきます。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
