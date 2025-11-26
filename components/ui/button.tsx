"use client";

import * as React from "react";
import { useRef } from "react";

// バリエーション定義：Phase 2のデザインシステムに準拠
type Variant = "primary" | "secondary" | "outline" | "ghost" | "tiffany";
type Size = "default" | "lg" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  magnetic?: boolean; // 新機能：マグネティック効果の有効化スイッチ
  fullWidth?: boolean;
}

/**
 * Phase 2 Luxury Button
 * 
 * 機能：
 * 1. Magnetic Logic: MobileMenuから移植・最適化された物理演算ロジック。
 *    useRefによる直接DOM操作を行い、60fpsのパフォーマンスを確保。
 * 2. Liquid Fill: ホバー時に背景が液体のように満ちるアニメーション。
 * 3. Tactile Feedback: クリック時の微細なスケールダウン。
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "default",
    asChild = false,
    magnetic = true, // デフォルトで有効化（ラグジュアリー体験のため）
    fullWidth = false,
    className,
    children,
   ...rest
  } = props;

  // DOMへの直接アクセスのためのRef（Re-render回避のため）
  const buttonRef = useRef<HTMLButtonElement>(null);

  // マウス移動時の物理演算ハンドラ
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic ||!buttonRef.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = buttonRef.current.getBoundingClientRect();
    
    // 中心座標の計算
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // カーソルと中心のデルタ（差分）を計算
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // 物理定数の適用
    // 係数0.35: カーソルへの追従強度（低いほど重く、遅れる）
    // 範囲制限: ボタンが枠外に行き過ぎないよう、移動距離自体は制限しないが
    // 係数によって自然に減衰される設計とする。
    const moveX = deltaX * 0.35;
    const moveY = deltaY * 0.35;

    // Direct DOM Manipulation: Reactの仮想DOMを介さず直接スタイルを更新
    // これにより、マウスイベントごとの高負荷なレンダリングを防ぐ
    buttonRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  // マウスが離れた時のリセット処理
  const handleMouseLeave = () => {
    if (!magnetic ||!buttonRef.current) return;
    
    // transformをリセット。CSSのtransitionプロパティにより、
    // 瞬時ではなく「バネのように」滑らかに元の位置に戻る
    buttonRef.current.style.transform = `translate(0px, 0px)`;
  };

  // クラス名の生成
  const baseClasses = [
    "relative group isolate", // isolate: スタッキングコンテキストの分離
    "inline-flex items-center justify-center",
    "overflow-hidden rounded-full", // 完全な円形（Pill shape）
    "font-medium tracking-[0.16em] uppercase",
    // ベースのアニメーション定義（物理演算以外のプロパティ用）
    // マウスリーブ時の復帰アニメーションもこれが担当する
    "transition-all duration-300 ease-out", 
    
    // アクセシビリティ
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-tiffany-400",
    
    // クリック時の触覚フィードバック
    "active:scale-[0.96]",
    
    fullWidth? "w-full" : "",
    getSizeClasses(size),
    getVariantClasses(variant),
    className?? "",
  ]
   .filter(Boolean)
   .join(" ");

  return (
    <button
      ref={buttonRef}
      type={rest.type?? "button"}
      className={baseClasses}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {/* 
        Liquid Fill Layer (リキッドフィル層)
        テキストの背面（z-index: -10）に配置し、group-hoverで拡大する。
        bg-white/20 などの半透明色を使うことで、元の背景色と混ざり合う。
      */}
      <span className="absolute inset-0 -z-10 block overflow-hidden rounded-full pointer-events-none">
        <span 
          className="absolute inset-0 block origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-y-100" 
        />
      </span>

      {/* コンテンツ層：リキッドフィルの上に表示 */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}

// --- スタイルヘルパー関数 ---

function getVariantClasses(variant: Variant): string {
  // リキッドフィルの色は、親要素のvariantに応じて動的に決定する
  // [&>span>span]: リキッド層のセレクタ
  switch (variant) {
    case "primary":
      return [
        "bg-tiffany-500 text-white shadow-soft-strong",
        "hover:shadow-soft-stronger",
        "[&>span>span]:bg-tiffany-600", // ホバー時に少し濃い色が満ちる
      ].join(" ");
    case "tiffany":
      return [
        "bg-tiffany-dim-100 text-tiffany-700 border border-tiffany-dim-200",
        "hover:border-tiffany-dim-300",
        "[&>span>span]:bg-white/50", 
      ].join(" ");
    case "secondary":
      return [
        "bg-white/80 text-slate-900 border border-white/80 shadow-soft-card",
        "hover:shadow-soft-strong",
        "[&>span>span]:bg-tiffany-50", 
      ].join(" ");
    case "outline":
      return [
        "bg-transparent text-slate-900",
        "border border-slate-300",
        "hover:border-tiffany-500 hover:text-tiffany-600",
        "[&>span>span]:bg-tiffany-50/50",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent text-slate-600",
        "hover:text-slate-900",
        "[&>span>span]:bg-slate-100",
      ].join(" ");
    default:
      return "";
  }
}

function getSizeClasses(size: Size): string {
  switch (size) {
    case "lg":
      // ラグジュアリーサイトではタップ領域を大きめに取る
      return "h-14 px-8 text-sm"; 
    case "sm":
      return "h-9 px-4 text-[10px]";
    case "default":
      return "h-11 px-6 text-xs sm:text-sm";
  }
}

export default Button;
