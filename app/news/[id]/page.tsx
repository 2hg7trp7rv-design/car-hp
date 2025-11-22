// app/news/[id]/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { getNewsById, getLatestNews, type NewsItem } from "@/lib/news";

type Props = {
  params: { id: string };
};

// SEO: 動的にメタデータを生成する関数
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getNewsById(params.id);
  
  if (!item) {
    return {
      title: "記事が見つかりません | CAR BOUTIQUE",
    };
  }

  const title = item.titleJa ?? item.title;
  const description = item.excerpt ?? "車のニュースと、その先にある物語を。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      siteName: "CAR BOUTIQUE",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const item = await getNewsById(params.id);
  
  // 関連記事用（同じカテゴリの最新記事を取得し、自分自身は除外）
  const allNews = await getLatestNews();
  const relatedNews = item 
    ? allNews
        .filter(n => n.category === item.category && n.id !== item.id)
        .slice(0, 3) 
    : [];

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <p className="text-slate-500 font-serif">指定されたニュースが見つかりませんでした。</p>
          <Link href="/news" className="text-[#0ABAB5] hover:underline">
            ニュース一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

    const displayTitle = item.titleJa ?? item.title;
  const dateLabel = new Date(item.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const isExternal = item.type === "external";

  // 構造化データ(JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: displayTitle,
    ...(item.coverImage ? { image: [item.coverImage] } : {}),
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    author: {
      "@type": "Organization",
      name: item.sourceName ?? "CAR BOUTIQUE",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE",
      logo: {
        "@type": "ImageObject",
        url: "https://car-hp.vercel.app/icon.png",
      },
    },
  };
  

    return (
    <main className="min-h-screen bg-gradient-to-r from-[#D1F2EB] via-[#E8F8F5] to-white pb-20 font-sans">
      {/* ヘッダーエリア */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
        {/* ...既存そのまま... */}
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-10">
        {/* JSON-LD構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* 記事ヘッダー */}
        <header className="space-y-6 mb-10 text-center">
          {/* ここから下は既存のまま */}
          <div className="flex flex-wrap justify-center gap-3">
             <span className="bg-[#E0F7FA] text-[#006064] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
               {item.sourceName}
             </span>
             {item.category && (
               <span className="bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] tracking-wide">
                 {item.category}
               </span>
             )}
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-medium text-slate-800 leading-snug">
            {displayTitle}
          </h1>

          <time className="block text-xs text-slate-400 font-serif">
            {dateLabel}
          </time>
        </header>

        {/* 記事本文エリア */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
          
          {/* リード文 (excerpt) */}
          {item.excerpt && (
            <div className="mb-8 pb-8 border-b border-slate-100">
              <p className="text-sm md:text-base leading-relaxed text-slate-600 font-medium">
                {item.excerpt}
              </p>
            </div>
          )}

          {/* 本文 (Originalの場合) or 外部リンク (Externalの場合) */}
          {item.type === "original" && item.content ? (
            <div className="space-y-6 text-sm md:text-base leading-loose text-slate-700 whitespace-pre-line font-serif">
              {item.content}
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                この記事の詳細は、配信元のサイトでお読みいただけます。<br/>
                <span className="text-xs text-slate-400">（外部サイトへ移動します）</span>
              </p>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-[#0ABAB5] text-white px-8 py-4 rounded-full text-sm font-bold tracking-widest hover:bg-[#009688] hover:shadow-lg transition-all duration-300"
              >
                READ FULL STORY
              </a>
            </div>
          )}

          {/* SNSシェアボタン */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mb-4">Share this story</p>
            <div className="flex justify-center gap-4">
              {/* X (Twitter) */}
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(`https://car-hp.vercel.app/news/${item.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold">X</span>
              </a>
              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://car-hp.vercel.app/news/${item.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              {/* LINE */}
              <a 
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`https://car-hp.vercel.app/news/${item.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#06C755] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-xs font-bold">L</span>
              </a>
            </div>
          </div>
        </div>

        {/* 関連記事レコメンド */}
        {relatedNews.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center mb-6">
               <div className="h-px flex-1 bg-slate-300/50"></div>
               <span className="px-4 text-xs text-slate-500 font-serif tracking-widest uppercase">Related Stories</span>
               <div className="h-px flex-1 bg-slate-300/50"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {relatedNews.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/news/${related.id}`}
                  className="block bg-white p-4 rounded-xl border border-slate-100 hover:border-[#0ABAB5] hover:shadow-md transition-all duration-300 group"
                >
                  <span className="text-[10px] text-[#0ABAB5] font-bold uppercase tracking-wide block mb-2">
                    {related.category ?? "News"}
                  </span>
                  <h4 className="text-xs font-medium text-slate-700 leading-relaxed group-hover:text-[#0ABAB5] line-clamp-3">
                    {related.titleJa ?? related.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}

      </article>
    </main>
  );
}
