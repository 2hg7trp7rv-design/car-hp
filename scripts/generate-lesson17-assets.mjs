import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const ASSETS_DIR = join(ROOT, "public", "assets");

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

const writtenAssets = await decodeWebpPayloads();
console.log(`[lesson17-assets] generated ${writtenAssets} WebP assets`);
