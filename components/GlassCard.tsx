import type { ElementType, HTMLAttributes, ReactNode } from "react";

type GlassCardBaseProps = {
  as?: ElementType;
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  /**
   * ガラスの質感バリエーション
   * - standard: 汎用的な白ベースのガラス
   * - dim: tiffany-dimを使用した深みのあるガラス（推奨・デフォルト）
   * - crystal: 透明度が高く、エッジが際立つハイコントラストなガラス
   */
  variant?: "standard" | "dim" | "crystal";
  className?: string;
};

type GlassCardProps = GlassCardBaseProps & HTMLAttributes<HTMLElement>;

/**
 * GlassCard Component Phase 2
 * 
 * 新しいカラーパレット 'tiffany.dim' を活用し、透明感だけでなく
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

  const Component = (as?? "div") as ElementType;

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
  const variantStyles = {
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
      // 微妙なグラデーションオーバーレイで質感をリッチに（疑似要素で表現）
      "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-30 before:pointer-events-none before:rounded-[inherit]",
    ].join(" "),

    crystal: [
      "bg-gradient-to-br from-white/90 via-white/30 to-tiffany-50/20",
      "backdrop-blur-2xl",
      "border border-white/80",
      "shadow-glass-edge",
    ].join(" "),
  };

  const classes =,

    // インタラクティブ時の挙動（Physics-lite）
    interactive && [
      "cursor-pointer",
      "hover:-translate-y-[4px]", // 物理的なリフトアップ
      "hover:scale-[1.005]", // わずかな膨張
      "hover:shadow-soft-stronger", // 影の拡散
      // Dimバリアント特有のホバー効果（光が満ちるような変化）
      variant === "dim" && "hover:bg-tiffany-dim-100/60 hover:border-tiffany-dim-300/60",
      "active:translate-y-[0px] active:scale-[0.99]", // 押し込み時のフィードバック
    ].join(" "),

    // アクセシビリティ：フォーカスリングのカスタマイズ
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tiffany-400",

    className?? "",
  ]
   .filter(Boolean)
   .join(" ");

  return (
    <Component className={classes} {...rest}>
      {/* 光の反射レイヤー（Dimモードのみ） */}
      {variant === "dim" && (
        <div 
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-tiffany-dim-500/5 mix-blend-overlay rounded-[inherit]"
          aria-hidden="true"
        />
      )}
      
      {/* コンテンツレイヤー：z-indexで装飾より上に配置 */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
}

export default GlassCard;
