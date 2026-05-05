import type { Metadata } from "next";

import CinemaCategoryPage, { type CinemaCategoryCard } from "@/components/cinema/CinemaCategoryPage";
import { buildFeaturedCards, CINEMA_MARQUEE_IMAGES, compactText, pickImage } from "@/lib/cinema-category";
import { getAllColumns } from "@/lib/columns";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "COLUMN｜考察コラム",
  description: "市場、維持、所有、文化を読み解くCAR BOUTIQUE JOURNALの考察コラムカテゴリーページ。",
  alternates: { canonical: `${getSiteUrl()}/column` },
  openGraph: {
    title: "COLUMN｜考察コラム",
    description: "市場、維持、所有、文化を読み解く考察コラムカテゴリーページ。",
    url: `${getSiteUrl()}/column`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "COLUMN｜考察コラム",
    description: "市場、維持、所有、文化を読み解く考察コラムカテゴリーページ。",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
};

export default async function ColumnPage() {
  const columns = await getAllColumns();

  const cards: CinemaCategoryCard[] = columns.map((column, index) => ({
    href: `/column/${column.slug}`,
    title: column.title,
    eyebrow: column.displayTag ?? column.category ?? "COLUMN",
    meta: column.readMinutes ? `${column.readMinutes} MIN` : "OPINION",
    description: compactText(column.summary ?? column.lead ?? column.seoDescription ?? column.body),
    image: pickImage(index + 4, column.thumbnail, column.heroImage, column.ogImageUrl),
  }));

  return (
    <CinemaCategoryPage
      eyebrow="CATEGORY"
      title="COLUMN"
      labelJa="考察コラム"
      lead="数字の奥にある、空気を読む。"
      description="相場、所有、ブランド、維持の違和感。単なる読み物ではなく、判断の背景になる視点を並べるページです。トップページのARCHIVE STORIESと同じ、黒い展示棚のような見え方に揃えました。"
      heroImage="/car-red.jpg"
      heroCode="03"
      heroMeta="PERSPECTIVE"
      stats={[
        { label: "COLUMNS", value: String(cards.length) },
        { label: "READ", value: "DEEP" },
        { label: "ANGLE", value: "VIEW" },
      ]}
      featured={buildFeaturedCards(cards)}
      cards={cards}
      directoryLinks={[
        { href: "/cars", label: "車種へ", note: "考察から対象車種へ戻る。" },
        { href: "/guide", label: "実用へ", note: "視点を行動に変える。" },
        { href: "/heritage", label: "系譜へ", note: "背景から読み直す。" },
        { href: "/search", label: "検索", note: "気になるテーマを探す。" },
      ]}
      marqueeImages={[...CINEMA_MARQUEE_IMAGES]}
    />
  );
}
