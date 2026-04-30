import type { Metadata } from "next";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import TaxonomyHubCard from "@/components/taxonomy/TaxonomyHubCard";

import { getIndexCars, type CarItem } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildSegmentInfos, getSegmentKey } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12;

export const metadata: Metadata = {
  title: "セグメント別｜性格から入る車種一覧",
  description: "GT、スポーツ、プレミアムセダンなど、公開中の車種をセグメントごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
  alternates: {
    canonical: `${getSiteUrl()}/cars/segments`,
  },
  openGraph: {
    title: "セグメント別｜性格から入る車種一覧",
    description: "GT、スポーツ、プレミアムセダンなど、公開中の車種をセグメントごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
    url: `${getSiteUrl()}/cars/segments`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "セグメント別｜性格から入る車種一覧",
    description: "GT、スポーツ、プレミアムセダンなど、公開中の車種をセグメントごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
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

export default async function CarsSegmentsIndexPage() {
  const cars = await getIndexCars();
  const segments = buildSegmentInfos(cars).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "ja");
  });
  const bodyTypes = buildBodyTypeInfos(cars);

  const carsBySegmentKey = new Map<string, CarItem[]>();
  for (const car of cars) {
    const key = getSegmentKey(car.segment);
    if (!key) continue;
    const list = carsBySegmentKey.get(key) ?? [];
    list.push(car);
    carsBySegmentKey.set(key, list);
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "セグメント別", item: `${getSiteUrl()}/cars/segments` },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-cars-segments-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "セグメント別" },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="セグメント別"
            title="価格帯別 車種一覧"
            lead="GT・スポーツ・プレミアムセダンなど、価格帯から車種を探せます"
            imageSrc="/images/exhibit/kv-segments.webp"
            imageAlt="セグメント別アーカイブのイメージ"
            seedKey="segments-index"
            posterVariant="car"
            stats={[
              { label: "セグメント", value: String(segments.length) },
              { label: "掲載車種", value: String(cars.length) },
              { label: "ボディタイプ", value: String(bodyTypes.length) },
            ]}
            links={[
              { href: "/cars/makers", label: "メーカー別" },
              { href: "/cars/body-types", label: "ボディタイプ別" },
              { href: "/cars", label: "条件検索" },
            ]}
          />
        </div>

        <section className="mt-16">
          <ArchiveSectionHeading
            eyebrow="セグメント一覧"
            title="セグメント一覧"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {segments.map((segment) => {
              const segmentCars = sortCars(carsBySegmentKey.get(segment.key) ?? []);

              return (
                <TaxonomyHubCard
                  key={segment.key}
                  href={`/cars/segments/${encodeURIComponent(segment.key)}`}
                  label={segment.label}
                  count={segment.count}
                  eyebrow="セグメント"
                  samples={segmentCars.slice(0, 4).map((car) => car.name).filter(Boolean)}
                  meta={[
                    {
                      label: "主なメーカー",
                      value: mostCommonLabel(segmentCars.map((car) => car.maker)) ?? "複数ブランドから収録",
                    },
                    {
                      label: "主な形",
                      value: mostCommonLabel(segmentCars.map((car) => car.bodyType)) ?? "複数のボディタイプに展開",
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
