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
import { buildBodyTypeInfos } from "@/lib/taxonomy/body-type-hubs";
import { buildMakerInfos } from "@/lib/taxonomy/makers";
import {
  buildSegmentInfos,
  getSegmentKey,
  resolveSegmentLabel,
} from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12;

type PageProps = {
  params: { segment: string };
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
  const segments = buildSegmentInfos(allCars);
  return segments.map((segment) => ({ segment: segment.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const segmentKey = String(params.segment ?? "").trim();
  const allCars = await getIndexCars();
  const segments = buildSegmentInfos(allCars);
  const label = resolveSegmentLabel(segmentKey, segments);
  const cars = allCars.filter((car) => getSegmentKey(car.segment) === segmentKey);

  if (!segmentKey || cars.length === 0) {
    return {
      title: "セグメント別｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の掲載モデル ${cars.length} 件を、主なブランドとボディタイプまで含めて見比べられるセグメント別詳細ページ。`;
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
  const cars = allCars.filter((car) => getSegmentKey(car.segment) === segmentKey);

  if (!segmentKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = sortCars(cars);
  const makers = buildMakerInfos(sortedCars).sort((a, b) => b.count - a.count);
  const bodyTypes = buildBodyTypeInfos(sortedCars).sort((a, b) => b.count - a.count);

  const featuredCar = sortedCars[0] ?? null;
  const railCars = sortedCars.slice(1, 4);
  const gridCars = sortedCars.slice(4, 12);

  const topModels = sortedCars
    .slice(0, 3)
    .map((car) => car.name)
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);

  const overviewLead = `${label} の掲載モデルを年式順に整理しました。${topModels.length > 0 ? `代表モデルは ${topModels.join(" / ")}。` : ""}ブランドや形を跨いで、同じ性格の車を見比べられる一覧です。`;

  const guides = (
    await Promise.all(["lease", "insurance", "maintenance"].map((slug) => getGuideBySlug(slug)))
  ).filter((item): item is NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>> => Boolean(item));

  const faqItems = [
    {
      q: `${label} のセグメントとは？`,
      a: `どんな役割や性格を持つ車かを、大まかに示す整理軸です。\nブランドや形が違っても、同じセグメントなら比較の起点を揃えやすくなります。`,
    },
    {
      q: `${label} で比較するときのコツは？`,
      a: `用途を一つ決めて、候補を三台までに絞ることです。\nそのうえでボディタイプと維持費の差を見ていくと、同じ性格の中で何を優先すべきかが見えやすくなります。`,
    },
    {
      q: `購入前に確認すべきポイントは？`,
      a: `新車でも中古でも、所有後の総額と使い方の相性を確認します。\n中古は整備履歴と消耗品交換の状況を優先し、性能や装備はその後に比較するほうが失敗しにくくなります。`,
    },
  ];

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "セグメント別", item: `${getSiteUrl()}/cars/segments` },
      { "@type": "ListItem", position: 4, name: label, item: `${getSiteUrl()}/cars/segments/${encodeURIComponent(segmentKey)}` },
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
      <JsonLd id="jsonld-segment-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-segment-itemlist" data={itemListData} />
      <JsonLd id="jsonld-segment-faq" data={faqJsonLd} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "セグメント別", href: "/cars/segments" },
            { label: label },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="性格から見る"
            title={`${label} を、性格の基準から見る。`}
            lead={overviewLead}
            note="キャラクターの近い車をまとめたセグメント別ページです。"
            imageSrc={featuredCar?.heroImage || featuredCar?.mainImage || "/images/exhibit/kv-segments.webp"}
            imageAlt={featuredCar ? `${label} の代表モデル` : `${label} のイメージ`}
            seedKey={featuredCar?.slug ?? segmentKey}
            posterVariant="car"
            links={[
              { href: `/cars?segment=${encodeURIComponent(label)}`, label: "条件検索で絞る" },
              { href: `/search?q=${encodeURIComponent(label)}`, label: "サイト内検索" },
              { href: "/compare", label: "比較ページへ" },
            ]}
          />
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
          <div className="space-y-6">
            <div className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">性格の輪郭</p>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
                どのブランドが多く、どんな形が中心か。
              </h2>
              <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
                セグメントで候補を絞ったら、次はブランドと形の違いを確認します。同じ性格でも、どこに快適性を置くか、どこに刺激を置くかで印象は変わります。
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

              {bodyTypes.length > 0 ? (
                <div className="mt-6">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                    BODY TYPES
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bodyTypes.map((item) => (
                      <Link
                        key={item.key}
                        href={`/cars/body-types/${encodeURIComponent(item.key)}`}
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
              性格で比べるときの順番。
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  step: "01",
                  title: "用途を一つに決める。",
                  body: "毎日の移動か、週末の趣味か、長距離か。まず用途を定めると、同じセグメント内でも必要な要素が見えてきます。",
                },
                {
                  step: "02",
                  title: "形の違いを、役割として見る。",
                  body: "クーペかセダンか、オープンか。見た目の違いではなく、どんな楽しみ方や使い方に向くかで比べると判断しやすくなります。",
                },
                {
                  step: "03",
                  title: "維持と出口まで含めて比べる。",
                  body: "保険、消耗品、整備性、売却時の需要まで含めると、同じセグメント内での優先順位が安定します。",
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
            aside="近い性格のモデルをまとめて確認。"
          />

          {featuredCar ? (
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <CarCard car={featuredCar} layout="feature" shelfId={`segment_${segmentKey}_feature`} />
              </div>

              <div className="grid gap-5 lg:col-span-5">
                {railCars.map((car) => (
                  <CarCard
                    key={car.slug}
                    car={car}
                    layout="compact"
                    shelfId={`segment_${segmentKey}_rail`}
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
                  shelfId={`segment_${segmentKey}_grid`}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
          <div>
            <p className="cb-kicker">関連ガイド</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
              価格以外の判断材料を揃える。
            </h2>
            <p className="mt-4 max-w-[42rem] text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              セグメントで候補が見えてきたら、次は買い方と維持の前提です。月額感、保険、整備の条件を整理すると、キャラクターの違いが見えやすくなります。
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
              セグメントで選ぶときの迷い。
            </h2>
            <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              性格で絞ったあとに起きやすい迷いを、比較の順番に沿って整理しました。
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
