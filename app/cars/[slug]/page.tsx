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

import { JsonLd } from "@/components/seo/JsonLd";
import { getMonetizeConfig, type MonetizeKey } from "@/lib/monetize/config";

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

  priceNew?: string;
  priceUsed?: string;

  releaseYear?: number;
  engine?: string;
  horsepower?: number;
  drive?: string;
  transmission?: string;
  zeroTo100?: string | number;
  fuel?: string;
  fuelEconomy?: string;

  segment?: string;
  bodyType?: string;

  relatedNewsIds?: string[];

  size?: Record<string, string | number>;
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
};

// ----------------------------------------
// ユーティリティ
// ----------------------------------------

function formatDifficultyLabel(difficulty?: string | null): string | null {
  if (!difficulty) return null;
  const normalized = difficulty.toLowerCase();
  if (normalized === "beginner") return "BEGINNER";
  if (normalized === "intermediate") return "INTERMEDIATE";
  if (normalized === "advanced") return "ADVANCED";
  return difficulty.toUpperCase();
}

function formatMakerAndName(car: ExtendedCarItem): string {
  const maker = (car.maker ?? "").trim();
  const name = (car.name ?? car.slug).trim();
  if (!maker) return name;
  if (name.toLowerCase().startsWith(maker.toLowerCase())) return name;
  return `${maker} ${name}`;
}

function formatZeroTo100(value?: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "number" ? `${value}` : value;
  const normalized = raw.trim();
  if (!normalized) return null;
  if (normalized.includes("秒")) return normalized;
  return `${normalized}秒`;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return null;
  }
}

function splitIntoParagraphs(text: string): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (rawBlocks.length > 1) return rawBlocks;

  const sentences = normalized.split(/。/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length <= 2) return [normalized];

  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join("。");
    paras.push(chunk + "。");
  }
  return paras;
}

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

function pickGuidesForCar(slug: string, allGuides: GuideWithMeta[]): GuideItem[] {
  return allGuides
    .filter((guide) =>
      (guide.relatedCarSlugs ?? []).some((candidate) => candidate === slug),
    )
    .slice(0, 6);
}

function pickColumnsForCar(
  slug: string,
  allColumns: ColumnWithMeta[],
): ColumnItem[] {
  return allColumns
    .filter((column) =>
      (column.relatedCarSlugs ?? []).some((candidate) => candidate === slug),
    )
    .slice(0, 6);
}

