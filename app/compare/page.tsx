import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

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
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-compare.webp" noUpscale />
      <JsonLd id="jsonld-compare-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "COMPARE" }]} />
          </div>

          <header className="mt-10 space-y-4">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">COMPARE</p>
              <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[#222222] sm:text-[40px]">
                車種比較（最大3台）
              </h1>
              <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
                候補を横並びで比較して、違いが一目で分かる状態にします。
                <br />
                まずは2台以上選ぶと判断が早いです。
              </p>
            </Reveal>
          </header>

          <section className="mt-10">
            <Reveal delay={80}>
              <GlassCard className="border border-[#222222]/10 bg-white p-6" padding="none">
                <CompareClient cars={cars} />
              </GlassCard>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
