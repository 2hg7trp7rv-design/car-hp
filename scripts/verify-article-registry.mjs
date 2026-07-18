import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const GROUPS = [
  { type: "GUIDE", dir: "data/articles/guides" },
  { type: "COLUMN", dir: "data/articles/columns" },
];

const errors = [];
const records = [];
const expectedByDisposition = {
  public: new Set(),
  preview: new Set(),
};

const approvalFile = "data/_internal/publication-approvals.json";
try {
  const approvalManifest = JSON.parse(await fs.readFile(path.join(ROOT, approvalFile), "utf8"));
  if (approvalManifest?.version !== 1 || !Array.isArray(approvalManifest?.approvals)) {
    errors.push(`${approvalFile}: version 1 and an approvals array are required`);
  } else {
    const seen = new Set();
    for (const [index, approval] of approvalManifest.approvals.entries()) {
      const type = typeof approval?.type === "string" ? approval.type.trim() : "";
      const slug = typeof approval?.slug === "string" ? approval.slug.trim() : "";
      const disposition = approval?.disposition;
      const key = `${type}:${slug}`;
      if (!GROUPS.some((group) => group.type === type)) {
        errors.push(`${approvalFile}: approvals[${index}].type must be GUIDE or COLUMN`);
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
        errors.push(`${approvalFile}: approvals[${index}].slug is not route-safe`);
      }
      if (disposition !== "public" && disposition !== "preview") {
        errors.push(`${approvalFile}: approvals[${index}].disposition must be public or preview`);
      }
      if (seen.has(key)) errors.push(`${approvalFile}: duplicate approval ${key}`);
      seen.add(key);
      if (
        (disposition === "public" || disposition === "preview") &&
        GROUPS.some((group) => group.type === type) &&
        slug
      ) {
        expectedByDisposition[disposition].add(key);
      }
    }
  }
} catch (error) {
  errors.push(`${approvalFile}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
}

async function loadTypeScriptModule(relativeFile, imports = {}) {
  const absoluteFile = path.join(ROOT, relativeFile);
  const source = await fs.readFile(absoluteFile, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: absoluteFile,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    reportDiagnostics: true,
  });
  const diagnostics = (compiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (diagnostics.length > 0) {
    const detail = diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, " "))
      .join("; ");
    throw new Error(`${relativeFile} cannot be transpiled: ${detail}`);
  }

  const loadedModule = { exports: {} };
  const localRequire = (specifier) => {
    if (Object.prototype.hasOwnProperty.call(imports, specifier)) return imports[specifier];
    throw new Error(`${relativeFile} requested an unsupported fixture import: ${specifier}`);
  };
  const execute = new Function("require", "module", "exports", compiled.outputText);
  execute(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const publicationContract = await loadTypeScriptModule("lib/content/publication-contract.ts");
const articleRegistryModule = await loadTypeScriptModule("lib/content/article-registry.ts", {
  "@/lib/content/publication-contract": publicationContract,
  "@/lib/repository/data-dir": {
    readColumnsJsonDir: () => [],
    readGuidesJsonDir: () => [],
  },
  "@/lib/repository/columns-repository": { findAllColumns: () => [] },
  "@/lib/repository/guides-repository": { findAllGuides: () => [] },
  "@/lib/seo/redirects": { isRedirectSourcePath: () => false },
});

const {
  evaluatePublicationContract,
  findDuplicatePublicationSlugs,
} = publicationContract;
const {
  assertArticleRegistryValid,
  createArticleRegistry,
} = articleRegistryModule;

const redirectsFile = path.join(ROOT, "data", "redirects.json");
let redirectRules = [];
try {
  const parsed = JSON.parse(await fs.readFile(redirectsFile, "utf8"));
  if (!Array.isArray(parsed)) errors.push("data/redirects.json: redirect ledger must be an array");
  else redirectRules = parsed;
} catch (error) {
  errors.push(`data/redirects.json: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
}
const redirectSources = new Set(
  redirectRules
    .map((rule) => typeof rule?.source === "string" ? rule.source.trim() : "")
    .filter(Boolean),
);

function compareSets(actual, expected, label) {
  const missing = [...expected].filter((slug) => !actual.has(slug));
  const unexpected = [...actual].filter((slug) => !expected.has(slug));
  if (missing.length) errors.push(`${label}: missing ${missing.join(", ")}`);
  if (unexpected.length) errors.push(`${label}: unexpected ${unexpected.join(", ")}`);
}

for (const group of GROUPS) {
  const absoluteDir = path.join(ROOT, group.dir);
  const names = (await fs.readdir(absoluteDir)).filter((name) => name.endsWith(".json")).sort();
  for (const name of names) {
    const relativeFile = path.posix.join(group.dir, name);
    let item;
    try {
      item = JSON.parse(await fs.readFile(path.join(ROOT, relativeFile), "utf8"));
    } catch (error) {
      errors.push(`${relativeFile}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${relativeFile}: article file must contain one object`);
      continue;
    }
    records.push({ file: relativeFile, expectedType: group.type, item });
  }
}

for (const duplicate of findDuplicatePublicationSlugs(records.map((record) => record.item))) {
  const files = duplicate.indexes.map((index) => records[index]?.file ?? `record:${index}`);
  errors.push(`duplicate slug ${duplicate.slug}: ${files.join(", ")}`);
}

const publicArticleKeys = new Set();
const previewArticleKeys = new Set();

for (const record of records) {
  const result = evaluatePublicationContract(record.item);
  if (result.articleType && result.articleType !== record.expectedType) {
    errors.push(`${record.file}: type ${result.articleType} does not match ${record.expectedType} directory`);
  }
  for (const issue of result.issues) {
    errors.push(`${record.file}: ${issue.code}: ${issue.message}`);
  }
  const routePrefix = record.expectedType === "GUIDE" ? "/guide" : "/column";
  const routePath = result.slug ? `${routePrefix}/${result.slug}` : "";
  if (result.disposition === "redirect" && !redirectSources.has(routePath)) {
    errors.push(`${record.file}: redirect article has no matching ledger source ${routePath}`);
  }
  if (
    (result.disposition === "public" || result.disposition === "preview") &&
    redirectSources.has(routePath)
  ) {
    errors.push(`${record.file}: renderable article collides with redirect source ${routePath}`);
  }
  const articleKey = `${record.expectedType}:${result.slug}`;
  if (result.disposition === "public") publicArticleKeys.add(articleKey);
  if (result.disposition === "preview") previewArticleKeys.add(articleKey);
}

compareSets(publicArticleKeys, expectedByDisposition.public, "public approval ledger");
compareSets(previewArticleKeys, expectedByDisposition.preview, "preview approval ledger");

// Focused regression checks for the two most dangerous historical failures.
const missingState = evaluatePublicationContract({
  type: "GUIDE",
  slug: "missing-state-fixture",
  title: "fixture",
  body: "body",
});
if (missingState.disposition !== "rejected") {
  errors.push("contract regression: missing publication fields were not rejected");
}

const duplicateFixture = findDuplicatePublicationSlugs([
  { type: "GUIDE", slug: "duplicate-fixture" },
  { type: "COLUMN", slug: "duplicate-fixture" },
]);
if (duplicateFixture.length !== 1) {
  errors.push("contract regression: duplicate slug was not detected");
}

const FIXTURE_BODY =
  "This fixture contains enough readable publication content to prove that a real normalized article remains public after strict validation.";

function publicInput(overrides = {}) {
  return {
    type: "GUIDE",
    slug: "public-fixture",
    title: "Public fixture",
    status: "published",
    publicState: "index",
    noindex: false,
    body: FIXTURE_BODY,
    ...overrides,
  };
}

function normalizedArticle(overrides = {}) {
  const type = overrides.type ?? "GUIDE";
  return {
    id: "fixture-id",
    slug: "public-fixture",
    type,
    status: "published",
    publicState: "index",
    noindex: false,
    parentPillarId: type === "GUIDE" ? "/guide" : "/column",
    relatedClusterIds: [],
    primaryQuery: "fixture",
    updateReason: "fixture",
    sources: [],
    title: "Public fixture",
    body: FIXTURE_BODY,
    ...(type === "COLUMN" ? { category: "TECHNICAL" } : {}),
    ...overrides,
  };
}

function expectFixture(condition, message) {
  if (!condition) errors.push(`registry fixture: ${message}`);
}

for (const [label, candidate, issueCode] of [
  ["TODO body", publicInput({ body: "TODO" }), "invalid-body"],
  [
    "non-string body with valid detail sections",
    publicInput({
      body: {},
      detailSections: [{
        title: "Valid section",
        blocks: [{ type: "paragraph", text: FIXTURE_BODY }],
      }],
    }),
    "invalid-body",
  ],
  ["placeholder title", publicInput({ title: "TBD" }), "invalid-title"],
  ["route-unsafe slug", publicInput({ slug: "Unsafe/Slug" }), "invalid-slug"],
  [
    "empty object block",
    publicInput({ body: undefined, detailSections: [{ title: "Section", blocks: [{}] }] }),
    "unknown-content-block",
  ],
  [
    "divider-only block",
    publicInput({ body: undefined, detailSections: [{ title: "Section", blocks: [{ type: "divider" }] }] }),
    "missing-substantive-content",
  ],
  [
    "unknown block",
    publicInput({ body: undefined, detailSections: [{ title: "Section", blocks: [{ type: "unknown" }] }] }),
    "unknown-content-block",
  ],
]) {
  const result = evaluatePublicationContract(candidate);
  expectFixture(result.disposition === "rejected", `${label} was not rejected`);
  expectFixture(result.issues.some((issue) => issue.code === issueCode), `${label} did not report ${issueCode}`);
}

const validSource = {
  sourceId: "fixture:public",
  expectedType: "GUIDE",
  contractInput: publicInput(),
  article: normalizedArticle(),
};
const validRegistry = createArticleRegistry([validSource], {
  isRedirectSource: () => false,
});
expectFixture(!validRegistry.hasErrors, "valid public source produced Registry errors");
expectFixture(validRegistry.publicArticles.length === 1, "valid public source was not registered");
expectFixture(validRegistry.getRouteEntry("GUIDE", "public-fixture")?.visibility === "public", "valid public route is missing");
try {
  expectFixture(assertArticleRegistryValid(validRegistry) === validRegistry, "valid Registry assertion changed the Registry");
} catch (error) {
  errors.push(`registry fixture: valid Registry assertion threw (${error instanceof Error ? error.message : String(error)})`);
}

const mismatchCases = [
  ["slug", normalizedArticle({ slug: "different-slug" }), "normalized-slug-mismatch"],
  [
    "status",
    normalizedArticle({ status: "draft", publicState: "draft", noindex: true }),
    "normalized-status-mismatch",
  ],
  ["publicState", normalizedArticle({ publicState: "noindex", noindex: true }), "normalized-public-state-mismatch"],
  ["noindex", normalizedArticle({ noindex: true }), "normalized-noindex-mismatch"],
  ["substantive content", normalizedArticle({ body: "", detailSections: null }), "normalized-publication-invalid"],
];
for (const [label, article, expectedIssue] of mismatchCases) {
  const registry = createArticleRegistry([{ ...validSource, sourceId: `fixture:mismatch:${label}`, article }], {
    isRedirectSource: () => false,
  });
  expectFixture(registry.hasErrors, `normalized ${label} mismatch did not fail the Registry`);
  expectFixture(
    registry.issues.some((issue) => issue.code === expectedIssue),
    `normalized ${label} mismatch did not report ${expectedIssue}`,
  );
  expectFixture(registry.getRouteEntry("GUIDE", "public-fixture") === null, `normalized ${label} mismatch retained a public route`);
}

const redirectInput = {
  type: "GUIDE",
  slug: "redirect-fixture",
  title: "Redirect fixture",
  status: "archived",
  publicState: "redirect",
  noindex: true,
};
const redirectArticle = normalizedArticle({
  slug: "redirect-fixture",
  title: "Redirect fixture",
  status: "archived",
  publicState: "redirect",
  noindex: true,
  body: "",
});
const missingRedirectRegistry = createArticleRegistry([{
  sourceId: "fixture:redirect:missing",
  expectedType: "GUIDE",
  contractInput: redirectInput,
  article: redirectArticle,
}], { isRedirectSource: () => false });
expectFixture(
  missingRedirectRegistry.issues.some((issue) => issue.code === "missing-redirect-ledger"),
  "redirect without ledger source was accepted",
);
let invalidRegistryThrew = false;
try {
  assertArticleRegistryValid(missingRedirectRegistry, "fixture-invalid-registry");
} catch {
  invalidRegistryThrew = true;
}
expectFixture(invalidRegistryThrew, "assertArticleRegistryValid did not throw for an invalid Registry");

const validRedirectRegistry = createArticleRegistry([{
  sourceId: "fixture:redirect:valid",
  expectedType: "GUIDE",
  contractInput: redirectInput,
  article: redirectArticle,
}], { isRedirectSource: (routePath) => routePath === "/guide/redirect-fixture" });
expectFixture(!validRedirectRegistry.hasErrors, "redirect with matching ledger source produced errors");
expectFixture(validRedirectRegistry.redirectArticles.length === 1, "valid redirect article was not registered");

if (errors.length > 0) {
  console.error(`[verify-article-registry] ❌ ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `[verify-article-registry] ✅ OK articles=${records.length}, public=${publicArticleKeys.size}, preview=${previewArticleKeys.size}`,
);
