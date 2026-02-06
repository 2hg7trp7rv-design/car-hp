// app/cars/makers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";

import { getIndexCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { buildMakerInfos } from "@/lib/taxonomy/makers";

export const revalidate = 60 * 60 * 12; // 12h

export async function generateMetadata(): Promise<Metadata> {
  const title = "MAKERS｜メーカー別 車種データベース";
  const description =
    "車種データベースをメーカー別に整理。各メーカーのモデル一覧へ最短でアクセスできる入口ページ。";
  const canonical = `${getSiteUrl()}/cars/makers`;

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

export default async function CarsMakersIndexPage() {
  const allCars = await getIndexCars();
  const makers = buildMakerInfos(allCars);

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
        name: "MAKERS",
        item: `${getSiteUrl()}/cars/makers`,
      },
    ],
  };

  const carsByMakerKey = new Map<string, typeof allCars>();
  for (const car of allCars) {
    const key = car.makerKey;
    if (!key) continue;
    const arr = carsByMakerKey.get(key) ?? [];
    arr.push(car);
    carsByMakerKey.set(key, arr);
  }

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-cars-makers-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="font-medium text-slate-700">MAKERS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  MAKERS
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  メーカー別の入口。モデル一覧 → 比較 → 購入検討コンテンツへ。
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars">条件検索（CARS）</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/body-types">ボディタイプ別</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/segments">セグメント別</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/start">入口ハブ（START）</Link>
                  </Button>
                </div>
              </div>
              <div className="text-[10px] text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">TOTAL MAKERS</span>
                </div>
                <p className="mt-2 text-right text-2xl font-semibold text-slate-900">
                  {makers.length}
                </p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* 一覧 */}
        <section aria-label="メーカー一覧">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
              MAKER LIST
            </h2>
            <p className="text-[10px] text-slate-500">
              クリックでモデル一覧へ
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {makers.map((m) => {
              const cars = carsByMakerKey.get(m.key) ?? [];
              const topModels = [...cars]
                .sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))
                .slice(0, 3)
                .map((c) => c.name)
                .filter(Boolean);

              return (
                <GlassCard
                  key={m.key}
                  padding="md"
                  className="bg-white/80 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                        MAKER
                      </p>
                      <Link
                        href={`/cars/makers/${m.key}`}
                        className="mt-1 block text-lg font-semibold text-slate-900 hover:text-tiffany-700"
                      >
                        {m.label}
                      </Link>
                      <p className="mt-1 text-[10px] text-slate-500">
                        モデル: <span className="font-semibold text-slate-700">{m.count}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button asChild size="sm" variant="primary" className="rounded-full">
                        <Link href={`/cars/makers/${m.key}`}>車種一覧</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={`/news?maker=${encodeURIComponent(m.label)}`}>NEWS</Link>
                      </Button>
                    </div>
                  </div>

                  {topModels.length > 0 && (
                    <div className="mt-3 border-t border-slate-200/70 pt-3 text-[10px] text-slate-500">
                      <p className="font-medium tracking-[0.2em] text-slate-500">
                        RECENT MODELS
                      </p>
                      <p className="mt-1 leading-relaxed">
                        {topModels.join(" / ")}
                      </p>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
