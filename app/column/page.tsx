// app/column/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { getAllColumns } from "@/lib/columns";

export const metadata: Metadata = {
  title: "COLUMN | CAR BOUTIQUE",
  description:
    "オーナー視点の本音レビューや技術コラム、維持費・トラブル解説など、少しディープなクルマ読み物をまとめたコラム一覧ページです。",
};

export default async function ColumnIndexPage() {
  const columns = getAllColumns();

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6 lg:px-8">
        {/* ヒーローブロック */}
        <section className="rounded-3xl bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                COLUMN
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                じっくり読みたいクルマの話
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                数字やスペックだけでは見えてこない、
                オーナー目線の実感や、少しマニアックな技術の裏側。
                CAR BOUTIQUEでは、クルマとの付き合い方が「少し楽になる」「少し好きになる」
                そんな読み物を少しずつ増やしていきます。
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-teal-50/80 px-4 py-3 text-xs text-slate-700 md:mt-0 md:max-w-xs">
              <p className="font-semibold text-teal-900">
                このコーナーの読み方
              </p>
              <p className="leading-relaxed">
                ・TECHNICAL…仕組みや構造の話
                <br />
                ・OWNERSHIP…お金や維持のリアル
                <br />
                ・GUIDE…買い方や選び方の指針
              </p>
            </div>
          </div>
        </section>

        {/* コラム一覧 */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-slate-500">
            LATEST COLUMNS
          </h2>
          {columns.length === 0 ? (
            <p className="rounded-2xl bg-white/70 px-4 py-6 text-sm text-slate-500 shadow-sm">
              まだコラムはありません。順次追加予定です。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {columns.map((col) => (
                <article
                  key={col.slug}
                  className="group flex flex-col rounded-3xl bg-white/80 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.10)] transition-shadow hover:shadow-[0_20px_55px_rgba(15,23,42,0.16)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
                      {mapCategoryLabel(col.category)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(col.publishedAt)}・約{col.readingTimeMinutes}分
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 group-hover:underline">
                    <Link href={`/column/${col.slug}`}>{col.title}</Link>
                  </h3>

                  {col.subTitle && (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {col.subTitle}
                    </p>
                  )}

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {col.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 text-xs text-slate-500">
                    <Link
                      href={`/column/${col.slug}`}
                      className="inline-flex items-center gap-1 text-teal-800"
                    >
                      続きを読む
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function mapCategoryLabel(category: string): string {
  switch (category) {
    case "technical":
      return "TECHNICAL";
    case "ownership":
      return "OWNERSHIP";
    case "guide":
      return "GUIDE";
    case "history":
      return "HISTORY";
    default:
      return "COLUMN";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}
