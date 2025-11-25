// app/news/page.tsx
export const runtime = "edge";

import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";

export const metadata: Metadata = {
  title: "ニュース一覧 | CAR BOUTIQUE",
  description:
    "国内外のクルマニュースを、カテゴリ・メーカー・タグで絞り込みながら静かに読み進められるニュース一覧ページ。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
    tag?: string;
  };
};

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCategoryLabel(category?: string): string {
  if (!category) return "その他";
  switch (category) {
    case "NEW_MODEL":
      return "新型車・モデルチェンジ";
    case "TECHNOLOGY":
      return "技術・電動化";
    case "MOTORSPORT":
      return "モータースポーツ";
    case "BUSINESS":
      return "ビジネス・業界";
    default:
      return category;
  }
}

function getMakerLabel(maker?: string): string {
  if (!maker) return "その他";
  // 必要に応じて日本語ラベルを追加
  switch (maker) {
    case "TOYOTA":
      return "トヨタ";
    case "LEXUS":
      return "レクサス";
    case "NISSAN":
      return "日産";
    case "HONDA":
      return "ホンダ";
    case "MAZDA":
      return "マツダ";
    case "SUBARU":
      return "スバル";
    case "BMW":
      return "BMW";
    case "MERCEDES":
      return "メルセデス・ベンツ";
    case "AUDI":
      return "アウディ";
    case "PORSCHE":
      return "ポルシェ";
    default:
      return maker;
  }
}

