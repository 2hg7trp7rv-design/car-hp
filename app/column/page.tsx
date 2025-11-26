// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "コラムとストーリー | CAR BOUTIQUE",
  description:
    "オーナー体験記やトラブル・修理、技術解説など、クルマと暮らしの距離が少し近づく読み物を集めました。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
  };
};

function normalizeText(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
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

export default async function ColumnPage({ searchParams }: Props) {
  const q = normalizeText(searchParams?.q);
  const categoryFilter = (searchParams?.category ?? "").trim();

  const items = await getAllColumns();

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as ColumnItem["category"][];

  const filtered = items.filter((item) => {
    if (q) {
      const haystack = `${item.title ?? ""} ${item.excerpt ?? ""} ${
        mapCategoryLabel(item.category)
      } ${(item.tags ?? []).join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (categoryFilter && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">COLUMN</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-3">
          <Reveal>
            <p className="text-[10px] tracking-[0.32em] text-text-sub">
              OWNER STORIES / TECH NOTES
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              オーナーの本音と、技術や歴史の
              <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
                物語
              </span>
              を少しずつ。
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
              「買ってどうだったか」「壊れたときいくらかかったか」といったリアルな声から、
              エンジンやブランドの背景にあるストーリーまで、読み物として楽しめるコラムを集めていきます。
            </p>
          </Reveal>
        </header>

        {/* フィルターバー（キーワード＋カテゴリ） */}
        <Reveal delay={200}>
          <section className="mb-8 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <form action="/column" method="get" className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* キーワード検索 */}
                <div className="w-full md:w-2/3">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    name="q"
                    defaultValue={searchParams?.q ?? ""}
                    placeholder="車名・出来事・キーワードで探す"
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* カテゴリ */}
                <div className="w-full md:w-1/3">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    defaultValue={categoryFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {mapCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* フィルター適用ボタン */}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
                >
                  絞り込み
                </button>
              </div>
            </form>
          </section>
        </Reveal>

        {/* コラム一覧 */}
        <Reveal delay={260}>
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                COLUMN LIST
              </h2>
              <p className="text-[11px] text-slate-400">
                {filtered.length}件表示中
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
                条件に合致するコラムが見つかりませんでした。
                絞り込み条件を緩めて再度お試しください。
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((item) => (
                  <ColumnListItem key={item.slug} item={item} />
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* 回遊導線: GUIDE / NEWS */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <Link href="/guide">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                GUIDE
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                お金や維持費の話は、ガイドで整理。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                保険や税金、車検、ローンなど、暮らし寄りの実用情報はGUIDEセクションで
                少しずつ増やしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                ガイド一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>

          <Link href="/news">
            <div className="group h-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
                NEWS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                コラムで気になったトピックの最新動向はニュースで。
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                メーカー発表や業界ニュースなど、背景となる動きはNEWSセクションから辿れるようにしていきます。
              </p>
              <span className="mt-3 inline-flex items-center text-[11px] font-medium tracking-[0.2em] text-slate-700">
                ニュース一覧へ
                <span className="ml-1 text-[10px]">→</span>
              </span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}

type ColumnListItemProps = {
  item: ColumnItem;
};

function ColumnListItem({ item }: ColumnListItemProps) {
  return (
    <Link href={`/column/${encodeURIComponent(item.slug)}`}>
      <GlassCard
        as="article"
        padding="md"
        interactive
        className="h-full border border-slate-200/80 bg-white/90"
      >
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">
              {mapCategoryLabel(item.category)}
            </span>
            {item.tags &&
              item.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2 py-1"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold leading-relaxed text-slate-900">
              {item.title}
            </h2>
            {item.excerpt && (
              <p className="text-[11px] leading-relaxed text-text-sub line-clamp-3">
                {item.excerpt}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between text-[10px] text-slate-400">
            {item.publishedAt && (
              <span className="tracking-[0.14em]">{item.publishedAt}</span>
            )}
            {item.readingTime && (
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {item.readingTime}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
