import type { ColumnItem, GuideItem } from "@/lib/content-types";

export const DECISION_COLUMN_MIN = {
  bodyLen: 1200,
  headings: 3,
  keyPoints: 3,
  checkpoints: 3,
  faq: 2,
  detailSections: 3,
  detailBlocks: 6,
  actionLinks: 1,
  sources: 3,
} as const;

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => safeString(entry)).filter(Boolean)
    : [];
}

export function countDecisionMarkdownHeadings(body: string): number {
  if (typeof body !== "string") return 0;
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{2,3}\s+/.test(line)).length;
}

export function isDecisionColumn(column: Pick<ColumnItem, "layoutVariant"> | null | undefined): boolean {
  const variant = safeString(column?.layoutVariant).toLowerCase();
  return variant === "decision-v1";
}

export function isDecisionGuide(guide: Pick<GuideItem, "layoutVariant"> | null | undefined): boolean {
  return safeString(guide?.layoutVariant).toLowerCase() === "decision-v1";
}

export type DecisionStats = {
  keyPointsCount: number;
  checkpointsCount: number;
  faqCount: number;
  detailSectionsCount: number;
  detailBlocksCount: number;
  actionTitle: string;
  actionLinksCount: number;
  sourcesCount: number;
};

function getDecisionStats(item: {
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  faq?: Array<{ question: string; answer: string }> | null;
  detailSections?: Array<{ title: string; blocks: unknown[] }> | null;
  actionBox?: { title: string; actions: Array<{ label: string; href: string }> } | null;
  sources?: string[] | null;
} | null | undefined): DecisionStats {
  const keyPoints = normalizeStringList(item?.keyPoints);
  const checkpoints = normalizeStringList(item?.checkpoints);
  const faq = Array.isArray(item?.faq)
    ? item.faq.filter((entry) => safeString(entry?.question) && safeString(entry?.answer))
    : [];
  const detailSections = Array.isArray(item?.detailSections)
    ? item.detailSections.filter(
        (section) => safeString(section?.title) && Array.isArray(section?.blocks) && section.blocks.length > 0,
      )
    : [];
  const detailBlocks = detailSections.reduce(
    (sum, section) => sum + (Array.isArray(section?.blocks) ? section.blocks.filter(Boolean).length : 0),
    0,
  );
  const actionTitle = safeString(item?.actionBox?.title);
  const actionLinks = Array.isArray(item?.actionBox?.actions)
    ? item.actionBox.actions.filter((action) => safeString(action?.label) && safeString(action?.href))
    : [];
  const sources = normalizeStringList(item?.sources);

  return {
    keyPointsCount: keyPoints.length,
    checkpointsCount: checkpoints.length,
    faqCount: faq.length,
    detailSectionsCount: detailSections.length,
    detailBlocksCount: detailBlocks,
    actionTitle,
    actionLinksCount: actionLinks.length,
    sourcesCount: sources.length,
  };
}

export function getDecisionColumnStats(column: ColumnItem): DecisionStats {
  return getDecisionStats(column);
}

