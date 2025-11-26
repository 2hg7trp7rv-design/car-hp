// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getColumnBySlug } from "@/lib/columns";
import ColumnReaderShell from "./reader-shell";

type Props = {
  params: { slug: string };
};

export const runtime = "edge";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    return {
      title: "コラムが見つかりません | CAR BOUTIQUE",
      description: "指定されたコラムが見つかりませんでした。",
    };
  }

  const description =
    item.summary ||
    "オーナー体験記やトラブル・修理、技術解説など、クルマと暮らしの距離が少し近づく読み物です。";

  return {
    title: `${item.title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${item.title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/column/${encodeURIComponent(
        params.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: `${item.title} | CAR BOUTIQUE`,
      description,
    },
  };
}

export default async function ColumnDetailPage({ params }: Props) {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    notFound();
  }

  return (
    <>
      <ColumnReaderShell item={item!} />
      {/* モバイル向けの戻る導線（本文下） */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:hidden">
        <div className="border-t border-slate-100 pt-4">
          <Link
            href="/column"
            className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-6 py-2 text-xs font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg-white"
          >
            コラム一覧へ戻る
          </Link>
        </div>
      </div>
    </>
  );
}
