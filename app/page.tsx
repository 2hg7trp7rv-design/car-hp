// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars } from "@/lib/cars";
import { getAllColumns } from "@/lib/columns";
import { getLatestNews, type NewsItem } from "@/lib/news";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export default async function HomePage() {
  const [cars, columns, news] = await Promise.all([
    getAllCars(),
    getAllColumns(),
    getLatestNews(16),
  ]);

  const carsCount = cars.length;
  const columnsCount = columns.length;
  const newsCount = news.length;

  const latestNews: NewsItem[] = news.slice(0, 4);

  const latestNewsDateRaw =
    news
      .map((n) => n.publishedAt ?? n.createdAt)
      .filter((v): v is string => Boolean(v))
      .sort()
      .reverse()[0] ?? "";

  const latestNewsDateLabel = formatDate(latestNewsDateRaw);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
      {/* ヒーローセクション */}
      <HeroSection />

      {/* ダッシュボード的入口エリア */}
      <section className="mt-16 space-y-4">
        <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              DASHBOARD
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              このサイトでできること
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
              NEWS、COLUMN、GUIDE、CARSの4つを軸に、
              「気になるニュースから深掘り」「車種ページから現実的な維持のイメージ」
              まで行き来しやすいようにまとめています。
            </p>
          </div>
          <div className="text-[11px] text-text-sub">
            <p>ニュースとコラム、車種ページは少しずつ増やしていきます。</p>
            {latestNewsDateLabel && (
              <p className="mt-1">
                最新ニュース更新日
                <span className="ml-1 font-medium text-slate-900">
                  {latestNewsDateLabel}
                </span>
              </p>
            )}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* NEWS */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                NEWS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                主要メーカーとメディアのニュースをダイジェストで
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                国内メーカー発表や国内外メディアの記事をRSSで取得し、
                タイトルと要約、出典を整理して一覧できます。
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-text-sub">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                記事数{newsCount}
              </span>
              <Link
                href="/news"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                ニュース一覧へ
              </Link>
            </div>
          </GlassCard>

          {/* COLUMN */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                COLUMN
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                オーナー目線の本音ストーリーと技術解説
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                体験記、トラブルや修理、ブランドや技術の話など、
                ニュースの先にある「物語」をじっくり読めるエリアです。
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-text-sub">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                コラム数{columnsCount}
              </span>
              <Link
                href="/column"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>
          </GlassCard>

          {/* GUIDE */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              GUIDE
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                買い方と維持費、家計とのバランスを整える
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                輸入車の買い方、維持費の内訳、保険やローン、
                「直すか手放すか」の判断軸などを整理する実用ガイドです。
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-text-sub">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                準備中
              </span>
              <Link
                href="/guide"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                GUIDEページへ
              </Link>
            </div>
          </GlassCard>

          {/* CARS */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                CARS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                一台ずつ、スペックと「性格」を整理した車種データベース
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                スペックだけでなく、長所短所や維持費感、トラブル傾向まで
                将来の比較機能を見据えて少しずつ整理していきます。
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-text-sub">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                車種数{carsCount}
              </span>
              <Link
                href="/cars"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 最新ニュースダイジェスト */}
      <section className="mt-16 space-y-4">
        <header className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              LATEST NEWS
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              いま押さえておきたいニュース
            </h2>
          </div>
          <Link
            href="/news"
            className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
          >
            すべてのニュースを見る
          </Link>
        </header>

        {latestNews.length === 0 ? (
          <p className="text-sm text-text-sub">
            まだニュースが登録されていません。RSS連携後にここにダイジェストを表示します。
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {latestNews.map((item) => {
              const title = item.titleJa || item.title;
              const sourceName = item.sourceName ?? "EXTERNAL";
              const dateLabel = formatDate(item.publishedAt);

              return (
                <GlassCard
                  key={item.id}
                  as="article"
                  interactive
                  className="flex h-full flex-col p-4 sm:p-5"
                >
                  <Link href={`/news/${item.id}`} className="block h-full">
                    <div className="flex h-full flex-col gap-2">
                      <p className="font-body-light text-[10px] tracking-[0.25em] text-brand-tiffanySoft">
                        {item.category || "NEWS"}
                      </p>
                      <h3 className="text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                        {title}
                      </h3>
                      {item.excerpt && (
                        <p className="line-clamp-3 text-xs leading-relaxed text-text-sub">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-[11px] text-text-sub">
                        <span>{sourceName}</span>
                        <span>{dateLabel}</span>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
