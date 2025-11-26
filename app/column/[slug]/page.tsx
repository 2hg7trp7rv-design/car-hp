// app/column/[slug]/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getColumnBySlug,
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
import { GlassCard } from "@/components/GlassCard";
import ColumnReaderShell from "./reader-shell";

type Props = {
  params: { slug: string };
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

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

  // 関連コラム取得
  const all = await getAllColumns();
  const others = all.filter((c) => c.id !== item.id);

  const relatedByCategory =
    item.category != null
      ? others
          .filter((c) => c.category === item.category)
          .slice(0, 4)
      : [];

  let relatedByTag: ColumnItem[] = [];
  if (item.tags && item.tags.length > 0) {
    const baseTags = new Set(item.tags);
    relatedByTag = others
      .filter((c) => (c.tags ?? []).some((t) => baseTags.has(t)))
      .slice(0, 4);
  }

  const hasRelated =
    relatedByCategory.length > 0 || relatedByTag.length > 0;

  return (
    <>
      {/* 本文＋ヘッダーなどは既存のリーダーコンポーネントに委譲 */}
      <ColumnReaderShell item={item} />

      {/* 関連コラムセクション */}
      {hasRelated && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="border-t border-slate-100 pb-4 pt-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.32em] text-text-sub">
                  RELATED COLUMNS
                </p>
                <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  このコラムと近いテーマの読み物
                </h2>
                <p className="mt-1 text-[11px] text-text-sub">
                  同じカテゴリや共通のタグを持つコラムから、続けて読みやすい記事をピックアップしています。
                </p>
              </div>
              <Link
                href="/column"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedByCategory.length > 0 && (
                <GlassCard
                  padding="lg"
                  className="flex h-full flex-col"
                >
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    同じカテゴリのコラム
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByCategory.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/column/${c.slug}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {c.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {c.summary}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {mapCategoryLabel(c.category)}／
                            {formatDate(c.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {relatedByTag.length > 0 && (
                <GlassCard
                  padding="lg"
                  className="flex h-full flex-col"
                >
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    共通タグを持つコラム
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByTag.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/column/${c.slug}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {c.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {c.summary}
                          </p>
                          <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-slate-500">
                            {(c.tags ?? [])
                              .slice(0, 4)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-slate-100 px-2 py-0.5"
                                >
                                  {tag}
                                </span>
                              ))}
                            {c.tags && c.tags.length > 4 && (
                              <span className="text-slate-400">
                                ほか{c.tags.length - 4}件
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          </div>
        </section>
      )}

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
