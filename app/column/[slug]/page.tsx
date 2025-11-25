// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getColumnBySlug } from "@/lib/columns";
import ColumnReaderShell from "./reader-shell";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    return {
      title: "コラムが見つかりません | CAR BOUTIQUE",
      description: "指定されたコラム記事が見つかりませんでした。",
    };
  }

  const title = `${item.title} | COLUMN | CAR BOUTIQUE`;
  const description =
    item.summary ||
    "オーナー体験やメンテナンス、技術解説などのコラムを掲載しています。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/column/${encodeURIComponent(item.slug)}`,
      images: item.heroImage ? [{ url: item.heroImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ColumnDetailPage({ params }: Props) {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    notFound();
  }

  return <ColumnReaderShell item={item} />;
}
