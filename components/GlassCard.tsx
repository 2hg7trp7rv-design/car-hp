// components/GlassCard.tsx
"use client";

import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { MagneticArea } from "@/components/ui/magnetic-area";

type Padding = "none" | "sm" | "md" | "lg";
type Variant = "standard" | "dim" | "crystal";

type GlassCardBaseProps = {
  as?: ElementType;
  children: ReactNode;
  padding?: Padding;
  interactive?: boolean;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
};

type GlassCardProps = GlassCardBaseProps & HTMLAttributes<HTMLElement>;

/**
 * GlassCard
 * 互換名は残しつつ、表現は glass ではなく paper に寄せる。
 */
export function GlassCard(props: GlassCardProps) {
  const {
    as,
    children,
    padding = "md",
    interactive = false,
    variant = "standard",
    className,
    magnetic = false,
    ...rest
  } = props;

  const Component = (as ?? "div") as ElementType;

  const paddingClass =
    padding === "none"
      ? "p-0"
      : padding === "sm"
        ? "p-3 sm:p-4"
        : padding === "lg"
          ? "p-6 sm:p-8"
          : "p-4 sm:p-5";

  const variantStyles: Record<Variant, string> = {
    standard: [
      "bg-[var(--surface-1)]",
      "border border-[var(--border-default)]",
      "text-[var(--text-primary)]",
    ].join(" "),
    dim: [
      "bg-[var(--surface-2)]",
      "border border-[var(--border-default)]",
      "text-[var(--text-primary)]",
    ].join(" "),
    crystal: [
      "bg-[var(--surface-3)]",
      "border border-[rgba(14,12,10,0.12)]",
      "text-[var(--text-primary)]",
    ].join(" "),
  };

  const interactiveClasses = interactive
    ? [
        "cursor-pointer",
        "transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "motion-safe:hover:scale-[1.01]",
      ].join(" ")
    : "";

  const baseClasses = [
    "relative",
    "group",
    "overflow-hidden",
    "rounded-[20px]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[rgba(27,63,229,0.42)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--bg-stage)]",
  ].join(" ");

  const classes = [baseClasses, variantStyles[variant], paddingClass, interactiveClasses, className ?? ""]
    .filter(Boolean)
    .join(" ");

  const card = (
    <Component className={classes} {...rest}>
      <div className="relative z-10">{children}</div>
    </Component>
  );

  if (!magnetic) return card;

  return (
    <MagneticArea strength={8} className="block w-full">
      {card}
    </MagneticArea>
  );
}

export default GlassCard;
