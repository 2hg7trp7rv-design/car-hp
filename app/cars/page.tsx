// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { CompareAddButton } from "@/components/compare/CompareAddButton";
import { CarsFilterAutoApply } from "@/components/cars/CarsFilterAutoApply";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars, type CarItem } from "@/lib/cars";
import { ENABLE_CAR_IMAGES } from "@/lib/features";

import {
  buildMakerInfos,
  normalizeMakerParamToKey,
  resolveMakerLabel,
} from "@/lib/taxonomy/makers";
import { normalizeBodyTypeLabel, normalizeBodyTypeParam } from "@/lib/taxonomy/body-types";
import { normalizeSegmentLabel } from "@/lib/taxonomy/segments";
import { ArchiveEntrance } from "@/components/experience/ArchiveEntrance";


export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const title = "CARS｜車種データベース（条件検索）";
  const description =
    "メーカー・ボディタイプ・セグメント・年式・価格帯などの条件で絞り込み、候補車種を比較しやすくする車種データベース。";
  const canonical = `${getSiteUrl()}/cars`;

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
    // noindex は googleBot も明示的に noindex にする。
    robots: hasParams ? NOINDEX_ROBOTS : undefined,
  };
}


// 既存CarItemを拡張して年式レンジ/価格レンジ/価格帯を持てるようにしておく
// 実データ側は後から対応していく前提で全部optional
type ExtendedCarItem = CarItem & {
  minYear?: number;
  maxYear?: number;
  minPriceYen?: number;
  maxPriceYen?: number;
  priceBand?: string;
};

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

// 文字列を小文字トリム
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

// string | string[] を安全に1つの string にするヘルパー
function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseIntegerOrUndefined(raw: string): number | undefined {
  const v = Number.parseInt(raw, 10);
  if (Number.isNaN(v)) return undefined;
  return v;
}


// ソートラベル
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


// クエリストリング生成ヘルパー(ページネーションやVIEW切替用)
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

