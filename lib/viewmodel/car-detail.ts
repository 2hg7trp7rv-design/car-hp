// lib/viewmodel/car-detail.ts

import { getSiteUrl } from "@/lib/site";
import { getMonetizeConfig, type MonetizeKey } from "@/lib/monetize/config";
import type { CarItem } from "@/lib/cars";
import type { GuideItem } from "@/lib/guides";
import type { ColumnItem } from "@/lib/columns";
import type { HeritageItem } from "@/lib/heritage";
import { normalizeBullets } from "@/lib/viewmodel/text";

import { getRelatedSlugs } from "@/lib/linking/related";

export type ExtendedCarItem = CarItem & {
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

export type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
};

export type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
};

export type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
  heroTitle?: string | null;
};

export function formatDifficultyLabel(difficulty?: string | null): string | null {
  if (!difficulty) return null;
  const normalized = difficulty.toLowerCase();
  if (normalized === "beginner") return "BEGINNER";
  if (normalized === "intermediate") return "INTERMEDIATE";
  if (normalized === "advanced") return "ADVANCED";
  return difficulty.toUpperCase();
}

export function formatMakerAndName(car: ExtendedCarItem): string {
  const maker = (car.maker ?? "").trim();
  const name = (car.name ?? car.slug).trim();
  if (!maker) return name;
  if (name.toLowerCase().startsWith(maker.toLowerCase())) return name;
  return `${maker} ${name}`;
}

export type CarDetailMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage: string | null;
};

