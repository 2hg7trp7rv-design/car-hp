import assert from "node:assert/strict";
import test from "node:test";
import { chartGeometry } from "../lib/learning-chart";
import type { LearningBlock } from "../lib/learning";

const block: Extract<LearningBlock, { type: "measurements" }> = {
  type: "measurements", title: "Test", unit: "N", note: "Hypothetical",
  rounds: ["0", "0.05", "0.2"], xValues: [0, 0.05, 0.2],
  series: [{ name: "Example", values: [0, 20, 40] }],
};

test("numeric chart positions preserve unequal input spacing", () => {
  const { xs, low, high } = chartGeometry(block);
  assert.deepEqual(xs, [82, 177, 462]);
  assert.equal(low, 0);
  assert.ok(high > 40);
});

test("categorical charts use equal spacing and constant series remain finite", () => {
  const { xs, y } = chartGeometry({ ...block, xValues: undefined, series: [{ name: "Zero", values: [0, 0, 0] }] });
  assert.deepEqual(xs, [82, 272, 462]);
  assert.ok(Number.isFinite(y(0)));
});

test("an explicitly enlarged y range keeps small repeat-measurement differences visible", () => {
  const { low, high, y } = chartGeometry({ ...block, yRange: [298, 304], series: [{ name: "Example", values: [299, 300, 303] }] });
  assert.equal(low, 298);
  assert.equal(high, 304);
  assert.equal(y(299) - y(300), 27);
});
