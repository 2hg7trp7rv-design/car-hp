import Link from "next/link";

import { cn } from "@/lib/utils";
import type { InternalLinkKind } from "@/lib/content/internal-link-index";

type Props = {
  href: string;
  title: string;
  kind: InternalLinkKind;
  className?: string;
  variant?: "default" | "cbjWorld";
};

function badgeLabel(kind: InternalLinkKind): string {
  switch (kind) {
    case "GUIDE":
      return "ガイド";
    case "COLUMN":
      return "コラム";
    default:
      return "関連ページ";
  }
}

function worldAccent(kind: InternalLinkKind): string {
  switch (kind) {
    case "GUIDE":
      return "border-l-[#26A69A] bg-white hover:border-[#26A69A]/45";
    case "COLUMN":
      return "border-l-[#FF4081] bg-white hover:border-[#FF4081]/45";
    default:
      return "border-l-[#FF8C42] bg-white hover:border-[#FF8C42]/45";
  }
}

function worldBadge(kind: InternalLinkKind): string {
  switch (kind) {
    case "GUIDE":
      return "bg-[#E8F5F3] text-[#168F84]";
    case "COLUMN":
      return "bg-[#FFF0F3] text-[#E63170]";
    default:
      return "bg-[#FFF3E9] text-[#E8752E]";
  }
}

export function InternalLinkCard({ href, title, kind, className, variant = "default" }: Props) {
  if (variant === "cbjWorld") {
    return (
      <Link
        href={href}
        className={cn(
          "group block overflow-hidden rounded-[18px] border border-[#E8DDD0] border-l-[4px] p-[15px_14px] shadow-[0_5px_18px_rgba(72,50,34,0.05)] transition duration-200",
          "hover:-translate-y-[2px] hover:shadow-[0_10px_24px_rgba(72,50,34,0.09)]",
          worldAccent(kind),
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]", worldBadge(kind))}>
            {badgeLabel(kind)}
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-bold leading-[1.65] text-[#2D2D2D] sm:text-[14px]">
            {title}
          </p>
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF3E9] text-[16px] text-[#FF8C42] transition group-hover:translate-x-[2px] group-hover:bg-[#FF8C42] group-hover:text-white"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.88)] p-4 shadow-soft-card transition",
        "hover:-translate-y-[1px] hover:border-[rgba(122,135,108,0.32)] hover:bg-[rgba(251,248,243,0.96)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
            {badgeLabel(kind)}
          </p>
          <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-[1.6] text-[var(--text-primary)] group-hover:text-[var(--accent-strong)]">
            {title}
          </p>
        </div>

        <span className="mt-1 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--accent-strong)]" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}
