// app/news/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
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

  const totalCount = items.length;
  const filteredCount = filtered.length;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヘッダー＋検索ボックス */}
      <header className="mb-6 space-y-4 sm:mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
            NEWS
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            ニュース一覧
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
            国内メーカー発表から海外メディアの記事まで、RSSで取得したニュースを
            「タイトル＋要約＋出典」付きで整理していきます。
          </p>
        </div>

        {/* 検索フォーム＋件数表示 */}
        <GlassCard padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            action="/news"
            method="get"
            className="flex flex-1 items-center gap-2 rounded-full border border-slate-100 bg-white/70 px-3 py-1.5 text-[11px] shadow-soft"
          >
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q ?? ""}
              placeholder="キーワードで絞り込み（車名・メーカー・トピックなど）"
              className="h-7 flex-1 bg-transparent text-[11px] text-slate-800 outline-none placeholder:text-slate-400"
            />
            {categoryFilter && (
              <input type="hidden" name="category" value={categoryFilter} />
            )}
            {makerFilter && (
              <input type="hidden" name="maker" value={makerFilter} />
            )}
            {tagFilter && (
              <input type="hidden" name="tag" value={tagFilter} />
            )}
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white"
            >
              検索
            </button>
          </form>

          <div className="text-[11px] text-text-sub">
            <span className="font-semibold text-slate-800">
              {filteredCount}
            </span>
            <span className="ml-1">件表示中</span>
            {q && (
              <span className="ml-2 text-slate-400">
                全{totalCount}件中
              </span>
            )}
          </div>
        </GlassCard>
      </header>

      {/* フィルター */}
      <section className="mb-6 space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3 text-[11px] text-text-sub backdrop-blur-md sm:p-4">
        <div className="flex flex-wrap gap-2">
          <span className="font-medium text-slate-700">カテゴリ</span>
          <div className="flex flex-wrap gap-1">
            <Link
              href="/news"
              className={[
                "rounded-full px-3 py-1",
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
                  "rounded-full px-3 py-1",
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

        {makers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">メーカー</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href="/news"
                className={[
                  "rounded-full px-3 py-1",
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
                    "rounded-full px-3 py-1",
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

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">タグ</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href="/news"
                className={[
                  "rounded-full px-3 py-1",
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
                    "rounded-full px-3 py-1",
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
              <Link href={`/news/${item.id}`} className="block">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  {/* 左: メタ情報＋タイトル */}
                  <div className="flex-1 space-y-1">
                    <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>

                    <h2 className="text-sm font-semibold leading-snug text-slate-900 sm:text-[15px] md:text-[17px]">
                      {title}
                    </h2>

                    {item.excerpt && (
                      <p className="mt-1 text-xs leading-relaxed text-text-sub line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* 右: 出典＋日付 */}
                  <div className="flex min-w-[140px] flex-col items-start justify-between gap-1 text-[11px] text-text-sub sm:items-end sm:text-right">
                    <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                      {sourceName}
                    </div>
                    <p className="text-[11px] text-slate-500">{dateLabel}</p>
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
