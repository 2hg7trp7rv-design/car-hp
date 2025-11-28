// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import {
  getAllHeritageEras,
  getAllHeritageBrands,
} from "@/lib/heritage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | CAR BOUTIQUE",
  description:
    "ブランドの系譜や名車のストーリーを、時代ごとの空気感と一緒に静かに眺めるためのヘリテージ・アーカイブ。",
};

function HeritageTimelineSection() {
  const eras = getAllHeritageEras();

  return (
    <section
      aria-label="年代別タイムライン"
      className="mt-12 space-y-6"
    >
      <Reveal>
        <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
          ERA TIMELINE
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <GlassCard className="relative overflow-hidden border border-slate-200/80 bg-white/92 px-4 py-5 shadow-soft sm:px-6 sm:py-7">
          {/* 縦ライン（PC） */}
          <div className="pointer-events-none absolute left-6 top-6 bottom-6 hidden lg:block">
            <div className="h-full w-px bg-gradient-to-b from-tiffany-300/80 via-slate-200/80 to-transparent" />
          </div>

          <div className="relative lg:pl-6">
            <ol className="space-y-6">
              {eras.map((event, index) => (
                <li
                  key={event.slug}
                  className="relative flex gap-4"
                >
                  {/* ドット（PC） */}
                  <div className="mt-1 hidden w-8 items-start justify-center lg:flex">
                    <div className="relative flex h-4 w-4 items-center justify-center">
                      <div className="absolute h-4 w-4 rounded-full bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.45)]" />
                      <div className="relative h-2 w-2 rounded-full bg-gradient-to-br from-tiffany-400 to-tiffany-600" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-slate-50">
                        {event.year}
                      </span>
                      {event.periodJa && (
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          {event.periodJa}
                        </span>
                      )}
                      {event.accentBrand && (
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          {event.accentBrand}
                        </span>
                      )}
                    </div>

                    <h3 className="serif-heading mt-2 text-[15px] font-medium tracking-tight text-slate-900 sm:text-base">
                      {event.title}
                    </h3>

                    <p className="mt-2 text-[11px] leading-relaxed text-slate-700 sm:text-[12px]">
                      {event.description}
                    </p>

                    {event.subDescription && (
                      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                        {event.subDescription}
                      </p>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-50 px-2 py-0.5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 詳細への導線 */}
                    <div className="mt-3">
                      <Link
                        href={`/heritage/${encodeURIComponent(
                          event.slug,
                        )}`}
                        className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700 hover:underline"
                      >
                        ERA STORY
                        <span className="text-[11px]">→</span>
                      </Link>
                    </div>

                    {index === 1 && (
                      <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                        CARS ページで気になるモデルの年式を見ながら、
                        「どの時代のキャラクター寄りなのか」を掴むための
                        ラフなガイドとして使ってください。
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}

function BrandStripesSection() {
  const brands = getAllHeritageBrands();

  return (
    <section
      aria-label="ブランド別のキャラクター"
      className="mt-16 space-y-5"
    >
      <Reveal>
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
              BRAND STRIPES
            </p>
            <h2 className="serif-heading mt-1 text-lg font-medium text-slate-900 sm:text-xl">
              ブランドごとの「キャラクターの変わり目」をメモしておく。
            </h2>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed text-text-sub">
            ここでは、いくつかのブランドについてだけ、
            「どの年代で性格が変わってきたか」をラフにメモしています。
            詳しい技術の話やトラブル事例は COLUMN 側で扱っていきます。
          </p>
        </header>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((stripe) => (
            <Link
              key={stripe.slug}
              href={`/heritage/${encodeURIComponent(
                stripe.slug,
              )}`}
            >
              <GlassCard
                as="article"
                padding="md"
                interactive
                className="group relative h-full overflow-hidden border border-slate-200/80 bg-white/92 text-[11px] shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-200/80 hover:shadow-soft-card"
              >
                {/* 右側ストライプの光 */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-b from-tiffany-50/60 via-tiffany-100/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                <div className="relative z-10 flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.26em] text-tiffany-600">
                        {stripe.brand}
                      </p>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-900">
                        {stripe.tagline}
                      </p>
                    </div>
                    {stripe.focusYears && (
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-semibold tracking-[0.18em] text-slate-50">
                        {stripe.focusYears}
                      </span>
                    )}
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    {stripe.summary}
                  </p>

                  {stripe.note && (
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                      {stripe.note}
                    </p>
                  )}

                  <div className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700">
                    VIEW BRAND STORY →
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景レイヤー */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-0 top-0 h-[45vh] w-full bg-gradient-to-b from-white/95 via-white/80 to-transparent" />
        <div className="absolute -left-[18%] top-[12%] h-[34vw] w-[34vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.3),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[20%] bottom-[-10%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.15),_transparent_75%)] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">HERITAGE</span>
        </nav>

        {/* ヒーロー */}
        <Reveal>
          <header className="space-y-5 border-b border-slate-200/70 pb-8">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
                HERITAGE ARCHIVE
              </p>
            </div>
            <div className="space-y-3">
              <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
                静かな熱量を受け継ぐ、
                <br className="hidden sm:block" />
                名車たちの系譜を、時代の空気と一緒に眺める。
              </h1>
              <p className="max-w-3xl text-[12px] leading-relaxed text-text-sub sm:text-sm">
                スペックの大小では測れない「空気感」や「哲学」に焦点を当てて、
                クルマの歴史をゆっくりたどっていきます。細かい年表ではなく、
                「どの年代のキャラクターが好きそうか」を掴むための、ラフな地図のようなセクションです。
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <Link
                href="/cars"
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 font-semibold tracking-[0.18em] text-slate-50 transition hover:bg-slate-700"
              >
                CARS と照らし合わせて見る
              </Link>
              <Link
                href="/column"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 font-semibold tracking-[0.18em] text-slate-700 transition hover:border-tiffany-300"
              >
                COLUMN で個別のストーリーを読む
              </Link>
            </div>
          </header>
        </Reveal>

        {/* ERA TIMELINE */}
        <HeritageTimelineSection />

        {/* BRAND STRIPES */}
        <BrandStripesSection />

        {/* クロージング */}
        <section className="mt-18 sm:mt-20">
          <Reveal delay={120}>
            <GlassCard className="border border-slate-200/80 bg-white/95 px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-[12px] leading-relaxed text-slate-600 sm:text-sm">
                HERITAGE セクションでは、今後ブランド別の系譜や、
                1台のクルマを深掘りするロングインタビュー、
                オーナーの記憶に残るエピソードなどを少しずつアーカイブしていきます。
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                「このモデルの系譜をまとめてほしい」といったリクエストがあれば、
                CARS や COLUMN、GUIDE と連動した特集として整理していきます。
                いまはまだラフな年表ですが、ページ全体がすこしずつ分厚いアルバムになっていくイメージです。
              </p>
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