function blockText(block: any): string[] {
  if (!block || typeof block !== "object") return [];
  switch (block.type) {
    case "paragraph":
    case "quote":
      return safeString(block.text) ? [safeString(block.text)] : [];
    case "list":
      return normalizeStringList(block.items).map((item) => `- ${item}`);
    case "comparisonTable": {
      const lines: string[] = [];
      const title = safeString(block.title);
      const headers = normalizeStringList(block.headers);
      const rows = Array.isArray(block.rows)
        ? block.rows
            .filter((row: unknown) => Array.isArray(row))
            .map((row: unknown[]) => row.map((cell) => safeString(cell)).filter(Boolean))
            .filter((row: string[]) => row.length > 0)
        : [];
      const note = safeString(block.note);
      if (title) lines.push(title);
      if (headers.length > 0) lines.push(headers.join(" | "));
      lines.push(...rows.map((row: string[]) => row.join(" | ")));
      if (note) lines.push(note);
      return lines;
    }
    case "callout": {
      const lines: string[] = [];
      const title = safeString(block.title);
      const body = safeString(block.body);
      if (title) lines.push(title);
      if (body) lines.push(body);
      lines.push(...normalizeStringList(block.items).map((item) => `- ${item}`));
      return lines;
    }
    case "flow": {
      const steps = Array.isArray(block.steps) ? block.steps : [];
      return steps.flatMap((step: any, index: number) => {
        const lines: string[] = [];
        const title = safeString(step?.title);
        const body = safeString(step?.body);
        if (title) lines.push(`${index + 1}. ${title}`);
        if (body) lines.push(`${index + 1}. ${body}`);
        return lines;
      });
    }
    case "timeline": {
      const items = Array.isArray(block.items) ? block.items : [];
      return items.flatMap((item: any) => {
        const lines: string[] = [];
        const label = safeString(item?.label);
        const title = safeString(item?.title);
        const body = safeString(item?.body);
        if (label) lines.push(label);
        if (title) lines.push(title);
        if (body) lines.push(body);
        lines.push(...normalizeStringList(item?.items).map((entry) => `- ${entry}`));
        return lines;
      });
    }
    case "decisionCards": {
      const cards = Array.isArray(block.cards) ? block.cards : [];
      return cards.flatMap((card: any) => {
        const lines: string[] = [];
        const badge = safeString(card?.badge);
        const title = safeString(card?.title);
        const body = safeString(card?.body);
        if (badge) lines.push(badge);
        if (title) lines.push(title);
        if (body) lines.push(body);
        lines.push(...normalizeStringList(card?.items).map((entry) => `- ${entry}`));
        return lines;
      });
    }
    case "caseStudy": {
      const cases = Array.isArray(block.cases) ? block.cases : [];
      return cases.flatMap((entry: any) => {
        const lines: string[] = [];
        const title = safeString(entry?.title);
        const intro = safeString(entry?.intro);
        if (title) lines.push(title);
        if (intro) lines.push(intro);
        const rows = Array.isArray(entry?.rows) ? entry.rows : [];
        rows.forEach((row: any) => {
          const label = safeString(row?.label);
          const value = safeString(row?.value);
          if (label && value) lines.push(`${label}: ${value}`);
          const note = safeString(row?.note);
          if (note) lines.push(note);
        });
        return lines;
      });
    }
    default:
      return [];
  }
}

function buildDecisionBody(item: ColumnItem | GuideItem): string {
  const chunks: string[] = [];

  const lead = safeString(item.lead);
  if (lead) chunks.push(lead);

  const keyPoints = normalizeStringList(item.keyPoints);
  if (keyPoints.length > 0) {
    chunks.push("## 要点");
    chunks.push(...keyPoints.map((entry) => `- ${entry}`));
  }

  const checkpoints = normalizeStringList(item.checkpoints);
  if (checkpoints.length > 0) {
    chunks.push("## 確認ポイント");
    chunks.push(...checkpoints.map((entry) => `- ${entry}`));
  }

  const sections = Array.isArray(item.detailSections) ? item.detailSections : [];
  sections.forEach((section) => {
    const title = safeString(section?.title);
    if (!title) return;
    chunks.push(`## ${title}`);
    const blocks = Array.isArray(section?.blocks) ? section.blocks : [];
    blocks.forEach((block) => {
      chunks.push(...blockText(block));
    });
  });

  const faq = Array.isArray(item.faq) ? item.faq : [];
  if (faq.length > 0) {
    chunks.push("## よくある質問");
    faq.forEach((entry) => {
      const question = safeString(entry?.question);
      const answer = safeString(entry?.answer);
      if (question) chunks.push(`### ${question}`);
      if (answer) chunks.push(answer);
    });
  }

  const actionBox = item.actionBox;
  const actionTitle = safeString(actionBox?.title);
  if (actionTitle) {
    chunks.push(`## ${actionTitle}`);
    const actionBody = safeString(actionBox?.body);
    if (actionBody) chunks.push(actionBody);
    const actions = Array.isArray(actionBox?.actions) ? actionBox.actions : [];
    actions.forEach((action) => {
      const label = safeString(action?.label);
      const href = safeString(action?.href);
      if (label && href) chunks.push(`- ${label} ${href}`);
    });
  }

  return chunks
    .map((line) => safeString(line))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function getDecisionColumnAuditBody(column: ColumnItem): string {
  const rawBody = safeString(column.body);
  if (rawBody) return rawBody;
  return buildDecisionBody(column);
}
