import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { GuideHeroCarousel, type GuideHeroItem } from "@/components/guide/GuideHeroCarousel";
import { JsonLd } from "@/components/seo/JsonLd";

import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

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
  const title = "GUIDE｜買い方・維持費・保険・税金・売却の実用ガイド";
  const description =
    "買い方・売り方・維持費・保険・税金まで、迷わない順番で結論と手順を整理する実用ガイド集。比較表・チェックリスト・次の一手（申込/見積）まで繋げます。";
  const canonical = `${getSiteUrl()}/guide`;

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

function mapCategoryLabel(category?: string | null): string {
  switch ((category ?? "").toUpperCase()) {
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "MONEY":
      return "お金・維持費";
    case "BUY":
      return "購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "INSURANCE":
      return "保険・補償";
    case "LEASE":
      return "リース・残価";
    case "GOODS":
      return "カー用品";
    case "DRIVING":
      return "運転";
    case "LIFE":
      return "生活";
    default:
      return category ? String(category) : "";
  }
}

function buildQueryHref(base: {
  q?: string;
  category?: string;
  tag?: string;
  page?: string;
}, updates: {
  q?: string | null;
  category?: string | null;
  tag?: string | null;
  page?: string | null;
}): string {
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

export default async function GuideIndexPage({ searchParams }: PageProps) {
  const all = await getAllGuides();

  const rawQ = toSingle(searchParams?.q);
  const rawCategory = toSingle(searchParams?.category);
  const rawTag = toSingle(searchParams?.tag);
  const rawPage = toSingle(searchParams?.page);

  const q = normalize(rawQ);
  const category = rawCategory.trim();
  const tag = rawTag.trim();

  const filtered = all.filter((g) => {
    const haystack = [
      g.title ?? "",
      g.summary ?? "",
      g.lead ?? "",
      ...(g.tags ?? []),
      g.category ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (q && !haystack.includes(q)) return false;
    if (category && String(g.category ?? "") !== category) return false;
    if (tag && !(g.tags ?? []).includes(tag)) return false;

    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  const parsedPage = Number.parseInt(rawPage || "1", 10);
  const currentPage =
    !Number.isNaN(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, totalPages)
      : 1;

  const start = (currentPage - 1) * PER_PAGE;
  const end = start + PER_PAGE;
  const paginated = filtered.slice(start, end);

  // chips: カテゴリ（主要5つだけ）
  const categoryChips = [
    { key: "MAINTENANCE", label: "メンテナンス" },
    { key: "TROUBLE", label: "トラブル" },
    { key: "MONEY", label: "お金・維持費" },
    { key: "BUY", label: "購入計画" },
    { key: "SELL", label: "売却・乗り換え" },
  ];

  // tags: よく使われる上位
  const tagCounts = new Map<string, number>();
  for (const g of all) {
    for (const t of g.tags ?? []) {
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

  // hero carousel: 画像があるガイドを優先
  const heroItems: GuideHeroItem[] = all
    .filter((g) => Boolean(g.heroImage))
    .slice(0, 5)
    .map((g) => ({
      href: `/guide/${encodeURIComponent(g.slug)}`,
      title: g.title,
      summary: g.summary,
      imageSrc: g.heroImage as string,
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
        name: "GUIDE",
        item: `${getSiteUrl()}/guide`,
      },
    ],
  };

  return (
    <main className="bg-site text-text-main">
      <JsonLd id="jsonld-guide-index-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        {/* top */}
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "GUIDE" }]} />
          {/* MENU は components/layout/HamburgerMenu で固定表示 */}
        </div>

        {/* header */}
        <header className="mt-10 text-center">
          <p className="text-[12px] tracking-[0.22em] text-[#0ABAB5]">
            カーライフの「迷い」を減らすガイド
          </p>
          <h1 className="serif-heading mt-4 text-[44px] tracking-[0.08em] text-[#222222]">
            GUIDE
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[13px] leading-relaxed text-[#222222]/65">
            買い方・維持費・保険・税金・売却まで。結論→手順→次の一手の順で、実務だけを整理します。
          </p>
        </header>

        {/* hero carousel */}
        <div className="mx-auto mt-10 max-w-3xl">
          <GuideHeroCarousel items={heroItems} />
        </div>

        {/* start-here */}
        <section className="mx-auto mt-8 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-[44%] opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(10,186,181,0.25),transparent_62%)]" />
            </div>

            <div className="relative">
              <h2 className="text-[14px] font-semibold tracking-[0.12em] text-[#222222]">
                はじめての方へ
              </h2>
              <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                <li>・まずは“結論”だけ読み、必要なら手順へ進む。</li>
                <li>・支払いと維持費は「月の総額」で見る。</li>
                <li>・迷ったら、次の一手（見積/比較/申込）まで繋げる。</li>
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {categoryChips.map((c) => {
                  const selected = category === c.key;
                  return (
                    <Link
                      key={c.key}
                      href={`/guide${buildQueryHref(base, {
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
            </div>
          </div>
        </section>

        {/* search & chips */}
        <section className="mx-auto mt-10 max-w-3xl" aria-label="すべてのガイドを見る">
          <div className="rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <h2 className="text-center text-[13px] font-semibold tracking-[0.16em] text-[#222222]">
              すべてのガイドを見る
            </h2>

            <form method="get" action="/guide" className="mt-5">
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
                  placeholder="ガイドを検索"
                  className="w-full rounded-2xl border border-[#222222]/12 bg-white px-11 py-4 text-[13px] text-[#222222] placeholder:text-[#222222]/35 shadow-soft focus:border-[#0ABAB5]/45 focus:outline-none"
                />
                {/* category/tag は chips 操作が基本。フォーム送信時は既存値を維持 */}
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
                    href={`/guide${buildQueryHref(base, {
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
                    href={`/guide${buildQueryHref(base, {
                      tag: selected ? null : t,
                      page: null,
                    })}`}
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
                    href={`/guide${buildQueryHref(base, { page: String(p) })}`}
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
        <section className="mx-auto mt-10 max-w-3xl" aria-label="ガイド一覧">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold tracking-[0.16em] text-[#222222]">
              おすすめのガイド
            </h2>
            <Link
              href="/guide"
              className="text-[11px] tracking-[0.16em] text-[#222222]/55 hover:text-[#0ABAB5]"
            >
              すべて見る
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {paginated.map((g) => (
              <ContentRowCard
                key={g.slug}
                href={`/guide/${encodeURIComponent(g.slug)}`}
                title={g.title}
                excerpt={g.summary}
                imageSrc={g.heroImage || null}
                badge={(g.tags ?? [])[0] ?? mapCategoryLabel(g.category)}
                badgeTone="accent"
                date={formatDate(g.publishedAt ?? g.updatedAt ?? null)}
              />
            ))}

            {paginated.length === 0 ? (
              <div className="rounded-2xl border border-[#222222]/10 bg-white p-8 text-center text-[13px] text-[#222222]/65">
                条件に合うガイドが見つかりませんでした。
              </div>
            ) : null}
          </div>

          {/* prev/next */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {currentPage > 1 ? (
                <Link
                  href={`/guide${buildQueryHref(base, { page: String(currentPage - 1) })}`}
                  className="rounded-full border border-[#222222]/10 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] shadow-soft hover:border-[#0ABAB5]/35"
                >
                  PREV
                </Link>
              ) : null}
            </div>
            <div>
              {currentPage < totalPages ? (
                <Link
                  href={`/guide${buildQueryHref(base, { page: String(currentPage + 1) })}`}
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
              href="/guide"
              className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-gradient-to-r from-[#0ABAB5] to-[#2F7F86] px-7 py-4 text-[11px] font-semibold tracking-[0.2em] text-white shadow-soft-card transition hover:opacity-95"
            >
              すべてのガイドを回る
            </Link>
          </div>
        </section>

        {/* bottom CTA */}
        <section className="mx-auto mt-12 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#222222]/10 bg-[#0B1220] shadow-soft-card">
            <div className="absolute inset-0 opacity-70">
              {/* 背景は既存の画像を流用（軽量化したい場合は差し替え） */}
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
                CAR DATABASE&nbsp;&nbsp;•&nbsp;&nbsp;READ COLUMNS
              </p>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75">
                次に必要な情報が決まっているなら、車種データベースとコラムも併用してください。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/cars"
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-[10px] font-semibold tracking-[0.18em] text-[#222222] shadow-soft"
                >
                  CAR DATABASE
                </Link>
                <Link
                  href="/column"
                  className="inline-flex items-center rounded-full bg-[#0ABAB5] px-5 py-3 text-[10px] font-semibold tracking-[0.18em] text-white shadow-soft"
                >
                  READ COLUMNS
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
