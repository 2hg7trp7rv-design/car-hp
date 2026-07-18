/**
 * Fail-closed publication contract shared by GUIDE and COLUMN content.
 *
 * This module deliberately accepts `unknown` fields. Article JSON is external
 * input at runtime, even when a repository later exposes it as a typed object.
 * Missing or malformed publication fields must therefore never be inferred.
 */

export const ARTICLE_TYPES = ["GUIDE", "COLUMN"] as const;
export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export const PUBLIC_STATES = ["index", "noindex", "draft", "redirect"] as const;

export type RegistryArticleType = (typeof ARTICLE_TYPES)[number];
export type RegistryContentStatus = (typeof CONTENT_STATUSES)[number];
export type RegistryPublicState = (typeof PUBLIC_STATES)[number];

export type PublicationDisposition =
  | "public"
  | "preview"
  | "private"
  | "redirect"
  | "rejected";

export type PublicationIssueCode =
  | "missing-slug"
  | "invalid-slug"
  | "missing-title"
  | "invalid-title"
  | "missing-type"
  | "invalid-type"
  | "missing-status"
  | "invalid-status"
  | "missing-public-state"
  | "invalid-public-state"
  | "missing-noindex"
  | "invalid-noindex"
  | "inconsistent-publication-state"
  | "invalid-body"
  | "invalid-detail-sections"
  | "invalid-detail-section"
  | "unknown-content-block"
  | "invalid-content-block"
  | "missing-substantive-content";

export type PublicationContractInput = {
  slug?: unknown;
  title?: unknown;
  type?: unknown;
  status?: unknown;
  publicState?: unknown;
  noindex?: unknown;
  body?: unknown;
  detailSections?: unknown;
};

export type PublicationIssue = {
  code: PublicationIssueCode;
  message: string;
};

export type PublicationContractResult = {
  disposition: PublicationDisposition;
  articleType: RegistryArticleType | null;
  slug: string;
  status: RegistryContentStatus | null;
  publicState: RegistryPublicState | null;
  noindex: boolean | null;
  issues: readonly PublicationIssue[];
};

export type DuplicatePublicationSlug = {
  slug: string;
  indexes: readonly number[];
  types: readonly string[];
};

const ARTICLE_TYPE_SET = new Set<string>(ARTICLE_TYPES);
const CONTENT_STATUS_SET = new Set<string>(CONTENT_STATUSES);
const PUBLIC_STATE_SET = new Set<string>(PUBLIC_STATES);

function hasOwn(input: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.normalize("NFKC").trim() : "";
}

function hasText(value: unknown): boolean {
  return cleanString(value).length > 0;
}

const KNOWN_CONTENT_BLOCK_TYPES = new Set([
  "dialogue",
  "paragraph",
  "image",
  "list",
  "subheading",
  "quote",
  "divider",
  "comparisonTable",
  "callout",
  "flow",
  "timeline",
  "decisionCards",
  "editorialBoard",
  "caseStudy",
]);

const PLACEHOLDER_TOKENS = new Set([
  "todo",
  "tbd",
  "wip",
  "placeholder",
  "comingsoon",
  "準備中",
  "工事中",
  "未執筆",
  "執筆中",
  "仮",
  "仮本文",
]);

const MIN_SUBSTANTIVE_CHARACTERS = 40;
const ROUTE_SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PublicContentValidation = {
  issues: PublicationIssue[];
  substantiveCharacters: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function placeholderToken(value: unknown): string {
  return cleanString(value)
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}_]+/gu, "");
}

function isPlaceholderText(value: unknown): boolean {
  const token = placeholderToken(value);
  return token.length > 0 && PLACEHOLDER_TOKENS.has(token);
}

function readableCharacterCount(value: unknown): number {
  if (!hasText(value) || isPlaceholderText(value)) return 0;
  return cleanString(value).match(/[\p{L}\p{N}]/gu)?.length ?? 0;
}

function isMeaningfulText(value: unknown): boolean {
  return readableCharacterCount(value) > 0;
}

function validTextArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === "string" && isMeaningfulText(entry))
  );
}

function validOptionalTextArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string" && isMeaningfulText(entry))
  );
}

function collectOptionalText(record: Record<string, unknown>, keys: readonly string[]): unknown[] {
  return keys.map((key) => record[key]).filter(isMeaningfulText);
}