export function buildCarDetailMeta(car: ExtendedCarItem): CarDetailMeta {
  const name = formatMakerAndName(car);
  const title = `${name} | CARS | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    `${name}の特徴・維持費・中古相場の要点を、世界観を壊さずにまとめました。`;

  return {
    title,
    description,
    canonicalPath: `/cars/${encodeURIComponent(car.slug)}`,
    ogImage: car.heroImage ?? car.mainImage ?? null,
  };
}

export function formatZeroTo100(value?: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  const raw = typeof value === "number" ? `${value}` : value;
  const normalized = raw.trim();
  if (!normalized) return null;
  if (normalized.includes("秒")) return normalized;
  return `${normalized}秒`;
}

export function formatDateJa(value?: string | null): string | null {
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

export function pickGuidesForCar(slug: string, allGuides: GuideWithMeta[]): GuideItem[] {
  return allGuides
    .filter((guide) => getRelatedSlugs(guide as any, "cars").some((candidate) => candidate === slug))
    .slice(0, 6);
}

export function pickColumnsForCar(slug: string, allColumns: ColumnWithMeta[]): ColumnItem[] {
  return allColumns
    .filter((column) => getRelatedSlugs(column as any, "cars").some((candidate) => candidate === slug))
    .slice(0, 6);
}

export function pickHeritageForCar(slug: string, allHeritage: HeritageWithMeta[]): HeritageWithMeta[] {
  return allHeritage
    .filter((item) => (item.keyCarSlugs ?? []).some((candidate) => candidate === slug))
    .slice(0, 6);
}

type InventoryBg = { src?: string; gradientClass?: string };

function pickBrandTone(makerRaw?: string) {
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
}

function pickBodyTone(bodyTypeRaw?: string) {
  const body = (bodyTypeRaw ?? "").toLowerCase();

  if (body.includes("suv")) return "from-slate-950 via-emerald-950/35 to-slate-900";
  if (body.includes("coupe")) return "from-slate-950 via-violet-950/35 to-slate-900";
  if (body.includes("wagon")) return "from-slate-950 via-cyan-950/35 to-slate-900";
  if (body.includes("minivan")) return "from-slate-950 via-amber-950/30 to-slate-900";
  return null;
}

function pickSecondaryMonetizeKey(car: ExtendedCarItem): MonetizeKey {
  const difficulty = (car.difficulty ?? "").toLowerCase();
  const maker = (car.maker ?? "").toLowerCase();
  const bodyType = (car.bodyType ?? "").toLowerCase();

  const troubleCount = (car.troubleTrends ?? []).length + (car.maintenanceNotes ?? []).length;
  const hasCostText = Boolean((car.costImpression ?? "").trim());
  const hasPrice = Boolean((car.priceUsed ?? "").trim() || (car.priceNew ?? "").trim());

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

  if (hasPrice || premiumMaker || bodyType.includes("suv") || difficulty === "intermediate") {
    return "loan_estimate";
  }

  return "car_search_price";
}

export function buildCarDetailModel(args: {
  car: ExtendedCarItem;
  allGuides: GuideWithMeta[];
  allColumns: ColumnWithMeta[];
  allHeritage: HeritageWithMeta[];
}) {
  const { car, allGuides, allColumns, allHeritage } = args;

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);
  const difficultyLabel = formatDifficultyLabel(car.difficulty);

  const overviewText = car.summaryLong ?? car.summary ?? "";
  const characterText = car.costImpression ?? car.summary ?? "";

  const heroImage = car.heroImage ?? car.mainImage ?? null;
  const heroSrc = heroImage ?? "/images/cars/placeholder.jpg";

  const relatedGuides = pickGuidesForCar(car.slug, allGuides);
  const relatedColumns = pickColumnsForCar(car.slug, allColumns);
  const relatedHeritage = pickHeritageForCar(car.slug, allHeritage);

  const concernsItems = normalizeBullets(car.troubleTrends ?? car.weaknesses, [
    "現在、オーナーの声（故障傾向・持病）を整理中です。",
    "購入前は整備記録・保証条件・修復歴の確認を推奨します。",
    "年式/走行距離で個体差が出やすい点に注意してください。",
  ]);

  const helpsItems = normalizeBullets(car.strengths, [
    "維持費を抑えるコツ（消耗品/工賃/保険）を整理中です。",
    "購入時は『状態の良い個体』を優先し、後追い整備コストを減らすのが基本。",
    "相見積もり（保険・整備・購入）で総額を固めるとブレが減ります。",
  ]);

  const hasStrengths = Array.isArray(car.strengths) && car.strengths.length > 0;
  const hasWeaknesses = Array.isArray(car.weaknesses) && car.weaknesses.length > 0;
  const hasTroubleTrends = Array.isArray(car.troubleTrends) && car.troubleTrends.length > 0;
  const hasMaintenanceNotes =
    Array.isArray(car.maintenanceNotes) && car.maintenanceNotes.length > 0;

  const externalPrimaryKey: MonetizeKey = "car_search_conditions";
  const externalSecondaryKey: MonetizeKey = pickSecondaryMonetizeKey(car);

  const ctaPrimary = getMonetizeConfig(externalPrimaryKey, { carName: car.name });
  const ctaSecondary = getMonetizeConfig(externalSecondaryKey, { carName: car.name });

  const externalQuickKeys: MonetizeKey[] = ([
    "ins_compare",
    "loan_precheck",
    "sell_price_check",
  ] as MonetizeKey[]).filter((k) => k !== externalPrimaryKey && k !== externalSecondaryKey);

  const pickInventoryCardBg = (): InventoryBg => {
    const body = (car.bodyType ?? "").toLowerCase();
    if (body.includes("sedan")) {
      return { src: "/images/hero-sedan.jpg" };
    }

    const brandTone = pickBrandTone(car.maker);
    const bodyTone = pickBodyTone(car.bodyType);

    return { gradientClass: `bg-gradient-to-br ${bodyTone ?? brandTone}` };
  };

  const hasSizeSpec = Boolean(car.size);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: heroImage ? [`${getSiteUrl()}${heroImage}`] : undefined,
    description:
      car.summaryLong ?? car.summary ?? `${title}の特徴・維持費・中古相場の要点をまとめました。`,
    brand: car.maker ? { "@type": "Brand", name: car.maker } : undefined,
    url: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HOME", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "CARS", item: `${getSiteUrl()}/cars` },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      },
    ],
  };

  const jsonLd = [
    { id: `jsonld-car-${car.slug}-product`, type: "Product" as const, data: structuredData },
    { id: `jsonld-car-${car.slug}-breadcrumb`, type: "BreadcrumbList" as const, data: breadcrumbData },
  ];

  const related = {
    cars: [] as CarItem[],
    guides: relatedGuides,
    columns: relatedColumns,
    heritage: relatedHeritage,
  };

  const meta = buildCarDetailMeta(car);

  return {
    meta,
    jsonLd,
    related,

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
    inventoryCardBg: pickInventoryCardBg(),
    hasSizeSpec,
    structuredData,
    breadcrumbData,
  };
}
