// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { CarRotator } from "@/components/car/CarRotator";
import CompareSlider from "@/components/car/CompareSlider";
import {
  getAllCars,
  getCarBySlug,
  type CarItem,
} from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

/**
 * CarItemを04_data-models-typesの指針に沿って拡張したローカル型。
 * lib/cars.tsの実装と段階的に寄せていく前提で、ここではintersectionで扱う。
 */
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  /**
   * 0-100km/h加速タイム(秒)
   * data/cars.json側で任意項目として追加できる拡張フィールド
   */
  zeroTo100?: number;
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const title = `${car.name} | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "スペック、長所・短所、トラブル傾向、関連ニュースやコラムをまとめた車種ページです。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(
        car.slug,
      )}`,
    },
  };
}

// 以下、既存の処理(buildKeywords・mapDifficultyLabel・コンポーネント本体など)は
// 先ほどのzipに入っている内容のままで問題ありません。
