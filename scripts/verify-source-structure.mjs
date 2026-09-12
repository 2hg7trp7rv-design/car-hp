import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const files = ["app", "components", "lib"].flatMap((dir) =>
  fs.readdirSync(dir, { recursive: true }).map(String)
    .filter((file) => /\.(ts|tsx)$/.test(file) && !file.endsWith(".d.ts"))
    .map((file) => path.join(dir, file)),
);
const sources = new Set(files.map((file) => path.resolve(file)));
const reached = new Set();

function visit(file) {
  if (reached.has(file) || !sources.has(file)) return;
  reached.add(file);
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const imports = [];
  function walk(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteral(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
  for (const name of imports) {
    const resolved = ts.resolveModuleName(name, file, options, ts.sys).resolvedModule?.resolvedFileName;
    if (resolved) visit(resolved);
  }
}

// App Router conventions are entry points even when no source file imports them.
const entry = /\/(page|layout|template|loading|error|global-error|not-found|default|route|sitemap|robots|manifest|icon|apple-icon|opengraph-image|twitter-image)\.(ts|tsx)$/;
files.filter((file) => file.startsWith(`app${path.sep}`) && entry.test(file)).forEach((file) => visit(path.resolve(file)));
const unused = files.filter((file) => !reached.has(path.resolve(file)));
if (unused.length) throw new Error(`Source files have no production entry point. Remove obsolete code or connect the intended feature:\n${unused.join("\n")}`);
console.log(`[source-structure] ${reached.size} source files reachable from App Router entry points`);
