// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
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
    default:
      return "コラム";
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default async function ColumnIndexPage() {
  const columns = await getAllColumns();
  const [featured, ...rest] = columns;

  const list = featured ? rest : columns;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヘッダー */}
      <header className="mb-6 space-y-2 sm:mb-8">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          COLUMN
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          コラムとストーリー
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          オーナー体験、メンテナンスやトラブル、技術や歴史の解説など、
          「ニュースのもう一歩先」をじっくり読めるコラムを集めています。
        </p>
      </header>

      {/* PICKUP＋サイドノート */}
      {featured && (
        <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-stretch">
          {/* PICKUPコラム */}
          <GlassCard
            as="article"
            interactive
            padding="lg"
            className="flex h-full flex-col"
          >
            <Link href={`/column/${featured.slug}`} className="block h-full">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                    PICKUP COLUMN
                  </span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </div>

                <h2 className="mt-4 text-[17px] font-semibold leading-snug text-slate-900 sm:text-lg">
                  {featured.title}
                </h2>

                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                  {featured.summary}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {mapCategoryLabel(featured.category)}
                    </span>
                    {featured.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {featured.readMinutes && (
                    <span className="rounded-full bg-white/80 px-3 py-1">
                      約{featured.readMinutes}分で読めます
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </GlassCard>

          {/* サイドノート */}
          <div className="hidden text-[11px] text-text-sub lg:block">
            <GlassCard padding="lg" className="h-full">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                HOW TO READ
              </p>
              <p className="mt-2 leading-relaxed">
                COLUMNでは、ニュースで流れてしまう話題を、
                少し立ち止まって「背景」や「オーナーの本音」まで掘り下げます。
              </p>
              <ul className="mt-3 space-y-1.5 leading-relaxed">
                <li>•OWNER_STORYは、実際のオーナー視点のストーリー。</li>
                <li>•MAINTENANCEは、修理やトラブルの裏側をフラットに。</li>
                <li>•TECHNICALは、技術や歴史・ブランドの物語を中心に。</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                まずはPICKUPコラムから読み始めて、
                気になったタグやカテゴリーで他のコラムへ巡っていく読み方を想定しています。
              </p>
            </GlassCard>
          </div>
        </section>
      )}

      {/* 一覧グリッド */}
      <section className="grid gap-4 md:grid-cols-2">
        {list.map((column) => (
          <GlassCard
            key={column.id}
            as="article"
            interactive
            className="flex h-full flex-col p-4 sm:p-5"
          >
            <Link href={`/column/${column.slug}`} className="block h-full">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                    {mapCategoryLabel(column.category)}
                  </span>
                  <span>{formatDate(column.publishedAt)}</span>
                </div>

                <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                  {column.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-sub">
                  {column.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
                  <div className="flex flex-wrap gap-1">
                    {column.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {column.readMinutes && (
                    <span className="rounded-full bg-white/80 px-2 py-1">
                      約{column.readMinutes}分で読めます
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </GlassCard>
        ))}

        {columns.length === 0 && (
          <p className="text-sm text-text-sub">
            まだコラムがありません。順次追加していきます。
          </p>
        )}
      </section>
    </main>
  );
}