function validateContentBlock(
  value: unknown,
  path: string,
): { issues: PublicationIssue[]; substantiveText: unknown[] } {
  const issues: PublicationIssue[] = [];
  const block = asRecord(value);
  if (!block) {
    issues.push({ code: "invalid-content-block", message: `${path} must be an object` });
    return { issues, substantiveText: [] };
  }

  const type = cleanString(block.type);
  if (!KNOWN_CONTENT_BLOCK_TYPES.has(type)) {
    issues.push({
      code: "unknown-content-block",
      message: `${path}.type is unsupported: ${type || "(empty)"}`,
    });
    return { issues, substantiveText: [] };
  }

  const invalid = (message: string) => {
    issues.push({ code: "invalid-content-block", message: `${path} (${type}): ${message}` });
  };

  if (type === "divider") return { issues, substantiveText: [] };

  if (type === "dialogue") {
    const character = cleanString(block.character);
    if ((character !== "juna" && character !== "rina") || !isMeaningfulText(block.text)) {
      invalid("character must be juna/rina and text must be meaningful");
      return { issues, substantiveText: [] };
    }
    return { issues, substantiveText: [block.text] };
  }

  if (type === "paragraph" || type === "quote") {
    if (!isMeaningfulText(block.text)) {
      invalid("text must be meaningful");
      return { issues, substantiveText: [] };
    }
    return { issues, substantiveText: [block.text] };
  }

  if (type === "image") {
    if (!hasText(block.src) || !hasText(block.alt)) invalid("src and alt are required");
    return { issues, substantiveText: [] };
  }

  if (type === "list") {
    if (!validTextArray(block.items)) {
      invalid("items must be a non-empty array of meaningful strings");
      return { issues, substantiveText: [] };
    }
    return { issues, substantiveText: block.items };
  }

  if (type === "subheading") {
    if (!isMeaningfulText(block.title)) invalid("title must be meaningful");
    if (block.level != null && block.level !== 3 && block.level !== 4) {
      invalid("level must be 3 or 4 when supplied");
    }
    return { issues, substantiveText: [] };
  }

  if (type === "comparisonTable") {
    const headers = block.headers;
    const rows = block.rows;
    const validRows =
      Array.isArray(rows) &&
      rows.length > 0 &&
      Array.isArray(headers) &&
      rows.every((row) => validTextArray(row) && row.length === headers.length);
    if (!validTextArray(headers) || !validRows) {
      invalid("headers and equal-width rows must contain meaningful strings");
      return { issues, substantiveText: [] };
    }
    return { issues, substantiveText: [...headers, ...rows.flat()] };
  }

  if (type === "callout") {
    const items = block.items == null ? [] : block.items;
    if (block.items != null && !validOptionalTextArray(items)) {
      invalid("items must contain meaningful strings when supplied");
      return { issues, substantiveText: [] };
    }
    const anyContent = collectOptionalText(block, ["title", "body"]);
    if (anyContent.length === 0 && (!Array.isArray(items) || items.length === 0)) {
      invalid("title, body or items is required");
      return { issues, substantiveText: [] };
    }
    return {
      issues,
      substantiveText: [block.body, ...(Array.isArray(items) ? items : [])].filter(isMeaningfulText),
    };
  }

  if (type === "flow") {
    const steps = block.steps;
    if (!Array.isArray(steps) || steps.length === 0) {
      invalid("steps must be a non-empty array");
      return { issues, substantiveText: [] };
    }
    const text: unknown[] = [];
    for (const [index, stepValue] of steps.entries()) {
      const step = asRecord(stepValue);
      if (!step || !isMeaningfulText(step.title)) {
        invalid(`steps[${index}].title must be meaningful`);
        continue;
      }
      text.push(step.title, ...collectOptionalText(step, ["body", "label"]));
    }
    return { issues, substantiveText: text };
  }

  if (type === "timeline") {
    const items = block.items;
    if (!Array.isArray(items) || items.length === 0) {
      invalid("items must be a non-empty array");
      return { issues, substantiveText: [] };
    }
    const text: unknown[] = [];
    for (const [index, itemValue] of items.entries()) {
      const item = asRecord(itemValue);
      if (!item || !isMeaningfulText(item.label)) {
        invalid(`items[${index}].label must be meaningful`);
        continue;
      }
      if (item.items != null && !validOptionalTextArray(item.items)) {
        invalid(`items[${index}].items must contain meaningful strings`);
        continue;
      }
      text.push(
        item.label,
        ...collectOptionalText(item, ["title", "body"]),
        ...(Array.isArray(item.items) ? item.items : []),
      );
    }
    return { issues, substantiveText: text };
  }

  if (type === "decisionCards" || type === "editorialBoard") {
    const collectionKey = type === "decisionCards" ? "cards" : "items";
    const entries = block[collectionKey];
    if (!Array.isArray(entries) || entries.length === 0) {
      invalid(`${collectionKey} must be a non-empty array`);
      return { issues, substantiveText: [] };
    }
    const text: unknown[] = [];
    for (const [index, entryValue] of entries.entries()) {
      const entry = asRecord(entryValue);
      if (!entry || !isMeaningfulText(entry.title)) {
        invalid(`${collectionKey}[${index}].title must be meaningful`);
        continue;
      }
      if (entry.items != null && !validOptionalTextArray(entry.items)) {
        invalid(`${collectionKey}[${index}].items must contain meaningful strings`);
        continue;
      }
      text.push(
        entry.title,
        ...collectOptionalText(entry, ["body"]),
        ...(Array.isArray(entry.items) ? entry.items : []),
      );
    }
    if (type === "editorialBoard") {
      text.push(...collectOptionalText(block, ["lead", "note"]));
    }
    return { issues, substantiveText: text };
  }

  if (type === "caseStudy") {
    const cases = block.cases;
    if (!Array.isArray(cases) || cases.length === 0) {
      invalid("cases must be a non-empty array");
      return { issues, substantiveText: [] };
    }
    const text: unknown[] = [];
    for (const [caseIndex, caseValue] of cases.entries()) {
      const caseItem = asRecord(caseValue);
      if (!caseItem || !isMeaningfulText(caseItem.title)) {
        invalid(`cases[${caseIndex}].title must be meaningful`);
        continue;
      }
      const rows = caseItem.rows;
      if (!Array.isArray(rows) || rows.length === 0) {
        invalid(`cases[${caseIndex}].rows must be a non-empty array`);
        continue;
      }
      text.push(caseItem.title, ...collectOptionalText(caseItem, ["intro"]));
      for (const [rowIndex, rowValue] of rows.entries()) {
        const row = asRecord(rowValue);
        if (!row || !isMeaningfulText(row.label) || !isMeaningfulText(row.value)) {
          invalid(`cases[${caseIndex}].rows[${rowIndex}] requires label and value`);
          continue;
        }
        text.push(row.label, row.value, ...collectOptionalText(row, ["note"]));
      }
    }
    return { issues, substantiveText: text };
  }

  return { issues, substantiveText: [] };
}

