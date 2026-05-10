// lib/repository/guides-repository.ts

/**
 * GUIDE Data Source 層
 *
 * 役割:
 * - data/articles/guides/*.json から“生データ”を読み込む
 * - JSON のばらつき(必須項目不足・配列/単体・null混在など)を吸収し、
 *   Domain 層(lib/guides.ts) から扱いやすい GuideItem に正規化する
 *
 * 注意:
 * - 並び順や「published のみ」のフィルタリングは Domain 層側で行う
 * - 将来 1 記事 1 ファイル構成になっても、このファイルの normalize ロジックだけ
 *   差し替えれば上位の呼び出し側はそのまま動く想定
 */

import { readGuidesJsonDir } from "./data-dir";

import type {
  ContentStatus,
  CtaVariant,
  GuideActionBox,
  GuideAuthorProfile,
  GuideBreadcrumbItem,
  GuideCaseStudyItem,
  GuideCaseStudyRow,
  GuideDecisionCard,
  GuideDetailBlock,
  GuideDetailSection,
  GuideFaqItem,
  GuideFlowStep,
  GuideItem,
  GuideCategory,
  GuideLayoutVariant,
  GuideTimelineItem,
  MonetizeKey,
  MonetizeType,
} from "@/lib/content-types";

/**
 * JSON の生データ型
 *
 * - 本来 GuideItem で必須な項目も「未入力かもしれない」前提で全部 optional にしておく
 * - Repository 内で normalize することで、Domain 層には「きちんと埋まっている」GuideItem を渡す
 */
type RawGuideRecord = {
  id?: string;
  slug?: string;
  type?: string;
  status?: ContentStatus;

  publicState?: unknown;
  parentPillarId?: unknown;
  relatedClusterIds?: unknown;
  primaryQuery?: unknown;
  updateReason?: unknown;
  sources?: unknown;

  title?: string;
  titleJa?: string | null;
  subtitle?: string | null;

  summary?: string | null;
  lead?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string | null;

  category?: GuideCategory | null;
  readMinutes?: number | null;
  heroImage?: string | null;
  thumbnail?: string | null;

  body?: string;

  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;

  tags?: unknown;
  displayTag?: unknown;

  relatedCarSlugs?: unknown;
  relatedGuideSlugs?: unknown;
  relatedColumnSlugs?: unknown;
  relatedHeritageSlugs?: unknown;

  intentTags?: unknown;
  ctaVariants?: unknown;

  monetizeKey?: unknown;
  monetizeType?: unknown;
  affiliateLinks?: unknown;
  internalLinks?: unknown;

  layoutVariant?: unknown;
  eyebrowLabel?: unknown;
  breadcrumbTrail?: unknown;
  authorProfile?: unknown;
  keyPoints?: unknown;
  checkpoints?: unknown;
  faq?: unknown;
  actionBox?: unknown;
  detailSections?: unknown;
};

// ----------------------------
// 小ユーティリティ（揺れ吸収）
// ----------------------------

function coerceString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function coerceStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
  }
  if (typeof value === "string") {
    const v = value.trim();
    return v.length > 0 ? [v] : [];
  }
  return [];
}

function coerceMatrix(value: unknown): string[][] {
  if (!Array.isArray(value)) return [];
  const rows: string[][] = [];
  for (const row of value) {
    if (!Array.isArray(row)) continue;
    const cells = row
      .map((cell) => (typeof cell === "string" ? cell.trim() : ""))
      .filter((cell) => cell.length > 0);
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

const ALLOWED_PUBLIC_STATE = new Set(["index", "noindex", "draft", "redirect"]);

function coercePublicState(
  val: unknown,
  status: ContentStatus,
): "index" | "noindex" | "draft" | "redirect" {
  const s = coerceString(val);
  if (s && ALLOWED_PUBLIC_STATE.has(s)) {
    return s as "index" | "noindex" | "draft" | "redirect";
  }
  if (status !== "published") return "draft";
  return "noindex";
}

function coerceRecordOfString(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const sv = coerceString(v);
    if (sv) out[k] = sv;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function coerceCtaVariants(value: unknown): CtaVariant[] | null {
  if (!Array.isArray(value)) return null;
  const out: CtaVariant[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;

    const id = coerceString(rec.id);
    if (!id) continue;

    const monetizeKey = coerceString(rec.monetizeKey) as MonetizeKey | null;
    const title = coerceString(rec.title);
    const lead = coerceString(rec.lead);
    const ctaLabel = coerceString(rec.ctaLabel);

    const whenIntentTagsAny = Array.isArray(rec.whenIntentTagsAny)
      ? (rec.whenIntentTagsAny
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v) => v.length > 0) as string[])
      : null;

    const priority = typeof rec.priority === "number" ? rec.priority : null;

    out.push({
      id,
      monetizeKey,
      title,
      lead,
      ctaLabel,
      whenIntentTagsAny,
      priority,
    });
  }

  return out.length > 0 ? out : null;
}

function coerceGuideBreadcrumbTrail(value: unknown): GuideBreadcrumbItem[] | null {
  if (!Array.isArray(value)) return null;
  const out: GuideBreadcrumbItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label = coerceString(rec.label);
    if (!label) continue;
    out.push({
      label,
      href: coerceString(rec.href),
    });
  }
  return out.length > 0 ? out : null;
}

