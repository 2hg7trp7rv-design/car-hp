// components/GlassCard.tsx
"use client";

import type {
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";

type Padding = "none" | "sm" | "md" | "lg";
type Variant = "standard" | "dim" | "crystal";

type GlassCardBaseProps = {
  as?: ElementType;
  children: ReactNode;
  padding?: Padding;
  interactive?: boolean;
  variant?: Variant;
  className?: string;
};

type GlassCardProps = GlassCardBaseProps & HTMLAttributes<HTMLElement>;

/**
 * GlassCard Component Phase 2
 *
 * 新しいカラーパレット 'tiffany-dim' を活用し、透明感だけでなく
 * 「物質としての奥行き」を表現したカードコンポーネント。
 * インタラクティブモードでは、物理的な浮遊感をシミュレートする。
 */
export function GlassCard(props: GlassCardProps) {
  const {
    as,
    children,
    padding = "md",
    interactive = false,
    variant = "dim", // Phase 2では dim を標準とします
    className,
    ...rest
  } = props;

  const Component = (as ?? "div") as ElementType;

  // パディングの定義
  const paddingClass =
    padding === "none"
      ? "p-0"
      : padding === "sm"
      ? "p-3 sm:p-4"
      : padding === "lg"
      ? "p-6 sm:p-8"
      : "p-4 sm:p-5";

  // バリアントごとのスタイル定義（デザインシステムの中核）
  const variantStyles: Record<Variant, string> = {
    standard: [
      "bg-white/70",
      "backdrop-blur-lg",
      "border border-white/60",
      "shadow-soft-card",
    ].join(" "),

    dim: [
      // 背景色：tiffany-dim-100をベースに、わずかに透けさせる
      "bg-tiffany-dim-100/40",
      // ブラー：強めにかけることで、背景のノイズを消し、高級感を出す
      "backdrop-blur-xl",
      // ボーダー：単色ではなく、光の反射を意識した色（dim-200）
      "border border-tiffany-dim-200/50",
      // 影：ガラスの厚みを表現するインナーシャドウ + 落ち影
      "shadow-glass-deep",
      // 微妙なグラデーションオーバーレイで質感をリッチに
      "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-30 before:pointer-events-none before:rounded-[inherit]",
    ].join(" "),

    crystal: [
      "bg-gradient-to-br from-white/90 via-white/30 to-tiffany-50/20",
      "backdrop-blur-2xl",
      "border border-white/80",
      "shadow-glass-edge",
    ].join(" "),
  };

  const interactiveClasses = interactive
    ? [
        "cursor-pointer",
        "transition-transform duration-500",
        "hover:-translate-y-[2px]",
      ].join(" ")
    : "";

  const baseClasses = [
    "relative",
    "overflow-hidden",
    "rounded-3xl",
    "border",
    "bg-white/60",
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

  return (
    <Component className={classes} {...rest}>
      {/* beforeオーバーレイの中身を上に乗せるため relative を維持 */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}

export default GlassCard;
