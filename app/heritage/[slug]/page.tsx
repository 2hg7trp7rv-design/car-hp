// app/heritage/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getAllHeritage,
  getHeritageBySlug,
  getPreviousHeritage,
  getNextHeritage,
  getNextReadHeritageV12,
  getNextReadForHeritage,
  assertHeritageCarsExist,
  type HeritageItem,
} from "@/lib/heritage";

import {
  getAllCars,
  type CarItem,
} from "@/lib/cars";

import { resolveCarsBySlugs, resolveGuidesBySlugs, resolveColumnsBySlugs } from "@/lib/related-content";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { NextReadShelf } from "@/components/heritage/NextReadShelf";

import { IconCar } from "@/components/icons/IconCar";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import { IconSearch } from "@/components/icons/IconSearch";
import { SectionRelatedLinks } from "@/components/heritage/SectionRelatedLinks";
import { OwnershipRealitySection } from "@/components/heritage/OwnershipRealitySection";

import { DetailPageScaffold } from "@/components/page/DetailPageScaffold";

import {
  buildHeritageDetailModel,
  formatDateLabel,
  highlightRich,
  SPEC_HEADING_PREFIX,
} from "@/lib/viewmodel/heritage-detail";


// ----------------------------------------
// Dummy Data (関連コラム用)
// ----------------------------------------

// ----------------------------------------
// Page Config
// ----------------------------------------
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 60 * 60 * 24;

type PageProps = {
  params: { slug: string };
};

// ----------------------------------------
// Static Params & Validation
// ----------------------------------------
export async function generateStaticParams() {
  const all = await getAllHeritage();

  // データ整合性チェック
  for (const h of all) {
    assertHeritageCarsExist(h);
  }

  return all
    .map((item) => item.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug) => ({ slug }));
}

// ----------------------------------------
// Metadata
// ----------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const heritage = await getHeritageBySlug(params.slug);

  if (!heritage) {
    return {
      title: "HERITAGEが見つかりません | CAR BOUTIQUE",
      description: "指定されたHERITAGEコンテンツが見つかりませんでした。",
    };
  }

  const title =
    heritage.title ??
    heritage.titleJa ??
    `${heritage.maker ?? ""} HERITAGE`.trim();

  const description =
    heritage.summary ??
    heritage.lead ??
    "CAR BOUTIQUEによるブランド/時代のストーリーと代表車をまとめたHERITAGEコンテンツ。";

  const images: string[] = [];
  if ((heritage as any).ogImageUrl) {
    images.push((heritage as any).ogImageUrl as string);
  } else if (heritage.heroImage) {
    images.push(heritage.heroImage);
  }

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      images,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

// ----------------------------------------
// Main Page Component
// ----------------------------------------

