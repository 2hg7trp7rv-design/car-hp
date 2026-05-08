// components/ui/magnetic-area.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MagneticAreaProps = {
  children: React.ReactElement;
  strength?: number;
  className?: string;
};

/**
 * 磁力演出は使わず、見た目だけ維持する。
 */
export function MagneticArea({ children, className }: MagneticAreaProps) {
  return <div className={cn("block", className)}>{children}</div>;
}
