// app/cars/[slug]/page.tsx
import Link from "next/link";
import { getCarBySlug } from "@/lib/cars";
import { getNewsByCar, type NewsItem } from "@/lib/news";

type Props = {
  params: { slug: string };
};

// 10分ごとにキャッシュ更新
export const revalidate = 600;

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-500">指定された車種が見つかりませんでした。</p>
          <Link href="/cars" className="text-[#0ABAB5] hover:underline">
            車種一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // エラー原因だった箇所を修正：引数を1つ（車名）だけにしました
  const allRelatedNews = await getNewsByCar(car.name ?? "");
  const relatedNews = allRelatedNews.slice(0, 5); // ここで5件に絞る

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white font-sans pb-20">
      
      {/* ヘッダーエリア */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
           <Link href="/cars" className="text-xs text-slate-400 hover:text-[#0ABAB5] transition-colors">
             &larr; Back to List
           </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-10">
        
        {/* タイトルセクション */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              {car.maker ?? "Unknown"}
            </span>
            {car.releaseYear && (
               <span className="text-slate-400 text-xs font-serif">{car.releaseYear} Model</span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800">
            {car.name}
          </h1>

          {car.difficulty === "advanced" && (
            <p className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[10px] font-semibold border border-purple-100">
              ※ マニアックな解説を含みます
            </p>
          )}
        </header>

        {/* メインコンテンツ：2カラムレイアウト */}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          
          {/* 左カラム：解説テキスト */}
          <div className="space-y-8">
            
            {/* 概要 */}
            <section className="bg-white rounded-2xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
              <h2 className="text-lg font-serif text-slate-700 mb-4 flex items-center">
                <span className="w-1 h-4 bg-[#0ABAB5] mr-3 rounded-full"></span>
                Overview & Character
              </h2>
              {car.summary ? (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {car.summary}
                </p>
              ) : (
                <p className="text-slate-400 text-xs">概要のメモはまだありません。</p>
              )}
              
              {car.changeSummary && (
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Changes</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {car.changeSummary}
                  </p>
                </div>
              )}
            </section>

            {/* 関連ニュース */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif text-slate-700">Related News</h2>
                <Link
                  href={{
                    pathname: "/news",
                    query: { q: car.name ?? undefined },
                  }}
                  className="text-xs text-[#0ABAB5] hover:underline"
                >
                  もっと見る &rarr;
                </Link>
              </div>

              {relatedNews.length === 0 ? (
                <p className="text-xs text-slate-400 bg-white/50 p-4 rounded-xl">
                  この車に関連するニュースはまだありません。
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedNews.map((item) => (
                    <Link
                      key={item.id}
                      href={item.sourceUrl ? encodeURI(item.sourceUrl) : `/news/${item.id}`}
                      target={item.sourceUrl ? "_blank" : "_self"}
                      className="block group bg-white hover:bg-[#F0FCFC] rounded-xl p-4 border border-slate-100 hover:border-[#0ABAB5]/30 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">
                            {item.sourceName ?? "News"}
                          </span>
                          <h4 className="text-sm font-medium text-slate-700 group-hover:text-[#00897B] transition-colors leading-snug">
                             {item.titleJa ?? item.title}
                          </h4>
                        </div>
                        <span className="text-[#0ABAB5] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                          &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 右カラム：スペック・ポイント */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-base font-serif text-slate-700 mb-4">Highlights</h2>
              
              {car.specHighlights ? (
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line mb-6">
                  {car.specHighlights}
                </p>
              ) : (
                 <p className="text-slate-400 text-xs mb-6">情報収集中...</p>
              )}

              <div className="space-y-4">
                <div className="bg-[#F0FCFC] rounded-lg p-4">
                  <h3 className="text-[#00897B] text-xs font-bold mb-2 flex items-center">
                    <span className="text-lg mr-2">✓</span> PROS
                  </h3>
                  <p className="text-slate-600 text-xs whitespace-pre-line">
                    {car.pros ?? "なし"}
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-slate-500 text-xs font-bold mb-2 flex items-center">
                     <span className="text-lg mr-2">−</span> CONS
                  </h3>
                  <p className="text-slate-500 text-xs whitespace-pre-line">
                    {car.cons ?? "なし"}
                  </p>
                </div>
              </div>

              {car.referenceUrl && (
                <a
                  href={car.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 block w-full text-center border border-slate-200 text-slate-500 text-xs py-3 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  公式サイトを見る &rarr;
                </a>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
