import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { CarCard } from "@/components/cars/CarCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { InlineFaq } from "@/components/taxonomy/InlineFaq";

import { getIndexCars, type CarItem } from "@/lib/cars";
import { getGuideBySlug } from "@/lib/guides";
import { resolveGuideCardImage } from "@/lib/display-tag-media";
import { getSiteUrl } from "@/lib/site";
import {
  buildBodyTypeInfos,
  getBodyTypeKey,
  resolveBodyTypeLabel,
} from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12;

type PageProps = {
  params: { bodyType: string };
};

function sortCars(cars: CarItem[]): CarItem[] {
  return [...cars].sort((a, b) => {
    const yearDiff = (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return (a.name ?? "").localeCompare(b.name ?? "", "ja");
  });
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export async function generateStaticParams() {
  const allCars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(allCars);
  return bodyTypes.map((bodyType) => ({ bodyType: bodyType.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bodyTypeKey = String(params.bodyType ?? "").trim();
  const allCars = await getIndexCars();
  const bodyTypes = buildBodyTypeInfos(allCars);
  const label = resolveBodyTypeLabel(bodyTypeKey, bodyTypes);
  const cars = allCars.filter((car) => getBodyTypeKey(car.bodyType) === bodyTypeKey);

  if (!bodyTypeKey || cars.length === 0) {
    return {
      title: "ボディタイプ別｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の掲載モデル ${cars.length} 件を、代表ブランドとセグメントまで含めて見比べられるボディタイプ別詳細ページ。`;
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
  const cars = allCars.filter((car) => getBodyTypeKey(car.bodyType) === bodyTypeKey);

  if (!bodyTypeKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = sortCars(cars);
  const makers = buildMakerInfos(sortedCars).sort((a, b) => b.count - a.count);
  const segments = buildSegmentInfos(sortedCars).sort((a, b) => b.count - a.count);

  const featuredCar = sortedCars[0] ?? null;
  const railCars = sortedCars.slice(1, 4);
  const gridCars = sortedCars.slice(4, 12);

  const topModels = sortedCars
    .slice(0, 3)
    .map((car) => car.name)
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);

  const overviewLead = `${label} の掲載モデルを年式順に整理しました。${topModels.length > 0 ? `代表モデルは ${topModels.join(" / ")}。` : ""}使い方に近い形から候補を見比べられる一覧です。`;

  const guides = (
    await Promise.all(["lease", "insurance", "maintenance"].map((slug) => getGuideBySlug(slug)))
  ).filter((item): item is NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>> => Boolean(item));

  const faqItems = [
    {
      q: `${label} はどんな使い方に向いている？`,
      a: `形の違いは、見た目以上に乗り降りや積載、視界、取り回しに影響します。\n普段の利用人数と荷物量、よく走る道の種類を決めると、候補を絞り込みやすくなります。`,
    },
    {
      q: `${label} で比較するときの軸は？`,
      a: `サイズ感、乗り心地、積載性、維持費の四つを同じ順番で見るのが基本です。\nブランドの印象に引っ張られすぎず、同じ使い方で困らないかを基準にすると比較しやすくなります。`,
    },
    {
      q: `中古で失敗しないコツは？`,
      a: `形ごとに壊れやすい部位や見落としやすい摩耗箇所が変わります。整備記録と消耗品の交換履歴を見て、外装よりも機関系を優先して確認してください。\n価格差が小さい場合は、状態の良い個体を選ぶほうが結果的に安く済みます。`,
    },
  ];

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "ボディタイプ別", item: `${getSiteUrl()}/cars/body-types` },
      { "@type": "ListItem", position: 4, name: label, item: `${getSiteUrl()}/cars/body-types/${encodeURIComponent(bodyTypeKey)}` },
    ],
  };

  const itemListData = {
    "@type": "ItemList",
    itemListElement: sortedCars.slice(0, 50).map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      name: `${car.maker ?? ""} ${car.name ?? ""}`.trim() || car.slug,
    })),
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.replace(/\n/g, "<br/>"),
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-bodytype-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-bodytype-itemlist" data={itemListData} />
      <JsonLd id="jsonld-bodytype-faq" data={faqJsonLd} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "ボディタイプ別", href: "/cars/body-types" },
            { label: label },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="形から見る"
            title={`${label} を、形の基準から見る。`}
            lead={overviewLead}
            note="使い方や形の違いから候補を整理できるボディタイプ別ページです。"
            imageSrc={featuredCar?.heroImage || featuredCar?.mainImage || "/images/exhibit/kv-bodytypes.webp"}
            imageAlt={featuredCar ? `${label} の代表モデル` : `${label} のイメージ`}
            seedKey={featuredCar?.slug ?? bodyTypeKey}
            posterVariant="car"
            links={[
              { href: `/cars?bodyType=${encodeURIComponent(label)}`, label: "条件検索で絞る" },
              { href: `/search?q=${encodeURIComponent(label)}`, label: "サイト内検索" },
              { href: "/compare", label: "比較ページへ" },
            ]}
          />
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
          <div className="space-y-6">
            <div className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">形の輪郭</p>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
                どのブランドが多く、どんな性格に広がるか。
              </h2>
              <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
                同じ形でも、ブランドと性格が変わると乗り味は大きく変わります。どのメーカーが多いか、どのセグメントに広がるかを見てください。
              </p>

              {makers.length > 0 ? (
                <div className="mt-6">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                    メーカー
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {makers.map((item) => (
                      <Link
                        key={item.key}
                        href={`/cars/makers/${encodeURIComponent(item.key)}`}
                        className="cb-chip"
                      >
                        {item.label} <span className="ml-1 text-[10px] text-[var(--text-tertiary)]">({item.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {segments.length > 0 ? (
                <div className="mt-6">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                    SEGMENTS
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {segments.map((item) => (
                      <Link
                        key={item.key}
                        href={`/cars/segments/${encodeURIComponent(item.key)}`}
                        className="cb-chip"
                      >
                        {item.label} <span className="ml-1 text-[10px] text-[var(--text-tertiary)]">({item.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="cb-panel-muted mt-6 p-4">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">概要</p>
                <p className="mt-3 text-[12px] leading-[1.85] text-[var(--text-secondary)]">{overviewLead}</p>
              </div>
            </div>
          </div>

          <div className="cb-panel p-5 sm:p-6">
            <p className="cb-kicker">見るポイント</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
              形で比べるときの順番。
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  step: "01",
                  title: "サイズ感を、生活の場面に置き換える。",
                  body: "駐車環境、乗車人数、よく使う道の幅を想定します。スペックではなく生活の場面に落とし込むと判断しやすくなります。",
                },
                {
                  step: "02",
                  title: "乗り心地と積載性を同時に見る。",
                  body: "見た目が好みでも、荷物の載せ方や同乗者の快適性で印象は変わります。使い勝手を確認すると候補が整理されます。",
                },
                {
                  step: "03",
                  title: "維持費を“総額”で捉える。",
                  body: "保険、タイヤ、消耗品、整備のしやすさまで含めて比較します。購入価格だけでなく、所有してからの負担感も合わせて見てください。",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4"
                >
                  <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-base)]">
                    観点 {item.step}
                  </div>
                  <div className="mt-2 text-[16px] font-semibold leading-[1.6] text-[var(--text-primary)]">
                    {item.title}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.85] text-[var(--text-secondary)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <ArchiveSectionHeading
            eyebrow="モデル一覧"
            title={`${label} のモデル一覧。`}
            lead="代表モデルと比較しやすい候補を置いています。"
            aside="同じ形の中で差分を確認。"
          />

          {featuredCar ? (
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <CarCard car={featuredCar} layout="feature" shelfId={`bodytype_${bodyTypeKey}_feature`} />
              </div>

              <div className="grid gap-5 lg:col-span-5">
                {railCars.map((car) => (
                  <CarCard
                    key={car.slug}
                    car={car}
                    layout="compact"
                    shelfId={`bodytype_${bodyTypeKey}_rail`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {gridCars.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {gridCars.map((car) => (
                <CarCard
                  key={car.slug}
                  car={car}
                  layout="standard"
                  shelfId={`bodytype_${bodyTypeKey}_grid`}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
          <div>
            <p className="cb-kicker">関連ガイド</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
              買い方と維持の前提を整理する。
            </h2>
            <p className="mt-4 max-w-[42rem] text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              形で候補が見えてきたら、次は所有の条件です。月額感、保険、整備の前提をそろえると、形の好みだけでは決めにくい車も見極めやすくなります。
            </p>

            <div className="mt-6 space-y-4">
              {guides.map((guide) => (
                <ContentRowCard
                  key={guide.slug}
                  href={`/guide/${encodeURIComponent(guide.slug)}`}
                  title={guide.title}
                  excerpt={guide.summary ?? guide.lead ?? ""}
                  imageSrc={resolveGuideCardImage(guide)}
                  badge="Guide"
                  badgeTone="accent"
                  date={formatDate(guide.publishedAt ?? guide.updatedAt)}
                  posterVariant="guide"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="cb-kicker">よくある質問</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
              形で選ぶときの迷い。
            </h2>
            <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              ボディタイプで絞ったあとに起きやすい迷いを、比較の順番に沿って短く整理しました。
            </p>

            <div className="mt-6">
              <InlineFaq items={faqItems} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
