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
import {
  buildMakerInfos,
  normalizeMakerParamToKey,
  resolveMakerLabel,
} from "@/lib/taxonomy/makers";
import { buildSegmentInfos } from "@/lib/taxonomy/segments";

export const revalidate = 60 * 60 * 12;

type PageProps = {
  params: { maker: string };
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
  const makers = buildMakerInfos(allCars);
  return makers.map((maker) => ({ maker: maker.key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const makerKey = normalizeMakerParamToKey(params.maker);
  const allCars = await getIndexCars();
  const makers = buildMakerInfos(allCars);
  const label = resolveMakerLabel(makerKey, makers);
  const cars = allCars.filter((car) => normalizeMakerParamToKey(car.makerKey ?? car.maker ?? "") === makerKey);

  if (!makerKey || cars.length === 0) {
    return {
      title: "メーカー別｜車種一覧",
      robots: { index: false, follow: false },
    };
  }

  const title = `${label}｜車種一覧・モデル比較`;
  const description = `${label} の掲載モデル ${cars.length} 件を、形とセグメントの偏りまで含めて見比べられるメーカー別詳細ページ。`;
  const canonical = `${getSiteUrl()}/cars/makers/${encodeURIComponent(makerKey)}`;

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
  const cars = allCars.filter((car) => normalizeMakerParamToKey(car.makerKey ?? car.maker ?? "") === makerKey);

  if (!makerKey || cars.length === 0) {
    notFound();
  }

  const sortedCars = sortCars(cars);
  const bodyTypes = buildBodyTypeInfos(sortedCars).sort((a, b) => b.count - a.count);
  const segments = buildSegmentInfos(sortedCars).sort((a, b) => b.count - a.count);

  const featuredCar = sortedCars[0] ?? null;
  const railCars = sortedCars.slice(1, 4);
  const gridCars = sortedCars.slice(4, 12);

  const topModels = sortedCars
    .slice(0, 3)
    .map((car) => car.name)
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);

  const overviewLead = `${label} の掲載モデルを年式順に整理しました。${topModels.length > 0 ? `代表モデルは ${topModels.join(" / ")}。` : ""}同じブランド内で形と性格の傾向を掴める一覧です。`;

  const guides = (
    await Promise.all(["lease", "insurance", "maintenance"].map((slug) => getGuideBySlug(slug)))
  ).filter((item): item is NonNullable<Awaited<ReturnType<typeof getGuideBySlug>>> => Boolean(item));

  const faqItems = [
    {
      q: `${label} はどこから比較を始めるべき？`,
      a: `掲載順の上位モデルから読むと、そのブランドの重心を掴みやすくなります。\nそのうえでボディタイプとセグメントを絞ると、同じブランド内でも候補を増やしすぎずに済みます。`,
    },
    {
      q: `${label} の中で候補を広げすぎないコツは？`,
      a: `用途を一つに決めてから読むことです。通勤・家族利用・趣味のドライブなど、使い方を定めると比較軸が揃います。\nブランドだけで決めず、形と維持費のラインも同時に確認すると迷いにくくなります。`,
    },
    {
      q: `中古で確認したい点は？`,
      a: `整備記録、消耗品交換の履歴、弱点として出やすい部位の対策有無を確認します。\n人気モデルは価格だけで選ばず、状態の良い個体を基準に総額で比べるほうが失敗しにくくなります。`,
    },
  ];

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
      { "@type": "ListItem", position: 3, name: "メーカー別", item: `${getSiteUrl()}/cars/makers` },
      { "@type": "ListItem", position: 4, name: label, item: `${getSiteUrl()}/cars/makers/${encodeURIComponent(makerKey)}` },
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
      <JsonLd id="jsonld-maker-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-maker-itemlist" data={itemListData} />
      <JsonLd id="jsonld-maker-faq" data={faqJsonLd} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: "メーカー別", href: "/cars/makers" },
            { label: label },
          ]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="ブランド別"
            title={`${label} を、系統立てて見る。`}
            lead={overviewLead}
            note="同じブランドの中でも、形と性格が混ざると比較軸はすぐに散らばります。このページではまず同一ブランド内で輪郭を揃え、その後の比較に進みやすい並びにしています。"
            imageSrc={featuredCar?.heroImage || featuredCar?.mainImage || "/images/hero-top-desktop.jpeg"}
            imageAlt={featuredCar ? `${label} の代表モデル` : `${label} のイメージ`}
            seedKey={featuredCar?.slug ?? makerKey}
            posterVariant="car"
            links={[
              { href: `/cars?maker=${encodeURIComponent(makerKey)}`, label: "条件検索で絞る" },
              { href: `/search?q=${encodeURIComponent(label)}`, label: "サイト内検索" },
              { href: "/compare", label: "比較ページへ" },
            ]}
          />
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
          <div className="space-y-6">
            <div className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">ブランドの輪郭</p>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
                どんな系統が多いかを見る。
              </h2>
              <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
                車名から入るより、ブランド全体の偏りを掴んでから読むほうが比較しやすくなります。どの形が多いか、どんな性格に寄っているかを確認してください。
              </p>

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
              比較を散らかさないための順番。
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  step: "01",
                  title: "ブランド内で、候補を三台までに絞る。",
                  body: "年式と用途で候補を減らします。同じブランド内で軸を揃えると比較しやすくなります。",
                },
                {
                  step: "02",
                  title: "形とセグメントで、役割の差を見る。",
                  body: "クーペかセダンか、GTかスポーツか。見た目ではなく役割の違いとして把握すると迷いにくくなります。",
                },
                {
                  step: "03",
                  title: "維持費と出口まで含めて判断する。",
                  body: "購入価格だけでなく、保険・消耗品・売却時の見通しまで合わせて比較すると、候補の優先順位が安定します。",
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
            title={`${label} のモデルを、読みやすい密度で。`}
            lead="代表モデルを軸に、メーカー内の掲載車種を見比べられる構成です。"
            aside="比較ページへ進む前に、ブランド内の差分を掴める構成です。"
          />

          {featuredCar ? (
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <CarCard car={featuredCar} layout="feature" shelfId={`maker_${makerKey}_feature`} />
              </div>

              <div className="grid gap-5 lg:col-span-5">
                {railCars.map((car) => (
                  <CarCard
                    key={car.slug}
                    car={car}
                    layout="compact"
                    shelfId={`maker_${makerKey}_rail`}
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
                  shelfId={`maker_${makerKey}_grid`}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
          <div>
            <p className="cb-kicker">関連ガイド</p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[34px]">
              次の判断に進むためのガイド。
            </h2>
            <p className="mt-4 max-w-[42rem] text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              候補が見えてきたら、買い方と維持の前提を見ます。月額感、保険、整備の三つを確認すると比較しやすくなります。
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
              よくある迷いどころ。
            </h2>
            <p className="mt-4 text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              ブランド別ページを読んだあとに起きやすい迷いを、比較の順番に沿って整理しました。
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
