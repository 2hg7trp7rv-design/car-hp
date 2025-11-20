// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

type SearchParams = {
  q?: string;
  category?: string;
  tag?: string;
  maker?: string;
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const items = await getLatestNews(100);

  const q = (searchParams?.q ?? "").trim();
  const category = (searchParams?.category ?? "").trim();
  const tag = (searchParams?.tag ?? "").trim();
  const maker = (searchParams?.maker ?? "").trim();

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[];

  const tags = Array.from(
    new Set(items.flatMap((i) => i.tags)),
  ).filter(Boolean);

  const featured = items.filter((i) => i.isFeatured).slice(0, 3);
  const featuredIds = new Set(featured.map((i) => i.id));

  let filtered: NewsItem[] = items.filter((i) => !featuredIds.has(i.id));

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (tag) {
    filtered = filtered.filter((item) => item.tags.includes(tag));
  }

  if (maker) {
    const makerLower = maker.toLowerCase();
    filtered = filtered.filter((item) =>
      (item.maker ?? "").toLowerCase().includes(makerLower),
    );
  }

  if (q) {
    const qLower = q.toLowerCase();
    filtered = filtered.filter((item) => {
      const haystack =
        (
          item.title +
          " " +
          (item.summary ?? "") +
          " " +
          (item.maker ?? "") +
          " " +
          (item.modelName ?? "")
        ).toLowerCase();
      return haystack.includes(qLower);
    });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-xl font-semibold text-white">ニュース一覧</h1>
        <p className="text-xs text-gray-400">
          国内外メーカーの新型車やパワートレイン、装備変更などをざっくり把握するためのニュース一覧。
        </p>

        <form className="space-y-2 rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-[11px]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <label className="space-y-1">
              <div className="text-gray-400">キーワード</div>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="車名や装備名などで検索"
                className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-white outline-none"
              />
            </label>

            <label className="space-y-1">
              <div className="text-gray-400">カテゴリ</div>
              <select
                name="category"
                defaultValue={category}
                className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-white outline-none"
              >
                <option value="">すべて</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-gray-400">タグ</div>
              <select
                name="tag"
                defaultValue={tag}
                className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-white outline-none"
              >
                <option value="">すべて</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-gray-400">メーカー</div>
              <input
                type="text"
                name="maker"
                defaultValue={maker}
                placeholder="TOYOTAなど"
                className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 text-xs text-white outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-purple-700 px-3 py-1 text-[11px] font-semibold text-white"
            >
              絞り込み
            </button>
          </div>
        </form>
      </header>

      {featured.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white">注目ニュース</h2>
          <div className="space-y-2">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block rounded-lg border border-yellow-600/60 bg-yellow-900/20 p-3 text-xs hover:border-yellow-500 hover:bg-yellow-900/30"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      {item.title ?? "No title"}
                    </h3>
                    <div className="mt-0.5 text-[11px] text-gray-300">
                      {item.source ?? "ソース不明"}
                      {item.publishedAt && `・${item.publishedAt}`}
                    </div>
                  </div>
                  {item.difficulty === "advanced" && (
                    <span className="rounded bg-purple-700 px-2 py-0.5 text-[10px] text-white">
                      マニアック寄り
                    </span>
                  )}
                </header>

                {item.summary && (
                  <p className="mt-1 text-[11px] text-gray-100 line-clamp-3 whitespace-pre-line">
                    {item.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-500">
          条件に合うニュースがありません。
        </p>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">ニュース一覧</h2>
          <div className="space-y-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/news/${item.id}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {item.title ?? "No title"}
                    </Link>
                    <div className="mt-0.5 text-[11px] text-gray-400">
                      {item.source ?? "ソース不明"}
                      {item.publishedAt && `・${item.publishedAt}`}
                      {item.difficulty === "advanced" && (
                        <span className="ml-2 rounded bg-purple-600 px-2 py-0.5 text-[10px] text-white">
                          マニアック寄り
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                {item.summary && (
                  <p className="mt-1 text-[11px] text-gray-200 whitespace-pre-line">
                    {item.summary}
                  </p>
                )}

                {item.referenceUrl && (
                  <a
                    href={item.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-[11px] text-blue-400 underline"
                  >
                    メーカー公式サイト・プレスリリースを見る
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
