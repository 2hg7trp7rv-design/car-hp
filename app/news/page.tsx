// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-sources";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { JsonLd } from "@/components/seo/JsonLd";

// RSS等の外部取得を含むため、ビルド時の静的生成に依存させない
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "NEWS｜メーカー公式ニュース一覧";
  const description =
    "輸入車とプレミアムブランド中心の新型車発表 仕様変更 リコール キャンペーンなどをメーカー公式サイトの一次情報リンクとして整理したニュース一覧";

  const canonical = `${getSiteUrl()}/news`;
  const hasParams = hasMeaningfulSearchParams(searchParams as any);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    // NOTE: app/layout.tsx で `robots.googleBot` を指定しているため、
    // 一覧ページの noindex は `googleBot` も明示的に noindex にしないと
    // Google が index と解釈して残るケースがある。
    robots: hasParams ? NOINDEX_ROBOTS : undefined,
  };
}

type SearchParams = {
  q?: string;
  category?: string;
  maker?: string;
  tag?: string;
  source?: string;
  period?: string; // "7d" | "30d" | それ以外は全期間
};

type PageProps = {
  searchParams?: SearchParams;
};

// ----------------------------------------
// ユーティリティ
// ----------------------------------------

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildSourceLabel(item: NewsItem): string {
  if (item.sourceName) return item.sourceName;
  if (item.maker) return item.maker;
  return "その他ソース";
}

function buildTagList(item: NewsItem): string[] {
  return Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
}

