// app/page.tsx
import Link from 'next/link';
import { getLatestNews } from '@/lib/news';

// ニュースの更新頻度（秒）。10分ごとに再生成
export const revalidate = 600;

/**
 * トップページコンポーネント
 * サーバーコンポーネントとして動作し、データ取得を行います
 */
export default async function Home() {
  // ニュースデータの取得
  const newsItems = await getLatestNews();
  
  // 表示用に最新の6件だけをピックアップ
  const latestNews = newsItems.slice(0, 6);

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white text-slate-700 font-sans">
      {/* ヘッダー/ナビゲーションエリア（簡易版）
        ※本来はlayout.tsxに入れるべきですが、ページ単体の見た目を整えるためここに配置
      */}
      <header className="w-full py-6 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/50">
        <h1 className="text-2xl font-serif tracking-widest text-[#0ABAB5] font-bold">
          CAR BOUTIQUE
        </h1>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-12 pb-10 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-slate-800">
            Driving Elegance.
          </h2>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
            車のニュースと、その先にある物語を。<br />
            静かな時間の中で、愛車との未来を想うための場所です。
          </p>
        </div>
      </section>

      {/* コンテンツエリア */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        
        {/* セクションタイトル: Latest News */}
        <div className="flex items-center mb-6 mt-8">
          <div className="h-px w-8 bg-[#0ABAB5] mr-3"></div>
          <h3 className="text-lg font-serif tracking-wider text-slate-600">LATEST NEWS</h3>
        </div>

        {/* ニュースリスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestNews.map((item, index) => (
            <article 
              key={item.sourceUrl || index} // URLがない場合はindexをキーに（基本はURL推奨）
              className="group bg-white rounded-xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(0,186,181,0.15)] transition-all duration-300 border border-slate-100"
            >
              {/* メタ情報（日付やソース） */}
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span className="bg-[#E0F7FA] text-[#006064] px-2 py-1 rounded-md">
                  {item.sourceName || 'Original'}
                </span>
                {item.publishedAt && (
                  <time>{new Date(item.publishedAt).toLocaleDateString('ja-JP')}</time>
                )}
              </div>

              {/* タイトル（日本語優先 ?? 英語） */}
              <h4 className="text-base font-medium text-slate-700 leading-7 mb-4 group-hover:text-[#0ABAB5] transition-colors">
                <Link 
                  href={item.sourceUrl ? `/news/${encodeURIComponent(item.sourceUrl)}` : `/news/${item.id}`}
                  target={item.sourceUrl ? "_blank" : "_self"}
                  className="block"
                >
                  {item.titleJa ?? item.title}
                </Link>
              </h4>

              {/* リンク矢印装飾 */}
              <div className="flex justify-end">
                <span className="text-[#0ABAB5] text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  Read more &rarr;
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Moreボタン */}
        <div className="mt-12 text-center">
          <Link 
            href="/news" 
            className="inline-block px-8 py-3 rounded-full border border-[#0ABAB5] text-[#0ABAB5] hover:bg-[#0ABAB5] hover:text-white transition-all duration-300 text-sm tracking-widest"
          >
            VIEW ALL NEWS
          </Link>
        </div>
      </div>
      
      {/* フッター（簡易版） */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-white/50">
        <p>&copy; CAR BOUTIQUE. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
