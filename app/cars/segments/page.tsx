// app/cars/segments/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

import { getIndexCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildSegmentInfos,
  getSegmentKey,
} from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12; // 12h

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEGMENTS｜セグメント別 車種データベース";
  const description =
    "車種データベースをセグメント別に整理。GT/スポーツ/スーパーカーなど、性格でモデル一覧へ最短でアクセスできる入口ページ。";
  const canonical = `${getSiteUrl()}/cars/segments`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
  };
}

export default async function CarsSegmentsIndexPage() {
  const allCars = await getIndexCars();
  const segments = buildSegmentInfos(allCars);

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
        name: "SEGMENTS",
        item: `${getSiteUrl()}/cars/segments`,
      },
    ],
  };

  const carsBySegmentKey = new Map<string, typeof allCars>();
  for (const car of allCars) {
    if (!car.segment) continue;
    const key = getSegmentKey(car.segment);
    if (!key) continue;
    const arr = carsBySegmentKey.get(key) ?? [];
    arr.push(car);
    carsBySegmentKey.set(key, arr);
  }

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-segments.webp" noUpscale />
      <JsonLd id="jsonld-cars-segments-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        {/* パンくず */}
        <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "CARS", href: "/cars" }, { label: "SEGMENTS" }]} className="mb-6" />

        {/* ヘッダー */}
        <header className="mb-8 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="cb-eyebrow text-[#0ABAB5] opacity-100">CAR DATABASE</p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="cb-title-display text-[clamp(26px,3.2vw,38px)] text-[#222222]">
                  SEGMENTS
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  セグメント別の入口。性格で探して、モデル一覧 → 比較 → 購入検討へ。
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars">条件検索（CARS）</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/makers">メーカー別</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/body-types">ボディタイプ別</Link>
                  </Button>
                </div>
              </div>
              <div className="text-[10px] text-[#222222]/55">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">TOTAL SEGMENTS</span>
                </div>
                <p className="mt-2 text-right text-2xl font-semibold text-[#222222]">{segments.length}</p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* 一覧 */}
        <section aria-label="セグメント一覧">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#222222]/70">SEGMENT LIST</h2>
            <p className="text-[10px] text-[#222222]/55">クリックでモデル一覧へ</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((s) => {
              const cars = carsBySegmentKey.get(s.key) ?? [];
              const topModels = [...cars]
                .sort((a, c) => (c.releaseYear ?? 0) - (a.releaseYear ?? 0))
                .slice(0, 3)
                .map((c) => c.name)
                .filter(Boolean);

              return (
                <GlassCard key={s.key} padding="md" className="bg-white/80 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">SEGMENT</p>
                      <Link
                        href={`/cars/segments/${encodeURIComponent(s.key)}`}
                        className="mt-1 block text-lg font-semibold text-[#222222] hover:text-tiffany-700"
                      >
                        {s.label}
                      </Link>
                      <p className="mt-1 text-[10px] text-[#222222]/55">
                        モデル: <span className="font-semibold text-[#222222]/80">{s.count}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button asChild size="sm" variant="primary" className="rounded-full">
                        <Link href={`/cars/segments/${encodeURIComponent(s.key)}`}>車種一覧</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={`/cars?segment=${encodeURIComponent(s.label)}`}>条件検索</Link>
                      </Button>
                    </div>
                  </div>

                  {topModels.length > 0 && (
                    <div className="mt-3 border-t border-[#222222]/10 pt-3 text-[10px] text-[#222222]/55">
                      <p className="font-medium tracking-[0.2em] text-[#222222]/55">RECENT MODELS</p>
                      <p className="mt-1 leading-relaxed">{topModels.join(" / ")}</p>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </section>
        </div>

      </div>
    </main>
  );
}
