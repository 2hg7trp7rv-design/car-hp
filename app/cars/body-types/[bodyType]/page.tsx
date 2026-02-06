// app/cars/body-types/[bodyType]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList } from "@/components/guide/FaqList";

import { CarCard } from "@/components/cars/CarCard";

import { getIndexCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildBodyTypeInfos,
  getBodyTypeKey,
  resolveBodyTypeLabel,
} from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12; // 12h

type PageProps = {
  params: { bodyType: string };
};

export async function generateStaticParams() {
  const allCars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(allCars);
  return bodyTypes.map((b) => ({ bodyType: b.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bodyTypeKey = String(params.bodyType ?? "").trim();
  const allCars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(allCars);

  const label = resolveBodyTypeLabel(bodyTypeKey, bodyTypes);
  const cars = allCars.filter((c) => c.bodyType && getBodyTypeKey(c.bodyType) === bodyTypeKey);

  if (!bodyTypeKey || cars.length === 0) {
    return {
      title: "BODY TYPE｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の車種データベース。モデル一覧（${cars.length}件）から比較・購入検討の入口へ。`;
  const canonical = `${getSiteUrl()}/cars/body-types/${encodeURIComponent(bodyTypeKey)}`;

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

export default async function BodyTypeHubPage({ params }: PageProps) {
  const bodyTypeKey = String(params.bodyType ?? "").trim();
  const allCars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(allCars);

  const label = resolveBodyTypeLabel(bodyTypeKey, bodyTypes);
  const cars = allCars.filter((c) => c.bodyType && getBodyTypeKey(c.bodyType) === bodyTypeKey);

  if (!bodyTypeKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = [...cars].sort((a, b) => {
    const yA = a.releaseYear ?? 0;
    const yB = b.releaseYear ?? 0;
    if (yA !== yB) return yB - yA;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  const makers = buildMakerInfos(sortedCars);
  const segments = buildSegmentInfos(sortedCars);

  const makersByCount = [...makers].sort((a, b) => b.count - a.count);
  const segmentsByCount = [...segments].sort((a, b) => b.count - a.count);

  const topModels = sortedCars
    .slice(0, 3)
    .map((c) => c.name)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

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
        name: "BODY TYPES",
        item: `${getSiteUrl()}/cars/body-types`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: label,
        item: `${getSiteUrl()}/cars/body-types/${encodeURIComponent(bodyTypeKey)}`,
      },
    ],
  };

  const itemListData = {
    "@type": "ItemList",
    itemListElement: sortedCars.slice(0, 50).map((car, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      name:
        `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.title || car.slug,
    })),
  };

  const faqItems = [
    {
      q: `${label}はどんな人に向く？`,
      a: `用途（通勤/家族/長距離）と優先順位（快適性/積載/走り）で決まります。\nまずは「普段の乗車人数」「荷物の量」「高速/街乗りの比率」を整理し、候補モデルを3台まで絞ると比較が速くなります。`,
    },
    {
      q: `${label}を比較するときの“軸”は？`,
      a: `同じ${label}でも、グレードや駆動方式で性格が変わります。\n「車体サイズ」「タイヤサイズ」「乗り心地（サスペンション）」「安全/運転支援」「維持費（消耗品・税・保険）」を揃えて比較すると迷いが減ります。`,
    },
    {
      q: `中古で失敗しないコツは？`,
      a: `年式・走行距離よりも、整備記録と消耗品交換の履歴を優先して確認します。\n候補は“台数”で確保し、同条件の個体を見比べて状態差を把握するのが安全です。`,
    },
  ];

  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: faqItems.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a.replace(/\n/g, "<br/>"),
      },
    })),
  };

  const recentModelsLine =
    topModels.length > 0 ? `直近のモデル例: ${topModels.join(" / ")}。` : "";
  const overviewLead = `${label}の車種データベース。モデル${cars.length}件を一覧化しました。${recentModelsLine}メーカー/セグメントで候補を絞り、同じ比較軸（維持費・故障リスク・相場）で見比べるのが最短です。`;

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-bodytype-hub-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-bodytype-hub-itemlist" data={itemListData} />
      <JsonLd id="jsonld-bodytype-hub-faq" data={faqJsonLd} />

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
          <Link href="/cars/body-types" className="hover:text-slate-800">
            BODY TYPES
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="font-medium text-slate-700">{label}</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  {label}
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  {label} のモデル一覧。条件検索（CARS）と併用して候補を絞り込み、比較・購入検討へ。
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  <Button asChild size="sm" variant="primary" className="rounded-full">
                    <Link href={`/cars?bodyType=${encodeURIComponent(label)}`}>条件検索で絞る</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/search?q=${encodeURIComponent(label)}`}>サイト内検索</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/segments">セグメント別</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 text-[10px] text-slate-500 sm:text-right">
                <div className="inline-flex items-center justify-end gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">MODELS</span>
                </div>
                <p className="text-3xl font-semibold text-slate-900">{cars.length}</p>
                <p className="leading-relaxed">Maker: {makers.length} / Segment: {segments.length}</p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* 概要 / 次アクション */}
        <Reveal delay={120}>
          <GlassCard padding="md" className="mb-8 bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
              OVERVIEW
            </p>
            <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-slate-600">
              {overviewLead}
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-slate-600">
              <li>モデル一覧を年式順で俯瞰（迷う前に候補を絞る）</li>
              <li>メーカー/セグメントで性格を揃えて比較（比較軸が安定）</li>
              <li>買い方・保険・維持費・売却まで、次の判断材料へ</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <Button asChild size="sm" variant="primary" className="rounded-full">
                <Link href="/guide/lease">リース（比較）</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/guide/insurance">保険（比較）</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/guide/maintenance">維持・メンテ</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/guide/hub-sell">売却（出口）</Link>
              </Button>
            </div>
          </GlassCard>
        </Reveal>

        {/* 条件チップ */}
        <section className="mb-8 grid gap-3 md:grid-cols-2" aria-label="絞り込みヒント">
          <GlassCard padding="md" className="bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">MAKERS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {makersByCount.slice(0, 12).map((m) => (
                <Link
                  key={m.key}
                  href={`/cars/makers/${encodeURIComponent(m.key)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-600 transition hover:border-tiffany-300 hover:text-slate-900"
                >
                  <span>{m.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                    {m.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard padding="md" className="bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">SEGMENTS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {segmentsByCount.slice(0, 12).map((s) => (
                <Link
                  key={s.key}
                  href={`/cars/segments/${encodeURIComponent(s.key)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-600 transition hover:border-tiffany-300 hover:text-slate-900"
                >
                  <span>{s.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                    {s.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* モデル一覧 */}
        <section aria-label={`${label}の車種一覧`} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">MODEL LIST</h2>
            <p className="text-[10px] text-slate-500">表示順: 新しい年式 → 車名</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCars.map((car) => (
              <CarCard key={car.slug} car={car} shelfId={`bodytype_hub:${bodyTypeKey}`} />
            ))}
          </div>
        </section>

        {/* FAQ（薄いページ化の回避 + 次アクションの補強） */}
        <section className="mt-12" aria-label="FAQ">
          <Reveal>
            <FaqList
              title={`${label}｜選び方FAQ`}
              description="比較の軸を揃えるための最小限の考え方だけをまとめました。"
              items={faqItems}
            />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
