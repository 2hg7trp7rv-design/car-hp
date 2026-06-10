import type { HeritageItem } from "@/lib/content-types";

export const HERITAGE_DISPLAY_TAGS = [
  "日本スポーツの転換点",
  "日本名車の系譜",
  "フェラーリの系譜",
  "スーパーカーの思想",
  "GTと高級車の思想",
  "工学と設計思想",
] as const;

export type HeritageDisplayTag = (typeof HERITAGE_DISPLAY_TAGS)[number];

const HERITAGE_DISPLAY_TAG_SET = new Set<string>(HERITAGE_DISPLAY_TAGS);

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isKnownHeritageDisplayTag(value: unknown): value is HeritageDisplayTag {
  return HERITAGE_DISPLAY_TAG_SET.has(normalize(value));
}

function fallbackHeritageDisplayTag(
  item: Pick<HeritageItem, "slug" | "tags" | "title" | "brandName" | "maker">,
): HeritageDisplayTag {
  const haystack = [
    normalize(item.slug),
    normalize(item.title),
    normalize(item.brandName),
    normalize(item.maker),
    ...(item.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (/ferrari|laferrari|sf90|f40|purosangue|812|550|gtc4|roma|mid-engine|front-engine/.test(haystack)) {
    return "フェラーリの系譜";
  }

  if (/lamborghini|mclaren|supercar|diablo|temerario|nsx|hypercar/.test(haystack)) {
    return "スーパーカーの思想";
  }

  if (/w140|s-class|celsior|ls400|lexus|flagship|luxury|silence|precision/.test(haystack)) {
    return "GTと高級車の思想";
  }

  if (/engineering|parts-bin|fd3s|rx-7|rotary|software-performance/.test(haystack)) {
    return "工学と設計思想";
  }

  if (/skyline|fairlady|hakosuka|roadster|miata|ae86|integra|type-r/.test(haystack)) {
    return "日本名車の系譜";
  }

  return "日本スポーツの転換点";
}

export function resolveHeritageDisplayTag(
  item: Pick<HeritageItem, "displayTag" | "slug" | "tags" | "title" | "brandName" | "maker">,
): HeritageDisplayTag {
  const explicit = normalize(item.displayTag);
  if (HERITAGE_DISPLAY_TAG_SET.has(explicit)) return explicit as HeritageDisplayTag;
  return fallbackHeritageDisplayTag(item);
}
