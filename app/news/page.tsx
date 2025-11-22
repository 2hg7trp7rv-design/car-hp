// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

export default async function NewsArchivePage({ searchParams }: Props) {
  const qRaw = searchParams?.q ?? "";
  const q = qRaw.trim().toLowerCase();

  const categoryFilter = searchParams?.category ?? "";
  const makerFilter = searchParams?.maker ?? "";
  const tagFilter = searchParams?.tag ?? "";

  const items = await getLatestNews();

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter(Boolean))
  ) as string[];

  const tags = Array.from(
    new Set(
      items.flatMap((i) => (Array.isArray(i.tags) ? i.tags : [])).filter(Boolean)
    )
  ) as string[];

  const filtered = items.filter((item) => {
    const text = [
      item.title,
      item.titleJa,
      item.excerpt,
      item.category,
      item.maker,
      Array.isArray(item.tags) ? item.tags.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (q && !text.includes(q)) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;

    return true;
  });

  return (
    <div className="bg-gradient-to-r from-[#e4f4f7] via-white to-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 md:px-6">
        {/* ヘッダーカード */}
        <section className="rounded-3xl border border-sky-50 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.12)] backdrop-blur">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-500">
            CAR BOUTIQUE JOURNAL
          </p>
          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            ニュース一覧
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
            静かなトーンでまとめたクルマのニュースアーカイブ。メーカーやカテゴリーで絞り込みながら、気になるトピックをゆっくりと眺めることができます。
          </p>
        </section>

        {/* 絞り込み＋リスト */}
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-[0_20px_55px_rgba(15,23,42,0.10)] backdrop-blur">
            <form className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold tracking-wide text-slate-500">
                  KEYWORD
                </label>
                <input
                  name="q"
                  defaultValue={qRaw}
                  placeholder="モデル名やキーワードで検索"
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/70 px-4 py-2 text-[13px] text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-slate-500">
                  CATEGORY
                </label>
                <select
                  name="category"
                  defaultValue={categoryFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/70 px-3 py-2 text-[13px] text-slate-800 outline-none ring-0 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
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
                <label className="block text-[11px] font-semibold tracking-wide text-slate-500">
                  MAKER
                </label>
                <select
                  name="maker"
                  defaultValue={makerFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/70 px-3 py-2 text-[13px] text-slate-800 outline-none ring-0 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">すべて</option>
                  {makers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wide text-slate-500">
                  TAG
                </label>
                <select
                  name="tag"
                  defaultValue={tagFilter}
                  className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50/70 px-3 py-2 text-[13px] text-slate-800 outline-none ring-0 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">すべて</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-sky-600 px-6 py-2 text-[12px] font-semibold text-white shadow-sm shadow-sky-200/80 transition hover:bg-sky-700"
                >
                  絞り込む
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] text-slate-500">
              全{filtered.length}件の記事
            </p>

            <div className="space-y-3">
              {filtered.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const displayTitle = item.titleJa ?? item.title;
  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP")
    : "";

  const isExternal = item.type === "external";

  const href =
    item.type === "external" && item.sourceUrl
      ? item.sourceUrl
      : `/news/${encodeURIComponent(item.id)}`;

  const linkProps =
    item.type === "external" && item.sourceUrl
      ? { target: "_blank", rel: "noreferrer" }
      : {};

  const typeBadgeClass = isExternal
    ? "bg-[#d7f5f5] text-[#007c7c]"
    : "bg-slate-100 text-slate-500";

  return (
    <a
      href={href}
      {...linkProps}
      className="block rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.16)]"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
        {item.sourceName && (
          <span className="rounded-full bg-sky-900/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-50">
            {item.sourceName}
          </span>
        )}
        <span
          className={
            "rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide " +
            typeBadgeClass
          }
        >
          {isExternal ? "External" : "Original"}
        </span>
        {item.category && (
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
            {item.category}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold leading-relaxed text-slate-900">
        {displayTitle}
      </p>

      {item.excerpt && (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {item.excerpt}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">
          {item.maker ?? item.sourceName ?? "car boutique"}
        </span>
        {dateLabel && <span>{dateLabel}</span>}
      </div>
    </a>
  );
}
