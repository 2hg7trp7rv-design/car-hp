// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getLatestNews } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "ニュース一覧 | CAR BOUTIQUE",
  description:
    "主要メーカーや国内外メディアから厳選したニュースを、分かりやすく整理してお届けします。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default async function NewsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const categoryFilter = searchParams?.category ?? "";
  const makerFilter = searchParams?.maker ?? "";
  const tagFilter = searchParams?.tag ?? "";

  const items = await getLatestNews(80);

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter(Boolean)),
  ) as string[];

  const tags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? [])),
  ) as string[];

  const filtered = items.filter((item) => {
    const title = (item.titleJa ?? item.title ?? "").toLowerCase();
    const excerpt = (item.excerpt ?? "").toLowerCase();
    const haystack = `${title} ${excerpt}`;

    const matchQuery = q ? haystack.includes(q) : true;
    const matchCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    const matchMaker = makerFilter ? item.maker === makerFilter : true;
    const matchTag = tagFilter
      ? item.tags?.some((t) => t === tagFilter)
      : true;

    return matchQuery && matchCategory && matchMaker && matchTag;
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヘッダー */}
      <header className="mb-6 space-y-2 sm:mb-8">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          NEWS
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ニュース一覧
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          国内メーカー発表から海外メディアの記事まで、
          RSSで取得したニュースを要約付きで整理していきます。
        </p>
      </header>

      {/* 検索＋フィルター */}
      <section className="mb-6 space-y-3">
        {/* 検索フォーム */}
        <GlassCard padding="sm" className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-text-sub">
                SEARCH
              </p>
              <p className="mt-1 text-[11px] text-text-sub">
                キーワードでニュースのタイトルや要約を横断検索できます。
              </p>
            </div>
            <form
              action="/news"
              method="get"
              className="w-full max-w-xs sm:w-auto"
            >
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] shadow-soft">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams?.q ?? ""}
                  placeholder="キーワードで絞り込み"
                  className="h-7 flex-1 border-none bg-transparent text-[11px] text-slate-800 outline-none placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  className="rounded-full bg-tiffany-500 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white hover:bg-tiffany-600"
                >
                  検索
                </button>
              </div>
            </form>
          </div>

          {q && (
            <p className="mt-1 text-[11px] text-text-sub">
              「{q}」で{filtered.length}件ヒットしました
            </p>
          )}
        </GlassCard>

        {/* フィルター群 */}
        <GlassCard padding="sm" className="space-y-3">
          {/* カテゴリ */}
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-[11px] text-slate-700">
              カテゴリ
            </span>
            <div className="flex flex-wrap gap-1">
              <Link
                href="/news"
                className={[
                  "rounded-full px-3 py-1 text-[11px]",
                  !categoryFilter
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                すべて
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/news?category=${encodeURIComponent(c)}`}
                  className={[
                    "rounded-full px-3 py-1 text-[11px]",
                    categoryFilter === c
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* メーカー */}
          {makers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium text-[11px] text-slate-700">
                メーカー
              </span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href="/news"
                  className={[
                    "rounded-full px-3 py-1 text-[11px]",
                    !makerFilter
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  すべて
                </Link>
                {makers.map((m) => (
                  <Link
                    key={m}
                    href={`/news?maker=${encodeURIComponent(m)}`}
                    className={[
                      "rounded-full px-3 py-1 text-[11px]",
                      makerFilter === m
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {m}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* タグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-medium text-[11px] text-slate-700">
                タグ
              </span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href="/news"
                  className={[
                    "rounded-full px-3 py-1 text-[11px]",
                    !tagFilter
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  すべて
                </Link>
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/news?tag=${encodeURIComponent(t)}`}
                    className={[
                      "rounded-full px-3 py-1 text-[11px]",
                      tagFilter === t
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      {/* ニュースカード一覧 */}
      <section className="space-y-4">
        {filtered.map((item) => {
          const title = item.titleJa || item.title;
          const sourceName = item.sourceName ?? "EXTERNAL";
          const dateLabel = formatDate(item.publishedAt);

          return (
            <GlassCard
              key={item.id}
              as="article"
              className="transition hover:shadow-soft-strong"
              interactive
            >
              <Link
                href={`/news/${encodeURIComponent(item.id)}`}
                className="block"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>

                    <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                      {title}
                    </h2>

                    {item.excerpt && (
                      <p className="text-xs leading-relaxed text-text-sub">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-none flex-col items-end justify-between text-right text-[11px] text-text-sub">
                    <p>{sourceName}</p>
                    <p>{dateLabel}</p>
                  </div>
                </div>
              </Link>
            </GlassCard>
          );
        })}

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-sub">
            条件に一致するニュースがありません。
          </p>
        )}
      </section>
    </main>
  );
}
