// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE | クルマのニュースとストーリー",
  description:
    "ニュースとコラム、そして車種データベースをラグジュアリーなUIで楽しめるCAR BOUTIQUE。",
};

export default async function HomePage() {
  const [newsItems, cars, columns] = await Promise.all([
    getLatestNews(6),
    getAllCars(),
    getAllColumns(),
  ]);

  const latestNews: NewsItem[] = newsItems.slice(0, 4);
  const featuredCars: CarItem[] = cars.slice(0, 3);
  const latestColumns: ColumnItem[] = columns.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12 lg:px-8">
      <section className="section-y pb-10">
        <HeroSection />
      </section>

      {/* このサイトでできること（ダッシュボード） */}
      <section className="section-y pt-4">
        <header className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              OVERVIEW
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              このサイトでできること
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
              ニュースをきっかけに、コラムで深掘りし、CARSページで車種を整理する。
              クルマとの距離を少しずつ縮めていくための、ラグジュアリーな「ガレージ兼ライブラリ」です。
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard as="article" interactive className="h-full">
            <div className="flex h-full flex-col">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                NEWS
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                メーカー発表やメディア記事を、編集付きでチェック
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                国内メーカーのニュースから、主要メディアの記事まで。
                見出しと要約、軽いコメントを添えて、「ざっと流し見」しやすい形で整理していきます。
              </p>
              <div className="mt-4">
                <Link
                  href="/news"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  ニュース一覧を見る
                </Link>
              </div>
            </div>
          </GlassCard>

          <GlassCard as="article" interactive className="h-full">
            <div className="flex h-full flex-col">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                COLUMN
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                オーナー本音やトラブル実録を、ゆっくり読む
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                ちょっと濃いめのオーナー体験や、修理・維持費のリアル、
                技術・歴史のストーリーなどを、ニュースとは別軸で読み物として蓄えていきます。
              </p>
              <div className="mt-4">
                <Link
                  href="/column"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  コラム一覧を見る
                </Link>
              </div>
            </div>
          </GlassCard>

          <GlassCard as="article" interactive className="h-full">
            <div className="flex h-full flex-col">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                CARS / GUIDE
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                気になる一台を、スペックと暮らし目線で整理
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                車種ページでは、スペックに加えて長所短所や維持費感、トラブル傾向も含めて「一枚のカード」に。
                GUIDEでは買い方や維持費の考え方など、お金周りもフラットに扱います。
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                <Link
                  href="/cars"
                  className="font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  CARS一覧を見る
                </Link>
                <Link
                  href="/guide"
                  className="font-medium text-text-sub underline-offset-4 hover:underline"
                >
                  GUIDEを読む
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 最新ニュース */}
      <section className="section-y">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              LATEST NEWS
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              最新ニュースダイジェスト
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline sm:inline"
          >
            すべてのニュースを見る
          </Link>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {latestNews.map((item) => {
            const title = item.titleJa || item.title;
            const sourceName = item.sourceName ?? "EXTERNAL";

            return (
              <GlassCard
                key={item.id}
                as="article"
                interactive
                className="h-full"
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
                    </div>
                  </div>
                </Link>
              </GlassCard>
            );
          })}

          {latestNews.length === 0 && (
            <p className="text-sm text-text-sub">
              まだニュースが登録されていません。準備中です。
            </p>
          )}
        </div>

        <div className="mt-4 sm:hidden">
          <Link
            href="/news"
            className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
          >
            すべてのニュースを見る
          </Link>
        </div>
      </section>

      {/* 注目のCARS＋新着コラム */}
      <section className="section-y">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                  CARS
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  注目のCARS
                </h2>
              </div>
              <Link
                href="/cars"
                className="hidden text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline sm:inline"
              >
                CARS一覧を見る
              </Link>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              {featuredCars.map((car) => (
                <GlassCard
                  key={car.id}
                  as="article"
                  interactive
                  className="h-full"
                >
                  <Link
                    href={`/cars/${car.slug}`}
                    className="block h-full"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-text-sub">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                          {car.maker}
                        </span>
                        {car.releaseYear && (
                          <span>{car.releaseYear}年頃</span>
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                        {car.name}
                      </h3>
                      {car.summary && (
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-sub">
                          {car.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              ))}

              {featuredCars.length === 0 && (
                <p className="text-sm text-text-sub">
                  まだ車種データが登録されていません。順次追加していきます。
                </p>
              )}
            </div>

            <div className="mt-4 sm:hidden">
              <Link
                href="/cars"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧を見る
              </Link>
            </div>
          </div>

          <div>
            <header className="mb-4">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                COLUMN
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                新着コラム
              </h2>
            </header>

            <div className="space-y-3">
              {latestColumns.map((col) => (
                <GlassCard
                  key={col.id}
                  as="article"
                  padding="sm"
                  interactive
                  className="h-full"
                >
                  <Link
                    href={`/column/${col.slug}`}
                    className="block h-full"
                  >
                    <div className="flex h-full flex-col gap-1">
                      <p className="text-[10px] font-semibold tracking-[0.25em] text-text-sub">
                        {mapColumnCategory(col.category)}
                      </p>
                      <h3 className="text-[13px] font-semibold leading-snug text-slate-900">
                        {col.title}
                      </h3>
                      {col.summary && (
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                          {col.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              ))}

              {latestColumns.length === 0 && (
                <p className="text-sm text-text-sub">
                  コラムは準備中です。少しずつ追加していきます。
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function mapColumnCategory(category: ColumnItem["category"]): string {
  switch (category) {
    case "OWNER_STORY":
      return "オーナーの本音ストーリー";
    case "MAINTENANCE":
      return "メンテナンスとトラブルの裏側";
    case "TECHNICAL":
      return "技術・歴史・ブランドの物語";
    default:
      return "コラム";
  }
}
