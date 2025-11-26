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
 * interactive=true のときはホバー/タップでふわっと浮かせる
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
    // ベース形状
    "relative overflow-hidden rounded-2xl border border-white/70",
    // ガラス感
    "bg-white/80 backdrop-blur-xl",
    // 影
    "shadow-soft-card",
    // アニメーション基礎
    "transform-gpu transition-all duration-200 ease-out",
    "motion-reduce:transform-none motion-reduce:transition-none",
    paddingClass,
    // インタラクション時のふわっと浮く/押し込まれる動き
    interactive &&
      [
        "hover:-translate-y-[3px] hover:scale-[1.01] hover:shadow-soft-strong",
        "focus-visible:-translate-y-[3px] focus-visible:scale-[1.01]",
        "active:translate-y-[0px] active:scale-[0.99]",
      ].join(" "),
    // フォーカスリング
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tiffany-400",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {/* ガラス面の微妙なグラデーションレイヤー */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/65 via-white/40 to-tiffany-50/45 opacity-90" />
      {/* コンテンツ */}
      <div className="relative z-[1]">{children}</div>
    </Component>
  );
}

export default GlassCard;