function coerceGuideAuthorProfile(value: unknown): GuideAuthorProfile | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  const name = coerceString(rec.name);
  if (!name) return null;
  const kindRaw = coerceString(rec.kind);
  const kind = kindRaw === "organization" || kindRaw === "person" ? kindRaw : null;
  return {
    kind,
    name,
    credential: coerceString(rec.credential),
  };
}

function coerceGuideFaqItems(value: unknown): GuideFaqItem[] | null {
  if (!Array.isArray(value)) return null;
  const out: GuideFaqItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const question = coerceString(rec.question);
    const answer = coerceString(rec.answer);
    if (!question || !answer) continue;
    out.push({ question, answer });
  }
  return out.length > 0 ? out : null;
}

function coerceGuideActionBox(value: unknown): GuideActionBox | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  const title = coerceString(rec.title);
  if (!title) return null;

  const actions = Array.isArray(rec.actions)
    ? rec.actions
        .map((action) => {
          if (!action || typeof action !== "object") return null;
          const actionRec = action as Record<string, unknown>;
          const label = coerceString(actionRec.label);
          const href = coerceString(actionRec.href);
          if (!label || !href) return null;
          return {
            label,
            href,
            external: coerceBoolean(actionRec.external),
          };
        })
        .filter((action): action is NonNullable<typeof action> => Boolean(action))
    : [];

  if (actions.length === 0) return null;

  return {
    title,
    body: coerceString(rec.body),
    actions,
  };
}

function coerceGuideFlowSteps(value: unknown): GuideFlowStep[] {
  if (!Array.isArray(value)) return [];
  const out: GuideFlowStep[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = coerceString(rec.title);
    if (!title) continue;
    out.push({
      title,
      body: coerceString(rec.body),
    });
  }
  return out;
}

function coerceGuideTimelineItems(value: unknown): GuideTimelineItem[] {
  if (!Array.isArray(value)) return [];
  const out: GuideTimelineItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label = coerceString(rec.label);
    if (!label) continue;
    out.push({
      label,
      title: coerceString(rec.title),
      body: coerceString(rec.body),
      items: coerceStringArray(rec.items),
    });
  }
  return out;
}

function coerceGuideDecisionCards(value: unknown): GuideDecisionCard[] {
  if (!Array.isArray(value)) return [];
  const out: GuideDecisionCard[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = coerceString(rec.title);
    if (!title) continue;
    out.push({
      title,
      badge: coerceString(rec.badge),
      body: coerceString(rec.body),
      items: coerceStringArray(rec.items),
    });
  }
  return out;
}

function coerceGuideCaseStudyRows(value: unknown): GuideCaseStudyRow[] {
  if (!Array.isArray(value)) return [];
  const out: GuideCaseStudyRow[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label = coerceString(rec.label);
    const valueText = coerceString(rec.value);
    if (!label || !valueText) continue;
    out.push({
      label,
      value: valueText,
      note: coerceString(rec.note),
    });
  }
  return out;
}

function coerceGuideCaseStudyItems(value: unknown): GuideCaseStudyItem[] {
  if (!Array.isArray(value)) return [];
  const out: GuideCaseStudyItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = coerceString(rec.title);
    if (!title) continue;
    const rows = coerceGuideCaseStudyRows(rec.rows);
    if (rows.length === 0) continue;
    out.push({
      title,
      intro: coerceString(rec.intro),
      rows,
    });
  }
  return out;
}