function isRecent(item: NewsItem, days = 7): boolean {
  const base = item.publishedAt ?? item.createdAt;
  if (!base) return false;
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return false;
  const diffMs = Date.now() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

// string | null | undefined を「中身ありの string」に絞る型ガード
function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function filterNews(items: NewsItem[], filters: SearchParams): NewsItem[] {
  const keyword = normalize(filters.q);
  const categoryFilter = (filters.category ?? "").trim();
  const makerFilter = (filters.maker ?? "").trim();
  const tagFilter = (filters.tag ?? "").trim();
  const sourceFilter = (filters.source ?? "").trim();
  const periodFilter = (filters.period ?? "").trim(); // "7d" | "30d" | ""

  const now = new Date();

  return items.filter((item) => {
    // キーワード検索
    if (keyword) {
      const haystack = [
        item.title ?? "",
        item.titleJa ?? "",
        item.excerpt ?? "",
        item.commentJa ?? "",
        item.maker ?? "",
        item.sourceName ?? "",
        item.category ?? "",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    // カテゴリ
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }

    // メーカー
    if (makerFilter && item.maker !== makerFilter) {
      return false;
    }

    // ソース
    if (sourceFilter) {
      const sourceLabel = buildSourceLabel(item);
      if (sourceLabel !== sourceFilter) {
        return false;
      }
    }

    // タグ
    if (tagFilter) {
      const tags = buildTagList(item);
      if (!tags.includes(tagFilter)) {
        return false;
      }
    }

    // 期間フィルター（7日/30日）
    if (periodFilter === "7d" || periodFilter === "30d") {
      const base = item.publishedAt ?? item.createdAt;
      if (!base) return false;
      const d = new Date(base);
      if (Number.isNaN(d.getTime())) return false;
      const diffMs = now.getTime() - d.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (periodFilter === "7d" && diffDays > 7) return false;
      if (periodFilter === "30d" && diffDays > 30) return false;
    }

    return true;
  });
}

type NewsListItemProps = {
  item: NewsItem;
  index: number;
};

function NewsListItem({ item }: NewsListItemProps) {
  const dateLabel =
    item.publishedAtJa ?? formatDate(item.publishedAt ?? item.createdAt);
  const sourceLabel = buildSourceLabel(item);
  const tags = buildTagList(item);
  const recent = isRecent(item, 7);

  return (
    <Link href={`/news/${encodeURIComponent(item.id)}`} className="group block">
      <GlassCard
        as="article"
        variant="dim"
        padding="sm"
        interactive
        className="relative overflow-hidden text-[11px]"
      >
        {/* タイムライン風インジケーター（左） */}
        <div className="pointer-events-none absolute -left-3 top-3 flex h-8 flex-col items-center justify-between opacity-40">
          <span className="h-5 w-px bg-slate-200" />
          <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
        </div>

        {/* カテゴリ/NEW/ソース */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {item.category && (
            <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] tracking-[0.16em] text-slate-500">
              {item.category.toUpperCase()}
            </span>
          )}

          {recent && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-700">
              NEW
            </span>
          )}

          {sourceLabel && (
            <span className="inline-flex items-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] tracking-[0.18em] text-slate-100">
              {sourceLabel}
            </span>
          )}

          <span className="ml-auto text-[10px] text-slate-400">
            {dateLabel}
          </span>
        </div>

        {/* タイトル */}
        <h3 className="line-clamp-2 text-[12px] font-semibold leading-relaxed text-slate-900">
          {item.titleJa ?? item.title}
        </h3>

        {/* 抄録/コメント */}
        {(item.commentJa || item.excerpt) && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-600">
            {item.commentJa ?? item.excerpt}
          </p>
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-600">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/70 px-2 py-1 text-[10px]"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="rounded-full bg-white/70 px-2 py-1">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    </Link>
  );
}

// 月ごとのラベルを作る（YYYY年MM月）
function buildMonthLabel(item: NewsItem): string {
  const base = item.publishedAt ?? item.createdAt;
  if (!base) return "日付未設定";
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return "日付未設定";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}年${m}月`;
}

// ----------------------------------------
// メインページ
// ----------------------------------------

export default async function NewsPage({ searchParams }: PageProps) {
  let news: NewsItem[] = [];
  try {
    // NOTE: 運用想定で最大200件まで表示。
    // RSS取得側の上限（lib/news.ts）も合わせて調整。
    news = await getLatestNews(200);
  } catch {
    news = [];
  }

  const rawQ = searchParams?.q ?? "";
  const q = normalize(rawQ);
  const categoryFilter = (searchParams?.category ?? "").trim();
  const makerFilter = (searchParams?.maker ?? "").trim();
  const tagFilter = (searchParams?.tag ?? "").trim();
  const sourceFilter = (searchParams?.source ?? "").trim();
  const periodFilter = (searchParams?.period ?? "").trim();

  // NEWSが0件でも、メーカー選択肢だけは常に全社分を表示（期待値: /cars と同等の網羅）
  const makersActive: string[] = Array.from(
    new Set(news.map((n) => n.maker).filter(isNonEmptyString)),
  ).sort();
  const makersFromSources: string[] = Array.from(
    new Set(NEWS_SOURCES.map((s) => s.maker).filter(isNonEmptyString)),
  ).sort();
  const makers: string[] = Array.from(
    new Set([...makersFromSources, ...makersActive]),
  ).sort();

  const categories: string[] = Array.from(
    new Set(news.map((n) => n.category).filter(isNonEmptyString)),
  ).sort();

  const tags: string[] = Array.from(
    new Set(news.flatMap((n) => buildTagList(n))),
  ).sort();

  const sourcesActive: string[] = Array.from(
    new Set(news.map((n) => buildSourceLabel(n)).filter(Boolean)),
  ).sort();
  const sourcesFromConfig: string[] = Array.from(
    new Set(NEWS_SOURCES.map((s) => s.name).filter(isNonEmptyString)),
  ).sort();
  const sources: string[] = Array.from(
    new Set([...sourcesFromConfig, ...sourcesActive]),
  ).sort();

  // 右カラムのクイックフィルターは「実際に記事があるもの」を優先
  const quickSources: string[] = sourcesActive.length > 0 ? sourcesActive : sources;
  const quickMakers: string[] = makersActive.length > 0 ? makersActive : makers;

  const filtered = filterNews(news, {
    q: rawQ,
    category: categoryFilter,
    maker: makerFilter,
    tag: tagFilter,
    source: sourceFilter,
    period: periodFilter,
  });

  const hasFilter =
    Boolean(q) ||
    Boolean(categoryFilter) ||
    Boolean(makerFilter) ||
    Boolean(tagFilter) ||
    Boolean(sourceFilter) ||
    Boolean(periodFilter);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  // 残りのニュースを「月ごとのセクション」にグルーピングしてタイムライン化
  const groupedRestEntries = (() => {
    const grouped: Record<string, NewsItem[]> = {};
    for (const item of rest) {
      const label = buildMonthLabel(item);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
    return Object.entries(grouped).sort((a, b) => {
      // 各グループの先頭ニュースの日付で降順ソート
      const aItem = a[1][0];
      const bItem = b[1][0];
      const aDate = new Date(aItem.publishedAt ?? aItem.createdAt ?? 0);
      const bDate = new Date(bItem.publishedAt ?? bItem.createdAt ?? 0);
      return bDate.getTime() - aDate.getTime();
    });
  })();

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "NEWS",
        item: `${getSiteUrl()}/news`,
      },
    ],
  };

  return (
    <main className="min-h-screen text-text-main">
      <JsonLd id="jsonld-news-breadcrumb" data={breadcrumbData} />
      <div className="container max-w-6xl pb-24 pt-24">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">NEWS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              NEWS FEED
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              NEWS
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-col gap-3 text-xs text-text-sub sm:flex-row sm:items-end sm:justify-between sm:text-sm">
              <p className="max-w-2xl leading-relaxed">
                新型車・モデルチェンジ・新装備の公式ニュース
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="rounded-full bg-white/80 px-3 py-1 shadow-soft">
                  TOTAL{" "}
                  <span className="font-semibold text-slate-900">
                    {news.length}
                  </span>{" "}
                  ARTICLES
                </span>
                {filtered.length !== news.length && (
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-soft">
                    FILTERED{" "}
                    <span className="font-semibold text-tiffany-600">
                      {filtered.length}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {/* 期間プリセットチップ（7日/30日/全期間） */}
          <Reveal delay={220}>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <Link
                href="/news?period=7d"
                rel="nofollow"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 tracking-[0.16em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                直近7日
              </Link>
              <Link
                href="/news?period=30d"
                rel="nofollow"
                className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50/90 px-3 py-1 tracking-[0.16em] text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                直近30日
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 tracking-[0.16em] text-slate-600 transition hover:border-tiffany-300 hover:bg-white"
              >
                全期間
              </Link>
            </div>
          </Reveal>
        </header>

        {/* フィルターエリア */}
        <Reveal delay={260}>
          <GlassCard
            as="section"
            padding="md"
            variant="standard"
            magnetic={false}
            className="mb-6 text-slate-900"
          >
            <form className="space-y-4 text-xs sm:text-[11px]">
              <div className="grid gap-3 md:grid-cols-4">
                {/* キーワード */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="車名やトピック、ソース名で検索"
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    defaultValue={categoryFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* メーカー */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {makers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {/* ソース */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    SOURCE
                  </label>
                  <select
                    name="source"
                    defaultValue={sourceFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {sources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    TAG
                  </label>
                  <select
                    name="tag"
                    defaultValue={tagFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">すべて</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 期間 */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    PERIOD
                  </label>
                  <select
                    name="period"
                    defaultValue={periodFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  >
                    <option value="">全期間</option>
                    <option value="7d">直近7日</option>
                    <option value="30d">直近30日</option>
                  </select>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-2 flex items-center justify-end gap-3">
                {hasFilter && (
                  <Link
                    href="/news"
                    className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700"
                  >
                    CLEAR
                  </Link>
                )}
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                  magnetic
                >
                  絞り込み
                </Button>
              </div>
            </form>
          </GlassCard>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {hasFilter && (
          <Reveal delay={280}>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                ACTIVE FILTERS
              </span>
              {q && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  keyword: <span className="font-semibold">“{rawQ}”</span>
                </span>
              )}
              {categoryFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  category:{" "}
                  <span className="font-semibold">{categoryFilter}</span>
                </span>
              )}
              {makerFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  maker:{" "}
                  <span className="font-semibold">{makerFilter}</span>
                </span>
              )}
              {sourceFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  source:{" "}
                  <span className="font-semibold">{sourceFilter}</span>
                </span>
              )}
              {tagFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  tag: <span className="font-semibold">{tagFilter}</span>
                </span>
              )}
              {periodFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  period:{" "}
                  <span className="font-semibold">
                    {periodFilter === "7d"
                      ? "直近7日"
                      : periodFilter === "30d"
                      ? "直近30日"
                      : periodFilter}
                  </span>
                </span>
              )}
            </div>
          </Reveal>
        )}

        {/* 一覧レイアウト */}
        <section
          className="grid gap-8 lg:grid-cols-[minmax(0,3.3fr)_minmax(0,1.7fr)]"
          aria-label="ニュース一覧"
        >
          {/* 左:ハイライト＋リスト */}
          <div className="space-y-6">
            {/* ハイライト */}
            <Reveal>
              {featured ? (
                <GlassCard
                  as="section"
                  padding="lg"
                  interactive
                  variant="crystal"
                  className="relative overflow-hidden text-slate-900"
                >
                  {/* 背景光 */}
                  <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.28),_transparent_70%)] blur-3xl" />
                  <div className="pointer-events-none absolute -right-32 bottom-[-40%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.2),_transparent_70%)] blur-3xl" />

                  <div className="relative z-10 space-y-3 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-50">
                        FEATURED
                      </span>
                      {featured.category && (
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] tracking-[0.16em] text-slate-600">
                          {featured.category.toUpperCase()}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-500">
                        {featured.publishedAtJa ??
                          formatDate(
                            featured.publishedAt ?? featured.createdAt,
                          )}
                      </span>
                    </div>

                    <Link
                      href={`/news/${encodeURIComponent(featured.id)}`}
                      className="block"
                    >
                      <h2 className="serif-heading text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
                        {featured.titleJa ?? featured.title}
                      </h2>
                    </Link>

                    {(featured.commentJa || featured.excerpt) && (
                      <p className="max-w-2xl text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                        {featured.commentJa ?? featured.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
                      {buildSourceLabel(featured) && (
                        <span className="rounded-full bg-white/80 px-2 py-1 tracking-[0.16em]">
                          {buildSourceLabel(featured)}
                        </span>
                      )}
                      {featured.maker && (
                        <span className="rounded-full bg-white/80 px-2 py-1 tracking-[0.16em]">
                          {featured.maker}
                        </span>
                      )}
                      {buildTagList(featured).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/80 px-2 py-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-xs text-slate-500">
                  現在表示可能なニュースはなし
                </p>
              )}
            </Reveal>

            {/* 残りのリスト(月ごとタイムライン) */}
            {rest.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-xs text-slate-500">
                条件に合うニュースはなし 絞り込み条件を少し緩めて再検索する想定
              </p>
            ) : (
              <div className="space-y-6">
                {groupedRestEntries.map(([label, group]) => (
                  <div key={label} className="space-y-2">
                    {/* 月ラベル:タイムラインの節 */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="h-px flex-1 bg-slate-100" />
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-soft">
                        <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                        <span className="tracking-[0.18em]">{label}</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.map((item, index) => (
                        <NewsListItem
                          key={item.id}
                          item={item}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右:ソース/メーカー クイックフィルター(PCのみ) */}
          <aside className="hidden lg:block">
            <Reveal delay={120}>
              <div className="sticky top-24 space-y-5">
                <GlassCard
                  as="section"
                  padding="md"
                  variant="standard"
                  magnetic={false}
                  className="text-slate-900"
                >
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    QUICK SOURCE
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
                    {quickSources.slice(0, 10).map((s) => {
                      const count = filtered.filter(
                        (item) => buildSourceLabel(item) === s,
                      ).length;
                      return (
                        <Link
                          key={s}
                          href={`/news?source=${encodeURIComponent(s)}`}
                          rel="nofollow"
                          className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 tracking-[0.14em] transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                        >
                          <span>{s}</span>
                          {count > 0 && (
                            <span className="text-[9px] text-slate-400">
                              ({count})
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </GlassCard>

                <GlassCard
                  as="section"
                  padding="md"
                  variant="standard"
                  magnetic={false}
                  className="text-slate-900"
                >
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    MAKER FOCUS
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
                    {quickMakers.slice(0, 10).map((m) => {
                      const count = filtered.filter(
                        (item) => item.maker === m,
                      ).length;
                      return (
                        <Link
                          key={m}
                          href={`/news?maker=${encodeURIComponent(m)}`}
                          rel="nofollow"
                          className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 tracking-[0.14em] transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                        >
                          <span>{m}</span>
                          {count > 0 && (
                            <span className="text-[9px] text-slate-400">
                              ({count})
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </aside>
        </section>
      </div>
    </main>
  );
}
