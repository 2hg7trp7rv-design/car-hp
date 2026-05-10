import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "app", "exhibition", "page.tsx");
const src = fs.readFileSync(file, "utf8");
const match = src.match(/const rooms:\s*Room\[]\s*=\s*\[(.*?)\];/s);
if (!match) {
  console.error("[verify-selection-screen] rooms definition not found");
  process.exit(1);
}
const section = match[1];
const hrefs = [...section.matchAll(/href:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const expected = ["/", "/cars", "/column", "/guide", "/heritage"];
const disallowed = ["/exhibition", "/canvas", "/compare"];
const missing = expected.filter((h) => !hrefs.includes(h));
const extras = hrefs.filter((h) => !expected.includes(h));
const blocked = hrefs.filter((h) => disallowed.includes(h));
if (hrefs.length !== expected.length || missing.length || extras.length || blocked.length) {
  console.error("[verify-selection-screen] invalid selection screen", { hrefs, missing, extras, blocked });
  process.exit(1);
}
console.log(`[verify-selection-screen] ✅ OK (cards=${hrefs.length})`);
