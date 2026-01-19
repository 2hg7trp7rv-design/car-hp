// app/cars/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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

import {
  buildMakerInfos,
  normalizeMakerParamToKey,
  resolveMakerLabel,
} from "@/lib/taxonomy/makers";
import { normalizeBodyTypeParam } from "@/lib/taxonomy/body-types";
import { normalizeSegmentLabel } from "@/lib/taxonomy/segments";


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

  const makerInfos = buildMakerInfos(all);
  const makerLabelFilter = makerKeyFilter ? resolveMakerLabel(makerKeyFilter, makerInfos) : "";

  const bodyTypes = Array.from(
    new Set(all.map((c) => c.bodyType).filter(Boolean)),
  ).sort();

  const segments = Array.from(
    new Set(all.map((c) => c.segment).filter(Boolean)),
  ).sort();

  const priceBands = Array.from(
    new Set(
      all
        .map((c) => c.priceBand)
        .filter((b): b is string => typeof b === "string" && b.length > 0),
    ),
  ).sort();

  // フィルタ
  const filtered = all.filter((car) => {
    if (q) {
      const haystack = [
        car.name ?? "",
        car.maker ?? "",
        car.segment ?? "",
        car.bodyType ?? "",
        car.summary ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (makerKeyFilter && car.makerKey !== makerKeyFilter) return false;

    if (bodyTypeFilter && car.bodyType !== bodyTypeFilter) return false;
    if (segmentFilter && car.segment !== segmentFilter) return false;

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

  const totalModels = all.length;
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
    Boolean(priceBandFilter);
  // インデックス用の簡易統計（世界観重視で“難易度”は表示しない）
  const sedanCount = all.filter((c) => {
    const bt = (c.bodyType ?? "").toLowerCase();
    return bt.includes("セダン") || bt.includes("sedan");
  }).length;

  const suvCount = all.filter((c) => {
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

  const sedanToken = resolveBodyTypeToken(["セダン", "sedan"]);
  const suvToken = resolveBodyTypeToken(["SUV/クロスオーバー", "SUV", "suv"]);
  const coupeToken = resolveBodyTypeToken(["sports-coupe", "クーペ", "coupe"]);

  const countBySimpleFilters = (filters: { bodyType?: string }): number =>
    all.filter((c) => {
      if (filters.bodyType && c.bodyType !== filters.bodyType) return false;
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
      "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] transition hover:border-tiffany-300 hover:bg-white",
    );
  }

  if (suvToken) {
    pushPreset(
      "SUVだけ",
      { bodyType: suvToken },
      "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 tracking-[0.16em] transition hover:border-tiffany-300 hover:bg-white",
    );
  }

  if (coupeToken) {
    pushPreset(
      "クーペ/スポーツ",
      { bodyType: coupeToken },
      "rounded-full border border-slate-200 bg-white/90 px-3 py-1 tracking-[0.16em] transition hover:border-slate-300 hover:bg-white",
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
  };

  const paginationBaseParams = {
    ...baseQueryParams,
    page: undefined,
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-cars-index-breadcrumb" data={breadcrumbData} />
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="font-medium text-slate-700">CARS</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10 rounded-3xl bg-white/80 p-5 shadow-soft-card backdrop-blur-sm sm:p-7 lg:p-8">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              CAR DATABASE
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="serif-heading text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  CARS
                </h1>
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                  サイズ・スペック・年式・セグメント別の車種
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/makers">メーカー別ページ</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/body-types">ボディタイプ別</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/cars/segments">セグメント別</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/start">入口ハブ（START）</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden text-[10px] text-slate-500 sm:block">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-soft-glow backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-500" />
                  <span className="tracking-[0.18em]">IMPORT/PREMIUM ORIENTED</span>
                </div>
                <p className="mt-2 max-w-xs leading-relaxed tracking-[0.03em]">
                  家族の一台というよりも少しこだわったクルマ時間を前提にした
                  車種を中心に集めているイメージ
                </p>
              </div>
            </div>
          </Reveal>
        </header>

        {/* インデックスパネル */}
        <Reveal delay={160}>
          <section className="mb-8 grid gap-3 text-[11px] text-slate-700">
            <GlassCard padding="md" className="flex items-center justify-between bg-white/80">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                  TOTAL MODELS
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{totalModels}</p>
                <p className="mt-1 text-[10px] text-slate-500">順次車種を追加予定</p>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <p>
                  現在の表示:
                  <span className="ml-1 font-semibold text-slate-900">{totalFiltered}</span>
                </p>
                <p>
                  メーカー数:
                  <span className="ml-1 font-semibold text-slate-700">{makerInfos.length}</span>
                </p>
                <p>
                  セグメント数:
                  <span className="ml-1 font-semibold text-slate-700">{segments.length}</span>
                </p>
              </div>
            </GlassCard>
          </section>
        </Reveal>

        {/* 絞り込みフォーム */}
        <Reveal delay={200}>
          <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-soft-card sm:p-5">
            <form id="cars-filter-form" method="get" action="/cars" className="space-y-4 text-xs sm:text-[11px]">
              {/* 1段目 基本フィルタ */}
              <div className="grid gap-3 md:grid-cols-4">
                {/* キーワード */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    KEYWORD
                  </label>
                  <input
                    type="search"
                    name="q"
                    defaultValue={rawQ}
                    placeholder="車名メーカーセグメントなどのキーワード"
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                  />
                </div>

                {/* メーカー */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    MAKER
                  </label>
                  <select
                    name="maker"
                    defaultValue={makerKeyFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    BODY TYPE
                  </label>
                  <select
                    name="bodyType"
                    defaultValue={bodyTypeFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    SEGMENT
                  </label>
                  <select
                    name="segment"
                    defaultValue={segmentFilter}
                    className="mt-1 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    MODEL YEAR RANGE
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      name="minYear"
                      defaultValue={rawMinYear}
                      placeholder="最小"
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      name="maxYear"
                      defaultValue={rawMaxYear}
                      placeholder="最大"
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">例:2010〜2018の範囲で絞り込む想定</p>
                </div>

                {/* 価格レンジ */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    PRICE RANGE
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      name="minPrice"
                      defaultValue={rawMinPrice}
                      placeholder="最小"
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      name="maxPrice"
                      defaultValue={rawMaxPrice}
                      placeholder="最大"
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
                    />
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">単位は万円想定(例:300〜600)</p>
                  {priceBands.length > 0 && (
                    <div className="mt-2">
                      <select
                        name="priceBand"
                        defaultValue={priceBandFilter}
                        className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <label className="block text-[10px] font-medium tracking-[0.22em] text-slate-500">
                    SORT/ROWS
                  </label>
                  <div className="mt-1 space-y-2">
                    <select
                      name="sort"
                      defaultValue={sortKey}
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                      className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-0 transition focus:border-tiffany-400 focus:bg-white"
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
                  <p className="text-[10px] font-medium tracking-[0.22em] text-slate-500">NOTE</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    将来的にはここからさらに年式細分化やボディサイズなど
                    もう少し細かい条件を追加していく前提
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 text-[10px] text-slate-500">
                  <p className="font-medium tracking-[0.22em] text-slate-500">QUICK PRESET</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPresetsFinal.map((p) => (
                      <Link key={p.href} href={p.href} rel="nofollow" className={p.className}>
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-medium tracking-[0.22em] text-slate-500">VIEW MODE</span>
                  <div className="inline-flex rounded-full bg-slate-100 p-1">
                    <Link
                      href={buildQueryString(baseQueryParams, { view: "card", page: "1" })}
                      rel="nofollow"
                      className={`rounded-full px-3 py-1 text-[10px] tracking-[0.16em] ${
                        viewMode === "card"
                          ? "bg-white text-slate-900 shadow-soft"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      CARD
                    </Link>
                    <Link
                      href={buildQueryString(baseQueryParams, { view: "list", page: "1" })}
                      rel="nofollow"
                      className={`rounded-full px-3 py-1 text-[10px] tracking-[0.16em] ${
                        viewMode === "list"
                          ? "bg-white text-slate-900 shadow-soft"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      LIST
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {hasFilter && (
                    <Link href="/cars" className="text-[10px] tracking-[0.16em] text-slate-400 hover:text-slate-700">
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
          </section>
        </Reveal>

        {/* アクティブフィルター表示 */}
        {(hasFilter || viewMode === "list" || perPage !== 12) && (
          <Reveal delay={230}>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">ACTIVE FILTERS</span>
              {q && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  keyword:
                  <span className="ml-1 font-semibold">“{rawQ}”</span>
                </span>
              )}
              {makerKeyFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  maker:
                  <span className="ml-1 font-semibold">{makerLabelFilter}</span>
                </span>
              )}
              {bodyTypeFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  body:
                  <span className="ml-1 font-semibold">{bodyTypeFilter}</span>
                </span>
              )}
              {segmentFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  segment:
                  <span className="ml-1 font-semibold">{segmentFilter}</span>
                </span>
              )}
              {(rawMinYear || rawMaxYear) && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  year:
                  <span className="ml-1 font-semibold">
                    {rawMinYear || "指定なし"}〜{rawMaxYear || "指定なし"}
                  </span>
                </span>
              )}
              {(rawMinPrice || rawMaxPrice) && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  price(万円):
                  <span className="ml-1 font-semibold">
                    {rawMinPrice || "指定なし"}〜{rawMaxPrice || "指定なし"}
                  </span>
                </span>
              )}
              {priceBandFilter && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  band:
                  <span className="ml-1 font-semibold">{priceBandFilter}</span>
                </span>
              )}
              {sortKey && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  sort:
                  <span className="ml-1 font-semibold">{mapSortLabel(sortKey)}</span>
                </span>
              )}
              {perPage !== 12 && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
                  rows:
                  <span className="ml-1 font-semibold">{perPage}件/ページ</span>
                </span>
              )}
              {viewMode === "list" && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]">
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
            <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">CAR LIST</h2>
            <div className="flex flex-col items-end text-[10px] text-slate-400 sm:flex-row sm:items-center sm:gap-3">
              <span>
                TOTAL
                <span className="ml-1 font-semibold text-slate-800">{totalModels}</span>
                MODELS
              </span>
              <span>
                FILTERED
                <span className="ml-1 font-semibold text-tiffany-600">{totalFiltered}</span>
                MODELS
              </span>
              <span>
                PAGE
                <span className="mx-1 font-semibold text-slate-800">{currentPage}</span>/
                <span className="ml-1 font-semibold text-slate-800">{maxPage}</span>
              </span>
            </div>
          </div>

          {totalFiltered === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-500">
              条件に合うクルマはなし
              絞り込み条件を少し緩めて再検索する想定
            </p>
          ) : viewMode === "list" ? (
            // 情報密度高めのリストビュー
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90">
              <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                <thead className="bg-slate-50/80">
                  <tr className="text-left text-[10px] font-semibold tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-2">CAR</th>
                    <th className="px-4 py-2">BODY/SEGMENT</th>
                    <th className="px-4 py-2">YEAR</th>
                    <th className="px-4 py-2">SUMMARY</th>
                    <th className="px-4 py-2 text-right">COMPARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 align-top">
                        <TrackedLink
                          href={`/cars/${encodeURIComponent(car.slug)}`}
                          toType="cars"
                          toId={car.slug}
                          shelfId="cars_index_list"
                          ctaId="cars_index_open"
                          className="block"
                        >
                          <div className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                            {car.maker}
                          </div>
                          <div className="text-[12px] font-semibold text-slate-900">{car.name}</div>
                          <div className="text-[10px] text-slate-400">{car.slug}</div>
                        </TrackedLink>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-700">
                          {car.bodyType && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5">{car.bodyType}</span>
                          )}
                          {car.segment && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5">{car.segment}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[10px] text-slate-600">
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
                  <div key={car.id} className="relative w-full">
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
                        className="group relative h-full w-full max-w-none overflow-hidden rounded-3xl bg-white/90 shadow-soft-card transition-transform duration-500 hover:-translate-y-[3px] hover:shadow-soft-card"
                      >
                      {/* カード内の光 */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                      </div>

                      <div className="relative z-10 flex h-full flex-col gap-3">
                        {/* サムネイル */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <img
                            src={thumbnail}
                            alt={car.name ?? car.slug}
                            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>

                        {/* テキスト部 */}
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="text-[11px] font-semibold tracking-[0.28em] text-tiffany-700">
                            {car.maker}
                          </div>
                          <h3 className="text-sm font-semibold tracking-[0.03em] text-slate-900">{car.name}</h3>
                          <p className="line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {car.summary ?? "この車種についての詳細なインプレッションは順次追加予定。"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {car.bodyType && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                {car.bodyType}
                              </span>
                            )}
                            {car.segment && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
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
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[10px] shadow-soft-card">
                <Link
                  href={buildQueryString(paginationBaseParams, {
                    page: String(currentPage > 1 ? currentPage - 1 : 1),
                  })}
                  rel="nofollow"
                  className={`rounded-full px-3 py-1 ${
                    currentPage === 1
                      ? "text-slate-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                          <span key={pageNum} className="px-2 py-1 text-slate-300">
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
                          ? "bg-slate-900 text-slate-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                      ? "text-slate-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
