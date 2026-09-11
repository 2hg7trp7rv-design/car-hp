import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_SETTINGS_EVENT,
  getStoredAnalyticsConsent,
  openConsentSettings,
  setStoredAnalyticsConsent,
} from "../lib/analytics/consent";

test("cookie preferences remain usable when localStorage is blocked", () => {
  const document = { cookie: "" };
  const window = {
    location: { protocol: "https:" },
    localStorage: {
      getItem() { throw new Error("Storage blocked"); },
      setItem() { throw new Error("Storage blocked"); },
    },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: window });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  try {
    assert.equal(getStoredAnalyticsConsent(), "unset");
    setStoredAnalyticsConsent("granted");
    assert.equal(getStoredAnalyticsConsent(), "granted");
    assert.match(document.cookie, /; Secure$/);
    setStoredAnalyticsConsent("denied");
    assert.equal(getStoredAnalyticsConsent(), "denied");
  } finally {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});

test("footer settings dispatch the event consumed by the consent banner", () => {
  const target = new EventTarget();
  let opened = false;
  target.addEventListener(CONSENT_SETTINGS_EVENT, () => { opened = true; });
  Object.defineProperty(globalThis, "window", { configurable: true, value: target });
  try {
    openConsentSettings();
    assert.ok(opened);
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
});
