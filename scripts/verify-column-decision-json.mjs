import fs from "node:fs/promises";
import path from "node:path";

import {
  DECISION_COLUMN_MIN,
  countMarkdownHeadings,
  getDecisionColumnAuditBody,
  isDecisionColumn,
} from "./lib/guide-decision.mjs";

const ROOT = process.cwd();
const COLUMNS_DIR = path.join(ROOT, "data", "articles", "columns");

const REQUIRED_STRING_FIELDS = [
  "slug",
  "title",
  "summary",
  "seoTitle",
  "seoDescription",
  "lead",
  "displayTag",
  "eyebrowLabel",
  "primaryQuery",
  "updateReason",
];

const ALLOWED_BLOCK_TYPES = new Set([
  "paragraph",
  "list",
  "comparisonTable",
  "callout",
  "flow",
  "timeline",
  "decisionCards",
  "caseStudy",
]);

const ALLOWED_CALLOUT_TONES = new Set(["info", "note", "warn", "accent"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isValidDateString(value) {
  return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function isAbsoluteUrl(value) {
  return isNonEmptyString(value) && /^https?:\/\//i.test(value.trim());
}

function isRootRelativePath(value) {
  return isNonEmptyString(value) && /^\/(?!\/)/.test(value.trim());
}

function isSupportedHref(value) {
  return isAbsoluteUrl(value) || isRootRelativePath(value);
}

function pushError(errors, file, message) {
  errors.push(`${file}: ${message}`);
}

function pushWarning(warnings, file, message) {
  warnings.push(`${file}: ${message}`);
}

function validateSupportedHref(file, key, href, errors) {
  if (!isNonEmptyString(href)) return;
  if (!isSupportedHref(href)) {
    pushError(errors, file, `${key} は https:// か / から始まる必要があります`);
  }
}

async function listColumnFiles() {
  const entries = await fs.readdir(COLUMNS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(COLUMNS_DIR, entry.name))
    .sort();
}

function validateBreadcrumbs(file, column, errors) {
  const trail = asArray(column.breadcrumbTrail);
  if (trail.length < 3) {
    pushError(errors, file, "breadcrumbTrail は 3 件以上必要です");
    return;
  }

  trail.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      pushError(errors, file, `breadcrumbTrail[${index}] が object ではありません`);
      return;
    }
    if (!isNonEmptyString(item.label)) {
      pushError(errors, file, `breadcrumbTrail[${index}].label が必要です`);
    }
    if (index < trail.length - 1 && !isNonEmptyString(item.href)) {
      pushError(errors, file, `breadcrumbTrail[${index}].href が必要です`);
    }
    if (index < trail.length - 1) {
      validateSupportedHref(file, `breadcrumbTrail[${index}].href`, item.href, errors);
    }
  });
}

function validateAuthor(file, column, errors) {
  const author = column.authorProfile;
  if (!author || typeof author !== "object") {
    pushError(errors, file, "authorProfile が必要です");
    return;
  }
  if (!isNonEmptyString(author.name)) {
    pushError(errors, file, "authorProfile.name が必要です");
  }
  if (!isNonEmptyString(author.credential)) {
    pushError(errors, file, "authorProfile.credential が必要です");
  }
  if (author.kind != null && author.kind !== "person" && author.kind !== "organization") {
    pushError(errors, file, "authorProfile.kind は person か organization で指定してください");
  }
}

function validateStringList(file, key, value, minCount, errors) {
  const arr = asArray(value);
  const valid = arr.filter(isNonEmptyString);
  if (valid.length < minCount) {
    pushError(errors, file, `${key} は ${minCount} 件以上必要です`);
  }
  if (valid.length !== arr.length) {
    pushError(errors, file, `${key} に空文字または文字列以外が含まれています`);
  }
}

