// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllHeritageNodes,
  getHeritageNodeBySlug,
  getAllHeritageCarStories,
  type HeritageNode,
  type HeritageEra,
  type HeritageBrandStripe,
  type HeritageCarStory,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

// 静的パス生成（SSG）
export async function generateStaticParams() {
  const nodes = getAllHeritageNodes();
  return nodes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const node = getHeritageNodeBySlug(params.slug);

  if (!node) {
    return {
      title: "HERITAGE が見つかりません | CAR BOUTIQUE",
      description: "指定された HERITAGE ページが見つかりませんでした。",
    };
  }

  let baseTitle: string;
  let description: string;

  if (node.kind === "ERA") {
    baseTitle = node.title;
    description = node.description;
  } else if (node.kind === "BRAND") {
    baseTitle = `${node.brand} | ${node.tagline}`;
    description = node.summary;
  } else {
    baseTitle = node.title;
    description = node.summary;
  }

  return {
    title: `${baseTitle} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: baseTitle,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        node.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: baseTitle,
      description,
    },
  };
}

// シンプルな段落分割ヘルパー（空行で区切る）
function splitBody(body?: string): string[] {
  if (!body) return [];
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function isEra(node: HeritageNode): node is HeritageEra {
  return node.kind === "ERA";
}

function isBrand(node: HeritageNode): node is HeritageBrandStripe {
  return node.kind === "BRAND";
}

function isCar(node: HeritageNode): node is HeritageCarStory {
  return node.kind === "CAR";
}

export default async function HeritageDetailPage({
  params,
}: PageProps) {
  const node = getHeritageNodeBySlug(params.slug);

  if (!node) {
    notFound();
  }

  const paragraphs = splitBody(node.body);
  const highlights = node.highlights ?? [];

  let car: CarItem | null = null;
  let previousCar: HeritageCarStory | undefined;
  let nextCar: HeritageCarStory | undefined;

  if (isCar(node)) {
    car = (await getCarBySlug(node.carSlug)) ?? null;
    const allCarStories = getAllHeritageCarStories();
    if (node.previousSlug) {
      previousCar = allCarStories.find(
        (c) => c.slug === node.previousSlug,
      );
    }
    if (node.nextSlug) {
      nextCar = allCarStories.find(
        (c) => c.slug === node.nextSlug,
      );
    }
  }

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/heritage" className="hover:text-slate-800">
            HERITAGE
          </Link>
          <span className="mx-2">/</span>
          <span className="truncate align-middle text-slate-400">
            {isEra(node)
              ? node.title
              : isBrand(node)
              ? `${node.brand} ${node.tagline}`
              : node.title}
          </span>
        </nav>

        {/* ヘッダー */}
        <Reveal>
          <header className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                HERITAGE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>
                {isEra(node)
                  ? "ERA STORY"
                  : isBrand(node)
                  ? "BRAND STORY"
                  : "MODEL STORY"}
              </span>
            </div>

            <div className="space-y-2">
              {isEra(node) && (
                <>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {node.year}
                    {node.periodJa && <> / {node.periodJa}</>}
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {node.title}
                  </h1>
                </>
              )}

              {isBrand(node) && (
                <>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {node.brand}
                    {node.focusYears && <> / {node.focusYears}</>}
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {node.tagline}
                  </h1>
                </>
              )}

              {isCar(node) && (
                <>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {node.maker}
                    {node.modelLine && <> · {node.modelLine}</>}
                    {node.generationLabel && <> / {node.generationLabel}</>}
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {node.title}
                  </h1>
                </>
              )}

              <p className="max-w-2xl text-[12px] leading-relaxed text-text-sub sm:text-sm">
                {isEra(node)
                  ? node.description
                  : isBrand(node)
                  ? node.summary
                  : node.summary}
              </p>
            </div>

            {/* ERA タグ */}
            {isEra(node) && node.tags && node.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-50 px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </Reveal>

        {/* レイアウト：本文 + サイド情報 */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* 本文側 */}
          <section className="w-full lg:w-[68%]">
            {/* KEY POINTS */}
            {highlights.length > 0 && (
              <Reveal delay={40}>
                <GlassCard className="mb-5 border border-tiffany-100 bg-white/95 px-4 py-4 sm:px-5 sm:py-5">
                  <h2 className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                    KEY POINTS
                  </h2>
                  <ul className="space-y-1.5 text-[12px] leading-relaxed text-slate-700 sm:text-[13px]">
                    {highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="mt-[7px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            )}

            {/* 本文 */}
            <Reveal delay={80}>
              <GlassCard className="bg-white/92 px-5 py-6 text-sm leading-7 text-slate-700 sm:px-6 sm:py-7 sm:text-[15px] sm:leading-8">
                {paragraphs.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    詳細テキストは、順次追加予定です。
                  </p>
                ) : (
                  paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      className={idx === 0 ? "" : "mt-4"}
                    >
                      {p}
                    </p>
                  ))
                )}
              </GlassCard>
            </Reveal>

            {/* CAR: 前後世代ナビ */}
            {isCar(node) && (previousCar || nextCar) && (
              <Reveal delay={120}>
                <section className="mt-8">
                  <h2 className="mb-3 text-xs font-semibold tracking-[0.22em] text-slate-600">
                    GENERATIONS
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {previousCar && (
                      <Link
                        href={`/heritage/${encodeURIComponent(
                          previousCar.slug,
                        )}`}
                      >
                        <GlassCard className="h-full border border-slate-200/80 bg-white/95 px-4 py-4 text-[11px] transition hover:-translate-y-[1px] hover:border-tiffany-200/80 hover:shadow-soft-card">
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                            PREVIOUS GENERATION
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-tiffany-600">
                            {previousCar.generationLabel}
                          </p>
                          <h3 className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-900">
                            {previousCar.title}
                          </h3>
                          {previousCar.years && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              {previousCar.years}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    )}
                    {nextCar && (
                      <Link
                        href={`/heritage/${encodeURIComponent(
                          nextCar.slug,
                        )}`}
                      >
                        <GlassCard className="h-full border border-slate-200/80 bg-white/95 px-4 py-4 text-[11px] transition hover:-translate-y-[1px] hover:border-tiffany-200/80 hover:shadow-soft-card">
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                            NEXT GENERATION
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-tiffany-600">
                            {nextCar.generationLabel}
                          </p>
                          <h3 className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-900">
                            {nextCar.title}
                          </h3>
                          {nextCar.years && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              {nextCar.years}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    )}
                  </div>
                </section>
              </Reveal>
            )}

            {/* 下部ナビ（SP 向け） */}
            <div className="mt-10 border-t border-slate-100 pt-6 lg:hidden">
              <Link
                href="/heritage"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                  ←
                </span>
                HERITAGE 一覧へ戻る
              </Link>
            </div>
          </section>

          {/* サイド情報 */}
          <aside className="hidden w-[32%] lg:block">
            <Reveal delay={100}>
              <div className="sticky top-24 space-y-5">
                {/* CAR 用：簡易スペック */}
                {isCar(node) && (
                  <GlassCard className="border border-slate-200/80 bg-white/90 px-4 py-4 text-[11px]">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      CAR SNAPSHOT
                    </p>
                    {car ? (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-tiffany-600">
                          {car.maker}
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-900">
                          {car.name}
                        </p>
                        {car.releaseYear && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            登場年: {car.releaseYear}
                          </p>
                        )}
                        {car.engine && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            エンジン: {car.engine}
                          </p>
                        )}
                        {car.powerPs && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            最高出力: {car.powerPs} ps（代表グレード）
                          </p>
                        )}
                        {car.bodyType && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            ボディタイプ: {car.bodyType}
                          </p>
                        )}

                        <Link
                          href={`/cars/${encodeURIComponent(
                            car.slug,
                          )}`}
                          className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-tiffany-700 hover:border-tiffany-300"
                        >
                          CARS 詳細ページへ
                          <span>→</span>
                        </Link>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        CARS のデータと紐付けると、ここに
                        基本スペックが表示されます。
                      </p>
                    )}
                  </GlassCard>
                )}

                {/* BRAND 用：タイムライン */}
                {isBrand(node) && node.timeline && (
                  <GlassCard className="border border-slate-200/80 bg-white/90 px-4 py-4 text-[11px]">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      BRAND TIMELINE
                    </p>
                    <ul className="space-y-2">
                      {node.timeline.map((t) => (
                        <li key={t.year}>
                          <p className="text-[10px] font-semibold text-slate-500">
                            {t.year}
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-700">
                            {t.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}

                {/* 共通ナビ */}
                <GlassCard className="border border-slate-200/80 bg-white/90 px-4 py-4 text-[11px]">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    RELATED NAVIGATION
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/cars"
                      className="inline-flex items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-300"
                    >
                      <span>CARS 一覧</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/column"
                      className="inline-flex items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-300"
                    >
                      <span>COLUMN</span>
                      <span>→</span>
                    </Link>
                    <Link
                      href="/guide"
                      className="inline-flex items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:border-tiffany-300"
                    >
                      <span>GUIDE</span>
                      <span>→</span>
                    </Link>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* 下部共通ナビ（PC 向け補助） */}
        <div className="mt-10 hidden border-t border-slate-100 pt-6 lg:flex lg:items-center lg:justify-between">
          <Link
            href="/heritage"
            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
              ←
            </span>
            HERITAGE 一覧へ戻る
          </Link>
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
            <Link
              href="/cars"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
            >
              CARS と照らし合わせる
            </Link>
            <Link
              href="/column"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
            >
              COLUMN で関連テーマを読む
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
