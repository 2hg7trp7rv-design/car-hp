// app/cars/[slug]/page.tsx
//
// CAR BOUTIQUE / CARS DETAIL PAGE
// Next.js App Router + TypeScript + Tailwind CSS
// 最新リポジトリ構成に完全準拠した統合版フルファイル
//

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

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

/* =========================================================
 * 型定義（最新リポジトリ準拠）
 * ======================================================= */

type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;

  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  maintenanceNotes?: string[];

  costImpression?: string;

  zeroTo100?: number;
  fuelEconomy?: string;
  priceNew?: string;
  priceUsed?: string;

  bestFor?: string[];
  notFor?: string[];

  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;

  relatedNewsIds?: string[];
  relatedColumnSlugs?: string[];
  relatedHeritageIds?: string[];
};

type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
};

type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
};

type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
  kind?: string | null;
  brandName?: string | null;
  heroTitle?: string | null;
};

/* =========================================================
 * ユーティリティ
 * ======================================================= */

function splitIntoParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const manual = trimmed
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (manual.length > 1) return manual;

  const sentences = trimmed
    .split("。")
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [trimmed];

  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    out.push(sentences.slice(i, i + 2).join("。") + "。");
  }
  return out;
}

function MultilineText({
  text,
  variant,
}: {
  text: string;
  variant: "hero" | "card";
}) {
  const blocks = splitIntoParagraphs(text);

  if (variant === "hero") {
    return (
      <div className="space-y-4">
        {blocks.map((b, i) => (
          <p
            key={i}
            className="text-[13px] leading-[1.9] text-text-sub sm:text-[14px]"
          >
            {b}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
          <p className="text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
            {b}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatZeroTo100(v?: number) {
  if (v == null) return null;
  return `${v.toFixed(1)}秒 (0-100km/h)`;
}

function formatMm(v?: number) {
  if (v == null) return null;
  return `${v.toLocaleString()}mm`;
}

function formatKg(v?: number) {
  if (v == null) return null;
  return `${v.toLocaleString()}kg`;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}/${`${d.getMonth() + 1}`.padStart(
    2,
    "0",
  )}/${`${d.getDate()}`.padStart(2, "0")}`;
}

function mapHeritageKindLabel(kind?: string | null) {
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

/* =========================================================
 * SSG / Metadata
 * ======================================================= */

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((c) => ({ slug: c.slug }));
}

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

  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;

  return {
    title: `${car.name} | CAR BOUTIQUE`,
    description: car.summaryLong ?? car.summary ?? "",
    alternates: { canonical: url },
    openGraph: {
      title: `${car.name} | CAR BOUTIQUE`,
      description: car.summaryLong ?? car.summary ?? "",
      type: "article",
      url,
      images: car.heroImage ? [car.heroImage] : [],
    },
  };
}

/* =========================================================
 * Page
 * ======================================================= */

export default async function CarDetailPage({ params }: PageProps) {
  const [carRaw, guidesRaw, columnsRaw, heritageRaw] = await Promise.all([
    getCarBySlug(params.slug),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
  ]);

  if (!carRaw) notFound();

  const car = carRaw as ExtendedCarItem;

  const guides = (guidesRaw as GuideWithMeta[]).filter((g) =>
    g.relatedCarSlugs?.includes(car.slug),
  );
  const columns = (columnsRaw as ColumnWithMeta[]).filter((c) =>
    c.relatedCarSlugs?.includes(car.slug),
  );
  const heritages = (heritageRaw as HeritageWithMeta[]).filter((h) =>
    h.keyCarSlugs?.includes(car.slug),
  );

  const heroImage = car.heroImage ?? car.mainImage ?? null;
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  /* ---------- JSON-LD ---------- */

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    description: car.summaryLong ?? car.summary ?? "",
    image: heroImage ? [heroImage] : [],
    brand: car.maker
      ? { "@type": "Brand", name: car.maker }
      : undefined,
    modelDate: car.releaseYear ?? undefined,
  };

  const breadcrumbLd = {
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
        name: car.name,
        item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id={`car-${car.slug}-product`} data={productLd} />
      <JsonLd id={`car-${car.slug}-breadcrumb`} data={breadcrumbLd} />

      <ScrollDepthTracker />

      {/* =========================
       * HERO（黒基調・オーバーレイ）
       * ======================= */}
      <section className="relative bg-black">
        {heroImage && (
          <div className="relative h-[420px] sm:h-[520px]">
            <Image
              src={heroImage}
              alt={car.name}
              fill
              priority
              className="object-cover opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          </div>
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-6 pb-10">
            <p className="text-xs tracking-[0.3em] text-white/60">
              {car.maker?.toUpperCase()}
            </p>
            <h1 className="font-serif text-3xl text-white sm:text-4xl">
              {car.name}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/80">
              {car.bodyType && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {car.bodyType}
                </span>
              )}
              {car.engine && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {car.engine}
                </span>
              )}
              {car.drive && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {car.drive}
                </span>
              )}
              {zeroTo100 && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {zeroTo100}
                </span>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href="#used"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-medium text-black"
              >
                中古価格相場をチェック
              </a>
              <Link
                href="/cars"
                className="rounded-2xl border border-white/30 px-6 py-3 text-sm text-white/80"
              >
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
       * CONTENT
       * ======================= */}
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6">
        {car.summaryLong && (
          <section className="mb-12">
            <MultilineText text={car.summaryLong} variant="hero" />
          </section>
        )}

        {/* スペック */}
        <section className="mb-12 rounded-3xl bg-white p-6 shadow-soft-card">
          <h2 className="serif-heading mb-6 text-lg">基本スペック</h2>
          <dl className="space-y-3 text-sm">
            {car.engine && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-slate-400">エンジン</dt>
                <dd>{car.engine}</dd>
              </div>
            )}
            {car.lengthMm && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-slate-400">全長</dt>
                <dd>{formatMm(car.lengthMm)}</dd>
              </div>
            )}
            {car.weightKg && (
              <div className="flex justify-between">
                <dt className="text-slate-400">重量</dt>
                <dd>{formatKg(car.weightKg)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* GUIDE */}
        {guides.length > 0 && (
          <section className="mb-12">
            <h2 className="serif-heading mb-4 text-base">
              このモデルと付き合うなら
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {guides.map((g) => (
                <GlassCard key={g.id} className="p-4">
                  <h3 className="font-semibold">{g.title}</h3>
                  {g.summary && (
                    <p className="mt-2 text-xs text-text-sub">{g.summary}</p>
                  )}
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* COLUMN */}
        {columns.length > 0 && (
          <section className="mb-12">
            <h2 className="serif-heading mb-4 text-base">
              この車にまつわるコラム
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {columns.map((c) => (
                <GlassCard key={c.id} className="p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* HERITAGE */}
        {heritages.length > 0 && (
          <section>
            <h2 className="serif-heading mb-4 text-base">
              関連するHERITAGE
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {heritages.map((h) => (
                <GlassCard key={h.id} className="p-4">
                  <span className="text-[10px] text-slate-500">
                    {mapHeritageKindLabel(h.kind)}
                  </span>
                  <h3 className="mt-1 font-semibold">
                    {h.heroTitle ?? h.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-sub">
                    {getHeritagePreviewText(h, { maxChars: 120 })}
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        )}
      </div>

      <div id="used" className="sr-only" />
    </main>
  );
}
