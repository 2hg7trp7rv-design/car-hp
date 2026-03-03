// app/cars/segments/[segment]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqList } from "@/components/guide/FaqList";

import { CarCard } from "@/components/cars/CarCard";

import { getIndexCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import {
  buildSegmentInfos,
  getSegmentKey,
  resolveSegmentLabel,
} from "@/lib/taxonomy/segments";
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";

export const revalidate = 60 * 60 * 12; // 12h

type PageProps = {
  params: { segment: string };
};

export async function generateStaticParams() {
  const allCars = await getIndexCars();
  const segments = buildSegmentInfos(allCars);
  return segments.map((s) => ({ segment: s.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const segmentKey = String(params.segment ?? "").trim();
  const allCars = await getIndexCars();
  const segments = buildSegmentInfos(allCars);

  const label = resolveSegmentLabel(segmentKey, segments);
  const cars = allCars.filter((c) => c.segment && getSegmentKey(c.segment) === segmentKey);

  if (!segmentKey || cars.length === 0) {
    return {
      title: "SEGMENT｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の車種データベース。モデル一覧（${cars.length}件）から比較・購入検討の入口へ。`;
  const canonical = `${getSiteUrl()}/cars/segments/${encodeURIComponent(segmentKey)}`;

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

export default async function SegmentHubPage({ params }: PageProps) {
  const segmentKey = String(params.segment ?? "").trim();
  const allCars = await getIndexCars();
  const segments = buildSegmentInfos(allCars);

  const label = resolveSegmentLabel(segmentKey, segments);
  const cars = allCars.filter((c) => c.segment && getSegmentKey(c.segment) === segmentKey);

  if (!segmentKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = [...cars].sort((a, b) => {
    const yA = a.releaseYear ?? 0;
    const yB = b.releaseYear ?? 0;
    if (yA !== yB) return yB - yA;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  const makers = buildMakerInfos(sortedCars);
  const bodyTypes = buildBodyTypeInfos(sortedCars);

  const makersByCount = [...makers].sort((a, b) => b.count - a.count);
  const bodyTypesByCount = [...bodyTypes].sort((a, b) => b.count - a.count);

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
        name: "SEGMENTS",
        item: `${getSiteUrl()}/cars/segments`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: label,
        item: `${getSiteUrl()}/cars/segments/${encodeURIComponent(segmentKey)}`,
      },
    ],
  };

  const itemListData = {
    "@type": "ItemList",
    itemListElement: sortedCars.slice(0, 50).map((car, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      name: `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.title || car.slug,
    })),
  };

  const faqItems = [
    {
      q: `${label}のセグメントとは？`,
      a: `「どんなキャラクターの車か」を大まかに表した分類です。\nまずは用途（普段の使い方）と優先順位（走り/快適性/実用性）を決めて、同じセグメント内で比較すると判断が速くなります。`,
    },
    {
      q: `${label}で比較するときのコツは？`,
      a: `候補は3台まで絞り、同じ比較軸（維持費・故障リスク・中古相場・乗り心地）で見比べます。\nボディタイプや駆動方式が違うと条件がブレるので、性格が近いもの同士で比べるのが基本です。`,
    },
    {
      q: `購入前に確認すべきポイントは？`,
      a: `新車/中古どちらでも「維持費の見積り」「保険」「点検/車検の想定」を先に揃えると後悔が減ります。\n中古は整備記録と消耗品交換の履歴を優先して確認します。`,
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
  const overviewLead = `${label}の車種データベース。モデル${cars.length}件を一覧化しました。${recentModelsLine}メーカー/ボディタイプで候補を揃え、同じ比較軸で見比べるのが最短です。`;

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-segments.webp" noUpscale />
      <JsonLd id="jsonld-segment-hub-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-segment-hub-itemlist" data={itemListData} />
      <JsonLd id="jsonld-segment-hub-faq" data={faqJsonLd} />

      <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        {/* パンくず */}
        <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "CARS", href: "/cars" }, { label: "SEGMENTS", href: "/cars/segments" }, { label: "DETAIL" }]} className="mb-6" />

        {/* ヘッダー */}
        <header className="mb-8 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="cb-eyebrow text-[#0ABAB5] opacity-100">CAR DATABASE</p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="cb-title-display text-[clamp(26px,3.2vw,38px)] text-[#222222]">
                  {label}
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  {label} のモデル一覧。条件検索（CARS）と併用して候補を絞り込み、比較・購入検討へ。
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  <Button asChild size="sm" variant="primary" className="rounded-full">
                    <Link href={`/cars?segment=${encodeURIComponent(label)}`}>条件検索で絞る</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/search?q=${encodeURIComponent(label)}`}>サイト内検索</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/body-types">ボディタイプ別</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 text-[10px] text-[#222222]/55 sm:text-right">
                <div className="inline-flex items-center justify-end gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">MODELS</span>
                </div>
                <p className="text-3xl font-semibold text-[#222222]">{cars.length}</p>
                <p className="leading-relaxed">Maker: {makers.length} / BodyType: {bodyTypes.length}</p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* 概要 / 次アクション */}
        <Reveal delay={120}>
          <GlassCard padding="md" className="mb-8 bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
              OVERVIEW
            </p>
            <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-[#222222]/70">
              {overviewLead}
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-[#222222]/70">
              <li>モデル一覧を年式順で俯瞰（迷う前に候補を絞る）</li>
              <li>メーカー/ボディタイプで条件を揃えて比較（比較軸が安定）</li>
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
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">MAKERS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {makersByCount.slice(0, 12).map((m) => (
                <Link
                  key={m.key}
                  href={`/cars/makers/${encodeURIComponent(m.key)}`}
                  className="inline-flex items-center rounded-full border border-[#222222]/10 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-[#222222]/70 transition hover:border-tiffany-300 hover:text-[#222222]"
                >
                  <span>{m.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-black/80/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#222222]/80">
                    {m.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard padding="md" className="bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">BODY TYPES</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {bodyTypesByCount.slice(0, 12).map((b) => (
                <Link
                  key={b.key}
                  href={`/cars/body-types/${encodeURIComponent(b.key)}`}
                  className="inline-flex items-center rounded-full border border-[#222222]/10 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-[#222222]/70 transition hover:border-tiffany-300 hover:text-[#222222]"
                >
                  <span>{b.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-black/80/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#222222]/80">
                    {b.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* モデル一覧 */}
        <section aria-label={`${label}の車種一覧`} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#222222]/70">MODEL LIST</h2>
            <p className="text-[10px] text-[#222222]/55">表示順: 新しい年式 → 車名</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCars.map((car) => (
              <CarCard key={car.slug} car={car} shelfId={`segment_hub:${segmentKey}`} />
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

      </div>
    </main>
  );
}
