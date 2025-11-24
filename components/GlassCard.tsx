// components/GlassCard.tsx
import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

export function GlassCard({ children, className, as: Tag = "div" }: Props) {
  return (
    <Tag
      className={clsx(
        "glass-card border border-white/70 shadow-soft-card",
        "px-5 py-6 sm:px-6 sm:py-7",
        "bg-white/80",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
