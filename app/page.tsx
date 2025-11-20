// app/news/page.tsx
import Link from "next/link";
import { getLatestNews } from "@/lib/news";

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

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
    new Set(items.flatMap((i) => i.tags)),
  ) as string[];

  const filtered = items.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (tagFilter && !item.tags.includes(tagFilter)) return false;

    if (q) {
      const text = (
        item.title +
        " " +
        (item.summary ?? "") +
        " " +
        (item.modelName ?? "") +
        " " +
        (item.maker ?? "")
      ).toLowerCase();
      if (!text.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">ニュース一覧</h1>
        <p className="text-xs text-gray-400">
          国内外メーカーの新型車やパワートレイン、安全装備、マイナーチェンジなどをざっくり把握するためのニュース一覧。
          気になるキーワードやカテゴリで絞り込めます。
        </p>
      </header>

      {/* フィルター */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px]">
        <form className="grid gap-2 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-end">
          <div className="space-y-1">
            <label className="text-slate-300">キーワード</label>
            <input
              type="text"
              name="q"
              defaultValue={searchParams?.q ?? ""}
              placeholder="車名・技術・装備名など"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50 placeholder:text-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-slate-300">カテゴリ</label>
              <select
                name="category"
                defaultValue={categoryFilter}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50"
              >
                <option value="">すべて</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">メーカー</label>
              <select
                name="maker"
                defaultValue={makerFilter}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50"
              >
                <option value="">すべて</option>
                {makers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">タグ</label>
              <select
                name="tag"
                defaultValue={tagFilter}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-50"
              >
                <option value="">すべて</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 flex gap-2 md:mt-0 md:justify-end">
            <button
              type="submit"
              className="flex-1 rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-sky-400 md:flex-none"
            >
              絞り込む
            </button>
            <Link
              href="/news"
              className="flex-1 rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:border-slate-400 md:flex-none"
            >
              クリア
            </Link>
          </div>
        </form>
      </section>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-500">
          条件に合うニュースが見つかりませんでした。
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/news/${encodeURIComponent(item.id)}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] transition hover:border-sky-500/60 hover:bg-slate-900"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">
                    {item.source ?? "ソース不明"}
                    {item.publishedAt && ` ・ ${item.publishedAt}`}
                  </div>
                  <h2 className="text-xs font-semibold text-slate-50">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
                    {item.maker && <span>{item.maker}</span>}
                    {item.modelName && <span>・{item.modelName}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {item.category && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                      {item.category}
                    </span>
                  )}
                  {item.difficulty === "advanced" && (
                    <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      マニアック寄り
                    </span>
                  )}
                </div>
              </header>

              {item.summary && (
                <p className="mt-2 line-clamp-3 text-[11px] text-slate-300">
                  {item.summary}
                </p>
              )}

              {item.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-400">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-700 px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
