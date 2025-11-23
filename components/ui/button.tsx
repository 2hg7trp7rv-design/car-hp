// components/ui/button.tsx
import * as React from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "default" | "lg" | "sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

function getVariantClasses(variant: Variant): string {
  switch (variant) {
    case "outline":
      return [
        "border-2",
        "border-tiffany-400",
        "text-tiffany-600",
        "bg-white",
        "hover:bg-tiffany-50",
        "hover:text-tiffany-700",
        "hover:border-tiffany-500",
        "shadow-[0_4px_14px_0_rgba(129,216,208,0.2)]",
        "hover:shadow-[0_6px_20px_rgba(129,216,208,0.3)]",
      ].join(" ");
    case "ghost":
      return [
        "border",
        "border-transparent",
        "bg-transparent",
        "text-foreground",
        "hover:bg-slate-100",
      ].join(" ");
    case "default":
    default:
      return [
        "border",
        "border-transparent",
        "bg-tiffany-500",
        "text-white",
        "hover:bg-tiffany-600",
        "shadow-soft",
      ].join(" ");
  }
}

function getSizeClasses(size: Size): string {
  switch (size) {
    case "lg":
      return "px-10 py-3 text-sm md:text-base";
    case "sm":
      return "px-3 py-1.5 text-xs";
    case "default":
    default:
      return "px-4 py-2 text-sm";
  }
}

export function Button(props: ButtonProps) {
  const {
    variant = "default",
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
    "tracking-widest",
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
    return React.cloneElement(children as React.ReactElement, {
      className: [baseClasses, (children as any).props?.className ?? ""]
        .filter(Boolean)
        .join(" "),
    });
  }

  return (
    <button type="button" className={baseClasses} {...rest}>
      {children}
    </button>
  );
}
