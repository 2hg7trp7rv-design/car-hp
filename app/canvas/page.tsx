import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Reveal } from "@/components/animation/Reveal";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getIndexCars } from "@/lib/cars";

import { CanvasClient, type CanvasCarIndexItem } from "./canvas-client";

export const revalidate = 60 * 60; // 1h

export const metadata: Metadata = {
  title: "比較前の整理｜候補を絞る補助ツール",
  description:
    "比較する前に判断軸をそろえ、候補を絞るための補助ツール。予算・難易度・優先度から比較前の整理を行います。",
  alternates: {
    canonical: "/canvas",
  },
  robots: NOINDEX_ROBOTS,
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
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "比較前の整理",
        item: `${getSiteUrl()}/canvas`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground seed="canvas" />
      <JsonLd id="jsonld-canvas-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-soft-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "比較前の整理" }]} />
          </div>

          <header className="mt-10">
            <Reveal>
              <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">比較前の整理</p>
              <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[var(--text-primary)] sm:text-[40px]">
                判断軸を固定して、迷いを削る。
              </h1>
              <p className="cb-lead mt-5 max-w-2xl text-[rgba(76,69,61,0.88)]">
                比較の前に「何を優先するか」を決めます。候補が3〜10台に落ちた状態で、
                車種比較へ移ると失敗しにくい。
              </p>
            </Reveal>
          </header>

          <section className="mt-10">
            <Reveal delay={80}>
              <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-2)] p-0">
                <CanvasClient cars={index} />
              </div>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
