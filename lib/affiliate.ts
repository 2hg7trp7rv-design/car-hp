// lib/affiliate.ts

import demo from "@/data/affiliateLinks.demo.json";
import prod from "@/data/affiliateLinks.prod.json";

import type { MonetizeKey } from "@/lib/content-types";
import { withAmazonTag } from "@/lib/amazon";

export type AffiliateLinksMap = {
  carSellIkkatsuUrl?: string;
  carSellImportUrl?: string;
  carSellLoanRemainUrl?: string;

  insuranceCompareUrl?: string;
  insuranceConsultUrl?: string;
  insuranceBizConsultUrl?: string;

  shakenRakutenUrl?: string;

  leaseSompoNoruUrl?: string;
  leaseEnkiloUrl?: string;

  amazonDriveRecorderUrl?: string;
  amazonChildSeatUrl?: string;
  amazonCarWashUrl?: string;
  amazonInteriorCleanUrl?: string;
  amazonJumpStarterUrl?: string;

  // A8/直リンク（ショップ系）
  goodsNagaraCarwashUrl?: string;
  goodsCarclubUrl?: string;
  goodsHidyaUrl?: string;

  // v1.2
  carSearchUrl?: string;
  loanCheckUrl?: string;
};

type AffiliateJsonShape = {
  insuranceCompare?: Record<string, unknown>;
  insuranceConsult?: Record<string, unknown>;
  insuranceBiz?: Record<string, unknown>;

  carSell?: Record<string, unknown>;
  shaken?: Record<string, unknown>;
  lease?: Record<string, unknown>;
  shops?: Record<string, unknown>;
  amazon?: Record<string, unknown>;

  // legacy bucket (互換)
  insurance?: Record<string, unknown>;
  carSearch?: Record<string, unknown>;
  loan?: Record<string, unknown>;
};

function pickAffiliateJson(): AffiliateJsonShape {
  const env = (process.env.NEXT_PUBLIC_AFFILIATE_ENV ?? "demo").toLowerCase();
  return env === "prod" ? (prod as AffiliateJsonShape) : (demo as AffiliateJsonShape);
}

function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function pickString(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (nonEmpty(v)) return v;
  }
  return undefined;
}

