// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getColumnBySlug,
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
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
      <ColumnReaderShell item={item} />

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
              RELATED COLUMN
            </h2>
            <Link
              href="/column"
              className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
            >
              すべてのコラム一覧へ
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {related.map((col) => (
              <Link key={col.id} href={`/column/${col.slug}`}>
                <article className="rounded-3xl border border-white/80 bg-white/90 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
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

                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                    {col.summary}
                  </p>

                  {col.tags && col.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
                      {col.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-50 px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                      {col.tags.length > 3 && (
                        <span className="rounded-full bg-slate-50 px-2 py-1">
                          +{col.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* モバイル向けの戻る導線 */}
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
