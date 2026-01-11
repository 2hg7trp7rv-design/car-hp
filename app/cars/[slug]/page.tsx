// app/cars/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackedOutboundLink } from "@/components/analytics/TrackedOutboundLink";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ShelfImpression } from "@/components/analytics/ShelfImpression";
import { CtaImpressionSentinel } from "@/components/analytics/CtaImpressionSentinel";
import { getSiteUrl } from "@/lib/site";
import { buildCarDescription, buildCarTitleBase, withBrand } from "@/lib/seo/serp";

import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";
import {
  getNewsByMaker,
  getNewsByRelatedCarSlug,
  type NewsItem,
} from "@/lib/news";
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
import { FixedGuideShelf } from "@/components/guide/FixedGuideShelf";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";
import { CompareAddButton } from "@/components/compare/CompareAddButton";

import { JsonLd } from "@/components/seo/JsonLd";
import { getMonetizeConfig, type MonetizeKey } from "@/lib/monetize/config";
import { inferGoodsMonetizeKeyForCar } from "@/lib/monetize/inferGoodsMonetizeKey";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { isIndexableCar } from "@/lib/seo/indexability";

import { normalizeMakerParamToKey } from "@/lib/taxonomy/makers";
import { getBodyTypeKey } from "@/lib/taxonomy/body-type-hubs";
import { getSegmentKey } from "@/lib/taxonomy/segments";


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
    .filter((item) => {
      const related = Array.isArray(item.relatedCarSlugs)
        ? item.relatedCarSlugs
        : [];

      // Backward/forward compatibility: if we ever add `keyCarSlugs` later,
      // keep it working without breaking the current JSON schema.
      const key = Array.isArray((item as any).keyCarSlugs)
        ? ((item as any).keyCarSlugs as (string | null)[])
        : [];

      // Also allow section-level carSlugs to count as "related".
      const sectionCars = Array.isArray((item as any).sections)
        ? ((item as any).sections as any[]).flatMap((s) =>
            Array.isArray(s?.carSlugs) ? s.carSlugs : [],
          )
        : [];

      const candidates = [...related, ...key, ...sectionCars].filter(
        (v): v is string => typeof v === "string" && v.length > 0,
      );

      return candidates.some((candidate) => candidate === slug);
    })
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
  if (!car) {
    return {
      title: "車種が見つかりません",
      description: "指定された車種ページが見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  // NOTE: layout.tsx の title.template で末尾にブランドが付く。
  // ページ側では “ブランド抜きの title” を返す（重複防止）。
  const titleBase = buildCarTitleBase(car);
  const titleFull = withBrand(titleBase);
  const description = buildCarDescription(car);

  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;
  const rawImage = (car.heroImage ?? car.mainImage ?? "/images/hero-sedan.jpg") as string;
  const image = rawImage.startsWith("http") ? rawImage : `${getSiteUrl()}${rawImage}`;

  return {
    title: titleBase,
    description,
    openGraph: {
      title: titleFull,
      description,
      url,
      type: "article",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: isIndexableCar(car) ? undefined : NOINDEX_ROBOTS,
  };
}

// ----------------------------------------
// Page
// ----------------------------------------

export default async function CarDetailPage({ params }: PageProps) {
  const [carRaw, allGuidesRaw, allColumnsRaw, allHeritageRaw, allCarsRaw] =
    await Promise.all([
      getCarBySlug(params.slug),
      getAllGuides(),
      getAllColumns(),
      getAllHeritage(),
      getAllCars(),
    ]);

  if (!carRaw) notFound();

  const car = carRaw as ExtendedCarItem;

  // -------------------------
  // 類似モデル（同セグメント / 同ボディタイプ / 同メーカー）
  // -------------------------
  const allCars = (allCarsRaw ?? []) as ExtendedCarItem[];
  const otherCars = allCars.filter((c) => c?.slug && c.slug !== car.slug);

  const makerKeyNormalized =
    car.makerKey ?? (car.maker ? normalizeMakerParamToKey(car.maker) : "");
  const segmentKeyNormalized = car.segment ? getSegmentKey(car.segment) : "";
  const bodyTypeKeyNormalized = car.bodyType ? getBodyTypeKey(car.bodyType) : "";

  const sortCarsByRecency = (a: ExtendedCarItem, b: ExtendedCarItem) => {
    const yA = a.releaseYear ?? 0;
    const yB = b.releaseYear ?? 0;
    if (yA !== yB) return yB - yA;
    const nameA = `${a.maker ?? ""} ${a.name ?? ""}`.trim();
    const nameB = `${b.maker ?? ""} ${b.name ?? ""}`.trim();
    return nameA.localeCompare(nameB);
  };

  const similarBySegment = segmentKeyNormalized
    ? otherCars
        .filter((c) => c.segment && getSegmentKey(c.segment) === segmentKeyNormalized)
        .sort(sortCarsByRecency)
        .slice(0, 4)
    : [];

  const similarByBodyType = bodyTypeKeyNormalized
    ? otherCars
        .filter((c) => c.bodyType && getBodyTypeKey(c.bodyType) === bodyTypeKeyNormalized)
        .sort(sortCarsByRecency)
        .slice(0, 4)
    : [];

  const similarByMaker = makerKeyNormalized
    ? otherCars
        .filter(
          (c) =>
            (c.makerKey ?? normalizeMakerParamToKey(c.maker ?? "")) === makerKeyNormalized,
        )
        .sort(sortCarsByRecency)
        .slice(0, 4)
    : [];

  const seenSimilar = new Set<string>();
  const similarSegment = similarBySegment.filter((c) => {
    if (!c?.slug) return false;
    if (seenSimilar.has(c.slug)) return false;
    seenSimilar.add(c.slug);
    return true;
  });
  const similarBodyType = similarByBodyType.filter((c) => {
    if (!c?.slug) return false;
    if (seenSimilar.has(c.slug)) return false;
    seenSimilar.add(c.slug);
    return true;
  });
  const similarMaker = similarByMaker.filter((c) => {
    if (!c?.slug) return false;
    if (seenSimilar.has(c.slug)) return false;
    seenSimilar.add(c.slug);
    return true;
  });

  // ★ 車種ページ: メンテ/弱点に合わせて PR を1枠だけ推定（デフォルトは汎用カー用品）
  const carGoodsMonetizeKey = inferGoodsMonetizeKeyForCar(car);

  const guidesWithMeta = allGuidesRaw as GuideWithMeta[];
  const columnsWithMeta = allColumnsRaw as ColumnWithMeta[];
  const heritageWithMeta = allHeritageRaw as HeritageWithMeta[];

  const relatedGuides = pickGuidesForCar(car.slug, guidesWithMeta);
  const relatedColumns = pickColumnsForCar(car.slug, columnsWithMeta);
  const relatedHeritage = pickHeritageForCar(car.slug, heritageWithMeta);

  // ⑥ 関連：OFFICIAL NEWS（メーカー/車種）
  let relatedNews: NewsItem[] = [];
  try {
    // まずは「車種slugで明示的に関連付けされたNEWS」を優先
    const byCar = await getNewsByRelatedCarSlug(car.slug, 6);
    if (byCar.length > 0) {
      relatedNews = byCar;
    } else if (car.maker) {
      // なければメーカー公式NEWSへフォールバック（新しい順）
      // ただし「車種固有のワード」が含まれるニュースを優先して並べ替える。
      // （relatedCarSlugs が未整備でも、内部リンクの当たり率を上げる）
      const byMaker = await getNewsByMaker(car.maker, 24);

      const makerKey = (car.maker ?? "").trim().toLowerCase();
      const slugTokens = (car.slug ?? "")
        .split(/[-_]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const nameTokens = (() => {
        const name = `${car.name ?? ""} ${(car as any).grade ?? ""}`;
        const matches = name.match(/[A-Za-z0-9]+/g) ?? [];
        return matches
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length >= 2);
      })();

      const tokens = Array.from(
        new Set(
          [...slugTokens, ...nameTokens]
            .filter((t) => t && t !== makerKey)
            // あまりに汎用的なトークンは除外
            .filter((t) => !["car", "cars", "model", "new"].includes(t))
            // 2文字はノイズになりやすいので、英字のみ2文字は落とす
            .filter((t) => !(t.length === 2 && /^[a-z]+$/.test(t))),
        ),
      );

      const scoreNews = (n: NewsItem): number => {
        const title = (n.titleJa ?? n.title ?? "").toString().toLowerCase();
        const excerpt = (n.excerpt ?? n.commentJa ?? "").toString().toLowerCase();
        const tags = Array.isArray(n.tags)
          ? n.tags
              .filter((x): x is string => typeof x === "string")
              .join(" ")
              .toLowerCase()
          : "";
        const haystack = `${title} ${excerpt} ${tags}`;

        let score = 0;

        // 車種slugが丸ごと入っていたら最優先
        if (car.slug && haystack.includes(car.slug.toLowerCase())) {
          score += 30;
        }

        // トークン一致で加点
        for (const t of tokens) {
          if (!t) continue;
          if (haystack.includes(t)) {
            score += t.length >= 4 ? 6 : 3;
          }
        }

        // maker一致は前提なので少しだけ
        if (car.maker && n.maker && car.maker === n.maker) score += 1;

        return score;
      };

      const scored = byMaker
        .map((n) => ({ n, s: scoreNews(n) }))
        .sort((a, b) => {
          if (a.s !== b.s) return b.s - a.s;
          const at = new Date(a.n.publishedAt ?? a.n.createdAt ?? 0).getTime();
          const bt = new Date(b.n.publishedAt ?? b.n.createdAt ?? 0).getTime();
          return bt - at;
        });

      const picked = scored.filter((x) => x.s > 0).slice(0, 6).map((x) => x.n);
      relatedNews = picked.length > 0 ? picked : byMaker.slice(0, 6);
    }
  } catch {
    relatedNews = [];
  }

  relatedNews = relatedNews.slice(0, 3);

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  const overviewText = car.summaryLong ?? car.summary ?? "";
  const characterText = car.costImpression ?? car.summary ?? "";
  const heroImage = car.heroImage ?? car.mainImage ?? null;

  const heroSrc = heroImage ?? "/images/cars/placeholder.jpg";

  const normalizeBullets = (items: unknown, fallback: string[]): string[] => {
    const cleaned = Array.isArray(items)
      ? items
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    if (cleaned.length === 0) return fallback;
    if (cleaned.length >= 3) return cleaned;
    return [...cleaned, ...fallback].slice(0, 3);
  };

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
  const hasWeaknesses =
    Array.isArray(car.weaknesses) && car.weaknesses.length > 0;
  const hasTroubleTrends =
    Array.isArray(car.troubleTrends) && car.troubleTrends.length > 0;
  const hasMaintenanceNotes =
    Array.isArray(car.maintenanceNotes) && car.maintenanceNotes.length > 0;

  // -------------------------
  // 外部導線（主CTA + 副CTA + クイック）
  // -------------------------

  const pickSecondaryMonetizeKey = (car: ExtendedCarItem): MonetizeKey => {
    const maker = (car.maker ?? "").toLowerCase();
    const bodyType = (car.bodyType ?? "").toLowerCase();

    const troubleCount =
      (car.troubleTrends ?? []).length + (car.maintenanceNotes ?? []).length;
    const hasCostText = Boolean((car.costImpression ?? "").trim());
    const hasPrice = Boolean(
      (car.priceUsed ?? "").trim() || (car.priceNew ?? "").trim(),
    );

    // 故障/持病が多い or 維持費コメントあり → 保険/保証・修理費の比較へ
    if (troubleCount >= 3 || hasCostText) {
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

    // 価格情報がある / 高額・輸入プレミアム / SUV → 資金計画へ
    if (hasPrice || premiumMaker || bodyType.includes("suv")) {
      return "loan_estimate";
    }

    return "car_search_price";
  };

  const externalPrimaryKey: MonetizeKey = "car_search_conditions";
  const externalSecondaryKey: MonetizeKey = pickSecondaryMonetizeKey(car);

  const ctaPrimary = getMonetizeConfig(externalPrimaryKey, { carName: car.name });
  const ctaSecondary = getMonetizeConfig(externalSecondaryKey, { carName: car.name });

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

  const sizeSpec: Record<string, string | number> | null = (() => {
    const out: Record<string, string | number> = {};
    if (car.lengthMm) out["全長"] = `${car.lengthMm}mm`;
    if (car.widthMm) out["全幅"] = `${car.widthMm}mm`;
    if (car.heightMm) out["全高"] = `${car.heightMm}mm`;
    if (car.wheelbaseMm) out["ホイールベース"] = `${car.wheelbaseMm}mm`;
    if (car.weightKg) out["車両重量"] = `${car.weightKg}kg`;
    return Object.keys(out).length > 0 ? out : null;
  })();

  const hasSizeSpec = Boolean(sizeSpec);

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

      {/* ① ヒーロー：フルブリード画像 + 画像上オーバーレイ（車種で必ず統一） */}
      <section className="relative w-full overflow-hidden bg-black">
        <div className="relative h-[520px] w-full sm:h-[560px]">
          <Image
            src={heroSrc}
            alt={title}
            fill
            quality={72}
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

              <h1 className="serif-heading mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                {car.maker && (
                  <Link
                    href={`/cars/makers/${encodeURIComponent(
                      car.makerKey ?? normalizeMakerParamToKey(car.maker),
                    )}`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85 transition hover:bg-white/15"
                  >
                    {car.maker}
                  </Link>
                )}
                {car.bodyType && (
                  <Link
                    href={`/cars/body-types/${encodeURIComponent(getBodyTypeKey(car.bodyType))}`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85 transition hover:bg-white/15"
                  >
                    {car.bodyType}
                  </Link>
                )}
                {car.segment && (
                  <Link
                    href={`/cars/segments/${encodeURIComponent(getSegmentKey(car.segment))}`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/85 transition hover:bg-white/15"
                  >
                    {car.segment}
                  </Link>
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
                <CtaImpressionSentinel
                  pageType="cars_detail"
                  contentId={car.slug}
                  monetizeKey={ctaPrimary.key}
                  position="cars_hero_primary"
                  ctaId={`cars_${car.slug}_${ctaPrimary.key}_hero_primary`}
                  variant="car_detail_hero_v1"
                >
                  <TrackedOutboundLink
                    href={ctaPrimary.url}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/30 transition hover:bg-white/90"
                    pageType="cars_detail"
                    contentId={car.slug}
                    monetizeKey={ctaPrimary.key}
                    position="cars_hero_primary"
                    ctaId={`cars_${car.slug}_${ctaPrimary.key}_hero_primary`}
                    partner="affiliate"
                  >
                    {ctaPrimary.label} <span aria-hidden>→</span>
                  </TrackedOutboundLink>
                </CtaImpressionSentinel>

                <CtaImpressionSentinel
                  pageType="cars_detail"
                  contentId={car.slug}
                  monetizeKey={ctaSecondary.key}
                  position="cars_hero_secondary"
                  ctaId={`cars_${car.slug}_${ctaSecondary.key}_hero_secondary`}
                  variant="car_detail_hero_v1"
                >
                  <TrackedOutboundLink
                    href={ctaSecondary.url}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-[12px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
                    pageType="cars_detail"
                    contentId={car.slug}
                    monetizeKey={ctaSecondary.key}
                    position="cars_hero_secondary"
                    ctaId={`cars_${car.slug}_${ctaSecondary.key}_hero_secondary`}
                    partner="affiliate"
                  >
                    {ctaSecondary.label} <span aria-hidden>→</span>
                  </TrackedOutboundLink>
                </CtaImpressionSentinel>

                <CompareAddButton
                  slug={car.slug}
                  label="比較する"
                  mode="pill"
                  goToCompare
                  source="car_detail_hero"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                />
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
                    value: car.powerPs ? `${car.powerPs}ps` : null,
                  },
                  {
                    label: "最大トルク",
                    value: car.torqueNm ? `${car.torqueNm}Nm` : null,
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

              {hasSizeSpec && sizeSpec && (
                <div className="mt-8">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    DIMENSIONS
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-700">
                    {Object.entries(sizeSpec).map(([key, value]) => (
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

        {/* ③.5 オーナー向け：メンテと用品（PR 1枠） */}
        <section className="mt-12 mb-12">
          <div className="mb-5 text-center">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              OWNER MAINTENANCE
            </p>
            <h2 className="serif-heading mt-2 text-xl font-medium text-slate-900">
              メンテと用品の定番
            </h2>
          </div>

          <GuideMonetizeBlock
            monetizeKey={carGoodsMonetizeKey}
            pageType="cars_detail"
            contentId={car.slug}
            position="cars_goods_pick"
            variant="auto_car_v1"
          />
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
                  <CtaImpressionSentinel
                    pageType="cars_detail"
                    contentId={car.slug}
                    monetizeKey={ctaPrimary.key}
                    position="cars_inventory_primary"
                    ctaId={`cars_${car.slug}_${ctaPrimary.key}_inventory_primary`}
                    variant="car_detail_inventory_v1"
                  >
                    <TrackedOutboundLink
                      href={ctaPrimary.url}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="group relative overflow-hidden rounded-[2.75rem] ring-1 ring-slate-100 shadow-soft-card"
                      pageType="cars_detail"
                      contentId={car.slug}
                      monetizeKey={ctaPrimary.key}
                      position="cars_inventory_primary"
                      ctaId={`cars_${car.slug}_${ctaPrimary.key}_inventory_primary`}
                      partner="affiliate"
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
                    </TrackedOutboundLink>
                  </CtaImpressionSentinel>

                  <CtaImpressionSentinel
                    pageType="cars_detail"
                    contentId={car.slug}
                    monetizeKey={ctaSecondary.key}
                    position="cars_inventory_secondary"
                    ctaId={`cars_${car.slug}_${ctaSecondary.key}_inventory_secondary`}
                    variant="car_detail_inventory_v1"
                  >
                    <TrackedOutboundLink
                      href={ctaSecondary.url}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="group relative overflow-hidden rounded-[2.75rem] ring-1 ring-slate-100 shadow-soft-card"
                      pageType="cars_detail"
                      contentId={car.slug}
                      monetizeKey={ctaSecondary.key}
                      position="cars_inventory_secondary"
                      ctaId={`cars_${car.slug}_${ctaSecondary.key}_inventory_secondary`}
                      partner="affiliate"
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
                    </TrackedOutboundLink>
                  </CtaImpressionSentinel>
                </div>

                <div className="mt-6 rounded-[2.25rem] bg-white p-5 ring-1 ring-slate-100 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] sm:p-6">
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    EXTERNAL QUICK
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {externalQuickKeys.slice(0, 3).map((k) => {
                      const c = getMonetizeConfig(k, { carName: car.name });
                      return (
                        <TrackedOutboundLink
                          key={c.key}
                          href={c.url}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] text-slate-900 ring-1 ring-slate-200"
                          pageType="cars_detail"
                          contentId={car.slug}
                          monetizeKey={c.key}
                          position="cars_inventory_quick"
                          ctaId={`cars_${car.slug}_${c.key}_inventory_quick`}
                          partner="affiliate"
                        >
                          {c.label} <span aria-hidden>→</span>
                        </TrackedOutboundLink>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </section>

        {/* ④.5 類似モデル：比較/回遊導線（同セグメント / 同ボディタイプ / 同メーカー） */}
        {(similarSegment.length > 0 ||
          similarBodyType.length > 0 ||
          similarMaker.length > 0) && (
          <section className="mb-12">
            <Reveal>
              <div className="mb-5 text-center">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  COMPARE
                </p>
                <h2 className="serif-heading mt-2 text-xl font-medium text-slate-900">
                  近いモデルで比較する
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                  条件が近い別モデルを並べると、強み/弱点がはっきりします。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {similarSegment.length > 0 && (
                  <ShelfImpression
                    shelfId="cars_similar_segment"
                    variant="car_detail_v1"
                  >
                    <div className="rounded-[2.5rem] bg-white p-5 ring-1 ring-slate-100 shadow-soft-card sm:p-6">
                      <div className="mb-3 flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                            SEGMENT
                          </p>
                          <h3 className="mt-2 text-[13px] font-semibold text-slate-900">
                            {car.segment}で比較
                          </h3>
                        </div>
                        {car.segment && (
                          <TrackedLink
                            href={`/cars/segments/${encodeURIComponent(
                              getSegmentKey(car.segment),
                            )}`}
                            className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                            shelfId="cars_similar_segment"
                            navId={`cars_similar_segment_more_${segmentKeyNormalized}`}
                            toType="cars"
                            toId={`segment_${segmentKeyNormalized}`}
                            toSlug={segmentKeyNormalized}
                            toTitle={`${car.segment}の車種一覧`}
                          >
                            一覧 →
                          </TrackedLink>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {similarSegment.map((c) => (
                          <TrackedLink
                            key={c.slug}
                            href={`/cars/${encodeURIComponent(c.slug)}`}
                            className="group block"
                            shelfId="cars_similar_segment"
                            navId={`cars_similar_segment_${c.slug}`}
                            toType="cars"
                            toId={c.slug}
                            toSlug={c.slug}
                            toTitle={`${c.maker ?? ""} ${c.name ?? ""}`.trim()}
                          >
                            <GlassCard className="p-4 sm:p-5">
                              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                                {c.maker}
                              </p>
                              <h4 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                                {c.name}
                              </h4>
                              <p className="mt-2 text-[11px] text-text-sub">
                                {[
                                  c.segment,
                                  c.bodyType,
                                  c.releaseYear ? `${c.releaseYear}年` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" / ")}
                              </p>
                            </GlassCard>
                          </TrackedLink>
                        ))}
                      </div>
                    </div>
                  </ShelfImpression>
                )}

                {similarBodyType.length > 0 && (
                  <ShelfImpression
                    shelfId="cars_similar_bodytype"
                    variant="car_detail_v1"
                  >
                    <div className="rounded-[2.5rem] bg-white p-5 ring-1 ring-slate-100 shadow-soft-card sm:p-6">
                      <div className="mb-3 flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                            BODY TYPE
                          </p>
                          <h3 className="mt-2 text-[13px] font-semibold text-slate-900">
                            {car.bodyType}で比較
                          </h3>
                        </div>
                        {car.bodyType && (
                          <TrackedLink
                            href={`/cars/body-types/${encodeURIComponent(
                              getBodyTypeKey(car.bodyType),
                            )}`}
                            className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                            shelfId="cars_similar_bodytype"
                            navId={`cars_similar_bodytype_more_${bodyTypeKeyNormalized}`}
                            toType="cars"
                            toId={`bodytype_${bodyTypeKeyNormalized}`}
                            toSlug={bodyTypeKeyNormalized}
                            toTitle={`${car.bodyType}の車種一覧`}
                          >
                            一覧 →
                          </TrackedLink>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {similarBodyType.map((c) => (
                          <TrackedLink
                            key={c.slug}
                            href={`/cars/${encodeURIComponent(c.slug)}`}
                            className="group block"
                            shelfId="cars_similar_bodytype"
                            navId={`cars_similar_bodytype_${c.slug}`}
                            toType="cars"
                            toId={c.slug}
                            toSlug={c.slug}
                            toTitle={`${c.maker ?? ""} ${c.name ?? ""}`.trim()}
                          >
                            <GlassCard className="p-4 sm:p-5">
                              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                                {c.maker}
                              </p>
                              <h4 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                                {c.name}
                              </h4>
                              <p className="mt-2 text-[11px] text-text-sub">
                                {[
                                  c.segment,
                                  c.bodyType,
                                  c.releaseYear ? `${c.releaseYear}年` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" / ")}
                              </p>
                            </GlassCard>
                          </TrackedLink>
                        ))}
                      </div>
                    </div>
                  </ShelfImpression>
                )}

                {similarMaker.length > 0 && (
                  <ShelfImpression
                    shelfId="cars_similar_maker"
                    variant="car_detail_v1"
                  >
                    <div className="rounded-[2.5rem] bg-white p-5 ring-1 ring-slate-100 shadow-soft-card sm:p-6">
                      <div className="mb-3 flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                            MAKER
                          </p>
                          <h3 className="mt-2 text-[13px] font-semibold text-slate-900">
                            {car.maker}で比較
                          </h3>
                        </div>
                        {car.maker && (
                          <TrackedLink
                            href={`/cars/makers/${encodeURIComponent(
                              car.makerKey ?? normalizeMakerParamToKey(car.maker),
                            )}`}
                            className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                            shelfId="cars_similar_maker"
                            navId={`cars_similar_maker_more_${makerKeyNormalized}`}
                            toType="cars"
                            toId={`maker_${makerKeyNormalized}`}
                            toSlug={makerKeyNormalized}
                            toTitle={`${car.maker}の車種一覧`}
                          >
                            一覧 →
                          </TrackedLink>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {similarMaker.map((c) => (
                          <TrackedLink
                            key={c.slug}
                            href={`/cars/${encodeURIComponent(c.slug)}`}
                            className="group block"
                            shelfId="cars_similar_maker"
                            navId={`cars_similar_maker_${c.slug}`}
                            toType="cars"
                            toId={c.slug}
                            toSlug={c.slug}
                            toTitle={`${c.maker ?? ""} ${c.name ?? ""}`.trim()}
                          >
                            <GlassCard className="p-4 sm:p-5">
                              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                                {c.maker}
                              </p>
                              <h4 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                                {c.name}
                              </h4>
                              <p className="mt-2 text-[11px] text-text-sub">
                                {[
                                  c.segment,
                                  c.bodyType,
                                  c.releaseYear ? `${c.releaseYear}年` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" / ")}
                              </p>
                            </GlassCard>
                          </TrackedLink>
                        ))}
                      </div>
                    </div>
                  </ShelfImpression>
                )}
              </div>
            </Reveal>
          </section>
        )}

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
                  <TrackedLink
                    key={guide.id}
                    href={`/guide/${encodeURIComponent(guide.slug)}`}
                    className="group block"
                    shelfId="cars_related_guides"
                    navId={`cars_related_guides_${guide.slug}`}
                    toType="guide"
                    toId={guide.slug}
                    toSlug={guide.slug}
                    toTitle={guide.title}
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
                  </TrackedLink>
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
                  <TrackedLink
                    key={column.id}
                    href={`/column/${encodeURIComponent(column.slug)}`}
                    className="group block"
                    shelfId="cars_related_columns"
                    navId={`cars_related_columns_${column.slug}`}
                    toType="column"
                    toId={column.slug}
                    toSlug={column.slug}
                    toTitle={column.title}
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
                  </TrackedLink>
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
                    <TrackedLink
                    key={h.id}
                    href={`/heritage/${encodeURIComponent(h.slug)}`}
                    className="group block"
                    shelfId="cars_related_heritage"
                    navId={`cars_related_heritage_${h.slug}`}
                    toType="heritage"
                    toId={h.slug}
                    toSlug={h.slug}
                    toTitle={h.title}
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
                  </TrackedLink>
                  );
                })}
              </div>
            </Reveal>
          </section>
        )}

        {relatedNews.length > 0 && (
          <section className="mb-10">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                    OFFICIAL NEWS
                  </p>
                  <h2 className="serif-heading mt-2 text-xl font-semibold text-slate-900">
                    Official news shelf
                  </h2>
                </div>
                <Link
                  href="/news"
                  className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  NEWSへ →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedNews.map((n) => {
                  const isExternal =
                    typeof n.link === "string" && /^https?:\/\//.test(n.link);
                  const href = isExternal
                    ? (n.link as string)
                    : `/news/${encodeURIComponent(n.id)}`;

                  const card = (
                    <GlassCard className="p-6 sm:p-7">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                          NEWS
                        </p>
                        {n.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(n.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {n.titleJa ?? n.title}
                      </h3>

                      {(n.excerpt || n.commentJa) && (
                        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {n.excerpt ?? n.commentJa}
                        </p>
                      )}

                      <p className="mt-4 text-[12px] font-semibold text-tiffany-700">
                        読む →
                      </p>
                    </GlassCard>
                  );

                  return isExternal ? (
                    <TrackedOutboundLink
                      key={n.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                      pageType="cars_detail"
                      contentId={car.slug}
                      partner="official_news"
                      position="cars_related_news"
                      ctaId={`cars_${car.slug}_official_news_${n.id}`}
                    >
                      {card}
                    </TrackedOutboundLink>
                  ) : (
                    <TrackedLink
                      key={n.id}
                      href={href}
                      className="group block"
                      shelfId="cars_related_news"
                      navId={`cars_related_news_${n.id}`}
                      toType="news"
                      toId={n.id}
                      toSlug={n.id}
                      toTitle={n.titleJa ?? n.title}
                    >
                      {card}
                    </TrackedLink>
                  );
                })}
              </div>

              {(car.maker || car.bodyType || car.segment) && (
                <div className="mt-4 space-y-2">
                  {car.maker && (
                    <Link
                      href={`/cars/makers/${encodeURIComponent(
                        car.makerKey ?? normalizeMakerParamToKey(car.maker),
                      )}`}
                      className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                    >
                      {car.maker}の車種一覧を見る →
                    </Link>
                  )}

                  {car.bodyType && (
                    <Link
                      href={`/cars/body-types/${encodeURIComponent(getBodyTypeKey(car.bodyType))}`}
                      className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                    >
                      {car.bodyType}の車種一覧を見る →
                    </Link>
                  )}

                  {car.segment && (
                    <Link
                      href={`/cars/segments/${encodeURIComponent(getSegmentKey(car.segment))}`}
                      className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                    >
                      {car.segment}の車種一覧を見る →
                    </Link>
                  )}

                  {car.maker && (
                    <Link
                      href={`/news?maker=${encodeURIComponent(car.maker)}`}
                      className="text-[12px] font-semibold text-slate-500 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                    >
                      {car.maker}のNEWSをもっと見る →
                    </Link>
                  )}
                </div>
              )}
            </Reveal>
          </section>
        )}

        {/* 固定導線：GUIDE HUB（保険 / 売却 / 維持費） */}
        <FixedGuideShelf className="mb-12" />
      </div>
    </main>
  );
}
