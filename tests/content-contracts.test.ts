import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";
import { serializeJsonLd } from "../lib/seo/serialize-json";

test("JSON-LD preserves values while preventing HTML script termination", () => {
  const data = { title: '</script><b id="inert-test">example</b>', note: "車の説明" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});

test("home font subsets cover the current copy and stay below 250 KB", () => {
  const manifest = JSON.parse(fs.readFileSync("app/refbook-fonts/charset.json", "utf8")) as { inputs: string[]; characters: string[]; fonts: Record<string, { sha256: string; codepoints: number[] }> };
  const characters = new Set(manifest.characters);
  for (const input of manifest.inputs) {
    const missing = [...new Set(fs.readFileSync(input, "utf8"))].filter((character) => !characters.has(character));
    assert.deepEqual(missing, [], `Run scripts/subset-home-fonts.py after changing ${input}`);
  }
  const fonts = fs.readdirSync("app/refbook-fonts").filter((file) => file.endsWith(".woff2"));
  const size = fonts.reduce((sum, file) => sum + fs.statSync(`app/refbook-fonts/${file}`).size, 0);
  assert.equal(fonts.length, 4);
  assert.deepEqual(Object.keys(manifest.fonts).sort(), fonts.sort());
  for (const file of fonts) {
    const record = manifest.fonts[file];
    assert.equal(createHash("sha256").update(fs.readFileSync(`app/refbook-fonts/${file}`)).digest("hex"), record.sha256, `Regenerate actual font and manifest together: ${file}`);
    const available = new Set(record.codepoints);
    const missing = manifest.characters.filter(character => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(character) && !available.has(character.codePointAt(0)!));
    assert.deepEqual(missing, [], `${file} is missing Japanese glyphs used on the home page`);
  }
  assert.ok(size < 250_000, `Font budget exceeded: ${size}`);
});
