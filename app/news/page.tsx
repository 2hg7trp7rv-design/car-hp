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

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      {/* ヘッダー */}
      <header className="mb-6 space-y-3 sm:mb-8">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          NEWS
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ニュース一覧
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          国内メーカー発表から専門メディアの記事まで、
          編集しながらピックアップしたニュースを要約付きで整理していきます。
          気になるカテゴリやメーカーで絞り込みながら、
          「とりあえず眺めるだけ」でも楽しめるニュースルームを目指しています。
        </p>
      </header>

      {/* 検索＋フィルターエリア */}
      <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        {/* 検索フォーム＋フィルタ */}
        <div className="space-y-4 rounded-2xl border border-white/70 bg-white/80 p-3 text-[11px] text-text-sub shadow-soft-card backdrop-blur-md sm:p-4">
          {/* キーワード検索 */}
          <form
            action="/news"
            method="get"
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <label
                htmlFor="news-q"
                className="block text-[10px] font-semibold tracking-[0.24em] text-slate-600"
              >
                KEYWORD
              </label>
              <input
                id="news-q"
                name="q"
                defaultValue={qRaw}
                placeholder="車名・メーカー名・キーワードで検索"
                className="mt-1 w-full rounded-full border border-slate-200/80 bg-slate-50/60 px-3 py-1.5 text-[11px] text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-tiffany-400 focus:bg-white focus:ring-2 focus:ring-tiffany-100"
              />
              {/* 現在のフィルタを維持するためのhidden */}
              {categoryFilter && (
                <input
                  type="hidden"
                  name="category"
                  value={categoryFilter}
                />
              )}
              {makerFilter && (
                <input type="hidden" name="maker" value={makerFilter} />
              )}
              {tagFilter && (
                <input type="hidden" name="tag" value={tagFilter} />
              )}
            </div>
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center rounded-full bg-tiffany-500 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-white shadow-soft-strong hover:bg-tiffany-600 hover:shadow-soft-stronger sm:mt-5"
            >
              検索
            </button>
          </form>

          {/* カテゴリフィルタ */}
          <div className="space-y-1">
            <p className="font-medium text-slate-700">カテゴリ</p>
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

          {/* メーカーフィルタ */}
          {makers.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-slate-700">メーカー</p>
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

          {/* タグフィルタ */}
          {tags.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-slate-700">タグ</p>
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
        </div>

        {/* サイドノート（使い方説明） */}
        <div className="hidden text-[11px] text-text-sub lg:block">
          <GlassCard padding="lg" className="h-full">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              HOW TO USE
            </p>
            <p className="mt-2 leading-relaxed">
              気になるメーカーやキーワードで絞り込みながら、
              「比較したいニュースだけ」をすばやく拾えるように設計しています。
            </p>
            <ul className="mt-3 space-y-1.5 leading-relaxed">
              <li>・メーカーで絞ると、そのブランド関連のニュースだけに。</li>
              <li>・キーワード検索で車名やパワートレーンを横断検索。</li>
              <li>・タグは「EV」「新型発表」など横断テーマでの閲覧に。</li>
            </ul>
          </GlassCard>
        </div>
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
              className="cursor-pointer transition hover:shadow-soft-strong"
              interactive
            >
              <Link href={`/news/${item.id}`} className="block">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <p className="font-body-light tracking-[0.25em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>
                    <p className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium tracking-[0.18em] text-white">
                      {sourceName}
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

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-sub">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
            キーワードや絞り込み条件を少し緩めてみてください。
          </p>
        )}
      </section>
    </main>
  );
}
