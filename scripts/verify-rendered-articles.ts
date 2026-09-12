import { imageDimensions } from "../lib/content/image-dimensions";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parse, type DefaultTreeAdapterMap } from "parse5";
import { getAllGuides } from "../lib/guides";
import { getAllColumns } from "../lib/columns";
import { getInternalLinkIndex } from "../lib/content/internal-link-index";
import { extractInternalLinksFromText, inlineLabelResolver } from "../lib/content/text";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];

function elements(node: Node): Element[] {
  return [
    ...("tagName" in node ? [node] : []),
    ...("childNodes" in node ? node.childNodes.flatMap(elements) : []),
  ];
}

function textContent(node: Node): string {
  if ("tagName" in node && ["script", "style"].includes(node.tagName)) return "";
  if ("value" in node) return node.value;
  return "childNodes" in node ? node.childNodes.map(textContent).join("") : "";
}

function attr(node: Element, name: string) {
  return node.attrs.find((entry) => entry.name === name)?.value;
}

const compact = (text: string) => text.replace(/\s+/gu, "");
const linkIndex = await getInternalLinkIndex();
function authoredText(text: string) {
  const cleaned = extractInternalLinksFromText(text, { labelResolver: (href) => inlineLabelResolver(linkIndex, href) }).text;
  return compact(cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*|__|`/g, ""));
}

const groups = [
  { kind: "guide", items: await getAllGuides() },
  { kind: "column", items: await getAllColumns() },
];
let articleCount = 0;
let sectionCount = 0;
let paragraphCount = 0;
let tableCellCount = 0;
let faqCount = 0;
let sourceCount = 0;

for (const { kind, items } of groups) {
  for (const article of items.filter((item) => !["draft", "redirect"].includes(item.publicState))) {
    const route = `/${kind}/${article.slug}`;
    const document = parse(fs.readFileSync(`.next/server/app${route}.html`, "utf8"));
    const nodes = elements(document);
    const main = nodes.find((node) => attr(node, "data-cbj-article-page") !== undefined);
    assert.ok(main, `${route}: shared article renderer missing`);
    const renderedSections = elements(main).filter((node) => attr(node, "data-article-section") !== undefined);
    const sections = article.detailSections ?? [];
    if (sections.length) assert.equal(renderedSections.length, sections.length, `${route}: section loss`);

    for (const [index, section] of sections.entries()) {
      const rendered = compact(textContent(renderedSections[index]));
      for (const block of section.blocks) {
        if (block.type === "paragraph") {
          const expected = authoredText(block.text);
          assert.ok(rendered.includes(expected), `${route}, section ${index + 1}: truncated paragraph: ${expected.slice(-80)}`);
          paragraphCount++;
        }
        if (block.type === "comparisonTable") {
          for (const row of block.rows) {
            for (const cell of row) {
              // NG/OK cards use a visual icon with an accessible row label.
              if (block.display === "cards" && (cell === "NG" || cell === "OK")) continue;
              assert.ok(rendered.includes(authoredText(cell)), `${route}, section ${index + 1}: missing table cell ${cell}`);
              tableCellCount++;
            }
          }
        }
        if (block.type === "image") {
          const images = elements(renderedSections[index]).filter((node) => node.tagName === "img");
          const image = images.find((node) => {
            const url = new URL(attr(node, "src") ?? "", "https://local.test");
            return (url.searchParams.get("url") ?? url.pathname) === block.src;
          });
          assert.ok(image, `${route}: missing authored image ${block.src}`);
          const dimensions = imageDimensions(block.src);
          assert.equal(Number(attr(image, "width")), dimensions.width, `${route}: incorrect image width`);
          assert.equal(Number(attr(image, "height")), dimensions.height, `${route}: incorrect image height`);
        }
      }
    }
    const rendered = compact(textContent(main));
    for (const faq of article.faq ?? []) {
      assert.ok(rendered.includes(compact(faq.question)), `${route}: FAQ question missing`);
      assert.ok(rendered.includes(authoredText(faq.answer)), `${route}: FAQ answer missing`);
      faqCount++;
    }
    for (const source of article.sources.filter((url) => /^https?:\/\//.test(url))) {
      assert.ok(nodes.some((node) => node.tagName === "a" && attr(node, "href") === source), `${route}: source missing: ${source}`);
      sourceCount++;
    }
    if (article.actionBox) {
      assert.ok(rendered.includes(compact(article.actionBox.title)), `${route}: action box missing`);
      for (const action of article.actionBox.actions) {
        assert.ok(nodes.some((node) => node.tagName === "a" && attr(node, "href") === action.href), `${route}: action link missing`);
      }
    }
    const ids = new Set(nodes.flatMap((node) => attr(node, "id") ? [attr(node, "id")!] : []));
    for (const node of nodes) {
      const href = attr(node, "href");
      if (node.tagName === "a" && href?.startsWith("#")) {
        assert.ok(href.length > 1 && ids.has(decodeURIComponent(href.slice(1))), `${route}: broken fragment ${href}`);
      }
      if (node.tagName === "script" && attr(node, "type") === "application/ld+json") {
        JSON.parse(node.childNodes.map(textContent).join(""));
      }
    }
    const eagerImages = elements(main).filter((node) => node.tagName === "img" && attr(node, "loading") === "eager");
    assert.ok(eagerImages.length <= 1, `${route}: only the hero may load eagerly`);
    articleCount++;
    sectionCount += sections.length;
  }
}

// Check the actual footer/navigation destinations in every prerendered HTML page.
const prerender = JSON.parse(fs.readFileSync(".next/prerender-manifest.json", "utf8"));
const knownRoutes = new Set<string>(Object.keys(prerender.routes));
const appPaths = JSON.parse(fs.readFileSync(".next/server/app-paths-manifest.json", "utf8"));
for (const route of Object.keys(appPaths).filter((name) => name.endsWith("/page") && !name.includes("["))) {
  knownRoutes.add(route.replace(/\/\([^/]+\)/g, "").replace(/\/page$/, "") || "/");
}
const redirects = JSON.parse(fs.readFileSync(".next/routes-manifest.json", "utf8")).redirects as { source: string }[];
redirects.forEach((entry) => knownRoutes.add(entry.source));
let htmlCount = 0;
for (const file of fs.readdirSync(".next/server/app", { recursive: true }).map(String).filter((name) => name.endsWith(".html"))) {
  const nodes = elements(parse(fs.readFileSync(path.join(".next/server/app", file), "utf8")));
  for (const node of nodes.filter((entry) => entry.tagName === "a")) {
    const href = attr(node, "href") ?? "";
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const pathname = decodeURIComponent(new URL(href, "https://local.test").pathname).replace(/\/$/, "") || "/";
    assert.ok(knownRoutes.has(pathname) || fs.existsSync(path.join("public", pathname)), `${file}: unresolved internal link ${href}`);
  }
  htmlCount++;
}

console.log(`[verify-rendered] OK: ${articleCount} articles, ${sectionCount} sections, ${paragraphCount} complete paragraphs, ${tableCellCount} table cells, ${faqCount} FAQs, ${sourceCount} sources; links in ${htmlCount} HTML pages`);
