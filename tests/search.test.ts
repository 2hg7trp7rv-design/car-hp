import assert from "node:assert/strict";
import test from "node:test";
import { getSearchSuggestions, searchSite } from "../lib/search/index";
import { GET } from "../app/api/search/route";

test("unmatched queries return no results, regardless of recency", async () => {
  assert.deepEqual(await searchSite({ q: "zzzznomatchcbj20260910" }), []);
});

test("Japanese queries find matching guides and respect type and limit", async () => {
  const hits = await searchSite({ q: "ダンパー", type: "guide", limit: 2 });
  assert.ok(hits.length > 0 && hits.length <= 2);
  assert.ok(hits.every((hit) => hit.type === "guide"));
  assert.ok(hits.some((hit) => hit.title.includes("ダンパー")));
  assert.ok(hits.every((hit) => !("_haystack" in hit)));
});

test("normalization treats full-width English as the same query", async () => {
  const wide = await searchSite({ q: "ＡＤＡＳ", type: "guide" });
  const narrow = await searchSite({ q: "ADAS", type: "guide" });
  assert.deepEqual(wide, narrow);
  assert.ok(wide.length > 0);
});

test("API returns a real empty result instead of unrelated suggestions", async () => {
  const response = await GET(new Request("https://example.test/api/search?q=zzzznomatchcbj20260910"));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).results, []);
});

test("API rejects oversized queries", async () => {
  const response = await GET(new Request(`https://example.test/api/search?q=${"x".repeat(201)}`));
  assert.equal(response.status, 400);
});

test("body-only terms find their article while title matches rank first", async () => {
  const slug = "adas-lowered-car-aiming-risk-guide";
  for (const q of ["バンプラバー", "エンブレム"]) {
    const hits = await searchSite({ q, type: "guide" });
    assert.ok(hits.some((hit) => hit.slug === slug), q);
    assert.ok(hits.every((hit) => hit.type === "guide"));
  }
  const hits = await searchSite({ q: "エーミング", type: "guide" });
  assert.ok(hits.length >= 3);
  assert.equal(hits[0].slug, slug);
});

test("search results and empty-query suggestions never serialize index text", async () => {
  const suggestions = await getSearchSuggestions();
  const hits = await searchSite({ q: "エンブレム" });
  for (const doc of [...Object.values(suggestions).flat(), ...hits]) {
    assert.ok(Object.keys(doc).every((key) => !key.startsWith("_")));
  }
  for (const q of ["", "エンブレム"]) {
    const response = await GET(new Request(`https://example.test/api/search?q=${encodeURIComponent(q)}`));
    const json = await response.text();
    assert.ok(!/"_(body|title|haystack)"/.test(json));
  }
});

test("learning fulltext includes dialogue, comparison cells and exercise answers", async () => {
  const { learningHref, learningLessonText, getLearningCourses } = await import("../lib/learning");
  for (const [q, slug] of [["シール不良", "filter-life"], ["通過量", "filtration-and-restriction"], ["因果関係", "read-the-evidence"]]) {
    const hits = await searchSite({ q, type: "learn", limit: 50 });
    assert.ok(hits.some((hit) => hit.href === learningHref("air-cleaner", slug)), q);
    assert.ok(hits.every((hit) => hit.type === "learn" && Object.keys(hit).every((key) => !key.startsWith("_"))));
  }
  assert.ok((await getSearchSuggestions()).learn.length > 0);
  for (const course of getLearningCourses()) {
    for (const lesson of course.lessons) assert.ok(learningLessonText(lesson).includes(lesson.checkpoint.answer));
  }
  const response = await GET(new Request("https://example.test/api/search?q=" + encodeURIComponent("シール不良") + "&type=learn&limit=2"));
  const payload = await response.json();
  assert.equal(payload.type, "learn");
  assert.ok(payload.results.length > 0 && payload.results.length <= 2);
  assert.ok(payload.results.every((hit: { type: string }) => hit.type === "learn"));
});

test("learning text extraction covers graph axes, values and each block variant", async () => {
  const { learningLessonText, DIAGRAM_TEXT, getLearningCourses } = await import("../lib/learning");
  for (const course of getLearningCourses()) for (const lesson of course.lessons) {
    const body = learningLessonText(lesson);
    for (const block of lesson.blocks) {
      const phrases = block.type === "dialogue" ? [block.text]
        : block.type === "heading" ? [block.title]
        : block.type === "flow" ? [block.title, ...block.steps.flatMap((step) => [step.title, step.body]), block.note]
        : block.type === "comparison" ? [block.title, ...block.headers, ...block.rows.flat(), block.note]
        : block.type === "measurements" ? [block.title, block.unit, block.xLabel, block.yLabel, ...block.rounds, ...block.series.flatMap((series) => [series.name, ...series.values.map(String)]), block.note]
        : [block.title ?? DIAGRAM_TEXT[block.kind], block.note];
      for (const phrase of phrases.filter((value): value is string => Boolean(value))) assert.ok(body.includes(phrase), `${course.slug}/${lesson.slug}: ${phrase}`);
    }
  }
});
