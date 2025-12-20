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

// Icons（lucide-react）
import { AlertTriangle, Sparkles, ArrowLeft, ChevronRight } from "lucide-react";

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

  const heroParagraphs = splitIntoParagraphs(overviewText);

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* JSON-LD */}
      <JsonLd id={`jsonld-car-${car.slug}-product`} data={structuredData} />
      <JsonLd id={`jsonld-car-${car.slug}-breadcrumb`} data={breadcrumbData} />

      <ScrollDepthTracker />

      {/* =========================================================
       * A. HERO（黒基調・画像全面・オーバーレイ）
       * - 既存のデータ（title/overviewText/タグ）をそのまま使用
       * - CTA: 中古価格相場をチェック / 一覧に戻る
       * ======================================================= */}
      <section className="relative bg-black">
        <div className="relative h-[440px] w-full sm:h-[520px]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-black" />
          )}

          {/* 下方向に濃くなるフェード */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

          {/* ほんの少し粒状感（上品） */}
          <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-5xl items-end px-4 pb-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-white/65">
                CAR BOUTIQUE
              </p>

              <h1 className="mt-2 font-serif text-3xl leading-tight text-white sm:text-4xl">
                {title}
              </h1>

              {/* タグ（半透明ピル） */}
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-white/80">
                {car.segment && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    {car.segment}
                  </span>
                )}
                {car.bodyType && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    {car.bodyType}
                  </span>
                )}
                {car.engine && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    {car.engine}
                  </span>
                )}
                {car.drive && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    {car.drive}
                  </span>
                )}
                {car.releaseYear && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    登場:{car.releaseYear}年頃
                  </span>
                )}
                {car.fuelEconomy && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    燃費目安:{car.fuelEconomy}
                  </span>
                )}
                {zeroTo100 && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">
                    加速:{zeroTo100}
                  </span>
                )}
              </div>

              {/* 説明（既存テキストを保持しつつ、ヒーロー向けに白寄りで表示） */}
              {heroParagraphs.length > 0 && (
                <div className="mt-5 space-y-3">
                  {heroParagraphs.map((block, idx) => (
                    <p
                      key={idx}
                      className="text-[13px] leading-[1.9] text-white/80 sm:text-[14px]"
                    >
                      {block}
                    </p>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#used-market"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-black shadow-sm transition hover:bg-white/95 active:bg-white/90"
                >
                  中古価格相場をチェック
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>

                <Link
                  href="/cars"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15 active:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  一覧に戻る
                </Link>
              </div>

              {/* 難易度ラベル（既存ロジックを活かし、ヒーロー内でも見せる） */}
              {difficultyLabel && (
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-medium tracking-[0.16em] text-white/85 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {difficultyLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* パンくず */}
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

        {/* =========================================================
         * B. 特徴セクション（カードデザイン）
         * - 注意点: weaknesses を使用（無ければ表示しない）
         * - 魅力: strengths を使用（無ければ表示しない）
         * - 既存データは省略せずそのまま列挙
         * ======================================================= */}
        {(hasWeaknesses || hasStrengths) && (
          <section className="mb-10">
            <h2 className="text-center font-serif text-xl text-slate-900 sm:text-2xl">
              このクルマの特徴
            </h2>

            <div className="mx-auto mt-6 grid max-w-3xl gap-4">
              {hasWeaknesses && (
                <div className="rounded-2xl border border-black/10 bg-yellow-50/50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-black/10 bg-white/70 p-2">
                      <AlertTriangle className="h-5 w-5 text-black/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base font-semibold text-black">
                        注意すべきポイント
                      </h3>

                      <ul className="mt-3 space-y-2 font-sans text-sm leading-relaxed text-black/80">
                        {car.weaknesses?.map((t, i) => (
                          <li key={`${t}-${i}`} className="flex gap-2">
                            <span className="mt-[0.35em] h-1.5 w-1.5 flex-none rounded-full bg-black/50" />
                            <span className="min-w-0">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {hasStrengths && (
                <div className="rounded-2xl border border-black/10 bg-gray-50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl border border-black/10 bg-white/70 p-2">
                      <Sparkles className="h-5 w-5 text-black/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base font-semibold text-black">
                        絶対的な魅力
                      </h3>

                      <ul className="mt-3 space-y-2 font-sans text-sm leading-relaxed text-black/80">
                        {car.strengths?.map((t, i) => (
                          <li key={`${t}-${i}`} className="flex gap-2">
                            <span className="mt-[0.35em] h-1.5 w-1.5 flex-none rounded-full bg-black/40" />
                            <span className="min-w-0">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* メインコンテンツグリッド */}
        <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* =========================================================
           * C. スペック（罫線ミニマル）
           * - 既存の表示内容は維持
           * - 見た目を「border-bの整理されたリスト」へ寄せる
           * ======================================================= */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <h2 className="serif-heading mb-6 text-lg font-medium text-slate-900">
                基本スペック
              </h2>

              <dl className="divide-y divide-slate-100">
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
                        className="grid grid-cols-[140px_1fr] gap-4 py-3"
                      >
                        <dt className="text-[11px] font-medium text-slate-400">
                          {item.label}
                        </dt>
                        <dd className="min-w-0 text-right text-[12px] font-medium text-slate-800">
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
                        <dd className="font-medium">
                          {formatMm(car.lengthMm)}
                        </dd>
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
                        <dd className="font-medium">
                          {formatMm(car.heightMm)}
                        </dd>
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

          {/* 性格/お金まわり（ここから下は “見た目の上書き対象外” として原文維持） */}
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

        {/* 長所/短所セクション（原文維持） */}
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

        {/* トラブル傾向/維持の注意（原文維持） */}
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

        {/* Ownership棚（GUIDE INDEX）（原文維持） */}
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

        {/* この車にまつわるコラム（原文維持） */}
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

        {/* このブランド/モデルに関係するHERITAGE（原文維持） */}
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

        {/* 関連コンテンツへの導線（ID/slugベース）（原文維持） */}
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

        {/* CTAアンカー */}
        <div id="used-market" className="sr-only">
          used-market
        </div>
      </div>
    </main>
  );
}
