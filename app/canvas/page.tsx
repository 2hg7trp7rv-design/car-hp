import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

import { getSiteUrl } from "@/lib/site";
import { getIndexCars } from "@/lib/cars";

import { CanvasClient, type CanvasCarIndexItem } from "./canvas-client";

export const revalidate = 60 * 60; // 1h

export const metadata: Metadata = {
  title: "CANVAS｜Decision Canvas",
  description:
    "比較する前に“判断軸”を固定して、迷いを削る。予算・難易度・優先度から候補を絞り込むDecision Canvas。",
  alternates: {
    canonical: "/canvas",
  },
};

export default async function CanvasPage() {
  const cars = await getIndexCars();

  const index: CanvasCarIndexItem[] = cars.map((c) => ({
    id: c.id,
    slug: c.slug,
    maker: c.maker,
    name: c.name,
    heroImage: c.heroImage ?? null,
    bodyType: c.bodyType ?? null,
    segment: c.segment ?? null,
    drive: c.drive ?? null,
    releaseYear: c.releaseYear ?? null,
    difficulty: c.difficulty ?? null,
    priceUsed: c.priceUsed ?? null,
    priceNew: c.priceNew ?? null,
    maintenanceCostYenPerYear: c.maintenanceCostYenPerYear ?? null,
    purchasePriceSafe: c.purchasePriceSafe ?? null,
    fuelEconomy: c.fuelEconomy ?? null,
    powerPs: c.powerPs ?? null,
    torqueNm: c.torqueNm ?? null,
    zeroTo100: c.zeroTo100 ?? null,
    summary: (c.summary ?? null) as string | null,
    summaryLong: (c.summaryLong ?? null) as string | null,
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
        name: "CANVAS",
        item: `${getSiteUrl()}/canvas`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground seed="canvas" />
      <JsonLd id="jsonld-canvas-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "CANVAS" }]} />
          </div>

          <header className="mt-10">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">CANVAS</p>
              <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[#222222] sm:text-[40px]">
                判断軸を固定して、迷いを削る。
              </h1>
              <p className="cb-lead mt-5 max-w-2xl text-[#222222]/70">
                比較の前に「何を優先するか」を決めます。候補が3〜10台に落ちた状態で、
                <span className="font-semibold text-[#222222]">COMPARE</span>へ移ると失敗しにくい。
              </p>
            </Reveal>
          </header>

          <section className="mt-10">
            <Reveal delay={80}>
              <GlassCard className="border border-[#222222]/10 bg-white p-0" padding="none" magnetic={false}>
                <CanvasClient cars={index} />
              </GlassCard>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
