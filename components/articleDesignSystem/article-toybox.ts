import type { ArticleDesignSpec } from "@/lib/content-types";

export const SHARED_ARTICLE_TOYBOX_PRESET = "cbj-shared-editorial-v1";
export const SHARED_ARTICLE_TOYBOX_CLASS = "cbj-shared-article-v1";
export const LEGACY_KIMI_TOYBOX_CLASS = "cbj-kimi-v15";

const SHARED_TOYBOX_LAYOUT_PRESETS = new Set([
  SHARED_ARTICLE_TOYBOX_PRESET,
  "cbj-article-toybox-v1",
  "cbj-guide-column-v1",
  "cbj-world-renewal-v1",
  "cbj-kimi-v15",
  "column-renewal-v1",
]);

export type ResolvedArticleToyBox = {
  enabled: boolean;
  id: "standard" | typeof SHARED_ARTICLE_TOYBOX_PRESET;
  pageClassName: string;
  compactFlowTitles: boolean;
};

export function resolveArticleToyBox(design?: ArticleDesignSpec | null): ResolvedArticleToyBox {
  // v2では新デザイントークンを適用するため、v1のモック再現レイヤーを無効化する。
  if (design?.version === "cbj-world-v2") {
    return {
      enabled: false,
      id: "standard",
      pageClassName: "",
      compactFlowTitles: false,
    };
  }
  const preset = design?.layoutPreset?.trim() ?? "";
  const enabled = SHARED_TOYBOX_LAYOUT_PRESETS.has(preset);

  if (!enabled) {
    return {
      enabled: false,
      id: "standard",
      pageClassName: "",
      compactFlowTitles: false,
    };
  }

  return {
    enabled: true,
    id: SHARED_ARTICLE_TOYBOX_PRESET,
    pageClassName: `${SHARED_ARTICLE_TOYBOX_CLASS} ${LEGACY_KIMI_TOYBOX_CLASS}`,
    compactFlowTitles: true,
  };
}
