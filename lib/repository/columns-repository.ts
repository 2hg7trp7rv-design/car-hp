// lib/repository/columns-repository.ts

/**
 * COLUMN DataSource層
 *
 * 役割
 * - data/articles/columns/*.json の生データを読み込み ColumnItem に正規化
 * - JSONの揺れ（legacy key / 型ブレ）をこの層で完全吸収
 *
 * 設計原則（仕様書 v1.2）
 * - 回遊は slug ベースで完結（related*Slugs）
 * - legacy の *Ids は DataSource 層でのみ吸収（＝可能ならslugへ正規化）
 * - Domain 層へは「揺れのない ColumnItem」を渡す
 */

import { readColumnsJsonDir } from "./data-dir";

import type {
  ColumnItem,
  ColumnCategory,
  ContentStatus,
} from "@/lib/content-types";

/* ========================================
 * Raw 型（JSON 揺れ吸収専用）
 * ===================================== */

// ----------------------------------------
// Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
// ----------------------------------------

type RawColumnRecord = {
  id?: unknown;
  slug?: unknown;
  type?: unknown;
  status?: unknown;

  // 企画書v4: 公開状態（SEO運用）
  publicState?: unknown;
  parentPillarId?: unknown;
  relatedClusterIds?: unknown;
  primaryQuery?: unknown;
  updateReason?: unknown;
  sources?: unknown;

  title?: unknown;
  titleJa?: unknown;
  subtitle?: unknown;

  summary?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;

  createdAt?: unknown;
  publishedAt?: unknown;
  updatedAt?: unknown;

  canonicalUrl?: unknown;
  ogImageUrl?: unknown;
  noindex?: unknown;

  category?: unknown;
  readMinutes?: unknown;
  heroImage?: unknown;
  thumbnail?: unknown;
  body?: unknown;
  lead?: unknown;
  eyebrowLabel?: unknown;
  breadcrumbTrail?: unknown;
  authorProfile?: unknown;
  keyPoints?: unknown;
  checkpoints?: unknown;
  faq?: unknown;
  detailSections?: unknown;

  tags?: unknown;
  displayTag?: unknown;

  // v1.2: 意図タグ
  intentTags?: unknown;

  // 回遊（slug / legacy id 混在吸収）
  relatedCarSlugs?: unknown;
  relatedCarIds?: unknown;

  relatedGuideSlugs?: unknown;

  relatedColumnSlugs?: unknown; // ★ v1.2（Column→Column）
  relatedHeritageSlugs?: unknown;
  relatedHeritageIds?: unknown;

  // 編集・SEO
  ctaType?: unknown;
  ctaNote?: unknown;
  searchIntent?: unknown;
  targetKeyword?: unknown;
  targetStep?: unknown;
  articleType?: unknown;

  // 編集計画（internal）
  planPriority?: unknown;

  // feature-v1 structured payload
  layoutVariant?: unknown;
  summaryPanel?: unknown;
  introQuote?: unknown;
  toc?: unknown;
  sections?: unknown;
  actionBox?: unknown;
  related?: unknown;
  updateHistory?: unknown;
};

/* ========================================
 * helpers
 * ===================================== */

const asString = (v: unknown): string | null =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

const asBooleanOrUndefined = (v: unknown): boolean | undefined => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return undefined;
};

const asStringArray = (v: unknown): string[] => {
  if (v == null) return [];
  // 配列
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter((s) => s.length > 0);
  }
  // 単発string
  if (typeof v === "string") {
    const s = v.trim();
    return s.length > 0 ? [s] : [];
  }
  return [];
};

const asOptionalStringArray = (v: unknown): string[] | undefined => {
  const arr = asStringArray(v);
  return arr.length > 0 ? arr : undefined;
};


const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;

const asFeatureLinkArray = (
  v: unknown,
): Array<{ label?: string | null; title: string; href: string }> | undefined => {
  if (!Array.isArray(v)) return undefined;

  const links = v
    .map((entry) => {
      const obj = asRecord(entry);
      const title = obj ? asString(obj.title) : null;
      const href = obj ? asString(obj.href) : null;
      if (!title || !href) return null;

      return {
        label: obj ? asString(obj.label) : null,
        title,
        href,
      };
    })
    .filter(Boolean) as Array<{ label?: string | null; title: string; href: string }>;

  return links.length > 0 ? links : undefined;
};

