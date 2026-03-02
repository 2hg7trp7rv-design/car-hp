// lib/gtag.ts
type OutboundPayload = {
  event: "outbound_click";
  partner: string;
  href: string;
  cta_position: string;
};

type PageType = "guide" | "hub" | "cars" | "column" | "top" | "unknown";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePathForContext(
  pathname: string,
): { page_type: PageType; content_id: string } {
  if (!pathname || pathname === "/") {
    return { page_type: "top", content_id: "top" };
  }

  const parts = pathname.split("/").filter(Boolean);
  const section = parts[0] ?? "";
  const slug = parts[parts.length - 1] ?? "unknown";

  if (section === "cars") return { page_type: "cars", content_id: slug };
  if (section === "column") return { page_type: "column", content_id: slug };
  if (section === "guide") {
    if (
      slug.startsWith("hub-") ||
      slug === "insurance" ||
      slug === "lease" ||
      slug === "maintenance"
    ) {
      return { page_type: "hub", content_id: slug };
    }
    return { page_type: "guide", content_id: slug };
  }

  // heritage / その他は outbound の文脈としては unknown 扱い
  return { page_type: "unknown", content_id: slug };
}

/**
 * legacy 互換:
 * 既存の trackOutbound 呼び出しを、新イベント(outbound_click)へ寄せる
 *
 * - page_type が top/unknown の場合は送らない（データ汚染回避）
 * - content_id が unknown/空の場合は送らない
 * - href / partner / cta_position が空の場合は送らない
 */
export function trackOutbound(payload: OutboundPayload): void {
  if (typeof window === "undefined") return;

  if (
    !isNonEmptyString(payload?.href) ||
    !isNonEmptyString(payload?.partner) ||
    !isNonEmptyString(payload?.cta_position)
  ) {
    return;
  }

  const pathname = window.location?.pathname ?? "/";
  const { page_type, content_id } = parsePathForContext(pathname);

  if (page_type === "top" || page_type === "unknown") return;
  if (!isNonEmptyString(content_id) || content_id === "unknown") return;

  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!gtag) return;

  gtag("event", "outbound_click", {
    page_type,
    content_id,
    partner: payload.partner,
    url: payload.href,
    cta_position: payload.cta_position,
  });
}
