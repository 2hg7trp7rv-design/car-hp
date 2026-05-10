import type { ColumnItem, GuideItem } from "@/lib/content-types";

export const SHARED_DISPLAY_TAGS = [
  "車選び",
  "中古車",
  "輸入車",
  "支払い",
  "維持費",
  "保険",
  "売却",
  "手続き",
  "トラブル",
] as const;

export type SharedDisplayTag = (typeof SHARED_DISPLAY_TAGS)[number];

export const GUIDE_DISPLAY_TAGS = SHARED_DISPLAY_TAGS;
export const COLUMN_DISPLAY_TAGS = SHARED_DISPLAY_TAGS;

const DISPLAY_TAG_SET = new Set<string>(SHARED_DISPLAY_TAGS);

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isKnownDisplayTag(value: unknown): value is SharedDisplayTag {
  const tag = normalize(value);
  return DISPLAY_TAG_SET.has(tag);
}

function guideFallbackByCategory(category?: string | null): SharedDisplayTag {
  switch ((category ?? "").toUpperCase()) {
    case "BUY":
    case "BEGINNER":
    case "ADVANCED":
      return "車選び";
    case "MONEY":
    case "LEASE":
      return "支払い";
    case "SELL":
      return "売却";
    case "MAINTENANCE":
    case "MAINTENANCE_COST":
      return "維持費";
    case "INSURANCE":
      return "保険";
    case "TROUBLE":
      return "トラブル";
    case "LIFE":
      return "手続き";
    default:
      return "車選び";
  }
}

function columnFallbackByCategory(category?: string | null): SharedDisplayTag {
  switch ((category ?? "").toUpperCase()) {
    case "MARKET":
      return "中古車";
    case "MONEY":
      return "支払い";
    case "MAINTENANCE":
      return "維持費";
    case "TROUBLE":
      return "トラブル";
    case "TECHNICAL":
      return "維持費";
    case "OWNER_STORY":
    case "LIFESTYLE":
      return "車選び";
    default:
      return "車選び";
  }
}

export function resolveGuideDisplayTag(guide: Pick<GuideItem, "displayTag" | "category">): SharedDisplayTag {
  const explicit = normalize(guide.displayTag);
  if (DISPLAY_TAG_SET.has(explicit)) return explicit as SharedDisplayTag;
  return guideFallbackByCategory(guide.category);
}

export function resolveColumnDisplayTag(column: Pick<ColumnItem, "displayTag" | "category">): SharedDisplayTag {
  const explicit = normalize(column.displayTag);
  if (DISPLAY_TAG_SET.has(explicit)) return explicit as SharedDisplayTag;
  return columnFallbackByCategory(column.category);
}
