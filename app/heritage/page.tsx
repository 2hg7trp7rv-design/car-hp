import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { cn } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

import type { HeritageItem } from "@/lib/content-types";
import { getAllHeritage, getHeritagePreviewText } from "@/lib/heritage";
import { ArchiveEntrance } from "@/components/experience/ArchiveEntrance";

const HOME_HERO_MOBILE = "/images/hero-top-mobile.jpeg";
const HOME_HERO_DESKTOP = "/images/hero-top-desktop.jpeg";

type SearchParams = {
  q?: string | string[];
  maker?: string | string[];
  era?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "HERITAGE（文化と背景）";
  const description =
    "車の背景にある文化、技術、時代の文脈を読み解く。スペックよりも“なぜそうなったか”にフォーカスする HERITAGE。";
  const canonical = `${getSiteUrl()}/heritage`;

  // 絞り込み/検索パラメータ付きの一覧は重複を作りやすいので noindex
  const noindex = hasMeaningfulSearchParams(searchParams ?? {});

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? NOINDEX_ROBOTS : undefined,
  };
}

function parseQuery(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").trim();
}

function parseIntSafe(v: string | undefined, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "ja"));
}

function pickCoverImage(src: string | null | undefined): string {
  const s = (src ?? "").trim();
  if (!s) return "/images/heritage/hero_default.jpg";
  if (s === "/ogp-default.jpg" || s === "/ogp-default.png") return "/images/heritage/hero_default.jpg";
  return s;
}

function getMaker(item: HeritageItem): string | null {
  const m = (item.maker ?? "").trim();
  return m ? m : null;
}

function getEraLabel(item: HeritageItem): string | null {
  const e = (item.eraLabel ?? "").trim();
  return e ? e : null;
}

function applyFilters(
  all: HeritageItem[],
  q: string,
  maker: string,
  era: string,
) {
  const qq = q.toLowerCase();
  return all.filter((h) => {
    if (maker) {
      const m = getMaker(h);
      if (!m || m !== maker) return false;
    }
    if (era) {
      const e = getEraLabel(h);
      if (!e || e !== era) return false;
    }
    if (qq) {
      const hay = `${h.title} ${h.summary ?? ""} ${h.maker ?? ""} ${h.eraLabel ?? ""}`
        .toLowerCase()
        .trim();
      if (!hay.includes(qq)) return false;
    }
    return true;
  });
}

function buildHref(base: string, params: Record<string, string>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) usp.set(k, v);
  });
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

function GlassChipLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2",
        "text-[11px] font-medium tracking-[0.18em] transition",
        active
          ? "border-white/35 bg-white/20 text-white"
          : "border-white/15 bg-white/10 text-white/75 hover:bg-white/15 hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}