function buildSearchHref(base: string, current: URLSearchParams): string {
  const qs = current.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function NewsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim();
  const categoryFilter = (searchParams?.category ?? "").trim();
  const makerFilter = (searchParams?.maker ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();

  const items = await getLatestNews(120);

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter((c): c is string => !!c)),
  ).sort();

  const makers = Array.from(
    new Set(items.map((i) => i.maker).filter((m): m is string => !!m)),
  ).sort();

  const tags = Array.from(
    new Set(
      items
        .flatMap((i) => i.tags ?? [])
        .filter((t): t is string => !!t),
    ),
  ).sort();

  const filtered = items.filter((item) => {
    if (q) {
      const haystack = [
        item.titleJa,
        item.title,
        item.excerpt,
        item.sourceName,
        item.category,
        item.maker,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q.toLowerCase())) return false;
    }

    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (tagFilter && !(item.tags ?? []).includes(tagFilter)) return false;

    return true;
  });

  const searchParamsObj = new URLSearchParams();
  if (q) searchParamsObj.set("q", q);
  if (categoryFilter) searchParamsObj.set("category", categoryFilter);
  if (makerFilter) searchParamsObj.set("maker", makerFilter);
  if (tagFilter) searchParamsObj.set("tag", tagFilter);

  return (
    <main className="bg-site">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-6 sm:mb-8">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            THE JOURNAL
          </p>
          <h1 className="font-display-serif mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            ニュース一覧
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-sm">
            国内外のクルマニュースを、カテゴリ・メーカー・タグで静かに整理しました。
            気になるトピックだけを、ブティックの棚を眺めるように選んでください。
          </p>
        </header>

        {/* フィルターエリア */}
        <section className="mb-6 space-y-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-md sm:mb-8 sm:p-5">
          {/* キーワード検索 */}
          <form className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex-1 text-[11px] text-text-sub">
              <span className="mb-1 inline-block">キーワード検索</span>
              <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-[0_0_0_1px_rgba(255,255,255,0.6)] focus-within:border-tiffany-500 focus-within:ring-1 focus-within:ring-tiffany-300">
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="車名・メーカー・トピックなど"
                  className="h-6 w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0">
              {(categoryFilter || makerFilter || tagFilter || q) && (
                <Link
                  href="/news"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50"
                >
                  条件をクリア
                </Link>
              )}
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-medium tracking-[0.18em] text-white hover:bg-slate-800"
              >
                SEARCH
              </button>
            </div>
          </form>

          {/* カテゴリ / メーカー / タグ フィルタ */}
          <div className="space-y-3 text-[11px] text-slate-600">
            {/* カテゴリ */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className="w-24 shrink-0 text-[10px] tracking-[0.25em] text-slate-400">
                CATEGORY
              </span>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="すべて"
                  isActive={!categoryFilter}
                  href={buildSearchHref(
                    "/news",
                    (() => {
                      const p = new URLSearchParams(searchParamsObj);
                      p.delete("category");
                      return p;
                    })(),
                  )}
                />
                {categories.map((c) => (
                  <FilterChip
                    key={c}
                    label={getCategoryLabel(c)}
                    isActive={categoryFilter === c}
                    href={buildSearchHref(
                      "/news",
                      (() => {
                        const p = new URLSearchParams(searchParamsObj);
                        if (p.get("category") === c) p.delete("category");
                        else p.set("category", c);
                        return p;
                      })(),
                    )}
                  />
                ))}
              </div>
            </div>

            {/* メーカー */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className="w-24 shrink-0 text-[10px] tracking-[0.25em] text-slate-400">
                MAKER
              </span>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  label="すべて"
                  isActive={!makerFilter}
                  href={buildSearchHref(
                    "/news",
                    (() => {
                      const p = new URLSearchParams(searchParamsObj);
                      p.delete("maker");
                      return p;
                    })(),
                  )}
                />
                {makers.map((m) => (
                  <FilterChip
                    key={m}
                    label={getMakerLabel(m)}
                    isActive={makerFilter === m}
                    href={buildSearchHref(
                      "/news",
                      (() => {
                        const p = new URLSearchParams(searchParamsObj);
                        if (p.get("maker") === m) p.delete("maker");
                        else p.set("maker", m);
                        return p;
                      })(),
                    )}
                  />
                ))}
              </div>
            </div>

            {/* タグ */}
            {tags.length > 0 && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                <span className="w-24 shrink-0 text-[10px] tracking-[0.25em] text-slate-400">
                  TAGS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="すべて"
                    isActive={!tagFilter}
                    href={buildSearchHref(
                      "/news",
                      (() => {
                        const p = new URLSearchParams(searchParamsObj);
                        p.delete("tag");
                        return p;
                      })(),
                    )}
                  />
                  {tags.map((t) => (
                    <FilterChip
                      key={t}
                      label={t}
                      isActive={tagFilter === t}
                      href={buildSearchHref(
                        "/news",
                        (() => {
                          const p = new URLSearchParams(searchParamsObj);
                          if (p.get("tag") === t) p.delete("tag");
                          else p.set("tag", t);
                          return p;
                        })(),
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 件数表示 */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {filtered.length}件
            {q && (
              <>
                {" "}
                / 「
                <span className="font-semibold text-slate-700">{q}</span>
                」で検索
              </>
            )}
          </span>
          <Link
            href="/"
            className="hidden text-[11px] text-text-sub underline-offset-4 hover:text-text-main hover:underline sm:inline"
          >
            トップページに戻る
          </Link>
        </div>

        {/* 一覧 */}
        {filtered.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            条件に合うニュースが見つかりませんでした。キーワードやフィルターを少し緩めてみてください。
          </p>
        ) : (
          <section className="space-y-3">
            {filtered.map((item) => (
              <NewsListItem key={item.id} item={item} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  href: string;
};

function FilterChip({ label, isActive, href }: FilterChipProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px]",
        "transition-colors",
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

type NewsListItemProps = {
  item: NewsItem;
};

function NewsListItem({ item }: NewsListItemProps) {
  const title = item.titleJa ?? item.title;
  const description = item.excerpt ?? "";
  const dateLabel = formatDate(item.publishedAt);
  const categoryLabel = getCategoryLabel(item.category);
  const makerLabel = getMakerLabel(item.maker);
  const sourceName = item.sourceName ?? "CAR BOUTIQUE";

  return (
    <article className="group rounded-3xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.35)] sm:p-5">
      <Link href={`/news/${item.id}`} className="block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
              {categoryLabel && (
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] text-slate-600">
                  {categoryLabel}
                </span>
              )}
              {makerLabel && (
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] text-slate-600">
                  {makerLabel}
                </span>
              )}
              {dateLabel && (
                <span className="text-[10px] text-slate-400">
                  {dateLabel}
                </span>
              )}
            </div>

            <h2 className="font-display-serif text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              {title}
            </h2>

            {description && (
              <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end justify-between gap-2 text-right sm:min-w-[120px]">
            <div className="text-[10px] text-slate-400">{sourceName}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 group-hover:text-slate-900">
              記事をひらく
              <span aria-hidden>↗</span>
            </span>
          </div>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-slate-400">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
