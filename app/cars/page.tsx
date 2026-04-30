import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArchivePagination } from "@/components/archive/ArchivePagination";
import { CarCard } from "@/components/cars/CarCard";
import { CarsFilterAutoApply } from "@/components/cars/CarsFilterAutoApply";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars, type CarItem } from "@/lib/cars";
import { EDITORIAL_ASSETS, getEditorialCarCardImageBySlug, getEditorialCarImageBySlug } from "@/lib/editorial-assets";
import { hasRealEditorialImage, resolveEditorialImage } from "@/lib/editorial-media";
import { pickExistingLocalPublicAssetPath } from "@/lib/public-assets";

import {
  buildMakerInfos,
  normalizeMakerParamToKey,
  resolveMakerLabel,
} from "@/lib/taxonomy/makers";
import { normalizeBodyTypeLabel, normalizeBodyTypeParam } from "@/lib/taxonomy/body-types";
import { normalizeSegmentLabel } from "@/lib/taxonomy/segments";

type SearchParams = {
  q?: string | string[];
  maker?: string | string[];
  bodyType?: string | string[];
  segment?: string | string[];
  sort?: string | string[];
  minYear?: string | string[];
  maxYear?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  priceBand?: string | string[];
  page?: string | string[];
  perPage?: string | string[];
  view?: string | string[];
  includeNoindex?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

type ExtendedCarItem = CarItem & {
  minYear?: number;
  maxYear?: number;
  minPriceYen?: number;
  maxPriceYen?: number;
  priceBand?: string;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = "車種検索｜メーカー・年式・価格帯から探す";
  const description =
    "メーカー・ボディタイプ・セグメント・年式・価格帯などの条件で絞り込み、候補車種を見比べる車種一覧。";
  const canonical = `${getSiteUrl()}/cars`;

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

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseIntegerOrUndefined(raw: string): number | undefined {
  const v = Number.parseInt(raw, 10);
  if (Number.isNaN(v)) return undefined;
  return v;
}

function mapSortLabel(key: string): string {
  switch (key) {
    case "name":
      return "車名順";
    case "maker":
      return "メーカー順";
    case "newest":
      return "新しい年式順";
    case "oldest":
      return "古い年式順";
    default:
      return "おすすめ順";
  }
}

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

function joinMeta(parts: Array<string | number | null | undefined>) {
  return parts
    .map((value) => (typeof value === "number" ? String(value) : value))
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .join(" / ");
}

export default async function CarsPage({ searchParams }: PageProps) {
  const all = (await getAllCars()) as ExtendedCarItem[];

  const includeNoindex = toSingle(searchParams?.includeNoindex).trim() === "1";
  const baseAll: ExtendedCarItem[] = includeNoindex
    ? all
    : all.filter((car) => car.publicState === "index");

  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const makerParamRaw = toSingle(searchParams?.maker).trim();
  const makerKeyFilter = makerParamRaw ? normalizeMakerParamToKey(makerParamRaw) : "";
  const bodyTypeParamRaw = toSingle(searchParams?.bodyType).trim();
  const bodyTypeFilter = bodyTypeParamRaw ? normalizeBodyTypeParam(bodyTypeParamRaw) : "";
  const segmentParamRaw = toSingle(searchParams?.segment).trim();
  const segmentFilter = segmentParamRaw ? normalizeSegmentLabel(segmentParamRaw) : "";
  const sortKey = toSingle(searchParams?.sort).trim();

  const rawMinYear = toSingle(searchParams?.minYear).trim();
  const rawMaxYear = toSingle(searchParams?.maxYear).trim();
  const rawMinPrice = toSingle(searchParams?.minPrice).trim();
  const rawMaxPrice = toSingle(searchParams?.maxPrice).trim();
  const priceBandFilter = toSingle(searchParams?.priceBand).trim();

  const viewRaw = toSingle(searchParams?.view).trim();
  const viewMode: "card" | "list" = viewRaw === "list" ? "list" : "card";

  const perPageRaw = toSingle(searchParams?.perPage).trim();
  const parsedPerPage = parseIntegerOrUndefined(perPageRaw);
  const perPage = parsedPerPage === 24 || parsedPerPage === 48 ? parsedPerPage : 12;

  const pageRaw = toSingle(searchParams?.page).trim();
  const requestedPage = parseIntegerOrUndefined(pageRaw) ?? 1;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
    ],
  };

  const minYear = rawMinYear ? parseIntegerOrUndefined(rawMinYear) : undefined;
  const maxYear = rawMaxYear ? parseIntegerOrUndefined(rawMaxYear) : undefined;

  const minPriceUnit = rawMinPrice ? parseIntegerOrUndefined(rawMinPrice) : undefined;
  const maxPriceUnit = rawMaxPrice ? parseIntegerOrUndefined(rawMaxPrice) : undefined;
  const minPriceYen = minPriceUnit != null ? minPriceUnit * 10000 : undefined;
  const maxPriceYen = maxPriceUnit != null ? maxPriceUnit * 10000 : undefined;

  const makerInfos = buildMakerInfos(baseAll);
  const makerLabelFilter = makerKeyFilter ? resolveMakerLabel(makerKeyFilter, makerInfos) : "";

  const bodyTypes = Array.from(
    new Set(baseAll.map((car) => normalizeBodyTypeLabel(car.bodyType)).filter(Boolean)),
  ).sort((a, b) => String(a).localeCompare(String(b), "ja"));

  const segments = Array.from(
    new Set(baseAll.map((car) => normalizeSegmentLabel(car.segment)).filter(Boolean)),
  ).sort((a, b) => String(a).localeCompare(String(b), "ja"));

  const priceBands = Array.from(
    new Set(
      baseAll
        .map((car) => car.priceBand)
        .filter((band): band is string => typeof band === "string" && band.length > 0),
    ),
  ).sort();

  const filtered = baseAll.filter((car) => {
    if (q) {
      const haystack = [
        car.name ?? "",
        car.maker ?? "",
        car.summary ?? "",
        car.summaryLong ?? "",
        car.bodyType ?? "",
        car.segment ?? "",
        car.grade ?? "",
        car.engine ?? "",
        car.drive ?? "",
        car.fuel ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (makerKeyFilter) {
      const makerKey = normalizeMakerParamToKey(car.makerKey ?? car.maker ?? "");
      if (makerKey !== makerKeyFilter) return false;
    }

    if (bodyTypeFilter && normalizeBodyTypeLabel(car.bodyType) !== bodyTypeFilter) {
      return false;
    }

    if (segmentFilter && normalizeSegmentLabel(car.segment) !== segmentFilter) {
      return false;
    }

    if (minYear != null) {
      const carMinYear = car.minYear ?? car.releaseYear ?? car.maxYear ?? null;
      if (carMinYear != null && carMinYear < minYear) return false;
    }

    if (maxYear != null) {
      const carMaxYear = car.maxYear ?? car.releaseYear ?? car.minYear ?? null;
      if (carMaxYear != null && carMaxYear > maxYear) return false;
    }

    if (minPriceYen != null) {
      const priceMin = car.minPriceYen ?? null;
      if (priceMin != null && priceMin < minPriceYen) return false;
    }

    if (maxPriceYen != null) {
      const priceMax = car.maxPriceYen ?? null;
      if (priceMax != null && priceMax > maxPriceYen) return false;
    }

    if (priceBandFilter && car.priceBand !== priceBandFilter) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered];
  if (sortKey === "name") {
    sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } else if (sortKey === "maker") {
    sorted.sort((a, b) => {
      const makerDiff = (a.maker ?? "").localeCompare(b.maker ?? "");
      if (makerDiff !== 0) return makerDiff;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  } else if (sortKey === "newest") {
    sorted.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));
  } else if (sortKey === "oldest") {
    sorted.sort((a, b) => (a.releaseYear ?? 0) - (b.releaseYear ?? 0));
  }

  const totalFiltered = sorted.length;
  const maxPage = totalFiltered === 0 ? 1 : Math.max(1, Math.ceil(totalFiltered / perPage));
  const currentPage =
    requestedPage < 1 ? 1 : requestedPage > maxPage ? maxPage : requestedPage;
  const startIndex = (currentPage - 1) * perPage;
  const paged = sorted.slice(startIndex, startIndex + perPage);

  const hasFilter =
    Boolean(q) ||
    Boolean(makerKeyFilter) ||
    Boolean(bodyTypeFilter) ||
    Boolean(segmentFilter) ||
    Boolean(sortKey) ||
    Boolean(rawMinYear) ||
    Boolean(rawMaxYear) ||
    Boolean(rawMinPrice) ||
    Boolean(rawMaxPrice) ||
    Boolean(priceBandFilter) ||
    includeNoindex;

  type QuickPreset = {
    label: string;
    href: string;
  };

  const resolveBodyTypeToken = (candidates: string[]): string | null => {
    for (const token of candidates) {
      if (bodyTypes.includes(token)) return token;
    }
    return null;
  };

  const sedanToken = resolveBodyTypeToken(["セダン"]);
  const suvToken = resolveBodyTypeToken(["SUV/クロスオーバー", "SUV"]);
  const coupeToken = resolveBodyTypeToken(["クーペ"]);

  const countBySimpleFilters = (filters: { bodyType?: string }): number =>
    baseAll.filter((car) => {
      if (filters.bodyType && normalizeBodyTypeLabel(car.bodyType) !== filters.bodyType) {
        return false;
      }
      return true;
    }).length;

  const quickPresets: QuickPreset[] = [];

  const pushPreset = (label: string, params: Record<string, string | undefined>) => {
    const count = countBySimpleFilters({ bodyType: params.bodyType });
    if (count <= 0) return;
    quickPresets.push({ label, href: `/cars${buildQueryString({}, params)}` });
  };

  if (sedanToken) pushPreset("セダンだけ", { bodyType: sedanToken });
  if (suvToken) pushPreset("SUVだけ", { bodyType: suvToken });
  if (coupeToken) pushPreset("クーペ/スポーツ", { bodyType: coupeToken });

  const baseQueryParams: Record<string, string | undefined> = {
    q: rawQ || undefined,
    maker: makerKeyFilter || undefined,
    bodyType: bodyTypeFilter || undefined,
    segment: segmentFilter || undefined,
    sort: sortKey || undefined,
    minYear: rawMinYear || undefined,
    maxYear: rawMaxYear || undefined,
    minPrice: rawMinPrice || undefined,
    maxPrice: rawMaxPrice || undefined,
    priceBand: priceBandFilter || undefined,
    perPage: perPageRaw || undefined,
    view: viewRaw || undefined,
    includeNoindex: includeNoindex ? "1" : undefined,
  };

  const heroCar =
    baseAll.find((car) => hasRealEditorialImage(car.heroImage ?? car.mainImage ?? null)) ??
    baseAll.find((car) => pickExistingLocalPublicAssetPath(car.heroImage ?? car.mainImage ?? null, null)) ??
    baseAll[0] ??
    null;
  const topMakers = makerInfos.slice(0, 6);

  const featuredCars = paged.slice(0, 3);
  const leadCar = featuredCars[0] ?? null;
  const secondaryCars = featuredCars.slice(1);
  const gridCars = paged.slice(3);

  const activeFilterLinks = [
    q
      ? { label: `検索: ${rawQ}`, href: buildQueryString(baseQueryParams, { q: "", page: "1" }) }
      : null,
    makerKeyFilter
      ? {
          label: `メーカー: ${makerLabelFilter}`,
          href: buildQueryString(baseQueryParams, { maker: "", page: "1" }),
        }
      : null,
    bodyTypeFilter
      ? {
          label: `ボディ: ${bodyTypeFilter}`,
          href: buildQueryString(baseQueryParams, { bodyType: "", page: "1" }),
        }
      : null,
    segmentFilter
      ? {
          label: `用途: ${segmentFilter}`,
          href: buildQueryString(baseQueryParams, { segment: "", page: "1" }),
        }
      : null,
    rawMinYear || rawMaxYear
      ? {
          label: `年式: ${rawMinYear || "–"}〜${rawMaxYear || "–"}`,
          href: buildQueryString(baseQueryParams, { minYear: "", maxYear: "", page: "1" }),
        }
      : null,
    rawMinPrice || rawMaxPrice
      ? {
          label: `価格: ${rawMinPrice || "–"}〜${rawMaxPrice || "–"}万円`,
          href: buildQueryString(baseQueryParams, { minPrice: "", maxPrice: "", page: "1" }),
        }
      : null,
    priceBandFilter
      ? {
          label: `価格帯: ${priceBandFilter}`,
          href: buildQueryString(baseQueryParams, { priceBand: "", page: "1" }),
        }
      : null,
    sortKey
      ? {
          label: `並び: ${mapSortLabel(sortKey)}`,
          href: buildQueryString(baseQueryParams, { sort: "", page: "1" }),
        }
      : null,
    perPage !== 12
      ? {
          label: `${perPage}件表示`,
          href: buildQueryString(baseQueryParams, { perPage: "", page: "1" }),
        }
      : null,
    viewMode === "list"
      ? {
          label: "リスト表示",
          href: buildQueryString(baseQueryParams, { view: "", page: "1" }),
        }
      : null,

  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-cars-index-breadcrumb" data={breadcrumbData} />

      {(() => {
        const heroSeed = heroCar?.slug || "cars-archive";
        const heroEditorialImage = getEditorialCarImageBySlug(heroCar?.slug);
        const heroCandidate = (heroEditorialImage ?? heroCar?.heroImage ?? heroCar?.mainImage ?? "").trim();
        const resolved = resolveEditorialImage(
          heroCandidate || EDITORIAL_ASSETS.homeHero,
          "car",
          "desktop",
          heroSeed,
        );

        return (
          <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden bg-[#0d0b0a] lg:min-h-[calc(100svh-72px)]">
            <Image
              src={resolved.src}
              alt={heroCar ? `${heroCar.maker} ${heroCar.name}` : "車種一覧"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "50% 42%" }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,18,16,0.06)_0%,rgba(21,18,16,0.1)_34%,rgba(21,18,16,0.24)_66%,rgba(21,18,16,0.54)_100%)]" />
            <div className="absolute inset-0 [background:radial-gradient(circle_at_top_left,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_36%)]" />

            <div className="page-shell relative flex min-h-[calc(100svh-64px)] flex-col items-center pb-10 pt-24 text-center sm:pb-12 sm:pt-28 lg:min-h-[calc(100svh-72px)] lg:pb-16 lg:pt-32">
              <Breadcrumb
                items={[{ label: "ホーム", href: "/" }, { label: "車種" }]}
                tone="light"
                className="justify-center text-white/70"
              />

              <div className="mt-auto w-full max-w-[44rem] text-white">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/78 sm:text-[12px]">
                  車種一覧
                </p>
                <h1 className="mt-3 text-[46px] font-semibold leading-[0.98] tracking-[-0.068em] text-white sm:text-[62px] lg:text-[82px]">
                  車種一覧
                </h1>
                <p className="mt-5 mx-auto max-w-[34rem] text-[15px] leading-[1.88] text-white/84 sm:text-[16px] lg:text-[18px]">
                  メーカー・ボディタイプ・年式・価格帯で絞り込めます。
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    { href: "/cars/makers", label: "メーカー別" },
                    { href: "/cars/body-types", label: "ボディ別" },
                    { href: "/cars/segments", label: "用途別" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center rounded-full border border-white/22 bg-white/[0.06] px-4 py-2 text-[12px] font-medium tracking-[0.08em] text-white/86 backdrop-blur-sm transition hover:bg-white/[0.1]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <div className="page-shell pb-24 pt-14">
        <section className="mt-12">
          <div className="cb-panel p-5 sm:p-6">
            <p className="cb-kicker">絞り込み</p>
            <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[30px]">
              条件で絞り込む
            </h2>

            <form id="cars-filter-form" method="get" action="/cars" className="mt-6 space-y-6">
              <input type="hidden" name="sort" value={sortKey} disabled={!sortKey} />
              <input type="hidden" name="view" value="list" disabled={viewMode !== "list"} />
              {includeNoindex ? <input type="hidden" name="includeNoindex" value="1" /> : null}

              <div>
                <label htmlFor="cars-q" className="cb-field-label">
                  キーワード
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(14,12,10,0.44)]">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="M8.5 2.5a6 6 0 104.02 10.46l3.26 3.26a.75.75 0 101.06-1.06l-3.26-3.26A6 6 0 008.5 2.5zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>

                  <input
                    id="cars-q"
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="車名、メーカー、用途など"
                    className="w-full rounded-full border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] py-3 pl-11 pr-24 text-[14px] leading-[1.6] text-[var(--text-primary)] outline-none transition focus:border-[rgba(27,63,229,0.55)] focus:bg-[rgba(251,248,243,1)] focus:shadow-[0_0_0_4px_rgba(27,63,229,0.08)]"
                  />

                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 items-center justify-center rounded-full bg-[var(--text-primary)] px-5 text-[12px] font-semibold tracking-[0.16em] text-[var(--surface-1)] transition hover:opacity-92"
                  >
                    検索
                  </button>
                </div>
              </div>

              <div>
                <p className="cb-field-label">並び替え</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "", label: mapSortLabel("") },
                    { key: "newest", label: mapSortLabel("newest") },
                    { key: "oldest", label: mapSortLabel("oldest") },
                    { key: "maker", label: mapSortLabel("maker") },
                    { key: "name", label: mapSortLabel("name") },
                  ].map((opt) => (
                    <Link
                      key={opt.key || "default"}
                      href={`/cars${buildQueryString(baseQueryParams, {
                        sort: opt.key ? opt.key : undefined,
                        page: "1",
                      })}`}
                      rel="nofollow"
                      className="cb-chip"
                      data-active={sortKey === opt.key ? "true" : "false"}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="cb-field-label">表示</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/cars${buildQueryString(baseQueryParams, { view: undefined, page: "1" })}`}
                    rel="nofollow"
                    className="cb-chip"
                    data-active={viewMode === "card" ? "true" : "false"}
                  >
                    カード
                  </Link>
                  <Link
                    href={`/cars${buildQueryString(baseQueryParams, { view: "list", page: "1" })}`}
                    rel="nofollow"
                    className="cb-chip"
                    data-active={viewMode === "list" ? "true" : "false"}
                  >
                    リスト
                  </Link>
                </div>
              </div>

              <details
                className="cb-panel-muted p-4"
                open={Boolean(
                  makerKeyFilter ||
                    bodyTypeFilter ||
                    segmentFilter ||
                    rawMinYear ||
                    rawMaxYear ||
                    rawMinPrice ||
                    rawMaxPrice ||
                    priceBandFilter ||
                    (perPage !== 12 ? true : false),
                )}
              >
                <summary className="list-none cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-secondary)]">
                      詳細条件
                    </span>
                    <span className="cb-link-subtle text-[12px]">開く / 閉じる</span>
                  </div>
                </summary>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="cars-maker" className="cb-field-label">
                      メーカー
                    </label>
                    <select id="cars-maker" name="maker" defaultValue={makerKeyFilter} className="cb-select">
                      <option value="">すべて</option>
                      {makerInfos.map((maker) => (
                        <option key={maker.key} value={maker.key}>
                          {maker.label} ({maker.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cars-body" className="cb-field-label">
                      ボディタイプ
                    </label>
                    <select id="cars-body" name="bodyType" defaultValue={bodyTypeFilter} className="cb-select">
                      <option value="">すべて</option>
                      {bodyTypes.map((bodyType) => (
                        <option key={bodyType} value={bodyType}>
                          {bodyType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cars-segment" className="cb-field-label">
                      用途・価格帯
                    </label>
                    <select id="cars-segment" name="segment" defaultValue={segmentFilter} className="cb-select">
                      <option value="">すべて</option>
                      {segments.map((segment) => (
                        <option key={segment} value={segment}>
                          {segment}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cars-per-page" className="cb-field-label">
                      表示件数
                    </label>
                    <select
                      id="cars-per-page"
                      name="perPage"
                      defaultValue={perPage === 24 ? "24" : perPage === 48 ? "48" : ""}
                      className="cb-select"
                    >
                      <option value="">1ページあたり12件</option>
                      <option value="24">1ページあたり24件</option>
                      <option value="48">1ページあたり48件</option>
                    </select>
                  </div>

                  <div>
                    <span className="cb-field-label">年式</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        name="minYear"
                        defaultValue={rawMinYear}
                        placeholder="最小"
                        className="cb-input"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        name="maxYear"
                        defaultValue={rawMaxYear}
                        placeholder="最大"
                        className="cb-input"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="cb-field-label">価格帯（万円）</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        name="minPrice"
                        defaultValue={rawMinPrice}
                        placeholder="最小"
                        className="cb-input"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        name="maxPrice"
                        defaultValue={rawMaxPrice}
                        placeholder="最大"
                        className="cb-input"
                      />
                    </div>
                    {priceBands.length > 0 ? (
                      <select name="priceBand" defaultValue={priceBandFilter} className="cb-select mt-3">
                        <option value="">価格帯指定なし</option>
                        {priceBands.map((band) => (
                          <option key={band} value={band}>
                            {band}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              </details>

              {hasFilter ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href="/cars" className="cb-link-subtle text-[12px]">
                    条件をリセット
                  </Link>
                </div>
              ) : null}
            </form>

            <CarsFilterAutoApply formId="cars-filter-form" />

            {quickPresets.length > 0 ? (
              <div className="mt-6">
                <p className="cb-field-label">おすすめ条件</p>
                <div className="flex flex-wrap gap-2">
                  {quickPresets.map((preset) => (
                    <Link key={preset.href} href={preset.href} rel="nofollow" className="cb-chip">
                      {preset.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {topMakers.length > 0 ? (
              <div className="mt-6">
                <p className="cb-field-label">主要メーカー</p>
                <div className="flex flex-wrap gap-2">
                  {topMakers.map((maker) => (
                    <Link
                      key={maker.key}
                      href={`/cars${buildQueryString({}, { maker: maker.key })}`}
                      rel="nofollow"
                      className="cb-chip"
                    >
                      {maker.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {activeFilterLinks.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {activeFilterLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                rel="nofollow"
                className="rounded-full border border-[rgba(14,12,10,0.08)] bg-[rgba(251,248,243,0.9)] px-3 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[rgba(27,63,229,0.3)] hover:text-[var(--accent-strong)]"
              >
                {item.label} ×
              </Link>
            ))}
          </div>
        ) : null}

        <section className="mt-12" aria-label="車種一覧">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="cb-kicker">一覧</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[38px]">
                検索結果
              </h2>
            </div>
          </div>

          {totalFiltered === 0 ? (
            <div className="cb-panel p-8 text-center text-[14px] leading-[1.9] text-[var(--text-secondary)]">
              条件に合う車種が見つかりませんでした。キーワードを減らすか、年式や価格帯を少し広げると近い候補が出ます。
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-3">
              {paged.map((car) => (
                <div key={car.id} id={`car-${car.slug}`}>
                  <ContentRowCard
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                    title={`${car.maker} ${car.name}`.trim()}
                    excerpt={
                      joinMeta([car.bodyType, car.segment, car.drive])
                        ? `${joinMeta([car.bodyType, car.segment, car.drive])} — ${
                            car.summary ?? "この車種についての詳細なインプレッションは順次追加予定です。"
                          }`
                        : car.summary ?? "この車種についての詳細なインプレッションは順次追加予定です。"
                    }
                    imageSrc={getEditorialCarCardImageBySlug(car.slug) ?? car.heroImage ?? car.mainImage ?? null}
                    badge={car.maker}
                    badgeTone="accent"
                    date={car.releaseYear ? `${car.releaseYear}年頃` : null}
                    seedKey={car.slug}
                    posterVariant="car"
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              {leadCar ? (
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <CarCard car={leadCar} shelfId="cars_index_feature" layout="feature" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {secondaryCars.map((car) => (
                      <CarCard key={car.slug} car={car} shelfId="cars_index_secondary" />
                    ))}
                  </div>
                </div>
              ) : null}

              {gridCars.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {gridCars.map((car) => (
                    <CarCard
                      key={car.slug}
                      car={car}
                      shelfId="cars_index_grid"
                      layout="standard"
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}

          <ArchivePagination
            currentPage={currentPage}
            totalPages={maxPage}
            hrefForPage={(page) => `/cars${buildQueryString(baseQueryParams, { page: String(page) })}`}
            className="mt-10"
          />
        </section>
      </div>
    </main>
  );
}
