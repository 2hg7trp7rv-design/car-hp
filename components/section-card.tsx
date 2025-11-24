// components/section-card.tsx

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  label: string;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

export function SectionCard({
  label,
  title,
  description,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[32px] bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur border border-white/60 sm:p-8",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 serif-font">
        {label}
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
        {description}
      </p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
