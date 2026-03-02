"use client";

/**
 * 仕様書 v1.2 「6.1 イベント設計」に基づく実装
 * - window.gtag を安全に呼ぶ
 * - GA4 params から undefined を除去してログ/分析を安定させる
 * - content_id 等が "unknown" の場合は送信しない（データ汚染回避）
 *
 * 注意:
 * - 既存実装との互換を壊さないため、旧フィールド名も optional で受ける
 */

type GTag = {
  (command: "event", eventName: string, params?: Record<string, any>): void;
};

// ----------------------------------------
// 共通: 値の安全化
// ----------------------------------------
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidId(value: unknown): value is string {
  return isNonEmptyString(value) && value.trim() !== "unknown";
}

// ----------------------------------------
// 共通: paramsのundefined除去（GA4の整形）
// ----------------------------------------
function cleanParams<T extends Record<string, any>>(
  params: T,
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

// 共通ヘルパー: window.gtag を安全に呼ぶ
function sendEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === "undefined") return;

  const gtag = (window as any).gtag as GTag | undefined;
  const payload = cleanParams(params);

  if (gtag) {
    gtag("event", eventName, payload);
  } else {
    // 開発環境での確認用ログ
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(`[GA4 Event] ${eventName}`, payload);
    }
  }
}

// ----------------------------------------
// 共通型
// ----------------------------------------
export type PageType = "heritage" | "cars" | "column" | "guide" | "hub" | "top";

// ---------------------------------------------------------
// 1. 内部リンク回遊 (internal_nav_click)
// ---------------------------------------------------------
export type InternalNavParams = {
  from_type: PageType;
  to_type: Exclude<PageType, "top">;
  from_id?: string; // slug または id
  to_id?: string; // slug または id

  // v1.2 推奨
  shelf_id?: string;
  cta_id?: string;

  // 旧フィールド（互換）
  label?: string; // どこのリンクか (例: "ownership_shelf", "footer_nav")
};

export function trackInternalNavClick(params: InternalNavParams) {
  const safe = {
    ...params,
    from_id: isValidId(params.from_id) ? params.from_id : undefined,
    to_id: isValidId(params.to_id) ? params.to_id : undefined,
    shelf_id: isValidId(params.shelf_id) ? params.shelf_id : undefined,
    cta_id: isValidId(params.cta_id) ? params.cta_id : undefined,
    label: isValidId(params.label) ? params.label : undefined,
  };

  sendEvent("internal_nav_click", safe);
}

// ---------------------------------------------------------
// 2. 外部リンク・収益導線 (outbound_click)
// ---------------------------------------------------------
export type OutboundParams = {
  page_type: Exclude<PageType, "top">;
  content_id: string; // 記事slug

  // v1.2 推奨
  monetize_key?: string;
  cta_id?: string;
  position?: string;

  // 旧フィールド（互換）
  partner?: string;
  url: string;
  cta_position?: string; // 旧: position 相当
};

export function trackOutboundClick(params: OutboundParams) {
  if (!isValidId(params.content_id)) return;
  if (!isNonEmptyString(params.url)) return;

  // position は v1.2 推奨。旧 cta_position しか無い場合はそれを採用。
  const position =
    isNonEmptyString(params.position) ? params.position : params.cta_position;

  if (!isNonEmptyString(position)) return;

  const safe = {
    ...params,
    content_id: params.content_id.trim(),
    monetize_key: isValidId(params.monetize_key) ? params.monetize_key : undefined,
    cta_id: isValidId(params.cta_id) ? params.cta_id : undefined,
    position,
    partner: isValidId(params.partner) ? params.partner : undefined,
    // 旧フィールドは残す（GA側で移行期間の分析が可能）
    cta_position: params.cta_position,
  };

  sendEvent("outbound_click", safe);
}

// ---------------------------------------------------------
// 3. CTA表示計測 (cta_impression)
// ---------------------------------------------------------
export type CtaImpressionParams = {
  page_type: Exclude<PageType, "top">;

  // v1.2 推奨
  content_id: string;
  monetize_key?: string;
  cta_id: string;
  position: string;
  variant?: string;

  // 旧フィールド（互換）
  // - 旧実装では cta_id と monetize_key が同義として運用されていた
};

export function trackCtaImpression(params: CtaImpressionParams) {
  if (!isValidId(params.cta_id)) return;
  if (!isNonEmptyString(params.position)) return;
  if (!isValidId(params.content_id)) return;

  const safe = {
    ...params,
    content_id: params.content_id.trim(),
    cta_id: params.cta_id.trim(),
    monetize_key: isValidId(params.monetize_key) ? params.monetize_key : undefined,
    variant: isValidId(params.variant) ? params.variant : undefined,
  };

  sendEvent("cta_impression", safe);
}

// ---------------------------------------------------------
// 4. 次に読む棚クリック (next_read_click)
// ---------------------------------------------------------
export type NextReadParams = {
  shelf_id: string;
  from_type: Exclude<PageType, "top">;
  from_id: string;
  to_type: "cars" | "guide" | "column";
  to_id: string;
};

export function trackNextReadClick(params: NextReadParams) {
  if (!isValidId(params.shelf_id)) return;
  if (!isValidId(params.to_id)) return;
  if (!isValidId(params.from_id)) return;
  if (!isValidId(params.from_type)) return;

  const safe = {
    ...params,
    shelf_id: params.shelf_id.trim(),
    to_id: params.to_id.trim(),
    from_id: params.from_id.trim(),
  };

  sendEvent("next_read_click", safe);
}

// ---------------------------------------------------------
// 5. 読了率 (scroll_depth)
// ---------------------------------------------------------
export function trackScrollDepth(params: {
  percent: number;
  page_type: Exclude<PageType, "top">;
  content_id: string;
}) {
  if (!isValidId(params.content_id)) return;

  const percent =
    typeof params.percent === "number" && Number.isFinite(params.percent)
      ? Math.max(0, Math.min(100, Math.round(params.percent)))
      : 0;

  sendEvent("scroll_depth", {
    percent,
    page_type: params.page_type,
    content_id: params.content_id.trim(),
  });
}
