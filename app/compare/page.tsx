import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars } from "@/lib/cars";

import { CompareClient } from "./compare-client";

type CompareCarIndexItem = {
  slug: string;
  id: string;
  maker?: string;
  name?: string;
  heroImage?: string;

  bodyType?: string;
  segment?: string;
  drive?: string;
  releaseYear?: number;

  priceNew?: string;
  priceUsed?: string;

  engine?: string;
  transmission?: string;
  fuel?: string;
  powerPs?: number;
  torqueNm?: number;

  zeroTo100?: number | string;
  fuelEconomy?: string;

  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;

  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "COMPARE｜車種比較（最大3台）";
  const description =
    "最大3台を横並びで比較し、買ってからの現実（維持費・弱点・傾向）まで判断材料を整理します。";

  return {
    title,
    description,
    alternates: {
      canonical: "/compare",
    },
    robots: NOINDEX_ROBOTS,
  };
}

export default async function ComparePage() {
  const all = await getAllCars();

  const cars: CompareCarIndexItem[] = all.map((c) => ({
    id: c.id,
    slug: c.slug,
    maker: c.maker,
    name: c.name,
    heroImage: c.heroImage ?? undefined,

    bodyType: c.bodyType ?? undefined,
    segment: c.segment ?? undefined,
    drive: c.drive ?? undefined,
    releaseYear: c.releaseYear ?? undefined,

    priceNew: c.priceNew ?? undefined,
    priceUsed: c.priceUsed ?? undefined,

    engine: c.engine ?? undefined,
    transmission: c.transmission ?? undefined,
    fuel: c.fuel ?? undefined,
    powerPs: c.powerPs ?? undefined,
    torqueNm: c.torqueNm ?? undefined,

    zeroTo100: c.zeroTo100 ?? undefined,
    fuelEconomy: c.fuelEconomy ?? undefined,

    lengthMm: c.lengthMm ?? undefined,
    widthMm: c.widthMm ?? undefined,
    heightMm: c.heightMm ?? undefined,
    wheelbaseMm: c.wheelbaseMm ?? undefined,
    weightKg: c.weightKg ?? undefined,

    summary: c.summary ?? undefined,
    strengths: c.strengths ?? undefined,
    weaknesses: c.weaknesses ?? undefined,
    troubleTrends: c.troubleTrends ?? undefined,
  }));

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
        name: "COMPARE",
        item: `${getSiteUrl()}/compare`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-compare-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">COMPARE</span>
        </nav>

        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              COMPARE
            </p>
            <h1 className="serif-heading mt-3 text-3xl text-slate-900">
              車種比較（最大3台）
            </h1>
            <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              候補を横並びで比較して、違いが一目で分かる状態にします。
              <br />
              まずは2台以上選ぶと判断が早いです。
            </p>
          </Reveal>
        </header>

        <section>
          <Reveal delay={80}>
            <GlassCard className="border border-slate-200/80 bg-white/80 p-6" padding="none">
              <CompareClient cars={cars} />
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
