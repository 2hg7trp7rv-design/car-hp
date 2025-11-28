// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getColumnBySlug,
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

import ColumnReaderShell from "./reader-shell";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

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
    "トラブル・修理の実例や、ブランドの歴史・技術解説などを整理したコラムです。";

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

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// OWNER_STORY は扱わず、実質残すのは
// ・メンテナンス／トラブル
// ・技術・歴史・ブランド
function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "技術・歴史・ブランド";
    default:
      return "コラム";
  }
}

export default async function ColumnDetailPage({ params }: Props) {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    notFound();
  }

  // 関連コラム: カテゴリ一致＋タグ重なりをスコア化
  const all = await getAllColumns();
  const relatedCandidates = all.filter((c) => c.id !== item.id);

  const relatedScored = relatedCandidates
    .map((c) => {
      let score = 0;
      if (c.category && item.category && c.category === item.category) {
        score += 2;
      }
      if (c.tags && item.tags && c.tags.length > 0 && item.tags.length > 0) {
        const overlap = c.tags.filter((t) => item.tags!.includes(t)).length;
        if (overlap > 0) {
          score += 1 + overlap * 0.1;
        }
      }
      return { column: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const related = relatedScored.map((x) => x.column);

  return (
    <>
      {/* 読書体験本体（没入レイアウトやProgress barは ColumnReaderShell 側で） */}
      <ColumnReaderShell item={item} />

      {/* RELATED COLUMN セクション：雑誌の巻末みたいな雰囲気で */}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                  NEXT READ
                </p>
                <h2 className="mt-1 text-xs font-semibold tracking-[0.22em] text-slate-700">
                  RELATED COLUMN
                </h2>
              </div>
              <Link
                href="/column"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {related.map((col) => (
              <Reveal key={col.id}>
                <Link href={`/column/${col.slug}`}>
                  <GlassCard
                    as="article"
                    padding="md"
                    interactive
                    className="group relative h-full overflow-hidden border border-white/80 bg-white/92 text-xs shadow-soft"
                  >
                    {/* カード内 Tiffany の光 */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col gap-2">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {mapCategoryLabel(col.category)}
                        </span>
                        {col.readMinutes && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            約{col.readMinutes}分
                          </span>
                        )}
                        {col.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(col.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {col.title}
                      </h3>

                      {col.summary && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                          {col.summary}
                        </p>
                      )}

                      {col.tags && col.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
                          {col.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-50 px-2 py-1"
                            >
                              #{tag}
                            </span>
                          ))}
                          {col.tags.length > 3 && (
                            <span className="rounded-full bg-slate-50 px-2 py-1">
                              +{col.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* モバイル向けの戻る導線：ブランドボタン版 */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:hidden">
        <div className="border-t border-slate-100 pt-4">
          <Reveal>
            <Button
              asChild
              variant="primary"
              size="sm"
              magnetic
              className="w-full justify-center rounded-full text-[11px] tracking-[0.2em]"
            >
              <Link href="/column">コラム一覧へ戻る</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </>
  );
}