function pickHeritageForCar(
  slug: string,
  allHeritage: HeritageWithMeta[],
): HeritageWithMeta[] {
  return allHeritage
    .filter((item) =>
      (item.keyCarSlugs ?? []).some((candidate) => candidate === slug),
    )
    .slice(0, 6);
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

  const title = `${formatMakerAndName(car)} | CARS | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    `${formatMakerAndName(car)}の特徴・維持費・中古相場の要点を、世界観を壊さずにまとめました。`;

  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;
  const image =
    car.heroImage ??
    car.mainImage ??
    `${getSiteUrl()}/images/hero-sedan.jpg`;

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

  const relatedGuides = pickGuidesForCar(car.slug, guidesWithMeta);
  const relatedColumns = pickColumnsForCar(car.slug, columnsWithMeta);
  const relatedHeritage = pickHeritageForCar(car.slug, heritageWithMeta);

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  const overviewText = car.summaryLong ?? car.summary ?? "";
  const characterText = car.costImpression ?? car.summary ?? "";
  const difficultyLabel = formatDifficultyLabel(car.difficulty);

  const heroImage = car.heroImage ?? car.mainImage ?? null;

  const normalizeBulletList = (values?: unknown): string[] => {
    if (!Array.isArray(values)) return [];
    return values
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  };

  const uniqList = (items: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
      if (seen.has(item)) continue;
      seen.add(item);
      result.push(item);
    }
    return result;
  };

  const ensureMinItems = (
    items: string[],
    min: number,
    placeholder: string,
  ): string[] => {
    if (items.length >= min) return items;
    const filled = [...items];
    while (filled.length < min) filled.push(placeholder);
    return filled;
  };

  const concernsRaw = uniqList([
    ...normalizeBulletList(car.troubleTrends),
    ...normalizeBulletList(car.weaknesses),
  ]);

  const helpsRaw = uniqList([...normalizeBulletList(car.strengths)]);

  const placeholderLine = "準備中（情報を更新予定）";
  const concerns = ensureMinItems(concernsRaw, 3, placeholderLine);
  const helps = ensureMinItems(helpsRaw, 3, placeholderLine);

  const hasMaintenanceNotes =
    Array.isArray(car.maintenanceNotes) && car.maintenanceNotes.length > 0;

  // -------------------------
  // 外部導線（主CTA + 副CTA + クイック）
  // -------------------------

  const pickSecondaryMonetizeKey = (car: ExtendedCarItem): MonetizeKey => {
    const difficulty = (car.difficulty ?? "").toLowerCase();
    const maker = (car.maker ?? "").toLowerCase();
    const bodyType = (car.bodyType ?? "").toLowerCase();

    const troubleCount =
      (car.troubleTrends ?? []).length + (car.maintenanceNotes ?? []).length;
    const hasCostText = Boolean((car.costImpression ?? "").trim());
    const hasPrice = Boolean(
      (car.priceUsed ?? "").trim() || (car.priceNew ?? "").trim(),
    );

    if (troubleCount >= 3 || hasCostText || difficulty === "advanced") {
      return "ins_compare";
    }

    const premiumMaker =
      maker.includes("bmw") ||
      maker.includes("mercedes") ||
      maker.includes("benz") ||
      maker.includes("porsche") ||
      maker.includes("audi") ||
      maker.includes("lexus") ||
      maker.includes("ferrari") ||
      maker.includes("lamborghini");

    if (
      hasPrice ||
      premiumMaker ||
      bodyType.includes("suv") ||
      difficulty === "intermediate"
    ) {
      return "loan_estimate";
    }

    return "car_search_price";
  };

  const externalPrimaryKey: MonetizeKey = "car_search_conditions";
  const externalSecondaryKey: MonetizeKey = pickSecondaryMonetizeKey(car);

  const ctaPrimary = getMonetizeConfig(externalPrimaryKey);
  const ctaSecondary = getMonetizeConfig(externalSecondaryKey);

  const externalQuickKeys: MonetizeKey[] = ([
    "ins_compare",
    "loan_precheck",
    "sell_price_check",
  ] as MonetizeKey[]).filter(
    (k) => k !== externalPrimaryKey && k !== externalSecondaryKey,
  );

  // -------------------------
  // 外部カード背景（簡易トーン）
  // -------------------------

  const pickBrandTone = (makerRaw?: string) => {
    const maker = (makerRaw ?? "").toLowerCase();

    if (
      maker.includes("bmw") ||
      maker.includes("mercedes") ||
      maker.includes("benz") ||
      maker.includes("audi") ||
      maker.includes("porsche") ||
      maker.includes("volvo")
    ) {
      return "from-slate-950 via-slate-800 to-slate-900";
    }

    if (
      maker.includes("ferrari") ||
      maker.includes("lamborghini") ||
      maker.includes("alfa") ||
      maker.includes("maserati")
    ) {
      return "from-zinc-950 via-rose-950/80 to-zinc-900";
    }

    if (
      maker.includes("nissan") ||
      maker.includes("toyota") ||
      maker.includes("lexus") ||
      maker.includes("honda") ||
      maker.includes("subaru") ||
      maker.includes("mazda")
    ) {
      return "from-slate-950 via-indigo-950/70 to-slate-900";
    }

    return "from-slate-950 via-slate-800 to-slate-900";
  };

  const pickBodyTone = (bodyTypeRaw?: string) => {
    const body = (bodyTypeRaw ?? "").toLowerCase();

    if (body.includes("suv"))
      return "from-slate-950 via-emerald-950/35 to-slate-900";
    if (body.includes("coupe"))
      return "from-slate-950 via-violet-950/35 to-slate-900";
    if (body.includes("wagon"))
      return "from-slate-950 via-cyan-950/35 to-slate-900";
    if (body.includes("minivan"))
      return "from-slate-950 via-amber-950/30 to-slate-900";
    return null;
  };

  type InventoryBg = { src?: string; gradientClass?: string };

  const pickInventoryCardBg = (): InventoryBg => {
    const body = (car.bodyType ?? "").toLowerCase();
    if (body.includes("sedan")) {
      return { src: "/images/hero-sedan.jpg" };
    }

    const brandTone = pickBrandTone(car.maker);
    const bodyTone = pickBodyTone(car.bodyType);

    return {
      gradientClass: `bg-gradient-to-br ${bodyTone ?? brandTone}`,
    };
  };

  const hasSizeSpec = Boolean(car.size);

  // -------------------------
  // JSON-LD
  // -------------------------

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: heroImage ? [`${getSiteUrl()}${heroImage}`] : undefined,
    description:
      car.summaryLong ??
      car.summary ??
      `${title}の特徴・維持費・中古相場の要点をまとめました。`,
    brand: car.maker ? { "@type": "Brand", name: car.maker } : undefined,
    url: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HOME", item: getSiteUrl() },
      {
        "@type": "ListItem",
        position: 2,
        name: "CARS",
        item: `${getSiteUrl()}/cars`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      },
    ],
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id={`jsonld-car-${car.slug}-product`} data={structuredData} />
      <JsonLd id={`jsonld-car-${car.slug}-breadcrumb`} data={breadcrumbData} />

      <ScrollDepthTracker />

      {/* ① ヒーロー：フルブリード画像 + 画像上オーバーレイ */}
      {heroImage ? (
        <section className="relative w-full overflow-hidden bg-black">
          <div className="relative h-[520px] w-full sm:h-[560px]">
            <Image
              src={heroImage}
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
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full bg-black">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-7">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60">
              CAR BOUTIQUE
            </p>
            <h1 className="serif-heading mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {title}
            </h1>
          </div>
        </section>
      )}

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

        {/* ② 主要コンテンツ（写真の構造：左に概要、右に特徴カード上下） */}
        <section className="mb-10">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 左：概要（全文） */}
              {overviewText ? (
                <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    OVERVIEW
                  </p>
                  <h2 className="serif-heading mb-4 text-lg font-medium text-slate-900">
                    概要
                  </h2>

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
                </div>
              ) : (
                <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    OVERVIEW
                  </p>
                  <h2 className="serif-heading mb-4 text-lg font-medium text-slate-900">
                    概要
                  </h2>
                  <p className="text-[13px] leading-[1.9] text-slate-700 sm:text-[14px]">
                    概要テキストが未設定です。
                  </p>
                </div>
              )}

              {/* 右：特徴カード（上下） */}
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
                          {concerns.map(
                            (item: string, index: number) => (
                              <li key={index} className="flex items-start gap-2.5">
                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                                <p className="whitespace-pre-wrap">{item}</p>
                              </li>
                            ),
                          )}
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
                      {helps.map(
                        (item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                            <p className="whitespace-pre-wrap">{item}</p>
                          </li>
                        ),
                      )}
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

              {hasMaintenanceNotes && (
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
            const bg = pickInventoryCardBg();

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
                      const c = getMonetizeConfig(k);
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
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                    OWNERSHIP REALITY
                  </p>
                  <h2 className="serif-heading mt-2 text-xl font-semibold text-slate-900">
                    Ownership shelf
                  </h2>
                </div>
                <Link
                  href="/guide"
                  className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  GUIDEへ →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/guide/${encodeURIComponent(guide.slug)}`}
                    className="group block"
                  >
                    <GlassCard className="p-6 sm:p-7">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                        GUIDE
                      </p>
                      <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {guide.title}
                      </h3>
                      {guide.summary && (
                        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {guide.summary}
                        </p>
                      )}
                      <p className="mt-4 text-[12px] font-semibold text-tiffany-700">
                        読む →
                      </p>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {relatedColumns.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                    NEXT READ
                  </p>
                  <h2 className="serif-heading mt-2 text-xl font-semibold text-slate-900">
                    Next Read shelf
                  </h2>
                </div>
                <Link
                  href="/column"
                  className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  COLUMNへ →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedColumns.map((column) => (
                  <Link
                    key={column.id}
                    href={`/column/${encodeURIComponent(column.slug)}`}
                    className="group block"
                  >
                    <GlassCard className="p-6 sm:p-7">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                          COLUMN
                        </p>
                        {column.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(column.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {column.title}
                      </h3>

                      {column.summary && (
                        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {column.summary}
                        </p>
                      )}

                      <p className="mt-4 text-[12px] font-semibold text-tiffany-700">
                        読む →
                      </p>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {relatedHeritage.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                    HERITAGE
                  </p>
                  <h2 className="serif-heading mt-2 text-xl font-semibold text-slate-900">
                    Heritage shelf
                  </h2>
                </div>
                <Link
                  href="/heritage"
                  className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  HERITAGEへ →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedHeritage.map((h) => {
                  const preview = getHeritagePreviewText(h);
                  return (
                    <Link
                      key={h.id}
                      href={`/heritage/${encodeURIComponent(h.slug)}`}
                      className="group block"
                    >
                      <GlassCard className="p-6 sm:p-7">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                            HERITAGE
                          </p>
                          {h.publishedAt && (
                            <span className="ml-auto text-[10px] text-slate-400">
                              {formatDate(h.publishedAt)}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                          {h.heroTitle ?? h.title}
                        </h3>

                        {preview && (
                          <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {preview}
                          </p>
                        )}

                        <p className="mt-4 text-[12px] font-semibold text-tiffany-700">
                          読む →
                        </p>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </section>
        )}
      </div>
    </main>
  );
}
