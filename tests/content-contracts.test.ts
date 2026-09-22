import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { serializeJsonLd } from "../lib/seo/serialize-json";

test("JSON-LD preserves values while preventing HTML script termination", () => {
  const data = { title: '</script><b id="inert-test">example</b>', note: "車の説明" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});

test("the heading font subset covers every reference surface and stays below 250 KB", () => {
  const manifest = JSON.parse(fs.readFileSync("app/refbook-fonts/charset.json", "utf8")) as { inputs: string[]; characters: string[] };
  const characters = new Set(manifest.characters);
  assert.ok(manifest.inputs.includes("data/learning/engine-torque.json"), "learning copy must be part of the subset");
  for (const input of manifest.inputs) {
    const missing = [...new Set(fs.readFileSync(input, "utf8"))].filter((character) => !characters.has(character) && !"\t\r".includes(character));
    assert.deepEqual(missing, [], `Run scripts/subset-refbook-fonts.py after changing ${input}`);
  }
  const fonts = fs.readdirSync("app/refbook-fonts").filter((file) => file.endsWith(".woff2"));
  const size = fonts.reduce((sum, file) => sum + fs.statSync(`app/refbook-fonts/${file}`).size, 0);
  assert.equal(fonts.length, 1, "body copy uses the system stack; only the rounded heading face ships");
  assert.ok(size < 250_000, `Font budget exceeded: ${size}`);
});
