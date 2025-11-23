// components/Pagination.tsx
import Link from "next/link";

type Props = {
  meta: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  baseUrl: string; // "/news" など
};

export default function Pagination({ meta, baseUrl }: Props) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, meta.currentPage - 2);
    let end = Math.min(meta.totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (meta.totalPages <= 1) return null;

  return (
    <nav
      className="mt-20 mb-10 flex justify-center items-center space-x-2 font-serif"
      aria-label="Pagination"
    >
      {/* PREV */}
      <Link
        href={
          meta.hasPrevPage
            ? `${baseUrl}?page=${meta.currentPage - 1}`
            : "#"
        }
        className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-4 py-2 text-xs tracking-widest touch-manipulation transition-all duration-300 border rounded-full
          ${
            meta.hasPrevPage
              ? "border-slate-200 text-slate-600 hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white"
              : "border-transparent text-slate-300 cursor-not-allowed pointer-events-none"
          }`}
      >
        PREV
      </Link>

      {/* ページ番号 */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page) => {
          const isActive = page === meta.currentPage;
          return (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-full text-xs transition-all duration-300 border touch-manipulation
                ${
                  isActive
                    ? "bg-[#0ABAB5] border-[#0ABAB5] text-white shadow-[0_4px_10px_-2px_rgba(10,186,181,0.4)]"
                    : "bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* NEXT */}
      <Link
        href={
          meta.hasNextPage
            ? `${baseUrl}?page=${meta.currentPage + 1}`
            : "#"
        }
        className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-4 py-2 text-xs tracking-widest touch-manipulation transition-all duration-300 border rounded-full
          ${
            meta.hasNextPage
              ? "border-slate-200 text-slate-600 hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white"
              : "border-transparent text-slate-300 cursor-not-allowed pointer-events-none"
          }`}
      >
        NEXT
      </Link>
    </nav>
  );
}
