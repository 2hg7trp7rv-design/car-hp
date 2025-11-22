// components/Pagination.tsx
import Link from 'next/link';

type Props = {
  meta: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  baseUrl: string; // 例: '/news'
};

export default function Pagination({ meta, baseUrl }: Props) {
  // 表示するページ番号を計算（現在ページの前後を表示）
  const getPageNumbers = () => {
    const pages = [];
    // 簡易的に全ページ出すか、数が多い場合は省略ロジックを入れる
    // ここではシンプルに最大5ページ分を表示するロジック例
    let start = Math.max(1, meta.currentPage - 2);
    let end = Math.min(meta.totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (meta.totalPages <= 1) return null;

  return (
    <nav className="mt-20 mb-10 flex justify-center items-center space-x-2 font-serif" aria-label="Pagination">
      {/* PREV BUTTON */}
      <Link
        href={meta.hasPrevPage ? `${baseUrl}?page=${meta.currentPage - 1}` : '#'}
        className={`px-4 py-2 text-xs tracking-widest transition-all duration-300 border rounded-full
          ${meta.hasPrevPage 
           ? 'border-slate-200 text-slate-600 hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white' 
           : 'border-transparent text-slate-300 cursor-not-allowed pointer-events-none'}`}
      >
        PREV
      </Link>

      {/* PAGE NUMBERS */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page) => {
          const isActive = page === meta.currentPage;
          return (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-all duration-300 border
                ${isActive
                 ? 'bg-[#0ABAB5] border-[#0ABAB5] text-white shadow-[0_4px_10px_-2px_rgba(10,186,181,0.4)]'
                 : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* NEXT BUTTON */}
      <Link
        href={meta.hasNextPage ? `${baseUrl}?page=${meta.currentPage + 1}` : '#'}
        className={`px-4 py-2 text-xs tracking-widest transition-all duration-300 border rounded-full
          ${meta.hasNextPage 
           ? 'border-slate-200 text-slate-600 hover:border-[#0ABAB5] hover:text-[#0ABAB5] bg-white' 
           : 'border-transparent text-slate-300 cursor-not-allowed pointer-events-none'}`}
      >
        NEXT
      </Link>
    </nav>
  );
}
