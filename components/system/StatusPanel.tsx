import type { ReactNode } from "react";

import { SeedPoster } from "@/components/visual/SeedPoster";
import { cn } from "@/lib/utils";

type Variant = "car" | "guide" | "column" | "heritage" | "generic" | "news";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  variant?: Variant;
  seedKey?: string;
  note?: string;
  children?: ReactNode;
  className?: string;
};

export function StatusPanel({
  kicker,
  title,
  lead,
  variant = "generic",
  seedKey,
  note,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "porcelain porcelain-panel mx-auto max-w-2xl rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] p-6 text-[var(--text-primary)] shadow-soft-card backdrop-blur sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="w-full shrink-0 sm:w-44">
          <div className="overflow-hidden rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] border border-[var(--border-default)]">
            <SeedPoster
              seedKey={seedKey ?? title}
              variant={variant === "news" ? "generic" : variant}
              className="h-auto w-full"
              decorative
            />
          </div>

          <p className="mt-3 text-[10px] tracking-[0.18em] text-[rgba(107,101,93,0.7)]">
            STATUS POSTER
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">{kicker}</p>

          <h1 className="cb-sans-heading mt-4 text-[22px] tracking-[0.08em] text-[var(--text-primary)] sm:text-[30px]">
            {title}
          </h1>

          <p className="cb-lead mt-3 text-[rgba(76,69,61,0.88)]">{lead}</p>

          {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}

          {note ? (
            <p className="mt-8 text-[11px] tracking-[0.18em] text-[rgba(107,101,93,0.88)]">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
