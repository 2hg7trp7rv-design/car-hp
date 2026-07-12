import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARTICLE_DIRS = [
  "data/articles/columns",
  "data/articles/guides",
];

const ALLOWED_BLOCK_TYPES = new Set([
  "dialogue", "paragraph", "image", "list", "subheading", "quote", "divider", "comparisonTable",
  "callout", "flow", "timeline", "decisionCards", "editorialBoard", "caseStudy",
]);
const ALLOWED_VARIANTS = new Set([
  "default", "soft", "outline", "emphasis", "compact", "lead", "section",
  "mock-figure", "mock-system", "mock-info", "mock-table", "mock-numbered",
  "mock-step-cards", "mock-checklist", "mock-summary",
]);
const ALLOWED_WIDTHS = new Set(["normal", "wide", "bleed"]);
const ALLOWED_MOTIONS = new Set(["none", "fade-up", "fade-left", "fade-right", "scale-in"]);
const INTERNAL_WORDS = /(Kimi|モック|ChatGPT|生成AI|AIで作成|ZIP|child guide|editorial structure|common philosophy|decision UI|duplicate point|rebuild|cleanup)/iu;
const STALE_PHRASES = ["後から深掘りします", "今後の中古カスタム車Guide", "今後は専門Guide", "今後も子Guide"];

const errors = [];
const lessons = new Map();

const fail = (file, message) => errors.push(`${file}: ${message}`);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const supportedHref = (value) => nonEmpty(value) && (/^\/(?!\/)/u.test(value.trim()) || /^https:\/\//iu.test(value.trim()));
const asArray = (value) => Array.isArray(value) ? value : [];

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/gu, "")
    .replace(/[、。,.，．・｜|]/gu, "")
    .trim();
}

function collectText(value) {
  if (value == null) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}

function listJsonFiles(dir) {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs.readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== ".gitkeep")
    .map((entry) => path.join(dir, entry.name));
}

function listCbjWorldArticleFiles() {
  const candidates = ARTICLE_DIRS.flatMap(listJsonFiles).sort();
  const targets = [];
  for (const relativeFile of candidates) {
    const absoluteFile = path.join(ROOT, relativeFile);
    try {
      const article = JSON.parse(fs.readFileSync(absoluteFile, "utf8"));
      if (article?.articleDesign?.version === "cbj-world-v1" || article?.layoutVariant === "cbj-world-v1") {
        targets.push(relativeFile);
      }
    } catch {
      targets.push(relativeFile);
    }
  }
  return targets;
}


const TARGETS = listCbjWorldArticleFiles();

