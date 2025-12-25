// app/cars/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackedOutboundLink } from "@/components/analytics/TrackedOutboundLink";
import { getSiteUrl } from "@/lib/site";

import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import {
  getAllHeritage,
  type HeritageItem,
} from "@/lib/heritage";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { DetailPageScaffold } from "@/components/page/DetailPageScaffold";

import { RelatedSection } from "@/components/related/RelatedSection";
import { RelatedGuidesGrid } from "@/components/related/RelatedGuidesGrid";
import { RelatedColumnsGrid } from "@/components/related/RelatedColumnsGrid";
import { RelatedHeritageGrid } from "@/components/related/RelatedHeritageGrid";

import { getMonetizeConfig, type MonetizeKey } from "@/lib/monetize/config";

import { splitIntoParagraphs } from "@/lib/viewmodel/text";
import {
  buildCarDetailModel,
  buildCarDetailMeta,
  formatDateJa,
  type ExtendedCarItem,
  type GuideWithMeta,
  type ColumnWithMeta,
  type HeritageWithMeta,
} from "@/lib/viewmodel/car-detail";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};


type MultilineTextProps = {
  text: string;
  variant: "hero" | "card";
};

function MultilineText({ text, variant }: MultilineTextProps) {
  const paragraphs = splitIntoParagraphs(text);

  if (variant === "hero") {
    return (
      <div className="space-y-4">
        {paragraphs.map((block, index) => (
          <p
            key={index}
            className="whitespace-pre-wrap text-[13px] leading-[1.9] text-white/80 sm:text-[14px]"
          >
            {block}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paragraphs.map((block, index) => (
        <p
          key={index}
          className="whitespace-pre-wrap text-[12px] leading-[1.9] text-white/80 sm:text-[13px]"
        >
          {block}
        </p>
      ))}
    </div>
  );
}

// ----------------------------------------
// Static Params / Metadata
// ----------------------------------------

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;
  if (!car) return {};

  const meta = buildCarDetailMeta(car);

  const title = meta.title;
  const description = meta.description;

  const url = `${getSiteUrl()}${meta.canonicalPath}`;
  const image = meta.ogImage ?? `${getSiteUrl()}/images/hero-sedan.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ----------------------------------------
// Page
// ----------------------------------------

export default async function CarDetailPage({ params }: PageProps) {
  const [carRaw, allGuidesRaw, allColumnsRaw, allHeritageRaw] =
    await Promise.all([
      getCarBySlug(params.slug),
      getAllGuides(),
      getAllColumns(),
      getAllHeritage(),
    ]);

  if (!carRaw) notFound();

  const car = carRaw as ExtendedCarItem;

  const guidesWithMeta = allGuidesRaw as GuideWithMeta[];
  const columnsWithMeta = allColumnsRaw as ColumnWithMeta[];
  const heritageWithMeta = allHeritageRaw as HeritageWithMeta[];

  const model = buildCarDetailModel({
    car,
    allGuides: guidesWithMeta,
    allColumns: columnsWithMeta,
    allHeritage: heritageWithMeta,
  });

  const {
    title,
    zeroTo100,
    difficultyLabel,
    heroImage,
    heroSrc,
    overviewText,
    characterText,
    concernsItems,
    helpsItems,
    hasStrengths,
    hasWeaknesses,
    hasTroubleTrends,
    hasMaintenanceNotes,
    relatedGuides,
    relatedColumns,
    relatedHeritage,
    ctaPrimary,
    ctaSecondary,
    externalQuickKeys,
    inventoryCardBg,
    hasSizeSpec,
    structuredData,
    breadcrumbData,
  } = model;

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <DetailPageScaffold jsonLd={model.jsonLd}>
      <main className="min-h-screen bg-site text-text-main">
      {/* ① ヒーロー：フルブリード画像 + 画像上オーバーレイ（車種で必ず統一） */}
      <section className="relative w-full overflow-hidden bg-black">
        <div className="relative h-[520px] w-full sm:h-[560px]">
          <Image
            src={heroSrc}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-5 pb-6 sm:px-7 sm:pb-7">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60">
                CAR BOUTIQUE
              </p>

              {difficultyLabel && (
                <p className="mt-2 text-[11px] font-medium text-white/80">
                  難易度: <span className="text-white">{difficultyLabel}</span>
                </p>
              )}

              <h1 className="serif-heading mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {car.bodyType && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85">
                    {car.bodyType}
                  </span>
                )}
                {car.segment && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85">
                    {car.segment}
                  </span>
                )}
                {car.drive && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85">
                    {car.drive}
                  </span>
                )}
                {zeroTo100 && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85">
                    0-100: {zeroTo100}
                  </span>
                )}
              </div>

              {(car.priceNew || car.priceUsed) && (
                <div className="mt-4 flex flex-col gap-1 text-[11px] text-white/75">
                  {car.priceNew && (
                    <p className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                      新車価格目安:{car.priceNew}
                    </p>
                  )}
                  {car.priceUsed && (
                    <p className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                      中古相場イメージ:{car.priceUsed}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={ctaPrimary.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/30 transition hover:bg-white/90"
                >
                  {ctaPrimary.label} <span aria-hidden>→</span>
                </a>

                <a
                  href={ctaSecondary.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-[12px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                >
                  {ctaSecondary.label} <span aria-hidden>→</span>
                </a>
              </div>

              {overviewText && (
                <div className="mt-6 hidden max-w-xl sm:block">
                  <MultilineText text={overviewText} variant="hero" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-[12px] text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            HOME
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/cars" className="hover:text-slate-700">
            CARS
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-600">{car.name ?? car.slug}</span>
        </nav>

        {/* ② 主要コンテンツ（上下で統一：概要 → 特徴） */}
        <section className="mb-10">
          <div className="space-y-6">
            {/* 概要（全文） */}
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                OVERVIEW
              </p>
              <h2 className="serif-heading mb-4 text-lg font-medium text-slate-900">
                概要
              </h2>

              {overviewText ? (
                <div className="text-slate-700">
                  {splitIntoParagraphs(overviewText).map((block, index) => (
                    <p
                      key={index}
                      className="mb-4 whitespace-pre-wrap text-[13px] leading-[1.9] last:mb-0 sm:text-[14px]"
                    >
                      {block}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] leading-[1.9] text-slate-700 sm:text-[14px]">
                  概要テキストが未設定です。
                </p>
              )}
            </div>

            {/* 特徴カード（上下で必ず表示：車種で構造を変えない） */}
            <div className="space-y-4">
              {/* よくある悩み（= troubleTrends/weaknesses を全文表示） */}
              <Reveal>
                <GlassCard className="rounded-2xl border border-white/10 bg-neutral-900/10 bg-gradient-to-br from-black/80 via-black/70 to-black/80 p-6 text-white shadow-soft ring-1 ring-white/10 sm:p-8">
                  <div className="rounded-2xl bg-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 bg-yellow-50/10 p-5 text-white shadow-soft backdrop-blur-sm">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-white/60">
                      COMMON CONCERNS
                    </p>
                    <h3 className="serif-heading mb-3 text-sm font-medium text-white">
                      よくある悩み・注意点
                    </h3>

                    <ul className="space-y-2.5 text-[12px] leading-relaxed text-white/85">
                      {concernsItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                          <p className="whitespace-pre-wrap">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </Reveal>

              {/* 維持費面で効く箇所（= strengths を全文表示） */}
              <div className="rounded-[2.5rem] bg-white p-6 shadow-soft-card ring-1 ring-slate-100 sm:p-8">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  WHAT HELPS
                </p>
                <h3 className="serif-heading mb-3 text-sm font-medium text-slate-900">
                  維持費面で効く箇所・魅力
                </h3>

                <ul className="space-y-2.5 text-[12px] leading-relaxed text-slate-700">
                  {helpsItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                      <p className="whitespace-pre-wrap">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ③ 基本スペック（右側に寄せたカードの構成） */}
        <section className="mb-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              {(car.priceNew || car.priceUsed || characterText) && (
                <div className="rounded-[2.5rem] bg-neutral-900 p-6 text-white shadow-soft-card ring-1 ring-white/10 sm:p-8">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-white/60">
                    VALUE NOTE
                  </p>
                  <h3 className="serif-heading mb-3 text-base font-medium text-white">
                    資産価値・相場の温度感
                  </h3>

                  {(car.priceNew || car.priceUsed) && (
                    <div className="mb-4 flex flex-col gap-1 text-[11px] text-white/75">
                      {car.priceNew && (
                        <p className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                          新車価格目安:{car.priceNew}
                        </p>
                      )}
                      {car.priceUsed && (
                        <p className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                          中古相場イメージ:{car.priceUsed}
                        </p>
                      )}
                    </div>
                  )}

                  {characterText && (
                    <div className="text-white/80">
                      <MultilineText text={characterText} variant="card" />
                    </div>
                  )}
                </div>
              )}

              {(hasTroubleTrends || hasMaintenanceNotes) && (
                <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    MAINTENANCE
                  </p>
                  <h3 className="serif-heading mb-3 text-base font-medium text-slate-900">
                    維持の注意点（メモ）
                  </h3>
                  <ul className="space-y-2.5 text-[12px] leading-relaxed text-slate-700">
                    {(car.maintenanceNotes ?? []).map(
                      (item: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          <p className="whitespace-pre-wrap">{item}</p>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                SPEC
              </p>
              <h2 className="serif-heading mb-6 text-lg font-medium text-slate-900">
                基本スペック
              </h2>

              <dl className="space-y-4">
                {[
                  {
                    label: "登場年",
                    value: car.releaseYear ? `${car.releaseYear}年頃` : null,
                  },
                  { label: "エンジン", value: car.engine },
                  {
                    label: "最高出力",
                    value: car.horsepower ? `${car.horsepower}ps` : null,
                  },
                  { label: "駆動方式", value: car.drive },
                  {
                    label: "トランスミッション",
                    value: car.transmission,
                  },
                  { label: "加速性能", value: zeroTo100 },
                  { label: "燃料", value: car.fuel },
                  { label: "燃費目安", value: car.fuelEconomy },
                ].map(
                  (item, index) =>
                    item.value && (
                      <div
                        key={index}
                        className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                      >
                        <dt className="text-[11px] font-semibold tracking-wide text-slate-500">
                          {item.label}
                        </dt>
                        <dd className="text-right text-[12px] font-medium text-slate-900">
                          {item.value}
                        </dd>
                      </div>
                    ),
                )}
              </dl>

              {hasSizeSpec && car.size && (
                <div className="mt-8">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    DIMENSIONS
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-700">
                    {Object.entries(car.size).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                      >
                        <p className="text-[10px] font-semibold tracking-wide text-slate-500">
                          {key}
                        </p>
                        <p className="mt-1 text-[12px] font-medium text-slate-900">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ④ 中古在庫を探す：外部カード2枚 + クイック */}
        <section className="mt-12 mb-12">
          <div className="mb-5 text-center">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              INVENTORY
            </p>
            <h2 className="serif-heading mt-2 text-xl font-medium text-slate-900">
              中古在庫を探す
            </h2>
          </div>

          {(() => {
            const bg = inventoryCardBg;

            return (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <a
                    href={ctaPrimary.url}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="group relative overflow-hidden rounded-[2.75rem] ring-1 ring-slate-100 shadow-soft-card"
                  >
                    <div className="absolute inset-0">
                      {bg.src ? (
                        <Image
                          src={bg.src}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className={`h-full w-full ${
                            bg.gradientClass ?? "bg-slate-900"
                          }`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                    </div>

                    <div className="relative flex min-h-[220px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-8">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-white/70">
                        EXTERNAL
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-white">
                        {ctaPrimary.label}
                      </h3>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/80">
                        {ctaPrimary.description ??
                          "条件（年式/走行/修復歴）を揃えて比較。"}
                      </p>

                      <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] text-white ring-1 ring-white/15">
                        {ctaPrimary.label} <span aria-hidden>→</span>
                      </div>
                    </div>
                  </a>

                  <a
                    href={ctaSecondary.url}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="group relative overflow-hidden rounded-[2.75rem] ring-1 ring-slate-100 shadow-soft-card"
                  >
                    <div className="absolute inset-0">
                      {bg.src ? (
                        <Image
                          src={bg.src}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className={`h-full w-full ${
                            bg.gradientClass ?? "bg-slate-900"
                          }`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                    </div>

                    <div className="relative flex min-h-[220px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-8">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-white/70">
                        EXTERNAL
                      </p>
                      <h3 className="serif-heading mt-2 text-lg font-medium text-white">
                        {ctaSecondary.label}
                      </h3>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/80">
                        {ctaSecondary.description ??
                          "購入前に支払総額を固める。"}
                      </p>

                      <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] text-white ring-1 ring-white/15">
                        {ctaSecondary.label} <span aria-hidden>→</span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="mt-6 rounded-[2.25rem] bg-white p-5 ring-1 ring-slate-100 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] sm:p-6">
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    EXTERNAL QUICK
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {externalQuickKeys.slice(0, 3).map((k) => {
                      const c = getMonetizeConfig(k, { carName: car.name });
                      return (
                        <a
                          key={c.key}
                          href={c.url}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] text-slate-900 ring-1 ring-slate-200"
                        >
                          {c.label} <span aria-hidden>→</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* ⑤ 関連：GUIDE / COLUMN / HERITAGE */}
        {relatedGuides.length > 0 && (
          <RelatedSection
            eyebrow="OWNERSHIP REALITY"
            title="Ownership shelf"
            hrefAll="/guide"
            hrefLabel="GUIDEへ →"
          >
            <RelatedGuidesGrid
              guides={relatedGuides}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
          </RelatedSection>
        )}

        {relatedColumns.length > 0 && (
          <RelatedSection
            eyebrow="NEXT READ"
            title="Next Read shelf"
            hrefAll="/column"
            hrefLabel="COLUMNへ →"
          >
            <RelatedColumnsGrid
              columns={relatedColumns}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
          </RelatedSection>
        )}

        {relatedHeritage.length > 0 && (
          <RelatedSection
            eyebrow="HERITAGE"
            title="Heritage shelf"
            hrefAll="/heritage"
            hrefLabel="HERITAGEへ →"
          >
            <RelatedHeritageGrid
              heritage={relatedHeritage}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              maxChars={180}
            />
          </RelatedSection>
        )}


      </div>
      </main>
    </DetailPageScaffold>
  );
}
