import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import {
  GuideHeroCarousel,
  type GuideHeroItem,
} from "@/components/guide/GuideHeroCarousel";
import { JsonLd } from "@/components/seo/JsonLd";

import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { ArchiveEntrance } from "@/components/experience/ArchiveEntrance";

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  tag?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "COLUMN｜メンテ・トラブル・支払い・技術・市場のコラム";
  const description =
    "症状/トラブルの原因と対処、修理費の目安、支払い設計の考え方、ブランドの歴史・技術解説、相場・価格動向まで。クルマまわりの情報を短く整理したコラム集。";
  const canonical = `${getSiteUrl()}/column`;

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

const PER_PAGE = 8;

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

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "MONEY":
      return "お金・支払い";
    case "MARKET":
      return "市場・相場";
    case "TECHNICAL":
      return "技術・ブランド";
    case "OWNER_STORY":
      return "オーナー体験";
    case "LIFESTYLE":
      return "ライフスタイル";
    default:
      return "コラム";
  }
}

function buildQueryHref(
  base: {
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  },
  updates: {
    q?: string | null;
    category?: string | null;
    tag?: string | null;
    page?: string | null;
  },
): string {
  const params = new URLSearchParams();

  const merged = {
    q: base.q,
    category: base.category,
    tag: base.tag,
    page: base.page,
    ...updates,
  };

  for (const [k, v] of Object.entries(merged)) {
    if (!v) continue;
    const vv = String(v).trim();
    if (!vv) continue;
    params.set(k, vv);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default async function ColumnIndexPage({ searchParams }: PageProps) {
  const all = await getAllColumns();

  const rawQ = toSingle(searchParams?.q);
  const rawCategory = toSingle(searchParams?.category);
  const rawTag = toSingle(searchParams?.tag);
  const rawPage = toSingle(searchParams?.page);

  const q = normalize(rawQ);
  const category = rawCategory.trim();
  const tag = rawTag.trim();

  const filtered = all.filter((c) => {
    const haystack = [
      c.title ?? "",
      c.summary ?? "",
      // ColumnItem には lead フィールドが存在しないため、本文を検索対象に含める
      c.body ?? "",
      ...(c.tags ?? []),
      c.category ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) return false;
    if (category && String(c.category ?? "") !== category) return false;
    if (tag && !(c.tags ?? []).includes(tag)) return false;

    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  const parsedPage = Number.parseInt(rawPage || "1", 10);
  const currentPage =
    !Number.isNaN(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, totalPages) : 1;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginated = filtered.slice(start, end);

  const categoryChips: Array<{ key: ColumnItem["category"]; label: string }> = [
    { key: "MAINTENANCE", label: "メンテナンス" },
    { key: "TROUBLE", label: "トラブル" },
    { key: "MONEY", label: "お金・支払い" },
    { key: "MARKET", label: "市場・相場" },
    { key: "TECHNICAL", label: "技術・ブランド" },
  ];

  const tagCounts = new Map<string, number>();
  for (const c of all) {
    for (const t of c.tags ?? []) {
      if (!t) continue;
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([t]) => t);

  const base = {
    q: rawQ || undefined,
    category: category || undefined,
    tag: tag || undefined,
    page: rawPage || undefined,
  };

  const heroItems: GuideHeroItem[] = all
    .filter((c) => Boolean(c.heroImage))
    .slice(0, 5)
    .map((c) => ({
      href: `/column/${encodeURIComponent(c.slug)}`,
      title: c.title,
      summary: c.summary,
      imageSrc: c.heroImage as string,
    }));

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
        name: "COLUMN",
        item: `${getSiteUrl()}/column`,
      },
    ],
  };

  return (
    <main className="bg-site text-text-main">
      <JsonLd id="jsonld-column-index-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        {/* top */}
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "COLUMN" }]} />
        </div>

        <ArchiveEntrance
          n="04"
          title="COLUMNS"
          subtitle="Editorial hypotheses"
          lead="結論より先に、仮説がある。"
          href="/column"
          active="column"
        />

        {/* header */}
        <header className="mt-10 text-center">
          <h1 className="serif-heading mt-4 text-[44px] tracking-[0.08em] text-[#222222]">COLUMN</h1>
        </header>

        {/* hero carousel */}
        <div className="mx-auto mt-10 max-w-3xl">
          <GuideHeroCarousel items={heroItems} />
        </div>

        {/* search & chips */}
        <section className="mx-auto mt-10 max-w-3xl" aria-label="すべてのコラムを見る">
          <div className="rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <h2 className="text-center text-[13px] font-semibold tracking-[0.16em] text-[#222222]">
              すべてのコラムを見る
            </h2>

            <form method="get" action="/column" className="mt-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#222222]/35">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={rawQ}
                  placeholder="コラムを検索"
                  className="w-full rounded-2xl border border-[#222222]/12 bg-white px-11 py-4 text-[13px] text-[#222222] placeholder:text-[#222222]/35 shadow-soft focus:border-[#0ABAB5]/45 focus:outline-none"
                />
                {category ? <input type="hidden" name="category" value={category} /> : null}
                {tag ? <input type="hidden" name="tag" value={tag} /> : null}
              </div>
            </form>

            {/* category chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {categoryChips.map((c) => {
                const selected = category === c.key;
                return (
                  <Link
                    key={c.key}
                    href={`/column${buildQueryHref(base, {
                      category: selected ? null : c.key,
                      page: null,
                      tag: null,
                    })}`}
                    className={[
                      "inline-flex items-center rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.18em] transition",
                      selected
                        ? "bg-[#0ABAB5] text-white"
                        : "border border-[#222222]/12 bg-white text-[#222222] hover:border-[#0ABAB5]/35",
                    ].join(" ")}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>

            {/* tag chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {topTags.map((t) => {
                const selected = tag === t;
                return (
                  <Link
                    key={t}
                    href={`/column${buildQueryHref(base, { tag: selected ? null : t, page: null })}`}
                    className={[
                      "inline-flex items-center rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.18em] transition",
                      selected
                        ? "bg-[#222222] text-white"
                        : "border border-[#222222]/10 bg-white text-[#222222]/85 hover:border-[#222222]/20",
                    ].join(" ")}
                  >
                    {t}
                  </Link>
                );
              })}
            </div>

            {/* pagination */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#222222]/55">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, idx) => {
                const p = idx + 1;
                const active = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={`/column${buildQueryHref(base, { page: String(p) })}`}
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                      active
                        ? "bg-[#0ABAB5]/12 text-[#0ABAB5]"
                        : "hover:bg-[#222222]/5",
                    ].join(" ")}
                    aria-current={active}
                  >
                    {p}
                  </Link>
                );
              })}
              {totalPages > 7 ? <span className="px-2">…</span> : null}
            </div>
          </div>
        </section>

        {/* list */}
        <section className="mx-auto mt-10 max-w-3xl" aria-label="コラム一覧">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold tracking-[0.16em] text-[#222222]">おすすめのコラム</h2>
            <Link
              href="/column"
              className="text-[11px] tracking-[0.16em] text-[#222222]/55 hover:text-[#0ABAB5]"
            >
              すべて見る
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {paginated.map((c) => (
              <ContentRowCard
                key={c.slug}
                href={`/column/${encodeURIComponent(c.slug)}`}
                title={c.title}
                excerpt={c.summary}
                imageSrc={c.heroImage || null}
                badge={(c.tags ?? [])[0] ?? mapCategoryLabel(c.category)}
                badgeTone="accent"
                date={formatDate(c.publishedAt ?? c.updatedAt ?? null)}
              />
            ))}

            {paginated.length === 0 ? (
              <div className="rounded-2xl border border-[#222222]/10 bg-white p-8 text-center text-[13px] text-[#222222]/65">
                条件に合うコラムが見つかりませんでした。
              </div>
            ) : null}
          </div>

          {/* prev/next */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {currentPage > 1 ? (
                <Link
                  href={`/column${buildQueryHref(base, { page: String(currentPage - 1) })}`}
                  className="rounded-full border border-[#222222]/10 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] shadow-soft hover:border-[#0ABAB5]/35"
                >
                  PREV
                </Link>
              ) : null}
            </div>
            <div>
              {currentPage < totalPages ? (
                <Link
                  href={`/column${buildQueryHref(base, { page: String(currentPage + 1) })}`}
                  className="rounded-full border border-[#222222]/10 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] shadow-soft hover:border-[#0ABAB5]/35"
                >
                  NEXT
                </Link>
              ) : null}
            </div>
          </div>

          {/* big button */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/column"
              className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-[#0ABAB5] to-[#2F7F86] px-7 py-4 text-[11px] font-semibold tracking-[0.2em] text-white shadow-soft-card transition hover:opacity-95"
            >
              すべてのコラムを読む
            </Link>
          </div>
        </section>

        {/* bottom CTA */}
        <section className="mx-auto mt-12 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#222222]/10 bg-[#0B1220] shadow-soft-card">
            <div className="absolute inset-0 opacity-70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-sedan.webp"
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

            <div className="relative p-6 sm:p-8">
              <p className="text-[12px] font-semibold tracking-[0.2em] text-white/85">
                GUIDE&nbsp;&nbsp;•&nbsp;&nbsp;CAR DATABASE
              </p>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75">
                結論と手順は GUIDE に集約。車種の候補出しは CARS へ。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/guide"
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-[10px] font-semibold tracking-[0.18em] text-[#222222] shadow-soft"
                >
                  VIEW GUIDE
                </Link>
                <Link
                  href="/cars"
                  className="inline-flex items-center rounded-full bg-[#0ABAB5] px-5 py-3 text-[10px] font-semibold tracking-[0.18em] text-white shadow-soft"
                >
                  CAR DATABASE
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}