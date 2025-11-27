// app/news/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "NEWS | CAR BOUTIQUE",
  description:
    "編集部が厳選した自動車ニュースのキュレーション。要約と視点を添えてお届けします。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function filterNews(
  items: NewsItem[],
  {
    q,
    category,
    maker,
    tag,
  }: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  },
): NewsItem[] {
  const keyword = (q ?? "").trim().toLowerCase();
  const categoryFilter = (category ?? "").trim();
  const makerFilter = (maker ?? "").trim();
  const tagFilter = (tag ?? "").trim();

  return items.filter((item) => {
    if (keyword) {
      const haystack = [
        item.title,
        item.titleJa,
        item.excerpt,
        item.sourceName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }

    if (makerFilter && item.maker !== makerFilter) {
      return false;
    }

    if (tagFilter) {
      const tags = item.tags ?? [];
      if (!tags.includes(tagFilter)) {
        return false;
      }
    }

    return true;
  });
}

export default async function NewsPage({ searchParams }: Props) {
  const q = searchParams?.q ?? "";
  const category = searchParams?.category ?? "";
  const maker = searchParams?.maker ?? "";
  const tag = searchParams?.tag ?? "";

  const items = await getLatestNews(80);

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[];

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter(Boolean)),
  ) as string[];

  const tags = Array.from(
    new Set(
      items.flatMap((i) => (i.tags && i.tags.length > 0 ? i.tags : [])),
    ),
  );

  const filtered = filterNews(items, {
    q,
    category,
    maker,
    tag,
  });

  const hasFilter = Boolean(
    (q && q.trim().length > 0) || category || maker || tag,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Reveal>
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
              CURATED NEWS
            </p>
            <h1 className="mt-1 font-serif text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
              今日チェックしておきたいクルマのニュース
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
              OEMのリリース情報から業界動向、EVやスポーツモデルのトピックまで、
              編集部が日本語で追いやすい形に整えたニュースダイジェストです。
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-[10px] text-slate-500 sm:items-end">
            <p className="tracking-[0.18em]">
              TOTAL{" "}
              <span className="font-semibold text-slate-900">
                {items.length}
              </span>{" "}
              ARTICLES
            </p>
            {filtered.length !== items.length && (
              <p className="tracking-[0.18em]">
                FILTERED{" "}
                <span className="font-semibold text-tiffany-600">
                  {filtered.length}
                </span>
              </p>
            )}
          </div>
        </header>
      </Reveal>

      {/* フィルターエリア */}
      <Reveal>
        <GlassCard className="mb-6 border border-slate-200/70 bg-white/80 px-4 py-3 text-[11px] shadow-sm sm:px-5 sm:py-3.5">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label className="flex flex-col gap-1">
                <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                  KEYWORD
                </span>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="キーワード検索（車名・媒体名など）"
                  className="w-full rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] tracking-[0.05em] text-slate-800 placeholder:text-slate-300 focus:border-tiffany-400 focus:outline-none focus:ring-1 focus:ring-tiffany-300"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <FilterSelect
                name="category"
                label="CATEGORY"
                value={category}
                options={categories}
              />
              <FilterSelect
                name="maker"
                label="MAKER"
                value={maker}
                options={makers}
              />
              <FilterSelect
                name="tag"
                label="TAG"
                value={tag}
                options={tags}
              />
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white transition hover:bg-slate-800"
              >
                APPLY
              </button>
              {hasFilter && (
                <Link
                  href="/news"
                  className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                >
                  CLEAR
                </Link>
              )}
            </div>
          </form>
        </GlassCard>
      </Reveal>

      {/* アクティブフィルター表示 */}
      {hasFilter && (
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
              ACTIVE FILTERS
            </span>
            {q && q.trim().length > 0 && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                keyword: <span className="font-semibold">“{q}”</span>
              </span>
            )}
            {category && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                category: <span className="font-semibold">{category}</span>
              </span>
            )}
            {maker && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                maker: <span className="font-semibold">{maker}</span>
              </span>
            )}
            {tag && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                tag: <span className="font-semibold">{tag}</span>
              </span>
            )}
          </div>
        </Reveal>
      )}

      {/* ニュース一覧 */}
      <section aria-label="ニュース一覧" className="space-y-3">
        {filtered.map((item) => (
          <Reveal key={item.id}>
            <NewsListItem item={item} />
          </Reveal>
        ))}

        {filtered.length === 0 && (
          <Reveal>
            <GlassCard className="mt-8 border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center text-xs text-slate-500">
              条件に一致するニュースが見つかりませんでした。
              フィルター条件を変更して再度お試しください。
            </GlassCard>
          </Reveal>
        )}
      </section>
    </main>
  );
}

type FilterSelectProps = {
  name: string;
  label: string;
  value: string;
  options: string[];
};

function FilterSelect({
  name,
  label,
  value,
  options,
}: FilterSelectProps) {
  if (options.length === 0) return null;

  return (
    <label className="flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
      <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="bg-transparent text-[10px] tracking-[0.08em] text-slate-800 focus:outline-none"
      >
        <option value="">ALL</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

type NewsListItemProps = {
  item: NewsItem;
};

function NewsListItem({ item }: NewsListItemProps) {
  const title = item.titleJa ?? item.title;
  const dateLabel =
    item.publishedAtJa ?? formatDate(item.publishedAt ?? item.createdAt);

  return (
    <Link
      href={`/news/${encodeURIComponent(item.id)}`}
      className="block"
    >
      <article className="group flex items-stretch gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:px-5 sm:py-3.5">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            {item.sourceName && (
              <span className="tracking-[0.18em]">
                {item.sourceName}
              </span>
            )}
            {item.maker && (
              <>
                <span className="h-[1px] w-4 bg-slate-200" />
                <span className="tracking-[0.18em]">
                  {item.maker}
                </span>
              </>
            )}
            {dateLabel && (
              <>
                <span className="h-[1px] w-4 bg-slate-200" />
                <span className="tracking-[0.16em]">
                  {dateLabel}
                </span>
              </>
            )}
          </div>
          <h2 className="line-clamp-2 text-[13px] font-semibold leading-relaxed tracking-[0.06em] text-slate-900">
            {title}
          </h2>
          {item.excerpt && (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
              {item.excerpt}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] tracking-[0.14em] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="hidden items-center pl-4 text-[9px] font-semibold tracking-[0.24em] text-slate-300 transition group-hover:text-tiffany-500 sm:flex">
          READ
        </div>
      </article>
    </Link>
  );
}
