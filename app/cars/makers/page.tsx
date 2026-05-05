import type { Metadata } from "next";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import TaxonomyHubCard from "@/components/taxonomy/TaxonomyHubCard";

import { getIndexCars, type CarItem } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { buildMakerInfos } from "@/lib/taxonomy/makers";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12;

export const metadata: Metadata = {
  title: "メーカー別｜ブランドごとの車種一覧",
  description: "公開中の車種をメーカーごとにまとめた一覧ページ。ブランドごとの掲載車種数と代表モデルをまとめて確認。",
  alternates: {
    canonical: `${getSiteUrl()}/cars/makers`,
  },
  openGraph: {
    title: "メーカー別｜ブランドごとの車種一覧",
    description: "公開中の車種をメーカーごとにまとめた一覧ページ。ブランドごとの掲載車種数と代表モデルをまとめて確認。",
    url: `${getSiteUrl()}/cars/makers`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "メーカー別｜ブランドごとの車種一覧",
    description: "公開中の車種をメーカーごとにまとめた一覧ページ。ブランドごとの掲載車種数と代表モデルをまとめて確認。",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
};

function sortCars(cars: CarItem[]): CarItem[] {
  return [...cars].sort((a, b) => {
    const yearDiff = (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return (a.name ?? "").localeCompare(b.name ?? "", "ja");
  });
}

function mostCommonLabel(values: Array<string | null | undefined>): string | null {
  const counts = new Map<string, number>();

  for (const value of values) {
    const key = (value ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let picked: string | null = null;
  let pickedCount = -1;

  for (const [label, count] of counts.entries()) {
    if (count > pickedCount) {
      picked = label;
      pickedCount = count;
      continue;
    }

    if (count === pickedCount && picked && label.localeCompare(picked, "ja") < 0) {
      picked = label;
    }
  }

  return picked;
}

export default async function CarsMakersIndexPage() {
  const cars = await getIndexCars();
  const makers = buildMakerInfos(cars).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "ja");
  });
  const segments = buildSegmentInfos(cars);

  const carsByMakerKey = new Map<string, CarItem[]>();
  for (const car of cars) {
    const key = (car.makerKey ?? "").trim();
    if (!key) continue;
    const list = carsByMakerKey.get(key) ?? [];
    list.push(car);
    carsByMakerKey.set(key, list);
  }

  const leadMakerCars = makers[0] ? sortCars(carsByMakerKey.get(makers[0].key) ?? []) : [];

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "メーカー別", item: `${getSiteUrl()}/cars/makers` },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-cars-makers-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "メーカー別" },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="メーカー別"
            title="メーカー別 車種一覧"
            lead="掲載中の車種をメーカーごとに置いています。"
            imageSrc={leadMakerCars[0]?.heroImage || "/images/hero-top-desktop.jpeg"}
            imageAlt="メーカー別アーカイブのイメージ"
            seedKey={makers[0]?.key ?? "makers-index"}
            posterVariant="car"
            stats={[
              { label: "ブランド", value: String(makers.length) },
              { label: "掲載車種", value: String(cars.length) },
              { label: "主な分類", value: `${segments.length}区分` },
            ]}
            links={[
              { href: "/cars/body-types", label: "ボディタイプ別" },
              { href: "/cars/segments", label: "セグメント別" },
              { href: "/search", label: "サイト内検索" },
            ]}
          />
        </div>

        <section className="mt-16">
          <ArchiveSectionHeading
            eyebrow="メーカー一覧"
            title="ブランド一覧"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {makers.map((maker) => {
              const makerCars = sortCars(carsByMakerKey.get(maker.key) ?? []);

              return (
                <TaxonomyHubCard
                  key={maker.key}
                  href={`/cars/makers/${encodeURIComponent(maker.key)}`}
                  label={maker.label}
                  count={maker.count}
                  eyebrow="メーカー"
                  samples={makerCars.slice(0, 4).map((car) => car.name).filter(Boolean)}
                  meta={[
                    {
                      label: "主な形",
                      value: mostCommonLabel(makerCars.map((car) => car.bodyType)) ?? "複数の形で展開",
                    },
                    {
                      label: "主な性格",
                      value: mostCommonLabel(makerCars.map((car) => car.segment)) ?? "複数の性格を収録",
                    },
                  ]}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