const asSourceArray = (v: unknown): Array<{ label?: string | null; url: string }> | undefined => {
  if (!Array.isArray(v)) return undefined;

  const sources = v
    .map((entry) => {
      if (typeof entry === "string" && entry.trim()) {
        return { url: entry.trim() };
      }

      const obj = asRecord(entry);
      const url = obj ? asString(obj.url) : null;
      if (!url) return null;

      return {
        label: obj ? asString(obj.label) : null,
        url,
      };
    })
    .filter(Boolean) as Array<{ label?: string | null; url: string }>;

  return sources.length > 0 ? sources : undefined;
};

const asGuideActionLinks = (
  v: unknown,
): Array<{ label: string; href: string; external?: boolean | null }> | undefined => {
  if (!Array.isArray(v)) return undefined;

  const links = v
    .map((entry) => {
      const obj = asRecord(entry);
      const href = obj ? asString(obj.href) : null;
      const label = obj ? asString(obj.label) ?? asString(obj.title) : null;
      if (!href || !label) return null;
      return {
        label,
        href,
        external: obj ? asBooleanOrUndefined(obj.external) ?? undefined : undefined,
      };
    })
    .filter(Boolean) as Array<{ label: string; href: string; external?: boolean | null }>;

  return links.length > 0 ? links : undefined;
};

const asBreadcrumbTrail = (
  v: unknown,
): Array<{ label: string; href?: string | null }> | undefined => {
  if (!Array.isArray(v)) return undefined;
  const items = v
    .map((entry) => {
      const obj = asRecord(entry);
      const label = obj ? asString(obj.label) : null;
      if (!label) return null;
      return { label, href: obj ? asString(obj.href) : null };
    })
    .filter(Boolean) as Array<{ label: string; href?: string | null }>;
  return items.length > 0 ? items : undefined;
};

const asAuthorProfile = (
  v: unknown,
): { kind?: "person" | "organization" | null; name: string; credential?: string | null } | undefined => {
  const obj = asRecord(v);
  const name = obj ? asString(obj.name) : null;
  if (!name) return undefined;
  const kindRaw = obj ? asString(obj.kind) : null;
  const kind = kindRaw === "person" || kindRaw === "organization" ? kindRaw : null;
  return {
    kind,
    name,
    credential: obj ? asString(obj.credential) : null,
  };
};

