import type { Metadata } from "next";

import CinemaCategoryPage, { type CinemaCategoryCard } from "@/components/cinema/CinemaCategoryPage";
import { buildFeaturedCards, CINEMA_MARQUEE_IMAGES, compactText, pickImage } from "@/lib/cinema-category";
import { getAllHeritage } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "HERITAGE｜系譜特集",
  description: "名車、ブランド、時代背景を読み解くCAR BOUTIQUE JOURNALの系譜カテゴリーページ。",
  alternates: { canonical: `${getSiteUrl()}/heritage` },
  openGraph: {
    title: "HERITAGE｜系譜特集",
    description: "名車、ブランド、時代背景を読み解く系譜カテゴリーページ。",
    url: `${getSiteUrl()}/heritage`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "HERITAGE｜系譜特集",
    description: "名車、ブランド、時代背景を読み解く系譜カテゴリーページ。",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
};

export default async function HeritagePage() {
  const heritage = await getAllHeritage();

  const cards: CinemaCategoryCard[] = heritage.map((item, index) => ({
    href: `/heritage/${item.slug}`,
    title: item.heroTitle ?? item.title,
    eyebrow: item.kind ?? "HERITAGE",
    meta: [item.years ?? "", item.maker ?? item.brandName ?? ""].filter(Boolean).join(" / ") || "LINEAGE",
    description: compactText(item.summary ?? item.lead ?? item.subtitle ?? item.seoDescription ?? item.body),
    image: pickImage(index + 1, item.thumbnail, item.heroImage, item.ogImageUrl),
  }));

  return (
    <CinemaCategoryPage
      eyebrow="CATEGORY"
      title="HERITAGE"
      labelJa="系譜特集"
      lead="いまの形には、理由がある。"
      description="モデルの変化、ブランドの判断、時代ごとの熱量。HERITAGEは背景を読むための入口です。トップページの映画的な見た目に合わせ、年表ではなく展示されたストーリー群として設計しました。"
      heroImage="/car-gtr.jpg"
      heroCode="04"
      heroMeta="LINEAGE"
      stats={[
        { label: "STORIES", value: String(cards.length) },
        { label: "TIME", value: "ERA" },
        { label: "ROOT", value: "DNA" },
      ]}
      featured={buildFeaturedCards(cards)}
      cards={cards}
      directoryLinks={[
        { href: "/cars", label: "車種へ", note: "系譜から現行車・中古車へ進む。" },
        { href: "/column", label: "考察へ", note: "背景を別角度から読む。" },
        { href: "/guide", label: "実用へ", note: "知識を判断に変える。" },
        { href: "/site-map", label: "全体索引", note: "サイト全体から探す。" },
      ]}
      marqueeImages={[...CINEMA_MARQUEE_IMAGES]}
    />
  );
}
