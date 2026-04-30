import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArchiveFilterAutoApply } from "@/components/archive/ArchiveFilterAutoApply";
import { ArchivePagination } from "@/components/archive/ArchivePagination";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { GuideCard } from "@/components/guide/GuideCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { GUIDE_DISPLAY_TAGS, isKnownDisplayTag, resolveGuideDisplayTag } from "@/lib/display-tags";
import { resolveGuideCardImage } from "@/lib/display-tag-media";
import { EDITORIAL_ASSETS } from "@/lib/editorial-assets";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  displayTag?: string | string[];
  tag?: string | string[];
  sort?: string | string[];
  view?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "GUIDE｜現実を見る";
  const description =
    "買い方・売り方・維持費・保険・税金まで、結論と手順を整理した実用ガイド集。比較表・チェックリスト・次の一手まで置いています。";
  const canonical = `${getSiteUrl()}/guide`;

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

const hubLinks = [
  {
    href: "/guide/hub-usedcar",
    title: "はじめの選び方",
  },
  {
    href: "/guide/hub-import-trouble",
    title: "壊れる前に",
  },
  {
    href: "/guide/hub-loan",
    title: "支払いの形",
  },
  {
    href: "/guide/hub-sell",
    title: "手放す前に",
  },
  {
    href: "/guide/insurance",
    title: "備えの設計",
  },
  {
    href: "/guide/maintenance",
    title: "長く乗る手入れ",
  },
] as const;

type SortKey = "" | "newest" | "oldest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "", label: "おすすめ順" },
  { key: "newest", label: "新しい順" },
  { key: "oldest", label: "古い順" },
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

function mapCategoryLabel(category?: string | null): string {
  switch ((category ?? "").toUpperCase()) {
    case "MAINTENANCE":
      return "長く乗る手入れ";
    case "TROUBLE":
      return "壊れる前に";
    case "MONEY":
      return "維持と余白";
    case "BUY":
      return "はじめの選び方";
    case "SELL":
      return "手放す前に";
    case "INSURANCE":
      return "備えの設計";
    case "LEASE":
      return "支払いの形";
    case "GOODS":
      return "暮らしの道具";
    case "DRIVING":
      return "運転の感覚";
    case "LIFE":
      return "日常と車";
    default:
      return category ? String(category) : "実用ガイド";
  }
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

function safeSortKey(value: string): SortKey {
  if (value === "newest" || value === "oldest") return value;
  return "";
}

function sortGuides(items: GuideItem[], sortKey: SortKey): GuideItem[] {
  if (sortKey === "oldest") return [...items].reverse();
  // getAllGuides() は公開日降順のため、""/"newest" はそのままでOK
  return items;
}

function buildCategoryInfos(all: GuideItem[]) {
  const counts = new Map<string, number>();
  for (const g of all) {
    const key = String(g.category ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, label: mapCategoryLabel(key), count }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.label.localeCompare(b.label, "ja");
    });
}