function validatePublicContent(
  input: Pick<PublicationContractInput, "body" | "detailSections">,
): PublicContentValidation {
  const issues: PublicationIssue[] = [];
  const substantiveText: unknown[] = [];

  if (hasOwn(input, "body") && typeof input.body !== "string") {
    issues.push({ code: "invalid-body", message: "body must be a string when supplied" });
  } else if (hasText(input.body)) {
    if (isPlaceholderText(input.body)) {
      issues.push({ code: "invalid-body", message: "body cannot be a TODO/TBD/WIP placeholder" });
    } else {
      substantiveText.push(input.body);
    }
  }

  if (hasOwn(input, "detailSections")) {
    if (!Array.isArray(input.detailSections)) {
      issues.push({ code: "invalid-detail-sections", message: "detailSections must be an array" });
    } else {
      for (const [sectionIndex, sectionValue] of input.detailSections.entries()) {
        const path = `detailSections[${sectionIndex}]`;
        const section = asRecord(sectionValue);
        if (!section) {
          issues.push({ code: "invalid-detail-section", message: `${path} must be an object` });
          continue;
        }
        if (!isMeaningfulText(section.title)) {
          issues.push({ code: "invalid-detail-section", message: `${path}.title must be meaningful` });
        }
        if (!Array.isArray(section.blocks) || section.blocks.length === 0) {
          issues.push({
            code: "invalid-detail-section",
            message: `${path}.blocks must be a non-empty array`,
          });
          continue;
        }
        for (const [blockIndex, block] of section.blocks.entries()) {
          const result = validateContentBlock(block, `${path}.blocks[${blockIndex}]`);
          issues.push(...result.issues);
          substantiveText.push(...result.substantiveText);
        }
      }
    }
  }

  return {
    issues,
    substantiveCharacters: substantiveText.reduce<number>(
      (total, value) => total + readableCharacterCount(value),
      0,
    ),
  };
}

/**
 * Metadata, FAQ and a lead alone are not a complete indexable article.
 * Preview entries may intentionally be bodyless while editorial work continues.
 */
export function hasSubstantivePublicationContent(
  input: Pick<PublicationContractInput, "body" | "detailSections"> | null | undefined,
): boolean {
  if (!input) return false;
  const validation = validatePublicContent(input);
  return validation.issues.length === 0 && validation.substantiveCharacters >= MIN_SUBSTANTIVE_CHARACTERS;
}

function resultWithIssues(
  base: Omit<PublicationContractResult, "disposition" | "issues">,
  issues: PublicationIssue[],
): PublicationContractResult {
  return { ...base, disposition: "rejected", issues };
}

/**
 * Evaluates the only supported publication-state combinations.
 *
 * - published + index   + noindex:false => public/indexable
 * - published + noindex + noindex:true  => route preview, never discoverable
 * - draft|archived + draft + noindex:true => private
 * - archived + redirect + noindex:true => redirect ledger candidate
 *
 * Every field must be explicit. There is intentionally no inferred default.
 */
