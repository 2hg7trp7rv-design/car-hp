// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getColumnBySlug, type ColumnItem } from "@/lib/columns";

// clientコンポーネントを同ファイル内に定義
import ColumnReaderShell from "./reader-shell";

type Props = {
  params: { slug: string };
};

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "OWNER_STORY":
      return "オーナーの本音ストーリー";
    case "MAINTENANCE":
      return "メンテナンスとトラブルの裏側";
    case "TECHNICAL":
      return "技術・歴史・ブランドの物語";
    default:
      return "コラム";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    return {
      title: "コラムが見つかりません | CAR BOUTIQUE",
      description: "指定されたコラムが見つかりませんでした。",
    };
  }

  return {
    title: `${item.title} | CAR BOUTIQUE`,
    description: item.summary,
  };
}

export default async function ColumnDetailPage({ params }: Props) {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    notFound();
  }

  return (
    <ColumnReaderShell item={item} />
  );
}
