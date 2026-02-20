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
  /**
   * ホバー時の浮遊感など、インタラクティブな動きを付けるかどうか
   */
  interactive?: boolean;
  /**
   * カードの質感バリアント
   * - standard: ガイド基準の“ペーパー”カード（サイトの新基準）
   * - dim: ほんのりティファニーを感じる薄いカード（同系統で統一）
   * - crystal: Heroなど、強く見せたい場所用
   */
  variant?: Variant;
  className?: string;
  /**
   * MagneticAreaによる吸い付きインタラクションを有効にするか
   * デフォルトtrue。落ち着かせたいカードだけfalseを指定
   */
  magnetic?: boolean;
};

type GlassCardProps = GlassCardBaseProps & HTMLAttributes<HTMLElement>;

/**
 * GlassCard Component
 *
 * NOTE: ガイドページで採用した「白地 + 繊細な枠線 + 影」を基準に、
 * サイト全体のカード質感を統一するための中核コンポーネント。
 */
export function GlassCard(props: GlassCardProps) {
  const {
    as,
    children,
    padding = "md",
    interactive = false,
    variant = "standard",
    className,
    magnetic = true,
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
      "bg-white",
      "border border-[#222222]/10",
      "shadow-soft-card",
    ].join(" "),

    dim: [
      "bg-gradient-to-br from-white via-white to-[#0ABAB5]/[0.06]",
      "border border-[#222222]/10",
      "shadow-soft-card",
    ].join(" "),

    crystal: [
      "bg-gradient-to-br from-white/95 via-white/55 to-[#0ABAB5]/[0.10]",
      "border border-white/80",
      "shadow-glass-edge shadow-soft-glow",
    ].join(" "),
  };

  const interactiveClasses = interactive
    ? [
        "cursor-pointer",
        "transition-transform duration-500 ease-liquid",
        "motion-safe:hover:scale-[1.01]",
      ].join(" ")
    : "";

  const baseClasses = [
    "relative",
    "group",
    "overflow-hidden",
    "rounded-3xl",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#0ABAB5]/45",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-white",
  ].join(" ");

  const classes = [
    baseClasses,
    variantStyles[variant],
    paddingClass,
    interactiveClasses,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const card = (
    <Component className={classes} {...rest}>
      <div className="relative z-10">{children}</div>
    </Component>
  );

  if (!magnetic) {
    return card;
  }

  return <MagneticArea className="block w-full">{card}</MagneticArea>;
}

export default GlassCard;
