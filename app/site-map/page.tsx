import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "サイトマップ｜CAR BOUTIQUE JOURNAL",
  description: "CAR BOUTIQUE JOURNAL の主要カテゴリと主要ページをまとめたサイトマップ。",
  alternates: {
    canonical: `${getSiteUrl()}/site-map`,
  },
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
  const [guides, columns] = await Promise.all([getAllGuides(), getAllColumns()]);
  const latestGuides = sortByDateDesc(guides as GuideItem[]).slice(0, 10);
  const latestColumns = sortByDateDesc(columns as ColumnItem[]).slice(0, 10);

  const coreLinks: LinkItem[] = [
    { href: "/", label: "ホーム" },
    { href: "/guide", label: "ガイド", description: "車の仕組み・整備・カスタム判断の実用記事" },
    { href: "/column", label: "コラム", description: "車のカスタム・維持判断を読み解く親記事" },
    { href: "/decide", label: "判断ハブ", description: "売却・査定、車検、自動車保険の比較の軸を整理" },
    { href: "/search", label: "検索", description: "キーワードからガイドとコラムを横断検索" },
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
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 text-[var(--text-primary)] shadow-soft-card sm:p-8">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "サイトマップ" }]} className="mb-6" />

          <header className="mb-10">
            <Reveal>
              <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">サイトマップ</p>
              <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,38px)] text-[var(--text-primary)]">
                サイトマップ
              </h1>
              <p className="cb-lead mt-3 max-w-2xl text-[rgba(76,69,61,0.88)]">
                主要カテゴリと主要ページを置いています。現在の公開導線はガイドとコラムに集約しています。
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
                      {link.description ? (
                        <span className="text-[11px] text-[rgba(107,101,93,0.88)]">{link.description}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal delay={120}>
              <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
                <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">最新ガイド</h2>
                <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                  {latestGuides.map((guide) => (
                    <li key={guide.slug}>
                      <Link href={`/guide/${encodeURIComponent(guide.slug ?? "")}`} className="hover:underline">
                        {guide.title ?? guide.titleJa ?? guide.slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6">
                <h2 className="font-serif text-[15px] font-semibold text-[var(--text-primary)]">最新コラム</h2>
                <ul className="mt-4 space-y-2 text-[12px] text-[rgba(31,28,25,0.8)]">
                  {latestColumns.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/column/${encodeURIComponent(item.slug ?? "")}`} className="hover:underline">
                        {item.title ?? item.slug}
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
