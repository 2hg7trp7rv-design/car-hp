import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { publicationPolicy } from "../lib/content/publication";

test("publication distinguishes accessibility from search-engine indexing", () => {
  for (const status of ["published", "draft", "archived"]) {
    for (const publicState of ["index", "noindex", "draft", "redirect"]) {
      const policy = publicationPolicy({ status, publicState });
      assert.equal(policy.accessible, status === "published" && ["index", "noindex"].includes(publicState));
      assert.equal(policy.indexable, status === "published" && publicState === "index");
    }
  }
  assert.equal(publicationPolicy({}).accessible, true);
  assert.equal(publicationPolicy(null).accessible, false);
  assert.equal(publicationPolicy({ status: "published", publicState: "index", noindex: true }).indexable, false);
  assert.equal(publicationPolicy({ status: "published", publicState: "noindex" }).accessible, true);
});

test("real loaders, related shelves and search exclude private fixtures in every content type", async () => {
  const root = process.cwd();
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "cbj-publication-test-"));
  const cases = [
    { slug: "policy-index", status: "published", publicState: "index", accessible: true },
    { slug: "policy-noindex", status: "published", publicState: "noindex", accessible: true },
    { slug: "policy-private", status: "published", publicState: "draft", accessible: false },
    { slug: "policy-redirect", status: "published", publicState: "redirect", accessible: false },
    { slug: "policy-archived", status: "archived", publicState: "index", accessible: false },
    { slug: "policy-draft", status: "draft", publicState: "index", accessible: false },
  ];
  const redirects = JSON.parse(fs.readFileSync(path.join(root, "data/redirects.json"), "utf8")) as { source: string }[];
  const fixtureRedirects: { kind: string; slug: string }[] = [];
  try {
    for (const kind of ["cars", "guides", "columns", "heritage"]) {
      const dir = path.join(fixture, "data/articles", kind);
      fs.mkdirSync(dir, { recursive: true });
      const sourceDir = path.join(root, "data/articles", kind);
      const source = JSON.parse(fs.readFileSync(path.join(sourceDir, fs.readdirSync(sourceDir).find((file) => file.endsWith(".json"))!), "utf8"));
      const prefix = kind === "guides" ? "guide" : kind === "columns" ? "column" : kind;
      const redirected = redirects.find((rule) => rule.source.startsWith(`/${prefix}/`));
      if (redirected) {
        const slug = redirected.source.split("/").at(-1)!;
        fixtureRedirects.push({ kind, slug });
        fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({ ...source, id: slug, slug, status: "published", publicState: "index" }));
      }
      for (const entry of cases) {
        const item = {
          ...source, ...entry, id: entry.slug, title: "PublicationFixture", titleJa: "PublicationFixture", name: "PublicationFixture",
          relatedCarSlugs: ["policy-index"], carSlugs: ["policy-index"],
          relatedGuideSlugs: cases.map((value) => value.slug), relatedColumnSlugs: cases.map((value) => value.slug), relatedHeritageSlugs: cases.map((value) => value.slug),
        };
        fs.writeFileSync(path.join(dir, `${entry.slug}.json`), JSON.stringify(item));
      }
    }
    // Each test file runs in an isolated Node process. Resolve repository data only after chdir.
    process.chdir(fixture);
    const guides = await import("../lib/guides");
    const columns = await import("../lib/columns");
    const cars = await import("../lib/cars");
    const heritage = await import("../lib/heritage");
    const { searchSite, getSearchSuggestions } = await import("../lib/search/index");
    const groups = [
      { all: await guides.getAllGuides(), get: guides.getGuideBySlug },
      { all: await columns.getAllColumns(), get: columns.getColumnBySlug },
      { all: await cars.getAllCars(), get: cars.getCarBySlug },
      { all: await heritage.getAllHeritage(), get: heritage.getHeritageBySlug },
    ];
    const loaders = { guides: guides.getGuideBySlug, columns: columns.getColumnBySlug, cars: cars.getCarBySlug, heritage: heritage.getHeritageBySlug };
    for (const { kind, slug } of fixtureRedirects) assert.ok(!await loaders[kind as keyof typeof loaders](slug), `redirect source leaked: ${kind}/${slug}`);
    for (const group of groups) {
      assert.deepEqual(group.all.map((item) => item.slug).sort(), ["policy-index", "policy-noindex"]);
      for (const entry of cases) assert.equal(Boolean(await group.get(entry.slug)), entry.accessible, entry.slug);
    }
    const shelves = [cars.getOwnershipGuidesForCarSlug("policy-index"), cars.getRelatedColumnsForCarSlug("policy-index"), cars.getRelatedHeritageForCarSlug("policy-index")];
    for (const shelf of shelves) assert.deepEqual(shelf.map((item) => item.slug).sort(), ["policy-index", "policy-noindex"]);
    assert.deepEqual(cars.getIndexCarsSync().map((car) => car.slug), ["policy-index"]);
    const hits = await searchSite({ q: "PublicationFixture", limit: 50 });
    assert.equal(hits.length, 8);
    assert.ok(hits.every((hit) => ["policy-index", "policy-noindex"].includes(hit.slug)));
    assert.ok(Object.values(await getSearchSuggestions()).flat().filter((hit) => hit.type !== "learn").every((hit) => ["policy-index", "policy-noindex"].includes(hit.slug)));
  } finally {
    process.chdir(root);
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test("learning loaders and search documents share publication rules", async () => {
  const { getLearningCourses, getLearningCourse } = await import("../lib/learning");
  const { learningSearchDocuments } = await import("../lib/search/learning");
  const sample = getLearningCourses()[0];
  for (const status of ["published", "draft", "archived"] as const) {
    for (const publicState of ["index", "noindex", "draft", "redirect"] as const) {
      const course = { ...sample, status, publicState };
      const policy = publicationPolicy(course);
      assert.equal(getLearningCourses([course]).length, policy.accessible ? 1 : 0);
      assert.equal(learningSearchDocuments([course]).length, policy.accessible ? course.lessons.length : 0);
      assert.equal(policy.indexable, status === "published" && publicState === "index");
    }
  }
  assert.equal(getLearningCourse("does-not-exist"), undefined);
});

test("learning sitemap generation keeps noindex/private courses out and verifies authored dates", () => {
  const root = process.cwd();
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "cbj-learning-sitemap-test-"));
  const run = (script: string) => spawnSync(process.execPath, [path.join(root, "scripts", script)], { cwd: fixture, encoding: "utf8" });
  try {
    for (const dir of ["cars", "guides", "columns", "heritage"]) fs.mkdirSync(path.join(fixture, "data/articles", dir), { recursive: true });
    fs.mkdirSync(path.join(fixture, "data/learning"), { recursive: true });
    fs.writeFileSync(path.join(fixture, "data/redirects.json"), "[]");
    const today = new Date().toISOString().slice(0, 10);
    for (const publicState of ["index", "noindex", "draft", "redirect"]) {
      fs.writeFileSync(path.join(fixture, "data/learning", `${publicState}.json`), JSON.stringify({
        slug: `course-${publicState}`, status: "published", publicState, updatedAt: today,
        lessons: Array.from({ length: 21 }, (_, index) => ({ slug: `lesson-${index + 1}` })),
      }));
    }
    const generated = run("generate-sitemaps.mjs");
    assert.equal(generated.status, 0, generated.stderr);
    const shard = path.join(fixture, "public/sitemaps/sitemap-learning.xml");
    const xml = fs.readFileSync(shard, "utf8");
    assert.equal((xml.match(/<loc>/g) ?? []).length, 22);
    assert.ok(xml.includes("/learn/course-index/lesson-21"));
    assert.ok(!/course-(noindex|draft|redirect)/.test(xml));
    assert.equal(run("verify-sitemaps.mjs").status, 0, "A real shared publication date is valid");
    fs.writeFileSync(shard, xml.replace(`<lastmod>${today}</lastmod>`, "<lastmod>2000-01-01</lastmod>"));
    const changed = run("verify-sitemaps.mjs");
    assert.notEqual(changed.status, 0);
    assert.match(changed.stderr, /differs from authored updatedAt/);

    // Keep the pre-existing guard on unexplained build-day dates in other shards.
    fs.writeFileSync(shard, xml);
    fs.writeFileSync(path.join(fixture, "public/sitemaps/sitemap-cars.xml"), xml.replaceAll("/learn/course-index", "/cars/fake-build-date"));
    const sitemapIndexPath = path.join(fixture, "public/sitemap.xml");
    fs.writeFileSync(sitemapIndexPath, fs.readFileSync(sitemapIndexPath, "utf8").replace("sitemap-learning.xml", "sitemap-cars.xml"));
    const unexplained = run("verify-sitemaps.mjs");
    assert.notEqual(unexplained.status, 0);
    assert.match(unexplained.stderr, /build-day lastmod/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
