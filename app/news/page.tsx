// app/news/page.tsx
import Link from "next/link";
import { getPaginatedNews } from "@/lib/news";
import Pagination from "@/components/Pagination";

// 1時間ごとに再検証（unstable_cache側でも制御していますが、念のため）
export const revalidate = 3600;

type Props = {
  searchParams?: {
    page?: string;
  };
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function NewsPage({ searchParams }: Props) {
  // ページ番号の取得（デフォルトは1）
  const currentPage = Number(searchParams?.page) || 1;
  
  // ページネーションデータの取得
  const { items, meta } = await getPaginatedNews(currentPage);

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pb-20">
      
      {/* ヘッダーエリア */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
           <Link href="/" className="text-xs font-bold tracking-widest text-[#0ABAB5]">
             CAR BOUTIQUE
           </Link>
           <span className="text-[10px] text-slate-400 uppercase tracking-widest">Journal</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-12">
        
        {/* ページタイトル */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-slate-800">
            The Journal
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-serif">
            日々のニュースから、時代を超えて愛される名車まで。<br/>
            静かな時間の中で読み解く、車とライフスタイルの物語。
          </p>
        </header>

        {/* ニュースリスト */}
        <section>
          {items.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-serif">
              記事が見つかりませんでした。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.sourceUrl ? encodeURI(item.sourceUrl) : `/news/${item.id}`}
                  target={item.sourceUrl ? "_blank" : "_self"}
                  className="group bg-white rounded-xl p-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(0,186,181,0.15)] transition-all duration-300 border border-slate-50 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-3">
                     <span className="bg-[#E0F7FA] text-[#006064] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                        {item.sourceName || 'ORIGINAL'}
                     </span>
                     <span className="text-[10px] text-slate-400 font-serif">
                       {formatDate(item.publishedAt)}
                     </span>
                  </div>

                  <h3 className="text-base font-medium text-slate-700 group-hover:text-[#0ABAB5] transition-colors mb-3 line-clamp-2 leading-relaxed font-serif">
                    {item.titleJa ?? item.title}
                  </h3>

                  {item.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-grow">
                      {item.excerpt}
                    </p>
                  )}
                  
                  <div className="flex justify-end mt-auto">
                    <span className="text-[10px] font-bold text-[#0ABAB5] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                      Read Story &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ページネーションコンポーネントの配置 */}
          <Pagination meta={meta} baseUrl="/news" />
        </section>
      </div>
    </main>
  );
}
