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
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

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
  q?: string | string[];
  category?: string | string[];
  maker?: string | string[];
  tag?: string | string[];
  source?: string | string[];
  period?: string | string[]; // "7d" | "30d" | それ以外は全期間
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

// Next.js の searchParams は string | string[] になり得るため、安全に単一値へ寄せる
function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

// クエリストリング生成ヘルパー（フィルタ解除/プリセット用）
function buildQueryString(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value && value.trim() !== "") {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
  const keyword = normalize(toSingle(filters.q));
  const categoryFilter = toSingle(filters.category).trim();
  const makerFilter = toSingle(filters.maker).trim();
  const tagFilter = toSingle(filters.tag).trim();
  const sourceFilter = toSingle(filters.source).trim();
  const periodFilter = toSingle(filters.period).trim(); // "7d" | "30d" | ""

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
          <span className="h-5 w-px bg-[#222222]/08" />
          <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
        </div>

        {/* カテゴリ/NEW/ソース */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {item.category && (
            <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[10px] tracking-[0.16em] text-[#222222]/55">
              {item.category.toUpperCase()}
            </span>
          )}

          {recent && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-700">
              NEW
            </span>
          )}

          {sourceLabel && (
            <span className="inline-flex items-center rounded-full bg-black/85 px-2 py-0.5 text-[9px] tracking-[0.18em] text-white/90">
              {sourceLabel}
            </span>
          )}

          <span className="ml-auto text-[10px] text-[#222222]/45">
            {dateLabel}
          </span>
        </div>

        {/* タイトル */}
        <h3 className="line-clamp-2 text-[12px] font-semibold leading-relaxed text-[#222222]">
          {item.titleJa ?? item.title}
        </h3>

        {/* 抄録/コメント */}
        {(item.commentJa || item.excerpt) && (
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#222222]/70">
            {item.commentJa ?? item.excerpt}
          </p>
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-[#222222]/70">
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

  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const categoryFilter = toSingle(searchParams?.category).trim();
  const makerFilter = toSingle(searchParams?.maker).trim();
  const tagFilter = toSingle(searchParams?.tag).trim();
  const sourceFilter = toSingle(searchParams?.source).trim();
  const periodFilter = toSingle(searchParams?.period).trim();

  const baseQueryParams: Record<string, string | undefined> = {
    q: rawQ,
    category: categoryFilter,
    maker: makerFilter,
    tag: tagFilter,
    source: sourceFilter,
    period: periodFilter,
  };

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
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <JsonLd id="jsonld-news-breadcrumb" data={breadcrumbData} />
      <div className="container max-w-6xl pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        {/* パンくず */}
        <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "NEWS" }]} className="mb-6" />

        {/* ヘッダー */}
        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="cb-eyebrow text-[#0ABAB5] opacity-100">
              NEWS FEED
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="serif-heading text-3xl font-medium tracking-tight text-[#222222] sm:text-4xl">
              NEWS
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-col gap-3 text-xs text-text-sub sm:flex-row sm:items-end sm:justify-between sm:text-sm">
              <p className="max-w-2xl leading-relaxed">
                新型車・モデルチェンジ・新装備の公式ニュース
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] text-[#222222]/55">
                <span className="rounded-full bg-white/80 px-3 py-1 shadow-soft">
                  TOTAL{" "}
                  <span className="font-semibold text-[#222222]">
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
                href={`/news${buildQueryString(baseQueryParams, { period: "7d" })}`}
                rel="nofollow"
                className={`cb-tap inline-flex items-center gap-1 rounded-full border px-3 py-1 tracking-[0.16em] transition ${
                  periodFilter === "7d"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-emerald-100 bg-emerald-50/90 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                直近7日
              </Link>
              <Link
                href={`/news${buildQueryString(baseQueryParams, { period: "30d" })}`}
                rel="nofollow"
                className={`cb-tap inline-flex items-center gap-1 rounded-full border px-3 py-1 tracking-[0.16em] transition ${
                  periodFilter === "30d"
                    ? "border-sky-200 bg-sky-50 text-[#222222]/80"
                    : "border-sky-100 bg-sky-50/90 text-[#222222]/80 hover:border-sky-300 hover:bg-sky-50"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                直近30日
              </Link>
              <Link
                href={`/news${buildQueryString(baseQueryParams, { period: "" })}`}
                className={`cb-tap inline-flex items-center gap-1 rounded-full border px-3 py-1 tracking-[0.16em] transition ${
                  periodFilter
                    ? "border-[#222222]/10 bg-white/80 text-[#222222]/70 hover:border-tiffany-300 hover:bg-white"
                    : "border-[#222222]/12 bg-white text-[#222222]/80 shadow-soft"
                }`}
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
            className="mb-6 text-[#222222]"
          >
            <form className="space-y-4 text-xs sm:text-[11px]">
              <div className="grid gap-3 md:grid-cols-4">
                {/* キーワード */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="車名やトピック、ソース名で検索"
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    CATEGORY
                  </label>
                  <select
                    name="category"
                    defaultValue={categoryFilter}
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerFilter}
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    SOURCE
                  </label>
                  <select
                    name="source"
                    defaultValue={sourceFilter}
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    TAG
                  </label>
                  <select
                    name="tag"
                    defaultValue={tagFilter}
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    PERIOD
                  </label>
                  <select
                    name="period"
                    defaultValue={periodFilter}
                    className="cb-tap mt-1 w-full rounded-full border border-[#222222]/10 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                    className="cb-tap inline-flex items-center px-3 text-[10px] tracking-[0.16em] text-[#222222]/45 hover:text-[#222222]/80"
                  >
                    CLEAR
                  </Link>
                )}
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="cb-tap rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                  magnetic
                >
                  絞り込み
                </Button>
              </div>
            </form>
          </GlassCard>
        </Reveal>

        {/* アクティブフィルター表示（現在地 + 解除） */}
        {hasFilter && (
          <Reveal delay={280}>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-[#222222]/03 px-2 py-0.5 text-[#222222]/45">ACTIVE FILTERS</span>

              {q && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { q: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label={`Remove keyword filter: ${rawQ}`}
                >
                  <span>
                    keyword:<span className="ml-1 font-semibold">“{rawQ}”</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              {categoryFilter && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { category: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label={`Remove category filter: ${categoryFilter}`}
                >
                  <span>
                    category:<span className="ml-1 font-semibold">{categoryFilter}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              {makerFilter && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { maker: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label={`Remove maker filter: ${makerFilter}`}
                >
                  <span>
                    maker:<span className="ml-1 font-semibold">{makerFilter}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              {sourceFilter && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { source: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label={`Remove source filter: ${sourceFilter}`}
                >
                  <span>
                    source:<span className="ml-1 font-semibold">{sourceFilter}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              {tagFilter && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { tag: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label={`Remove tag filter: ${tagFilter}`}
                >
                  <span>
                    tag:<span className="ml-1 font-semibold">{tagFilter}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              {periodFilter && (
                <Link
                  href={`/news${buildQueryString(baseQueryParams, { period: "" })}`}
                  rel="nofollow"
                  className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/70 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
                  aria-label="Remove period filter"
                >
                  <span>
                    period:<span className="ml-1 font-semibold">{periodFilter === "7d" ? "直近7日" : periodFilter === "30d" ? "直近30日" : periodFilter}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#222222]/35">×</span>
                </Link>
              )}

              <Link
                href="/news"
                rel="nofollow"
                className="cb-tap inline-flex items-center gap-2 rounded-full border border-[#222222]/12 bg-white px-3 text-[#222222]/55 transition hover:border-[#0ABAB5]/35 hover:text-[#222222]"
              >
                RESET ALL
                <span aria-hidden="true" className="text-[#222222]/35">×</span>
              </Link>
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
                <Link href={`/news/${encodeURIComponent(featured.id)}`} className="block group">
                  <GlassCard
                  as="section"
                  padding="lg"
                  interactive
                  variant="crystal"
                  className="relative overflow-hidden text-[#222222]"
                >
                  {/* 背景光 */}
                  <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.28),_transparent_70%)] blur-3xl" />
                  <div className="pointer-events-none absolute -right-32 bottom-[-40%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.2),_transparent_70%)] blur-3xl" />

                  <div className="relative z-10 space-y-3 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-white/85">
                        FEATURED
                      </span>
                      {featured.category && (
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] tracking-[0.16em] text-[#222222]/70">
                          {featured.category.toUpperCase()}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-[#222222]/55">
                        {featured.publishedAtJa ??
                          formatDate(
                            featured.publishedAt ?? featured.createdAt,
                          )}
                      </span>
                    </div>

                    <h2 className="serif-heading text-lg font-medium leading-relaxed text-[#222222] sm:text-xl">
                        {featured.titleJa ?? featured.title}
                      </h2>

                    {(featured.commentJa || featured.excerpt) && (
                      <p className="max-w-2xl text-[11px] leading-relaxed text-[#222222]/70 sm:text-xs">
                        {featured.commentJa ?? featured.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#222222]/70">
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
                </Link>
              ) : (
                <p className="rounded-2xl border border-dashed border-[#222222]/10 bg-white/80 p-6 text-center text-xs text-[#222222]/55">
                  現在表示可能なニュースはなし
                </p>
              )}
            </Reveal>

            {/* 残りのリスト(月ごとタイムライン) */}
            {rest.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#222222]/10 bg-white/80 p-6 text-center text-xs text-[#222222]/55">
                条件に合うニュースはなし 絞り込み条件を少し緩めて再検索する想定
              </p>
            ) : (
              <div className="space-y-6">
                {groupedRestEntries.map(([label, group]) => (
                  <div key={label} className="space-y-2">
                    {/* 月ラベル:タイムラインの節 */}
                    <div className="flex items-center gap-3 text-[10px] text-[#222222]/45">
                      <span className="h-px flex-1 bg-[#222222]/05" />
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
                  className="text-[#222222]"
                >
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                    QUICK SOURCE
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-[#222222]/70">
                    {quickSources.slice(0, 10).map((s) => {
                      const count = filtered.filter(
                        (item) => buildSourceLabel(item) === s,
                      ).length;
                      return (
                        <Link
                          key={s}
                          href={`/news${buildQueryString(baseQueryParams, { source: s })}`}
                          rel="nofollow"
                          className="cb-tap inline-flex items-center gap-1 rounded-full bg-[#222222]/03 px-3 py-1 tracking-[0.14em] transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                        >
                          <span>{s}</span>
                          {count > 0 && (
                            <span className="text-[9px] text-[#222222]/45">
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
                  className="text-[#222222]"
                >
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                    MAKER FOCUS
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-[#222222]/70">
                    {quickMakers.slice(0, 10).map((m) => {
                      const count = filtered.filter(
                        (item) => item.maker === m,
                      ).length;
                      return (
                        <Link
                          key={m}
                          href={`/news${buildQueryString(baseQueryParams, { maker: m })}`}
                          rel="nofollow"
                          className="cb-tap inline-flex items-center gap-1 rounded-full bg-[#222222]/03 px-3 py-1 tracking-[0.14em] transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                        >
                          <span>{m}</span>
                          {count > 0 && (
                            <span className="text-[9px] text-[#222222]/45">
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

      </div>
    </main>
  );
}