for (const relativeFile of TARGETS) {
  const absoluteFile = path.join(ROOT, relativeFile);
  if (!fs.existsSync(absoluteFile)) {
    fail(relativeFile, "対象記事JSONが存在しません");
    continue;
  }

  let article;
  try {
    article = JSON.parse(fs.readFileSync(absoluteFile, "utf8"));
  } catch (error) {
    fail(relativeFile, `JSONを読み込めません: ${error.message}`);
    continue;
  }

  const design = article.articleDesign;
  const isGuideArticle = relativeFile.includes("/guides/");
  if (!design || design.version !== "cbj-world-v1") fail(relativeFile, "articleDesign.version は cbj-world-v1 が必要です");
  if (!nonEmpty(design?.heroTitle)) fail(relativeFile, "articleDesign.heroTitle が必要です");
  if (!nonEmpty(design?.heroLead)) fail(relativeFile, "articleDesign.heroLead が必要です。ArticleHero は本文leadへフォールバックしません");
  if (isGuideArticle && !nonEmpty(design?.heroPromise)) fail(relativeFile, "articleDesign.heroPromise が必要です");
  if (isGuideArticle && nonEmpty(article.lead) && normalizeText(article.lead) === normalizeText(design?.heroLead)) {
    fail(relativeFile, "lead と heroLead が同義です。ヒーローと本文導入の重複表示を避けてください");
  }
  if (!Array.isArray(design?.introDialogue) || design.introDialogue.length === 0) fail(relativeFile, "introDialogue が必要です");
  const hasInlineDialogue = asArray(article.detailSections).some((section) =>
    asArray(section?.blocks).some((block) => block?.type === "dialogue"),
  );
  if ((!Array.isArray(design?.closingDialogue) || design.closingDialogue.length === 0) && !hasInlineDialogue) {
    fail(relativeFile, "closingDialogue または本文内dialogueが必要です");
  }

  const lesson = design?.lessonNumber;
  if (!Number.isInteger(lesson) || lesson < 1) {
    fail(relativeFile, "lessonNumber は1以上の整数が必要です");
  } else if (lessons.has(lesson)) {
    fail(relativeFile, `lessonNumber ${lesson} が ${lessons.get(lesson)} と重複しています`);
  } else {
    lessons.set(lesson, relativeFile);
  }

  if (Object.prototype.hasOwnProperty.call(article, "body")) fail(relativeFile, "旧bodyを残さずdetailSectionsを正本にしてください");

  if (!nonEmpty(article.updateReason)) {
    fail(relativeFile, "updateReason が必要です");
  } else if (INTERNAL_WORDS.test(article.updateReason)) {
    fail(relativeFile, "公開更新履歴に内部実装語を含めないでください");
  }

  const publicText = collectText({
    updateReason: article.updateReason,
    actionBox: article.actionBox,
    detailSections: article.detailSections,
    faq: article.faq,
    keyPoints: article.keyPoints,
    checkpoints: article.checkpoints,
  }).join("\n");
  for (const phrase of STALE_PHRASES) {
    if (publicText.includes(phrase)) fail(relativeFile, `公開本文に未完了表現「${phrase}」が残っています`);
  }
  if (isGuideArticle && /SYSTEM\s*0[123]/iu.test(publicText)) {
    fail(relativeFile, "子GUIDE本文に固定SYSTEM 01/02/03を残さないでください");
  }
  if (isGuideArticle && INTERNAL_WORDS.test(publicText)) {
    fail(relativeFile, "公開本文・更新履歴に内部作業語が残っています");
  }

  for (const [index, source] of (article.sources ?? []).entries()) {
    const sourceUrl = typeof source === "string" ? source.trim() : String(source?.url ?? "").trim();
    if (!/^https:\/\//iu.test(sourceUrl)) fail(relativeFile, `sources[${index}] は https URL が必要です`);
    if (source && typeof source === "object") {
      if (!nonEmpty(source.title)) fail(relativeFile, `sources[${index}].title が必要です`);
      if (!nonEmpty(source.publisher)) fail(relativeFile, `sources[${index}].publisher が必要です`);
      if (!nonEmpty(source.claim)) fail(relativeFile, `sources[${index}].claim が必要です`);
    }
  }

  const actions = article.actionBox?.actions ?? [];
  if (!Array.isArray(actions) || actions.length === 0) fail(relativeFile, "actionBox.actions が必要です");
  for (const [index, action] of actions.entries()) {
    if (!nonEmpty(action?.label)) fail(relativeFile, `actionBox.actions[${index}].label が必要です`);
    if (!supportedHref(action?.href)) fail(relativeFile, `actionBox.actions[${index}].href が不正です`);
    if (action?.href === "/guide" || action?.href === "/column") fail(relativeFile, `actionBox.actions[${index}] に汎用一覧URLを使わないでください`);
    if (isGuideArticle && nonEmpty(action?.label) && !String(action.label).includes("｜")) {
      fail(relativeFile, `actionBox.actions[${index}].label には「読む理由」を｜で含めてください`);
    }
  }

  const sections = article.detailSections;
  if (!Array.isArray(sections) || sections.length === 0) {
    fail(relativeFile, "detailSections が必要です");
    continue;
  }
  const sectionIds = new Set();
  const detailCallouts = [];
  const detailDecisionCards = [];
  for (const [sectionIndex, section] of sections.entries()) {
    const base = `detailSections[${sectionIndex}]`;
    if (!nonEmpty(section?.id)) fail(relativeFile, `${base}.id が必要です`);
    else if (sectionIds.has(section.id)) fail(relativeFile, `${base}.id「${section.id}」が重複しています`);
    else sectionIds.add(section.id);
    if (!nonEmpty(section?.title)) fail(relativeFile, `${base}.title が必要です`);
    if (!Array.isArray(section?.blocks) || section.blocks.length === 0) {
      fail(relativeFile, `${base}.blocks が必要です`);
      continue;
    }

    for (const [blockIndex, block] of section.blocks.entries()) {
      const blockBase = `${base}.blocks[${blockIndex}]`;
      if (!ALLOWED_BLOCK_TYPES.has(block?.type)) fail(relativeFile, `${blockBase}.type「${block?.type}」は未対応です`);
      const presentation = block?.presentation;
      if (presentation?.variant && !ALLOWED_VARIANTS.has(presentation.variant)) fail(relativeFile, `${blockBase}.presentation.variant が不正です`);
      if (presentation?.width && !ALLOWED_WIDTHS.has(presentation.width)) fail(relativeFile, `${blockBase}.presentation.width が不正です`);
      if (presentation?.motion && !ALLOWED_MOTIONS.has(presentation.motion)) fail(relativeFile, `${blockBase}.presentation.motion が不正です`);
      if (block?.type === "callout") detailCallouts.push(block);
      if (block?.type === "decisionCards") detailDecisionCards.push(block);

      if (block?.type === "image") {
        if (!nonEmpty(block.src) || !block.src.startsWith("/")) fail(relativeFile, `${blockBase}.src は / から始まる必要があります`);
        const diskPath = path.join(ROOT, "public", String(block.src ?? "").replace(/^\/+/, ""));
        if (!fs.existsSync(diskPath)) fail(relativeFile, `${blockBase}.src の画像がありません: ${block.src}`);
        if (!nonEmpty(block.alt)) fail(relativeFile, `${blockBase}.alt が必要です`);
        if (!Number.isInteger(block.width) || block.width < 1 || !Number.isInteger(block.height) || block.height < 1) {
          fail(relativeFile, `${blockBase} にwidth/heightが必要です`);
        }
      }
    }
  }

  if (isGuideArticle) {
    if (detailCallouts.some((block) => String(block?.title ?? "").trim().includes("結論"))) {
      fail(relativeFile, "detailSections内の結論calloutは使わず、articleDesign.closingBlocksの最終結論に統合してください");
    }
    if (detailCallouts.some((block) => String(block?.tone ?? "info") === "info")) {
      fail(relativeFile, "本文内のtone=info calloutはPOINT表示になるため使用しないでください。NOTE/CHECK/CAUTIONへ分けてください");
    }
    if (detailDecisionCards.length > 0) {
      fail(relativeFile, "子GUIDEでは汎用decisionCardsを使わず、記事別のcomparisonTable/flowで判断UIを作ってください");
    }
    const finalConclusionBlocks = (design?.closingBlocks ?? []).filter((block) => block?.type === "callout" && String(block?.title ?? "").trim() === "最終結論");
    if (finalConclusionBlocks.length !== 1) fail(relativeFile, "articleDesign.closingBlocks に最終結論calloutを1つだけ置いてください");
    else if (String(finalConclusionBlocks[0]?.tone ?? "info") !== "info") fail(relativeFile, "最終結論calloutは tone=info としてください");
  }
}

if (errors.length) {
  console.error(`[verify-article-design-system] FAILED (${errors.length} errors)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[verify-article-design-system] OK (${TARGETS.length} cbj-world articles, ${lessons.size} unique lessons)`);