function coerceGuideDetailBlocks(value: unknown): GuideDetailBlock[] {
  if (!Array.isArray(value)) return [];
  const out: GuideDetailBlock[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const type = coerceString(rec.type);

    if (type === "paragraph") {
      const text = coerceString(rec.text);
      if (!text) continue;
      out.push({ type: "paragraph", text });
      continue;
    }

    if (type === "list") {
      const items = coerceStringArray(rec.items);
      if (items.length === 0) continue;
      out.push({ type: "list", items });
      continue;
    }

    if (type === "comparisonTable") {
      const headers = coerceStringArray(rec.headers);
      const rows = coerceMatrix(rec.rows);
      if (headers.length === 0 || rows.length === 0) continue;
      out.push({
        type: "comparisonTable",
        title: coerceString(rec.title),
        headers,
        rows,
        note: coerceString(rec.note),
      });
      continue;
    }

    if (type === "callout") {
      const toneRaw = coerceString(rec.tone);
      const tone =
        toneRaw === "info" || toneRaw === "note" || toneRaw === "warn" || toneRaw === "accent"
          ? toneRaw
          : null;
      const title = coerceString(rec.title);
      const body = coerceString(rec.body);
      const items = coerceStringArray(rec.items);
      if (!title && !body && items.length === 0) continue;
      out.push({
        type: "callout",
        tone,
        title,
        body,
        items,
      });
      continue;
    }

    if (type === "flow") {
      const steps = coerceGuideFlowSteps(rec.steps);
      if (steps.length === 0) continue;
      out.push({
        type: "flow",
        title: coerceString(rec.title),
        steps,
      });
      continue;
    }

    if (type === "timeline") {
      const items = coerceGuideTimelineItems(rec.items);
      if (items.length === 0) continue;
      out.push({
        type: "timeline",
        title: coerceString(rec.title),
        items,
      });
      continue;
    }

    if (type === "decisionCards") {
      const cards = coerceGuideDecisionCards(rec.cards);
      if (cards.length === 0) continue;
      out.push({
        type: "decisionCards",
        title: coerceString(rec.title),
        cards,
      });
      continue;
    }

    if (type === "caseStudy") {
      const cases = coerceGuideCaseStudyItems(rec.cases);
      if (cases.length === 0) continue;
      out.push({
        type: "caseStudy",
        title: coerceString(rec.title),
        cases,
      });
    }
  }

  return out;
}

function coerceGuideDetailSections(value: unknown): GuideDetailSection[] | null {
  if (!Array.isArray(value)) return null;
  const out: GuideDetailSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = coerceString(rec.title);
    if (!title) continue;
    const blocks = coerceGuideDetailBlocks(rec.blocks);
    if (blocks.length === 0) continue;
    out.push({
      id: coerceString(rec.id),
      title,
      blocks,
    });
  }
  return out.length > 0 ? out : null;
}

function blockText(block: GuideDetailBlock): string[] {
  switch (block.type) {
    case "paragraph":
      return [block.text];
    case "list":
      return block.items.map((item) => `- ${item}`);
    case "comparisonTable": {
      const lines = [];
      if (block.title) lines.push(block.title);
      lines.push(block.headers.join(" | "));
      lines.push(...block.rows.map((row) => row.join(" | ")));
      if (block.note) lines.push(block.note);
      return lines;
    }
    case "callout": {
      const lines: string[] = [];
      if (block.title) lines.push(block.title);
      if (block.body) lines.push(block.body);
      if (block.items?.length) {
        lines.push(...block.items.map((item) => `- ${item}`));
      }
      return lines;
    }
    case "flow":
      return block.steps.flatMap((step, index) =>
        [step.title, step.body].filter(Boolean).map((value) =>
          typeof value === "string" ? `${index + 1}. ${value}` : "",
        ),
      ).filter(Boolean);
    case "timeline":
      return block.items.flatMap((item) => {
        const lines = [item.label, item.title, item.body].filter((value): value is string => Boolean(value));
        if (item.items?.length) {
          lines.push(...item.items.map((entry) => `- ${entry}`));
        }
        return lines;
      });
    case "decisionCards":
      return block.cards.flatMap((card) => {
        const lines = [card.badge, card.title, card.body].filter((value): value is string => Boolean(value));
        if (card.items?.length) {
          lines.push(...card.items.map((entry) => `- ${entry}`));
        }
        return lines;
      });
    case "caseStudy":
      return block.cases.flatMap((entry) => {
        const lines = [entry.title, entry.intro].filter((value): value is string => Boolean(value));
        lines.push(...entry.rows.map((row) => `${row.label}: ${row.value}`));
        return lines;
      });
    default:
      return [];
  }
}

