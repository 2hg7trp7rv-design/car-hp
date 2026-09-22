import affiliateLinks from "@/data/affiliateLinks.prod.json";

export const CHOICE_GUIDES = [
  { slug: "drive-recorder", title: "ドライブレコーダー", theme: "電装・安全装備", description: "残したい範囲、夜の映像、駐車中の電源。使う場面から必要な機能を絞る。", learningHref: "/learn/driving-support" },
  { slug: "car-wash", title: "洗車用品", theme: "メンテナンス", description: "塗装とコーティングに合う洗剤を選び、洗う・すすぐ・拭く道具をそろえる。", learningHref: "/learn/maintenance" },
  { slug: "air-filter", title: "エアフィルター", theme: "吸気・排気", description: "純正を保つ選択も含めて、交換する目的、車両適合、続けられる管理を比べる。", learningHref: "/learn/air-cleaner" },
  { slug: "shaken", title: "車検の受け先", theme: "メンテナンス", description: "費用の内訳、預ける日数、整備の相談先。何を優先するかで受け先が変わる。", learningHref: "/learn/maintenance" },
] as const;

/**
 * Service links (inspection booking, valuation, insurance quotes). Unlike the Amazon
 * searches these are partner destinations, and only some of them are monetized: a link
 * is marked as advertising when it goes through the affiliate network's own domain,
 * so a plain partner link is never labelled PR and a paid one always is.
 */
export type ServiceOfferKey = "shaken" | "carSell" | "insuranceCompare" | "lease";
export type ServiceOffer = { key: ServiceOfferKey; href: string; host: string; sponsored: boolean };
const SERVICE_SOURCES: Record<ServiceOfferKey, string> = {
  shaken: affiliateLinks.shaken.rakuten,
  carSell: affiliateLinks.carSell.ikkatsu,
  insuranceCompare: affiliateLinks.insuranceCompare.core,
  lease: affiliateLinks.lease.sompoNoru || affiliateLinks.lease.sompoNoruUrl,
};
const SERVICE_HOSTS = new Set([
  "px.a8.net",
  "car.rakuten.co.jp",
  "kaitori.carsensor.net",
  "sompo-de-noru.jp",
]);
/** px.a8.net is the affiliate network's redirect; anything through it pays a reward. */
const SPONSORED_HOSTS = new Set(["px.a8.net"]);

export function getServiceOffer(
  key: ServiceOfferKey,
  href: string = SERVICE_SOURCES[key],
): ServiceOffer | null {
  if (!href || href !== href.trim()) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (!SERVICE_HOSTS.has(url.hostname)) return null;
    return { key, href, host: url.hostname, sponsored: SPONSORED_HOSTS.has(url.hostname) };
  } catch {
    return null;
  }
}

export type AmazonOfferKey = "driveRecorder" | "carWash";
export type AmazonSearchOffer = { key: AmazonOfferKey; href: string; label: string };
export const AMAZON_DISCLOSURE = "Amazonのアソシエイトとして、CAR BOUTIQUE JOURNALは適格販売により収入を得ています。";

/** Read only the approved saved search links; preserve their original URL bytes. */
export function getAmazonSearchOffer(
  key: AmazonOfferKey,
  href: string = affiliateLinks.amazon[key],
): AmazonSearchOffer | null {
  if (key !== "driveRecorder" && key !== "carWash") return null;
  if (!href || href !== href.trim()) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.hostname !== "www.amazon.co.jp" ||
      url.port || url.username || url.password || url.hash || url.pathname !== "/s" ||
      !url.searchParams.get("k")?.trim() || url.searchParams.getAll("tag").length !== 1 ||
      url.searchParams.get("tag") !== "carboutique-22") return null;
    return { key, href, label: "Amazonで候補を探す（広告）" };
  } catch {
    return null;
  }
}
