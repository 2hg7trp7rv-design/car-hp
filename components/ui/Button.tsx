// components/ui/Button.tsx
"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "default" | "lg" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

function getVariantClasses(variant: Variant): string {
  switch (variant) {
    case "primary":
      return [
        "bg-tiffany-500",
        "text-white",
        "shadow-soft-strong",
        "hover:bg-tiffany-600",
        "hover:shadow-soft-stronger",
        "active:translate-y-[1px]",
      ].join(" ");
    case "secondary":
      return [
        "bg-white/80",
        "text-slate-900",
        "border",
        "border-white/80",
        "shadow-soft-card",
        "hover:bg-white",
        "hover:shadow-soft-strong",
      ].join(" ");
    case "outline":
      return [
        "border",
        "border-tiffany-400",
        "bg-transparent",
        "text-tiffany-600",
        "hover:bg-tiffany-50/70",
      ].join(" ");
    case "ghost":
    default:
      return [
        "bg-transparent",
        "text-slate-900",
        "hover:bg-slate-900/5",
      ].join(" ");
  }
}

function getSizeClasses(size: Size): string {
  switch (size) {
    case "lg":
      return "h-11 px-6 text-sm";
    case "sm":
      return "h-8 px-3 text-xs";
    case "default":
    default:
      return "h-10 px-4 text-xs sm:text-sm";
  }
}

/**
 * ラグジュアリーサイト用ボタン
 * ・丸み強め
 * ・字間広め
 * ・フォントは本文用サンセリフを想定
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "default",
    asChild = false,
    className,
    children,
    ...rest
  } = props;

  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "font-medium",
    "tracking-[0.16em]",
    "uppercase",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-tiffany-400",
    "focus-visible:ring-offset-background",
    getVariantClasses(variant),
    getSizeClasses(size),
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...child.props,
      className: [baseClasses, child.props.className ?? ""]
        .filter(Boolean)
        .join(" "),
    });
  }

  return (
    <button type={rest.type ?? "button"} className={baseClasses} {...rest}>
      {children}
    </button>
  );
}

export default Button;
