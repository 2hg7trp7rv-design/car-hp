import Link from "next/link";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
  tone?: "dark" | "light";
};

export function Breadcrumb({ items, className, tone = "dark" }: Props) {
  if (!items || items.length === 0) return null;

  const isLight = tone === "light";
  const baseText = isLight ? "text-white/70" : "text-[#222222]/55";
  const lastText = isLight ? "text-white/90" : "text-[#222222]/45";
  const sepText = isLight ? "text-white/35" : "text-[#222222]/25";
  const hoverText = isLight ? "hover:text-white" : "hover:text-[#0ABAB5]";

  return (
    <nav
      aria-label="パンくずリスト"
      className={cn(
        "cb-font-sans flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] tracking-[0.22em]",
        baseText,
        className,
      )}
    >
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        const content = it.href && !isLast ? (
          <Link href={it.href} className={hoverText}>
            {it.label}
          </Link>
        ) : (
          <span className={cn(isLast ? lastText : "")}>{it.label}</span>
        );

        return (
          <span key={`${it.label}-${idx}`} className="inline-flex items-center">
            {content}
            {!isLast && <span className={cn("mx-2", sepText)}>·</span>}
          </span>
        );
      })}
    </nav>
  );
}