function buildBodyFromStructuredGuide(input: {
  lead: string | null;
  keyPoints: string[];
  checkpoints: string[];
  sections: GuideDetailSection[] | null;
  faq: GuideFaqItem[] | null;
  actionBox: GuideActionBox | null;
}): string {
  const chunks: string[] = [];

  if (input.lead) chunks.push(input.lead);
  if (input.keyPoints.length > 0) {
    chunks.push("## 要点");
    chunks.push(...input.keyPoints.map((item) => `- ${item}`));
  }
  if (input.checkpoints.length > 0) {
    chunks.push("## 確認ポイント");
    chunks.push(...input.checkpoints.map((item) => `- ${item}`));
  }
  if (input.sections?.length) {
    for (const section of input.sections) {
      chunks.push(`## ${section.title}`);
      for (const block of section.blocks) {
        chunks.push(...blockText(block));
      }
    }
  }
  if (input.faq?.length) {
    chunks.push("## よくある質問");
    for (const item of input.faq) {
      chunks.push(`### ${item.question}`);
      chunks.push(item.answer);
    }
  }
  if (input.actionBox) {
    chunks.push(`## ${input.actionBox.title}`);
    if (input.actionBox.body) chunks.push(input.actionBox.body);
    chunks.push(...input.actionBox.actions.map((action) => `- ${action.label} ${action.href}`));
  }

  return chunks
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

/**
 * monetizeType は content-types.ts で union だが、
 * データ側が任意文字列運用になっている可能性があるため、
 * Repositoryでは “既知の値なら採用 / それ以外は null” に寄せる。
 */
function monetizeTypeCompat(value: string): MonetizeType | null {
  const v = value.trim();
  if (v === "direct" || v === "indirect" || v === "ad") return v;
  return null;
}

// JSON → GuideItem への正規化
function normalizeGuide(raw: RawGuideRecord, index: number): GuideItem {
  const id = coerceString(raw.id) ?? `guide-${index + 1}`;
  const slug = coerceString(raw.slug) ?? id;
  const status: ContentStatus = raw.status ?? "published";

  const title = coerceString(raw.title) ?? slug;
  const titleJa = raw.titleJa ?? null;
  const subtitle = coerceString(raw.subtitle) ?? null;
  const lead = coerceString(raw.lead);
  const summary = raw.summary ?? lead ?? null;
  const seoTitle = raw.seoTitle ?? null;
  const seoDescription = raw.seoDescription ?? summary ?? null;

  const description =
    coerceString(raw.description) ??
    seoDescription ??
    summary ??
    lead ??
    (title ? `${title}の結論・手順・注意点を、迷わない順番で見ます。` : null);

  const category: GuideCategory | null = typeof raw.category === "string" ? raw.category : null;
  const readMinutes = typeof raw.readMinutes === "number" ? raw.readMinutes : null;
  const heroImage = coerceString(raw.heroImage);
  const thumbnail = coerceString(raw.thumbnail);

  const layoutVariant = (coerceString(raw.layoutVariant) ?? null) as GuideLayoutVariant | null;
  const eyebrowLabel = coerceString(raw.eyebrowLabel);
  const breadcrumbTrail = coerceGuideBreadcrumbTrail(raw.breadcrumbTrail);
  const authorProfile = coerceGuideAuthorProfile(raw.authorProfile);
  const keyPoints = coerceStringArray(raw.keyPoints);
  const checkpoints = coerceStringArray(raw.checkpoints);
  const faq = coerceGuideFaqItems(raw.faq);
  const actionBox = coerceGuideActionBox(raw.actionBox);
  const detailSections = coerceGuideDetailSections(raw.detailSections);

  const bodyFromJson = typeof raw.body === "string" ? raw.body.trim() : "";
  const body =
    bodyFromJson ||
    buildBodyFromStructuredGuide({
      lead,
      keyPoints,
      checkpoints,
      sections: detailSections,
      faq,
      actionBox,
    });

  const createdAt = raw.createdAt ?? null;
  const publishedAt = raw.publishedAt ?? null;
  const updatedAt = raw.updatedAt ?? null;

  const tags = coerceStringArray(raw.tags);
  const displayTag = coerceString(raw.displayTag);

  const relatedCarSlugs = coerceStringArray(raw.relatedCarSlugs);
  const relatedGuideSlugs = coerceStringArray(raw.relatedGuideSlugs);
  const relatedColumnSlugs = coerceStringArray(raw.relatedColumnSlugs);
  const relatedHeritageSlugs = coerceStringArray(raw.relatedHeritageSlugs);
  const intentTags = coerceStringArray(raw.intentTags);
  const ctaVariants = coerceCtaVariants(raw.ctaVariants);

  const monetizeKeyRaw = coerceString(raw.monetizeKey);
  const monetizeTypeRaw = coerceString(raw.monetizeType);

  const affiliateLinks = coerceRecordOfString(raw.affiliateLinks);

  const internalLinks = Array.isArray(raw.internalLinks)
    ? raw.internalLinks
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0)
    : null;

  return {
    id,
    slug,
    type: "GUIDE",
    status,
    publicState: coercePublicState(raw.publicState, status),
    parentPillarId: coerceString(raw.parentPillarId) ?? "/guide",
    relatedClusterIds: coerceStringArray(raw.relatedClusterIds),
    primaryQuery: coerceString(raw.primaryQuery) ?? title,
    updateReason: coerceString(raw.updateReason) ?? "initial-import",
    sources: coerceStringArray(raw.sources),

    title,
    titleJa,
    subtitle,
    summary,
    seoTitle,
    seoDescription,
    description,

    category,
    readMinutes,
    heroImage,
    thumbnail,
    lead,
    layoutVariant,
    eyebrowLabel,
    breadcrumbTrail,
    authorProfile,
    keyPoints: keyPoints.length > 0 ? keyPoints : null,
    checkpoints: checkpoints.length > 0 ? checkpoints : null,
    faq,
    actionBox,
    detailSections,

    body,

    createdAt,
    publishedAt,
    updatedAt,

    tags,
    displayTag,

    relatedCarSlugs: relatedCarSlugs.length > 0 ? relatedCarSlugs : undefined,
    relatedGuideSlugs: relatedGuideSlugs.length > 0 ? relatedGuideSlugs : undefined,
    relatedColumnSlugs: relatedColumnSlugs.length > 0 ? relatedColumnSlugs : undefined,
    relatedHeritageSlugs: relatedHeritageSlugs.length > 0 ? relatedHeritageSlugs : undefined,
    intentTags: intentTags.length > 0 ? intentTags : undefined,

    monetizeKey: monetizeKeyRaw ? (monetizeKeyRaw as MonetizeKey) : null,
    monetizeType: monetizeTypeRaw ? monetizeTypeCompat(monetizeTypeRaw) : null,

    ctaVariants,
    affiliateLinks,
    internalLinks,
  };
}

