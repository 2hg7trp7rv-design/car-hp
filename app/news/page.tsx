// app/news/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "NEWS | Automotive Journal",
  description: "編集部が厳選した自動車ニュースのキュレーション。要約と視点を添えて。",
};

type Props = {
  searchParams?: {
    q?: string;
    category?: string;
    maker?: string;
  };
};

function normalizeText(value: string | undefined | null): string {
  return (value?? "").trim().toLowerCase();
}

export default async function NewsPage({ searchParams }: Props) {
  const q = normalizeText(searchParams?.q);
  const categoryFilter = (searchParams?.category?? "").trim();
  const makerFilter = (searchParams?.maker?? "").trim();

  // ニュースデータの取得（件数は多めに取得してフィルタリング）
  const items = await getLatestNews(80);

  // フィルタリングロジック
  const filtered = items.filter((item) => {
    if (q) {
      const haystack = `${item.title} ${item.titleJa?? ""} ${item.excerpt?? ""} ${item.maker?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (categoryFilter && item.category!== categoryFilter) return false;
    if (makerFilter && item.maker!== makerFilter) return false;
    return true;
  });

  // フィルター用の一意な値リスト抽出
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string;
  const makers = Array.from(new Set(items.map((i) => i.maker).filter(Boolean))) as string;

  // 最初の1件をHero、残りをリスト表示用に分割
  const heroNews = filtered;
  const feedNews = filtered.slice(1);

  return (
    <main className="min-h-screen bg-site text-slate-900 pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ヘッダー & フィルターエリア */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
             <Reveal>
               <p className="text-[10px] uppercase tracking-[0.32em] text-tiffany-600">
                 The Journal
               </p>
             </Reveal>
             <Reveal delay={80}>
               <h1 className="serif-heading text-4xl text-slate-900 md:text-5xl">
                 Latest <span className="italic text-slate-400">Dispatch</span>
               </h1>
             </Reveal>
          </div>

          <Reveal delay={150} className="w-full lg:w-auto">
             <form className="flex flex-col gap-2 sm:flex-row">
                {/* 検索入力 */}
                <input 
                  name="q" 
                  placeholder="見出しを検索..." 
                  defaultValue={searchParams?.q}
                  className="rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-xs outline-none focus:border-tiffany-400 focus:bg-white"
                />
                {/* カテゴリ選択 */}
                <select name="category" defaultValue={categoryFilter} className="rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-xs outline-none">
                   <option value="">全てのカテゴリ</option>
                   {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {/* 送信ボタン */}
                <button type="submit" className="rounded-full bg-slate-900 px-6 py-2 text-[10px] font-bold tracking-widest text-white transition-colors hover:bg-tiffany-600">
                  FILTER
                </button>
             </form>
          </Reveal>
        </header>

        {filtered.length === 0? (
           <div className="py-20 text-center text-sm text-slate-500">記事が見つかりませんでした。</div>
        ) : (
          <>
            {/* HERO NEWS ITEM (1件目) */}
            <Reveal className="mb-12">
               <Link href={`/news/${encodeURIComponent(heroNews.id)}`}>
                 <GlassCard padding="lg" interactive className="group relative overflow-hidden bg-white">
                    {/* 背景装飾 */}
                    <div className="absolute right-0 top-0 p-6 opacity-10">
                       <span className="serif-heading text-9xl text-slate-900">01</span>
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row">
                       <div className="space-y-4 md:w-3/4">
                          <div className="flex items-center gap-3">
                             <span className="rounded-full bg-tiffany-50 px-2 py-1 text-[9px] font-bold tracking-widest text-tiffany-600">
                               {heroNews.category |

| "HEADLINE"}
                             </span>
                             <span className="text-[10px] text-slate-400">{heroNews.publishedAt?.split('T')}</span>
                          </div>
                          
                          <h2 className="serif-heading text-2xl text-slate-900 transition-colors group-hover:text-tiffany-600 md:text-3xl">
                             {heroNews.titleJa |

| heroNews.title}
                          </h2>
                          
                          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                             {heroNews.excerpt |

| "記事の詳細を読むにはクリックしてください。"}
                          </p>
                          
                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-900 transition-transform group-hover:translate-x-2">
                             READ ARTICLE →
                          </div>
                       </div>
                    </div>
                 </GlassCard>
               </Link>
            </Reveal>

            {/* FEED LIST (Staggered Animation - 2件目以降) */}
            <div className="space-y-4">
               {feedNews.map((item, index) => (
                 <Reveal key={item.id} delay={index * 50}>
                   <NewsListItem item={item} />
                 </Reveal>
               ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// リストアイテム用サブコンポーネント
function NewsListItem({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${encodeURIComponent(item.id)}`}>
      <article className="group flex items-center justify-between rounded-xl border border-transparent bg-white/60 p-5 transition hover:border-slate-200 hover:bg-white hover:shadow-soft-card">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-slate-400">
               {item.maker && <span className="text-tiffany-600">{item.maker}</span>}
               <span>/</span>
               <span>{item.publishedAt?.split('T')}</span>
            </div>
            <h3 className="font-serif text-lg text-slate-800 transition-colors group-hover:text-tiffany-600">
               {item.titleJa |

| item.title}
            </h3>
            {item.excerpt && (
               <p className="line-clamp-1 text-xs text-slate-500 md:hidden">
                  {item.excerpt}
               </p>
            )}
         </div>
         <div className="hidden pl-8 text-[10px] font-bold tracking-widest text-slate-300 md:block group-hover:text-tiffany-400">
            READ
         </div>
      </article>
    </Link>
  );
}
