import type { ArticleBlockPresentation, ArticleDesignSpec } from "@/lib/content-types";

/**
 * COLUMN / GUIDE 共通の記事デザイン部品箱。
 *
 * JSON側は layoutPreset と presentation.variant だけで、同じ見た目の部品を呼び出せる。
 * 既存の column-renewal-v1 / mock-* は互換aliasとして残す。
 */
export const SHARED_ARTICLE_TOYBOX_PRESET = "cbj-shared-editorial-v1";
export const SHARED_ARTICLE_TOYBOX_CLASS = "cbj-shared-article-v1";
export const LEGACY_KIMI_TOYBOX_CLASS = "cbj-kimi-v15";

const SHARED_TOYBOX_LAYOUT_PRESETS = new Set([
  SHARED_ARTICLE_TOYBOX_PRESET,
  "cbj-article-toybox-v1",
  "cbj-guide-column-v1",
  "cbj-world-renewal-v1",
  "cbj-kimi-v15",
  // Existing data compatibility. This was first introduced by the custom-regret column.
  "column-renewal-v1",
]);

const PRESENTATION_VARIANT_ALIASES: Record<string, string> = {
  defaultCard: "default",
  softCard: "soft",
  outlineCard: "outline",
  emphasisCard: "emphasis",
  compactCard: "compact",
  leadText: "lead",
  paragraphLead: "lead",
  sectionTitle: "section",
  sectionHeading: "section",

  // Shared CBJ article toybox aliases. These map to the existing CSS parts.
  summaryCard: "mock-summary",
  cbjSummaryCard: "mock-summary",
  toySummaryCard: "mock-summary",
  infoBox: "mock-info",
  cbjInfoBox: "mock-info",
  toyInfoBox: "mock-info",
  systemCards: "mock-system",
  cbjSystemCards: "mock-system",
  toySystemCards: "mock-system",
  dataTable: "mock-table",
  cbjDataTable: "mock-table",
  toyDataTable: "mock-table",
  checklistCard: "mock-checklist",
  cbjChecklistCard: "mock-checklist",
  toyChecklistCard: "mock-checklist",
  numberedSteps: "mock-numbered",
  cbjNumberedSteps: "mock-numbered",
  toyNumberedSteps: "mock-numbered",
  stepCards: "mock-step-cards",
  cbjStepCards: "mock-step-cards",
  toyStepCards: "mock-step-cards",

  // kebab-case aliases for hand-written JSON.
  "default-card": "default",
  "soft-card": "soft",
  "outline-card": "outline",
  "emphasis-card": "emphasis",
  "compact-card": "compact",
  "lead-text": "lead",
  "paragraph-lead": "lead",
  "section-title": "section",
  "section-heading": "section",
  "summary-card": "mock-summary",
  "cbj-summary-card": "mock-summary",
  "toy-summary-card": "mock-summary",
  "info-box": "mock-info",
  "cbj-info-box": "mock-info",
  "toy-info-box": "mock-info",
  "system-cards": "mock-system",
  "cbj-system-cards": "mock-system",
  "toy-system-cards": "mock-system",
  "data-table": "mock-table",
  "cbj-data-table": "mock-table",
  "toy-data-table": "mock-table",
  "checklist-card": "mock-checklist",
  "cbj-checklist-card": "mock-checklist",
  "toy-checklist-card": "mock-checklist",
  "numbered-steps": "mock-numbered",
  "cbj-numbered-steps": "mock-numbered",
  "toy-numbered-steps": "mock-numbered",
  "step-cards": "mock-step-cards",
  "cbj-step-cards": "mock-step-cards",
  "toy-step-cards": "mock-step-cards",
};

export type ResolvedArticleToyBox = {
  enabled: boolean;
  id: "standard" | typeof SHARED_ARTICLE_TOYBOX_PRESET;
  pageClassName: string;
  compactFlowTitles: boolean;
};

export function resolveArticleToyBox(design?: ArticleDesignSpec | null): ResolvedArticleToyBox {
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

export function resolveArticlePartVariant(value?: string | null): string | null {
  const variant = value?.trim();
  if (!variant) return null;
  return PRESENTATION_VARIANT_ALIASES[variant] ?? variant;
}

export function getArticlePartVariant(presentation?: ArticleBlockPresentation | null): string | null {
  return resolveArticlePartVariant(presentation?.variant);
}

export function isMockArticlePartVariant(value?: string | null): boolean {
  return Boolean(resolveArticlePartVariant(value)?.startsWith("mock-"));
}
