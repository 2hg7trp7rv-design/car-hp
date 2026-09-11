import assert from "node:assert/strict";
import test from "node:test";
import { stripLeadingDisplayNumber } from "../components/editorialArticle/article-format";

test("article labels preserve numeric vehicle specifications and costs", () => {
  for (const value of ["10万円の費用", "2.0Lエンジン", "0-100km/h加速", "280馬力", "2026年モデル", "4WD", "10 mmの差"]) {
    assert.equal(stripLeadingDisplayNumber(value), value);
  }
});

test("explicit chapter and list markers are removed without removing the text", () => {
  for (const value of ["第2章 仕組み", "① 仕組み", "02. 仕組み", "2、仕組み", "2 - 仕組み"]) {
    assert.equal(stripLeadingDisplayNumber(value), "仕組み");
  }
});
