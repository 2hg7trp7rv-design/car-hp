// app/news/page.tsx
import Link from "next/link";
import { getLatestNews, type NewsItem } from "@/lib/news";

// 10分ごとに更新
export const revalidate = 600;

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

export default async function NewsPage() {
  const items = await getLatestNews();

  // 記事がない場合の表示
  if (!items || items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-serif text-slate-700 mb-4">Journal</h1>
          <p className="text-sm text-slate-500">ニュースはまだありません。</p>
        </div>
      </main>
    );
  }

  const [lead, ...rest] = items;

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

        {/* トップニュース（一番新しい記事） */}
        <section>
          <Link
            href={lead.sourceUrl ? encodeURI(lead.sourceUrl) : `/news/${lead.id}`}
            target={lead.sourceUrl ? "_blank" : "_self"}
            className="group relative block overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 border border-white"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* 左側：装飾的な背景エリア */}
              <div className="bg-slate-900 h-64 md:h-auto relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#0ABAB5]/20 to-slate-900 z-0"></div>
                 <span className="relative z-10 text-white/20 font-serif text-6xl italic">Latest</span>
              </div>

              {/* 右側：テキスト情報 */}
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#E0F7FA] text-[#006064] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    {lead.sourceName}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatDate(lead.publishedAt)}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-serif font-medium text-slate-800 group-hover:text-[#0ABAB5] transition-colors leading-snug">
                  {lead.titleJa ?? lead.title}
                </h2>
                
                {lead.excerpt && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {lead.excerpt}
                  </p>
                )}

                <div className="pt-4">
                  <span className="text-xs font-bold text-[#0ABAB5] border-b border-[#0ABAB5] pb-0.5">
                    READ STORY
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ニュースリスト（2列レイアウト） */}
        <section>
          <div className="flex items-center mb-8">
             <div className="h-px flex-1 bg-slate-200"></div>
             <span className="px-4 text-xs text-slate-400 font-serif tracking-widest uppercase">Latest Updates</span>
             <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((item) => (
              <Link
                key={item.id}
                href={item.sourceUrl ? encodeURI(item.sourceUrl) : `/news/${item.id}`}
                target={item.sourceUrl ? "_blank" : "_self"}
                className="group bg-white rounded-xl p-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(0,186,181,0.15)] transition-all duration-300 border border-slate-50"
              >
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                     {item.sourceName}
                   </span>
                   <span className="text-[10px] text-slate-300">
                     {formatDate(item.publishedAt)}
                   </span>
                </div>

                <h3 className="text-base font-medium text-slate-700 group-hover:text-[#0ABAB5] transition-colors mb-3 line-clamp-2 leading-relaxed">
                  {item.titleJa ?? item.title}
                </h3>

                {item.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
