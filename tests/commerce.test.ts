import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import affiliateLinks from "../data/affiliateLinks.prod.json";
import { AMAZON_DISCLOSURE, getAmazonSearchOffer, type AmazonOfferKey } from "../lib/commerce";
import { AmazonSearchLink } from "../components/commerce/AmazonSearchLink";
import { CBJ_ANALYTICS_CONSENT_COOKIE } from "../lib/analytics/consent";

test("approved Amazon search destinations retain the saved production URL and tag", () => {
  for (const key of ["driveRecorder", "carWash"] as const) {
    const offer = getAmazonSearchOffer(key);
    assert.ok(offer);
    assert.equal(offer.href, affiliateLinks.amazon[key]);
    assert.equal(new URL(offer.href).searchParams.get("tag"), "carboutique-22");
    assert.equal(offer.label, "Amazonで候補を探す（広告）");
  }
  assert.equal(getAmazonSearchOffer("childSeat" as AmazonOfferKey), null);
});

test("invalid or substituted affiliate destinations do not produce an offer", () => {
  const invalid = [
    "", "not a URL", "javascript:alert(1)",
    "http://www.amazon.co.jp/s?k=car&tag=carboutique-22",
    "https://www.amazon.co.jp.example.com/s?k=car&tag=carboutique-22",
    "https://www.amazon.co.jp@other.example/s?k=car&tag=carboutique-22",
    "https://user@www.amazon.co.jp/s?k=car&tag=carboutique-22",
    "https://www.amazon.co.jp:8443/s?k=car&tag=carboutique-22",
    "https://www.amazon.co.jp/s?k=car&tag=other-22",
    "https://www.amazon.co.jp/s?k=car&tag=carboutique-22&tag=other-22",
    "https://www.amazon.co.jp/s?tag=carboutique-22",
    "https://www.amazon.co.jp/dp/example?tag=carboutique-22",
    " https://www.amazon.co.jp/s?k=car&tag=carboutique-22",
  ];
  for (const href of invalid) assert.equal(getAmazonSearchOffer("carWash", href), null, href);
});

test("the ad is a normal server-rendered link with a clear search label", () => {
  const offer = getAmazonSearchOffer("driveRecorder");
  assert.ok(offer);
  const link = AmazonSearchLink({ offer, contentId: "choose-drive-recorder" });
  const html = renderToStaticMarkup(link);
  assert.equal(link.props.href, offer.href);
  assert.equal(link.props.rel, "sponsored noopener");
  assert.equal(link.props.target, undefined);
  assert.match(html, /<a href="https:\/\/www\.amazon\.co\.jp\/s\?/);
  assert.match(html, /Amazonで候補を探す（広告）/);
  assert.match(AMAZON_DISCLOSURE, /Amazonのアソシエイトとして、CAR BOUTIQUE JOURNALは適格販売により収入を得ています。/);
});

test("outbound custom events respect unset, denied, granted and withdrawn consent", () => {
  const calls: unknown[][] = [];
  const document = { cookie: "" };
  const window = {
    localStorage: { getItem: () => null },
    gtag: (...args: unknown[]) => { calls.push(args); },
  };
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, value: window });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  try {
    const offer = getAmazonSearchOffer("carWash");
    assert.ok(offer);
    const link = AmazonSearchLink({ offer, contentId: "choose-car-wash" });
    link.props.onClick();
    assert.equal(calls.length, 0);
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=denied`;
    link.props.onClick();
    assert.equal(calls.length, 0);
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=granted`;
    link.props.onClick();
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(0, 2), ["event", "outbound_click"]);
    const params = calls[0][2] as Record<string, unknown>;
    assert.equal(params.monetize_key, "amazon.carWash");
    assert.equal(params.content_id, "choose-car-wash");
    assert.equal(params.url, affiliateLinks.amazon.carWash);
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=denied`;
    link.props.onClick();
    assert.equal(calls.length, 1);
    assert.equal(link.props.href, offer.href);
    document.cookie = `${CBJ_ANALYTICS_CONSENT_COOKIE}=granted`;
    window.gtag = () => { throw new Error("Analytics unavailable"); };
    assert.doesNotThrow(() => link.props.onClick());
    assert.equal(link.props.href, offer.href);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
