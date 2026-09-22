import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { getAllGuides } from "../lib/guides";
import { parse, type DefaultTreeAdapterMap } from "parse5";
import { getSiteUrl } from "../lib/site";
import { getLearningCourses, LEARNING_STAGES, LEARNING_TOPICS, learningHref } from "../lib/learning";

type HtmlNode = DefaultTreeAdapterMap["node"];
type HtmlElement = DefaultTreeAdapterMap["element"];
function elements(node: HtmlNode): HtmlElement[] {
  return [...("tagName" in node ? [node] : []), ...("childNodes" in node ? node.childNodes.flatMap(elements) : [])];
}
const attr = (node: HtmlElement, name: string) => node.attrs.find((item) => item.name === name)?.value;
const parseElements = (html: string) => elements(parse(html));

// Allocate a temporary local port; the server is always stopped in finally.
const listener = net.createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const port = (listener.address() as net.AddressInfo).port;
await new Promise<void>((resolve) => listener.close(() => resolve()));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: ["ignore", "pipe", "pipe"] });
let output = "";
server.stdout.on("data", (chunk) => { output = (output + chunk).slice(-8000); });
server.stderr.on("data", (chunk) => { output = (output + chunk).slice(-8000); });
const fetchPage = (pathname: string) => fetch(`${base}${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(10000) });

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try { if ((await fetchPage("/")).status === 200) { ready = true; break; } } catch { /* starting */ }
    await delay(250);
  }
  assert.ok(ready, `Server did not become ready: ${output}`);
  const guides = (await getAllGuides()).filter((guide) => !["draft", "redirect"].includes(guide.publicState));
  const courses = getLearningCourses();
  const learningPaths = courses.flatMap((course) => [learningHref(course.slug), ...course.lessons.map((lesson) => learningHref(course.slug, lesson.slug))]);
  for (const pathname of ["/learn", "/choose", "/choose/drive-recorder", "/choose/car-wash", "/choose/air-filter", "/glossary", ...learningPaths, "/", "/guide", "/column", "/cars", "/heritage", "/legal", "/legal/privacy", "/contact", ...guides.map((guide) => `/guide/${guide.slug}`)]) {
    const response = await fetchPage(pathname);
    assert.equal(response.status, 200, pathname);
    assert.ok((await response.text()).includes("Cookie設定"), `${pathname}: cookie settings not reachable`);
  }
  for (const prefix of ["guide", "column", "cars", "heritage", "cars/makers", "cars/segments", "cars/body-types", "learn", "choose", ...courses.map((course) => `learn/${course.slug}`)]) {
    assert.equal((await fetchPage(`/${prefix}/cbj-nonexistent-regression-test`)).status, 404, `${prefix}: unknown route should be 404`);
  }
  assert.equal((await fetchPage("/learn/cbj-nonexistent-regression-test/cbj-nonexistent-lesson")).status, 404);
  const learnHub = parseElements(await (await fetchPage("/learn")).text());
  assert.ok(learnHub.some((node) => node.tagName === "link" && attr(node, "rel") === "canonical" && attr(node, "href") === `${getSiteUrl()}/learn`));
  for (const course of courses) assert.ok(learnHub.some((node) => node.tagName === "a" && attr(node, "href") === learningHref(course.slug)), `Learning hub missing course: ${course.slug}`);
  for (const [key, values] of [["topic", Object.keys(LEARNING_TOPICS)], ["stage", Object.keys(LEARNING_STAGES)]] as const) {
    for (const value of values) {
      const response = await fetchPage(`/learn?${key}=${value}`);
      assert.equal(response.status, 200);
      const nodes = parseElements(await response.text());
      assert.ok(nodes.some((node) => node.tagName === "meta" && attr(node, "name") === "robots" && attr(node, "content")?.includes("noindex")), `Filtered learn page should be noindex: ${key}=${value}`);
      for (const course of courses) {
        for (const lesson of course.lessons) {
          const expected = key === "topic" ? course.topic === value : lesson.stage === value;
          assert.equal(nodes.some((node) => node.tagName === "a" && attr(node, "href") === learningHref(course.slug, lesson.slug)), expected, `${key}=${value}: incorrect lesson filter ${course.slug}/${lesson.slug}`);
        }
      }
    }
  }
  const learnSearch = await fetchPage(`/api/search?q=${encodeURIComponent("シール不良")}&type=learn&limit=2`);
  assert.equal(learnSearch.status, 200);
  const learnResults = (await learnSearch.json()).results as { type: string; href: string }[];
  assert.ok(learnResults.length > 0 && learnResults.length <= 2 && learnResults.every((hit) => hit.type === "learn"));
  for (const hit of learnResults) assert.equal((await fetchPage(hit.href)).status, 200, hit.href);
  const ssrSearch = await fetchPage(`/search?q=${encodeURIComponent("シール不良")}&type=learn`);
  assert.equal(ssrSearch.status, 200);
  assert.ok(parseElements(await ssrSearch.text()).some((node) => node.tagName === "a" && attr(node, "href") === learningHref("air-cleaner", "filter-life")), "Learning search results must be server rendered");
  const hero = guides.find((guide) => guide.heroImage)?.heroImage;
  assert.ok(hero, "Expected a representative article image");
  const optimized = await fetchPage(`/_next/image?url=${encodeURIComponent(hero)}&w=640&q=75`);
  assert.equal(optimized.status, 200, "Article image optimization");
  assert.match(optimized.headers.get("content-type") ?? "", /^image\//);
  const blockedRemote = await fetchPage("/_next/image?url=https%3A%2F%2Fexample.com%2Fblocked.png&w=640&q=75");
  assert.equal(blockedRemote.status, 400, "Unapproved remote images must be rejected");
  const empty = await fetchPage("/api/search?q=zzzznomatchcbj20260910");
  assert.equal(empty.status, 200);
  assert.deepEqual((await empty.json()).results, []);
  const matching = await fetchPage("/api/search?q=ADAS&type=guide&limit=2");
  const results = (await matching.json()).results as { type: string }[];
  assert.ok(results.length > 0 && results.length <= 2 && results.every((item) => item.type === "guide"));
  assert.equal((await fetchPage(`/api/search?q=${"x".repeat(201)}`)).status, 400);
  const searchPage = await fetchPage("/search?q=zzzznomatchcbj20260910");
  assert.equal(searchPage.status, 200);
  const searchHtml = await searchPage.text();
  assert.match(searchHtml, /name="robots"[^>]+noindex/);
  for (const pathname of ["/sitemap.xml", "/robots.txt"]) assert.equal((await fetchPage(pathname)).status, 200, pathname);
  console.log("[verify-http] OK: live pages, article and learning routes, selection pages, 404s, search API, noindex, image optimization, remote image rejection, cookie settings, sitemap and robots");
} finally {
  server.kill("SIGTERM");
  if (server.exitCode === null) await once(server, "exit");
}
