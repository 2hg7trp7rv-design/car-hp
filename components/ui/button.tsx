"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "subtle"
  | "glass";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /**
   * ブランド用ボタンバリアント
   * - primary: Tiffany アクセント
   * - secondary: Obsidian ダーク
   * - outline: 白ベースの枠線ボタン
   * - ghost: ほぼ背景と同化する幽霊ボタン
   * - subtle: ごく淡いハイライト
   * - glass: ガラスっぽい透過ボタン
   */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * カーソルに軽く吸い付くマグネット挙動
   */
  magnetic?: boolean;
}

const baseClassName =
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-full",
    "font-medium",
    "uppercase",
    "tracking-[0.18em]",
    "whitespace-nowrap",
    "transition-all duration-normal ease-magnetic",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-tiffany-400",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "select-none",
  ].join(" ");

const variantClassName: Record<ButtonVariant, string> = {
  primary: [
    "bg-tiffany-500 text-white",
    "shadow-soft-strong",
    "hover:bg-tiffany-400 hover:shadow-glow",
    "active:scale-[0.97]",
  ].join(" "),
  secondary: [
    "bg-slate-900 text-white",
    "shadow-soft",
    "hover:bg-slate-800",
    "active:scale-[0.97]",
  ].join(" "),
  outline: [
    "border border-slate-300",
    "bg-white/80 text-slate-900",
    "hover:border-tiffany-400 hover:bg-white",
    "active:scale-[0.97]",
  ].join(" "),
  ghost: [
    "bg-transparent text-slate-900",
    "hover:bg-slate-100/70",
    "active:bg-slate-200/70",
  ].join(" "),
  subtle: [
    "border border-tiffany-dim-100",
    "bg-tiffany-dim-50/90 text-slate-900",
    "hover:bg-tiffany-dim-100/90 hover:border-tiffany-200",
    "shadow-soft-card",
  ].join(" "),
  glass: [
    "border border-white/60",
    "bg-white/15 text-slate-900",
    "backdrop-blur-md",
    "shadow-glass-deep",
    "hover:bg-white/25 hover:border-tiffany-200",
  ].join(" "),
};

const sizeClassName: Record<ButtonSize, string> = {
  xs: "h-8 px-4 text-[9px]",
  sm: "h-9 px-5 text-[10px]",
  md: "h-10 px-6 text-[10px]",
  lg: "h-11 px-7 text-[11px]",
  icon: "h-10 w-10 p-0 text-[10px]",
};

/**
 * マグネット用のラッパー。
 * Button 本体ではなくラッパー要素を軽く動かして、スケール系の transform と干渉しないようにしている。
 */
function MagneticWrapper({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [style, setStyle] = React.useState<React.CSSProperties | undefined>();

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);

    const strength = 0.18; // 吸い付く強さ（0.1〜0.25くらいで調整）
    const translateX = (relX / rect.width) * 12 * strength;
    const translateY = (relY / rect.height) * 12 * strength;

    setStyle({
      transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
      transition: "transform 120ms cubic-bezier(0.35, 0, 0.65, 1)",
    });
  };

  const handleMouseLeave = () => {
    if (!enabled) return;
    setStyle({
      transform: "translate3d(0, 0, 0)",
      transition: "transform 200ms cubic-bezier(0.35, 0, 0.65, 1)",
    });
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <span
      ref={ref}
      style={style}
      className="inline-flex"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </span>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      magnetic = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const composedClassName = cn(
      baseClassName,
      variantClassName[variant],
      sizeClassName[size],
      className,
    );

    const isMagneticEnabled = magnetic && !disabled;

    const button = (
      <Comp
        className={composedClassName}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );

    return (
      <MagneticWrapper enabled={isMagneticEnabled}>{button}</MagneticWrapper>
    );
  },
);

Button.displayName = "Button";
