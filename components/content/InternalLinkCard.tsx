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
      return "border-l-[#0ABAB5] bg-white hover:border-[#0ABAB5]/45";
    case "COLUMN":
      return "border-l-[#006E6B] bg-white hover:border-[#006E6B]/45";
    default:
      return "border-l-[#9A6C00] bg-white hover:border-[#9A6C00]/45";
  }
}

function worldBadge(kind: InternalLinkKind): string {
  switch (kind) {
    case "GUIDE":
      return "bg-[#E7F8F7] text-[#006E6B]";
    case "COLUMN":
      return "bg-[#E3F5F3] text-[#005E5B]";
    default:
      return "bg-[#FFF8E6] text-[#7A5A14]";
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
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E7F8F7] text-[16px] text-[#006E6B] transition group-hover:translate-x-[2px] group-hover:bg-[#006E6B] group-hover:text-white"
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
        "hover:-translate-y-[1px] hover:border-[rgba(10,186,181,0.34)] hover:bg-[rgba(251,248,243,0.96)]",
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
