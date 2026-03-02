import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { getAllCars } from "@/lib/cars";
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
    "CAR BOUTIQUE JOURNAL の主要カテゴリとテーマ別入口をまとめたサイトマップ。目的別の入口から各コンテンツへ最短で辿れるように整理。",
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
    getAllCars(),
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
    { href: "/", label: "HOME", description: "全体の入口" },
    { href: "/start", label: "START", description: "目的別の入口" },
    { href: "/exhibition", label: "EXHIBITION", description: "展示室をつなぐ読む順番" },
    { href: "/canvas", label: "CANVAS", description: "判断軸を固定して候補を絞る" },
    { href: "/cars", label: "CARS", description: "車種データベース" },
    { href: "/guide", label: "GUIDE", description: "買い方・維持費・売却" },
    { href: "/column", label: "COLUMN", description: "メンテ・技術・相場" },
    { href: "/news", label: "NEWS", description: "公式ニュース" },
    { href: "/heritage", label: "HERITAGE", description: "ブランドの系譜" },
    { href: "/compare", label: "COMPARE", description: "車種比較" },
    { href: "/search", label: "SEARCH", description: "サイト内検索" },
  ];

  const guideHubs: LinkItem[] = [
    { href: "/guide/hub-sell", label: "売却HUB" },
    { href: "/guide/hub-sell-price", label: "売却相場HUB" },
    { href: "/guide/hub-sell-prepare", label: "売却準備HUB" },
    { href: "/guide/hub-sell-compare", label: "売却比較HUB" },
    { href: "/guide/hub-sell-loan", label: "残債ありHUB" },
    { href: "/guide/hub-loan", label: "ローン/支払いHUB" },
    { href: "/guide/hub-usedcar", label: "中古車検索HUB" },
    { href: "/guide/hub-shaken", label: "車検HUB" },
    { href: "/guide/hub-consumables", label: "消耗品HUB" },
    { href: "/guide/hub-paperwork", label: "書類手続きHUB" },
    { href: "/guide/hub-import-trouble", label: "輸入車トラブルHUB" },
    { href: "/guide/insurance", label: "自動車保険HUB" },
    { href: "/guide/lease", label: "リースHUB" },
    { href: "/guide/maintenance", label: "メンテナンスHUB" },
  ];

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
        name: "SITEMAP",
        item: `${getSiteUrl()}/site-map`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-sitemap.webp" noUpscale />
      <JsonLd id="jsonld-site-map-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "SITE MAP" }]} className="mb-6" />
        <header className="mb-10">
          <Reveal>
            <p className="cb-eyebrow text-[#0ABAB5] opacity-100">
              SITE MAP
            </p>
            <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,38px)] text-[#222222]">サイトマップ</h1>
            <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
              主要カテゴリとテーマ別入口をまとめています。目的に近い入口から辿ってください。
            </p>
          </Reveal>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <Reveal delay={40}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">主要カテゴリ</h2>
              <ul className="mt-4 space-y-3 text-[12px] text-[#222222]/80">
                {coreLinks.map((link) => (
                  <li key={link.href} className="flex flex-col gap-1">
                    <Link href={link.href} className="font-semibold text-[#222222] hover:underline">
                      {link.label}
                    </Link>
                    {link.description && (
                      <span className="text-[11px] text-[#222222]/55">{link.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={80}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">ガイドHUB</h2>
              <ul className="mt-4 grid gap-2 text-[12px] text-[#222222]/80 sm:grid-cols-2">
                {guideHubs.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Reveal delay={120}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">メーカー別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
                {makerInfos.map((maker) => (
                  <li key={maker.key}>
                    <Link href={`/cars/makers/${maker.key}`} className="hover:underline">
                      {maker.label}
                      <span className="ml-1 text-[10px] text-[#222222]/45">({maker.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={160}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">ボディタイプ別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
                {bodyTypeInfos.map((bodyType) => (
                  <li key={bodyType.key}>
                    <Link href={`/cars/body-types/${bodyType.key}`} className="hover:underline">
                      {bodyType.label}
                      <span className="ml-1 text-[10px] text-[#222222]/45">({bodyType.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={200}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">セグメント別</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
                {segmentInfos.map((segment) => (
                  <li key={segment.key}>
                    <Link href={`/cars/segments/${segment.key}`} className="hover:underline">
                      {segment.label}
                      <span className="ml-1 text-[10px] text-[#222222]/45">({segment.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Reveal delay={240}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">最新GUIDE</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
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
            </GlassCard>
          </Reveal>

          <Reveal delay={280}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">最新COLUMN</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
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
            </GlassCard>
          </Reveal>

          <Reveal delay={320}>
            <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">最新HERITAGE</h2>
              <ul className="mt-4 space-y-2 text-[12px] text-[#222222]/80">
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
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal delay={360}>
            <GlassCard className="border border-[#222222]/10 bg-white/70 p-6" padding="none">
              <h2 className="font-serif text-[15px] font-semibold text-[#222222]">クロール用リンク</h2>
              <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/70">
                XMLサイトマップは以下から確認できます。検索エンジン向けの更新情報をまとめています。
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  {/* NOTE: robots/sitemap は Next の RSC prefetch が走ると
                     tools 側で XHR error 扱いになることがあるため、通常の <a> にする */}
                  <a href="/sitemap.xml">XML Sitemap</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/robots.txt">robots.txt</a>
                </Button>
              </div>
            </GlassCard>
          </Reveal>
        </section>
        </div>
      </div>
    </main>
  );
}