import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getHomeTopics } from "../lib/home-topics";
import { getAllGuides } from "../lib/guides";
import { serializeJsonLd } from "../lib/seo/serialize-json";

test("topic counts and destinations reference actual published lessons", async () => {
  const guides = await getAllGuides();
  const topics = getHomeTopics(guides);
  const suspension = topics.find((topic) => topic.id === "suspension")!;
  assert.equal(suspension.lessons.length, 3);
  assert.equal(topics.find((topic) => topic.id === "exhaust")!.lessons.length, 0);
  assert.ok(topics.flatMap((topic) => topic.lessons).every((lesson) => guides.some((guide) => lesson.href === `/guide/${guide.slug}`)));
  assert.equal(getHomeTopics([]).flatMap((topic) => topic.lessons).length, 0);
  assert.equal(getHomeTopics(guides.map((guide) => ({ ...guide, publicState: "draft" }))).flatMap((topic) => topic.lessons).length, 0);
});

test("JSON-LD preserves values while preventing HTML script termination", () => {
  const data = { title: '</script><b id="inert-test">example</b>', note: "車の説明" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});

test("home font subsets cover the current copy and stay below 250 KB", () => {
  const manifest = JSON.parse(fs.readFileSync("app/refbook-fonts/charset.json", "utf8")) as { inputs: string[]; characters: string[] };
  const characters = new Set(manifest.characters);
  for (const input of manifest.inputs) {
    const missing = [...new Set(fs.readFileSync(input, "utf8"))].filter((character) => !characters.has(character));
    assert.deepEqual(missing, [], `Run scripts/subset-home-fonts.py after changing ${input}`);
  }
  for (const file of fs.readdirSync("data/articles/guides").filter((name) => name.endsWith(".json"))) {
    const guide = JSON.parse(fs.readFileSync(`data/articles/guides/${file}`, "utf8")) as { title: string };
    const missing = [...new Set(guide.title)].filter((character) => !characters.has(character));
    assert.deepEqual(missing, [], `Regenerate font subsets after updating ${file}`);
  }
  const fonts = fs.readdirSync("app/refbook-fonts").filter((file) => file.endsWith(".woff2"));
  const size = fonts.reduce((sum, file) => sum + fs.statSync(`app/refbook-fonts/${file}`).size, 0);
  assert.equal(fonts.length, 4);
  assert.ok(size < 250_000, `Font budget exceeded: ${size}`);
});
