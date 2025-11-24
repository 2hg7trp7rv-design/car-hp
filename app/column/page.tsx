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
      return "技術・歴史・ブランドの物語";
    case "MONEY":
      return "お金とライフプラン";
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
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      {/* 冒頭カード */}
      <SectionCard
        eyebrow="COLUMN"
        title="オーナー目線のコラムと物語"
        highlight="数字だけでは語れない、「クルマと人との距離感」を少し近づける場所。"
        description="ここでは、スペック表やニュースでは見えてこない「オーナーの体験」「トラブルの裏側」「技術の背景」など、クルマとの付き合い方を立体的にしてくれる読み物を集めていきます。"
      />

      {/* コラム一覧 */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="serif-font text-lg font-semibold tracking-tight text-slate-900">
            最新コラム
          </h2>
          <p className="text-xs text-slate-500">
            まだ記事数は少なめですが、1本1本じっくりと増やしていきます。
          </p>
        </div>

        {columns.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            準備中です。少しずつ、濃いめのコラムを増やしていきます。
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {columns.map((col) => (
              <article
                key={col.id}
                className="group flex h-full flex-col rounded-3xl bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] ring-1 ring-white/60 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.16)]"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    {mapCategoryLabel(col.category)}
                  </span>
                  <span className="h-[1px] w-5 bg-slate-200" />
                  <span>{formatDate(col.publishedAt)}</span>
                </div>

                <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-emerald-700">
                  {col.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {col.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {col.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <Link
                    href={`/column/${col.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700"
                  >
                    この記事を読む
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
