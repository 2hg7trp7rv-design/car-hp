import assert from "node:assert/strict";
import fs from "node:fs";
import { parse, type DefaultTreeAdapterMap } from "parse5";
import {
  getLearningCourses,
  learningHref,
  learningLessonText,
  DIAGRAM_TEXT,
} from "../lib/learning";
import { publicationPolicy } from "../lib/content/publication";
import { getSiteUrl } from "../lib/site";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const compact = (text: string) => text.replace(/\s+/gu, "");
function elements(node: Node): Element[] {
  return [
    ...("tagName" in node ? [node] : []),
    ...("childNodes" in node ? node.childNodes.flatMap(elements) : []),
  ];
}
function text(node: Node): string {
  if ("tagName" in node && ["script", "style"].includes(node.tagName))
    return "";
  if ("value" in node) return node.value;
  return "childNodes" in node ? node.childNodes.map(text).join("") : "";
}
const attr = (node: Element, name: string) =>
  node.attrs.find((item) => item.name === name)?.value;
// These are the abandoned public-facing level labels, not technical values/units.
const numericLevelLabel = /(?<![0-9])(?:0\s*[〜～~→⇒–−-]\s*1|1\s*[〜～~→⇒–−-]\s*70|70\s*[〜～~→⇒–−-]\s*90)(?![0-9])/u;
function readPage(route: string, indexable = true) {
  const document = parse(fs.readFileSync(`.next/server/app${route === "/" ? "/index" : route}.html`, "utf8"));
  const nodes = elements(document);
  assert.ok(!numericLevelLabel.test(text(document).normalize("NFKC")), `${route}: numeric learning-level label visible`);
  assert.ok(nodes.some((node) => node.tagName === "link" && attr(node, "rel") === "canonical" && [`${getSiteUrl()}${route}`, ...(route === "/" ? [getSiteUrl()] : [])].includes(attr(node, "href") ?? "")), `${route}: canonical`);
  const robots = nodes.find((node) => node.tagName === "meta" && attr(node, "name") === "robots");
  assert.equal((robots ? attr(robots, "content") ?? "" : "").includes("noindex"), !indexable, `${route}: robots/publication mismatch`);
  for (const node of nodes.filter((item) => item.tagName === "script" && attr(item, "type") === "application/ld+json")) JSON.parse(node.childNodes.map(text).join(""));
  return nodes;
}
function hasLink(nodes: Element[], href: string) {
  return nodes.some((node) => node.tagName === "a" && attr(node, "href")?.split("#")[0] === href);
}
for (const route of ["/", "/choose", "/choose/drive-recorder", "/choose/car-wash", "/choose/air-filter", "/glossary"]) readPage(route);
let lessonCount = 0;
let dialogueCount = 0;
for (const course of getLearningCourses()) {
  const courseRoute = learningHref(course.slug);
  const indexNodes = readPage(courseRoute, publicationPolicy(course).indexable);
  if (course.relatedGuideSlug) assert.ok(hasLink(indexNodes, `/guide/${course.relatedGuideSlug}`), `${courseRoute}: related guide missing`);
  for (const lesson of course.lessons)
    assert.ok(
      indexNodes.some(
        (node) =>
          node.tagName === "a" &&
          attr(node, "href") === learningHref(course.slug, lesson.slug),
      ),
      `${courseRoute}: missing lesson`,
    );
  for (const [index, lesson] of course.lessons.entries()) {
    const route = learningHref(course.slug, lesson.slug);
    const nodes = readPage(route, publicationPolicy(course).indexable);
    const main = nodes.find(
      (node) => attr(node, "data-learning-lesson") === lesson.slug,
    );
    assert.ok(main, `${route}: missing lesson content`);
    const mainNodes = elements(main);
    const rendered = compact(text(main));
    assert.ok(
      rendered.includes(compact(lesson.goal)),
      `${route}: missing goal`,
    );
    const dialogues = mainNodes.filter((node) =>
      attr(node, "data-dialogue-speaker"),
    );
    const authoredDialogues = lesson.blocks.filter(
      (block) => block.type === "dialogue",
    );
    assert.equal(
      dialogues.length,
      authoredDialogues.length,
      `${route}: dialogue count`,
    );
    authoredDialogues.forEach((block, blockIndex) => {
      assert.equal(
        attr(dialogues[blockIndex], "data-dialogue-speaker"),
        block.speaker,
      );
      assert.ok(
        compact(text(dialogues[blockIndex])).includes(compact(block.text)),
        `${route}: truncated dialogue`,
      );
      dialogueCount++;
    });
    for (const block of lesson.blocks) {
      const phrases =
        block.type === "comparison"
          ? [block.title, ...block.headers, ...block.rows.flat(), block.note]
          : block.type === "flow"
            ? [
                block.title,
                ...block.steps.flatMap((step) => [step.title, step.body]),
                block.note,
              ]
            : block.type === "measurements"
              ? [
                  block.title,
                  block.unit,
                  block.xLabel ?? "",
                  block.yLabel ?? "",
                  ...block.rounds,
                  ...block.series.flatMap((series) => [
                    series.name,
                    ...series.values.map(String),
                  ]),
                  block.note,
                ]
              : block.type === "diagram"
                ? [block.title ?? DIAGRAM_TEXT[block.kind], block.note ?? ""]
                : [];
      for (const phrase of phrases)
        assert.ok(
          rendered.includes(compact(phrase)),
          `${route}: figure text missing`,
        );
    }
    for (const phrase of [
      ...lesson.takeaways,
      lesson.checkpoint.question,
      lesson.checkpoint.answer,
    ])
      assert.ok(
        rendered.includes(compact(phrase)),
        `${route}: missing learning or answer text`,
      );
    const answer = mainNodes.find(
      (node) =>
        node.tagName === "details" &&
        compact(text(node)).includes(compact(lesson.checkpoint.answer)),
    );
    assert.ok(
      answer && attr(answer, "open") === undefined,
      `${route}: answer must begin collapsed`,
    );
    assert.ok(
      nodes.some(
        (node) =>
          node.tagName === "link" &&
          attr(node, "rel") === "canonical" &&
          attr(node, "href") === `${getSiteUrl()}${route}`,
      ),
      `${route}: canonical`,
    );
    for (const [direction, target] of [
      ["prev", course.lessons[index - 1]],
      ["next", course.lessons[index + 1]],
    ] as const) {
      const links = mainNodes.filter(
        (node) => node.tagName === "a" && attr(node, "rel") === direction,
      );
      assert.equal(
        links.length,
        target ? 1 : 0,
        `${route}: ${direction} count`,
      );
      if (target)
        assert.equal(
          attr(links[0], "href"),
          learningHref(course.slug, target.slug),
        );
    }
    if (!course.lessons[index + 1]) assert.ok(hasLink(mainNodes, course.selectionHref ?? "/learn"), `${route}: selection link missing`);
    if (lesson.blocks.some((block) => block.type === "diagram")) {
      assert.ok(mainNodes.some((node) => node.tagName === "svg" && (attr(node, "aria-label") || attr(node, "aria-labelledby"))), `${route}: diagram needs an accessible description`);
    }
    for (const slug of [...lesson.prerequisites, lesson.checkpoint.review]) {
      assert.ok(hasLink(mainNodes, learningHref(course.slug, slug)), `${route}: prerequisite/review link missing: ${slug}`);
    }
    for (const block of lesson.blocks.filter((item) => item.type === "measurements")) {
      assert.ok(mainNodes.some((node) => node.tagName === "table" && block.series.every((series) => compact(text(node)).includes(compact(series.name)))), `${route}: graph requires a numeric table`);
    }
    for (const source of course.sources.filter((item) =>
      lesson.sources.includes(item.id),
    ))
      assert.ok(
        mainNodes.some(
          (node) => node.tagName === "a" && attr(node, "href") === source.url,
        ),
        `${route}: source missing`,
      );
    for (const node of nodes.filter(
      (item) =>
        item.tagName === "script" &&
        attr(item, "type") === "application/ld+json",
    ))
      JSON.parse(node.childNodes.map(text).join(""));
    for (const source of course.sources.filter((item) => lesson.sources.includes(item.id))) {
      assert.ok(rendered.includes(compact(source.title)) && rendered.includes(compact(source.note)), `${route}: source title/note missing`);
    }
    const structured = nodes.filter((node) => node.tagName === "script" && attr(node, "type") === "application/ld+json").map((node) => JSON.parse(node.childNodes.map(text).join("")) as Record<string, unknown>);
    const resource = structured.find((item) => item["@type"] === "LearningResource");
    assert.ok(resource, `${route}: LearningResource missing`);
    assert.equal(resource.name, lesson.title);
    assert.equal(resource.url, `${getSiteUrl()}${route}`);
    assert.equal(resource.dateModified, course.updatedAt);
    assert.ok(learningLessonText(lesson).length > 0);
    lessonCount++;
  }
}
const xml = fs.readFileSync("public/sitemaps/sitemap-learning.xml", "utf8");
for (const course of getLearningCourses()) {
  const paths = [
    learningHref(course.slug),
    ...course.lessons.map((lesson) => learningHref(course.slug, lesson.slug)),
  ];
  for (const pathname of paths)
    assert.equal(
      xml.includes(`<loc>${getSiteUrl()}${pathname}</loc>`),
      publicationPolicy(course).indexable,
      `${pathname}: sitemap publication`,
    );
}
console.log(
  `[verify-learning] ${lessonCount} complete lessons, ${dialogueCount} dialogue turns; figures, exercises, sources, canonicals, sequence and sitemap verified`,
);
