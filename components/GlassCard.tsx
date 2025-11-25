// components/GlassCard.tsx
import type { ReactNode, ElementType } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function GlassCard({
  children,
  className,
  as: Tag = "div",
}: GlassCardProps) {
  const baseClass =
    "relative overflow-hidden rounded-3xl border border-white/15 " +
    "bg-white/10 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.35)]";

  return (
    <Tag className={`${baseClass} ${className ?? ""}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
      >
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.55),_transparent_60%)]" />
        <div className="absolute -bottom-32 -right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(186,230,253,0.45),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,0.08),rgba(15,23,42,0.24))]" />
      </div>
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
