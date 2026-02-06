// app/cars/makers/[maker]/page.tsx
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
  buildMakerInfos,
  normalizeMakerParamToKey,
  resolveMakerLabel,
} from "@/lib/taxonomy/makers";
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12; // 12h

type PageProps = {
  params: { maker: string };
};

export async function generateStaticParams() {
  const allCars = await getIndexCars();
  const makers = buildMakerInfos(allCars);
  return makers.map((m) => ({ maker: m.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const makerKey = normalizeMakerParamToKey(params.maker);
  const allCars = await getIndexCars();
  const makers = buildMakerInfos(allCars);

  const label = resolveMakerLabel(makerKey, makers);
  const cars = allCars.filter((c) => c.makerKey === makerKey);

  if (!makerKey || cars.length === 0) {
    return {
      title: "MAKER｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の車種データベース。モデル一覧（${cars.length}件）から比較・購入検討の入口へ。`;
  const canonical = `${getSiteUrl()}/cars/makers/${makerKey}`;

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

export default async function MakerHubPage({ params }: PageProps) {
  const makerKey = normalizeMakerParamToKey(params.maker);
  const allCars = await getIndexCars();
  const makers = buildMakerInfos(allCars);

  const label = resolveMakerLabel(makerKey, makers);
  const cars = allCars.filter((c) => c.makerKey === makerKey);

  if (!makerKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = [...cars].sort((a, b) => {
    const yA = a.releaseYear ?? 0;
    const yB = b.releaseYear ?? 0;
    if (yA !== yB) return yB - yA;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  // Facets（メーカー内のボディタイプ/セグメント分布）
  // NOTE: 表記ゆれ吸収 + URL用キー生成は taxonomy 側に寄せる
  const bodyTypeInfos = buildBodyTypeInfos(sortedCars);
  const segmentInfos = buildSegmentInfos(sortedCars);

  const bodyTypesByCount = [...bodyTypeInfos].sort((a, b) => b.count - a.count);
  const segmentsByCount = [...segmentInfos].sort((a, b) => b.count - a.count);

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
        name: "MAKERS",
        item: `${getSiteUrl()}/cars/makers`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: label,
        item: `${getSiteUrl()}/cars/makers/${makerKey}`,
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
      q: `${label}の車は、どこから比較すべき？`,
      a: `まずは「候補を3台まで絞る」→「維持費/故障リスク/中古相場」を同じ軸で見る、の順が最短です。\nこのページのモデル一覧で雰囲気を掴んだら、ボディタイプ/セグメントで性格を揃えて比較すると迷いが減ります。`,
    },
    {
      q: `${label}を中古で買うときのチェックポイントは？`,
      a: `年式や走行距離よりも、整備記録・消耗品交換の履歴・警告灯/異音/漏れの有無を優先して確認します。\n同じモデルでも状態差が大きいので、候補は“台数”で確保するのが安全です。`,
    },
    {
      q: `維持費は何で決まる？`,
      a: `税金・保険・タイヤ等の消耗品・定期点検/車検・故障時の修理費で構成されます。\n同じメーカー内でも「ボディタイプ（重量/タイヤサイズ）」「グレード（装備/電子制御）」で差が出るので、モデル比較の時点でここを揃えるのがコツです。`,
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
  const overviewLead = `${label}の車種データベース。モデル${cars.length}件を一覧化しました。${recentModelsLine}ボディタイプ/セグメントで性格を揃えてから比較すると、購入判断が速くなります。`;

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-maker-hub-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-maker-hub-itemlist" data={itemListData} />
      <JsonLd id="jsonld-maker-hub-faq" data={faqJsonLd} />

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
          <Link href="/cars/makers" className="hover:text-slate-800">
            MAKERS
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
                    <Link href={`/cars?maker=${encodeURIComponent(makerKey)}`}>条件検索で絞る</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/news?maker=${encodeURIComponent(label)}`}>NEWS</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/search?q=${encodeURIComponent(label)}`}>サイト内検索</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 text-[10px] text-slate-500 sm:text-right">
                <div className="inline-flex items-center justify-end gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">MODELS</span>
                </div>
                <p className="text-3xl font-semibold text-slate-900">{cars.length}</p>
                <p className="leading-relaxed">
                  BodyType: {bodyTypeInfos.length} / Segment: {segmentInfos.length}
                </p>
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
              <li>ボディタイプ/セグメントで“性格”を揃えて比較（比較軸が安定）</li>
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
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
              BODY TYPES IN {label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {bodyTypesByCount.slice(0, 12).map((bt) => (
                <Link
                  key={bt.key}
                  href={`/cars/body-types/${encodeURIComponent(bt.key)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-600 transition hover:border-tiffany-300 hover:text-slate-900"
                >
                  <span>{bt.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                    {bt.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>
          <GlassCard padding="md" className="bg-white/80">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
              SEGMENTS IN {label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {segmentsByCount.slice(0, 12).map((seg) => (
                <Link
                  key={seg.key}
                  href={`/cars/segments/${encodeURIComponent(seg.key)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-600 transition hover:border-tiffany-300 hover:text-slate-900"
                >
                  <span>{seg.label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                    {seg.count}
                  </span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* モデル一覧 */}
        <section aria-label={`${label}の車種一覧`} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
              MODEL LIST
            </h2>
            <p className="text-[10px] text-slate-500">
              表示順: 新しい年式 → 車名
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedCars.map((car) => (
              <CarCard key={car.slug} car={car} shelfId={`maker_hub:${makerKey}`} />
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