const asFaqItems = (v: unknown): Array<{ question: string; answer: string }> | undefined => {
  if (!Array.isArray(v)) return undefined;
  const items = v
    .map((entry) => {
      const obj = asRecord(entry);
      const question = obj ? asString(obj.question) : null;
      const answer = obj ? asString(obj.answer) : null;
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean) as Array<{ question: string; answer: string }>;
  return items.length > 0 ? items : undefined;
};

const buildStructuredSectionsInput = (raw: RawColumnRecord): unknown => {
  if (Array.isArray(raw.detailSections) && raw.detailSections.length > 0) return raw.detailSections;
  if (Array.isArray(raw.sections) && raw.sections.length > 0) return raw.sections;
  return undefined;
};

const buildBodyFromStructuredSections = (sectionsValue: unknown): string => {
  if (!Array.isArray(sectionsValue)) return "";

  const parts: string[] = [];

  for (const sectionEntry of sectionsValue) {
    const section = asRecord(sectionEntry);
    const title = section ? asString(section.title) : null;
    if (title) parts.push(`## ${title}`);

    const blocks = section && Array.isArray(section.blocks) ? section.blocks : [];
    for (const blockEntry of blocks) {
      const block = asRecord(blockEntry);
      const type = block ? asString(block.type) : null;
      if (!block || !type) continue;

      if (type === "paragraph" || type === "quote") {
        const text = asString(block.text);
        if (text) parts.push(text);
        continue;
      }

      if (type === "list") {
        for (const item of asStringArray(block.items)) parts.push(`- ${item}`);
        continue;
      }

      if (type === "callout") {
        const blockTitle = asString(block.title);
        const body = asString(block.body);
        if (blockTitle) parts.push(blockTitle);
        if (body) parts.push(body);
        for (const listItem of asStringArray(block.items)) parts.push(`- ${listItem}`);
        continue;
      }

      if (type === "comparisonTable") {
        const blockTitle = asString(block.title);
        if (blockTitle) parts.push(blockTitle);
        const headers = asStringArray(block.headers);
        if (headers.length) parts.push(headers.join(' / '));
        const rows = Array.isArray(block.rows) ? block.rows : [];
        for (const rowEntry of rows) {
          const row = Array.isArray(rowEntry) ? rowEntry.map((cell) => `${cell ?? ""}`.trim()).filter(Boolean) : [];
          if (row.length) parts.push(`- ${row.join(' / ')}`);
        }
        const note = asString(block.note);
        if (note) parts.push(note);
        continue;
      }

      if (type === "flow") {
        const blockTitle = asString(block.title);
        if (blockTitle) parts.push(blockTitle);
        const steps = Array.isArray(block.steps) ? block.steps : [];
        for (const stepEntry of steps) {
          const step = asRecord(stepEntry);
          if (!step) continue;
          const stepTitle = asString(step.title);
          const body = asString(step.body);
          if (stepTitle) parts.push(stepTitle);
          if (body) parts.push(body);
        }
        continue;
      }

      if (type === "timeline") {
        const blockTitle = asString(block.title);
        if (blockTitle) parts.push(blockTitle);
        const items = Array.isArray(block.items) ? block.items : [];
        for (const itemEntry of items) {
          const item = asRecord(itemEntry);
          if (!item) continue;
          const label = asString(item.label);
          const itemTitle = asString(item.title);
          const body = asString(item.body);
          if (label) parts.push(label);
          if (itemTitle) parts.push(itemTitle);
          if (body) parts.push(body);
          for (const listItem of asStringArray(item.items)) parts.push(`- ${listItem}`);
        }
        continue;
      }

      if (type === "decisionCards") {
        const blockTitle = asString(block.title);
        if (blockTitle) parts.push(blockTitle);
        const cards = Array.isArray(block.cards) ? block.cards : [];
        for (const cardEntry of cards) {
          const card = asRecord(cardEntry);
          if (!card) continue;
          const cardTitle = asString(card.title);
          const body = asString(card.body);
          if (cardTitle) parts.push(cardTitle);
          if (body) parts.push(body);
          for (const listItem of asStringArray(card.items)) parts.push(`- ${listItem}`);
        }
        continue;
      }

      if (type === "caseStudy") {
        const blockTitle = asString(block.title);
        if (blockTitle) parts.push(blockTitle);
        const cases = Array.isArray(block.cases) ? block.cases : [];
        for (const itemEntry of cases) {
          const item = asRecord(itemEntry);
          if (!item) continue;
          const itemTitle = asString(item.title);
          const intro = asString(item.intro);
          if (itemTitle) parts.push(itemTitle);
          if (intro) parts.push(intro);
          const rows = Array.isArray(item.rows) ? item.rows : [];
          for (const rowEntry of rows) {
            const row = asRecord(rowEntry);
            if (!row) continue;
            const label = asString(row.label);
            const value = asString(row.value);
            const note = asString(row.note);
            if (label) parts.push(label);
            if (value) parts.push(value);
            if (note) parts.push(note);
          }
        }
        continue;
      }

      if (type === "cards") {
        const items = Array.isArray(block.items) ? block.items : [];
        for (const itemEntry of items) {
          const item = asRecord(itemEntry);
          if (!item) continue;
          const itemTitle = asString(item.title);
          const body = asString(item.body);
          if (itemTitle) parts.push(itemTitle);
          if (body) parts.push(body);
          for (const listItem of asStringArray(item.items)) parts.push(`- ${listItem}`);
        }
        continue;
      }

      if (type === "steps") {
        const items = Array.isArray(block.items) ? block.items : [];
        for (const itemEntry of items) {
          const item = asRecord(itemEntry);
          if (!item) continue;
          const itemTitle = asString(item.title);
          const body = asString(item.body);
          if (itemTitle) parts.push(itemTitle);
          if (body) parts.push(body);
        }
        continue;
      }

      if (type === "linkCards") {
        const links = asFeatureLinkArray(block.items) ?? [];
        for (const link of links) parts.push(link.title);
      }
    }
  }

  return parts.join("\n\n").trim();
};

const buildStructuredToc = (
  sectionsValue: unknown,
): Array<{ id: string; text: string; level: 2 | 3 | 4 }> | null => {
  if (!Array.isArray(sectionsValue)) return null;

  const toc = sectionsValue
    .map((entry, index) => {
      const obj = asRecord(entry);
      const title = obj ? asString(obj.title) : null;
      const id = obj ? asString(obj.id) : null;
      if (!title) return null;
      return {
        id: id ?? `section-${index + 1}`,
        text: title,
        level: 2 as const,
      };
    })
    .filter(Boolean) as Array<{ id: string; text: string; level: 2 | 3 | 4 }>;

  return toc.length > 0 ? toc : null;
};

const buildFeatureV1Payload = (raw: RawColumnRecord) => {
  if (asString(raw.layoutVariant) !== "feature-v1") return null;
  if (!Array.isArray(raw.sections) || raw.sections.length === 0) return null;

  const summaryPanel = asRecord(raw.summaryPanel);
  const toc = asRecord(raw.toc);
  const actionBox = asRecord(raw.actionBox);
  const related = asRecord(raw.related);

  return {
    summaryPanel: summaryPanel
      ? {
          title: asString(summaryPanel.title),
          items: asStringArray(summaryPanel.items),
        }
      : null,
    introQuote: asString(raw.introQuote),
    toc: toc
      ? {
          enabled: typeof toc.enabled === "boolean" ? toc.enabled : asBooleanOrUndefined(toc.enabled),
        }
      : null,
    sections: raw.sections as any[],
    actionBox: actionBox
      ? {
          title: asString(actionBox.title) ?? "",
          body: asString(actionBox.body) ?? "",
          actions: asFeatureLinkArray(actionBox.actions) ?? null,
        }
      : null,
    related: related
      ? {
          articles: asFeatureLinkArray(related.articles) ?? null,
        }
      : null,
    sources: asSourceArray(raw.sources) ?? null,
    updateHistory: Array.isArray(raw.updateHistory)
      ? (raw.updateHistory
          .map((entry) => {
            const obj = asRecord(entry);
            const date = obj ? asString(obj.date) : null;
            const text = obj ? asString(obj.text) : null;
            if (!date || !text) return null;
            return { date, text };
          })
          .filter((entry): entry is { date: string; text: string } => Boolean(entry)))
      : null,
  };
};

const asNumberOrNull = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const asContentStatus = (v: unknown): ContentStatus => {
  const s = asString(v);
  if (s === "draft" || s === "published" || s === "archived") return s;
  return "published";
};

const ALLOWED_PUBLIC_STATE = new Set(["index", "noindex", "draft", "redirect"]);

const asPublicState = (v: unknown, status: ContentStatus, noindex?: boolean): any => {
  const s = asString(v);
  if (s && ALLOWED_PUBLIC_STATE.has(s)) return s;
  if (status !== "published") return "draft";
  if (noindex) return "noindex";
  return "noindex";
};


/* ========================================
 * JSON → Array
 * ===================================== */

function _toArray(data: unknown): RawColumnRecord[] {
  if (Array.isArray(data)) return data as RawColumnRecord[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.columns)) {
      return obj.columns as RawColumnRecord[];
    }
    return [data as RawColumnRecord];
  }
  return [];
}

