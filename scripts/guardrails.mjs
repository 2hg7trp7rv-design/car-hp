/**
 * scripts/guardrails.mjs
 *
 * iPhone-only運用のための「事故防止」ガードレール。
 * - D.⑨ noindexページ（/search, /compare）を主要導線に置かない
 * - D.⑩ MarkdownとJSONの併用禁止（content/*.md などの本文運用を禁止）
 *
 * 失敗時は build を落として、Vercelで気づけるようにする。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DISALLOWED_MAJOR_PATHS = ["/search", "/compare"];

// 「主要導線」とみなすファイル（ここに /search /compare が出たら即アウト）
const MAJOR_NAV_FILES = [
  "components/layout/SiteHeader.tsx",
  "components/layout/SiteFooter.tsx",
  "components/layout/HamburgerMenu.tsx",
  "components/layout/MobileMenu.tsx",
  "components/layout/BottomNav.tsx",
  "components/MobileBottomNav.tsx",
  "app/page.tsx",
  "app/start/page.tsx",
];

function readText(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf-8");
}

function walk(dirRel, out = []) {
  const abs = path.join(ROOT, dirRel);
  if (!fs.existsSync(abs)) return out;

  const entries = fs.readdirSync(abs, { withFileTypes: true });
  for (const ent of entries) {
    const rel = path.posix.join(dirRel, ent.name);
    const absChild = path.join(ROOT, rel);
    if (ent.isDirectory()) {
      // node_modules は絶対に走査しない
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walk(rel, out);
    } else {
      out.push(rel);
    }
  }
  return out;
}

const errors = [];

// ---- D.⑨: 主要導線チェック
for (const rel of MAJOR_NAV_FILES) {
  const txt = readText(rel);
  if (txt == null) {
    errors.push(`[D.⑨] Major nav file missing: ${rel}`);
    continue;
  }
  for (const p of DISALLOWED_MAJOR_PATHS) {
    if (txt.includes(`"${p}"`) || txt.includes(`'${p}'`) || txt.includes(`href="${p}"`) || txt.includes(`href='${p}'`)) {
      errors.push(`[D.⑨] Disallowed path "${p}" found in major navigation surface: ${rel}`);
    }
  }
}

// ---- D.⑩: Markdown本文運用の禁止（content/ ディレクトリを許可しない）
const contentDir = path.join(ROOT, "content");
if (fs.existsSync(contentDir)) {
  errors.push(`[D.⑩] "content/" directory exists. Markdown+JSON 併用禁止のため、content/ は置かないでください。`);
}


// ---- JSON単一ソースの担保（legacy data/*.json を禁止）
const dataDir = path.join(ROOT, "data");
if (fs.existsSync(dataDir)) {
  const names = fs.readdirSync(dataDir);
  const legacyPatterns = [
    /^cars\d*\.json$/,
    /^guides\d*\.json$/,
    /^columns\d*\.json$/,
    /^heritage\d*\.json$/,
  ];

  for (const name of names) {
    for (const re of legacyPatterns) {
      if (re.test(name)) {
        errors.push(`[DATA] Legacy aggregated file detected: data/${name} (1記事=1JSON運用のため禁止)`);
      }
    }
  }
}

// 「loadMarkdownBodiesFromDir」が残っていないこと（本文のファイル補完は禁止）
const allFiles = walk(".", []);
for (const rel of allFiles) {
  // Guardrails 自身は検知対象から除外（このスクリプト内の検査文字列に反応してしまうため）
  if (rel === "scripts/guardrails.mjs") continue;

  // 走査対象を軽く絞る（コードだけ）
  if (!rel.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)) continue;
  const abs = path.join(ROOT, rel);
  const txt = fs.readFileSync(abs, "utf-8");
  if (txt.includes("loadMarkdownBodiesFromDir")) {
    errors.push(`[D.⑩] loadMarkdownBodiesFromDir detected in ${rel}. Markdown本文の補完ロジックは禁止です。`);
  }
  if (txt.includes("lib/repository/content-files")) {
    errors.push(`[D.⑩] content-files loader detected in ${rel}. Markdown本文運用は禁止です。`);
  }
}

// ---- 結果
if (errors.length) {
  console.error("\n[CBJ Guardrails] ❌ Guardrail violation(s) detected:\n");
  for (const e of errors) console.error(`- ${e}`);
  console.error("\nFix the issues above and retry.\n");
  process.exit(1);
}

console.log("[CBJ Guardrails] ✅ OK (D.⑨ / D.⑩)");
