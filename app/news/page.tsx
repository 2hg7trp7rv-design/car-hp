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
    new Set(items.map((i: any) => i.category).filter(Boolean))
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i: any) => i.maker).filter(Boolean))
  ) as string[];

  const tags = Array.from(
    new Set(
      items.flatMap((i: any) => (Array.isArray(i.tags) ? i.tags : []))
    )
  ) as string[];

  const filtered = items.filter((item: any) => {
    const matchesQ = q
      ? (item.title ?? "").toLowerCase().includes(q) ||
        (item.excerpt ?? "").toLowerCase().includes(q) ||
        (item.maker ?? "").toLowerCase().includes(q)
      : true;

    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;

    const matchesMaker = makerFilter ? item.maker === makerFilter : true;

    const matchesTag = tagFilter
      ? Array.isArray(item.tags) && item.tags.includes(tagFilter)
      : true;

    return matchesQ && matchesCategory && matchesMaker && matchesTag;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダーセクション */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              News
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
              最新のクルマニュース
            </h1>
          </div>
          <div className="hidden text-right text-xs text-neutral-500 sm:block">
            <p>厳選された国内外の情報を</p>
            <p>シンプルに、美しく。</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* フィルタバー */}
        <section className="rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-sm shadow-neutral-100 backdrop-blur-sm sm:p-6">
          <FilterBar
            q={q}
            categoryFilter={categoryFilter}
            makerFilter={makerFilter}
            tagFilter={tagFilter}
            categories={categories}
            makers={makers}
            tags={tags}
          />
        </section>

        {/* ニュース一覧 */}
        <section className="mt-8">
          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-500">
              条件に合うニュースが見つかりませんでした。
            </p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2">
              {filtered.map((item: any) => (
                <li key={item.slug ?? item.id}>
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

type FilterBarProps = {
  q: string;
  categoryFilter: string;
  makerFilter: string;
  tagFilter: string;
  categories: string[];
  makers: string[];
  tags: string[];
};

function FilterBar({
  q,
  categoryFilter,
  makerFilter,
  tagFilter,
  categories,
  makers,
  tags,
}: FilterBarProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="flex-1 space-y-2">
        <label className="block text-xs font-medium tracking-wide text-neutral-500">
          キーワード検索
        </label>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="車名 技術用語 記事タイトルなど"
          className="w-full rounded-xl border border-neutral-300 bg-white/70 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-0"
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          name="category"
          label="カテゴリ"
          value={categoryFilter}
          options={categories}
          placeholder="すべて"
        />
        <SelectField
          name="maker"
          label="メーカー"
          value={makerFilter}
          options={makers}
          placeholder="すべて"
        />
        <SelectField
          name="tag"
          label="タグ"
          value={tagFilter}
          options={tags}
          placeholder="すべて"
        />
      </div>

      <div className="flex justify-end gap-2 sm:w-32">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-neutral-800"
        >
          絞り込む
        </button>
      </div>
    </form>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
};

function SelectField({
  name,
  label,
  value,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium tracking-wide text-neutral-500">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          defaultValue={value}
          className="w-full appearance-none rounded-xl border border-neutral-300 bg-white/70 px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-0"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-neutral-400">
          ▼
        </span>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: any }) {
  const href = item.slug ? `/news/${item.slug}` : "#";

  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-sm shadow-neutral-100 transition hover:-translate-y-[1px] hover:shadow-md hover:shadow-neutral-200"
    >
      <div className="flex items-center justify-between gap-3 text-[11px] text-neutral-500">
        <span className="uppercase tracking-[0.18em]">
          {item.category ?? "NEWS"}
        </span>
        <span>{item.date}</span>
      </div>

      <h2 className="mt-3 text-base font-medium tracking-tight text-neutral-900 group-hover:text-neutral-700">
        {item.title}
      </h2>

      {item.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-3">
          {item.excerpt}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.isArray(item.tags) &&
          item.tags.slice(0, 4).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-500"
            >
              {tag}
            </span>
          ))}
      </div>

      {item.maker && (
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
          {item.maker}
        </p>
      )}
    </Link>
  );
}
