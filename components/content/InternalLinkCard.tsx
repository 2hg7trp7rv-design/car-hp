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
      return "GUIDE";
    case "COLUMN":
      return "COLUMN";
    case "CARS":
      return "CARS";
    case "HERITAGE":
      return "HERITAGE";
    default:
      return "LINK";
  }
}

export function InternalLinkCard({ href, title, kind, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-white/15 bg-black/25 p-4 shadow-soft backdrop-blur",
        "transition hover:-translate-y-[1px] hover:border-[#0ABAB5]/35",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-white/60">
            {badgeLabel(kind)}
          </p>
          <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-[1.55] text-white group-hover:text-[#0ABAB5]">
            {title}
          </p>
        </div>

        <span className="mt-1 shrink-0 text-white/45 group-hover:text-[#0ABAB5]" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}
