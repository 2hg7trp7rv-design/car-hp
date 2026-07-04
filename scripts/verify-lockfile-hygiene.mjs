import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const errors = [];
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = (file) => fs.existsSync(path.join(root, file));
const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const lockRaw = fs.readFileSync(path.join(root, "package-lock.json"), "utf8");
for (const snippet of ["applied-caas", "internal.api.openai", "packages.applied-caas", "localhost:"]) {
  if (lockRaw.includes(snippet)) errors.push(`package-lock.json contains forbidden internal registry reference: ${snippet}`);
}
for (const file of ["pnpm-lock.yaml", "yarn.lock", ".pnpmrc", ".yarnrc"]) {
  if (exists(file)) errors.push(`unexpected package-manager artifact found: ${file}`);
}
if (pkg.packageManager !== "npm@10.9.4") errors.push(`packageManager must be npm@10.9.4, got ${pkg.packageManager ?? "missing"}`);
if (pkg.engines?.node !== "22.x") errors.push(`engines.node must be 22.x, got ${pkg.engines?.node ?? "missing"}`);
if (pkg.engines?.npm !== "10.x") errors.push(`engines.npm must be 10.x, got ${pkg.engines?.npm ?? "missing"}`);
if (pkg.dependencies?.["@studio-freight/lenis"]) errors.push("deprecated @studio-freight/lenis must not be in dependencies");
if (lock.packages?.["node_modules/@studio-freight/lenis"]) errors.push("deprecated @studio-freight/lenis must not be in package-lock packages");
if (exists("lenis.d.ts")) errors.push("unused lenis.d.ts should not remain without a lenis runtime import");
const rootPackage = lock.packages?.[""];
if (!rootPackage) errors.push("package-lock.json missing root package entry");
for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  const packageDeps = pkg[section] ?? {};
  const lockDeps = rootPackage?.[section] ?? {};
  for (const [name, version] of Object.entries(packageDeps)) {
    if (lockDeps[name] !== version) errors.push(`lock root ${section}.${name} mismatch: package=${version}, lock=${lockDeps[name] ?? "missing"}`);
  }
  for (const name of Object.keys(lockDeps)) {
    if (!(name in packageDeps)) errors.push(`lock root has stale ${section}.${name}`);
  }
}
const postcssPkg = pkg.devDependencies?.postcss;
const postcssLockRoot = rootPackage?.devDependencies?.postcss;
const postcssNode = lock.packages?.["node_modules/postcss"]?.version;
if (postcssPkg !== postcssLockRoot || postcssPkg !== postcssNode) errors.push(`postcss mismatch: package=${postcssPkg}, lockRoot=${postcssLockRoot}, lockNode=${postcssNode}`);
if (pkg.resolutions?.postcss && pkg.resolutions.postcss !== postcssPkg) errors.push(`postcss resolutions mismatch: resolutions=${pkg.resolutions.postcss}, package=${postcssPkg}`);
if (errors.length) { console.error("[verify-lockfile-hygiene] FAILED"); for (const e of errors) console.error(`- ${e}`); process.exit(1); }
console.log("[verify-lockfile-hygiene] OK");
