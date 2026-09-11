import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getAllGuides } from "../lib/guides";
import { getAllColumns } from "../lib/columns";

test("repository normalization preserves every authored section and block", async () => {
  const groups = [
    { folder: "guides", articles: await getAllGuides() },
    { folder: "columns", articles: await getAllColumns() },
  ];
  for (const { folder, articles } of groups) {
    for (const article of articles) {
      const original = JSON.parse(fs.readFileSync(`data/articles/${folder}/${article.slug}.json`, "utf8")) as {
        detailSections?: { blocks: { type: string }[] }[];
      };
      if (!original.detailSections?.length) continue;
      assert.deepEqual(
        article.detailSections?.map((section) => section.blocks.map((block) => block.type)),
        original.detailSections.map((section) => section.blocks.map((block) => block.type)),
        `${folder}/${article.slug}: normalization must not silently discard content`,
      );
    }
  }
});
