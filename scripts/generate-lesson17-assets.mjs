import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";

const ROOT = process.cwd();
const ASSETS_DIR = join(ROOT, "public", "assets");
const COMPONENT_PAYLOAD = join(
  ROOT,
  "scripts",
  "payloads",
  "ColumnLesson17Page.tsx.gz.b64",
);
const COMPONENT_OUTPUT = join(
  ROOT,
  "components",
  "column",
  "lesson17",
  "ColumnLesson17Page.tsx",
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

async function decodeComponentPayload() {
  const encoded = (await readFile(COMPONENT_PAYLOAD, "utf8")).trim();
  if (!encoded) {
    throw new Error("[lesson17-assets] empty component payload");
  }

  const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
  if (!source.includes("export default function ColumnLesson17Page")) {
    throw new Error("[lesson17-assets] invalid component payload");
  }

  await mkdir(dirname(COMPONENT_OUTPUT), { recursive: true });
  await writeFile(COMPONENT_OUTPUT, source, "utf8");
}

const writtenAssets = await decodeWebpPayloads();
await decodeComponentPayload();

console.log(
  `[lesson17-assets] generated ${writtenAssets} WebP assets and ColumnLesson17Page.tsx`,
);
