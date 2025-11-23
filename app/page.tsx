// app/page.tsx
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import TopNewsTabs from "@/components/TopNewsTabs";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  // RSSから最新ニュースを取得
  const allNews = await getLatestNews(12);
  const latest = allNews.slice(0, 3);
  const featured = allNews.slice(3, 9);

  return (
    <main className="min-h-screen">
      {/* 1. ヒーローセクション */}
      <HeroSection />

      {/* 2. LATEST NEWS（NEWS/COLUMN/GUIDE/CARSより上に配置） */}
      <section className="relative z-10 px-4 pt-16 pb-10 md:px-8">
        <div className="mx-auto mb-8 max-w-5xl space-y-3">
          <p className="serif-font text-[11px] uppercase tracking-[0.25em] text-slate-500">
            The Journal
          </p>
          <h2 className="serif-font text-2xl font-bold text-foreground md:text-3xl">
            LATEST NEWS
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            日々のニュースから、少しディープな話題まで。
            静かな時間に、気になるトピックだけさっと追えるダイジェストです。
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* ここが最新ニュースタブ。カードを押すと /news/[id] に飛ぶ */}
          <TopNewsTabs latest={latest} featured={featured} />
        </div>
      </section>

      {/* 3. NEWS/COLUMN/GUIDE/CARS への入口カード */}
      <CategorySection />
    </main>
  );
}