function validateFaq(file, column, errors) {
  const faq = asArray(column.faq);
  if (faq.length < DECISION_COLUMN_MIN.faq) {
    pushError(errors, file, `faq は ${DECISION_COLUMN_MIN.faq} 件以上必要です`);
    return;
  }
  faq.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      pushError(errors, file, `faq[${index}] が object ではありません`);
      return;
    }
    if (!isNonEmptyString(item.question)) {
      pushError(errors, file, `faq[${index}].question が必要です`);
    }
    if (!isNonEmptyString(item.answer)) {
      pushError(errors, file, `faq[${index}].answer が必要です`);
    }
  });
}

function validateActionBox(file, column, errors) {
  const actionBox = column.actionBox;
  if (!actionBox || typeof actionBox !== "object") {
    pushError(errors, file, "actionBox が必要です");
    return;
  }
  if (!isNonEmptyString(actionBox.title)) {
    pushError(errors, file, "actionBox.title が必要です");
  }
  if (!isNonEmptyString(actionBox.body)) {
    pushError(errors, file, "actionBox.body が必要です");
  }
  const actions = asArray(actionBox.actions);
  if (actions.length < DECISION_COLUMN_MIN.actionLinks) {
    pushError(errors, file, `actionBox.actions は ${DECISION_COLUMN_MIN.actionLinks} 件以上必要です`);
    return;
  }
  actions.forEach((action, index) => {
    if (!action || typeof action !== "object") {
      pushError(errors, file, `actionBox.actions[${index}] が object ではありません`);
      return;
    }
    if (!isNonEmptyString(action.label)) {
      pushError(errors, file, `actionBox.actions[${index}].label が必要です`);
    }
    if (!isNonEmptyString(action.href)) {
      pushError(errors, file, `actionBox.actions[${index}].href が必要です`);
    } else {
      validateSupportedHref(file, `actionBox.actions[${index}].href`, action.href, errors);
    }
  });
}