/* ========================================
 * 正規化（核心）
 * ===================================== */

function normalizeColumn(raw: RawColumnRecord, index: number): ColumnItem {
  const fallbackId = `column-${index + 1}`;

  const id = asString(raw.id) ?? fallbackId;
  const slug = asString(raw.slug) ?? id;

  const status: ContentStatus = asContentStatus(raw.status);

  const title = asString(raw.title) ?? slug;
  const titleJa = asString(raw.titleJa);
  const subtitle = asString(raw.subtitle) ?? null;

  const summary = asString(raw.summary);
  const seoTitle = asString(raw.seoTitle);
  const seoDescription = asString(raw.seoDescription) ?? summary ?? null;

  const createdAt = asString(raw.createdAt);
  const publishedAt = asString(raw.publishedAt);
  const updatedAt = asString(raw.updatedAt);

  const canonicalUrl = asString(raw.canonicalUrl);
  const ogImageUrl = asString(raw.ogImageUrl);
  const noindex = asBooleanOrUndefined(raw.noindex);

  const category: ColumnCategory =
    (asString(raw.category) as ColumnCategory) ?? "TECHNICAL";

  const readMinutes = asNumberOrNull(raw.readMinutes);
  const heroImage = asString(raw.heroImage);
  const thumbnail = asString(raw.thumbnail);
  const bodyFromJson = asString(raw.body) ?? "";
  const structuredSections = buildStructuredSectionsInput(raw);
  const bodyFromStructured = buildBodyFromStructuredSections(structuredSections);

  // Markdown本文補完はしない（D.⑩: Markdown+JSON併用禁止）
  const body = (bodyFromJson || bodyFromStructured).trim();

  const tags = asStringArray(raw.tags);
  const displayTag = asString(raw.displayTag);

  /**
   * v1.2: intentTags
   */
  const intentTags = asOptionalStringArray(raw.intentTags);

  /**
   * 回遊は slug に完全正規化
   * legacy の *Ids はここでのみ吸収
   *
   * NOTE:
   * - legacy id が数値などで入っている場合、slugへ変換するには別マップが必要。
   *   本層では “文字列として入っている場合のみ” 吸収し、変換は行わない。
   */
  const relatedCarSlugs =
    asOptionalStringArray(raw.relatedCarSlugs) ??
    asOptionalStringArray(raw.relatedCarIds);

  const relatedGuideSlugs = asOptionalStringArray(raw.relatedGuideSlugs);

  const relatedColumnSlugs = asOptionalStringArray(raw.relatedColumnSlugs);

  const relatedHeritageSlugs =
    asOptionalStringArray(raw.relatedHeritageSlugs) ??
    asOptionalStringArray(raw.relatedHeritageIds);

  const layoutVariant = asString(raw.layoutVariant);
  const featureV1 = buildFeatureV1Payload(raw);
  const toc = buildStructuredToc(structuredSections);
  const actionBox = asRecord(raw.actionBox);

  return {
    id,
    slug,
    type: "COLUMN",
    status,
    publicState: asPublicState(raw.publicState, status, noindex),
    parentPillarId: asString(raw.parentPillarId) ?? "/column",
    relatedClusterIds: asStringArray(raw.relatedClusterIds),
    primaryQuery: asString(raw.primaryQuery) ?? (title ?? slug ?? ""),
    updateReason: asString(raw.updateReason) ?? "initial-import",
    sources: asStringArray(raw.sources),

    title,
    titleJa: titleJa ?? null,
    subtitle,

    summary: summary ?? null,
    seoTitle: seoTitle ?? null,
    seoDescription,

    createdAt: createdAt ?? null,
    publishedAt: publishedAt ?? null,
    updatedAt: updatedAt ?? null,

    canonicalUrl: canonicalUrl ?? null,
    ogImageUrl: ogImageUrl ?? null,
    noindex,

    category,
    readMinutes,
    heroImage: heroImage ?? null,
    thumbnail: thumbnail ?? null,
    lead: asString(raw.lead) ?? null,
    eyebrowLabel: asString(raw.eyebrowLabel) ?? null,
    breadcrumbTrail: asBreadcrumbTrail(raw.breadcrumbTrail) ?? null,
    authorProfile: asAuthorProfile(raw.authorProfile) ?? null,
    keyPoints: asOptionalStringArray(raw.keyPoints) ?? null,
    checkpoints: asOptionalStringArray(raw.checkpoints) ?? null,
    faq: asFaqItems(raw.faq) ?? null,
    actionBox: actionBox
      ? {
          title: asString(actionBox.title) ?? "",
          body: asString(actionBox.body),
          actions: asGuideActionLinks(actionBox.actions) ?? [],
        }
      : null,
    detailSections: (Array.isArray(structuredSections) ? structuredSections : null) as any,
    body,
    toc,

    tags,
    displayTag: displayTag ?? null,

    layoutVariant: layoutVariant ?? null,
    featureV1,

    // v1.2
    intentTags,

    // related*
    relatedCarSlugs,
    relatedGuideSlugs,
    relatedColumnSlugs,
    relatedHeritageSlugs,

    // 編集・SEO
    ctaType: asString(raw.ctaType),
    ctaNote: asString(raw.ctaNote),
    searchIntent: asString(raw.searchIntent),
    targetKeyword: asString(raw.targetKeyword),
    targetStep: asNumberOrNull(raw.targetStep),
    planPriority: asNumberOrNull(raw.planPriority),
    articleType: asString(raw.articleType),
  };
}

