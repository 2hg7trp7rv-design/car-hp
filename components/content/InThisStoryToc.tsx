import Link from "next/link";

import { cn } from "@/lib/utils";

export type InThisStoryItem = {
  id: string;
  title: string;
};

type Props = {
  items: InThisStoryItem[];
  /**
   * 画面上部に追従させたい場合。
   * - cars 詳細で使っている体験を、guide / heritage にも合わせる。
   */
  sticky?: boolean;
  className?: string;
  ariaLabel?: string;
};

function chapterNo(idx: number) {
  return String(idx + 1).padStart(2, "0");
}

export function InThisStoryToc({ items, sticky = false, className, ariaLabel }: Props) {
  if (!Array.isArray(items) || items.length <= 1) return null;

  const body = (
    <details
      className={cn(
        "group overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur",
        className,
      )}
    >
      <summary
        className={cn(
          "cb-tap flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0ABAB5]/50",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <div>
          <p className="text-[10px] tracking-[0.22em] text-white/60">IN THIS STORY</p>
          <p className="mt-1 text-[13px] text-white/90">目次</p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 text-[10px] tracking-[0.22em] text-[#0ABAB5]">
          <span className="group-open:hidden">VIEW</span>
          <span className="hidden group-open:inline">MINI</span>
          <span className="inline-block transition-transform duration-300 group-open:rotate-180">▾</span>
        </span>
      </summary>

      <div className="mx-6 h-px bg-white/10" />

      <nav aria-label={ariaLabel ?? "ページ内目次"}>
        {items.map((h, idx) => {
          const last = idx === items.length - 1;
          return (
            <div key={h.id || `${idx}`}>
              <Link
                href={`#${h.id}`}
                className={cn(
                  "cb-tap flex items-center justify-between gap-4 px-6 py-4",
                  "transition-colors",
                  "hover:bg-white/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0ABAB5]/50",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] tracking-[0.22em] text-white/55">CHAPTER {chapterNo(idx)}</span>
                    <span className="line-clamp-2 text-[13px] text-white/90">{h.title}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.22em] text-[#0ABAB5]">VIEW</span>
              </Link>
              {!last ? <div className="mx-6 h-px bg-white/10" /> : null}
            </div>
          );
        })}
      </nav>
    </details>
  );

  if (!sticky) return body;

  return <div className="sticky top-16 z-40">{body}</div>;
}
