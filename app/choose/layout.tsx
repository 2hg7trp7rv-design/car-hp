import type { ReactNode } from "react";
import { ReferenceFrame } from "@/components/learning/ReferenceFrame";

export default function ChooseLayout({ children }: { children: ReactNode }) {
  return <ReferenceFrame>{children}</ReferenceFrame>;
}
