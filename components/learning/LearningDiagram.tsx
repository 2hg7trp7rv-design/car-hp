import type { DiagramKind } from "@/lib/learning";
import { FIGURES } from "./figures";

export function LearningDiagram({ kind }: { kind: DiagramKind }) {
  const Figure = FIGURES[kind];
  return <Figure />;
}
