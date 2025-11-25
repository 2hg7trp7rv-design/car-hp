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
  const qRaw = searchParams?.q ?? "";
  const q = qRaw.trim().toLowerCase();
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
  const hitCount = filtered.length;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-6 space-y-2 sm:mb-8">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          NEWS
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ニュース一覧
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          国内メーカー発表から海外メディアの記事まで、RSSで取得したニュースを要約付きで整理していきます。
        </p>
      </header>

      {/* 検索＋フィルター */}
      <section className="mb-6 space-y-4 rounded-2xl border border-white/70 bg-white/70 p-3 text-[11px] text-text-sub backdrop-blur-md sm:p-4">
        {/* 検索行＋件数表示 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form
            action="/news"
            method="get"
            className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1.5"
          >
            {/* 既存フィルタを保持 */}
            {categoryFilter && (
              <input type="hidden" name="category" value={categoryFilter} />
            )}
            {makerFilter && (
              <input type="hidden" name="maker" value={makerFilter} />
            )}
            {tagFilter && (
              <input type="hidden" name="tag" value={tagFilter} />
            )}

            <input
              type="search"
              name="q"
              defaultValue={qRaw}
              placeholder="キーワードで絞り込み"
              className="h-7 flex-1 bg-transparent text-[11px] text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="h-7 rounded-full bg-slate-900 px-3 text-[10px] font-medium tracking-[0.18em] text-white"
            >
              SEARCH
            </button>
          </form>

          <div className="text-[10px] text-slate-500">
            全{totalCount}件中
            <span className="mx-1 font-semibold text-slate-800">
              {hitCount}件
            </span>
            を表示中
          </div>
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex flex-wrap gap-2">
          <span className="font-medium text-slate-700">カテゴリ</span>
          <div className="flex flex-wrap gap-1">
            <Link
              href={
                qRaw || makerFilter || tagFilter
                  ? `/news?${new URLSearchParams({
                      ...(qRaw ? { q: qRaw } : {}),
                      ...(makerFilter ? { maker: makerFilter } : {}),
                      ...(tagFilter ? { tag: tagFilter } : {}),
                    }).toString()}`
                  : "/news"
              }
              className={[
                "rounded-full px-3 py-1",
                !categoryFilter
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              すべて
            </Link>
            {categories.map((c) => {
              const params = new URLSearchParams({
                category: c,
                ...(qRaw ? { q: qRaw } : {}),
                ...(makerFilter ? { maker: makerFilter } : {}),
                ...(tagFilter ? { tag: tagFilter } : {}),
              });
              return (
                <Link
                  key={c}
                  href={`/news?${params.toString()}`}
                  className={[
                    "rounded-full px-3 py-1",
                    categoryFilter === c
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        </div>

        {/* メーカー */}
        {makers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">メーカー</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={
                  qRaw || categoryFilter || tagFilter
                    ? `/news?${new URLSearchParams({
                        ...(qRaw ? { q: qRaw } : {}),
                        ...(categoryFilter ? { category: categoryFilter } : {}),
                        ...(tagFilter ? { tag: tagFilter } : {}),
                      }).toString()}`
                    : "/news"
                }
                className={[
                  "rounded-full px-3 py-1",
                  !makerFilter
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                すべて
              </Link>
              {makers.map((m) => {
                const params = new URLSearchParams({
                  maker: m,
                  ...(qRaw ? { q: qRaw } : {}),
                  ...(categoryFilter ? { category: categoryFilter } : {}),
                  ...(tagFilter ? { tag: tagFilter } : {}),
                });
                return (
                  <Link
                    key={m}
                    href={`/news?${params.toString()}`}
                    className={[
                      "rounded-full px-3 py-1",
                      makerFilter === m
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {m}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-slate-700">タグ</span>
            <div className="flex flex-wrap gap-1">
              <Link
                href={
                  qRaw || categoryFilter || makerFilter
                    ? `/news?${new URLSearchParams({
                        ...(qRaw ? { q: qRaw } : {}),
                        ...(categoryFilter ? { category: categoryFilter } : {}),
                        ...(makerFilter ? { maker: makerFilter } : {}),
                      }).toString()}`
                    : "/news"
                }
                className={[
                  "rounded-full px-3 py-1",
                  !tagFilter
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ].join(" ")}
              >
                すべて
              </Link>
              {tags.map((t) => {
                const params = new URLSearchParams({
                  tag: t,
                  ...(qRaw ? { q: qRaw } : {}),
                  ...(categoryFilter ? { category: categoryFilter } : {}),
                  ...(makerFilter ? { maker: makerFilter } : {}),
                });
                return (
                  <Link
                    key={t}
                    href={`/news?${params.toString()}`}
                    className={[
                      "rounded-full px-3 py-1",
                      tagFilter === t
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {t}
                  </Link>
                );
              })}
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

                  <div className="mt-1 flex items-center justify-between text-[11px] text-text-sub">
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
