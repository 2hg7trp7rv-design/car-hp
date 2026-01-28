// scripts/cleanup-build.mjs
// Remove build cache directories that can accidentally get bundled into Vercel Functions.
//
// Why this exists:
// - Vercel's function bundling can (sometimes) pick up `.next/cache/webpack`, which easily exceeds
//   the 250MB unzipped limit and fails deployment.
// - `.next/cache` is not required at runtime.

import fs from "node:fs";
import path from "node:path";

function rm(relPath) {
  const abs = path.join(process.cwd(), relPath);
  try {
    if (fs.existsSync(abs)) fs.rmSync(abs, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

// Next.js build cache (safe to delete)
rm(".next/cache");

// Safety: some environments create nested cache locations
rm(".next/cache/webpack");