/* ========================================
 * Internal Cache
 * ===================================== */

/**
 * columns.json + columns2.json を「生配列」としてまとめる
 * - ファイルごとの優先順位: 後ろに書かれているファイルほど“後勝ち”になる
 */
const RAW_ALL: RawColumnRecord[] = readColumnsJsonDir();

/**
 * 一度だけ正規化 & 重複 slug の解消（後勝ち）
 */
const ALL_COLUMNS_INTERNAL: ColumnItem[] = (() => {
  const normalized = RAW_ALL.map(normalizeColumn);
  const map = new Map<string, ColumnItem>();

  for (const col of normalized) {
    const key = col.slug || col.id;
    if (!key) continue;

    if (map.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[columns-repository] Duplicate column key "${key}" detected. Later entry will override earlier one.`,
        );
      }
    }

    map.set(key, col);
  }

  return Array.from(map.values());
})();

// ---- 開発時の軽い警告（throwしない / 1回だけ） ----
let didWarnOnce = false;

function warnIfV12FieldsMissingOnce(list: ColumnItem[]) {
  if (didWarnOnce) return;
  didWarnOnce = true;

  if (process.env.NODE_ENV === "production") return;

  const hasIntentTags = list.some((c) => (c.intentTags?.length ?? 0) > 0);
  const hasRelatedColumn = list.some(
    (c) => (c.relatedColumnSlugs?.length ?? 0) > 0,
  );

  if (!hasIntentTags) {
    // eslint-disable-next-line no-console
    console.warn(
      "[columns-repository] intentTags がデータ内に見つかりません。v1.2の関連ランキングに利用する場合は data/columns.json 側へ追加してください。",
    );
  }
  if (!hasRelatedColumn) {
    // eslint-disable-next-line no-console
    console.warn(
      "[columns-repository] relatedColumnSlugs がデータ内に見つかりません。v1.2のColumn→Column棚を使う場合は data/columns.json 側へ追加してください。",
    );
  }
}

warnIfV12FieldsMissingOnce(ALL_COLUMNS_INTERNAL);

/* ========================================
 * Repository API（slug 完結）
 * ===================================== */

export function findAllColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL;
}

export function findColumnBySlug(slug: string): ColumnItem | undefined {
  const s = slug.trim();
  if (!s) return undefined;
  return ALL_COLUMNS_INTERNAL.find((c) => c.slug === s);
}

export function findPublishedColumns(): ColumnItem[] {
  return ALL_COLUMNS_INTERNAL.filter((c) => c.status === "published");
}

export function findColumnsByRelatedCarSlug(carSlug: string): ColumnItem[] {
  const s = carSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) => c.relatedCarSlugs?.includes(s));
}

export function findColumnsByRelatedGuideSlug(guideSlug: string): ColumnItem[] {
  const s = guideSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) => c.relatedGuideSlugs?.includes(s));
}

export function findColumnsByRelatedHeritageSlug(
  heritageSlug: string,
): ColumnItem[] {
  const s = heritageSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) =>
    c.relatedHeritageSlugs?.includes(s),
  );
}

export function findColumnsByRelatedColumnSlug(
  columnSlug: string,
): ColumnItem[] {
  const s = columnSlug.trim();
  if (!s) return [];
  return ALL_COLUMNS_INTERNAL.filter((c) =>
    c.relatedColumnSlugs?.includes(s),
  );
}
