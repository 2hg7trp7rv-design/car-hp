import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  DIAGRAM_KINDS,
  DIAGRAM_TEXT,
  DIALOGUE_EXPRESSIONS,
  getLearningCourses,
  LEARNING_STAGES,
  LEARNING_TOPICS,
  type LearningCourse,
} from "../lib/learning";
import { getGuideBySlug } from "../lib/guides";

test("authored courses have valid progression, complete exercises and resolvable references", async () => {
  const files = fs
    .readdirSync("data/learning")
    .filter((file) => file.endsWith(".json"));
  const courses = files.map(
    (file) =>
      JSON.parse(
        fs.readFileSync(`data/learning/${file}`, "utf8"),
      ) as LearningCourse,
  );
  assert.deepEqual(
    getLearningCourses()
      .map((course) => course.slug)
      .sort(),
    getLearningCourses(courses)
      .map((course) => course.slug)
      .sort(),
    "Every published JSON course must be registered in the app",
  );
  assert.equal(
    new Set(courses.map((course) => course.slug)).size,
    courses.length,
  );
  assert.deepEqual([...new Set(getLearningCourses().map((course) => course.topic))].sort(), Object.keys(LEARNING_TOPICS).sort(), "Published courses cover the six car topics");
  for (const course of courses) {
    assert.match(course.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(["published", "draft", "archived"].includes(course.status), `${course.slug}: explicit status required`);
    assert.ok(["index", "noindex", "draft", "redirect"].includes(course.publicState), `${course.slug}: explicit publicState required`);
    assert.ok(Object.hasOwn(LEARNING_TOPICS, course.topic));
    assert.ok(course.title.trim() && course.description.trim());
    assert.match(course.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(course.updatedAt)));
    if (course.verifiedAt) {
      assert.match(course.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(Number.isFinite(Date.parse(course.verifiedAt)));
    }
    if (course.relatedGuideSlug) assert.ok(await getGuideBySlug(course.relatedGuideSlug), `${course.slug}: public related guide missing`);
    if (course.selectionHref) assert.ok(["/choose", "/choose/air-filter", "/choose/drive-recorder", "/choose/car-wash", "/choose/shaken"].includes(course.selectionHref));
    assert.ok(course.outcomes.length > 0 && course.outcomes.every((value) => value.trim()));
    assert.ok(course.lessons.length > 0);
    assert.equal(
      new Set(course.lessons.map((lesson) => lesson.slug)).size,
      course.lessons.length,
    );
    const sources = new Set(course.sources.map((source) => source.id));
    assert.equal(sources.size, course.sources.length);
    for (const source of course.sources) {
      assert.equal(new URL(source.url).protocol, "https:");
      assert.ok(source.id.trim() && source.title.trim() && source.note.trim());
    }
    const earlier = new Set<string>();
    let priorStage = -1;
    for (const lesson of course.lessons) {
      assert.match(lesson.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(lesson.title.trim() && lesson.goal.trim());
      const stage = Object.keys(LEARNING_STAGES).indexOf(lesson.stage);
      assert.ok(
        stage >= 0 && stage >= priorStage,
        `${lesson.slug}: stage must advance`,
      );
      priorStage = stage;
      assert.ok(
        lesson.prerequisites.every((slug) => earlier.has(slug)),
        `${lesson.slug}: prerequisite must exist earlier`,
      );
      if (earlier.size === 0) assert.equal(lesson.prerequisites.length, 0);
      else
        assert.ok(
          lesson.prerequisites.length > 0,
          `${lesson.slug}: connect the prerequisite`,
        );
      earlier.add(lesson.slug);
      assert.ok(
        earlier.has(lesson.checkpoint.review),
        `${lesson.slug}: exercise review must not point ahead`,
      );
      assert.ok(
        lesson.checkpoint.question.trim() && lesson.checkpoint.answer.trim(),
      );
      assert.ok(
        lesson.takeaways.length > 0 &&
          lesson.takeaways.every((value) => value.trim()),
      );
      assert.ok(
        lesson.sources.length > 0 &&
          lesson.sources.every((id) => sources.has(id)),
      );
      const speakers = new Set<string>();
      let figures = 0;
      for (const block of lesson.blocks) {
        if (block.type === "dialogue") {
          assert.ok(["shuna", "rina"].includes(block.speaker));
          assert.ok(block.text.trim());
          if (block.expression) {
            assert.ok(
              (DIALOGUE_EXPRESSIONS as readonly string[]).includes(block.expression),
              `${lesson.slug}: unknown expression ${block.expression}`,
            );
            const portrait = `public/images/cbj/learning/${block.speaker}-${block.expression}.webp`;
            assert.ok(fs.existsSync(portrait), `${lesson.slug}: add the illustration at ${portrait}`);
          }
          speakers.add(block.speaker);
        } else if (block.type === "comparison") {
          figures++;
          assert.ok(block.rows.length > 0);
          assert.ok(block.headers.length >= 2);
          for (const row of block.rows)
            assert.equal(row.length, block.headers.length);
          assert.ok(block.note.trim());
        } else if (block.type === "flow") {
          figures++;
          assert.ok(block.steps.length >= 2);
          assert.ok(block.steps.every((step) => step.title.trim() && step.body.trim()));
          assert.ok(block.note.trim());
        } else if (block.type === "measurements") {
          figures++;
          assert.ok(block.rounds.length > 1 && block.series.length > 0, `${course.slug}/${lesson.slug}: graph needs points and a named series`);
          assert.ok(
            block.title.trim() && block.unit.trim() && block.note.trim(),
          );
          for (const series of block.series)
            assert.ok(
              series.name.trim() &&
                series.values.length === block.rounds.length &&
                series.values.every(Number.isFinite),
            );
        } else if (block.type === "diagram") {
          figures++;
          assert.ok(
            (DIAGRAM_KINDS as readonly string[]).includes(block.kind),
            `${course.slug}/${lesson.slug}: unknown diagram kind ${block.kind}`,
          );
          assert.ok(DIAGRAM_TEXT[block.kind]?.trim(), `${block.kind}: needs a text description`);
        } else assert.fail(`Unknown learning block: ${JSON.stringify(block)}`);
      }
      assert.deepEqual([...speakers].sort(), ["rina", "shuna"]);
      assert.ok(
        figures > 0,
        `${lesson.slug}: needs an explanatory figure or comparison`,
      );
    }
    assert.deepEqual(
      [...new Set(course.lessons.map((lesson) => lesson.stage))],
      Object.keys(LEARNING_STAGES),
    );
  }
});

test("the three learning stages use reader-facing names instead of score ranges", () => {
  assert.deepEqual(Object.values(LEARNING_STAGES).map((stage) => stage.label), ["はじめて", "しくみと選び方", "深く読み解く"]);
});
