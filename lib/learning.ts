import { DIAGRAM_TEXT } from "./learning-diagrams";
export { DIAGRAM_TEXT } from "./learning-diagrams";
import airCleaner from "@/data/learning/air-cleaner.json";
import engine from "@/data/learning/engine-torque.json";
import suspension from "@/data/learning/suspension.json";
import tires from "@/data/learning/tires-brakes.json";
import electronics from "@/data/learning/driving-support.json";
import maintenance from "@/data/learning/maintenance.json";
import muffler from "@/data/learning/muffler-sound.json";
import { isPublicContent } from "@/lib/content/publication";

export const LEARNING_STAGES = {
  start: { label: "初級", description: "名前と役割がわかる" },
  mechanism: { label: "中級", description: "車屋さんの説明がわかる" },
  evaluation: { label: "上級", description: "条件とデータで考えられる" },
} as const;
export const LEARNING_TOPICS = {
  engine: { title: "エンジン", description: "動力を生み出す、クルマの心臓。", image: "/images/cbj/topic-icons/engine-basics.png" },
  intake: { title: "吸気・排気", description: "空気を取り入れ、排気を出すしくみ。", image: "/images/cbj/topic-icons/exhaust-muffler.png" },
  suspension: { title: "足回り", description: "乗り心地と安定性を支えるしくみ。", image: "/images/cbj/topic-icons/suspension.png" },
  tires: { title: "タイヤ・ブレーキ", description: "走る・止まるを支える大切な部分。", image: "/images/cbj/learning/topic-tires.webp" },
  electronics: { title: "電装・安全装備", description: "電気で動く装備と、安全を守る技術。", image: "/images/cbj/learning/topic-electronics.webp" },
  maintenance: { title: "メンテナンス", description: "長く快適に乗るための点検と手入れ。", image: "/images/cbj/learning/topic-maintenance.webp" },
} as const;
export type LearningTopic = keyof typeof LEARNING_TOPICS;
export type LearningStage = keyof typeof LEARNING_STAGES;
/** Every drawing the lessons can place. The descriptions in lib/learning-diagrams.ts define the list;
 * components/learning/figures/index.tsx must map each one to a drawing (TypeScript enforces it). */
export type DiagramKind = keyof typeof DIAGRAM_TEXT;
export const DIAGRAM_KINDS = Object.keys(DIAGRAM_TEXT) as DiagramKind[];
/**
 * Face variants for the two hosts. A line without an expression uses the default portrait,
 * so illustrations can be added one at a time; the contract test checks that every
 * expression used in the data has an image at /images/cbj/learning/<speaker>-<expression>.webp.
 */
export const DIALOGUE_EXPRESSIONS = ["normal", "surprised", "thinking", "happy"] as const;
export type DialogueExpression = (typeof DIALOGUE_EXPRESSIONS)[number];
export type LearningBlock =
  | {
      type: "dialogue";
      speaker: "shuna" | "rina";
      expression?: DialogueExpression;
      text: string;
    }
  | { type: "heading"; id: string; title: string; sources: string[] }
  | {
      type: "flow";
      title: string;
      steps: { title: string; body: string }[];
      note: string;
    }
  | {
      type: "comparison";
      title: string;
      headers: string[];
      rows: string[][];
      note: string;
    }
  | {
      type: "measurements";
      yLabel?: string;
      xLabel?: string;
      title: string;
      unit: string;
      rounds: string[];
      xValues?: number[];
      yRange?: [number, number];
      series: { name: string; values: number[] }[];
      note: string;
    }
  | {
      type: "diagram";
      kind: DiagramKind;
      title?: string;
      note?: string;
    };
export type LearningLesson = {
  slug: string;
  title: string;
  stage: LearningStage;
  goal: string;
  summary?: string;
  prerequisites: string[];
  blocks: LearningBlock[];
  takeaways: string[];
  checkpoint: { question: string; answer: string; review: string };
  sources: string[];
};
export type LearningCourse = {
  slug: string;
  topic: LearningTopic;
  title: string;
  description: string;
  status: "published" | "draft" | "archived";
  publicState: "index" | "noindex" | "draft" | "redirect";
  updatedAt: string;
  verifiedAt?: string;
  outcomes: string[];
  sources: { id: string; title: string; url: string; note: string }[];
  lessons: LearningLesson[];
  selectionHref?: string;
  selectionLabel?: string;
  relatedGuideSlug?: string;
  relatedGuideIntro?: string;
};

// Authored JSON is checked by the learning content contract in CI.
const authoredCourses = [engine, airCleaner, muffler, suspension, tires, electronics, maintenance] as LearningCourse[];
export function getLearningCourses(
  courses: readonly LearningCourse[] = authoredCourses,
) {
  return courses.filter(isPublicContent);
}
export function getLearningCourse(slug: string) {
  return getLearningCourses().find((course) => course.slug === slug);
}
export function learningHref(course: string, lesson?: string) {
  return `/learn/${encodeURIComponent(course)}${lesson ? `/${encodeURIComponent(lesson)}` : ""}`;
}
export function learningLessonText(lesson: LearningLesson) {
  const blocks = lesson.blocks.flatMap((block) => {
    switch (block.type) {
      case "heading":
        return [block.title];
      case "dialogue":
        return [block.text];
      case "flow":
        return [
          block.title,
          ...block.steps.flatMap((step) => [step.title, step.body]),
          block.note,
        ];
      case "comparison":
        return [
          block.title,
          ...block.headers,
          ...block.rows.flat(),
          block.note,
        ];
      case "measurements":
        return [
          block.title,
          block.unit,
          block.xLabel ?? "",
          block.yLabel ?? "",
          ...block.rounds,
          ...block.series.flatMap((series) => [
            series.name,
            ...series.values.map(String),
          ]),
          block.note,
        ];
      case "diagram":
        return [block.title ?? DIAGRAM_TEXT[block.kind], block.note ?? ""];
      default: {
        const unreachable: never = block;
        return unreachable;
      }
    }
  });
  return [
    lesson.goal,
    lesson.summary ?? "",
    ...blocks,
    ...lesson.takeaways,
    lesson.checkpoint.question,
    lesson.checkpoint.answer,
  ].join(" ");
}
