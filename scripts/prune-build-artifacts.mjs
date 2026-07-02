import fs from "node:fs";
import path from "node:path";

function safeRemove(relPath) {
  const abs = path.join(process.cwd(), relPath);
  try {
    if (!fs.existsSync(abs)) return;
    fs.rmSync(abs, { recursive: true, force: true });
    console.log(`[prune-build-artifacts] removed ${relPath}`);
  } catch (error) {
    console.warn(`[prune-build-artifacts] failed to remove ${relPath}`, error);
  }
}

// Build cache is useful during compilation, but it must not leak into traced
// serverless bundles. Keep the runtime output lean for Vercel deployment.
safeRemove(".next/cache");
