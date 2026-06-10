import Link from "next/link";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
  tone?: "paper" | "light" | "dark";
};

export function Breadcrumb({ items, className, tone = "paper" }: Props) {
  if (!items || items.length === 0) return null;

  const palette =
    tone === "light"
      ? {
          baseText: "text-[rgba(251,248,243,0.76)]",
          lastText: "text-[rgba(251,248,243,0.94)]",
          sepText: "text-[rgba(251,248,243,0.38)]",
          hoverText: "hover:text-[rgba(251,248,243,1)]",
        }
      : tone === "dark"
        ? {
            baseText: "text-[var(--text-secondary)]",
            lastText: "text-[var(--text-primary)]",
            sepText: "text-[rgba(31,28,25,0.24)]",
            hoverText: "hover:text-[var(--accent-strong)]",
          }
        : {
            baseText: "text-[var(--text-tertiary)]",
            lastText: "text-[var(--text-secondary)]",
            sepText: "text-[rgba(31,28,25,0.20)]",
            hoverText: "hover:text-[var(--text-primary)]",
          };

  return (
    <nav
      aria-label="パンくずリスト"
      className={cn(
        "cb-font-sans flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] tracking-[0.22em]",
        palette.baseText,
        className,
      )}
    >
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        const content = it.href && !isLast ? (
          <Link href={it.href} className={cn("transition-colors duration-120", palette.hoverText)}>
            {it.label}
          </Link>
        ) : (
          <span className={cn(isLast ? palette.lastText : "")}>{it.label}</span>
        );

        return (
          <span key={`${it.label}-${idx}`} className="inline-flex items-center">
            {content}
            {!isLast ? <span className={cn("mx-2", palette.sepText)}>·</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
