import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

// These paths are rewritten during `npm run build` and must stay in sync with
// their source data. Keep the scope narrow so CI never rejects unrelated edits.
const GENERATED_PATHS = [
  "data/_internal/public-assets.json",
  "src/generated/audit.generated.json",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/sitemaps",
];

// The generators intentionally record the build time. Ignore only that value;
// every other byte in these committed reports remains part of the comparison.
const TIMESTAMPED_REPORTS = new Set([
  "data/_internal/public-assets.json",
  "src/generated/audit.generated.json",
]);

function runGit(args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error) throw result.error;
  if (!allowFailure && result.status !== 0) {
    const detail = (result.stderr || result.stdout || "unknown git error").trim();
    throw new Error(`git ${args.join(" ")} failed: ${detail}`);
  }

  return result;
}

function nulSeparated(value) {
  return value.split("\0").filter(Boolean);
}

function readFromHead(relativePath) {
  const result = runGit(["show", `HEAD:${relativePath}`], { allowFailure: true });
  if (result.status !== 0) {
    throw new Error(`${relativePath} is not committed at HEAD`);
  }
  return result.stdout;
}

function maskGeneratedAt(relativePath, content) {
  const pattern = /("generatedAt"\s*:\s*)"[^"\r\n]*"/g;
  const matches = [...content.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${relativePath} must contain exactly one generatedAt field`);
  }
  return content.replace(pattern, '$1"<build-time>"');
}

function isTimestampOnlyChange(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return false;
  }

  const committed = maskGeneratedAt(relativePath, readFromHead(relativePath));
  const current = maskGeneratedAt(relativePath, fs.readFileSync(absolutePath, "utf8"));
  return committed === current;
}

function main() {
  const diff = runGit([
    "diff",
    "--name-only",
    "-z",
    "HEAD",
    "--",
    ...GENERATED_PATHS,
  ]);
  const changed = nulSeparated(diff.stdout);

  const untrackedResult = runGit([
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    ...GENERATED_PATHS,
  ]);
  const untracked = nulSeparated(untrackedResult.stdout);

  const meaningfulChanges = changed.filter((relativePath) => {
    return !(
      TIMESTAMPED_REPORTS.has(relativePath) &&
      isTimestampOnlyChange(relativePath)
    );
  });

  if (meaningfulChanges.length > 0 || untracked.length > 0) {
    console.error("[generated-clean] Generated files are not committed or are stale.");
    for (const relativePath of meaningfulChanges) {
      console.error(`  changed: ${relativePath}`);
    }
    for (const relativePath of untracked) {
      console.error(`  untracked: ${relativePath}`);
    }
    console.error("Run npm run build, review the output, and commit the generated files.");
    process.exit(1);
  }

  console.log("[generated-clean] Generated files match HEAD (build timestamps ignored).");
}

main();
