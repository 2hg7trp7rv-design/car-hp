// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getColumnBySlug, getAllColumns } from "@/lib/columns";
import { GlassCard } from "@/components/GlassCard";
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

  // 関連コラム取得（同じカテゴリ or タグが被っているものを優先）
  const all = await getAllColumns();
  const related = all
    .filter((c) => c.slug !== item.slug)
    .filter((c) => {
      const sameCategory =
        item.category && c.category && c.category === item.category;
      const sameTag =
        item.tags &&
        item.tags.length > 0 &&
        c.tags &&
        c.tags.some((t) => item.tags!.includes(t));
      return sameCategory || sameTag;
    })
    .slice(0, 3);

  return (
    <>
      <ColumnReaderShell item={item} />

      {/* 関連コラム */}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.28em] text-text-sub">
                RELATED COLUMNS
              </p>
              <h2 className="mt-1 text-sm font-semibold tracking-tight text-text-main sm:text-[15px]">
                同じテーマのコラムもあわせてチェック
              </h2>
            </div>
            <Link
              href="/column"
              className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
            >
              コラム一覧へ
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {related.map((c) => (
              <GlassCard
                key={c.id}
                as="article"
                interactive
                className="flex h-full flex-col p-4 sm:p-5"
              >
                <Link href={`/column/${c.slug}`} className="block h-full">
                  <div className="flex h-full flex-col">
                    <p className="text-[10px] tracking-[0.22em] text-text-sub">
                      {c.category ?? "COLUMN"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-slate-900 sm:text-[13px]">
                      {c.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                      {c.summary}
                    </p>
                    {c.tags && c.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 text-[10px] text-text-sub">
                        {c.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-50 px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* モバイル向けの戻る導線（本文下） */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:hidden">
        <div className="border-top border-slate-100 pt-4">
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
