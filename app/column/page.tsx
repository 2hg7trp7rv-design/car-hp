// app/column/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "コラムとストーリー一覧 | CAR BOUTIQUE",
  description:
    "オーナー体験記やトラブル・修理、技術解説など、クルマと暮らしの距離が少し近づく読み物をまとめたコラム一覧ページです。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
  };
};

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
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

export default async function ColumnPage({ searchParams }: Props) {
  const q = normalize(searchParams?.q);
  const categoryFilter = (searchParams?.category ?? "").trim();

  const all = await getAllColumns();

  // 公開日が新しい順にソート（なければそのまま）
  const sorted = [...all].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return a.publishedAt < b.publishedAt ? 1 : -1;
  });

  const categories = Array.from(
    new Set(sorted.map((c) => c.category).filter(Boolean)),
  ) as ColumnItem["category"][];

  const items = sorted.filter((column) => {
    if (q) {
      const haystack = [
        column.title,
        column.summary,
        mapCategoryLabel(column.category),
        ...(column.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (categoryFilter && column.category !== categoryFilter) return false;
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
          <p className="text-[10px] tracking-[0.32em] text-text-sub">
            COLUMN & STORIES
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            スペックの外側にある
            <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
              物語
            </span>
            を集めたコラム集。
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
            オーナーの本音ストーリーや、トラブル・修理・維持費のリアル、
            そして技術や歴史の背景など、「ニュースの一歩先」をじっくり読める
            読み物を少しずつ増やしていきます。
          </p>
          <p className="text-[11px] text-text-sub">
            現在
            <span className="mx-1 font-semibold text-slate-900">
              {all.length}本
            </span>
            のコラムが公開されています。
          </p>
        </header>

        {/* フィルターバー */}
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
                  placeholder="車名・テーマ・キーワードで探す"
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                >
                  <option value="">すべて</option>
                  {categories.map((c) => (
                    <option key={c} value={c ?? ""}>
                      {c ? mapCategoryLabel(c) : "コラム"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-3">
              <Link
                href="/column"
                className="text-[11px] font-medium text-slate-600 underline-offset-4 hover:underline"
              >
                条件をクリア
              </Link>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
              >
                絞り込み
              </button>
            </div>
          </form>
        </section>

        {/* コラム一覧 */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
              COLUMN LIST
            </h2>
            <p className="text-[11px] text-slate-400">
              {items.length}本表示中
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
              条件に合致するコラムが見つかりませんでした。
              絞り込み条件を緩めて再度お試しください。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((column) => (
                <ColumnCard key={column.id} column={column} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type CardProps = {
  column: ColumnItem;
};

function ColumnCard({ column }: CardProps) {
  const categoryLabel = mapCategoryLabel(column.category);
  const dateLabel = formatDate(column.publishedAt);
  const href = `/column/${column.slug}`;

  return (
    <GlassCard
      as="article"
      interactive
      className="flex h-full flex-col p-4 sm:p-5"
    >
      <Link href={href} className="block h-full">
        <div className="flex h-full flex-col">
          {/* メタ情報行 */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
              {categoryLabel}
            </span>
            <div className="flex items-center gap-2">
              {column.readMinutes && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  約{column.readMinutes}分で読めます
                </span>
              )}
              {dateLabel && (
                <span className="text-[11px] text-text-sub">{dateLabel}</span>
              )}
            </div>
          </div>

          {/* タイトル */}
          <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
            {column.title}
          </h2>

          {/* サマリー */}
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-sub">
            {column.summary}
          </p>

          {/* タグ行 */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
            <div className="flex flex-wrap gap-1">
              {column.tags?.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
            {column.tags && column.tags.length > 4 && (
              <span className="text-[10px] text-slate-400">
                ほか{column.tags.length - 4}件のタグ
              </span>
            )}
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}
