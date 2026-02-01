// lib/analytics/events.ts

export type PageType =
  // 互換（ざっくり）
  | "top"
  | "home"
  | "cars"
  | "guide"
  | "news"
  | "hub"
  | "column"
  | "heritage"
  | "unknown"
  | "other"
  | "search"
  | "compare"
  // v1.2 っぽい詳細（TrackedLink 側の normalize が返す可能性に備える）
  | "cars_index"
  | "cars_detail"
  | "guide_index"
  | "guide_detail"
  | "guide_hub"
  | "column_index"
  | "column_detail"
  | "heritage_index"
  | "heritage_detail"
  | "news_index"
  | "news_detail";

export type InternalToType =
  | "cars"
  | "heritage"
  | "column"
  | "guide"
  | "news"
  | "hub"
  | "compare"
  | "top";

// ---- イベント名 ----
export type EventName =
  | "outbound_click"
  | "internal_nav_click"
  | "internal_nav_impression"
  | "cta_impression"
  | "scroll_depth"
  | "next_read_click"
  | "guide_filter_apply"
  | "cars_filter_apply"
  | "site_search"
  | "experiment_assign"
  | "compare_view"
  | "compare_add"
  | "compare_remove"
  | "compare_clear"
  | "compare_share";

// ---- 共通ヘルパ ----
type AnyRecord = Record<string, any>;

const isGtagAvailable = () =>
  typeof window !== "undefined" && typeof (window as any).gtag === "function";

export const sendGAEvent = (eventName: EventName, params: AnyRecord) => {
  if (!isGtagAvailable()) {
    // 開発時の確認用（Vercel/本番では console は基本見えないが、落ちないように残す）
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log(`[GA4 Dev] Event: ${eventName}`, params);
    }
    return;
  }
  (window as any).gtag("event", eventName, params);
};

// ---- Internal Nav ----
// TrackedLink などが import している型（必須）
export type InternalNavParams = {
  // 推奨（v1.2）
  pageType?: PageType;
  contentId?: string;

  // 既存互換（snake_case）
  from_type: PageType;
  to_type: InternalToType;
  from_id?: string;
  to_id: string;

  shelf_id?: string;
  cta_id?: string;

  // 任意: リンク識別・目的地情報（分析用）
  nav_id?: string;
  to_slug?: string;
  to_title?: string;
  // camelCase 互換
  navId?: string;
  toSlug?: string;
  toTitle?: string;

  // 追加で何が来ても落とさない
  [key: string]: any;
};

// TrackedLink / Hub棚 / NextRead棚 などから呼ばれる
export const trackInternalNavClick = (params: InternalNavParams) => {
  const pageType = params.pageType ?? params.from_type ?? "other";
  const contentId = params.contentId ?? params.from_id ?? "";

  sendGAEvent("internal_nav_click", {
    // まずは仕様書に寄せる（snake_case を基本に）
    page_type: pageType,
    content_id: contentId,

    from_type: params.from_type,
    from_id: params.from_id,
    to_type: params.to_type,
    to_id: params.to_id,

    shelf_id: params.shelf_id,
    cta_id: params.cta_id,

    nav_id: params.nav_id ?? params.navId ?? "",
    to_slug: params.to_slug ?? params.toSlug ?? "",
    to_title: params.to_title ?? params.toTitle ?? "",

    // 互換用に camelCase も残しておく（将来の参照に耐える）
    pageType,
    contentId,
    navId: params.nav_id ?? params.navId,
    toSlug: params.to_slug ?? params.toSlug,
    toTitle: params.to_title ?? params.toTitle,
  });
};

// ---- Internal Nav Impression ----
export type InternalNavImpressionParams = {
  page_type?: PageType | string;
  content_id?: string;
  shelf_id: string;
  variant?: string;

  // 互換
  pageType?: PageType;
  contentId?: string;
  shelfId?: string;

  [key: string]: any;
};

export const trackInternalNavImpression = (params: InternalNavImpressionParams) => {
  const pageType = (params.pageType ?? params.page_type ?? "other") as PageType;
  const contentId = params.contentId ?? params.content_id ?? "";
  const shelfId = params.shelf_id ?? params.shelfId ?? "";

  if (!shelfId) return;

  sendGAEvent("internal_nav_impression", {
    page_type: pageType,
    content_id: contentId,
    shelf_id: shelfId,
    variant: params.variant ?? "default",

    // 互換
    pageType,
    contentId,
    navId: params.nav_id ?? params.navId,
    toSlug: params.to_slug ?? params.toSlug,
    toTitle: params.to_title ?? params.toTitle,
    shelfId,
  });
};

