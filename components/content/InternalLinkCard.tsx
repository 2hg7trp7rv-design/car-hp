import Link from "next/link";

import { cn } from "@/lib/utils";
import type { InternalLinkKind } from "@/lib/content/internal-link-index";

type Props = {
  href: string;
  title: string;
  kind: InternalLinkKind;
  className?: string;
};

function badgeLabel(kind: InternalLinkKind): string {
  switch (kind) {
    case "GUIDE":
      return "ガイド";
    case "COLUMN":
      return "視点";
    case "CARS":
      return "車種";
    case "HERITAGE":
      return "系譜";
    default:
      return "関連ページ";
  }
}

export function InternalLinkCard({ href, title, kind, className }: Props) {
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
