// app/news/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata = {
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
          国内メーカー発表から専門メディアの記事まで、
          RSSで取得したニュースを要約付きで整理していきます。
          気になるトピックはカテゴリやメーカー、キーワードで絞り込めます。
        </p>
        <p className="text-[11px] text-text-sub">
          全{items.length}件中{" "}
          <span className="font-semibold text-slate-900">
            {filtered.length}件
          </span>
          を表示しています。
        </p>
      </header>

      {/* 検索＋フィルター */}
      <section className="mb-6 space-y-3 rounded-2xl border border-white/70 bg-white/75 p-3 text-[11px] text-text-sub backdrop-blur-md sm:p-4">
        {/* キーワード検索 */}
        <form
          action="/news"
          method="get"
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <label className="block text-[10px] font-semibold tracking-[0.22em] text-slate-600">
              キーワード検索
            </label>
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q ?? ""}
              placeholder="車名・メーカー・キーワードで検索"
              className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-tiffany-400 focus:bg-white focus:ring-2 focus:ring-tiffany-100"
            />
          </div>
          <div className="flex gap-2 pt-1 sm:pt-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-tiffany-500 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white shadow-soft hover:bg-tiffany-600"
            >
              絞り込む
            </button>
            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-slate-700 hover:bg-white"
            >
              条件リセット
            </Link>
          </div>
        </form>

        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="font-medium text-slate-700">カテゴリ</span>
          <div className="flex flex-wrap gap-1">
            <Link
              href={{
                pathname: "/news",
                query: { ...(q && { q }), ...(makerFilter && { maker: makerFilter }), ...(tagFilter && { tag: tagFilter }) },
              }}
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
                href={{
                  pathname: "/news",
                  query: {
                    ...(q && { q }),
                    category: c,
                    ...(makerFilter && { maker: makerFilter }),
                    ...(tagFilter && { tag: tagFilter }),
                  },
                }}
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

        {/* メーカーフィルター */}
        {makers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">メーカー</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={{
                  pathname: "/news",
                  query: {
                    ...(q && { q }),
                    ...(categoryFilter && { category: categoryFilter }),
                    ...(tagFilter && { tag: tagFilter }),
                  },
                }}
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
                  href={{
                    pathname: "/news",
                    query: {
                      ...(q && { q }),
                      ...(categoryFilter && { category: categoryFilter }),
                      maker: m,
                      ...(tagFilter && { tag: tagFilter }),
                    },
                  }}
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

        {/* タグフィルター */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">タグ</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={{
                  pathname: "/news",
                  query: {
                    ...(q && { q }),
                    ...(categoryFilter && { category: categoryFilter }),
                    ...(makerFilter && { maker: makerFilter }),
                  },
                }}
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
                  href={{
                    pathname: "/news",
                    query: {
                      ...(q && { q }),
                      ...(categoryFilter && { category: categoryFilter }),
                      ...(makerFilter && { maker: makerFilter }),
                      tag: t,
                    },
                  }}
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>
                    <p className="text-[10px] text-text-sub">
                      {sourceName}
                      {dateLabel && ` ｜ ${dateLabel}`}
                    </p>
                  </div>

                  <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                    {title}
                  </h2>

                  {item.excerpt && (
                    <p className="text-xs leading-relaxed text-text-sub">
                      {item.excerpt}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-text-sub">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </GlassCard>
          );
        })}

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-sub">
            条件に一致するニュースがありません。
            検索キーワードやカテゴリ・メーカーの条件を少し緩めてみてください。
          </p>
        )}
      </section>
    </main>
  );
}
