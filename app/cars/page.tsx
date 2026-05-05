import type { Metadata } from "next";

import CinemaCategoryPage, { type CinemaCategoryCard } from "@/components/cinema/CinemaCategoryPage";
import { buildFeaturedCards, CINEMA_MARQUEE_IMAGES, compactText, pickImage } from "@/lib/cinema-category";
import { getIndexCars } from "@/lib/cars";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "CARS｜車種一覧",
  description: "車種を見て、比べて、次に読む記事へ進むためのCAR BOUTIQUE JOURNALの車種カテゴリーページ。",
  alternates: { canonical: `${getSiteUrl()}/cars` },
  openGraph: {
    title: "CARS｜車種一覧",
    description: "車種を見て、比べて、次に読む記事へ進むための車種カテゴリーページ。",
    url: `${getSiteUrl()}/cars`,
    type: "website",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "CARS｜車種一覧",
    description: "車種を見て、比べて、次に読む記事へ進むための車種カテゴリーページ。",
    images: [`${getSiteUrl()}/ogp-default.jpg`],
  },
};

export default async function CarsPage() {
  const cars = await getIndexCars();

  const cards: CinemaCategoryCard[] = cars.map((car, index) => ({
    href: `/cars/${car.slug}`,
    title: car.name ?? car.title,
    eyebrow: car.maker ?? "MODEL",
    meta: [car.releaseYear ? `${car.releaseYear}` : "", car.bodyType ?? "", car.segment ?? ""].filter(Boolean).join(" / "),
    description: compactText(car.summary ?? car.summaryLong ?? car.costImpression ?? car.seoDescription ?? ""),
    image: pickImage(index, car.heroImage, car.mainImage, car.thumbnail, car.ogImageUrl),
  }));

  return (
    <CinemaCategoryPage
      eyebrow="CATEGORY"
      title="CARS"
      labelJa="車種一覧"
      lead="見て、比べて、次の一台へ。"
      description="車種ごとのキャラクター、維持の現実、選ぶ前に見るべきポイントへ進む入口です。トップページの黒いシネマティックな世界観をそのまま引き継ぎ、車種をギャラリーではなく編集されたアーカイブとして見せます。"
      heroImage="/hero-bugatti-v3.jpg"
      heroCode="01"
      heroMeta="MODELS"
      stats={[
        { label: "MODELS", value: String(cards.length) },
        { label: "MAKERS", value: String(new Set(cars.map((car) => car.maker).filter(Boolean)).size) },
        { label: "INDEX", value: "CAR" },
      ]}
      featured={buildFeaturedCards(cards)}
      cards={cards}
      directoryLinks={[
        { href: "/cars/makers", label: "メーカー別", note: "ブランドから車種を探す。" },
        { href: "/cars/body-types", label: "ボディタイプ別", note: "SUV、セダン、スポーツなどで絞る。" },
        { href: "/cars/segments", label: "セグメント別", note: "用途と価格感から候補を詰める。" },
        { href: "/guide", label: "買い方へ", note: "車種選びの次に必要な判断へ進む。" },
      ]}
      marqueeImages={[...CINEMA_MARQUEE_IMAGES]}
    />
  );
}