export default async function HeritageDetailPage({ params }: PageProps) {
  const [heritage, allCars, allGuides, allColumns] = await Promise.all([
    getHeritageBySlug(params.slug),
    getAllCars(),
    getAllGuides(),
    getAllColumns(),
  ]);

  if (!heritage) notFound();

  // Next Read Shelf（cars/guides/columns を返すのはこっち）
  const nextRead = await getNextReadForHeritage(heritage.slug, { limit: 5, min: 2 });

  // Prev/Next
  const [prev, next] = await Promise.all([
    getPreviousHeritage(heritage.slug),
    getNextHeritage(heritage.slug),
  ]);

  // More Heritage（HERITAGE一覧を返すのはこっち）
  const moreHeritage = await getNextReadHeritageV12(heritage, 3);

  // Labels & Body (viewmodel)
  const vm = buildHeritageDetailModel({
    heritage,
    slug: params.slug,
    allCars,
    allGuides,
    allColumns,
  });
  const {
    title,
    tags,
    dateLabel,
    readingTimeMinutes,
    carKeywordSet,
    keywordSet,
    combinedHighlightRegex,
    contentSections,
    hasBody,
    hasStructuredContent,
  } = vm;

  // Related (viewmodel)
  const relatedCarItems = vm.related.cars;
  const relatedGuideItems = vm.related.guides;
  const relatedColumnItems = vm.related.columns;

  return (
    <DetailPageScaffold jsonLd={vm.jsonLd}>
      <main className="min-h-screen bg-slate-950 text-slate-50">

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative min-h-[72vh] overflow-hidden border-b border-slate-800/60 bg-slate-950">
        {heritage.heroImage ? (
          <>
            <Image
              src={heritage.heroImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* 文字の可読性確保 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/70 to-slate-950" />
            {/* 空気感 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.10),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.28),_transparent_60%)]" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.10),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(30,64,175,0.28),_transparent_60%)]" />
        )}

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 pt-20 md:px-6 lg:px-8 lg:pt-24">
          <Reveal className="flex-1">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
                <span>CAR BOUTIQUE HERITAGE</span>
              </div>

              <div className="space-y-3">
                {heritage.maker && (
                  <p className="text-xs tracking-[0.3em] text-slate-300">
                    {heritage.maker}
                  </p>
                )}
                <h1 className="font-serif text-3xl leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
                  {highlightRich(title, combinedHighlightRegex, carKeywordSet, keywordSet)}
                </h1>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                  {dateLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{dateLabel}</span>
                    </span>
                  )}
                  {readingTimeMinutes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>READ {readingTimeMinutes} min</span>
                    </span>
                  )}
                  {heritage.kind && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{heritage.kind}</span>
                    </span>
                  )}
                </div>

                {heritage.summary && (
                  <p className="max-w-xl text-[15px] leading-relaxed text-slate-100">
                    {heritage.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-200">
                  {heritage.keyModels?.map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-slate-700/70 bg-slate-900/70 px-2.5 py-0.5 text-[11px] text-slate-50"
                    >
                      {model}
                    </span>
                  ))}
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/heritage?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-950/80 px-2.5 py-0.5 text-[11px] text-slate-100 transition hover:border-rose-400/80 hover:bg-slate-900 hover:text-rose-50"
                    >
                      <span className="h-1 w-1 rounded-full bg-rose-400" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {heritage.heroImage && heritage.heroImageCredit && (
            <p className="text-right text-[10px] tracking-wide text-slate-200/80">
              {heritage.heroImageCredit}
            </p>
          )}
        </div>
      </section>

      {/* ----------------- MAIN CONTENT & SIDEBAR ----------------- */}
      <section className="border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-slate-900 py-10 md:py-14">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:px-6 lg:px-8">

          {/* Main Text Column */}
          <Reveal className="w-full md:w-[64%]" forceVisible>
            <div className="space-y-6">
              {hasBody || hasStructuredContent ? (
                contentSections.map((section, sectionIndex) => {

                  // 各章ごとの関連データ
                  const sectionCars =
                    Array.isArray(section.carSlugs) && section.carSlugs.length > 0
                      ? resolveCarsBySlugs(section.carSlugs, allCars)
                      : [];

                  const sectionGuides =
                    Array.isArray(section.guideSlugs) && section.guideSlugs.length > 0
                      ? resolveGuidesBySlugs(section.guideSlugs, allGuides)
                      : [];

                  const sectionColumns =
                    Array.isArray(section.columnSlugs) && section.columnSlugs.length > 0
                      ? resolveColumnsBySlugs(section.columnSlugs, allColumns)
                      : [];

                  // JSONデータから指定された在庫検索クエリを使用
                  const stockQuery = section.stockCarQuery;

                  const hasSectionShelf =
                    sectionCars.length > 0 || sectionGuides.length > 0 || sectionColumns.length > 0 || !!stockQuery;

                  return (
                    <GlassCard
                      key={section.id ?? sectionIndex}
                      className="border border-white/40 bg-white/90 p-5 text-slate-900 sm:p-6 lg:p-7"
                    >
                      {section.title && (
                        <h2
                          className={`mb-4 font-serif ${
                            section.level === "heading"
                              ? "text-2xl sm:text-3xl"
                              : "text-xl sm:text-2xl"
                          }`}
                        >
                          {highlightRich(
                            section.title,
                            combinedHighlightRegex,
                            carKeywordSet,
                            keywordSet,
                          )}
                        </h2>
                      )}

                      {/* 本文レンダリング */}
                      {section.lines.length > 0 && (
                        <div className="space-y-2">
                          {(() => {
                            const blocks: JSX.Element[] = [];
                            const lines = section.lines;

                            for (let i = 0; i < lines.length; i++) {
                              const line = lines[i];

                              if (!line) {
                                blocks.push(<div key={`spacer-${i}`} className="h-2" />);
                                continue;
                              }

                              // SPEC ヘッダー処理
                              if (line.startsWith(SPEC_HEADING_PREFIX)) {
                                const label = line.slice(SPEC_HEADING_PREFIX.length);
                                const specs: string[] = [];

                                let j = i + 1;
                                for (; j < lines.length; j++) {
                                  const nextLine = lines[j];
                                  if (nextLine && nextLine.startsWith("・")) {
                                    specs.push(nextLine);
                                  } else if (nextLine && nextLine.length === 0) {
                                    continue;
                                  } else {
                                    break;
                                  }
                                }
                                i = j - 1;

                                blocks.push(
                                  <div
                                    key={`spec-${i}`}
                                    className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[13px] sm:text-sm"
                                  >
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                                      SPEC
                                    </p>
                                    <p className="mt-1 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                                      {highlightRich(
                                        label,
                                        combinedHighlightRegex,
                                        carKeywordSet,
                                        keywordSet,
                                      )}
                                    </p>

                                    {specs.length > 0 && (
                                      <ul className="mt-2 space-y-1">
                                        {specs.map((specLine, idx) => {
                                          const t = specLine.replace(/^・\s*/, "");
                                          return (
                                            <li
                                              key={`spec-line-${i}-${idx}`}
                                              className="flex gap-1"
                                            >
                                              <span className="mt-1 block h-[3px] w-[3px] rounded-full bg-slate-400" />
                                              <span className="text-[13px] leading-relaxed text-slate-900 sm:text-[14px]">
                                                {highlightRich(
                                                  t,
                                                  combinedHighlightRegex,
                                                  carKeywordSet,
                                                  keywordSet,
                                                )}
                                              </span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>,
                                );
                                continue;
                              }

                              // 通常パラグラフ
                              blocks.push(
                                <p
                                  key={`p-${i}`}
                                  className="whitespace-pre-line text-[15px] leading-relaxed text-slate-900 sm:text-[18px]"
                                >
                                  {highlightRich(
                                    line,
                                    combinedHighlightRegex,
                                    carKeywordSet,
                                    keywordSet,
                                  )}
                                </p>,
                              );
                            }
                            return blocks;
                          })()}
                        </div>
                      )}

                      {/* ★ REQ 1: カード終わりの登場車種リンク棚 (IN THIS SECTION) ★ */}
                      {hasSectionShelf && (
                        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                              In This Section
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* 登場する車 (個別) */}
                            {sectionCars.slice(0, 4).map((car) => (
                              <Link
                                key={car.slug}
                                href={`/cars/${encodeURIComponent(car.slug)}`}
                                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-rose-400/50 hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500">
                                    <IconCar className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                      {car.maker}
                                    </p>
                                    <p className="text-[12px] font-bold text-slate-800 group-hover:text-rose-600 truncate">
                                      {car.name}
                                    </p>
                                  </div>
                                </div>
                                <IconArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-rose-400" />
                              </Link>
                            ))}

                            {/* ★在庫を見るボタン (データから指定) */}
                            {stockQuery && (
                              <Link
                                href={`/cars?q=${encodeURIComponent(stockQuery)}`}
                                className="group flex items-center justify-between rounded-xl border border-tiffany-200 bg-tiffany-50/50 p-3 shadow-sm transition hover:border-tiffany-400/50 hover:bg-tiffany-50 hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tiffany-100 text-tiffany-500 group-hover:bg-tiffany-200 group-hover:text-tiffany-600">
                                    <IconSearch className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-tiffany-600/70 uppercase tracking-wider truncate">
                                      FIND STOCK
                                    </p>
                                    <p className="text-[12px] font-bold text-tiffany-800 group-hover:text-tiffany-900 truncate">
                                      {stockQuery}の在庫を探す
                                    </p>
                                  </div>
                                </div>
                                <IconArrowRight className="h-4 w-4 shrink-0 text-tiffany-400 group-hover:text-tiffany-600" />
                              </Link>
                            )}
                          </div>

                          {/* ガイド/コラム（章紐付けがあれば） */}
                          <SectionRelatedLinks guides={sectionGuides} columns={sectionColumns} />
                        </div>
                      )}
                    </GlassCard>
                  );
                })
              ) : (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <p className="text-[15px] leading-relaxed text-slate-900 sm:text-[18px]">
                    このHERITAGEの本文は現在準備中です。
                    ブランドや代表モデルの詳しいストーリーは、順次追加していきます。
                  </p>
                </GlassCard>
              )}

              <OwnershipRealitySection guides={relatedGuideItems} columns={relatedColumnItems} />
            </div>
          </Reveal>

          {/* Side Column (Sidebar) */}
          <Reveal className="w-full md:w-[36%]" forceVisible>
            <div className="flex flex-col gap-6 sticky top-24">

              {/* KEY MODELS */}
              {(heritage.keyModels?.length ?? 0) > 0 && (
                <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                  <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-500 mb-3 border-b border-slate-100 pb-2">
                    KEY MODELS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {heritage.keyModels?.map((model) => (
                      <span
                        key={model}
                        className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* NAV */}
              <GlassCard className="border border-white/40 bg-white/90 p-5 text-slate-900">
                <div className="flex flex-col gap-4">
                  <Link
                    href="/heritage"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <span>←</span> BACK TO LIST
                  </Link>

                  <div className="flex gap-2">
                    {prev ? (
                      <Link
                        href={`/heritage/${encodeURIComponent(prev.slug)}`}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
                      >
                        <span className="block text-[9px] text-slate-400 font-bold mb-0.5">PREV</span>
                        <span className="block text-[11px] truncate leading-tight">
                          {prev.titleJa ?? prev.title}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {next && (
                      <Link
                        href={`/heritage/${encodeURIComponent(next.slug)}`}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition text-right"
                      >
                        <span className="block text-[9px] text-slate-400 font-bold mb-0.5">NEXT</span>
                        <span className="block text-[11px] truncate leading-tight">
                          {next.titleJa ?? next.title}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>

        {heritage.heroImageCredit && (
          <p className="pointer-events-none absolute bottom-3 right-4 max-w-[70vw] text-right text-[10px] tracking-wide text-slate-200/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {heritage.heroImageCredit}
          </p>
        )}
      </section>

      {/* ----------------- FOOTER SHELF ----------------- */}
      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6 lg:px-8 mt-12">
        <NextReadShelf cars={nextRead.cars} guides={nextRead.guides} columns={nextRead.columns} />
      </div>

      {/* ----------------- MORE HERITAGE ----------------- */}
      {moreHeritage.length > 0 && (
        <section className="border-t border-slate-800/70 bg-slate-950 py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <Reveal className="max-w-xl">
              <h2 className="font-serif text-sm uppercase tracking-[0.25em] text-slate-200">
                MORE HERITAGE
              </h2>
            </Reveal>

            <Reveal className="mt-5 grid gap-4 md:grid-cols-3">
              {moreHeritage.map((item) => {
                const itemDateLabel =
                  formatDateLabel(item.publishedAt) ??
                  formatDateLabel(item.updatedAt);
                const itemTitle = item.titleJa ?? item.title ?? item.slug;
                const itemMaker = item.maker ?? "";
                const itemTags = item.tags ?? [];

                return (
                  <Link
                    key={item.slug}
                    href={`/heritage/${encodeURIComponent(item.slug)}`}
                    className="group h-full"
                  >
                    <GlassCard className="flex h-full flex-col border border-white/40 bg-white/90 p-4 text-slate-900 transition group-hover:border-rose-400/70 group-hover:bg-rose-50">
                      <p className="text-[11px] tracking-[0.26em] text-slate-500">
                        {itemMaker || "HERITAGE"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-sm text-slate-900">
                        {itemTitle}
                      </h3>
                      {itemDateLabel && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          {itemDateLabel}
                        </p>
                      )}
                      {itemTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {itemTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-300/80 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </Link>
                );
              })}
            </Reveal>

            <Reveal className="mt-6">
              <div className="flex justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-500 bg-slate-950/80 text-[11px] text-slate-50 hover:border-rose-400 hover:bg-slate-900"
                >
                  <Link href="/heritage">HERITAGE一覧をもっと見る</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}
      </main>
    </DetailPageScaffold>
  );
}
