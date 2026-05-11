import type { Metadata } from "next";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import TaxonomyHubCard from "@/components/taxonomy/TaxonomyHubCard";

import { getIndexCars, type CarItem } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";
import { buildBodyTypeInfos, getBodyTypeKey } from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";

export const revalidate = 60 * 60 * 12;

export const metadata: Metadata = {
  title: "ボディタイプ別｜形から入る車種一覧",
  description: "セダン、クーペ、SUV など、公開中の車種をボディタイプごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
  alternates: {
    canonical: `${getSiteUrl()}/cars/body-types`,
  },
  openGraph: {
    title: "ボディタイプ別｜形から入る車種一覧",
    description: "セダン、クーペ、SUV など、公開中の車種をボディタイプごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
    url: `${getSiteUrl()}/cars/body-types`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "ボディタイプ別｜形から入る車種一覧",
    description: "セダン、クーペ、SUV など、公開中の車種をボディタイプごとにまとめた一覧ページ。代表モデルと掲載車種数をまとめて確認。",
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

export default async function CarsBodyTypesIndexPage() {
  const cars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(cars).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "ja");
  });
  const makers = buildMakerInfos(cars);

  const carsByBodyTypeKey = new Map<string, CarItem[]>();
  for (const car of cars) {
    const key = getBodyTypeKey(car.bodyType);
    if (!key) continue;
    const list = carsByBodyTypeKey.get(key) ?? [];
    list.push(car);
    carsByBodyTypeKey.set(key, list);
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "ボディタイプ別", item: `${getSiteUrl()}/cars/body-types` },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-cars-body-types-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "ボディタイプ別" },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="ボディタイプ別"
            title="ボディタイプ別 車種一覧"
            lead="セダン・クーペ・SUVなど、ボディタイプから車種を探せます。"
            imageSrc="/images/exhibit/kv-bodytypes.webp"
            imageAlt="ボディタイプ別アーカイブのイメージ"
            seedKey="body-types-index"
            posterVariant="car"
            stats={[
              { label: "ボディタイプ", value: String(bodyTypes.length) },
              { label: "掲載車種", value: String(cars.length) },
              { label: "ブランド", value: String(makers.length) },
            ]}
            links={[
              { href: "/cars/makers", label: "メーカー別" },
              { href: "/cars/segments", label: "セグメント別" },
              { href: "/cars", label: "条件検索" },
            ]}
          />
        </div>

        <section className="mt-16">
          <ArchiveSectionHeading
            eyebrow="ボディタイプ一覧"
            title="ボディタイプ一覧"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bodyTypes.map((bodyType) => {
              const bodyTypeCars = sortCars(carsByBodyTypeKey.get(bodyType.key) ?? []);

              return (
                <TaxonomyHubCard
                  key={bodyType.key}
                  href={`/cars/body-types/${encodeURIComponent(bodyType.key)}`}
                  label={bodyType.label}
                  count={bodyType.count}
                  eyebrow="ボディタイプ"
                  samples={bodyTypeCars.slice(0, 4).map((car) => car.name).filter(Boolean)}
                  meta={[
                    {
                      label: "主なメーカー",
                      value: mostCommonLabel(bodyTypeCars.map((car) => car.maker)) ?? "複数ブランドから収録",
                    },
                    {
                      label: "主な性格",
                      value: mostCommonLabel(bodyTypeCars.map((car) => car.segment)) ?? "用途が幅広いカテゴリ",
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