function validateBlock(file, sectionIndex, blockIndex, block, errors) {
  const base = `detailSections[${sectionIndex}].blocks[${blockIndex}]`;
  if (!block || typeof block !== "object") {
    pushError(errors, file, `${base} が object ではありません`);
    return;
  }
  if (!isNonEmptyString(block.type)) {
    pushError(errors, file, `${base}.type が必要です`);
    return;
  }
  if (!ALLOWED_BLOCK_TYPES.has(block.type)) {
    pushError(errors, file, `${base}.type=${block.type} は未対応です`);
    return;
  }

  if (block.type === "paragraph") {
    if (!isNonEmptyString(block.text)) pushError(errors, file, `${base}.text が必要です`);
    return;
  }

  if (block.type === "list") {
    validateStringList(file, `${base}.items`, block.items, 2, errors);
    return;
  }

  if (block.type === "comparisonTable") {
    const headers = asArray(block.headers);
    const rows = asArray(block.rows);
    if (headers.filter(isNonEmptyString).length < 2) {
      pushError(errors, file, `${base}.headers は 2 件以上必要です`);
    }
    if (rows.length < 2) {
      pushError(errors, file, `${base}.rows は 2 行以上必要です`);
    }
    rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        pushError(errors, file, `${base}.rows[${rowIndex}] が配列ではありません`);
        return;
      }
      const cells = row.filter(isNonEmptyString);
      if (cells.length !== headers.length) {
        pushError(errors, file, `${base}.rows[${rowIndex}] の列数が headers と一致していません`);
      }
    });
    return;
  }

  if (block.type === "callout") {
    if (block.tone != null && !ALLOWED_CALLOUT_TONES.has(block.tone)) {
      pushError(errors, file, `${base}.tone は info/note/warn/accent のみ対応です`);
    }
    const hasTitle = isNonEmptyString(block.title);
    const hasBody = isNonEmptyString(block.body);
    const items = asArray(block.items).filter(isNonEmptyString);
    if (!hasTitle && !hasBody && items.length === 0) {
      pushError(errors, file, `${base} は title/body/items のいずれかが必要です`);
    }
    return;
  }

  if (block.type === "flow") {
    const steps = asArray(block.steps);
    if (steps.length < 2) {
      pushError(errors, file, `${base}.steps は 2 件以上必要です`);
      return;
    }
    steps.forEach((step, stepIndex) => {
      if (!step || typeof step !== "object") {
        pushError(errors, file, `${base}.steps[${stepIndex}] が object ではありません`);
        return;
      }
      if (!isNonEmptyString(step.title)) {
        pushError(errors, file, `${base}.steps[${stepIndex}].title が必要です`);
      }
    });
    return;
  }

  if (block.type === "timeline") {
    const items = asArray(block.items);
    if (items.length < 2) {
      pushError(errors, file, `${base}.items は 2 件以上必要です`);
      return;
    }
    items.forEach((item, itemIndex) => {
      if (!item || typeof item !== "object") {
        pushError(errors, file, `${base}.items[${itemIndex}] が object ではありません`);
        return;
      }
      if (!isNonEmptyString(item.label)) {
        pushError(errors, file, `${base}.items[${itemIndex}].label が必要です`);
      }
      const bullets = asArray(item.items).filter(isNonEmptyString);
      if (!isNonEmptyString(item.title) && !isNonEmptyString(item.body) && bullets.length === 0) {
        pushError(errors, file, `${base}.items[${itemIndex}] は title/body/items のいずれかが必要です`);
      }
    });
    return;
  }

  if (block.type === "decisionCards") {
    const cards = asArray(block.cards);
    if (cards.length < 2) {
      pushError(errors, file, `${base}.cards は 2 件以上必要です`);
      return;
    }
    cards.forEach((card, cardIndex) => {
      if (!card || typeof card !== "object") {
        pushError(errors, file, `${base}.cards[${cardIndex}] が object ではありません`);
        return;
      }
      if (!isNonEmptyString(card.title)) {
        pushError(errors, file, `${base}.cards[${cardIndex}].title が必要です`);
      }
      const bullets = asArray(card.items).filter(isNonEmptyString);
      if (!isNonEmptyString(card.body) && bullets.length === 0) {
        pushError(errors, file, `${base}.cards[${cardIndex}] は body か items のどちらかが必要です`);
      }
    });
    return;
  }

  if (block.type === "caseStudy") {
    const cases = asArray(block.cases);
    if (cases.length < 2) {
      pushError(errors, file, `${base}.cases は 2 件以上必要です`);
      return;
    }
    cases.forEach((entry, caseIndex) => {
      if (!entry || typeof entry !== "object") {
        pushError(errors, file, `${base}.cases[${caseIndex}] が object ではありません`);
        return;
      }
      if (!isNonEmptyString(entry.title)) {
        pushError(errors, file, `${base}.cases[${caseIndex}].title が必要です`);
      }
      const rows = asArray(entry.rows);
      if (rows.length < 2) {
        pushError(errors, file, `${base}.cases[${caseIndex}].rows は 2 件以上必要です`);
      }
      rows.forEach((row, rowIndex) => {
        if (!row || typeof row !== "object") {
          pushError(errors, file, `${base}.cases[${caseIndex}].rows[${rowIndex}] が object ではありません`);
          return;
        }
        if (!isNonEmptyString(row.label)) {
          pushError(errors, file, `${base}.cases[${caseIndex}].rows[${rowIndex}].label が必要です`);
        }
        if (!isNonEmptyString(row.value)) {
          pushError(errors, file, `${base}.cases[${caseIndex}].rows[${rowIndex}].value が必要です`);
        }
      });
    });
  }
}

