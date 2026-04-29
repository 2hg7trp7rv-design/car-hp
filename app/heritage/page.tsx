import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArchiveFilterAutoApply } from "@/components/archive/ArchiveFilterAutoApply";
import { ArchivePagination } from "@/components/archive/ArchivePagination";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { resolveHeritageCardImage } from "@/lib/display-tag-media";
import { EDITORIAL_ASSETS } from "@/lib/editorial-assets";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { getAllHeritage, getHeritagePreviewText, type HeritageItem } from "@/lib/heritage";
import { HERITAGE_DISPLAY_TAGS, resolveHeritageDisplayTag } from "@/lib/heritage-display-tags";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

type SearchParams = {
  q?: string | string[];
  decade?: string | string[];
  displayTag?: string | string[];
  sort?: string | string[];
  view?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "系譜｜モデルの世代変遷と技術の歴史";
  const description = "モデルの世代変遷と技術の歴史を、年代とテーマで整理して読めます。";
  const canonical = `${getSiteUrl()}/heritage`;

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
    robots: hasMeaningfulSearchParams(searchParams as any) ? NOINDEX_ROBOTS : undefined,
  };
}

const PER_PAGE = 8;

type SortKey = "" | "newest" | "oldest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "", label: "おすすめ順" },
  { key: "newest", label: "新しい年代順" },
  { key: "oldest", label: "古い年代順" },
];

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function yearFromEraLabel(label: string): number | null {
  const normalized = String(label ?? "")
    .replace(/\s+/g, "")
    .replace(/〜|～|—|–/g, "-")
    .replace(/年代/g, "")
    .replace(/年/g, "")
    .trim();

  // 1995 / 1990-1994 / 1990- / 1990s などの先頭数値を拾う
  const match = normalized.match(/(19\d{2}|20\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  if (Number.isNaN(year)) return null;
  return year;
}

function decadeKeyFromYear(year: number): string {
  const base = Math.floor(year / 10) * 10;
  return `${base}s`;
}

function decadeLabel(decadeKey: string): string {
  const start = decadeKey.replace(/s$/g, "");
  return `${start}年代`;
}

function formatEraLabel(label?: string | null): string {
  if (!label) return "";
  const trimmed = String(label).trim();
  return trimmed;
}

function safeSortKey(value: string): SortKey {
  if (value === "newest" || value === "oldest") return value;
  return "";
}

function sortByEra(items: HeritageItem[], sortKey: SortKey): HeritageItem[] {
  if (!sortKey) return items;

  const dir = sortKey === "newest" ? -1 : 1;
  const missingSentinel = sortKey === "oldest" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  return [...items].sort((a, b) => {
    const ay = yearFromEraLabel(a.eraLabel || a.years || "") ?? missingSentinel;
    const by = yearFromEraLabel(b.eraLabel || b.years || "") ?? missingSentinel;

    if (ay !== by) return (ay - by) * dir;

    // tie-breaker: timelineOrder (小さいほど上)
    const at = a.timelineOrder ?? 9999;
    const bt = b.timelineOrder ?? 9999;
    if (at !== bt) return at - bt;

    return String(a.title).localeCompare(String(b.title), "ja");
  });
}

function buildQueryString(
  base: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(base)) {
    if (!v) continue;
    params.set(k, v);
  }

  for (const [k, v] of Object.entries(updates)) {
    if (!v) params.delete(k);
    else params.set(k, v);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function buildDecadeInfos(items: HeritageItem[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const year = yearFromEraLabel(item.eraLabel || item.years || "");
    if (!year) continue;
    const key = decadeKeyFromYear(year);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: decadeLabel(key),
      count,
      order: Number(key.replace(/s$/g, "")) || 0,
    }))
    .sort((a, b) => b.order - a.order);
}

export default async function HeritageArchivePage({ searchParams }: PageProps) {
  const rawQ = toSingle(searchParams?.q);
  const decade = toSingle(searchParams?.decade);
  const displayTag = toSingle(searchParams?.displayTag);

  const sortKey = safeSortKey(toSingle(searchParams?.sort));
  const viewMode: "card" | "list" = toSingle(searchParams?.view) === "list" ? "list" : "card";

  const q = rawQ.trim();
  const normalizedQ = normalize(q);

  const requestedPage = Number(toSingle(searchParams?.page)) || 1;

  const all = await getAllHeritage();
  const decadeInfos = buildDecadeInfos(all);

  const displayTagCounts = new Map<string, number>();
  for (const item of all) {
    const tag = resolveHeritageDisplayTag(item);
    displayTagCounts.set(tag, (displayTagCounts.get(tag) ?? 0) + 1);
  }

  const topDecades = decadeInfos.slice(0, 6);
  const topDisplayTags = HERITAGE_DISPLAY_TAGS.filter((t) => (displayTagCounts.get(t) ?? 0) > 0).slice(0, 6);

  let filtered = all;

  if (normalizedQ) {
    filtered = filtered.filter((item) => {
      const preview = getHeritagePreviewText(item);
      const haystack = [item.title, item.titleJa, preview, item.summary, item.eraLabel, item.years]
        .map((v) => String(v ?? ""))
        .join(" ")
        .toLowerCase();
      if (haystack.includes(normalizedQ)) return true;
      const tags = (item.tags ?? []).map((t) => normalize(t));
      return tags.some((t) => t.includes(normalizedQ));
    });
  }

  if (displayTag) {
    filtered = filtered.filter((item) => resolveHeritageDisplayTag(item) === displayTag);
  }

  if (decade) {
    filtered = filtered.filter((item) => {
      const year = yearFromEraLabel(item.eraLabel || item.years || "");
      if (!year) return false;
      return decadeKeyFromYear(year) === decade;
    });
  }

  filtered = sortByEra(filtered, sortKey);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const paged = filtered.slice(startIndex, startIndex + PER_PAGE);

  const featured = paged.slice(0, 3);
  const leadItem = featured[0] ?? null;
  const secondaryItems = featured.slice(1);
  const gridItems = paged.slice(3);

  const baseQueryParams: Record<string, string | undefined> = {
    q: q || undefined,
    decade: decade || undefined,
    displayTag: displayTag || undefined,
    sort: sortKey || undefined,
    view: viewMode === "list" ? "list" : undefined,
  };

  const activeFilterLinks = [
    q
      ? {
          label: `検索: ${q}`,
          href: `/heritage${buildQueryString(baseQueryParams, { q: undefined, page: "1" })}`,
        }
      : null,
    decade
      ? {
          label: `年代: ${decadeLabel(decade)}`,
          href: `/heritage${buildQueryString(baseQueryParams, { decade: undefined, page: "1" })}`,
        }
      : null,
    displayTag
      ? {
          label: `分類: ${displayTag}`,
          href: `/heritage${buildQueryString(baseQueryParams, { displayTag: undefined, page: "1" })}`,
        }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const heroImage = resolveEditorialImage(EDITORIAL_ASSETS.heritageHero, "heritage", "desktop", "heritage-hero");

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "系譜",
          description: "モデルの世代変遷と技術の歴史を、年代とテーマで整理して読めます。",
          url: `${getSiteUrl()}/heritage`,
        }}
      />

      <section className="relative flex min-h-[calc(100svh-64px)] flex-col overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={heroImage.src}
            alt=""
            fill
            className="object-cover blur-[18px] scale-[1.06]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.44)]" />
        </div>

        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={heroImage.src}
            alt=""
            fill
            className="object-contain sm:object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.10)_36%,rgba(0,0,0,0.62)_100%)]" />
        </div>

        <div className="page-shell relative z-10 flex flex-1 flex-col pb-16 pt-24 text-center">
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "系譜" },
            ]}
            tone="light"
            className="mx-auto"
          />

          <div className="mt-auto">
            <p className="cb-font-sans text-[12px] font-semibold tracking-[0.22em] text-[rgba(251,248,243,0.78)]">
              系譜
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              系譜
            </h1>
            <p className="mx-auto mt-6 max-w-[44rem] text-[14px] leading-relaxed text-[rgba(251,248,243,0.86)] sm:text-[15px]">
              世代、技術、時代の空気。名車が何を継いで、何を捨てたか。
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Link href="/cars" className="cb-chip cb-chip--ghost">
                車種から見る
              </Link>
              <Link href="/column" className="cb-chip cb-chip--ghost">
                視点を読む
              </Link>
              <Link href="/search" className="cb-chip cb-chip--ghost">
                横断検索
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell pb-24 pt-14">
        <section className="cb-panel p-5 sm:p-6">
          <p className="cb-kicker">絞り込み</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            条件で絞り込む
          </h2>

          <ArchiveFilterAutoApply formId="heritage-filter-form" />

          <form
            id="heritage-filter-form"
            action="/heritage"
            method="get"
            className="mt-6 space-y-6"
          >
            <div>
              <label htmlFor="heritage-q" className="cb-field-label">
                キーワード
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(14,12,10,0.55)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M16.25 16.25 21 21"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  id="heritage-q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="世代、技術、出来事、転換点など"
                  className="cb-input h-12 w-full pl-12 pr-24"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--text-primary)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  検索
                </button>
              </div>
            </div>

            <div>
              <p className="cb-field-label">並び替え</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const href = `/heritage${buildQueryString(baseQueryParams, {
                    sort: opt.key || undefined,
                    page: "1",
                  })}`;
                  const active = opt.key === sortKey;
                  return (
                    <Link
                      key={opt.key || "default"}
                      href={href}
                      prefetch={false}
                      rel="nofollow"
                      className={active ? "cb-chip cb-chip--active" : "cb-chip"}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="cb-field-label">表示</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/heritage${buildQueryString(baseQueryParams, { view: undefined, page: "1" })}`}
                  prefetch={false}
                  rel="nofollow"
                  className={viewMode === "card" ? "cb-chip cb-chip--active" : "cb-chip"}
                >
                  カード
                </Link>
                <Link
                  href={`/heritage${buildQueryString(baseQueryParams, { view: "list", page: "1" })}`}
                  prefetch={false}
                  rel="nofollow"
                  className={viewMode === "list" ? "cb-chip cb-chip--active" : "cb-chip"}
                >
                  リスト
                </Link>
              </div>
            </div>

            <details
              className="rounded-2xl border border-[rgba(14,12,10,0.10)] bg-[rgba(251,248,243,0.60)] px-4 py-3"
              open={Boolean(decade || displayTag)}
            >
              <summary className="cb-font-sans flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold tracking-[0.22em] text-[var(--text-secondary)]">
                <span>詳細条件</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">開く / 閉じる</span>
              </summary>

              <div className="grid gap-5 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="heritage-decade" className="cb-field-label">
                    年代
                  </label>
                  <select
                    id="heritage-decade"
                    name="decade"
                    defaultValue={decade}
                    className="cb-select"
                  >
                    <option value="">すべて</option>
                    {decadeInfos.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}（{d.count}）
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="heritage-displayTag" className="cb-field-label">
                    分類
                  </label>
                  <select
                    id="heritage-displayTag"
                    name="displayTag"
                    defaultValue={displayTag}
                    className="cb-select"
                  >
                    <option value="">すべて</option>
                    {HERITAGE_DISPLAY_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}（{displayTagCounts.get(t) ?? 0}）
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </details>

            <input type="hidden" name="sort" value={sortKey} disabled={!sortKey} />
            <input type="hidden" name="view" value="list" disabled={viewMode !== "list"} />
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {activeFilterLinks.map((it) => (
              <Link
                key={it.label}
                href={it.href}
                rel="nofollow"
                prefetch={false}
                className="cb-chip cb-chip--active"
              >
                {it.label}
                <span className="ml-2 text-[12px] text-[rgba(251,248,243,0.8)]">×</span>
              </Link>
            ))}
            <Link href="/heritage" className="cb-chip cb-chip--ghost" prefetch={false}>
              条件をリセット
            </Link>
          </div>

          {topDecades.length > 0 ? (
            <div className="mt-6">
              <p className="cb-field-label mb-3">おすすめ年代</p>
              <div className="flex flex-wrap gap-2">
                {topDecades.map((d) => (
                  <Link
                    key={d.key}
                    href={`/heritage${buildQueryString({}, { decade: d.key })}`}
                    prefetch={false}
                    rel="nofollow"
                    className="cb-chip cb-chip--ghost"
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {topDisplayTags.length > 0 ? (
            <div className="mt-6">
              <p className="cb-field-label mb-3">おすすめ条件</p>
              <div className="flex flex-wrap gap-2">
                {topDisplayTags.map((t) => (
                  <Link
                    key={t}
                    href={`/heritage${buildQueryString({}, { displayTag: t })}`}
                    prefetch={false}
                    rel="nofollow"
                    className="cb-chip cb-chip--ghost"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="cb-kicker">一覧</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                検索結果
              </h2>
            </div>
            <p className="cb-font-sans text-sm tracking-[0.18em] text-[var(--text-tertiary)]">
              {totalItems} 本中 {paged.length} 本を表示
            </p>
          </div>

          {totalItems === 0 ? (
            <div className="mt-8 rounded-3xl border border-[rgba(14,12,10,0.10)] bg-white/55 p-8">
              <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                条件に一致する記事が見つかりませんでした。キーワードや条件を調整してみてください。
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="mt-8 space-y-4">
              {paged.map((item) => (
                <ContentRowCard
                  key={item.slug}
                  href={`/heritage/${encodeURIComponent(item.slug)}`}
                  title={item.title}
                  date={formatDate(item.publishedAt ?? item.createdAt ?? null)}
                  imageSrc={resolveHeritageCardImage(item)}
                  eyebrow={formatEraLabel(item.eraLabel)}
                  excerpt={getHeritagePreviewText(item) || undefined}
                  seedKey={item.slug}
                  posterVariant="heritage"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-12">
                {leadItem ? (
                  <div className="lg:col-span-7">
                    <ContentGridCard
                      href={`/heritage/${encodeURIComponent(leadItem.slug)}`}
                      title={leadItem.title}
                      date={formatDate(leadItem.publishedAt ?? leadItem.createdAt ?? null) || undefined}
                      imageSrc={resolveHeritageCardImage(leadItem)}
                      eyebrow={formatEraLabel(leadItem.eraLabel)}
                      excerpt={getHeritagePreviewText(leadItem) || undefined}
                      aspect="landscape"
                      seedKey={leadItem.slug}
                      posterVariant="heritage"
                    />
                  </div>
                ) : null}

                {secondaryItems.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {secondaryItems.map((item) => (
                      <ContentGridCard
                        key={item.slug}
                        href={`/heritage/${encodeURIComponent(item.slug)}`}
                        title={item.title}
                        date={formatDate(item.publishedAt ?? item.createdAt ?? null) || undefined}
                        imageSrc={resolveHeritageCardImage(item)}
                        eyebrow={formatEraLabel(item.eraLabel)}
                        excerpt={getHeritagePreviewText(item) || undefined}
                        aspect="landscape"
                        seedKey={item.slug}
                        posterVariant="heritage"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {gridItems.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {gridItems.map((item) => (
                    <ContentGridCard
                      key={item.slug}
                      href={`/heritage/${encodeURIComponent(item.slug)}`}
                      title={item.title}
                      date={formatDate(item.publishedAt ?? item.createdAt ?? null) || undefined}
                      imageSrc={resolveHeritageCardImage(item)}
                      eyebrow={formatEraLabel(item.eraLabel)}
                      excerpt={getHeritagePreviewText(item) || undefined}
                      aspect="landscape"
                      seedKey={item.slug}
                      posterVariant="heritage"
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}

          <ArchivePagination
            className="mt-12"
            currentPage={currentPage}
            totalPages={totalPages}
            hrefForPage={(p) => `/heritage${buildQueryString(baseQueryParams, { page: String(p) })}`}
          />
        </section>
      </div>
    </main>
  );
}
