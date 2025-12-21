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
  // 既存ページで使われがちな派生（互換）
  | "guide_hub"
  // v1.2 っぽい詳細（TrackedLink 側の normalize が返す可能性に備える）
  | "cars_index"
  | "cars_detail"
  | "guide_index"
  | "guide_detail"
  | "column_index"
  | "column_detail"
  | "heritage_index"
  | "heritage_detail"
  | "hub_index"
  | "hub_detail";

export type InternalFromType =
  | "top"
  | "cars"
  | "heritage"
  | "column"
  | "guide"
  | "hub";
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

const safeString = (v: unknown): string | undefined => {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return undefined;
};

const normalizePageType = (v: unknown): PageType => {
  const s = safeString(v);
  if (!s) return "unknown";

  // 既存互換
  if (
    s === "top" ||
    s === "home" ||
    s === "cars" ||
    s === "guide" ||
    s === "hub" ||
    s === "column" ||
    s === "heritage" ||
    s === "unknown" ||
    s === "other" ||
    s === "guide_hub"
  )
    return s as PageType;

  // v1.2 っぽい詳細
  if (
    s === "cars_index" ||
    s === "cars_detail" ||
    s === "guide_index" ||
    s === "guide_detail" ||
    s === "column_index" ||
    s === "column_detail" ||
    s === "heritage_index" ||
    s === "heritage_detail" ||
    s === "hub_index" ||
    s === "hub_detail"
  )
    return s as PageType;

  return "unknown";
};

const normalizeMonetizeKey = (v: unknown): string | undefined => safeString(v);

const getHostname = (href: string): string | undefined => {
  try {
    const u = new URL(href);
    return u.hostname;
  } catch {
    return undefined;
  }
};

// ---- Internal Nav ----
export type InternalNavClickParams = {
  from?: InternalFromType;
  to?: InternalToType;
  label?: string;
  href?: string;

  // 既存互換
  from_type?: InternalFromType | string;
  to_type?: InternalToType | string;
};

export const trackInternalNavClick = (params: InternalNavClickParams = {}) => {
  if (!isGtagAvailable()) return;

  const from = safeString(params.from ?? params.from_type) ?? "top";
  const to = safeString(params.to ?? params.to_type) ?? "top";
  const label = safeString(params.label);
  const href = safeString(params.href);

  (window as any).gtag("event", "internal_nav_click", {
    from_type: from,
    to_type: to,
    label,
    href,
  });
};

// ---- Next Read ----
export type NextReadClickParams = {
  from?: PageType;
  to?: PageType;
  label?: string;
  href?: string;

  // v1.2 っぽい詳細
  pageType?: PageType;
  contentId?: string;
};

export const trackNextReadClick = (params: NextReadClickParams = {}) => {
  if (!isGtagAvailable()) return;

  const from = normalizePageType(params.from);
  const to = normalizePageType(params.to);
  const label = safeString(params.label);
  const href = safeString(params.href);

  const pageType = normalizePageType(params.pageType);
  const contentId = safeString(params.contentId);

  (window as any).gtag("event", "next_read_click", {
    from_type: from,
    to_type: to,
    label,
    href,
    page_type: pageType,
    content_id: contentId,
  });
};

// ---- CTA Impression ----
export type CtaImpressionParams = {
  label?: string;
  monetizeKey?: string;
  pageType?: PageType;
  contentId?: string;

  // 既存互換
  monetize_key?: string;
  page_type?: PageType | string;
  content_id?: string;

  // 位置・CTA・棚
  position?: string;
  cta_id?: string;
  shelf_id?: string;

  // 互換で来がちな別名
  ctaId?: string;
  shelfId?: string;
};

export const trackCtaImpression = (params: CtaImpressionParams = {}) => {
  if (!isGtagAvailable()) return;

  const label = safeString(params.label);

  const monetizeKey = normalizeMonetizeKey(
    params.monetizeKey ?? params.monetize_key
  );
  const pageType = normalizePageType(params.pageType ?? params.page_type);
  const contentId = safeString(params.contentId ?? params.content_id);

  const position = safeString(params.position);
  const cta_id = safeString(params.cta_id ?? params.ctaId);
  const shelf_id = safeString(params.shelf_id ?? params.shelfId);

  (window as any).gtag("event", "cta_impression", {
    label,
    monetize_key: monetizeKey,
    page_type: pageType,
    content_id: contentId,
    position,
    cta_id,
    shelf_id,
  });
};

// ---- Scroll Depth ----
export type ScrollDepthParams = {
  percent?: number;
  pageType?: PageType;
  contentId?: string;

  // 既存互換
  page_type?: PageType | string;
  content_id?: string;
};

export const trackScrollDepth = (params: ScrollDepthParams = {}) => {
  if (!isGtagAvailable()) return;

  const percent = typeof params.percent === "number" ? params.percent : undefined;

  const pageType = normalizePageType(params.pageType ?? params.page_type);
  const contentId = safeString(params.contentId ?? params.content_id);

  (window as any).gtag("event", "scroll_depth", {
    percent,
    page_type: pageType,
    content_id: contentId,
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
};

export const trackOutboundClick = (params: OutboundClickParams = {}) => {
  if (!isGtagAvailable()) return;

  const href = safeString(params.href ?? params.url);
  const monetizeKey = normalizeMonetizeKey(
    params.monetizeKey ?? params.monetize_key
  );
  const pageType = normalizePageType(params.pageType ?? params.page_type);
  const contentId = safeString(params.contentId ?? params.content_id);

  const position = safeString(params.position);
  const cta_id = safeString(params.cta_id ?? params.ctaId);
  const shelf_id = safeString(params.shelf_id ?? params.shelfId);

  const page_slug = safeString(params.page_slug);
  const outbound_domain =
    safeString(params.outbound_domain) ?? (href ? getHostname(href) : undefined);

  const payload: AnyRecord = {
    href,
    url: href, // 互換で残す
    monetize_key: monetizeKey,
    page_type: pageType,
    content_id: contentId,
    position,
    cta_id,
    shelf_id,
    page_slug,
    outbound_domain,
  };

  (window as any).gtag("event", "outbound_click", payload);
};
