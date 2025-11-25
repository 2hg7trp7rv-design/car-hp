// components/GlassCard.tsx
import type { ElementType, HTMLAttributes, ReactNode } from "react";

type GlassCardBaseProps = {
  as?: ElementType;
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
};

type GlassCardProps = GlassCardBaseProps & HTMLAttributes<HTMLElement>;

/**
 * Tiffany背景の上に置くガラスカード
 * 背景 半透明ホワイト＋うっすらグラデ
 * 枠 白系
 * 影 柔らかく広め
 */
export function GlassCard(props: GlassCardProps) {
  const {
    as,
    children,
    padding = "md",
    interactive = false,
    className,
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

  const classes = [
    "relative overflow-hidden rounded-2xl border border-white/70",
    "bg-white/80 backdrop-blur-xl",
    "shadow-soft-card",
    "transition-transform transition-shadow duration-200",
    paddingClass,
    interactive &&
      "hover:-translate-y-[2px] hover:shadow-soft-strong focus-visible:-translate-y-[2px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tiffany-400",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-tiffany-50/50 opacity-80" />
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
}

export default GlassCard;
