// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import {
  getAllHeritage,
  getHeritageByKind,
  getHeritageChains,
  type HeritageItem,
} from "@/lib/heritage";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | CAR BOUTIQUE",
  description:
    "ブランドの系譜や名車のストーリーを静かに味わうためのヘリテージ・アーカイブ。",
};

function toneBadgeClass(item: HeritageItem) {
  switch (item.heroTone) {
    case "obsidian":
      return "bg-slate-900 text-slate-100";
    case "tiffany":
      return "bg-tiffany-500 text-white";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function HeritagePage() {
  const [all, eras, chains] = await Promise.all([
    getAllHeritage(),
    getHeritageByKind("ERA"),
    getHeritageChains(),
  ]);

  const brandNodes = all.filter((n) => n.kind === "BRAND");
  const carNodes = all.filter((n) => n.kind === "CAR");

  const totalEra = eras.length;
  const totalBrand = brandNodes.length;
  const totalCar = carNodes.length;
  const totalChains = chains.length;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 背景グラデーション */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute -left-[10%] top-[12%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.16),_transparent_65%)] blur-[90px]" />
        <div className="absolute -right-[8%] bottom-[8%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.18),_transparent_70%)] blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-14 border-b border-slate-200/70 pb-10">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
                HERITAGE ARCHIVE
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-5 space-y-3">
              <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl lg:text-[2.7rem]">
                静かな熱量を受け継ぐ、
                <br className="hidden sm:block" />
                名車とブランドの系譜。
              </h1>
              <p className="max-w-3xl text-xs leading-relaxed text-text-sub sm:text-sm">
                ここでは、スペックの大小では測れない「空気感」や「哲学」に焦点を当てて、
                1台のクルマ、1つのブランド、1つの時代をゆっくりたどっていきます。
                CARS や COLUMN と連動しながら、ヘリテージの断片を少しずつアーカイブしていく場所です。
              </p>
            </div>
          </Reveal>

          {/* インデックスパネル */}
          <Reveal delay={180}>
            <div className="mt-8">
              <GlassCard
                padding="md"
                className="relative overflow-hidden border border-white/80 bg-gradient-to-r from-white/96 via-white/90 to-vapor/95 shadow-soft"
              >
                <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.16),_transparent_70%)] blur-3xl" />
                <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.16),_transparent_75%)] blur-3xl" />

                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-md">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      ARCHIVE INDEX
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-sub sm:text-xs">
                      時代（ERA）、ブランド（BRAND）、モデル（CAR）の 3 つの粒度で、
                      クルマの系譜をゆっくりたどるためのインデックスです。
                      1つのブランドの中で、前後の世代を続けて読み進められるように構成しています。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] text-slate-700 sm:grid-cols-4">
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        ERA
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalEra}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        時代のスナップショット
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        BRAND
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalBrand}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        ブランドのストーリー
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        CAR
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalCar}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        モデル別のヘリテージ
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] text-slate-400">
                        LINEAGE
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide text-slate-900">
                        {totalChains}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        系譜チェーン
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </header>

        {/* ERA TIMELINE */}
        <section className="mb-16 space-y-6">
          <Reveal>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                ERA TIMELINE
              </h2>
              <p className="max-w-sm text-[11px] leading-relaxed text-text-sub">
                まずは「時代」という粗い粒度で、クルマと技術、社会背景の変化をざっくり眺めておくと、
                個別のブランドやモデルの位置づけが見やすくなります。
              </p>
            </div>
          </Reveal>

          <div className="relative">
            {/* タイムライン軸（PC） */}
            <div className="absolute left-[14px] top-0 bottom-0 hidden w-px bg-slate-200 sm:block" />

            <div className="space-y-6">
              {eras.map((era, index) => (
                <Reveal
                  key={era.id}
                  delay={80 + index * 40}
                  className="relative"
                >
                  <Link href={`/heritage/${encodeURIComponent(era.slug)}`}>
                    <GlassCard
                      as="article"
                      padding="lg"
                      interactive
                      className="relative border border-slate-200/80 bg-white/92 pl-4 sm:ml-6 sm:pl-6"
                    >
                      {/* タイムラインノード（PC） */}
                      <div className="pointer-events-none absolute -left-[10px] top-6 hidden h-5 w-5 rounded-full border border-slate-300 bg-white sm:flex sm:items-center sm:justify-center">
                        <span className="h-2 w-2 rounded-full bg-tiffany-400" />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="sm:w-32">
                          {era.eraLabel && (
                            <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-500">
                              {era.eraLabel}
                            </p>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="serif-heading text-lg font-medium tracking-tight text-slate-900">
                            {era.title}
                          </h3>
                          {era.subtitle && (
                            <p className="text-[11px] leading-relaxed text-slate-500">
                              {era.subtitle}
                            </p>
                          )}
                          {era.lead && (
                            <p className="text-[12px] leading-relaxed text-slate-600">
                              {era.lead}
                            </p>
                          )}
                          {era.tags && era.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {era.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] tracking-[0.16em] text-slate-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BRAND / CAR LINEAGE GRID */}
        <section className="space-y-6">
          <Reveal>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                BRAND &amp; CAR LINEAGE
              </h2>
              <p className="max-w-sm text-[11px] leading-relaxed text-text-sub">
                ブランド別に、前後の世代をつなげて読むための小さな系譜ビューです。
                まずブランドのストーリーを押さえてから、気になる世代を HERITAGE 記事として深掘りできます。
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2">
            {chains.map(({ chainKey, nodes }, index) => {
              const brand = nodes.find((n) => n.kind === "BRAND");
              const carsInChain = nodes.filter((n) => n.kind === "CAR");

              if (!brand && carsInChain.length === 0) {
                return null;
              }

              return (
                <Reveal key={chainKey} delay={60 + index * 40}>
                  <GlassCard
                    as="section"
                    padding="lg"
                    interactive
                    className="relative h-full overflow-hidden border border-slate-200/80 bg-white/92"
                  >
                    {/* 背景の光 */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
                    <div className="pointer-events-none absolute -left-24 bottom-[-24%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.14),_transparent_75%)] blur-3xl" />

                    <div className="relative z-10 space-y-4">
                      {/* ブランド ヘッダー */}
                      {brand ? (
                        <Link
                          href={`/heritage/${encodeURIComponent(
                            brand.slug,
                          )}`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-semibold tracking-[0.26em] text-tiffany-600">
                                {brand.brandName ?? "BRAND HERITAGE"}
                              </p>
                              <h3 className="serif-heading mt-2 text-lg font-medium tracking-tight text-slate-900">
                                {brand.title}
                              </h3>
                              {brand.subtitle && (
                                <p className="mt-1 text-[11px] leading-relaxed text-text-sub">
                                  {brand.subtitle}
                                </p>
                              )}
                            </div>
                            <span
                              className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-[10px] tracking-[0.16em] ${toneBadgeClass(
                                brand,
                              )}`}
                            >
                              {chainKey}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold tracking-[0.26em] text-tiffany-600">
                            LINEAGE
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {chainKey}
                          </span>
                        </div>
                      )}

                      {/* CAR ミニタイムライン */}
                      {carsInChain.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {carsInChain.map((car, idx) => (
                            <Link
                              key={car.id}
                              href={`/heritage/${encodeURIComponent(
                                car.slug,
                              )}`}
                            >
                              <article className="group flex items-start gap-3 rounded-2xl bg-white/90 px-3 py-2 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-soft">
                                <div className="mt-[6px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-[9px] font-semibold text-slate-500">
                                  {car.generationCode ??
                                    car.chainOrder ??
                                    idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                    {car.brandName} {car.modelName}
                                  </p>
                                  <p className="line-clamp-2 font-semibold text-slate-900">
                                    {car.title}
                                  </p>
                                  {car.years && (
                                    <p className="text-[10px] text-slate-400">
                                      {car.years}
                                    </p>
                                  )}
                                </div>
                              </article>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
