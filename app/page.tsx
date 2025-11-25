// app/page.tsx
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { getLatestNews } from "@/lib/news";

export default async function HomePage() {
  // ニュースデータを取得
  const allNews = await getLatestNews(40);

  const latest = allNews.slice(0, 6);
  const featured = allNews
    .filter((item) => item.isFeatured)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 1. ヒーロー（画像＋キャッチコピー） */}
      <HeroSection />

      {/* 2. LATEST NEWS セクション */}
      <section className="mx-auto mb-16 mt-4 max-w-5xl px-4 sm:mt-10 sm:px-6">
        <header className="mb-4 sm:mb-6">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            THE JOURNAL
          </p>
          <h2 className="font-display-serif mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            LATEST NEWS
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-sm">
            日々のニュースを、少しだけ丁寧に要約して。静かな時間に、気になるトピックだけさっと追えるダイジェストです。
          </p>
        </header>

        <div className="rounded-3xl border border-white/80 bg-white/80 p-3 shadow-soft backdrop-blur-md sm:p-4">
          {/* 最新ニュースタブ */}
          {/* latest=新着, featured=注目ニュース */}
          {/* TopNewsTabs コンポーネントは既存のものを利用 */}
         
          <TopNewsTabsWrapper latest={latest} featured={featured} />
        </div>

        <div className="mt-3 text-right">
          <Link
            href="/news"
            className="text-[11px] text-text-sub underline-offset-4 hover:text-text-main hover:underline"
          >
            ニュース一覧へ
          </Link>
        </div>
      </section>

      {/* 3. Bento Grid セクション */}
      <section className="mx-auto mb-16 max-w-5xl px-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
              THE JOURNAL
            </p>
            <h2 className="font-display-serif mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              CAR BOUTIQUEのメインコンテンツ
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-sm">
              ニュースも、コラムも、車種データも。ラグジュアリーなデジタルブティックの中を、
              小さな「弁当箱」レイアウトでひと目で見渡せるようにまとめました。
            </p>
          </div>
        </div>

        {/* NEWS / COLUMN / GUIDE / CARS のBento Grid */}
        <CategorySection />
      </section>
    </main>
  );
}

/**
 * TopNewsTabs はクライアントコンポーネントなので、
 * ラッパーを分けて読み込む
 */
import dynamic from "next/dynamic";
const TopNewsTabs = dynamic(() => import("@/components/TopNewsTabs"), {
  ssr: false,
});

type TopNewsTabsWrapperProps = {
  latest: Awaited<ReturnType<typeof getLatestNews>>;
  featured: Awaited<ReturnType<typeof getLatestNews>>;
};

function TopNewsTabsWrapper({ latest, featured }: TopNewsTabsWrapperProps) {
  return <TopNewsTabs latest={latest} featured={featured} />;
}
