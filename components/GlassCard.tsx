// components/GlassCard.tsx
"use client";

import type {
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
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
   * カードの質感バリエーション
   * - standard: 白ベースの汎用カード
   * - dim: Tiffany系の淡いガラスカード(デフォルト)
   * - crystal: Heroなど強く見せたい場所用のクリスタルカード
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
 * ラグジュアリー・デジタル・ブティックの世界観を支える
 * 汎用ガラスカードコンポーネント。
 * - 新カラーパレット(tiffany・tiffany-dim・vapor/ice・obsidian)対応
 * - 背景グラデーション(bg-card-spot)やshadow-glass系と連携
 * - MagneticAreaによる物理的な「吸い付き」をオプションで付与
 */
export function GlassCard(props: GlassCardProps) {
  const {
    as,
    children,
    padding = "md",
    interactive = false,
    variant = "dim", // デフォルトは最もブティック感の強いdim
    className,
    magnetic = true,
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
      // 白ベースでどこにでも使えるカード
      "bg-white/75",
      "backdrop-blur-lg",
      "border border-white/60",
      "shadow-soft-card",
    ].join(" "),

    dim: [
      // Tiffany系の淡い空気感をまとったカード
      "bg-card-spot", // tailwind.configのbackgroundImage.card-spotを利用
      "bg-origin-border",
      "backdrop-blur-2xl",
      // ボーダーはtiffany-dim系でほんのり色味を付ける
      "border border-tiffany-dim-200/60",
      // ガラスの厚みと奥行き
      "shadow-glass-deep",
      // 上部にうっすら光を入れるグラデーションオーバーレイ
      "relative before:absolute before:inset-0",
      "before:bg-gradient-to-br before:from-white/55 before:via-white/10 before:to-transparent",
      "before:opacity-60 before:pointer-events-none before:rounded-[inherit]",
    ].join(" "),

    crystal: [
      // Hero・特集カード用の強いクリスタル感
      "bg-gradient-to-br from-white/95 via-white/40 to-tiffany-50/30",
      "backdrop-blur-2xl",
      "border border-white/80",
      "shadow-glass-edge shadow-soft-glow",
    ].join(" "),
  };

  const interactiveClasses =
    interactive
      ? [
          "cursor-pointer",
          "transition-transform duration-500 ease-liquid",
          "motion-safe:hover:scale-[1.01]",
          // magnetic=trueのときtransformはMagneticArea側が主に担当するので
          // ここでは軽いscaleのみ付与
        ]
          .filter(Boolean)
          .join(" ")
      : "";

  const baseClasses = [
    "relative",
    "group",
    "overflow-hidden",
    "rounded-3xl",
    // フォーカスリング(アクセシビリティ)
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-tiffany-400/60",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-white/80",
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
      {/* beforeオーバーレイの中身を上に乗せるため relative を維持 */}
      <div className="relative z-10">{children}</div>
    </Component>
  );

  // magnetic=false のカードは従来通りそのまま描画
  if (!magnetic) {
    return card;
  }

  // magnetic=true の場合は MagneticArea で包んで吸い付きインタラクションを付与
  // NOTE: MagneticArea のデフォルト(display: inline-flex)だと、
  // グリッド/レイアウト内でカード幅が内容に合わせて縮むことがあるため、
  // GlassCard はブロック要素として全幅を確保する。
  return <MagneticArea className="block w-full">{card}</MagneticArea>;
}

export default GlassCard;
