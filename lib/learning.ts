import airCleaner from "@/data/learning/air-cleaner.json";
import engine from "@/data/learning/engine-torque.json";
import suspension from "@/data/learning/suspension.json";
import tires from "@/data/learning/tires-brakes.json";
import electronics from "@/data/learning/driving-support.json";
import maintenance from "@/data/learning/maintenance.json";
import muffler from "@/data/learning/muffler-sound.json";
import { isPublicContent } from "@/lib/content/publication";

export const LEARNING_STAGES = {
  start: { label: "はじめて", description: "名前と役割がわかる" },
  mechanism: { label: "しくみと選び方", description: "車屋さんの説明がわかる" },
  evaluation: { label: "深く読み解く", description: "条件とデータで考えられる" },
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
/** Every drawing the lessons can place. Each kind needs a component and a DIAGRAM_TEXT line. */
export const DIAGRAM_KINDS = [
  "air-and-fuel",
  "pleated-media",
  "installation-types",
  "sound-rms",
  "torque-lever",
  "torque-vs-rpm",
  "torque-feel",
  "catalog-anatomy",
  "torque-and-power-curves",
  "drive-force-chain",
  "drive-force-by-speed",
  "torque-curve-shapes",
  "two-points-two-curves",
] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];
export type LearningBlock =
  | { type: "dialogue"; speaker: "shuna" | "rina"; text: string }
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
      /** Axis floor. Defaults to 0 so the height of a bar or line matches the value. */
      yMin?: number;
      yMax?: number;
      title: string;
      unit: string;
      rounds: string[];
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
    ...blocks,
    ...lesson.takeaways,
    lesson.checkpoint.question,
    lesson.checkpoint.answer,
  ].join(" ");
}

export const DIAGRAM_TEXT: Record<DiagramKind, string> = {
  "air-and-fuel": "エアクリーナーのはたらき。外の空気からフィルターで異物を減らし、エンジンへ送る。燃料は別の経路で加わる。",
  "pleated-media": "折りひだを広げると、同じ箱の中に広いろ材の面積を収められる。",
  "installation-types": "純正交換型はボックスを残す。密閉型は箱を含めて交換する。露出型はフィルターが外に出る。",
  "sound-rms": "正負に変わる音圧の波形。RMSは音圧を二乗して平均し平方根を取る。波の瞬間の最大値とは異なる。",
  "torque-lever": "同じ力でも、軸から遠いところを押すほどトルクは大きくなる。力と、軸からの距離の掛け算。",
  "torque-vs-rpm": "トルクは軸をどれだけ強くひねるか、回転数は1分間に何回まわるか。同じ軸で測る別々の量。",
  "torque-feel": "低い回転のトルクは発進や坂道で、高い回転の出力は速度が乗ってからの伸びで効いてくる。",
  "catalog-anatomy": "性能表示は、値と、その値が出る回転数の組。あいだの斜線は割り算ではなく区切り。",
  "torque-and-power-curves": "同じエンジンのトルクと出力。最大トルクの回転数と、最高出力の回転数は離れている。",
  "drive-force-chain": "エンジンのトルクは変速機と最終減速で増やされ、タイヤ半径で割ってタイヤを押す力になる。",
  "drive-force-by-speed": "ギアごとのタイヤを押す力と車速の関係。低いギアほど力は大きく、出せる速度は低い。",
  "torque-curve-shapes": "自然吸気は回転とともになだらかに、過給は低い回転から平らな山を作る。形が性格を決める。",
  "two-points-two-curves": "性能表示の2点を通る曲線は一通りではない。平らな形にも尖った形にもなりうる。",
};
