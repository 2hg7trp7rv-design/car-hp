import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.toLowerCase().endsWith(".png") ? [absolute] : [];
  });
}

function verifyPng(file) {
  const data = fs.readFileSync(file);
  if (data.length < 20 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("invalid PNG signature");
  }

  let offset = 8;
  let sawIhdr = false;
  let sawIend = false;
  const idat = [];
  while (offset < data.length) {
    if (offset + 12 > data.length) throw new Error("truncated chunk header");
    const length = data.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > data.length) throw new Error("truncated chunk data");
    const type = data.toString("ascii", offset + 4, offset + 8);
    const payload = data.subarray(offset + 8, offset + 8 + length);
    const expected = data.readUInt32BE(offset + 8 + length);
    const actual = crc32(data.subarray(offset + 4, offset + 8 + length));
    if (actual !== expected) throw new Error(`${type} CRC mismatch`);
    if (type === "IHDR") sawIhdr = true;
    if (type === "IDAT") idat.push(payload);
    if (type === "IEND") {
      sawIend = true;
      if (end !== data.length) throw new Error("bytes found after IEND");
    }
    offset = end;
  }

  if (!sawIhdr) throw new Error("missing IHDR");
  if (idat.length === 0) throw new Error("missing IDAT");
  if (!sawIend) throw new Error("missing IEND");
  zlib.inflateSync(Buffer.concat(idat));
}

const failures = [];
const files = walk(PUBLIC_DIR);
for (const file of files) {
  try {
    verifyPng(file);
  } catch (error) {
    failures.push(`${path.relative(ROOT, file)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error("[verify-png-integrity] ❌ corrupt PNG files:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`[verify-png-integrity] ✅ OK (${files.length} PNG files decoded with valid CRC/IEND)`);
