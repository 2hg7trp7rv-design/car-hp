// components/GlassCard.tsx

import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

export function GlassCard({
  children,
  className,
  as: Tag = "div",
}: GlassCardProps) {
  const baseClass =
    "glass-card border border-white/70 shadow-soft-card px-5 py-6 sm:px-6 sm:py-7 bg-white/80";

  const mergedClass = className ? `${baseClass} ${className}` : baseClass;

  return <Tag className={mergedClass}>{children}</Tag>;
}