const RAW_ALL: RawGuideRecord[] = readGuidesJsonDir();

let didWarnOnce = false;

function warnIfV12FieldsMissingOnce(list: GuideItem[]) {
  if (didWarnOnce) return;
  didWarnOnce = true;

  if (process.env.NODE_ENV === "production") return;

  const hasRelatedGuide = list.some((g) => (g.relatedGuideSlugs?.length ?? 0) > 0);
  const hasRelatedColumn = list.some((g) => (g.relatedColumnSlugs?.length ?? 0) > 0);
  const hasIntentTags = list.some((g) => (g.intentTags?.length ?? 0) > 0);
  const hasCtaVariants = list.some((g) => (g.ctaVariants?.length ?? 0) > 0);

  if (!hasRelatedGuide) {
    console.warn(
      "[guides-repository] relatedGuideSlugs がデータ内に見つかりません。v1.2の関連棚（Guide→Guide）で利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasRelatedColumn) {
    console.warn(
      "[guides-repository] relatedColumnSlugs がデータ内に見つかりません。v1.2の世界観棚（Guide→Column）で利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasIntentTags) {
    console.warn(
      "[guides-repository] intentTags がデータ内に見つかりません。v1.2の関連ランキングに利用するため、必要に応じて guides*.json 側へ追加してください。",
    );
  }
  if (!hasCtaVariants) {
    console.warn(
      "[guides-repository] ctaVariants がデータ内に見つかりません。v1.2のCTA出し分け（任意機能）を使う場合は guides*.json 側へ追加してください。",
    );
  }
}

const ALL_GUIDES_INTERNAL: GuideItem[] = (() => {
  const normalized = RAW_ALL.map(normalizeGuide);
  const map = new Map<string, GuideItem>();

  for (const guide of normalized) {
    const key = guide.slug || guide.id;
    if (!key) continue;

    if (map.has(key) && process.env.NODE_ENV !== "production") {
      console.warn(
        `[guides-repository] Duplicate guide key "${key}" detected. Later entry will override earlier one.`,
      );
    }

    map.set(key, guide);
  }

  const list = Array.from(map.values());
  warnIfV12FieldsMissingOnce(list);
  return list;
})();

export function findAllGuides(): GuideItem[] {
  return ALL_GUIDES_INTERNAL;
}

export function findGuideBySlug(slug: string): GuideItem | undefined {
  return ALL_GUIDES_INTERNAL.find((g) => g.slug === slug);
}
