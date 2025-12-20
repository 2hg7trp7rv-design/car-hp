// app/cars/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site";

import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import {
  getAllHeritage,
  getHeritagePreviewText,
  type HeritageItem,
} from "@/lib/heritage";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";

// SEO: JSON-LD
import { JsonLd } from "@/components/seo/JsonLd";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// CarItem の拡張版
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  zeroTo100?: number;
  priceNew?: string;
  priceUsed?: string;
  fuelEconomy?: string;

  relatedNewsIds?: string[];
  relatedColumnSlugs?: string[];
  relatedHeritageIds?: string[];

  // こんな人におすすめ/向いていない
  bestFor?: string[];
  notFor?: string[];

  // 維持メモ
  maintenanceNotes?: string[];

  // サイズ系スペック
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;
};

type MultilineTextProps = {
  text: string;
  variant: "hero" | "card";
};

type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
};

type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
};

type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
  heroTitle?: string | null;
  kind?: string | null;
  brandName?: string | null;
};

// テキストを読みやすい段落に分割
function splitIntoParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 手動の空行区切りがあれば優先
  const manualBlocks = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (manualBlocks.length > 1) return manualBlocks;

  // 「。」で区切って2文ずつ1段落にまとめる
  const sentences = trimmed
    .split("。")
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [trimmed];

  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join("。");
    paras.push(chunk + "。");
  }
  return paras;
}

// ヒーロー説明/カード共通のテキスト表示
function MultilineText({ text, variant }: MultilineTextProps) {
  const paragraphs = splitIntoParagraphs(text);

  if (variant === "hero") {
    return (
      <div className="space-y-4">
        {paragraphs.map((block, index) => (
          <p
            key={index}
            className="text-[13px] leading-[1.9] text-text-sub sm:text-[14px]"
          >
            {block}
          </p>
        ))}
      </div>
    );
  }

  // card variant: 箇条書き風
  return (
    <div className="space-y-3">
      {paragraphs.map((block, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          <p className="text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
            {block}
          </p>
        </div>
      ))}
    </div>
  );
}

// SSG 用: 動的パス
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

// 維持難易度ラベル
function formatDifficultyLabel(
  difficulty: ExtendedCarItem["difficulty"],
): string | null {
  switch (difficulty) {
    case "basic":
      return "扱いやすさ やさしめ";
    case "intermediate":
      return "扱いやすさ ふつう";
    case "advanced":
      return "扱いやすさ しっかり準備";
    default:
      return null;
  }
}

// 0-100km/h 加速表示
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
}

// サイズ表示用
function formatMm(value?: number): string | null {
  if (value == null) return null;
  return `${value.toLocaleString()}mm`;
}

function formatKg(value?: number): string | null {
  if (value == null) return null;
  return `${value.toLocaleString()}kg`;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function pickGuidesForCar(
  carSlug: string,
  guides: GuideWithMeta[],
  limit = 4,
): GuideWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const filtered = guides.filter((g) =>
    (g.relatedCarSlugs ?? [])
      .filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
      .includes(target),
  );
  return filtered.slice(0, limit);
}

function pickColumnsForCar(
  carSlug: string,
  columns: ColumnWithMeta[],
  limit = 4,
): ColumnWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const filtered = columns.filter((c) =>
    (c.relatedCarSlugs ?? [])
      .filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
      .includes(target),
  );
  return filtered.slice(0, limit);
}

function pickHeritageForCar(
  carSlug: string,
  heritageList: HeritageWithMeta[],
  limit = 4,
): HeritageWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const hits = heritageList.filter((h) =>
    (h.keyCarSlugs ?? [])
      .filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
      .includes(target),
  );
  return hits.slice(0, limit);
}

function mapHeritageKindLabel(kind?: string | null): string {
  switch (kind) {
    case "brand":
      return "BRAND";
    case "model":
      return "MODEL";
    case "era":
      return "ERA";
    case "culture":
      return "CULTURE";
    default:
      return "HERITAGE";
  }
}

