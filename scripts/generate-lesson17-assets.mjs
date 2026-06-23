import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const ASSETS_DIR = join(ROOT, "public", "assets");
const PAYLOADS_DIR = join(ROOT, "scripts", "payloads");
const VISUAL_JSON_PATH = join(
  ROOT,
  "data",
  "article-layouts",
  "modern-car-custom-regret-reason-column.visual.json",
);

async function decodeWebpPayloads() {
  await mkdir(ASSETS_DIR, { recursive: true });
  const entries = await readdir(ASSETS_DIR, { withFileTypes: true });
  let written = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".webp.b64")) continue;

    const source = join(ASSETS_DIR, entry.name);
    const destination = source.slice(0, -4);
    const encoded = (await readFile(source, "utf8")).trim();
    if (!encoded) {
      throw new Error(`[lesson17-assets] empty payload: ${entry.name}`);
    }

    const bytes = Buffer.from(encoded, "base64");
    if (
      bytes.length < 16 ||
      bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
      bytes.subarray(8, 12).toString("ascii") !== "WEBP"
    ) {
      throw new Error(`[lesson17-assets] invalid WebP payload: ${entry.name}`);
    }

    await writeFile(destination, bytes);
    written += 1;
  }

  return written;
}

async function generateVisualJson() {
  const partNames = [
    "lesson17-visual-json.raw-part-01.txt",
    "lesson17-visual-json.raw-part-02.txt",
    "lesson17-visual-json.raw-part-03.txt",
    "lesson17-visual-json.raw-part-04.txt",
    "lesson17-visual-json.raw-part-05.txt",
  ];

  const parts = await Promise.all(
    partNames.map((name) => readFile(join(PAYLOADS_DIR, name), "utf8")),
  );
  const source = parts.join("");
  const parsed = JSON.parse(source);

  if (
    parsed?.slug !== "modern-car-custom-regret-reason-column" ||
    !Array.isArray(parsed?.sections) ||
    parsed.sections.length !== 6 ||
    !Array.isArray(parsed?.closingBlocks)
  ) {
    throw new Error("[lesson17-assets] invalid visual article JSON structure");
  }

  await mkdir(dirname(VISUAL_JSON_PATH), { recursive: true });
  await writeFile(VISUAL_JSON_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed.sections.length;
}

const writtenAssets = await decodeWebpPayloads();
const writtenSections = await generateVisualJson();
console.log(
  `[lesson17-assets] generated ${writtenAssets} WebP assets and ${writtenSections} visual sections`,
);