export function evaluatePublicationContract(
  candidate: PublicationContractInput | null | undefined,
): PublicationContractResult {
  const input = candidate && typeof candidate === "object" ? candidate : {};
  const issues: PublicationIssue[] = [];

  const slug = cleanString(input.slug);
  const title = cleanString(input.title);
  const rawType = cleanString(input.type);
  const rawStatus = cleanString(input.status);
  const rawPublicState = cleanString(input.publicState);

  if (!slug) {
    issues.push({ code: "missing-slug", message: "slug must be an explicit non-empty string" });
  } else if (!ROUTE_SAFE_SLUG.test(slug)) {
    issues.push({
      code: "invalid-slug",
      message: "slug must use lowercase ASCII letters, digits and single hyphen separators",
    });
  }
  if (!title) {
    issues.push({ code: "missing-title", message: "title must be an explicit non-empty string" });
  } else if (isPlaceholderText(title)) {
    issues.push({ code: "invalid-title", message: "title cannot be a TODO/TBD/WIP placeholder" });
  }

  let articleType: RegistryArticleType | null = null;
  if (!hasOwn(input, "type")) {
    issues.push({ code: "missing-type", message: "type must be explicitly set to GUIDE or COLUMN" });
  } else if (!ARTICLE_TYPE_SET.has(rawType)) {
    issues.push({ code: "invalid-type", message: `unsupported article type: ${rawType || "(empty)"}` });
  } else {
    articleType = rawType as RegistryArticleType;
  }

  let status: RegistryContentStatus | null = null;
  if (!hasOwn(input, "status")) {
    issues.push({ code: "missing-status", message: "status must be explicit" });
  } else if (!CONTENT_STATUS_SET.has(rawStatus)) {
    issues.push({ code: "invalid-status", message: `unsupported status: ${rawStatus || "(empty)"}` });
  } else {
    status = rawStatus as RegistryContentStatus;
  }

  let publicState: RegistryPublicState | null = null;
  if (!hasOwn(input, "publicState")) {
    issues.push({ code: "missing-public-state", message: "publicState must be explicit" });
  } else if (!PUBLIC_STATE_SET.has(rawPublicState)) {
    issues.push({
      code: "invalid-public-state",
      message: `unsupported publicState: ${rawPublicState || "(empty)"}`,
    });
  } else {
    publicState = rawPublicState as RegistryPublicState;
  }

  let noindex: boolean | null = null;
  if (!hasOwn(input, "noindex")) {
    issues.push({ code: "missing-noindex", message: "noindex must be an explicit boolean" });
  } else if (typeof input.noindex !== "boolean") {
    issues.push({ code: "invalid-noindex", message: "noindex must be a boolean" });
  } else {
    noindex = input.noindex;
  }

  const base = { articleType, slug, status, publicState, noindex };
  if (issues.length > 0) return resultWithIssues(base, issues);

  if (status === "published" && publicState === "index" && noindex === false) {
    const contentValidation = validatePublicContent(input);
    issues.push(...contentValidation.issues);
    if (contentValidation.substantiveCharacters < MIN_SUBSTANTIVE_CHARACTERS) {
      issues.push({
        code: "missing-substantive-content",
        message: `an indexable article requires at least ${MIN_SUBSTANTIVE_CHARACTERS} readable characters in valid body blocks`,
      });
    }
    if (issues.length > 0) return resultWithIssues(base, issues);
    return { ...base, disposition: "public", issues };
  }

  if (status === "published" && publicState === "noindex" && noindex === true) {
    return { ...base, disposition: "preview", issues };
  }

  if ((status === "draft" || status === "archived") && publicState === "draft" && noindex === true) {
    return { ...base, disposition: "private", issues };
  }

  if (status === "archived" && publicState === "redirect" && noindex === true) {
    return { ...base, disposition: "redirect", issues };
  }

  issues.push({
    code: "inconsistent-publication-state",
    message: `unsupported state combination: status=${status}, publicState=${publicState}, noindex=${String(noindex)}`,
  });
  return resultWithIssues(base, issues);
}

/** Detects duplicate slugs before any Map can silently apply a last-write-wins rule. */
export function findDuplicatePublicationSlugs(
  candidates: readonly PublicationContractInput[],
): readonly DuplicatePublicationSlug[] {
  const buckets = new Map<string, { indexes: number[]; types: string[] }>();

  candidates.forEach((candidate, index) => {
    const slug = cleanString(candidate?.slug);
    if (!slug) return;
    const bucket = buckets.get(slug) ?? { indexes: [], types: [] };
    bucket.indexes.push(index);
    bucket.types.push(cleanString(candidate?.type) || "(missing)");
    buckets.set(slug, bucket);
  });

  return [...buckets.entries()]
    .filter(([, bucket]) => bucket.indexes.length > 1)
    .map(([slug, bucket]) => ({ slug, indexes: bucket.indexes, types: bucket.types }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "en"));
}
