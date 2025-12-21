// lib/analytics/events.ts

export type PageType =
  // 互換（ざっくり）
  | "top"
  | "home"
  | "cars"
  | "guide"
  | "hub"
  | "column"
  | "heritage"
  | "unknown"
  | "other"
  // v1.2 っぽい詳細（TrackedLink 側の normalize が返す可能性に備える）
  | "cars_index"
  | "cars_detail"
  | "guide_index"
  | "guide_detail"
  | "guide_hub"
  | "column_index"
  | "column_detail"
  | "heritage_index"
  | "heritage_detail";

export type InternalToType = "cars" | "heritage" | "column" | "guide" | "hub" | "top";

// ---- イベント名 ----
export type EventName =
  | "outbound_click"
  | "internal_nav_click"
  | "cta_impression"
  | "scroll_depth"
  | "next_read_click";

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

    // 互換用に camelCase も残しておく（将来の参照に耐える）
    pageType,
    contentId,
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