export default async function GuideArchivePage({ searchParams }: PageProps) {
  const rawQ = toSingle(searchParams?.q);
  const category = toSingle(searchParams?.category);
  const displayTagParam = toSingle(searchParams?.displayTag);
  const legacyTag = toSingle(searchParams?.tag);

  const sortKey = safeSortKey(toSingle(searchParams?.sort));
  const viewMode: "card" | "list" = toSingle(searchParams?.view) === "list" ? "list" : "card";

  const q = rawQ.trim();
  const normalizedQ = normalize(q);
  const normalizedLegacy = normalize(legacyTag);

  // 旧tag=... を displayTag として受ける互換（ただし既知タグのみ）
  const displayTag = displayTagParam || (legacyTag && isKnownDisplayTag(legacyTag) ? legacyTag : "");

  const requestedPage = Number(toSingle(searchParams?.page)) || 1;

  const allGuides = await getAllGuides();
  const categoryInfos = buildCategoryInfos(allGuides);

  const displayTagCounts = new Map<string, number>();
  for (const g of allGuides) {
    const tag = resolveGuideDisplayTag(g);
    displayTagCounts.set(tag, (displayTagCounts.get(tag) ?? 0) + 1);
  }

  const topDisplayTags = GUIDE_DISPLAY_TAGS.filter((tag) => (displayTagCounts.get(tag) ?? 0) > 0).slice(0, 6);
  const topCategories = categoryInfos.slice(0, 6);

  let filtered = allGuides;

  if (normalizedQ) {
    filtered = filtered.filter((g) => {
      const haystack = [g.title, g.titleJa, g.summary, g.lead, g.primaryQuery]
        .map((v) => String(v ?? ""))
        .join(" ")
        .toLowerCase();
      if (haystack.includes(normalizedQ)) return true;
      const tags = (g.tags ?? []).map((t) => normalize(t));
      return tags.some((t) => t.includes(normalizedQ));
    });
  }

  if (category) {
    const c = category.trim().toUpperCase();
    filtered = filtered.filter((g) => String(g.category ?? "").trim().toUpperCase() === c);
  }

  if (displayTag) {
    filtered = filtered.filter((g) => resolveGuideDisplayTag(g) === displayTag);
  }

  if (normalizedLegacy && !isKnownDisplayTag(legacyTag)) {
    filtered = filtered.filter((g) => {
      const tags = (g.tags ?? []).map((t) => normalize(t));
      return tags.some((t) => t.includes(normalizedLegacy));
    });
  }

  filtered = sortGuides(filtered, sortKey);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const paged = filtered.slice(startIndex, startIndex + PER_PAGE);

  const featured = paged.slice(0, 3);
  const leadGuide = featured[0] ?? null;
  const secondaryGuides = featured.slice(1);
  const gridGuides = paged.slice(3);

  const baseQueryParams: Record<string, string | undefined> = {
    q: q || undefined,
    category: category || undefined,
    displayTag: displayTag || undefined,
    tag: normalizedLegacy && !isKnownDisplayTag(legacyTag) ? legacyTag : undefined,
    sort: sortKey || undefined,
    view: viewMode === "list" ? "list" : undefined,
  };

  const activeFilterLinks = [
    q
      ? {
          label: `検索: ${q}`,
          href: `/guide${buildQueryString(baseQueryParams, { q: undefined, page: "1" })}`,
        }
      : null,
    category
      ? {
          label: `テーマ: ${mapCategoryLabel(category)}`,
          href: `/guide${buildQueryString(baseQueryParams, { category: undefined, page: "1" })}`,
        }
      : null,
    displayTag
      ? {
          label: `分類: ${displayTag}`,
          href: `/guide${buildQueryString(baseQueryParams, { displayTag: undefined, page: "1" })}`,
        }
      : null,
    normalizedLegacy && !isKnownDisplayTag(legacyTag)
      ? {
          label: `タグ: ${legacyTag}`,
          href: `/guide${buildQueryString(baseQueryParams, { tag: undefined, page: "1" })}`,
        }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const heroImage = resolveEditorialImage(EDITORIAL_ASSETS.guideHero, "guide", "desktop", "guide-hero");

  const jsonLdUrl = `${getSiteUrl()}/guide`;

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "実用",
          description:
            "買う前から維持、売却まで。判断に必要な記事を、テーマと条件で置いています。",
          url: jsonLdUrl,
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
              { label: "実用" },
            ]}
            tone="light"
            className="mx-auto"
          />

          <div className="mt-auto">
            <p className="cb-font-sans text-[12px] font-semibold tracking-[0.22em] text-[rgba(251,248,243,0.78)]">
              実用ガイド
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              実用
            </h1>
            <p className="mx-auto mt-6 max-w-[44rem] text-[14px] leading-relaxed text-[rgba(251,248,243,0.86)] sm:text-[15px]">
              買う前から維持、売却まで。判断に必要な記事を、テーマと条件で置いています。
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Link href="/cars" className="cb-chip cb-chip--ghost">
                車種から入る
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

          <ArchiveFilterAutoApply formId="guide-filter-form" />

          <form
            id="guide-filter-form"
            action="/guide"
            method="get"
            className="mt-6 space-y-6"
          >
            <div>
              <label htmlFor="guide-q" className="cb-field-label">
                キーワード
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(14,12,10,0.55)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
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
                  id="guide-q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="費用、保険、売却、ローンなど"
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
                  const href = `/guide${buildQueryString(baseQueryParams, {
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
                  href={`/guide${buildQueryString(baseQueryParams, { view: undefined, page: "1" })}`}
                  prefetch={false}
                  rel="nofollow"
                  className={viewMode === "card" ? "cb-chip cb-chip--active" : "cb-chip"}
                >
                  カード
                </Link>
                <Link
                  href={`/guide${buildQueryString(baseQueryParams, { view: "list", page: "1" })}`}
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
              open={Boolean(category || displayTag || (normalizedLegacy && !isKnownDisplayTag(legacyTag)))}
            >
              <summary className="cb-font-sans flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold tracking-[0.22em] text-[var(--text-secondary)]">
                <span>詳細条件</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">開く / 閉じる</span>
              </summary>

              <div className="grid gap-5 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="guide-category" className="cb-field-label">
                    テーマ
                  </label>
                  <select
                    id="guide-category"
                    name="category"
                    defaultValue={category}
                    className="cb-select"
                  >
                    <option value="">すべて</option>
                    {categoryInfos.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}（{c.count}）
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="guide-displayTag" className="cb-field-label">
                    分類
                  </label>
                  <select
                    id="guide-displayTag"
                    name="displayTag"
                    defaultValue={displayTag}
                    className="cb-select"
                  >
                    <option value="">すべて</option>
                    {GUIDE_DISPLAY_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}（{displayTagCounts.get(t) ?? 0}）
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="guide-tag" className="cb-field-label">
                    タグ（細分類）
                  </label>
                  <input
                    id="guide-tag"
                    name="tag"
                    defaultValue={normalizedLegacy && !isKnownDisplayTag(legacyTag) ? legacyTag : ""}
                    placeholder="例: レッカー / 警告灯 / 税金"
                    className="cb-input"
                  />
                </div>
              </div>
            </details>

            {/* chipsで操作するため、フォーム送信時に値が落ちないよう hidden で保持 */}
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
            <Link href="/guide" className="cb-chip cb-chip--ghost" prefetch={false}>
              条件をリセット
            </Link>
          </div>

          {topDisplayTags.length > 0 ? (
            <div className="mt-6">
              <p className="cb-field-label mb-3">おすすめ条件</p>
              <div className="flex flex-wrap gap-2">
                {topDisplayTags.map((t) => (
                  <Link
                    key={t}
                    href={`/guide${buildQueryString({}, { displayTag: t })}`}
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

          {topCategories.length > 0 ? (
            <div className="mt-6">
              <p className="cb-field-label mb-3">主要テーマ</p>
              <div className="flex flex-wrap gap-2">
                {topCategories.map((c) => (
                  <Link
                    key={c.key}
                    href={`/guide${buildQueryString({}, { category: c.key })}`}
                    prefetch={false}
                    rel="nofollow"
                    className="cb-chip cb-chip--ghost"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="cb-field-label mb-3">テーマから読む</p>
            <div className="flex flex-wrap gap-2">
              {hubLinks.map((h) => (
                <Link key={h.href} href={h.href} className="cb-chip" prefetch={false}>
                  {h.title}
                </Link>
              ))}
            </div>
          </div>
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
              {paged.map((guide) => (
                <ContentRowCard
                  key={guide.slug}
                  href={`/guide/${encodeURIComponent(guide.slug)}`}
                  title={guide.title}
                  date={formatDate(guide.publishedAt ?? guide.updatedAt ?? null)}
                  imageSrc={resolveGuideCardImage(guide)}
                  eyebrow={resolveGuideDisplayTag(guide)}
                  excerpt={guide.summary || guide.lead || undefined}
                  seedKey={guide.slug}
                  posterVariant="guide"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-12">
                {leadGuide ? (
                  <div className="lg:col-span-7">
                    <GuideCard guide={leadGuide} layout="feature" />
                  </div>
                ) : null}

                {secondaryGuides.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {secondaryGuides.map((guide, idx) => (
                      <GuideCard key={guide.slug} guide={guide} delay={idx * 0.04} />
                    ))}
                  </div>
                ) : null}
              </div>

              {gridGuides.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {gridGuides.map((guide, idx) => (
                    <GuideCard key={guide.slug} guide={guide} delay={0.06 * (idx + 1)} />
                  ))}
                </div>
              ) : null}
            </>
          )}

          <ArchivePagination
            className="mt-12"
            currentPage={currentPage}
            totalPages={totalPages}
            hrefForPage={(p) => `/guide${buildQueryString(baseQueryParams, { page: String(p) })}`}
          />
        </section>
      </div>
    </main>
  );
}