function pickOverride(input?: Record<string, string> | null): Record<string, string> | null {
  if (!input) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (nonEmpty(v)) out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * guide.monetizeKey に応じて、GuideMonetizeBlock が期待する links 形へ変換する。
 *
 * - monetizeKey はあるがURLが欠損している場合は null を返す（安全に非表示にできる）
 * - guide.affiliateLinks（上書き）があれば、解決結果にマージして「上書き優先」にする
 */
export function resolveAffiliateLinksForGuide(input: {
  monetizeKey?: MonetizeKey | string | null;
  affiliateLinks?: Record<string, string> | null;
}): AffiliateLinksMap | null {
  const monetizeKey = (input.monetizeKey ?? null) as string | null;
  if (!monetizeKey || !nonEmpty(monetizeKey)) return null;

  const data = pickAffiliateJson();
  const resolved: AffiliateLinksMap = {};

  // alias（旧→新）
  const normalizedKey =
    monetizeKey === "ins_compare" ? "insurance_compare_core" : monetizeKey;

  switch (normalizedKey) {
    // ─── Aピラー: 売却（v1.2） ────────────────────────
    case "sell_price_check":
    case "sell_prepare":
    case "sell_ikkatsu_phone":
    case "sell_basic_checklist":
    case "sell_timing":
      {
        const url =
          pickString(data.carSell, ["ikkatsu", "ikkatsuUrl", "ikkatsu_url"]) ??
          pickString(data.carSell, ["import", "importUrl"]) ??
          pickString(data.carSell, ["loanRemain", "loanRemainUrl"]);
        if (nonEmpty(url)) resolved.carSellIkkatsuUrl = url;
      }
      break;

    case "sell_import_highclass":
      {
        const url = pickString(data.carSell, ["import", "importUrl"]);
        if (nonEmpty(url)) resolved.carSellImportUrl = url;
      }
      break;

    case "sell_loan_remain":
      {
        const url = pickString(data.carSell, ["loanRemain", "loanRemainUrl", "loanRemain_url"]);
        if (nonEmpty(url)) resolved.carSellLoanRemainUrl = url;
      }
      break;

    // ─── 新仕様: 中古車探し・ローン（v1.2） ─────────────
    case "car_search_conditions":
    case "car_search_price":
      {
        const url = pickString(data.carSearch, ["general", "carSearchUrl", "carSearch", "url"]);
        if (nonEmpty(url)) resolved.carSearchUrl = url;
      }
      break;

    case "loan_estimate":
    case "loan_precheck":
      {
        const url = pickString(data.loan, ["general", "loanCheckUrl", "loanCheck", "url"]);
        if (nonEmpty(url)) resolved.loanCheckUrl = url;
      }
      break;

    // ─── 保険（インズウェブ） ─────────────────────────
    case "insurance_compare_core":
      {
        const url =
          pickString(data.insuranceCompare, ["core", "general", "url"]) ??
          pickString(data.insurance, ["compareUrl", "compare", "url"]);
        if (nonEmpty(url)) resolved.insuranceCompareUrl = url;
      }
      break;

    case "insurance_saving":
      {
        const url =
          pickString(data.insuranceCompare, ["saving", "core", "general", "url"]) ??
          pickString(data.insurance, ["compareUrl", "compare", "url"]);
        if (nonEmpty(url)) resolved.insuranceCompareUrl = url;
      }
      break;

    case "insurance_after_accident":
      {
        const url = pickString(data.insuranceConsult, ["afterAccident", "after_accident", "url"]);
        if (nonEmpty(url)) resolved.insuranceConsultUrl = url;
      }
      break;

    case "insurance_corporate":
      {
        const url =
          pickString(data.insuranceBiz, ["corporate", "url"]) ??
          pickString(data.insurance, ["bizConsultUrl", "bizConsult", "url"]);
        if (nonEmpty(url)) resolved.insuranceBizConsultUrl = url;
      }
      break;

    case "shaken_rakuten":
      {
        const url = pickString(data.shaken, ["rakuten", "rakutenUrl", "url"]);
        if (nonEmpty(url)) resolved.shakenRakutenUrl = url;
      }
      break;

    // ─── カーリース（SOMPOで乗ーる） ───────────────────
    case "lease_sompo_noru":
      {
        const url = pickString(data.lease, ["sompoNoru", "sompoNoruUrl", "url"]);
        if (nonEmpty(url)) resolved.leaseSompoNoruUrl = url;
      }
      break;

    // ─── カーリース（エンキロ） ───────────────────────
    case "lease_enkilo":
      {
        const url = pickString(data.lease, ["enkilo", "enkiloUrl", "url"]);
        if (nonEmpty(url)) resolved.leaseEnkiloUrl = url;
      }
      break;

    // ─── Amazon ──────────────────────────────────────
    case "goods_drive_recorder":
      {
        const url = pickString(data.amazon, ["driveRecorder", "driveRecorderUrl", "url"]);
        if (nonEmpty(url)) resolved.amazonDriveRecorderUrl = withAmazonTag(url);
      }
      break;

    case "goods_child_seat":
      {
        const url = pickString(data.amazon, ["childSeat", "childSeatUrl", "url"]);
        if (nonEmpty(url)) resolved.amazonChildSeatUrl = withAmazonTag(url);
      }
      break;

    case "goods_car_wash_coating":
      {
        const url = pickString(data.amazon, ["carWash", "carWashUrl", "url"]);
        if (nonEmpty(url)) resolved.amazonCarWashUrl = withAmazonTag(url);
      }
      break;

    case "goods_interior_clean":
      {
        const url = pickString(data.amazon, ["interiorClean", "interiorCleanUrl", "url"]);
        if (nonEmpty(url)) resolved.amazonInteriorCleanUrl = withAmazonTag(url);
      }
      break;

    case "goods_jump_starter":
      {
        const url = pickString(data.amazon, ["jumpStarter", "jumpStarterUrl", "url"]);
        if (nonEmpty(url)) resolved.amazonJumpStarterUrl = withAmazonTag(url);
      }
      break;

    // ─── Shops（A8/直リンク） ─────────────────────────
    case "goods_nagara_carwash":
      {
        const url = pickString(data.shops, ["nagaraCarwash", "nagaraCarwashUrl", "url"]);
        if (nonEmpty(url)) resolved.goodsNagaraCarwashUrl = url;
      }
      break;

    case "goods_carclub":
      {
        const url = pickString(data.shops, ["carclub", "carclubUrl", "url"]);
        if (nonEmpty(url)) resolved.goodsCarclubUrl = url;
      }
      break;

    case "goods_hidya":
      {
        const url = pickString(data.shops, ["hidya", "hidyaUrl", "url"]);
        if (nonEmpty(url)) resolved.goodsHidyaUrl = url;
      }
      break;

    default:
      return null;
  }

  const override = pickOverride(input.affiliateLinks);
  const merged: AffiliateLinksMap = { ...resolved, ...(override ?? {}) };

  const hasAny = Object.values(merged).some((v) => nonEmpty(v));
  return hasAny ? merged : null;
}

function safeEncodePathSegment(input: string): string {
  // encodeURIComponent は "/" などを残さないのでURLパスに安全
  return encodeURIComponent(input).replace(/%20/g, "+");
}

/**
 * monetizeKey から「外部遷移URL（1本）」を解決する（Cars / Column / Guide 共通で使える）。
 * - Amazon は tag を強制付与
 * - carName がある場合、在庫検索はフリーワード検索URLへ寄せる
 */
export function resolveOutboundUrl(input: {
  monetizeKey?: MonetizeKey | string | null;
  carName?: string | null;
}): string | null {
  const monetizeKey = (input.monetizeKey ?? null) as string | null;
  if (!monetizeKey || !nonEmpty(monetizeKey)) return null;

  const links = resolveAffiliateLinksForGuide({ monetizeKey });
  if (!links) return null;

  const normalizedKey = monetizeKey === "ins_compare" ? "insurance_compare_core" : monetizeKey;

  // keyごとに「どのURLを返すか」を固定
  switch (normalizedKey) {
    case "car_search_conditions":
    case "car_search_price": {
      const base = links.carSearchUrl;
      if (!nonEmpty(base)) return null;

      const name = (input.carName ?? "").trim();
      if (!name) return base;

      // Carsensor: /usedcar/freeword/<keyword>/index.html を優先
      try {
        const u = new URL(base);
        if (u.hostname.includes("carsensor.net")) {
          const kw = safeEncodePathSegment(name);
          return `https://www.carsensor.net/usedcar/freeword/${kw}/index.html`;
        }
      } catch {
        // noop
      }
      return base;
    }

    case "loan_estimate":
    case "loan_precheck":
      return nonEmpty(links.loanCheckUrl) ? links.loanCheckUrl : null;

    case "sell_price_check":
    case "sell_prepare":
    case "sell_ikkatsu_phone":
    case "sell_basic_checklist":
    case "sell_timing":
      return nonEmpty(links.carSellIkkatsuUrl) ? links.carSellIkkatsuUrl : null;

    case "sell_import_highclass":
      return nonEmpty(links.carSellImportUrl) ? links.carSellImportUrl : null;

    case "sell_loan_remain":
      return nonEmpty(links.carSellLoanRemainUrl) ? links.carSellLoanRemainUrl : null;

    case "insurance_compare_core":
    case "insurance_saving":
      return nonEmpty(links.insuranceCompareUrl) ? links.insuranceCompareUrl : null;

    case "insurance_after_accident":
      return nonEmpty(links.insuranceConsultUrl) ? links.insuranceConsultUrl : null;

    case "insurance_corporate":
      return nonEmpty(links.insuranceBizConsultUrl) ? links.insuranceBizConsultUrl : null;

    case "shaken_rakuten":
      return nonEmpty(links.shakenRakutenUrl) ? links.shakenRakutenUrl : null;

    case "lease_sompo_noru":
      return nonEmpty(links.leaseSompoNoruUrl) ? links.leaseSompoNoruUrl : null;

    case "lease_enkilo":
      return nonEmpty(links.leaseEnkiloUrl) ? links.leaseEnkiloUrl : null;

    case "goods_drive_recorder":
      return nonEmpty(links.amazonDriveRecorderUrl) ? links.amazonDriveRecorderUrl : null;

    case "goods_child_seat":
      return nonEmpty(links.amazonChildSeatUrl) ? links.amazonChildSeatUrl : null;

    case "goods_car_wash_coating":
      return nonEmpty(links.amazonCarWashUrl) ? links.amazonCarWashUrl : null;

    case "goods_interior_clean":
      return nonEmpty(links.amazonInteriorCleanUrl) ? links.amazonInteriorCleanUrl : null;

    case "goods_jump_starter":
      return nonEmpty(links.amazonJumpStarterUrl) ? links.amazonJumpStarterUrl : null;

    case "goods_nagara_carwash":
      return nonEmpty(links.goodsNagaraCarwashUrl) ? links.goodsNagaraCarwashUrl : null;

    case "goods_carclub":
      return nonEmpty(links.goodsCarclubUrl) ? links.goodsCarclubUrl : null;

    case "goods_hidya":
      return nonEmpty(links.goodsHidyaUrl) ? links.goodsHidyaUrl : null;

    default:
      return null;
  }
}
