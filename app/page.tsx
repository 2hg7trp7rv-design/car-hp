// app/page.tsx
import Link from "next/link";
import TopNewsTabs from "@/components/TopNewsTabs";
import TapLink from "@/components/TapLink";
import { getAllNewsCached } from "@/lib/news";

// ニュースの更新頻度（秒） 10分ごとに再生成
export const revalidate = 600;

export default async function Home() {
  const allNews = await getAllNewsCached();

  const latestForTabs = allNews.slice(0, 3);
  const featuredForTabs = allNews.slice(0, 3); // ひとまず同じ集合を使用

  const latestNews = allNews.slice(0, 6);

  return (
    <main className="min-h-screen font-sans">
      {/* ヒーローセクション（フルスクリーン画像） */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-sedan.jpg')" }}
      >
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-slate-900/40 z-0" />

        {/* ヘッダー */}
        <header className="absolute top-0 w-full py-6 px-6 flex.items-center justify-between z-20 border-b border-white/20">
          <h1 className="text-2xl font-serif tracking-widest text-white font-bold">
            CAR BOUTIQUE
          </h1>
        </header>

        {/* テキストコンテンツ */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 drop-shadow-lg">
            Driving Elegance.
          </h2>
          <p className="text-lg md:text-xl font-medium leading-relaxed drop-shadow-md">
            車のニュースと、その先にある物語を。<br />
            静かな時間の中で、愛車との未来を想うための場所です。
          </p>
        </div>
      </section>

      {/* コンテンツエリア */}
      <div className="bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pt-10 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* ヒーロー直下のタブ付きニュース（最新3件/注目3件） */}
          {allNews.length > 0 && (
            <div className="mb-12">
              <TopNewsTabs latest={latestForTabs} featured={featuredForTabs} />
            </div>
          )}

          {/* セクションタイトル: Latest News */}
          <div className="flex items-center mb-8">
            <div className="h-px w-10 bg-[#0ABAB5] mr-4" />
            <h3 className="text-xl font-serif tracking-wider text-slate-600">
              LATEST NEWS
            </h3>
          </div>

          {latestNews.length === 0 ? (
            <p className="text-sm text-slate-500 font-serif">
              まだニュースを取得できていません。
            </p>
          ) : (
            <>
              {/* ニュースリスト */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestNews.map((item, index) => (
                  <article
                    key={item.sourceUrl || item.id || index}
                    className="group bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,186,181,0.2)] transition-all duration-300 border border-slate-50"
                  >
                    {/* メタ情報 */}
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
                      <span className="bg-[#E0F7FA] text-[#00796B] px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                        {item.sourceName || "Original"}
                      </span>
                      {item.publishedAt && (
                        <time className="font-light">
                          {new Date(item.publishedAt).toLocaleDateString(
                            "ja-JP",
                          )}
                        </time>
                      )}
                    </div>

                    {/* タイトル */}
                    <h4 className="text-lg font-bold text-slate-800 leading-8 mb-6 group-hover:text-[#0ABAB5] transition-colors line-clamp-3">
                      <Link
                        href={
                          item.sourceUrl
                            ? encodeURI(item.sourceUrl)
                            : `/news/${item.id}`
                        }
                        target={item.sourceUrl ? "_blank" : "_self"}
                        className="block"
                      >
                        {item.titleJa ?? item.title}
                      </Link>
                    </h4>

                    {/* リンク矢印装飾 */}
                    <div className="flex justify-end">
                      <span className="flex items-center text-[#0ABAB5] text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all.duration-300">
                        Read more
                        <span className="ml-2.text-lg">→</span>
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* VIEW ALL NEWS ボタン（TapLink版） */}
              <div className="mt-12 flex justify-center">
                <TapLink
                  href="/news"
                  className="inline-flex items-center justify-center min-w-[220px] min-h-[48px] rounded-full border border-[#0ABAB5] bg-white text-sm font-semibold tracking-[0.2em] text-[#0ABAB5] touch-manipulation shadow-[0_6px_20px_-8px_rgba(10,186,181,0.6)] hover:bg-[#0ABAB5] hover:text-white hover:shadow-[0_12px_35px_-12px_rgba(10,186,181,0.8)] transition-all duration-300 uppercase"
                >
                  VIEW ALL NEWS
                </TapLink>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
