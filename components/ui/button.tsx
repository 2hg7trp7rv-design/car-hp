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
    "rounded-[16px] border text-[12px] font-medium tracking-[0.04em]",
    "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(122,135,108,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-stage)]",
    "disabled:pointer-events-none disabled:opacity-60",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        tiffany: [
          "border-transparent bg-[var(--accent-base)] text-[var(--bg-stage)]",
          "hover:bg-[var(--accent-strong)] hover:text-[var(--bg-stage)]",
          "active:scale-[0.99]",
        ].join(" "),
        primary: [
          "border-transparent bg-[var(--text-primary)] text-[var(--bg-stage)]",
          "hover:bg-[#34302c] hover:text-[var(--bg-stage)]",
          "active:scale-[0.99]",
        ].join(" "),
        outline: [
          "border-[var(--border-default)] bg-transparent text-[var(--text-primary)]",
          "hover:border-[rgba(122,135,108,0.45)] hover:bg-[var(--surface-2)]",
          "active:scale-[0.99]",
        ].join(" "),
        subtle: [
          "border-transparent bg-[var(--surface-2)] text-[var(--text-primary)]",
          "hover:bg-[var(--surface-3)]",
          "active:scale-[0.99]",
        ].join(" "),
        surface: [
          "border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-primary)]",
          "hover:bg-[var(--surface-2)]",
          "active:scale-[0.99]",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-[var(--text-tertiary)]",
          "hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
        ].join(" "),
        link: [
          "border-transparent bg-transparent px-0 py-0 text-[12px] font-medium tracking-[0.04em]",
          "text-[var(--accent-strong)] underline-offset-4 hover:text-[var(--accent-base)] hover:underline",
          "shadow-none",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-3",
        sm: "h-8 px-3.5",
        md: "h-10 px-4.5",
        lg: "h-11 px-6 sm:h-12 sm:px-7",
        icon: "h-10 w-10 p-0",
      },
      tone: {
        default: "",
        inverted: "bg-[var(--bg-stage)] text-[var(--text-primary)]",
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
  magnetic?: boolean;
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
      magnetic = false,
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

    if (!magnetic) return buttonNode;

    return <MagneticArea strength={8}>{buttonNode}</MagneticArea>;
  },
);

Button.displayName = "Button";
