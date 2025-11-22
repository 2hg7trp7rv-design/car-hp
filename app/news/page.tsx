// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
    page?: string;
  };
};

function getTypeBadge(item: NewsItem) {
  const isOriginal = item.type === "original";

  if (isOriginal) {
    return {
      label: "ORIGINAL",
      className:
        "inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600",
    };
  }

  return {
    label: item.sourceName ?? "EXTERNAL",
    className:
      "inline-flex items-center rounded-full border border-[#81d8d0] bg-[#81d8d0] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-900",
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const categoryFilter = searchParams?.category ?? "";
  const makerFilter = searchParams?.maker ?? "";
  const tagFilter = searchParams?.tag ?? "";

  const pageParam = searchParams?.page ?? "1";
  const currentPageRaw = Number.parseInt(pageParam, 10);
  const currentPage = Number.isFinite(currentPageRaw) && currentPageRaw > 0 ? currentPageRaw : 1;
  const perPage = 10;

  const all = await getLatestNews();

  const categories = Array.from(
    new Set(all.map((i) => i.category).filter(Boolean)),
  ) as string[];

  const makers = Array.from(
    new Set(all.map((i) => i.maker).filter(Boolean)),
  ) as string[];

  const tags = Array.from(
    new Set(
      all.flatMap((i) => (Array.isArray(i.tags) ? i.tags : [])).filter(Boolean),
    ),
  ) as string[];

  const filtered = all.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (tagFilter && !item.tags?.includes(tagFilter)) return false;

    if (q) {
      const text = [
        item.title,
        item.excerpt,
        item.category,
        item.maker,
        (item.tags ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!text.includes(q)) return false;
    }

    return true;
  });

  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(currentPage, maxPage);
  const start = (safePage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const baseQuery: Record<string, string> = {};
  if (q) baseQuery.q = searchParams?.q ?? "";
  if (categoryFilter) baseQuery.category = categoryFilter;
  if (makerFilter) baseQuery.maker = makerFilter;
  if (tagFilter) baseQuery.tag = tagFilter;

  return (
    <div className="space-y-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <p className="text-[11px] tracking-[0.2em] text-slate-500">
          NEWS ARCHIVE
        </p>
        <h1 className="text-xl font-semibold tracking-wide text-slate-900">
          ニュース一覧
        </h1>
        <p className="text-[12px] leading-relaxed text-slate-500">
          Car Watchや海外メディアのニュースと、当サイト独自の記事を静かなトーンでまとめています。
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 text-[11px] text-slate-500 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-2">
            <p className="font-semibold text-slate-700">絞り込み</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-slate-300 px-2 py-0.5">
                キーワード
                {q ? `：「${searchParams?.q}」` : "：指定なし"}
              </span>
              <span className="rounded-full border border-slate-300 px-2 py-0.5">
                カテゴリ
                {categoryFilter ? `：${categoryFilter}` : "：指定なし"}
              </span>
              <span className="rounded-full border border-slate-300 px-2 py-0.5">
                メーカー
                {makerFilter ? `：${makerFilter}` : "：指定なし"}
              </span>
              <span className="rounded-full border border-slate-300 px-2 py-0.5">
                タグ
                {tagFilter ? `：${tagFilter}` : "：指定なし"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-slate-700">カテゴリから探す</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={{
                    pathname: "/news",
                    query: { ...baseQuery, category: c, page: "1" },
                  }}
                  className={`rounded-full border px-2 py-0.5 ${
                    categoryFilter === c
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600 hover:border-slate-500"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>

            {makers.length > 0 && (
              <>
                <p className="pt-2 font-semibold text-slate-700">メーカーから探す</p>
                <div className="flex flex-wrap gap-1.5">
                  {makers.map((m) => (
                    <Link
                      key={m}
                      href={{
                        pathname: "/news",
                        query: { ...baseQuery, maker: m, page: "1" },
                      }}
                      className={`rounded-full border px-2 py-0.5 ${
                        makerFilter === m
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {m}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {tags.length > 0 && (
              <>
                <p className="pt-2 font-semibold text-slate-700">タグから探す</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Link
                      key={t}
                      href={{
                        pathname: "/news",
                        query: { ...baseQuery, tag: t, page: "1" },
                      }}
                      className={`rounded-full border px-2 py-0.5 ${
                        tagFilter === t
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between text-[11px] text-slate-500">
          <p>
            全{total}件中
            {total === 0
              ? " 0件を表示"
              : ` ${start + 1}〜${Math.min(
                  start + pageItems.length,
                  total,
                )}件を表示`}
          </p>
          <p>
            ページ{safePage}/{maxPage}
          </p>
        </div>

        <div className="space-y-2">
          {pageItems.length === 0 ? (
            <p className="text-xs text-slate-500">
              条件に合うニュースがまだありません。
            </p>
          ) : (
            pageItems.map((item) => {
              const badge = getTypeBadge(item);

              return (
                <Link
                  key={item.id}
                  href={`/news/${encodeURIComponent(item.id)}`}
                  className="block rounded-2xl border border-slate-200 bg-white/80 p-3 text-[12px] shadow-sm transition hover:border-[#81d8d0] hover:shadow-md sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={badge.className}>{badge.label}</span>
                        {item.category && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        {item.title}
                      </p>
                      {item.excerpt && (
                        <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-600">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="hidden text-right text-[10px] text-slate-500 sm:block">
                      <p>{item.sourceName ?? "CAR BOUTIQUE"}</p>
                      {item.publishedAt && (
                        <p>
                          {new Date(item.publishedAt).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {maxPage > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 text-[11px]">
            {safePage > 1 && (
              <Link
                href={{
                  pathname: "/news",
                  query: { ...baseQuery, page: String(safePage - 1) },
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 hover:border-slate-500"
              >
                前のページ
              </Link>
            )}
            {safePage < maxPage && (
              <Link
                href={{
                  pathname: "/news",
                  query: { ...baseQuery, page: String(safePage + 1) },
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 hover:border-slate-500"
              >
                次のページ
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
