// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { SectionCard } from "@/components/section-card";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const metadata: Metadata = {
  title: "コラムとストーリー | CAR BOUTIQUE",
  description:
    "オーナー体験記やトラブル・修理、技術解説など、クルマと暮らしの距離が少し近づく読み物を集めました。",
};

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "OWNER_STORY":
      return "オーナーの本音ストーリー";
    case "MAINTENANCE":
      return "メンテナンスとトラブルの裏側";
    case "TECHNICAL":
      return "技術・歴史・ブランドの背景";
    case "MONEY":
      return "お金と維持費の話";
    case "USED":
      return "中古車と相場のリアル";
    default:
      return "COLUMN";
  }
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default async function ColumnIndexPage() {
  const columns = await getAllColumns();

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      {/* 冒頭カード */}
      <SectionCard
        eyebrow="COLUMN"
        title="クルマと暮らしのコラム"
        highlight="カタログやスペック表だけでは見えにくい、クルマとの距離感を少し整えるための場所。"
        description="オーナーとして感じたこと、トラブルが起きたときの経緯や考え方、整備や技術の背景などを、実体験ベースで静かに整理していきます。"
      />

      {/* コラム一覧 */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="serif-font text-lg font-semibold tracking-tight text-slate-900">
            最新コラム
          </h2>
          
        </div>

        {columns.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            準備中です。少しずつ、濃いめのコラムを公開していきます。
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {columns.map((col) => (
              <article
                key={col.slug}
                className="flex h-full flex-col rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 backdrop-blur"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-wide text-emerald-600">
                    {mapCategoryLabel(col.category)}
                  </p>
                  <time
                    dateTime={col.publishedAt}
                    className="text-[11px] text-slate-400"
                  >
                    {formatDate(col.publishedAt)}
                  </time>
                </div>

                {/* タイトルと要約全体をリンク化 */}
                <Link
                  href={`/column/${col.slug}`}
                  className="group mt-3 block"
                >
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-800 group-hover:underline">
                    {col.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">
                    {col.summary}
                  </p>
                </Link>

                {col.tags && col.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                  <Link
                    href={`/column/${col.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                  >
                    このコラムを読む
                    <span aria-hidden>↗</span>
                  </Link>
                  <span className="text-[11px] text-slate-400">
                    約5〜10分で読めます
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
