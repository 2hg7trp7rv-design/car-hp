// scripts/verify-figure-text.mjs
//
// Goal:
// - Keep hand-authored SVG figures readable: no label outside its own viewBox,
//   no two labels printed on top of each other.
// - These break silently. The build succeeds, the tests pass, and the reader sees
//   a clipped sentence or two words stacked on each other.
//
// Method:
// - Read the prerendered HTML in .next/server/app (same source as verify-rendered-learning).
// - Estimate each <text> box from its font size and character widths, following
//   ancestor translate() transforms and text-anchor.
// - Estimates are deliberate: thresholds are loose enough that only real collisions
//   (a label sitting on another, or a sentence running past the frame) are reported.

import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";

const APP_DIR = path.join(process.cwd(), ".next", "server", "app");
// Ignore brushes against an edge or a neighbour; report only what a reader would notice.
const TOLERANCE = 8;

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const children = (node) => node.childNodes ?? [];

function elements(node) {
  return [...(node.tagName ? [node] : []), ...children(node).flatMap(elements)];
}

function textOf(node) {
  if (node.tagName === "script" || node.tagName === "style") return "";
  if (typeof node.value === "string") return node.value;
  return children(node).map(textOf).join("");
}

/** Advance width in user units. Full-width glyphs take one em; latin and digits about half. */
function textWidth(value, fontSize) {
  let units = 0;
  for (const character of value) {
    const code = character.codePointAt(0);
    if (character === " ") units += 0.35;
    else if (code < 0x2000) units += 0.55;
    else if (character === "−" || character === "…" || character === "→") units += 1;
    else units += 1;
  }
  return units * fontSize;
}

function parseTranslate(value) {
  const match = /translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(value ?? "");
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 };
}

function collectTexts(node, offset, sizes, found) {
  for (const child of children(node)) {
    if (!child.tagName) continue;
    const shift = parseTranslate(attr(child, "transform"));
    const next = { x: offset.x + shift.x, y: offset.y + shift.y };
    if (child.tagName === "text") {
      const value = textOf(child).replace(/\s+/gu, " ").trim();
      if (!value) continue;
      const className = attr(child, "class") ?? "";
      const fontSize = className.includes("svgSmall") ? sizes.small : sizes.base;
      const width = textWidth(value, fontSize);
      const anchor = attr(child, "text-anchor") ?? "start";
      const x = next.x + Number(attr(child, "x") ?? 0);
      const y = next.y + Number(attr(child, "y") ?? 0);
      const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
      found.push({ value, left, right: left + width, top: y - fontSize * 0.82, bottom: y + fontSize * 0.2 });
      continue;
    }
    collectTexts(child, next, sizes, found);
  }
}

function checkFile(relativeHtml) {
  const route = `/${relativeHtml.replace(/\.html$/u, "").replace(/(^|\/)index$/u, "")}`.replace(/\/+$/u, "") || "/";
  // 選ぶ側は choose.module.css の 18 / 15、学ぶ側は learning.module.css の 20 / 16。
  const sizes = route.startsWith("/choose") ? { base: 18, small: 15 } : { base: 20, small: 16 };
  const document = parse(fs.readFileSync(path.join(APP_DIR, relativeHtml), "utf8"));
  const problems = [];
  for (const svg of elements(document).filter((node) => node.tagName === "svg")) {
    const viewBox = (attr(svg, "viewBox") ?? "").split(/[\s,]+/u).map(Number);
    if (viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) continue;
    const [vx, vy, vw, vh] = viewBox;
    const texts = [];
    collectTexts(svg, { x: 0, y: 0 }, sizes, texts);
    for (const item of texts) {
      const over = Math.max(vx - item.left, item.right - (vx + vw), vy - item.top, item.bottom - (vy + vh));
      if (over > TOLERANCE) problems.push(`枠外へ ${Math.round(over)}: 「${item.value}」`);
    }
    for (let a = 0; a < texts.length; a += 1) {
      for (let b = a + 1; b < texts.length; b += 1) {
        const overlapX = Math.min(texts[a].right, texts[b].right) - Math.max(texts[a].left, texts[b].left);
        const overlapY = Math.min(texts[a].bottom, texts[b].bottom) - Math.max(texts[a].top, texts[b].top);
        if (overlapX > TOLERANCE && overlapY > TOLERANCE) {
          problems.push(`重なり ${Math.round(overlapX)}x${Math.round(overlapY)}: 「${texts[a].value}」と「${texts[b].value}」`);
        }
      }
    }
  }
  return problems.map((problem) => `${route}: ${problem}`);
}

function htmlFiles(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(prefix, entry.name);
    if (entry.isDirectory()) return htmlFiles(path.join(dir, entry.name), next);
    return entry.name.endsWith(".html") ? [next] : [];
  });
}

const files = htmlFiles(APP_DIR);
if (files.length === 0) {
  console.error("[verify-figure-text] .next/server/app が見つかりません。先に npm run build を実行してください。");
  process.exit(1);
}
const failures = files.flatMap(checkFile);
if (failures.length > 0) {
  console.error("[verify-figure-text] 図の文字が枠外に出るか、互いに重なっています:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log(`[verify-figure-text] OK: ${files.length} pages, figure labels stay inside the frame and clear of each other`);
