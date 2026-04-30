import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

import { DECISION_GUIDE_MIN, countMarkdownHeadings, getDecisionGuideAuditBody } from "./lib/guide-decision.mjs";

const ROOT = process.cwd();
const GUIDES_DIR = path.join(ROOT, "data", "articles", "guides");
const PUBLIC_DIR = path.join(ROOT, "public");

const REQUIRED_STRING_FIELDS = [
  "slug",
  "title",
  "summary",
  "seoTitle",
  "seoDescription",
  "lead",
  "displayTag",
  "eyebrowLabel",
  "heroImage",
  "thumbnail",
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

function validateSupportedHref(file, key, href, errors) {
  if (!isNonEmptyString(href)) return;
  if (!isSupportedHref(href)) {
    pushError(errors, file, `${key} は https:// か / から始まる必要があります`);
  }
}

function validateAssetPath(file, key, value, errors) {
  if (!isNonEmptyString(value)) return;
  const assetPath = value.trim();
  if (isAbsoluteUrl(assetPath)) return;
  if (!isRootRelativePath(assetPath)) {
    pushError(errors, file, `${key} は https:// か / から始まる必要があります`);
    return;
  }

  const localPath = path.join(PUBLIC_DIR, assetPath.replace(/^\/+/, ""));
  if (!fsSync.existsSync(localPath)) {
    pushError(errors, file, `${key} の画像が public 配下に存在しません: ${assetPath}`);
  }
}

function validateSourceUrls(file, value, errors) {
  const arr = asArray(value);
  const valid = arr.filter(isNonEmptyString);
  if (valid.length < 3) {
    pushError(errors, file, `sources は 3 件以上必要です`);
  }
  if (valid.length !== arr.length) {
    pushError(errors, file, `sources に空文字または文字列以外が含まれています`);
  }
  valid.forEach((entry, index) => {
    if (!isAbsoluteUrl(entry)) {
      pushError(errors, file, `sources[${index}] は http(s) URL で指定してください`);
    }
  });
}

function pushError(errors, file, message) {
  errors.push(`${file}: ${message}`);
}

async function listGuideFiles() {
  const entries = await fs.readdir(GUIDES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(GUIDES_DIR, entry.name))
    .sort();
}

function validateBreadcrumbs(file, guide, errors) {
  const trail = asArray(guide.breadcrumbTrail);
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

function validateAuthor(file, guide, errors) {
  const author = guide.authorProfile;
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

function validateFaq(file, guide, errors) {
  const faq = asArray(guide.faq);
  if (faq.length < 2) {
    pushError(errors, file, "faq は 2 件以上必要です");
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

function validateActionBox(file, guide, errors) {
  const actionBox = guide.actionBox;
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
  if (actions.length < 1) {
    pushError(errors, file, "actionBox.actions は 1 件以上必要です");
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
      const items = asArray(card.items).filter(isNonEmptyString);
      if (!isNonEmptyString(card.body) && items.length === 0) {
        pushError(errors, file, `${base}.cards[${cardIndex}] は body か items が必要です`);
      }
    });
    return;
  }

  if (block.type === "caseStudy") {
    const cases = asArray(block.cases);
    if (cases.length < 1) {
      pushError(errors, file, `${base}.cases は 1 件以上必要です`);
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
        return;
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

function validateSections(file, guide, errors) {
  const sections = asArray(guide.detailSections);
  if (sections.length < 3) {
    pushError(errors, file, "detailSections は 3 セクション以上必要です");
    return;
  }

  const ids = new Set();
  let totalBlocks = 0;

  sections.forEach((section, sectionIndex) => {
    const base = `detailSections[${sectionIndex}]`;
    if (!section || typeof section !== "object") {
      pushError(errors, file, `${base} が object ではありません`);
      return;
    }
    if (!isNonEmptyString(section.title)) {
      pushError(errors, file, `${base}.title が必要です`);
    }
    if (isNonEmptyString(section.id)) {
      const id = section.id.trim();
      if (ids.has(id)) pushError(errors, file, `${base}.id=${id} が重複しています`);
      ids.add(id);
    }
    const blocks = asArray(section.blocks);
    if (blocks.length === 0) {
      pushError(errors, file, `${base}.blocks が空です`);
      return;
    }
    totalBlocks += blocks.length;
    blocks.forEach((block, blockIndex) => validateBlock(file, sectionIndex, blockIndex, block, errors));
  });

  if (totalBlocks < 6) {
    pushError(errors, file, "detailSections.blocks の合計は 6 件以上必要です");
  }
}

async function main() {
  const files = await listGuideFiles();
  const errors = [];

  const guides = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      guide: JSON.parse(await fs.readFile(filePath, "utf8")),
    })),
  );
  const guideSlugs = new Set(guides.map(({ guide }) => String(guide.slug ?? "").trim()).filter(Boolean));

  for (const { filePath, guide } of guides) {
    const file = path.relative(ROOT, filePath);

    if (String(guide.layoutVariant ?? "").trim() !== "decision-v1") continue;
    if (String(guide.status ?? "published") !== "published") continue;

    for (const key of REQUIRED_STRING_FIELDS) {
      if (!isNonEmptyString(guide[key])) {
        pushError(errors, file, `${key} が必要です`);
      }
    }

    if (!isValidDateString(guide.publishedAt)) {
      pushError(errors, file, "publishedAt は YYYY-MM-DD 形式で必要です");
    }
    if (!isValidDateString(guide.updatedAt)) {
      pushError(errors, file, "updatedAt は YYYY-MM-DD 形式で必要です");
    }
    if (typeof guide.readMinutes !== "number" || !Number.isFinite(guide.readMinutes) || guide.readMinutes < 1) {
      pushError(errors, file, "readMinutes は 1 以上の number で必要です");
    }

    const auditBody = getDecisionGuideAuditBody(guide);
    const headingCount = countMarkdownHeadings(auditBody);
    if (auditBody.length < DECISION_GUIDE_MIN.bodyLen) {
      pushError(
        errors,
        file,
        `structured body 生成後の本文長は ${DECISION_GUIDE_MIN.bodyLen} 文字以上必要です`,
      );
    }
    if (headingCount < DECISION_GUIDE_MIN.headings) {
      pushError(
        errors,
        file,
        `structured body 生成後の Markdown 見出し数は ${DECISION_GUIDE_MIN.headings} 以上必要です`,
      );
    }

    validateBreadcrumbs(file, guide, errors);
    validateAuthor(file, guide, errors);
    validateStringList(file, "keyPoints", guide.keyPoints, 3, errors);
    validateStringList(file, "checkpoints", guide.checkpoints, 3, errors);
    validateSourceUrls(file, guide.sources, errors);
    validateStringList(file, "relatedGuideSlugs", guide.relatedGuideSlugs, 2, errors);
    validateAssetPath(file, "heroImage", guide.heroImage, errors);
    validateAssetPath(file, "thumbnail", guide.thumbnail, errors);

    const relatedGuideSlugs = asArray(guide.relatedGuideSlugs).filter(isNonEmptyString).map((slug) => slug.trim());
    const relatedGuideSet = new Set();
    relatedGuideSlugs.forEach((slug, index) => {
      if (slug === guide.slug) {
        pushError(errors, file, `relatedGuideSlugs[${index}] に自身の slug は指定できません`);
      }
      if (relatedGuideSet.has(slug)) {
        pushError(errors, file, `relatedGuideSlugs[${index}] が重複しています: ${slug}`);
      }
      relatedGuideSet.add(slug);
      if (!guideSlugs.has(slug)) {
        pushError(errors, file, `relatedGuideSlugs[${index}] が存在しません: ${slug}`);
      }
    });
    validateFaq(file, guide, errors);
    validateActionBox(file, guide, errors);
    validateSections(file, guide, errors);
  }

  if (errors.length > 0) {
    console.error("\n[verify-guide-decision-json] decision-v1 JSON に不備があります:\n");
    for (const error of errors) {
      console.error(` - ${error}`);
    }
    console.error(`\nTotal: ${errors.length}`);
    process.exit(1);
  }

  console.log("[verify-guide-decision-json] OK");
}

main().catch((error) => {
  console.error("[verify-guide-decision-json] Failed", error);
  process.exit(1);
});