function validateDetailSections(file, column, errors) {
  const sections = asArray(column.detailSections);
  if (sections.length < DECISION_COLUMN_MIN.detailSections) {
    pushError(errors, file, `detailSections は ${DECISION_COLUMN_MIN.detailSections} セクション以上必要です`);
    return;
  }

  let blockCount = 0;
  sections.forEach((section, sectionIndex) => {
    if (!section || typeof section !== "object") {
      pushError(errors, file, `detailSections[${sectionIndex}] が object ではありません`);
      return;
    }
    if (!isNonEmptyString(section.title)) {
      pushError(errors, file, `detailSections[${sectionIndex}].title が必要です`);
    }
    const blocks = asArray(section.blocks);
    if (blocks.length < 1) {
      pushError(errors, file, `detailSections[${sectionIndex}].blocks は 1 件以上必要です`);
      return;
    }
    blockCount += blocks.length;
    blocks.forEach((block, blockIndex) => {
      validateBlock(file, sectionIndex, blockIndex, block, errors);
    });
  });

  if (blockCount < DECISION_COLUMN_MIN.detailBlocks) {
    pushError(errors, file, `detailSections.blocks 合計は ${DECISION_COLUMN_MIN.detailBlocks} 件以上必要です`);
  }
}

async function main() {
  const files = await listColumnFiles();
  const errors = [];
  const warnings = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const column = JSON.parse(raw);
    if (!isDecisionColumn(column)) continue;
    if (String(column.status ?? "published") !== "published") continue;

    REQUIRED_STRING_FIELDS.forEach((key) => {
      if (!isNonEmptyString(column[key])) {
        pushError(errors, file, `${key} が必要です`);
      }
    });

    if (!isValidDateString(column.publishedAt)) {
      pushError(errors, file, "publishedAt は YYYY-MM-DD 形式で指定してください");
    }
    if (!isValidDateString(column.updatedAt)) {
      pushError(errors, file, "updatedAt は YYYY-MM-DD 形式で指定してください");
    }
    if (!(typeof column.readMinutes === "number" && Number.isFinite(column.readMinutes) && column.readMinutes > 0)) {
      pushError(errors, file, "readMinutes は正の数値で指定してください");
    }

    validateBreadcrumbs(file, column, errors);
    validateAuthor(file, column, errors);
    validateStringList(file, "keyPoints", column.keyPoints, DECISION_COLUMN_MIN.keyPoints, errors);
    validateStringList(file, "checkpoints", column.checkpoints, DECISION_COLUMN_MIN.checkpoints, errors);
    validateFaq(file, column, errors);
    validateActionBox(file, column, errors);
    validateDetailSections(file, column, errors);
    validateStringList(file, "sources", column.sources, DECISION_COLUMN_MIN.sources, errors);
    validateStringList(file, "relatedGuideSlugs", column.relatedGuideSlugs, 1, errors);

    const actionLinks = asArray(column?.actionBox?.actions);
    actionLinks.forEach((action, index) => {
      if (action && typeof action === "object" && isNonEmptyString(action.href)) {
        validateSupportedHref(file, `actionBox.actions[${index}].href`, action.href, errors);
      }
    });

    const auditBody = getDecisionColumnAuditBody(column);
    const bodyLen = auditBody.length;
    const headings = countMarkdownHeadings(auditBody);
    if (bodyLen < DECISION_COLUMN_MIN.bodyLen) {
      pushError(errors, file, `structured body は ${DECISION_COLUMN_MIN.bodyLen} 文字以上必要です（現在: ${bodyLen}）`);
    }
    if (headings < DECISION_COLUMN_MIN.headings) {
      pushError(errors, file, `structured body の見出しは ${DECISION_COLUMN_MIN.headings} 件以上必要です（現在: ${headings}）`);
    }

    if (isNonEmptyString(column.body)) {
      pushError(errors, file, "decision column に raw body を残せません");
    }
  }

  if (warnings.length > 0) {
    console.warn(`[verify-column-decision-json] warnings=${warnings.length}`);
    warnings.forEach((message) => console.warn(`- ${message}`));
  }

  if (errors.length > 0) {
    console.error(`[verify-column-decision-json] FAILED (${errors.length} errors)`);
    errors.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }

  console.log(`[verify-column-decision-json] OK (${files.length} files scanned)`);
}

main().catch((error) => {
  console.error("[verify-column-decision-json] unexpected error", error);
  process.exit(1);
});
