import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { getAllGuides } from "../lib/guides";
import { getAllColumns } from "../lib/columns";
import { imageDimensions } from "../lib/content/image-dimensions";

test("every editorial body image reserves its real, oriented dimensions", async () => {
  const articles = [...await getAllGuides(), ...await getAllColumns()];
  let images = 0;
  for (const article of articles) {
    for (const block of (article.detailSections ?? []).flatMap((section) => section.blocks)) {
      if (block.type !== "image") continue;
      const { autoOrient } = await sharp(`public${block.src}`).metadata();
      assert.deepEqual(imageDimensions(block.src), autoOrient, block.src);
      images++;
    }
  }
  assert.ok(images > 0);
  assert.throws(() => imageDimensions("/images/missing.webp"), /Missing dimensions/);
  assert.throws(() => imageDimensions("__proto__"), /Missing dimensions/);
});
