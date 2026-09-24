import type { LearningBlock } from "./learning";

type Measurements = Extract<LearningBlock, { type: "measurements" }>;

export function chartGeometry(block: Measurements) {
  const values = block.series.flatMap(series => series.values);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = (maximum - minimum || Math.abs(maximum) || 1) * 0.06;
  const step = 10 ** Math.floor(Math.log10((Math.max(Math.abs(minimum), Math.abs(maximum)) || 1) / 2));
  const low = block.yRange?.[0] ?? Number((minimum >= 0 ? 0 : Math.floor((minimum - padding) / step) * step).toPrecision(4));
  const high = block.yRange?.[1] ?? Number((Math.ceil((maximum + padding) / step) * step).toPrecision(4));
  const horizontal = block.xValues ?? block.rounds.map((_, index) => index);
  const first = horizontal[0];
  const span = horizontal[horizontal.length - 1] - first || 1;
  const xs = horizontal.map(value => 82 + (value - first) * 380 / span);
  const y = (value: number) => 224 - (value - low) * 162 / (high - low);
  return { low, high, xs, y };
}
