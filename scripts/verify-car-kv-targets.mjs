import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const TARGETS_FILE = path.join(ROOT, "data", "_internal", "car-kv-targets.json");
const PUBLIC_ASSETS_FILE = path.join(ROOT, "data", "_internal", "public-assets.json");

function fail(message, detail) {
  if (detail) {
    console.error("[verify-car-kv-targets]", message, detail);
  } else {
    console.error("[verify-car-kv-targets]", message);
  }
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`failed to read JSON: ${path.relative(ROOT, file)}`, error instanceof Error ? error.message : String(error));
  }
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

if (!fs.existsSync(TARGETS_FILE)) {
  fail(`targets file not found: ${path.relative(ROOT, TARGETS_FILE)}`);
}

if (!fs.existsSync(PUBLIC_ASSETS_FILE)) {
  fail(`public assets manifest not found: ${path.relative(ROOT, PUBLIC_ASSETS_FILE)}`);
}

const payload = readJson(TARGETS_FILE);
const manifest = readJson(PUBLIC_ASSETS_FILE);

const targets = Array.isArray(payload?.targets) ? payload.targets : [];
const publicPaths = new Set(Array.isArray(manifest?.paths) ? manifest.paths.map(String) : []);

if (targets.length === 0) {
  fail("no targets found");
}

const failures = [];

for (const target of targets) {
  const imageNumber = Number(target?.imageNumber);
  const slug = String(target?.slug ?? "").trim();
  const maker = String(target?.maker ?? "").trim();
  const cardName = String(target?.cardName ?? "").trim();
  const publicPath = String(target?.publicPath ?? "").trim();
  const jsonPath = String(target?.jsonPath ?? "").trim();
  const expectedHash = String(target?.sha256 ?? "").trim();
  const sourcePdfFile = String(target?.sourcePdfFile ?? "").trim();
  const sourcePdfEmbeddedImage = String(target?.sourcePdfEmbeddedImage ?? "").trim();

  if (!slug || !maker || !cardName || !publicPath || !jsonPath) {
    failures.push({ imageNumber, slug, reason: "missing required target field" });
    continue;
  }

  const absJson = path.join(ROOT, jsonPath);
  const absImage = path.join(ROOT, "public", publicPath.replace(/^\/+/, ""));

  if (!fs.existsSync(absJson)) {
    failures.push({ imageNumber, slug, reason: "json file missing", jsonPath });
    continue;
  }

  if (!fs.existsSync(absImage)) {
    failures.push({ imageNumber, slug, reason: "image file missing", publicPath });
    continue;
  }

  if (!publicPaths.has(publicPath)) {
    failures.push({ imageNumber, slug, reason: "public-assets manifest missing path", publicPath });
  }

  const car = readJson(absJson);

  if (String(car?.id ?? "").trim() !== slug) {
    failures.push({ imageNumber, slug, reason: "id mismatch", actual: car?.id ?? null });
  }

  if (String(car?.slug ?? "").trim() !== slug) {
    failures.push({ imageNumber, slug, reason: "slug mismatch", actual: car?.slug ?? null });
  }

  if (String(car?.maker ?? "").trim() !== maker) {
    failures.push({ imageNumber, slug, reason: "maker mismatch", actual: car?.maker ?? null, expected: maker });
  }

  if (String(car?.name ?? "").trim() !== cardName) {
    failures.push({ imageNumber, slug, reason: "cardName mismatch", actual: car?.name ?? null, expected: cardName });
  }

  for (const key of ["heroImage", "mainImage", "imageUrl"]) {
    if (String(car?.[key] ?? "").trim() !== publicPath) {
      failures.push({ imageNumber, slug, reason: `${key} mismatch`, actual: car?.[key] ?? null, expected: publicPath });
    }
  }

  const gallery = Array.isArray(car?.gallery) ? car.gallery.map((item) => String(item)) : [];
  if (gallery.length !== 1 || gallery[0] !== publicPath) {
    failures.push({ imageNumber, slug, reason: "gallery mismatch", actual: gallery, expected: [publicPath] });
  }

  if (String(car?.publicState ?? "").trim() !== "index") {
    failures.push({ imageNumber, slug, reason: "publicState mismatch", actual: car?.publicState ?? null, expected: "index" });
  }

  if (!sourcePdfFile || !sourcePdfEmbeddedImage) {
    failures.push({ imageNumber, slug, reason: "missing PDF source reference", sourcePdfFile, sourcePdfEmbeddedImage });
  }

  if (!expectedHash) {
    failures.push({ imageNumber, slug, reason: "missing sha256" });
  } else {
    const actualHash = sha256(absImage);
    if (actualHash !== expectedHash) {
      failures.push({ imageNumber, slug, reason: "sha256 mismatch", actual: actualHash, expected: expectedHash });
    }
  }
}

if (failures.length > 0) {
  fail(`failed (${failures.length})`, failures);
}

console.log(`[verify-car-kv-targets] ✅ OK (${targets.length} cars, hash-locked to accepted PDF exports)`);
