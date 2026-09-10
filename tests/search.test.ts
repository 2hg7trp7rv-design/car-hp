import assert from "node:assert/strict";
import test from "node:test";
import { searchSite } from "../lib/search/index";
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
