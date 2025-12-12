import demo from "@/data/affiliateLinks.demo.json";
import prod from "@/data/affiliateLinks.prod.json";

type MonetizeKey =
  | "sell_basic_checklist"
  | "sell_import_highclass"
  | "sell_timing"
  | "sell_loan_remain"
  | "insurance_compare_core"
  | "insurance_saving"
  | "insurance_after_accident"
  | "shaken_rakuten"
  | "insurance_corporate"
  | "goods_drive_recorder"
  | "goods_child_seat"
  | "goods_car_wash_coating"
  | "goods_interior_clean"
  | "goods_jump_starter";

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
  return env === "prod" ? (prod as AffiliateJsonShape) : (demo as AffiliateJsonShape);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * guide.monetizeKey に応じて、GuideMonetizeBlock が期待する links 形へ変換する。
 * - monetizeKey はあるがURLが欠損している場合は null を返す（安全に非表示にできる）
 */
export function resolveAffiliateLinksForGuide(input: {
  monetizeKey?: string | null;
}): AffiliateLinksMap | null {
  const monetizeKey = input.monetizeKey as MonetizeKey | null | undefined;
  if (!monetizeKey || !nonEmpty(monetizeKey)) return null;

  const data = pickAffiliateJson();

  const out: AffiliateLinksMap = {};

  switch (monetizeKey) {
    case "sell_basic_checklist":
    case "sell_timing":
      if (nonEmpty(data.carSell?.ikkatsu)) out.carSellIkkatsuUrl = data.carSell.ikkatsu;
      break;

    case "sell_import_highclass":
      if (nonEmpty(data.carSell?.import)) out.carSellImportUrl = data.carSell.import;
      break;

    case "sell_loan_remain":
      if (nonEmpty(data.carSell?.loanRemain)) out.carSellLoanRemainUrl = data.carSell.loanRemain;
      break;

    case "insurance_compare_core":
      if (nonEmpty(data.insuranceCompare?.core)) out.insuranceCompareUrl = data.insuranceCompare.core;
      break;

    case "insurance_saving":
      if (nonEmpty(data.insuranceCompare?.saving)) out.insuranceCompareUrl = data.insuranceCompare.saving;
      break;

    case "insurance_after_accident":
      if (nonEmpty(data.insuranceConsult?.afterAccident)) out.insuranceConsultUrl = data.insuranceConsult.afterAccident;
      break;

    case "insurance_corporate":
      if (nonEmpty(data.insuranceBiz?.corporate)) out.insuranceBizConsultUrl = data.insuranceBiz.corporate;
      break;

    case "shaken_rakuten":
      if (nonEmpty(data.shaken?.rakuten)) out.shakenRakutenUrl = data.shaken.rakuten;
      break;

    case "goods_drive_recorder":
      if (nonEmpty(data.amazon?.driveRecorder)) out.amazonDriveRecorderUrl = data.amazon.driveRecorder;
      break;

    case "goods_child_seat":
      if (nonEmpty(data.amazon?.childSeat)) out.amazonChildSeatUrl = data.amazon.childSeat;
      break;

    case "goods_car_wash_coating":
      if (nonEmpty(data.amazon?.carWash)) out.amazonCarWashUrl = data.amazon.carWash;
      break;

    case "goods_interior_clean":
      if (nonEmpty(data.amazon?.interiorClean)) out.amazonInteriorCleanUrl = data.amazon.interiorClean;
      break;

    case "goods_jump_starter":
      if (nonEmpty(data.amazon?.jumpStarter)) out.amazonJumpStarterUrl = data.amazon.jumpStarter;
      break;

    default:
      return null;
  }

  const hasAny = Object.values(out).some((v) => nonEmpty(v));
  return hasAny ? out : null;
}
