// lib/gtag.ts
type OutboundPayload = {
  event: "outbound_click";
  partner: string;
  href: string;
  cta_position: string;
};

export function trackOutbound(payload: OutboundPayload): void {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!gtag) return;

  gtag("event", payload.event, {
    partner: payload.partner,
    href: payload.href,
    cta_position: payload.cta_position,
    page_path: window.location.pathname,
  });
}