// ---- Guide Filter ----
export type GuideFilterApplyParams = {
  q?: string;
  sort?: string;
  category?: string;
  tag?: string;
};

export const trackGuideFilterApply = (params: GuideFilterApplyParams) => {
  sendGAEvent("guide_filter_apply", {
    page_type: "guide_index",
    content_id: "guide",
    q: params.q ?? "",
    sort: params.sort ?? "new",
    category: params.category ?? "",
    tag: params.tag ?? "",
  });
};

// ---- Cars Filter ----
export type CarsFilterApplyParams = {
  page_type?: PageType | string;
  content_id?: string;

  q?: string;
  maker?: string;
  bodyType?: string;
  segment?: string;
  sort?: string;
  minYear?: string;
  maxYear?: string;
  minPrice?: string;
  maxPrice?: string;
  priceBand?: string;
  perPage?: string;
  view?: string;

  /** auto | submit | change | debounce など（任意） */
  source?: string;
};

export const trackCarsFilterApply = (params: CarsFilterApplyParams) => {
  sendGAEvent("cars_filter_apply", {
    page_type: (params.page_type ?? "cars_index") as PageType,
    content_id: params.content_id ?? "cars",
    q: params.q ?? "",
    maker: params.maker ?? "",
    bodyType: params.bodyType ?? "",
    segment: params.segment ?? "",
    sort: params.sort ?? "",
    minYear: params.minYear ?? "",
    maxYear: params.maxYear ?? "",
    minPrice: params.minPrice ?? "",
    maxPrice: params.maxPrice ?? "",
    priceBand: params.priceBand ?? "",
    perPage: params.perPage ?? "",
    view: params.view ?? "",
    source: params.source ?? "",
  });
};

// ---- Outbound ----
export type OutboundClickParams = {
  // 推奨（v1.2 camelCase）
  href?: string;
  monetizeKey?: string;
  pageType?: PageType;
  contentId?: string;

  // 既存互換（snake_case）
  url?: string;
  monetize_key?: string;
  page_type?: PageType | string;
  content_id?: string;

  // 分析用（任意）
  page_slug?: string;
  outbound_domain?: string;

  // 位置・CTA・棚
  position?: string;
  cta_id?: string;
  shelf_id?: string;

  // 互換で来がちな別名
  ctaId?: string;
  shelfId?: string;
  cta_position?: string;

  // 任意付帯
  partner?: string;
  [key: string]: any;
};

export const trackOutboundClick = (params: OutboundClickParams) => {
  // どの呼び出しでも落ちないように正規化
  const href = params.href ?? params.url ?? "";
  const monetizeKey = params.monetizeKey ?? params.monetize_key ?? "";
  const pageType = (params.pageType ?? params.page_type ?? "other") as PageType;
  const contentId = params.contentId ?? params.content_id ?? "";

  const position = params.position ?? params.cta_position ?? "";
  const ctaId = params.cta_id ?? params.ctaId ?? "";
  const shelfId = params.shelf_id ?? params.shelfId ?? "";

  sendGAEvent("outbound_click", {
    page_type: pageType,
    content_id: contentId,

    monetize_key: monetizeKey,
    url: href,

    position,
    cta_id: ctaId,
    shelf_id: shelfId,

    partner: params.partner,

    // 分析用（任意）
    page_slug: params.page_slug,
    outbound_domain: params.outbound_domain,

    // 互換（camelCaseも一応出す）
    pageType,
    contentId,
    navId: params.nav_id ?? params.navId,
    toSlug: params.to_slug ?? params.toSlug,
    toTitle: params.to_title ?? params.toTitle,
    monetizeKey,
    href,
    ctaId,
    shelfId,
  });
};

// ---- CTA Impression ----
export type CtaImpressionParams = {
  page_type: PageType | string;
  content_id: string;
  monetize_key: string;
  cta_id: string;

  position?: string;
  variant?: string;

  // 互換
  pageType?: PageType;
  contentId?: string;
  monetizeKey?: string;
  ctaId?: string;

  [key: string]: any;
};

export const trackCtaImpression = (params: CtaImpressionParams) => {
  const pageType = (params.pageType ?? params.page_type ?? "other") as PageType;
  const contentId = params.contentId ?? params.content_id ?? "";
  const monetizeKey = params.monetizeKey ?? params.monetize_key ?? "";
  const ctaId = params.ctaId ?? params.cta_id ?? "";

  sendGAEvent("cta_impression", {
    page_type: pageType,
    content_id: contentId,
    monetize_key: monetizeKey,
    cta_id: ctaId,
    position: params.position,
    variant: params.variant,
  });
};

