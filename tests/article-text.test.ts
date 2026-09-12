import assert from "node:assert/strict";
import test from "node:test";
import { articleText } from "../lib/content/article-text";

test("search copy includes table values, steps, captions and FAQs without hidden metadata", () => {
  const text = articleText({
    body: "retired-copy",
    detailSections: [{ title: "見出し", deck: "概要", id: "private-anchor", blocks: [
      { type: "paragraph", text: "本文", highlights: ["private-highlight"] },
      { type: "comparisonTable", headers: ["比較項目"], rows: [["比較値"]], note: "注意事項" },
      { type: "flow", steps: [{ title: "作業", body: "手順" }] },
      { type: "image", src: "/private-path.webp", alt: "図の説明", fit: "articleWide" },
      { type: "caseStudy", cases: [{ title: "事例", rows: [{ label: "費用", value: "見積額", note: "条件" }] }] },
    ] }],
    faq: [{ question: "よくある質問", answer: "回答内容" }],
  });
  for (const value of ["見出し", "概要", "本文", "比較項目", "比較値", "注意事項", "作業", "手順", "図の説明", "事例", "費用", "見積額", "条件", "よくある質問", "回答内容"]) assert.ok(text.includes(value), value);
  for (const value of ["retired-copy", "private-anchor", "private-highlight", "private-path", "articleWide"]) assert.ok(!text.includes(value), value);
  assert.ok(articleText({ body: "旧形式の本文", detailSections: [] }).includes("旧形式の本文"));
});
