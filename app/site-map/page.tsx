import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getIndexCars } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60; // 1h

export const metadata: Metadata = {
  title: "サイトマップ｜CAR BOUTIQUE JOURNAL",
  description:
    "CAR BOUTIQUE JOURNAL の主要カテゴリと主要ページをまとめたサイトマップ。カテゴリごとに探せます。",
  alternates: {
    canonical: "/site-map",
  },
  robots: NOINDEX_ROBOTS,
};

type LinkItem = {
  href: string;
  label: string;
  description?: string;
};

function sortByDateDesc<
  T extends { updatedAt?: string | null; publishedAt?: string | null; createdAt?: string | null },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = a.updatedAt ?? a.publishedAt ?? a.createdAt ?? "";
    const bDate = b.updatedAt ?? b.publishedAt ?? b.createdAt ?? "";
    return bDate.localeCompare(aDate);
  });
}

export default async function SiteMapPage() {
  const [cars, guides, columns, heritage] = await Promise.all([
    getIndexCars(),
    getAllGuides(),
    getAllColumns(),
    getAllHeritage(),
  ]);

  const makerInfos = buildMakerInfos(cars);
  const bodyTypeInfos = buildBodyTypeInfos(cars);
  const segmentInfos = buildSegmentInfos(cars);

  const latestGuides = sortByDateDesc(guides as GuideItem[]).slice(0, 10);
  const latestColumns = sortByDateDesc(columns as ColumnItem[]).slice(0, 10);
  const latestHeritage = sortByDateDesc(heritage as HeritageItem[]).slice(0, 10);

  const coreLinks: LinkItem[] = [
  { href: "/", label: "ホーム", description: "" },
  { href: "/cars", label: "車種", description: "メーカーや価格帯から候補を探す" },
  { href: "/guide", label: "実用", description: "実用ガイド集" },
  { href: "/column", label: "視点", description: "業界・選び方・オピニオン" },
  { href: "/heritage", label: "系譜", description: "年代別に読む" },
  { href: "/news", label: "ニュース", description: "" },
];


  const guideHubs: LinkItem[] = [
    { href: "/guide/hub-sell", label: "売却" },
    { href: "/guide/hub-sell-price", label: "売却相場" },
    { href: "/guide/hub-sell-prepare", label: "売却準備" },
    { href: "/guide/hub-sell-compare", label: "売却比較" },
    { href: "/guide/hub-sell-loan", label: "残債あり" },
    { href: "/guide/hub-loan", label: "ローン・支払い方法" },
    { href: "/guide/hub-usedcar", label: "中古車検索" },
    { href: "/guide/hub-shaken", label: "車検" },
    { href: "/guide/hub-consumables", label: "消耗品" },
    { href: "/guide/hub-paperwork", label: "書類手続き" },
    { href: "/guide/hub-import-trouble", label: "輸入車トラブル" },
    { href: "/guide/insurance", label: "自動車保険" },
    { href: "/guide/lease", label: "リース" },
    { href: "/guide/maintenance", label: "メンテナンス" },
  ];

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
        name: "サイトマップ",
        item: `${getSiteUrl()}/site-map`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-sitemap.webp" noUpscale />
      <JsonLd id="jsonld-site-map-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-soft-card p-6 sm:p-8">

          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "サイトマップ" }]} className="mb-6" />
        <header className="mb-10">
          <Reveal>
            <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">
              サイトマップ
            </p>
            <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,38px)] text-[var(--text-primary)]">サイトマップ</h1>
            <p className="cb-lead mt-3 max-w-2xl text-[rgba(76,69,61,0.88)]">
              主要カテゴリと主要ページを置いています。カテゴリごとに探せます。
            </p>
          </Reveal>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <Reveal delay={40}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">主要カテゴリ</h2>
              <ul className="mt-4 space-y-3 text-[12px] text-[rgba(31,28,25,0.8)]">
                {coreLinks.map((link) => (
                  <li key={link.href} className="flex flex-col gap-1">
                    <Link href={link.href} className="font-semibold text-[var(--text-primary)] hover:underline">
                      {link.label}
                    </Link>
                    {link.description && (
                      <span className="text-[11px] text-[rgba(107,101,93,0.88)]">{link.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">ガイド</h2>
              <ul className="mt-4 grid gap-2 text-[12px] text-[rgba(31,28,25,0.8)] sm:grid-cols-2">
                {guideHubs.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Reveal delay={120}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">メーカー別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {makerInfos.map((maker) => (
                  <li key={maker.key}>
                    <Link href={`/cars/makers/${maker.key}`} className="hover:underline">
                      {maker.label}
                      <span className="ml-1 text-[10px] text-[rgba(107,101,93,0.7)]">({maker.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">ボディタイプ別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {bodyTypeInfos.map((bodyType) => (
                  <li key={bodyType.key}>
                    <Link href={`/cars/body-types/${bodyType.key}`} className="hover:underline">
                      {bodyType.label}
                      <span className="ml-1 text-[10px] text-[rgba(107,101,93,0.7)]">({bodyType.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">セグメント別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {segmentInfos.map((segment) => (
                  <li key={segment.key}>
                    <Link href={`/cars/segments/${segment.key}`} className="hover:underline">
                      {segment.label}
                      <span className="ml-1 text-[10px] text-[rgba(107,101,93,0.7)]">({segment.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Reveal delay={240}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">最新ガイド</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {latestGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/guide/${encodeURIComponent(guide.slug ?? "")}`}
                      className="hover:underline"
                    >
                      {guide.title ?? guide.titleJa ?? guide.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">最新視点</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {latestColumns.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/column/${encodeURIComponent(item.slug ?? "")}`}
                      className="hover:underline"
                    >
                      {item.title ?? item.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
              <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">最新の系譜</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                {latestHeritage.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/heritage/${encodeURIComponent(item.slug ?? "")}`}
                      className="hover:underline"
                    >
                      {item.title ?? item.titleJa ?? item.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>
        </div>
      </div>
    </main>
  );
}