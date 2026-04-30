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
        "group overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] shadow-soft-card",
        className,
      )}
    >
      <summary
        className={cn(
          "cb-tap flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(27,63,229,0.4)]",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <p className="text-[14px] text-[var(--text-primary)]">目次</p>

        <span className="inline-flex shrink-0 items-center gap-2 text-[10px] tracking-[0.22em] text-[var(--accent-strong)]">
          <span className="group-open:hidden">開く</span>
          <span className="hidden group-open:inline">閉じる</span>
          <span className="inline-block transition-transform duration-300 group-open:rotate-180">▾</span>
        </span>
      </summary>

      <div className="mx-6 h-px bg-[rgba(14,12,10,0.08)]" />

      <nav aria-label={ariaLabel ?? "ページ内目次"}>
        {items.map((h, idx) => {
          const last = idx === items.length - 1;
          return (
            <div key={h.id || `${idx}`}>
              <Link
                href={`#${h.id}`}
                className={cn(
                  "cb-tap flex items-center justify-between gap-4 px-6 py-4 transition-colors",
                  "hover:bg-[rgba(238,231,222,0.62)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(27,63,229,0.4)]",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] tracking-[0.22em] text-[var(--text-tertiary)]">
                      {chapterNo(idx)}.
                    </span>
                    <span className="line-clamp-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                      {h.title}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.22em] text-[var(--accent-strong)]">読む →</span>
              </Link>
              {!last ? <div className="mx-6 h-px bg-[rgba(14,12,10,0.08)]" /> : null}
            </div>
          );
        })}
      </nav>
    </details>
  );

  if (!sticky) return body;

  return <div>{body}</div>;
}