export default async function CarsPage({ searchParams }: PageProps) {
  // データ取得
  const all = (await getAllCars()) as ExtendedCarItem[];

  // 主要導線は index のみ（準備中は明示的にトグルしたときだけ表示）
  const includeNoindex = toSingle(searchParams?.includeNoindex).trim() === "1";
  const baseAll: ExtendedCarItem[] = includeNoindex
    ? all
    : all.filter((c) => c.publicState === "index");

  // searchParams の生値をすべて toSingle() で安全に文字列化
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
  const perPage =
    parsedPerPage === 24 || parsedPerPage === 48 ? parsedPerPage : 12;

  const pageRaw = toSingle(searchParams?.page).trim();
  const requestedPage = parseIntegerOrUndefined(pageRaw) ?? 1;

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
        name: "CARS",
        item: `${getSiteUrl()}/cars`,
      },
    ],
  };

  const minYear = rawMinYear ? parseIntegerOrUndefined(rawMinYear) : undefined;
  const maxYear = rawMaxYear ? parseIntegerOrUndefined(rawMaxYear) : undefined;

  const minPriceUnit = rawMinPrice
    ? parseIntegerOrUndefined(rawMinPrice)
    : undefined; // 万円単位
  const maxPriceUnit = rawMaxPrice
    ? parseIntegerOrUndefined(rawMaxPrice)
    : undefined;

  const minPriceYen =
    minPriceUnit != null ? minPriceUnit * 10000 : undefined;
  const maxPriceYen =
    maxPriceUnit != null ? maxPriceUnit * 10000 : undefined;

  const makerInfos = buildMakerInfos(baseAll);
  const makerLabelFilter = makerKeyFilter ? resolveMakerLabel(makerKeyFilter, makerInfos) : "";

  const bodyTypes = Array.from(
    new Set(baseAll.map((c) => normalizeBodyTypeLabel(c.bodyType)).filter(Boolean)),
  ).sort((a, b) => String(a).localeCompare(String(b), "ja"));

  const segments = Array.from(
    new Set(baseAll.map((c) => normalizeSegmentLabel(c.segment)).filter(Boolean)),
  ).sort((a, b) => String(a).localeCompare(String(b), "ja"));

  const priceBands = Array.from(
    new Set(
      baseAll
        .map((c) => c.priceBand)
        .filter((b): b is string => typeof b === "string" && b.length > 0),
    ),
  ).sort();

  // フィルタ
  const filtered = baseAll.filter((car) => {
    if (q) {
      const haystack = [
        car.name ?? "",
        car.maker ?? "",
        normalizeSegmentLabel(car.segment) ?? "",
        normalizeBodyTypeLabel(car.bodyType) ?? "",
        car.segment ?? "",
        car.bodyType ?? "",
        car.summary ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (makerKeyFilter && car.makerKey !== makerKeyFilter) return false;

    if (bodyTypeFilter && normalizeBodyTypeLabel(car.bodyType) !== bodyTypeFilter) return false;
    if (segmentFilter && normalizeSegmentLabel(car.segment) !== segmentFilter) return false;

    // 年式レンジフィルタ
    if (minYear != null || maxYear != null) {
      const carMinYear = car.minYear ?? car.releaseYear ?? undefined;
      const carMaxYear = car.maxYear ?? car.releaseYear ?? undefined;

      if (minYear != null && carMaxYear != null && carMaxYear < minYear) {
        return false;
      }
      if (maxYear != null && carMinYear != null && carMinYear > maxYear) {
        return false;
      }
    }

    // 価格レンジフィルタ
    if (minPriceYen != null || maxPriceYen != null) {
      const carMinPrice = car.minPriceYen;
      const carMaxPrice = car.maxPriceYen;

      if (
        minPriceYen != null &&
        carMaxPrice != null &&
        carMaxPrice < minPriceYen
      ) {
        return false;
      }
      if (
        maxPriceYen != null &&
        carMinPrice != null &&
        carMinPrice > maxPriceYen
      ) {
        return false;
      }
    }

    // 価格帯バンドフィルタ
    if (priceBandFilter && car.priceBand !== priceBandFilter) {
      return false;
    }

    return true;
  });

  // ソート適用
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
  // sortKey が空のときは登録順（all の順）を維持

  const totalModelsAll = all.length;
  const totalModels = baseAll.length;
  const totalFiltered = sorted.length;

  // ページング
  const maxPage =
    totalFiltered === 0
      ? 1
      : Math.max(1, Math.ceil(totalFiltered / perPage));
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

  const filterSummaryText = (() => {
    const parts: string[] = [];

    if (q) parts.push(`「${rawQ || q}」`);
    if (makerLabelFilter) parts.push(makerLabelFilter);
    if (bodyTypeFilter) parts.push(bodyTypeFilter);
    if (segmentFilter) parts.push(segmentFilter);

    if (minYear != null || maxYear != null) {
      parts.push(`${minYear ?? "----"}〜${maxYear ?? "----"}`);
    }
    if (minPriceUnit != null || maxPriceUnit != null) {
      parts.push(`${minPriceUnit ?? "----"}〜${maxPriceUnit ?? "----"}万円`);
    }
    if (priceBandFilter) parts.push(`価格帯:${priceBandFilter}`);

    if (sortKey) parts.push(mapSortLabel(sortKey));
    if (perPage !== 12) parts.push(`${perPage}件/ページ`);
    if (viewMode === "list") parts.push("LIST表示");

    if (includeNoindex) parts.push("準備中も表示");

    return parts.join(" / ") || "タップして検索・絞り込み";
  })();

  // インデックス用の簡易統計（世界観重視で“難易度”は表示しない）
  const sedanCount = baseAll.filter((c) => {
    const bt = (c.bodyType ?? "").toLowerCase();
    return bt.includes("セダン") || bt.includes("sedan");
  }).length;

  const suvCount = baseAll.filter((c) => {
    const bt = (c.bodyType ?? "").toLowerCase();
    return bt.includes("suv") || bt.includes("クロスオーバ") || bt.includes("crossover");
  }).length;

  // QUICK PRESET（0件になる組み合わせは出さない）
  type QuickPreset = {
    label: string;
    href: string;
    className: string;
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
    baseAll.filter((c) => {
      if (filters.bodyType && normalizeBodyTypeLabel(c.bodyType) !== filters.bodyType) return false;
      return true;
    }).length;

  const quickPresets: QuickPreset[] = [];

  const pushPreset = (
    label: string,
    params: Record<string, string | undefined>,
    className: string,
  ) => {
    const bodyType = params.bodyType;

    const count = countBySimpleFilters({ bodyType });
    if (count <= 0) return;

    const href = `/cars${buildQueryString({}, params)}`;
    quickPresets.push({ label, href, className });
  };

  if (sedanToken) {
    pushPreset(
      "セダンだけ",
      { bodyType: sedanToken },
      "inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] transition hover:border-[#0ABAB5]/35",
    );
  }

  if (suvToken) {
    pushPreset(
      "SUVだけ",
      { bodyType: suvToken },
      "inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] transition hover:border-[#0ABAB5]/35",
    );
  }

  if (coupeToken) {
    pushPreset(
      "クーペ/スポーツ",
      { bodyType: coupeToken },
      "inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#222222] transition hover:border-[#0ABAB5]/35",
    );
  }

  const quickPresetsFinal = quickPresets.slice(0, 3);


  // ページネーションやVIEW切替で使う共通クエリ
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

  const paginationBaseParams = {
    ...baseQueryParams,
    page: undefined,
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-cars-index-breadcrumb" data={breadcrumbData} />
      <div className="page-shell pb-32 pt-24">
        {/* top */}
        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "CARS" }]} />
        </div>

        <ArchiveEntrance
          n="01"
          title="CARS"
          subtitle="Symbols of an era"
          lead="車を“スペック”ではなく、時代の記号として読む。"
          href="/cars"
          active="cars"
        />

        {/* 絞り込みフォーム        {/* 絞り込みフォーム（開閉式） */}
        <Reveal delay={200}>
          <section className="mx-auto mt-10 max-w-5xl rounded-2xl border border-[#222222]/10 bg-white shadow-soft">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">SEARCH</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-[#222222]/70">{filterSummaryText}</p>
                  <p className="mt-1 text-[10px] text-[#222222]/45">
                    {totalFiltered.toLocaleString()} models / page {currentPage} of {maxPage}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#222222]/12 bg-[#222222]/5 px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222]/70 transition group-open:bg-[#222222]/10">
                  FILTER
                  <span className="text-[#222222]/55 transition-transform group-open:rotate-180">▾</span>
                </span>
              </summary>

              <div className="px-6 pb-6">
<form id="cars-filter-form" method="get" action="/cars" className="space-y-4 text-xs sm:text-[11px]">
              {/* 1段目 基本フィルタ */}
              <div className="grid gap-3 md:grid-cols-4">
                {/* キーワード */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="車名メーカーセグメントなどのキーワード"
                    className="mt-1 w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                  />
                </div>

                {/* メーカー */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerKeyFilter}
                    className="mt-1 w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                  >
                    <option value="">すべて</option>
                    {makerInfos.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ボディタイプ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    BODY TYPE
                  </label>
                  <select
                    name="bodyType"
                    defaultValue={bodyTypeFilter}
                    className="mt-1 w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                  >
                    <option value="">すべて</option>
                    {bodyTypes.map((bt) => (
                      <option key={bt} value={bt ?? ""}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* セグメント */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    SEGMENT
                  </label>
                  <select
                    name="segment"
                    defaultValue={segmentFilter}
                    className="mt-1 w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                  >
                    <option value="">すべて</option>
                    {segments.map((seg) => (
                      <option key={seg} value={seg ?? ""}>
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2段目 難易度/年式/価格/SORT+ROWS */}
              <div className="grid gap-3 md:grid-cols-4">

                {/* 年式レンジ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    MODEL YEAR RANGE
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      name="minYear"
                      defaultValue={rawMinYear}
                      placeholder="最小"
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      name="maxYear"
                      defaultValue={rawMaxYear}
                      placeholder="最大"
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#222222]/55">例:2010〜2018の範囲で絞り込む想定</p>
                </div>

                {/* 価格レンジ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    PRICE RANGE
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      name="minPrice"
                      defaultValue={rawMinPrice}
                      placeholder="最小"
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      name="maxPrice"
                      defaultValue={rawMaxPrice}
                      placeholder="最大"
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#222222]/55">単位は万円想定(例:300〜600)</p>
                  {priceBands.length > 0 && (
                    <div className="mt-2">
                      <select
                        name="priceBand"
                        defaultValue={priceBandFilter}
                        className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                      >
                        <option value="">価格帯指定なし</option>
                        {priceBands.map((band) => (
                          <option key={band} value={band}>
                            {band}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* SORT + ROWS */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">
                    SORT/ROWS
                  </label>
                  <div className="mt-1 space-y-2">
                    <select
                      name="sort"
                      defaultValue={sortKey}
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    >
                      <option value="">{mapSortLabel("")}</option>
                      <option value="name">{mapSortLabel("name")}</option>
                      <option value="maker">{mapSortLabel("maker")}</option>
                      <option value="newest">{mapSortLabel("newest")}</option>
                      <option value="oldest">{mapSortLabel("oldest")}</option>
                    </select>
                    <select
                      name="perPage"
                      defaultValue={perPage === 24 ? "24" : perPage === 48 ? "48" : ""}
                      className="w-full rounded-2xl border border-[#222222]/12 bg-white px-3 py-2 text-xs text-[#222222] outline-none ring-0 transition focus:border-[#0ABAB5]/45"
                    >
                      <option value="">1ページあたり12件(標準)</option>
                      <option value="24">1ページあたり24件</option>
                      <option value="48">1ページあたり48件</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NOTEとクイックプリセット */}
              <div className="mt-1 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.22em] text-[#222222]/55">NOTE</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#222222]/55">
                    将来的にはここからさらに年式細分化やボディサイズなど
                    もう少し細かい条件を追加していく前提
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 text-[10px] text-[#222222]/55">
                  <p className="font-medium tracking-[0.22em] text-[#222222]/55">QUICK PRESET</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPresetsFinal.map((p) => (
                      <Link key={p.href} href={p.href} rel="nofollow" className={p.className}>
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>


              {/* データ整備中(noindex)の車種を含める */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-[#222222]/55">
                <input
                  id="includeNoindex"
                  name="includeNoindex"
                  type="checkbox"
                  value="1"
                  defaultChecked={includeNoindex}
                  className="h-4 w-4 rounded border-[#222222]/20"
                />
                <label htmlFor="includeNoindex" className="cursor-pointer select-none">
                  準備中の車種も表示する（データ整備中のページを含みます）
                </label>
              </div>
              {/* ボタン */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] text-[#222222]/55">
                  <span className="font-medium tracking-[0.22em] text-[#222222]/55">VIEW MODE</span>
                  <div className="inline-flex rounded-full bg-[#222222]/5 p-1">
                    <Link
                      href={buildQueryString(baseQueryParams, { view: "card", page: "1" })}
                      rel="nofollow"
                      className={`rounded-full px-3 py-1 text-[10px] tracking-[0.16em] ${
                        viewMode === "card"
                          ? "bg-white text-[#222222] shadow-soft"
                          : "text-[#222222]/55 hover:text-[#222222]"
                      }`}
                    >
                      CARD
                    </Link>
                    <Link
                      href={buildQueryString(baseQueryParams, { view: "list", page: "1" })}
                      rel="nofollow"
                      className={`rounded-full px-3 py-1 text-[10px] tracking-[0.16em] ${
                        viewMode === "list"
                          ? "bg-white text-[#222222] shadow-soft"
                          : "text-[#222222]/55 hover:text-[#222222]"
                      }`}
                    >
                      LIST
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasFilter && (
                    <Link href="/cars" className="text-[10px] tracking-[0.16em] text-[#222222]/55 hover:text-[#222222]/70">
                      CLEAR
                    </Link>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    magnetic
                    className="rounded-full px-5 py-2 text-[11px] tracking-[0.2em]"
                  >
                    絞り込み
                  </Button>
                </div>
              </div>
            </form>

            {/* JSが有効な環境では、入力変更だけで反映（モバイルでの“クリックだけ”運用を強化） */}
            <CarsFilterAutoApply formId="cars-filter-form" />
              </div>
            </details>
          </section>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {(hasFilter || viewMode === "list" || perPage !== 12) && (
          <Reveal delay={230}>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-[#222222]/5 px-2 py-0.5 text-[#222222]/55">ACTIVE FILTERS</span>
              {q && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  keyword:
                  <span className="ml-1 font-semibold">“{rawQ}”</span>
                </span>
              )}
              {makerKeyFilter && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  maker:
                  <span className="ml-1 font-semibold">{makerLabelFilter}</span>
                </span>
              )}
              {bodyTypeFilter && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  body:
                  <span className="ml-1 font-semibold">{bodyTypeFilter}</span>
                </span>
              )}
              {segmentFilter && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  segment:
                  <span className="ml-1 font-semibold">{segmentFilter}</span>
                </span>
              )}
              {(rawMinYear || rawMaxYear) && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  year:
                  <span className="ml-1 font-semibold">
                    {rawMinYear || "指定なし"}〜{rawMaxYear || "指定なし"}
                  </span>
                </span>
              )}
              {(rawMinPrice || rawMaxPrice) && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  price(万円):
                  <span className="ml-1 font-semibold">
                    {rawMinPrice || "指定なし"}〜{rawMaxPrice || "指定なし"}
                  </span>
                </span>
              )}
              {priceBandFilter && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  band:
                  <span className="ml-1 font-semibold">{priceBandFilter}</span>
                </span>
              )}
              {sortKey && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  sort:
                  <span className="ml-1 font-semibold">{mapSortLabel(sortKey)}</span>
                </span>
              )}
              {perPage !== 12 && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  rows:
                  <span className="ml-1 font-semibold">{perPage}件/ページ</span>
                </span>
              )}
              {viewMode === "list" && (
                <span className="rounded-full border border-[#222222]/12 bg-white px-2 py-0.5 text-[#222222]/70">
                  view:
                  <span className="ml-1 font-semibold">LIST</span>
                </span>
              )}
            </div>
          </Reveal>
        )}

        {/* 一覧 */}
        <section className="space-y-4" aria-label="車種一覧">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#222222]/70">CAR LIST</h2>
            <div className="flex flex-col items-end text-[10px] text-[#222222]/55 sm:flex-row sm:items-center sm:gap-3">
              <span>
                TOTAL
                <span className="ml-1 font-semibold text-[#222222]">{totalModels}</span>
                MODELS
                {totalModelsAll !== totalModels ? (
                  <span className="ml-2 text-[#222222]/40">（全 {totalModelsAll}）</span>
                ) : null}
              </span>
              <span>
                FILTERED
                <span className="ml-1 font-semibold text-[#0ABAB5]">{totalFiltered}</span>
                MODELS
              </span>
              <span>
                PAGE
                <span className="mx-1 font-semibold text-[#222222]">{currentPage}</span>/
                <span className="ml-1 font-semibold text-[#222222]">{maxPage}</span>
              </span>
            </div>
          </div>

          {totalFiltered === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#222222]/12 bg-white p-6 text-center text-xs text-[#222222]/55">
              条件に合うクルマはなし
              絞り込み条件を少し緩めて再検索する想定
            </p>
          ) : viewMode === "list" ? (
            // 情報密度高めのリストビュー
            <div className="overflow-hidden rounded-2xl border border-[#222222]/10 bg-white">
              <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                <thead className="bg-[#222222]/5">
                  <tr className="text-left text-[10px] font-semibold tracking-[0.16em] text-[#222222]/55">
                    <th className="px-4 py-2">CAR</th>
                    <th className="px-4 py-2">BODY/SEGMENT</th>
                    <th className="px-4 py-2">YEAR</th>
                    <th className="px-4 py-2">SUMMARY</th>
                    <th className="px-4 py-2 text-right">COMPARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((car) => (
                    <tr id={`car-${car.slug}`} key={car.id} className="hover:bg-[#222222]/5">
                      <td className="px-4 py-3 align-top">
                        <TrackedLink
                          href={`/cars/${encodeURIComponent(car.slug)}`}
                          toType="cars"
                          toId={car.slug}
                          shelfId="cars_index_list"
                          ctaId="cars_index_open"
                          className="block"
                        >
                          <div className="text-[10px] font-semibold tracking-[0.22em] text-[#0ABAB5]">
                            {car.maker}
                          </div>
                          <div className="text-[12px] font-semibold text-[#222222]">{car.name}</div>
                          <div className="text-[10px] text-[#222222]/55">{car.slug}</div>
                        </TrackedLink>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-1 text-[10px] text-[#222222]/70">
                          {car.bodyType && (
                            <span className="rounded-full bg-[#222222]/5 px-2 py-0.5">{car.bodyType}</span>
                          )}
                          {car.segment && (
                            <span className="rounded-full bg-[#222222]/5 px-2 py-0.5">{car.segment}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] text-[#222222]/70">
                        {car.releaseYear ? `${car.releaseYear}年頃` : "未設定"}
                      </td>
                      <td className="px-4 py-3 align-top text-[11px] text-text-sub">
                        <p className="line-clamp-3 leading-relaxed">
                          {car.summary ?? "この車種についての詳細なインプレッションは順次追加予定。"}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <CompareAddButton slug={car.slug} mode="icon" source="cars_index_list" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // カードビュー
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((car) => {
                // 画像はプレースホルダー固定
                const thumbnail = "/images/cars/placeholder.jpg";

                return (
                  <div id={`car-${car.slug}`} key={car.id} className="relative w-full">
                    <div className="absolute right-4 top-4 z-20">
                      <CompareAddButton slug={car.slug} mode="icon" source="cars_index_card" />
                    </div>

                    <TrackedLink
                      href={`/cars/${encodeURIComponent(car.slug)}`}
                      toType="cars"
                      toId={car.slug}
                      shelfId="cars_index_card"
                      ctaId="cars_index_open"
                      className="block w-full"
                    >
                      <GlassCard
                        as="article"
                        padding="md"
                        interactive
                        className="group relative h-full w-full max-w-none"
                      >
                      {/* カード内の光 */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col gap-3">
                        {/* サムネイル（要望: carsの画像は無し） */}
                        {ENABLE_CAR_IMAGES ? (
                          <div className="overflow-hidden rounded-2xl border border-[#222222]/10">
                            <img
                              src={thumbnail}
                              alt={car.name ?? car.slug}
                              className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </div>
                        ) : null}

                        {/* テキスト部 */}
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="text-[11px] font-semibold tracking-[0.28em] text-[#0ABAB5]">
                            {car.maker}
                          </div>
                          <h3 className="text-sm font-semibold tracking-[0.03em] text-[#222222]">{car.name}</h3>
                          <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {car.summary ?? "この車種についての詳細なインプレッションは順次追加予定。"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {car.bodyType && (
                              <span className="rounded-full bg-[#222222]/5 px-3 py-1 text-[#222222]">
                                {car.bodyType}
                              </span>
                            )}
                            {car.segment && (
                              <span className="rounded-full bg-[#222222]/5 px-3 py-1 text-[#222222]">
                                {car.segment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      </GlassCard>
                    </TrackedLink>
                  </div>
                );
              })}
            </div>
          )}

          {/* ページネーション */}
          {totalFiltered > 0 && maxPage > 1 && (
            <nav className="mt-6 flex justify-center" aria-label="ページネーション">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#222222]/10 bg-white px-2 py-1 text-[10px] shadow-soft">
                <Link
                  href={buildQueryString(paginationBaseParams, {
                    page: String(currentPage > 1 ? currentPage - 1 : 1),
                  })}
                  rel="nofollow"
                  className={`rounded-full px-3 py-1 ${
                    currentPage === 1
                      ? "text-[#222222]/25"
                      : "text-[#222222]/70 hover:bg-[#222222]/5 hover:text-[#222222]"
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  ← PREV
                </Link>

                {Array.from({ length: maxPage }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const active = pageNum === currentPage;

                  if (maxPage > 7) {
                    // 簡易省略表示
                    if (pageNum !== 1 && pageNum !== maxPage && Math.abs(pageNum - currentPage) > 1) {
                      if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === maxPage - 1 && currentPage < maxPage - 2)
                      ) {
                        return (
                          <span key={pageNum} className="px-2 py-1 text-[#222222]/25">
                            …
                          </span>
                        );
                      }
                      if (pageNum !== 2 && pageNum !== maxPage - 1) {
                        return null;
                      }
                    }
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={buildQueryString(paginationBaseParams, { page: String(pageNum) })}
                      rel="nofollow"
                      className={`rounded-full px-3 py-1 ${
                        active
                          ? "bg-[#222222] text-white"
                          : "text-[#222222]/70 hover:bg-[#222222]/5 hover:text-[#222222]"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                <Link
                  href={buildQueryString(paginationBaseParams, {
                    page: String(currentPage < maxPage ? currentPage + 1 : maxPage),
                  })}
                  rel="nofollow"
                  className={`rounded-full px-3 py-1 ${
                    currentPage === maxPage
                      ? "text-[#222222]/25"
                      : "text-[#222222]/70 hover:bg-[#222222]/5 hover:text-[#222222]"
                  }`}
                  aria-disabled={currentPage === maxPage}
                >
                  NEXT →
                </Link>
              </div>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}