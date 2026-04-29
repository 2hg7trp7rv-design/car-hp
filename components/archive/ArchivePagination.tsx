import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (_page: number) => string;
  className?: string;
};

function buildPages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  const out: Array<number | "ellipsis"> = [];
  const windowPages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  for (let i = 1; i <= totalPages; i += 1) {
    if (i >= currentPage - 1 && i <= currentPage + 1) windowPages.add(i);
    if (totalPages <= 7 || windowPages.has(i)) out.push(i);
  }

  const compact: Array<number | "ellipsis"> = [];
  for (let i = 0; i < out.length; i += 1) {
    const current = out[i];
    const prev = out[i - 1];
    if (typeof current === "number" && typeof prev === "number" && current - prev > 1) {
      compact.push("ellipsis");
    }
    compact.push(current);
  }

  return compact;
}

export function ArchivePagination({ currentPage, totalPages, hrefForPage, className }: Props) {
  if (totalPages <= 1) return null;

  const items = buildPages(currentPage, totalPages);

  return (
    <nav
      aria-label="ページネーション"
      className={["flex flex-wrap items-center justify-center gap-1.5", className ?? ""].join(" ")}
    >
      <Link
        href={hrefForPage(Math.max(1, currentPage - 1))}
        rel="nofollow"
        aria-disabled={currentPage === 1}
        className={[
          "inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-medium transition",
          currentPage === 1
            ? "cursor-not-allowed border-[var(--border-default)] text-[rgba(107,101,93,0.5)]"
            : "border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] text-[var(--text-secondary)] hover:border-[rgba(27,63,229,0.3)] hover:text-[var(--accent-strong)]",
        ].join(" ")}
      >
        前へ
      </Link>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-[var(--text-tertiary)]">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            rel="nofollow"
            aria-current={item === currentPage ? "page" : undefined}
            className={[
              "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-[11px] font-medium transition",
              item === currentPage
                ? "border-[rgba(27,63,229,0.2)] bg-[var(--accent-subtle)] text-[var(--accent-strong)]"
                : "border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] text-[var(--text-secondary)] hover:border-[rgba(27,63,229,0.3)] hover:text-[var(--accent-strong)]",
            ].join(" ")}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={hrefForPage(Math.min(totalPages, currentPage + 1))}
        rel="nofollow"
        aria-disabled={currentPage === totalPages}
        className={[
          "inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-medium transition",
          currentPage === totalPages
            ? "cursor-not-allowed border-[var(--border-default)] text-[rgba(107,101,93,0.5)]"
            : "border-[var(--border-default)] bg-[rgba(251,248,243,0.9)] text-[var(--text-secondary)] hover:border-[rgba(27,63,229,0.3)] hover:text-[var(--accent-strong)]",
        ].join(" ")}
      >
        次へ
      </Link>
    </nav>
  );
}
