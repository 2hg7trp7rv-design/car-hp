import demo from "@/data/affiliateLinks.demo.json";
import prod from "@/data/affiliateLinks.prod.json";

import type { MonetizeKey } from "@/lib/content-types";

export type AffiliateLinksMap = {
  carSellIkkatsuUrl?: string;
  carSellImportUrl?: string;
  carSellLoanRemainUrl?: string;

  insuranceCompareUrl?: string;
  insuranceConsultUrl?: string;
  insuranceBizConsultUrl?: string;

  shakenRakutenUrl?: string;

  amazonDriveRecorderUrl?: string;
  amazonChildSeatUrl?: string;
  amazonCarWashUrl?: string;
  amazonInteriorCleanUrl?: string;
  amazonJumpStarterUrl?: string;
};

type AffiliateJsonShape = {
  insuranceCompare?: {
    core?: string;
    saving?: string;
  };
  insuranceConsult?: {
    afterAccident?: string;
  };
  insuranceBiz?: {
    corporate?: string;
  };
  carSell?: {
    ikkatsu?: string;
    import?: string;
    loanRemain?: string;
  };
  shaken?: {
    rakuten?: string;
  };
  amazon?: {
    driveRecorder?: string;
    childSeat?: string;
    carWash?: string;
    interiorClean?: string;
    jumpStarter?: string;
  };
};

function pickAffiliateJson(): AffiliateJsonShape {
  const env = (process.env.NEXT_PUBLIC_AFFILIATE_ENV ?? "demo").toLowerCase();
  return env === "prod"
    ? (prod as AffiliateJsonShape)
    : (demo as AffiliateJsonShape);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pickOverride(
  override?: Record<string, string> | null,
): Partial<AffiliateLinksMap> | null {
  if (!override || typeof override !== "object") return null;

  // 想定: override のキーは AffiliateLinksMap のキー（例: insuranceCompareUrl）
  const out: Partial<AffiliateLinksMap> = {};
  for (const [k, v] of Object.entries(override)) {
    if (nonEmpty(v)) {
      (out as any)[k] = v;
    }
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
  const monetizeKey = input.monetizeKey as MonetizeKey | null | undefined;
  if (!monetizeKey || !nonEmpty(monetizeKey)) return null;

  const data = pickAffiliateJson();

  const resolved: AffiliateLinksMap = {};

  switch (monetizeKey) {
    // ─── Aピラー: 売却 ─────────────────────────────
    case "sell_basic_checklist":
    case "sell_timing":
    case "sell_ikkatsu_phone":
      if (nonEmpty(data.carSell?.ikkatsu)) {
        resolved.carSellIkkatsuUrl = data.carSell.ikkatsu;
      }
      break;

    case "sell_import_highclass":
      if (nonEmpty(data.carSell?.import)) {
        resolved.carSellImportUrl = data.carSell.import;
      }
      break;

    case "sell_loan_remain":
      if (nonEmpty(data.carSell?.loanRemain)) {
        resolved.carSellLoanRemainUrl = data.carSell.loanRemain;
      }
      break;

    // ─── Bピラー: 保険・車検 ───────────────────────
    case "insurance_compare_core":
      if (nonEmpty(data.insuranceCompare?.core)) {
        resolved.insuranceCompareUrl = data.insuranceCompare.core;
      }
      break;

    case "insurance_saving":
      if (nonEmpty(data.insuranceCompare?.saving)) {
        resolved.insuranceCompareUrl = data.insuranceCompare.saving;
      }
      break;

    case "insurance_after_accident":
      if (nonEmpty(data.insuranceConsult?.afterAccident)) {
        resolved.insuranceConsultUrl = data.insuranceConsult.afterAccident;
      }
      break;

    case "insurance_corporate":
      if (nonEmpty(data.insuranceBiz?.corporate)) {
        resolved.insuranceBizConsultUrl = data.insuranceBiz.corporate;
      }
      break;

    case "shaken_rakuten":
      if (nonEmpty(data.shaken?.rakuten)) {
        resolved.shakenRakutenUrl = data.shaken.rakuten;
      }
      break;

    // ─── Cピラー: Amazon ───────────────────────────
    case "goods_drive_recorder":
      if (nonEmpty(data.amazon?.driveRecorder)) {
        resolved.amazonDriveRecorderUrl = data.amazon.driveRecorder;
      }
      break;

    case "goods_child_seat":
      if (nonEmpty(data.amazon?.childSeat)) {
        resolved.amazonChildSeatUrl = data.amazon.childSeat;
      }
      break;

    case "goods_car_wash_coating":
      if (nonEmpty(data.amazon?.carWash)) {
        resolved.amazonCarWashUrl = data.amazon.carWash;
      }
      break;

    case "goods_interior_clean":
      if (nonEmpty(data.amazon?.interiorClean)) {
        resolved.amazonInteriorCleanUrl = data.amazon.interiorClean;
      }
      break;

    case "goods_jump_starter":
      if (nonEmpty(data.amazon?.jumpStarter)) {
        resolved.amazonJumpStarterUrl = data.amazon.jumpStarter;
      }
      break;

    default:
      return null;
  }

  const override = pickOverride(input.affiliateLinks);
  const merged: AffiliateLinksMap = {
    ...resolved,
    ...(override ?? {}),
  };

  const hasAny = Object.values(merged).some((v) => nonEmpty(v));
  return hasAny ? merged : null;
}
