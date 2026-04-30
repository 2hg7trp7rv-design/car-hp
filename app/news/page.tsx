import type { Metadata } from "next";
import Link from "next/link";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { getLatestNews, type NewsItem } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-sources";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  maker?: string | string[];
  tag?: string | string[];
  source?: string | string[];
  period?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "ニュース｜メーカー公式ニュース一覧";
  const description =
    "輸入車とプレミアムブランド中心の新型車発表・仕様変更・技術動向を、一次情報を起点に更新ログ一覧。";
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
    robots: hasParams ? NOINDEX_ROBOTS : undefined,
  };
}

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildQueryString(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value && value.trim() !== "") params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function buildMonthLabel(item: NewsItem): string {
  const base = item.publishedAt ?? item.createdAt;
  if (!base) return "日付未設定";
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return "日付未設定";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}年${m}月`;
}

function buildSourceLabel(item: NewsItem): string {
  if (item.sourceName) return item.sourceName;
  if (item.maker) return item.maker;
  return "その他ソース";
}

function buildTagList(item: NewsItem): string[] {
  return Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
}

function mapCategoryLabel(category?: string | null): string {
  switch ((category ?? "").toUpperCase()) {
    case "NEW_MODEL":
      return "新型";
    case "MODEL_CHANGE":
      return "改良";
    case "TECH":
      return "技術";
    case "EV":
      return "EV";
    default:
      return category ? String(category) : "ニュース";
  }
}

function isRecent(item: NewsItem, days = 7): boolean {
  const base = item.publishedAt ?? item.createdAt;
  if (!base) return false;
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return false;
  const diffMs = Date.now() - d.getTime();
  return diffMs / (1000 * 60 * 60 * 24) <= days;
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getNewsSummary(item: NewsItem): string {
  const base = item.summary ?? item.commentJa ?? item.excerpt ?? "";
  return base.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
}

function filterNews(items: NewsItem[], filters: SearchParams): NewsItem[] {
  const keyword = normalize(toSingle(filters.q));
  const categoryFilter = toSingle(filters.category).trim();
  const makerFilter = toSingle(filters.maker).trim();
  const tagFilter = toSingle(filters.tag).trim();
  const sourceFilter = toSingle(filters.source).trim();
  const periodFilter = toSingle(filters.period).trim();

  const now = new Date();

  return items.filter((item) => {
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

      if (!haystack.includes(keyword)) return false;
    }

    if (categoryFilter && item.category !== categoryFilter) return false;
    if (makerFilter && item.maker !== makerFilter) return false;
    if (sourceFilter && buildSourceLabel(item) !== sourceFilter) return false;

    if (tagFilter) {
      const tags = buildTagList(item);
      if (!tags.includes(tagFilter)) return false;
    }

    if (periodFilter === "7d" || periodFilter === "30d") {
      const base = item.publishedAt ?? item.createdAt;
      if (!base) return false;
      const d = new Date(base);
      if (Number.isNaN(d.getTime())) return false;
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

      if (periodFilter === "7d" && diffDays > 7) return false;
      if (periodFilter === "30d" && diffDays > 30) return false;
    }

    return true;
  });
}

export default async function NewsPage({ searchParams }: PageProps) {
  let news: NewsItem[] = [];
  try {
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
    q: rawQ || undefined,
    category: categoryFilter || undefined,
    maker: makerFilter || undefined,
    tag: tagFilter || undefined,
    source: sourceFilter || undefined,
    period: periodFilter || undefined,
  };

  const makersActive: string[] = Array.from(
    new Set(news.map((n) => n.maker).filter(isNonEmptyString)),
  ).sort();
  const makersFromSources: string[] = Array.from(
    new Set(NEWS_SOURCES.map((s) => s.maker).filter(isNonEmptyString)),
  ).sort();
  const makers: string[] = Array.from(new Set([...makersFromSources, ...makersActive])).sort();

  const categories: string[] = Array.from(
    new Set(news.map((n) => n.category).filter(isNonEmptyString)),
  ).sort();
  const tags: string[] = Array.from(new Set(news.flatMap((n) => buildTagList(n)))).sort();

  const sourcesActive: string[] = Array.from(
    new Set(news.map((n) => buildSourceLabel(n)).filter(Boolean)),
  ).sort();
  const sourcesFromConfig: string[] = Array.from(
    new Set(NEWS_SOURCES.map((s) => s.name).filter(isNonEmptyString)),
  ).sort();
  const sources: string[] = Array.from(new Set([...sourcesFromConfig, ...sourcesActive])).sort();

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

  const featured = filtered[0] ?? null;
  const featureRows = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  const groupedRestEntries = (() => {
    const grouped: Record<string, NewsItem[]> = {};
    for (const item of rest) {
      const label = buildMonthLabel(item);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    }
    return Object.entries(grouped).sort((a, b) => {
      const aDate = new Date(a[1][0]?.publishedAt ?? a[1][0]?.createdAt ?? 0);
      const bDate = new Date(b[1][0]?.publishedAt ?? b[1][0]?.createdAt ?? 0);
      return bDate.getTime() - aDate.getTime();
    });
  })();

  const recentCount = filtered.filter((item) => isRecent(item, 7)).length;
  const heroSourceCount = Array.from(new Set(filtered.map((item) => buildSourceLabel(item)))).length;

  const quickMakers = (makersActive.length > 0 ? makersActive : makers).slice(0, 8);
  const quickCategories = categories.slice(0, 6);
  const quickSources = (sourcesActive.length > 0 ? sourcesActive : sources).slice(0, 6);
  const topTags = tags.slice(0, 12);

  const activeFilters = [
    rawQ ? `検索: ${rawQ}` : "",
    categoryFilter ? `分類: ${mapCategoryLabel(categoryFilter)}` : "",
    makerFilter ? `メーカー: ${makerFilter}` : "",
    sourceFilter ? `ソース: ${sourceFilter}` : "",
    tagFilter ? `タグ: ${tagFilter}` : "",
    periodFilter === "7d" ? "期間: 直近7日" : periodFilter === "30d" ? "期間: 直近30日" : "",
  ].filter(Boolean);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "ニュース", item: `${getSiteUrl()}/news` },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-news-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <Breadcrumb
          items={[{ label: "ホーム", href: "/" }, { label: "ニュース" }]}
          className="text-[var(--text-tertiary)]"
        />

        <div className="mt-6">
          <ArchivePageHero
            eyebrow="ニュースアーカイブ"
            title="動きだけ拾う。"
            lead="新型車、仕様変更、技術動向。公式情報から動きを追う。"
            note="メーカーや媒体ごとの発表を、一覧として見渡しやすい密度で並べています。短く追うだけでも、いまの空気が掴めます。"
            imageSrc={featured?.imageUrl ?? null}
            imageAlt={featured?.titleJa ?? featured?.title ?? "ニュースアーカイブ"}
            seedKey={featured?.slug || featured?.id || "news-archive"}
            posterVariant="generic"
            stats={[
              { label: "掲載本数", value: `${news.length}本`, tone: "glow" },
              { label: "今回の表示", value: `${filtered.length}本`, tone: "wash" },
              { label: "直近7日", value: `${recentCount}本`, tone: "fog" },
            ]}
            links={[
              { href: "/cars", label: "車種を探す" },
              { href: "/search", label: "横断検索" },
              { href: "/column", label: "視点を読む" },
            ]}
          />
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="cb-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="cb-kicker">条件で絞り込む</p>
                <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[30px]">
                  気になる軸だけで絞る。
                </h2>
              </div>
              {hasFilter ? (
                <Link href="/news" className="cb-link-subtle text-[12px]">
                  すべて解除
                </Link>
              ) : null}
            </div>

            <form method="get" action="/news" className="mt-6 space-y-5">
              <div>
                <label htmlFor="news-search" className="cb-field-label">
                  キーワード
                </label>
                <input
                  id="news-search"
                  type="search"
                  name="q"
                  defaultValue={rawQ}
                  placeholder="車名、メーカー、技術、ソース名"
                  className="cb-input"
                />
                {categoryFilter ? <input type="hidden" name="category" value={categoryFilter} /> : null}
                {makerFilter ? <input type="hidden" name="maker" value={makerFilter} /> : null}
                {sourceFilter ? <input type="hidden" name="source" value={sourceFilter} /> : null}
                {tagFilter ? <input type="hidden" name="tag" value={tagFilter} /> : null}
                {periodFilter ? <input type="hidden" name="period" value={periodFilter} /> : null}
              </div>

              <div>
                <p className="cb-field-label">期間</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "7d", label: "直近7日" },
                    { key: "30d", label: "直近30日" },
                    { key: "", label: "全期間" },
                  ].map((period) => {
                    const selected = periodFilter === period.key;
                    return (
                      <Link
                        key={period.label}
                        href={`/news${buildQueryString(baseQueryParams, { period: period.key, q: rawQ || undefined })}`}
                        rel="nofollow"
                        className="cb-chip"
                        data-active={selected ? "true" : "false"}
                      >
                        {period.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="cb-field-label">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  {quickCategories.map((category) => {
                    const selected = categoryFilter === category;
                    return (
                      <Link
                        key={category}
                        href={`/news${buildQueryString(baseQueryParams, { category: selected ? "" : category })}`}
                        rel="nofollow"
                        className="cb-chip"
                        data-active={selected ? "true" : "false"}
                      >
                        {mapCategoryLabel(category)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="cb-panel-muted p-4">
                <p className="text-[12px] leading-[1.85] text-[var(--text-secondary)]">
                  期間、メーカー、分類で絞り込めます。
                </p>
              </div>
            </form>
          </div>

          <div className="cb-panel p-5 sm:p-6">
            <p className="cb-kicker">テーマ</p>
            <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[30px]">
              メーカーやソースで探す。
            </h2>

            <div className="mt-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                メーカー
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickMakers.map((maker) => {
                  const selected = makerFilter === maker;
                  return (
                    <Link
                      key={maker}
                      href={`/news${buildQueryString(baseQueryParams, { maker: selected ? "" : maker })}`}
                      rel="nofollow"
                      className="cb-chip"
                      data-active={selected ? "true" : "false"}
                    >
                      {maker}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                出典元
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickSources.map((source) => {
                  const selected = sourceFilter === source;
                  return (
                    <Link
                      key={source}
                      href={`/news${buildQueryString(baseQueryParams, { source: selected ? "" : source })}`}
                      rel="nofollow"
                      className="cb-chip"
                      data-active={selected ? "true" : "false"}
                    >
                      {source}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                TAGS
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topTags.map((tag) => {
                  const selected = tagFilter === tag;
                  return (
                    <Link
                      key={tag}
                      href={`/news${buildQueryString(baseQueryParams, { tag: selected ? "" : tag })}`}
                      rel="nofollow"
                      className="cb-chip"
                      data-active={selected ? "true" : "false"}
                    >
                      {tag}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[rgba(27,63,229,0.18)] bg-[var(--surface-glow)] px-4 py-4">
                <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                  出典元
                </div>
                <div className="mt-2 text-[20px] font-semibold leading-none text-[var(--accent-strong)]">
                  {heroSourceCount}
                </div>
              </div>

              <div className="rounded-[20px] border border-[rgba(27,63,229,0.18)] bg-[var(--surface-fog)] px-4 py-4">
                <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                  適用中の条件
                </div>
                <div className="mt-2 text-[20px] font-semibold leading-none text-[var(--accent-base)]">
                  {activeFilters.length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {activeFilters.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {activeFilters.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(14,12,10,0.08)] bg-[rgba(251,248,243,0.92)] px-3 py-1 text-[11px] text-[var(--text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        <section className="mt-12" aria-label="ニュース一覧">
          <ArchiveSectionHeading
            eyebrow="注目の流れ"
            title="注目のニュースを三〜四本で掴む。"
            lead="数を追うより、主役になっている話題から見ると月ごとの変化を掴みやすくなります。"
            aside="各記事から一次情報のリンクへ進めるので、背景を追いながら元情報にも戻れます。"
            className="border-t-0 pt-0"
          />

          {filtered.length === 0 ? (
            <div className="cb-panel p-8 text-center text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              条件に合うニュースが見つかりませんでした。期間やタグを少し緩めると、近い話題が見つかります。
            </div>
          ) : (
            <>
              {featured ? (
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <ContentGridCard
                      href={featured.link || `/news/${encodeURIComponent(featured.id)}`}
                      title={featured.titleJa ?? featured.title}
                      date={formatDate(featured.publishedAt ?? featured.createdAt ?? null) ?? undefined}
                      imageSrc={featured.imageUrl ?? null}
                      eyebrow={`${mapCategoryLabel(featured.category)} / ${buildSourceLabel(featured)}`}
                      excerpt={getNewsSummary(featured)}
                      aspect="portrait"
                      seedKey={featured.slug || featured.id}
                      posterVariant="generic"
                      className="lg:h-full"
                    />
                  </div>

                  <div className="space-y-3 lg:col-span-7">
                    {featureRows.map((item, index) => (
                      <ContentRowCard
                        key={item.id || item.slug || `${item.title}-${index}`}
                        href={item.link || `/news/${encodeURIComponent(item.id)}`}
                        title={item.titleJa ?? item.title}
                        excerpt={getNewsSummary(item)}
                        imageSrc={index === 2 ? null : item.imageUrl ?? null}
                        hideImage={index === 2}
                        badge={isRecent(item, 7) ? "新着" : mapCategoryLabel(item.category)}
                        badgeTone={isRecent(item, 7) ? "accent" : "light"}
                        date={formatDate(item.publishedAt ?? item.createdAt ?? null) ?? undefined}
                        seedKey={item.slug || item.id}
                        posterVariant="generic"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {groupedRestEntries.map(([monthLabel, items]) => {
                const monthLead = items[0];
                const monthRows = items.slice(1, 4);
                const monthGrid = items.slice(4, 8);

                return (
                  <div key={monthLabel}>
                    <ArchiveSectionHeading
                      eyebrow={monthLabel}
                      title={`${monthLabel} の出来事。`}
                      lead="ひと月ごとの動きをまとめて追えます。"
                    />

                    <div className="grid gap-4 lg:grid-cols-12">
                      {monthLead ? (
                        <div className="lg:col-span-5">
                          <ContentGridCard
                            href={monthLead.link || `/news/${encodeURIComponent(monthLead.id)}`}
                            title={monthLead.titleJa ?? monthLead.title}
                            date={formatDate(monthLead.publishedAt ?? monthLead.createdAt ?? null) ?? undefined}
                            imageSrc={monthLead.imageUrl ?? null}
                            eyebrow={`${mapCategoryLabel(monthLead.category)} / ${buildSourceLabel(monthLead)}`}
                            excerpt={getNewsSummary(monthLead)}
                            aspect="portrait"
                            seedKey={monthLead.slug || monthLead.id}
                            posterVariant="generic"
                            className="lg:h-full"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-3 lg:col-span-7">
                        {monthRows.map((item, index) => (
                          <ContentRowCard
                            key={item.id || item.slug || `${item.title}-${index}`}
                            href={item.link || `/news/${encodeURIComponent(item.id)}`}
                            title={item.titleJa ?? item.title}
                            excerpt={getNewsSummary(item)}
                            imageSrc={index === 2 ? null : item.imageUrl ?? null}
                            hideImage={index === 2}
                            badge={buildSourceLabel(item)}
                            badgeTone="light"
                            date={formatDate(item.publishedAt ?? item.createdAt ?? null) ?? undefined}
                            seedKey={item.slug || item.id}
                            posterVariant="generic"
                          />
                        ))}
                      </div>
                    </div>

                    {monthGrid.length > 0 ? (
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {monthGrid.map((item) => (
                          <ContentGridCard
                            key={item.id || item.slug || item.title}
                            href={item.link || `/news/${encodeURIComponent(item.id)}`}
                            title={item.titleJa ?? item.title}
                            date={formatDate(item.publishedAt ?? item.createdAt ?? null) ?? undefined}
                            imageSrc={item.imageUrl ?? null}
                            eyebrow={`${mapCategoryLabel(item.category)} / ${buildSourceLabel(item)}`}
                            excerpt={getNewsSummary(item)}
                            seedKey={item.slug || item.id}
                            posterVariant="generic"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
