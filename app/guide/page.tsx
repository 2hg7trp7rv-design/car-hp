import type { Metadata } from "next";

import CinemaCategoryPage, { type CinemaCategoryCard } from "@/components/cinema/CinemaCategoryPage";
import { buildFeaturedCards, CINEMA_MARQUEE_IMAGES, compactText, pickImage } from "@/lib/cinema-category";
import { getAllGuides } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "GUIDE｜実用ガイド",
  description: "買い方、売り方、保険、維持費、車検まで、判断に直結する実用ガイドのカテゴリーページ。",
  alternates: { canonical: `${getSiteUrl()}/guide` },
  openGraph: {
    title: "GUIDE｜実用ガイド",
    description: "買い方、売り方、保険、維持費、車検まで、判断に直結する実用ガイドのカテゴリーページ。",
    url: `${getSiteUrl()}/guide`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "GUIDE｜実用ガイド",
    description: "買い方、売り方、保険、維持費、車検まで、判断に直結する実用ガイドのカテゴリーページ。",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
};

export default async function GuidePage() {
  const guides = await getAllGuides();

  const cards: CinemaCategoryCard[] = guides.map((guide, index) => ({
    href: `/guide/${guide.slug}`,
    title: guide.title,
    eyebrow: guide.displayTag ?? guide.category ?? "GUIDE",
    meta: guide.readMinutes ? `${guide.readMinutes} MIN` : "PRACTICAL",
    description: compactText(guide.summary ?? guide.lead ?? guide.seoDescription ?? guide.body),
    image: pickImage(index + 2, guide.thumbnail, guide.heroImage, guide.ogImageUrl),
  }));

  return (
    <CinemaCategoryPage
      eyebrow="CATEGORY"
      title="GUIDE"
      labelJa="実用ガイド"
      lead="迷う前に、条件を切る。"
      description="購入、売却、維持費、保険、車検。派手な見せ方に寄せながらも、読み始めた後は結論へすぐ進めるカテゴリーページです。トップのモックと同じ黒、余白、巨大文字、横流れ画像で統一しました。"
      heroImage="/detail-oil.jpg"
      heroCode="02"
      heroMeta="PRACTICAL"
      stats={[
        { label: "GUIDES", value: String(cards.length) },
        { label: "HUBS", value: "6" },
        { label: "USE", value: "REAL" },
      ]}
      featured={buildFeaturedCards(cards)}
      cards={cards}
      directoryLinks={[
        { href: "/guide/hub-usedcar", label: "中古車", note: "選び方と失敗回避。" },
        { href: "/guide/hub-sell", label: "売却", note: "手放す前に見る順番。" },
        { href: "/guide/insurance", label: "保険", note: "補償と支払いを現実で見る。" },
        { href: "/guide/maintenance", label: "維持", note: "故障、消耗品、車検の入口。" },
      ]}
      marqueeImages={[...CINEMA_MARQUEE_IMAGES]}
    />
  );
}
