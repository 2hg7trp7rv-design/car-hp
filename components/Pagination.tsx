// components/Pagination.tsx
import TapLink from "@/components/TapLink";

type Props = {
  meta: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  baseUrl: string; // 例: "/news"
};

export default function Pagination({ meta, baseUrl }: Props) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, meta.currentPage - 2);
    let end = Math.min(meta.totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i += 1) {
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
      <TapLink
        href={
          meta.hasPrevPage
            ? `${baseUrl}?page=${meta.currentPage - 1}`
            : `${baseUrl}?page=${meta.currentPage}`
        }
        className={`inline-flex items-center justify-center min-w-[56px] min-h-[40px] px-4 py-2 text-xs tracking-widest touch-manipulation transition-all duration-200 border rounded-full
          ${
            meta.hasPrevPage
              ? "border-slate-200 text-slate-600 hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white"
              : "border-transparent text-slate-300 cursor-not-allowed"
          }`}
      >
        PREV
      </TapLink>

      {/* ページ番号 */}
      <div className="flex items-center space-x-2">
        {getPageNumbers().map((page) => {
          const isActive = page === meta.currentPage;
          return (
            <TapLink
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-full text-xs transition-all duration-200 border touch-manipulation
                ${
                  isActive
                    ? "bg-[#0ABAB5] border-[#0ABAB5] text-white shadow-[0_4px_10px_-2px_rgba(10,186,181,0.4)]"
                    : "bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              {page}
            </TapLink>
          );
        })}
      </div>

      {/* NEXT */}
      <TapLink
        href={
          meta.hasNextPage
            ? `${baseUrl}?page=${meta.currentPage + 1}`
            : `${baseUrl}?page=${meta.currentPage}`
        }
        className={`inline-flex items-center justify-center min-w-[56px] min-h-[40px] px-4 py-2 text-xs tracking-widest touch-manipulation transition-all duration-200 border rounded-full
          ${
            meta.hasNextPage
              ? "border-slate-200 text-slate-600.hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white"
              : "border-transparent text-slate-300 cursor-not-allowed"
          }`}
      >
        NEXT
      </TapLink>
    </nav>
  );
}