function HeritageCoverCard({ item }: { item: HeritageItem }) {
  const excerpt = getHeritagePreviewText(item, { maxChars: 150 });

  const metaBits = [item.maker, item.eraLabel].filter(Boolean);

  return (
    <Link
      href={`/heritage/${item.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-white/15 shadow-soft",
        "transition hover:-translate-y-[1px] hover:border-white/25 hover:shadow-soft-card",
      )}
    >
      <div className="relative aspect-[16/11] w-full">
        <picture>
          <source media="(min-width: 768px)" srcSet={HOME_HERO_DESKTOP} />
          <img
            src={HOME_HERO_MOBILE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </picture>
        {/* overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/75" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-[10px] tracking-[0.22em] text-white/70">HERITAGE</p>
        <h3 className="serif-heading mt-2 line-clamp-2 text-[17px] text-white sm:text-[18px]">
          {item.title}
        </h3>

        {excerpt ? (
          <p className="mt-3 line-clamp-3 text-[12.5px] text-white/80">
            {excerpt}
          </p>
        ) : null}

        {metaBits.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {metaBits.map((t) => (
              <span
                key={t as string}
                className="rounded-full border border-white/18 bg-black/20 px-3 py-1 text-[10px] tracking-[0.18em] text-white/75 backdrop-blur"
              >
                {t as string}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.22em] text-white/60">
            READ
          </span>
          <span className="text-[12px] text-[#0ABAB5]">読む →</span>
        </div>
      </div>
    </Link>
  );
}

export default async function HeritageIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const all = await getAllHeritage();

  // Filters
  const q = parseQuery(searchParams.q);
  const maker = parseQuery(searchParams.maker);
  const era = parseQuery(searchParams.era);

  const makers = uniqueSorted(all.map(getMaker).filter(Boolean) as string[]);
  const eras = uniqueSorted(all.map(getEraLabel).filter(Boolean) as string[]);

  const filtered = applyFilters(all, q, maker, era);

  // Paging
  const perPage = 12;
  const page = parseIntSafe(parseQuery(searchParams.page) || "1", 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  const heroPick = pickCoverImage(all[0]?.heroImage);

  const breadcrumbData = [
    { label: "HOME", href: "/" },
    { label: "HERITAGE" },
  ];

  const baseParams = { q, maker, era };

  return (
    <main className="relative">
      {/* Fixed background (Detail と同じ見え方に寄せる) */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={heroPick}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/80" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.60)_70%,rgba(0,0,0,0.78)_100%)]" />
      </div>

      {/* Header */}
      <section className="page-shell pt-24 sm:pt-28">
        <Breadcrumb items={breadcrumbData} tone="light" />

        <div className="mt-8 max-w-[860px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] tracking-[0.18em] text-white/75 backdrop-blur">
            HERITAGE
          </div>
        </div>

        <ArchiveEntrance
          n="02"
          title="HERITAGE"
          subtitle="Turning points"
          lead="時代の転換点を、静かに記録する。"
          href="/heritage"
          active="heritage"
        />

        <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* Search / Filters (Glass) */}
      <section className="page-shell pb-10 pt-10">
        <details className="group rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4",
              "[&::-webkit-details-marker]:hidden",
              "px-6 py-5 sm:px-8",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ABAB5]/40",
            )}
          >
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.22em] text-white/70">SEARCH</p>
              <p className="mt-2 line-clamp-2 text-[12.5px] text-white/80">
                {q || maker || era
                  ? `${q ? `\"${q}\"` : ""}${q && (maker || era) ? " / " : ""}${maker || ""}${maker && era ? " / " : ""}${era || ""}`
                  : "タップして検索・絞り込み"}
              </p>
            </div>

            <div className="shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10",
                  "px-4 py-2 text-[10px] tracking-[0.22em] text-white/80",
                  "transition group-open:bg-white/15",
                )}
              >
                FILTER
                <span className="transition-transform group-open:rotate-180">▾</span>
              </span>
            </div>
          </summary>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <form action="/heritage" method="get" className="space-y-5">
              <div>
                <label className="block text-[11px] tracking-[0.22em] text-white/70">
                  キーワード
                </label>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="例：V10 / SUV / フェラーリ / ハイブリッド"
                  className={cn(
                    "mt-2 w-full rounded-full border border-white/20 bg-white/10 px-5 py-3",
                    "text-[13px] text-white placeholder:text-white/45",
                    "focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/40",
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-[11px] tracking-[0.22em] text-white/70">
                    MAKER
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <GlassChipLink
                      href={buildHref("/heritage", { ...baseParams, maker: "", page: "" })}
                      label="ALL"
                      active={!maker}
                    />
                    {makers.map((m) => (
                      <GlassChipLink
                        key={m}
                        href={buildHref("/heritage", { ...baseParams, maker: m, page: "" })}
                        label={m}
                        active={maker === m}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.22em] text-white/70">
                    ERA
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <GlassChipLink
                      href={buildHref("/heritage", { ...baseParams, era: "", page: "" })}
                      label="ALL"
                      active={!era}
                    />
                    {eras.map((e) => (
                      <GlassChipLink
                        key={e}
                        href={buildHref("/heritage", { ...baseParams, era: e, page: "" })}
                        label={e}
                        active={era === e}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <p className="text-[11px] tracking-[0.16em] text-white/65">
                  {filtered.length} stories / page {safePage} of {totalPages}
                </p>

                {(q || maker || era) && (
                  <Link
                    href="/heritage"
                    className="text-[12px] text-[#0ABAB5] hover:underline"
                  >
                    フィルタをクリア
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className={cn(
                      "rounded-full border border-white/20 bg-white/20 px-5 py-3",
                      "text-[11px] font-medium tracking-[0.22em] text-white",
                      "transition hover:bg-white/25",
                    )}
                  >
                    SEARCH
                  </button>
                </div>
              </div>
            </form>
          </div>
        </details>
      </section>

      {/* List */}
      <section className="page-shell pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((h) => (
            <HeritageCoverCard key={h.slug} item={h} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-3">
            {safePage > 1 ? (
              <Link
                href={buildHref("/heritage", {
                  ...baseParams,
                  page: String(safePage - 1),
                })}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] text-white/80 hover:bg-white/15 hover:text-white"
              >
                Prev
              </Link>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] text-white/35">
                Prev
              </span>
            )}

            <span className="text-[12px] text-white/70">
              {safePage} / {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={buildHref("/heritage", {
                  ...baseParams,
                  page: String(safePage + 1),
                })}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] text-white/80 hover:bg-white/15 hover:text-white"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] text-white/35">
                Next
              </span>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}