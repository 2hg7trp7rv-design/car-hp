// app/news/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

type SearchParams = {
  q?: string;
  category?: string;
  maker?: string;
  tag?: string;
};

type Props = {
  searchParams?: SearchParams;
};

export default async function NewsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const categoryFilter = searchParams?.category ?? "";
  const makerFilter = searchParams?.maker ?? "";
  const tagFilter = searchParams?.tag ?? "";

  const items = (await getLatestNews(80)) as any[];

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter(Boolean))
  ) as string[];

  const tags = Array.from(
    new Set(
      items
        .flatMap((i) => (Array.isArray(i.tags) ? i.tags : []))
        .filter(Boolean)
    )
  ) as string[];

  const filtered = items.filter((item: any) => {
    const text =
      `${item.title ?? ""} ${item.excerpt ?? ""} ${item.maker ?? ""} ${
        item.category ?? ""
      }`
        .toString()
        .toLowerCase();

    const matchQ = q ? text.includes(q) : true;
    const matchCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    const matchMaker = makerFilter ? item.maker === makerFilter : true;
    const matchTag = tagFilter
      ? Array.isArray(item.tags) && item.tags.includes(tagFilter)
      : true;

    return matchQ && matchCategory && matchMaker && matchTag;
  });

  return (
    <div className="relative min-h-screen bg-white">
      {/* 背景 Tiffany グラデーション */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(129,216,208,0.65) 0%, rgba(129,216,208,0.65) 70%, #ffffff 100%)",
        }}
      />

      {/* コンテンツ本体 */}
      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <header className="border-b border-neutral-200 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-700">
              CAR BOUTIQUE JOURNAL
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              ニュース一覧
            </h1>
            <p className="mt-2 text-xs text-neutral-600">
              静かなトーンでまとめたクルマのニュースアーカイブ。メーカーやカテゴリーで絞り込みながら、気になるトピックをゆっくりと眺めることができます。
            </p>
          </header>

          {/* フィルターエリア */}
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm shadow-neutral-100 backdrop-blur">
            <form className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
              <div className="md:col-span-2">
                <label className="text-[11px] font-medium tracking-[0.18em] text-neutral-600">
                  KEYWORD
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="モデル名やキーワードで検索"
                  className="mt-1 w-full rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.18em] text-neutral-600">
                  CATEGORY
                </label>
                <select
                  name="category"
                  defaultValue={categoryFilter}
                  className="mt-1 w-full rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
                >
                  <option value="">すべて</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.18em] text-neutral-600">
                  MAKER
                </label>
                <select
                  name="maker"
                  defaultValue={makerFilter}
                  className="mt-1 w-full rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
                >
                  <option value="">すべて</option>
                  {makers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              {tags.length > 0 && (
                <div className="md:col-span-4">
                  <label className="text-[11px] font-medium tracking-[0.18em] text-neutral-600">
                    TAGS
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      name="tag"
                      value=""
                      className={
                        "rounded-full border px-3 py-1 text-[11px] " +
                        (!tagFilter
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-neutral-200 bg-white text-neutral-700")
                      }
                    >
                      すべて
                    </button>
                    {tags.map((t) => {
                      const active = tagFilter === t;
                      return (
                        <button
                          key={t}
                          type="submit"
                          name="tag"
                          value={t}
                          className={
                            "rounded-full border px-3 py-1 text-[11px] transition " +
                            (active
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300 hover:text-sky-700")
                          }
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="md:col-span-4 flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-sky-500 bg-sky-500 px-5 py-2 text-[11px] font-medium tracking-[0.18em] text-white transition hover:bg-sky-600"
                >
                  絞り込む
                </button>
              </div>
            </form>
          </section>

          {/* 一覧 */}
          <section className="mt-8">
            <p className="text-[11px] text-neutral-500">
              全{filtered.length}件の記事
            </p>

            <div className="mt-3 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white/90 shadow-sm shadow-neutral-100">
              {filtered.map((item: any, index: number) => {
                const id = String(index);
                const date =
                  item.date ?? item.publishedAt ?? item.createdAt ?? "";
                const tagsForItem = Array.isArray(item.tags) ? item.tags : [];

                return (
                  <Link
                    key={id}
                    href={`/news/${id}`}
                    className="group block px-4 py-4 sm:px-5 sm:py-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-sky-600">
                            {item.category ?? "NEWS"}
                          </span>
                          {item.maker && (
                            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-[2px] text-[10px] text-neutral-600">
                              {item.maker}
                            </span>
                          )}
                        </div>
                        <h2 className="mt-1 text-sm font-medium tracking-tight text-neutral-900 group-hover:text-neutral-700">
                          {item.title}
                        </h2>
                        {item.excerpt && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                            {item.excerpt}
                          </p>
                        )}
                        {tagsForItem.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tagsForItem.map((t: string) => (
                              <span
                                key={t}
                                className="rounded-full bg-neutral-100 px-2 py-[2px] text-[10px] text-neutral-500"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-right text-[10px] text-neutral-500 sm:mt-0 sm:w-32">
                        {date && <p>{date}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