// メタデータ
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const titleBase = car.name ?? car.slug;
  const description = car.summaryLong ?? car.summary ?? "";

  // Canonical URL (仕様書 7.4)
  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;

  return {
    title: `${titleBase} | CAR BOUTIQUE`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${titleBase} | CAR BOUTIQUE`,
      description,
      type: "article",
      url,
      images: car.heroImage ? [car.heroImage] : [],
    },
  };
}

// メインページ
export default async function CarDetailPage({ params }: PageProps) {
  const [carRaw, allGuidesRaw, allColumnsRaw, allHeritageRaw] =
    await Promise.all([
      getCarBySlug(params.slug),
      getAllGuides(),
      getAllColumns(),
      getAllHeritage(),
    ]);

  if (!carRaw) {
    notFound();
  }

  const car = carRaw as ExtendedCarItem;
  const guidesWithMeta = allGuidesRaw as GuideWithMeta[];
  const columnsWithMeta = allColumnsRaw as ColumnWithMeta[];
  const heritageWithMeta = allHeritageRaw as HeritageWithMeta[];

  const relatedGuides = pickGuidesForCar(car.slug, guidesWithMeta);
  const relatedColumns = pickColumnsForCar(car.slug, columnsWithMeta);
  const relatedHeritage = pickHeritageForCar(car.slug, heritageWithMeta);

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);
  const overviewText = car.summaryLong ?? car.summary ?? "";
  const characterText = car.costImpression ?? car.summary ?? "";
  const difficultyLabel = formatDifficultyLabel(car.difficulty);

  const heroImage = car.heroImage ?? car.mainImage ?? null;

  const hasStrengths = Array.isArray(car.strengths) && car.strengths.length > 0;
  const hasWeaknesses =
    Array.isArray(car.weaknesses) && car.weaknesses.length > 0;
  const hasTroubleTrends =
    Array.isArray(car.troubleTrends) && car.troubleTrends.length > 0;

  const hasBestFor = Array.isArray(car.bestFor) && car.bestFor.length > 0;
  const hasNotFor = Array.isArray(car.notFor) && car.notFor.length > 0;
  const hasMaintenanceNotes =
    Array.isArray(car.maintenanceNotes) && car.maintenanceNotes.length > 0;

  const hasSizeSpec =
    car.lengthMm != null ||
    car.widthMm != null ||
    car.heightMm != null ||
    car.wheelbaseMm != null ||
    car.weightKg != null;

  const hasRelated =
    (car.relatedNewsIds && car.relatedNewsIds.length > 0) ||
    (car.relatedColumnSlugs && car.relatedColumnSlugs.length > 0) ||
    (car.relatedHeritageIds && car.relatedHeritageIds.length > 0);

  // JSON-LD（Product/Vehicle相当）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: heroImage ? [heroImage] : [],
    description: overviewText,
    brand: car.maker
      ? {
          "@type": "Brand",
          name: car.maker,
        }
      : undefined,
    vehicleConfiguration: car.bodyType ?? undefined,
    vehicleEngine: car.engine
      ? {
          "@type": "EngineSpecification",
          name: car.engine,
        }
      : undefined,
    modelDate: car.releaseYear ?? undefined,
  };

  // パンくず（JSON-LD）
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "CARS",
        item: `${getSiteUrl()}/cars`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: car.name ?? car.slug,
        item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* JSON-LD */}
      <JsonLd id={`jsonld-car-${car.slug}-product`} data={structuredData} />
      <JsonLd id={`jsonld-car-${car.slug}-breadcrumb`} data={breadcrumbData} />

      <ScrollDepthTracker />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8">

        {/* パンくず（ヒーロー画像が無い場合のフォールバック） */}
        {!heroImage && (
          <nav
            className="mb-6 text-xs text-slate-500"
            aria-label="パンくずリスト"
          >
            <Link href="/" className="hover:text-slate-800">
              HOME
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href="/cars" className="hover:text-slate-800">
              CARS
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-600">{car.name ?? car.slug}</span>
          </nav>
        )}

        {/* ヒーロー（黒背景・画像上オーバーレイ） */}
        {heroImage && (
          <section className="mb-10 overflow-hidden rounded-3xl border border-slate-200/70 bg-black shadow-soft-card">
            <div className="relative">
              <div className="relative h-[420px] w-full sm:h-[480px]">
                <Image
                  src={heroImage}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="object-cover object-center"
                  priority
                />
                {/* 下部フェード */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/70 to-transparent" />
                {/* 上部うっすら */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
              </div>

              {/* オーバーレイ情報 */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-7 sm:pb-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-[6px] w-[6px] rounded-full bg-white/70" />
                      <span className="text-[10px] font-bold tracking-[0.2em] text-white/70">
                        CAR BOUTIQUE
                      </span>
                      {difficultyLabel && (
                        <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-white/80 ring-1 ring-white/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                          {difficultyLabel}
                        </span>
                      )}
                    </div>

                    <h1 className="serif-heading text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
                      {title}
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/80">
                      {car.segment && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          {car.segment}
                        </span>
                      )}
                      {car.bodyType && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          {car.bodyType}
                        </span>
                      )}
                      {car.drive && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          {car.drive}
                        </span>
                      )}
                      {car.releaseYear && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          登場:{car.releaseYear}年頃
                        </span>
                      )}
                      {car.fuelEconomy && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          燃費目安:{car.fuelEconomy}
                        </span>
                      )}
                      {zeroTo100 && (
                        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/15">
                          加速:{zeroTo100}
                        </span>
                      )}
                    </div>

                    {(car.priceNew || car.priceUsed) && (
                      <div className="mt-3 flex flex-col gap-1 text-[11px] text-white/75">
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
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Link
                      href="/guide"
                      className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-[12px] font-semibold text-black shadow-sm transition hover:bg-white/90"
                    >
                      中古価格相場をチェック
                    </Link>
                    <Link
                      href="/cars"
                      className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-[12px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/15"
                    >
                      一覧に戻る
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 概要（全文） */}
            {overviewText && (
              <div className="border-t border-white/10 bg-black px-5 py-6 sm:px-7 sm:py-7">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-white/60">
                      OVERVIEW
                    </p>
                    <h2 className="serif-heading mb-4 text-base font-medium text-white sm:text-lg">
                      概要
                    </h2>
                    <div className="text-white/80">
                      {/* ここは “省略なし” で段落表示 */}
                      {splitIntoParagraphs(overviewText).map((block, index) => (
                        <p
                          key={index}
                          className="mb-4 whitespace-pre-wrap text-[13px] leading-[1.9] last:mb-0 sm:text-[14px]"
                        >
                          {block}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* 右：特徴カード（上下） */}
                  <div className="space-y-4">
                    {/* よくある悩み（= troubleTrends/weaknesses を全文表示） */}
                    {(hasTroubleTrends || hasWeaknesses) && (
                      <Reveal>
                        <GlassCard className="rounded-2xl border border-white/10 bg-yellow-50/10 p-5 text-white shadow-soft backdrop-blur-sm">
                          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-white/60">
                            COMMON CONCERNS
                          </p>
                          <h3 className="serif-heading mb-3 text-sm font-medium text-white">
                            よくある悩み・注意点
                          </h3>

                          <ul className="space-y-2.5 text-[12px] leading-relaxed text-white/85">
                            {(car.troubleTrends ?? car.weaknesses ?? []).map(
                              (item, index) => (
                                <li key={index} className="flex items-start gap-2.5">
                                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                                  <p className="whitespace-pre-wrap">{item}</p>
                                </li>
                              ),
                            )}
                          </ul>
                        </GlassCard>
                      </Reveal>
                    )}

                    {/* 維持費面で効く箇所（= strengths を全文表示） */}
                    {hasStrengths && (
                      <Reveal>
                        <GlassCard className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-soft backdrop-blur-sm">
                          <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-white/60">
                            WHAT HELPS
                          </p>
                          <h3 className="serif-heading mb-3 text-sm font-medium text-white">
                            維持費面で効く箇所・魅力
                          </h3>
                          <ul className="space-y-2.5 text-[12px] leading-relaxed text-white/85">
                            {(car.strengths ?? []).map((item, index) => (
                              <li key={index} className="flex items-start gap-2.5">
                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                                <p className="whitespace-pre-wrap">{item}</p>
                              </li>
                            ))}
                          </ul>
                        </GlassCard>
                      </Reveal>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* パンくず（ヒーローがある場合はここに表示） */}
        {heroImage && (
          <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
            <Link href="/" className="hover:text-slate-800">
              HOME
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href="/cars" className="hover:text-slate-800">
              CARS
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-600">{car.name ?? car.slug}</span>
          </nav>
        )}

        {/* メインコンテンツグリッド */}
        <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* 基本スペック + サイズ */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
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
                    value: (car as any).powerPs
                      ? `${(car as any).powerPs}ps`
                      : null,
                  },
                  {
                    label: "最大トルク",
                    value: (car as any).torqueNm
                      ? `${(car as any).torqueNm}Nm`
                      : null,
                  },
                  { label: "駆動方式", value: car.drive },
                  {
                    label: "トランスミッション",
                    value: (car as any).transmission,
                  },
                  { label: "加速性能", value: zeroTo100 },
                  { label: "燃料", value: (car as any).fuel },
                  { label: "燃費目安", value: car.fuelEconomy },
                ].map(
                  (item, index) =>
                    item.value && (
                      <div
                        key={index}
                        className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="text-[11px] font-medium text-slate-400">
                          {item.label}
                        </dt>
                        <dd className="max-w-[60%] text-right text-[12px] font-medium text-slate-800">
                          {item.value}
                        </dd>
                      </div>
                    ),
                )}
              </dl>

              {hasSizeSpec && (
                <div className="mt-6 rounded-2xl bg-slate-50/80 px-4 py-3">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                    サイズ感と取り回し
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-700">
                    {car.lengthMm != null && (
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-slate-400">全長</dt>
                        <dd className="font-medium">{formatMm(car.lengthMm)}</dd>
                      </div>
                    )}
                    {car.widthMm != null && (
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-slate-400">全幅</dt>
                        <dd className="font-medium">{formatMm(car.widthMm)}</dd>
                      </div>
                    )}
                    {car.heightMm != null && (
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-slate-400">全高</dt>
                        <dd className="font-medium">{formatMm(car.heightMm)}</dd>
                      </div>
                    )}
                    {car.wheelbaseMm != null && (
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-slate-400">ホイールベース</dt>
                        <dd className="font-medium">
                          {formatMm(car.wheelbaseMm)}
                        </dd>
                      </div>
                    )}
                    {car.weightKg != null && (
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="text-slate-400">車両重量</dt>
                        <dd className="font-medium">{formatKg(car.weightKg)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* 性格/お金まわり */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  このクルマの性格とお金まわり
                </h2>

                {(car.priceNew || car.priceUsed) && (
                  <div className="flex flex-col items-start gap-1 text-[10px] text-slate-500 sm:items-end">
                    {car.priceNew && (
                      <p className="rounded-full bg-slate-900 px-4 py-1.5 font-medium tracking-[0.12em] text-white">
                        新車帯:{car.priceNew}
                      </p>
                    )}
                    {car.priceUsed && (
                      <p className="rounded-full bg-slate-100 px-3 py-1">
                        中古帯:{car.priceUsed}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {characterText && (
                <div className="text-slate-600">
                  <MultilineText text={characterText} variant="card" />
                </div>
              )}

              <div className="mt-8 text-right">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  一覧に戻る
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 長所/短所セクション */}
        {(hasStrengths || hasWeaknesses || hasBestFor || hasNotFor) && (
          <section className="mb-10 rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  オーナー目線の長所と気になるポイント
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  カタログスペックでは見えにくい部分を「実際に持つなら」という目線で整理
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {hasStrengths && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-emerald-700">
                    いいところ
                  </h3>
                  <ul className="space-y-2.5 text-[12px] text-slate-700">
                    {car.strengths?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <p className="leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasWeaknesses && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-rose-700">
                    注意したいところ
                  </h3>
                  <ul className="space-y-2.5 text-[12px] text-slate-700">
                    {car.weaknesses?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        <p className="leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(hasBestFor || hasNotFor) && (
              <div className="mt-8 rounded-2xl bg-slate-50/80 px-4 py-4 text-[11px] text-slate-700">
                <div className="grid gap-4 md:grid-cols-2">
                  {hasBestFor && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-emerald-700">
                        こんな人におすすめ
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {car.bestFor?.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-white px-3 py-1 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasNotFor && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-rose-700">
                        向いていないかもしれない人
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {car.notFor?.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-white px-3 py-1 shadow-[0_0_0_1px_rgba(248,113,113,0.18)]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* トラブル傾向/維持の注意 */}
        {(hasTroubleTrends || hasMaintenanceNotes) && (
          <section className="mb-10 rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  トラブル傾向と維持の注意点
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  よく名前が出る持病や気を付けたい部品などをざっくり整理
                </p>
              </div>
            </div>

            {hasMaintenanceNotes && (
              <div className="mb-4 rounded-2xl bg-slate-50/80 px-4 py-3 text-[12px] leading-relaxed text-slate-700">
                <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                  維持のメモ
                </p>
                <ul className="mt-1 space-y-1.5">
                  {car.maintenanceNotes?.map((note, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasTroubleTrends && (
              <ul className="space-y-2.5 text-[12px] text-slate-700">
                {car.troubleTrends?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <p className="leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Ownership棚（GUIDE INDEX） */}
        {relatedGuides.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                    OWNERSHIP REALITY
                  </p>
                  <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                    いま、このモデルと付き合うなら
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    維持費・トラブル・買い方など、所有する前の「現実」チェック
                  </p>
                </div>
                <Link
                  href="/guide"
                  className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  GUIDE一覧へ
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedGuides.map((guide, index) => {
                const primaryDate = guide.publishedAt ?? guide.updatedAt ?? null;
                return (
                  <Reveal key={guide.id} delay={index * 40}>
                    <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                      <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-tiffany-600">
                            CHECK
                          </span>
                          <span className="text-slate-400">
                            {guide.category ?? "GUIDE"}
                          </span>
                          {primaryDate && (
                            <span className="ml-auto text-[10px] text-slate-400">
                              {formatDate(primaryDate)}
                            </span>
                          )}
                        </div>

                        <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                          {guide.title}
                        </h3>
                        {guide.summary && (
                          <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {guide.summary}
                          </p>
                        )}

                        <div className="mt-3 flex justify-end">
                          <span className="text-[10px] font-medium text-tiffany-600 underline-offset-2 group-hover:underline">
                            詳細を読む →
                          </span>
                        </div>
                      </GlassCard>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* この車にまつわるコラム */}
        {relatedColumns.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    RELATED COLUMN
                  </p>
                  <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                    この車にまつわるコラム
                  </h2>
                </div>
                <Link
                  href="/column"
                  className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  コラム一覧へ
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedColumns.map((col, index) => (
                <Reveal key={col.id} delay={index * 40}>
                  <Link href={`/column/${encodeURIComponent(col.slug)}`}>
                    <GlassCard className="h-full border border-slate-200/80 bg-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 sm:p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          コラム
                        </span>
                        {col.readMinutes && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            約{col.readMinutes}分
                          </span>
                        )}
                        {col.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(col.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {col.title}
                      </h3>
                      {col.summary && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                          {col.summary}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* このブランド/モデルに関係するHERITAGE */}
        {relatedHeritage.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    RELATED HERITAGE
                  </p>
                  <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                    この車に関係するHERITAGE
                  </h2>
                </div>
                <Link
                  href="/heritage"
                  className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  HERITAGE一覧へ
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedHeritage.map((h) => {
                const preview = getHeritagePreviewText(h, { maxChars: 160 });

                return (
                  <Link
                    key={h.id}
                    href={`/heritage/${encodeURIComponent(h.slug)}`}
                  >
                    <GlassCard className="h-full border border-slate-200/80 bg-white/92 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {mapHeritageKindLabel(h.kind)}
                        </span>
                        {h.brandName && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {h.brandName}
                          </span>
                        )}
                        {h.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(h.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {h.heroTitle ?? h.title}
                      </h3>

                      {preview && (
                        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {preview}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 関連コンテンツへの導線（ID/slugベース） */}
        {hasRelated && (
          <section className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  関連ニュース COLUMN HERITAGEへ
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  この車種に関連するニュースやコラム ブランドのHERITAGEへ飛べるアンカー
                  詳細は各ページ側で確認する想定
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {car.relatedNewsIds?.map((id) => (
                <Link
                  key={id}
                  href={`/news/${encodeURIComponent(id)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連NEWS:{id}
                </Link>
              ))}
              {car.relatedColumnSlugs?.map((slug) => (
                <Link
                  key={slug}
                  href={`/column/${encodeURIComponent(slug)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連COLUMN:{slug}
                </Link>
              ))}
              {car.relatedHeritageIds?.map((id) => (
                <Link
                  key={id}
                  href={`/heritage/${encodeURIComponent(id)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連HERITAGE:{id}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