// ---- Experiments / A/B ----
export type ExperimentAssignParams = {
  experiment_id: string;
  variant: string;
  page_type?: PageType | string;
  content_id?: string;
  // optional metadata
  is_override?: boolean;
  source?: string;
};

export const trackExperimentAssign = (params: ExperimentAssignParams) => {
  sendGAEvent("experiment_assign", {
    experiment_id: params.experiment_id,
    variant: params.variant,
    page_type: (params.page_type ?? "other") as PageType,
    content_id: params.content_id ?? "",
    is_override: params.is_override ?? false,
    source: params.source ?? "",
  });
};

// ---- Scroll Depth ----
export type ScrollDepthParams = {
  // ScrollDepthTracker 側で揺れやすいので広めに受ける
  depth?: number;
  percent?: number;

  page_type?: PageType | string;
  content_id?: string;

  pageType?: PageType;
  contentId?: string;

  [key: string]: any;
};

export const trackScrollDepth = (params: ScrollDepthParams) => {
  const depth =
    typeof params.depth === "number"
      ? params.depth
      : typeof params.percent === "number"
        ? params.percent
        : 0;

  const pageType = (params.pageType ?? params.page_type ?? "other") as PageType;
  const contentId = params.contentId ?? params.content_id ?? "";

  sendGAEvent("scroll_depth", {
    page_type: pageType,
    content_id: contentId,
    depth,
  });
};

// ---- Next Read (任意) ----
export type NextReadClickParams = {
  page_type?: PageType | string;
  content_id?: string;

  from_type?: PageType;
  from_id?: string;

  to_type?: InternalToType;
  to_id?: string;

  shelf_id?: string;

  [key: string]: any;
};

export const trackNextReadClick = (params: NextReadClickParams) => {
  sendGAEvent("next_read_click", {
    page_type: params.page_type ?? params.from_type ?? "other",
    content_id: params.content_id ?? params.from_id ?? "",

    from_type: params.from_type,
    from_id: params.from_id,
    to_type: params.to_type,
    to_id: params.to_id,

    shelf_id: params.shelf_id,
  });
};


// ---- Site Search ----
export type SiteSearchParams = {
  query: string;
  filter_type?: string;
  results_count?: number;

  page_type?: PageType | string;
  content_id?: string;

  [key: string]: any;
};

export const trackSiteSearch = (params: SiteSearchParams) => {
  sendGAEvent("site_search", {
    query: params.query,
    filter_type: params.filter_type ?? "",
    results_count: params.results_count ?? 0,
    page_type: (params.page_type ?? "search") as PageType,
    content_id: params.content_id ?? "search",
  });
};


// ---- Compare (最大3台) ----
export type CompareEventParams = {
  page_type?: PageType | string;
  content_id?: string;
  car_slug?: string;
  count?: number;
  source?: string;
  variant?: string;

  // 互換
  pageType?: PageType;
  contentId?: string;

  [key: string]: any;
};

export const trackCompareView = (params: CompareEventParams) => {
  sendGAEvent("compare_view", {
    page_type: (params.page_type ?? params.pageType ?? "compare") as PageType,
    content_id: params.content_id ?? params.contentId ?? "compare",
    count: params.count ?? 0,
    source: params.source ?? "unknown",
    variant: params.variant,
  });
};

export const trackCompareAdd = (params: CompareEventParams) => {
  sendGAEvent("compare_add", {
    page_type: (params.page_type ?? params.pageType ?? "other") as PageType,
    content_id: params.content_id ?? params.contentId ?? "",
    car_slug: params.car_slug ?? "",
    count: params.count ?? 0,
    source: params.source ?? "unknown",
  });
};

export const trackCompareRemove = (params: CompareEventParams) => {
  sendGAEvent("compare_remove", {
    page_type: (params.page_type ?? params.pageType ?? "compare") as PageType,
    content_id: params.content_id ?? params.contentId ?? "compare",
    car_slug: params.car_slug ?? "",
    count: params.count ?? 0,
    source: params.source ?? "unknown",
  });
};

export const trackCompareClear = (params: CompareEventParams) => {
  sendGAEvent("compare_clear", {
    page_type: (params.page_type ?? params.pageType ?? "other") as PageType,
    content_id: params.content_id ?? params.contentId ?? "",
    count: params.count ?? 0,
    source: params.source ?? "unknown",
  });
};

export const trackCompareShare = (params: CompareEventParams) => {
  sendGAEvent("compare_share", {
    page_type: (params.page_type ?? params.pageType ?? "compare") as PageType,
    content_id: params.content_id ?? params.contentId ?? "compare",
    count: params.count ?? 0,
    source: params.source ?? "unknown",
  });
};
