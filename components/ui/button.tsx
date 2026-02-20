// components/ui/button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { MagneticArea } from "@/components/ui/magnetic-area";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden",
    "rounded-full border text-[11px] font-semibold uppercase tracking-[0.18em]",
    "transition-all duration-300 ease-magnetic",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tiffany-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-60",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // Tiffany Gradient CTA（新トップページ/LP用）
        tiffany: [
          "border-transparent text-white",
          "bg-[linear-gradient(135deg,_#0ABAB5_0%,_#058e8a_100%)]",
          "shadow-[0_10px_30px_rgba(10,186,181,0.28)]",
          "hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(10,186,181,0.35)]",
          "active:translate-y-[0px] active:scale-[0.98]",
          // 光のスイープ
          "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-[120%] before:rounded-full",
          "before:bg-[linear-gradient(90deg,_transparent,_rgba(255,255,255,0.28),_transparent)]",
          "before:transition-transform before:duration-700 before:ease-liquid",
          "hover:before:translate-x-[120%]",
        ].join(" "),
        // メインCTA：Obsidianベース + Tiffanyの“光”
        primary: [
          "border-transparent bg-obsidian text-white shadow-soft-card",
          "hover:-translate-y-[1px] hover:shadow-soft-strong active:translate-y-[0px] active:scale-[0.98]",
          // 内部からゆっくり広がる光（擬似要素）
          "before:pointer-events-none before:absolute before:inset-0 before:translate-y-[120%] before:rounded-full",
          "before:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.34),_transparent_60%)]",
          "before:opacity-0 before:transition-transform before:duration-500 before:ease-liquid",
          "hover:before:translate-y-[0%] hover:before:opacity-100",
        ].join(" "),
        // 枠線あり、薄い背景：フィルターやサブCTAに
        outline: [
          "border-slate-300 bg-white/80 text-slate-900 shadow-soft",
          "hover:border-tiffany-300 hover:bg-white hover:shadow-soft-card",
          "active:translate-y-[0px] active:scale-[0.98]",
        ].join(" "),
        // ほぼ背景になじむ、控えめなボタン
        subtle: [
          "border-transparent bg-slate-100/80 text-slate-800 shadow-none",
          "hover:bg-slate-50 hover:shadow-soft",
          "active:bg-slate-200/80",
        ].join(" "),
        // 背景ガラス：Heroやダーク背景上のCTA用
        glass: [
          "border-white/50 bg-white/10 text-white shadow-soft-glow backdrop-blur-md",
          "hover:bg-white/16 hover:shadow-soft-strong",
          "active:bg-white/20",
        ].join(" "),
        // 背景色なし、テキストリンク風
        ghost: [
          "border-transparent bg-transparent text-slate-700",
          "hover:bg-slate-100/70 hover:text-slate-900",
        ].join(" "),
        link: [
          "border-transparent bg-transparent px-0 py-0 text-[11px] font-semibold tracking-[0.18em]",
          "text-tiffany-700 underline-offset-4 hover:underline",
          "shadow-none",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-3 text-[10px]",
        sm: "h-8 px-3.5 text-[10px]",
        md: "h-9 px-4 text-[11px]",
        lg: "h-10 px-5 text-[11px] sm:h-11 sm:px-6",
        icon: "h-9 w-9 p-0",
      },
      // 反転配色などを今後足したくなったとき用
      tone: {
        default: "",
        inverted: "bg-white text-obsidian",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      tone: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * MagenticArea で包むかどうか。
   * true の場合、hover中にカーソル方向へごく控えめに吸い付く。
   */
  magnetic?: boolean;
  /**
   * アイコンのみボタンなどで使う場合に true を指定。
   * （見た目は size="icon" + 適宜children で十分なことが多いので任意）
   */
  iconOnly?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tone,
      fullWidth,
      asChild = false,
      magnetic = true,
      iconOnly,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const buttonNode = (
      <Comp
        className={cn(
          buttonVariants({ variant, size, tone, fullWidth }),
          iconOnly && "px-0",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );

    // magnetic=false の既存ボタンはそのまま
    if (!magnetic) return buttonNode;

    // magnetic=true のときは MagneticArea でラップ
    return <MagneticArea>{buttonNode}</MagneticArea>;
  },
);

Button.displayName = "Button";
