// app/page.tsx
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { getLatestNews } from "@/lib/news";
import { getAllColumns } from "@/lib/columns";
import { getAllCars } from "@/lib/cars";

export default async function HomePage() {
  const [news, columns, cars] = await Promise.all([
    getLatestNews(12),
    getAllColumns(),
    getAllCars(),
  ]);

  const latestNews = news.slice(0, 4);
  const latestColumns = columns.slice(0, 3);
  const featuredCars = cars.slice(0, 3);

  return (
    <main className="bg-site min-h-screen pb-20">
      {/* ヒーロー */}
      <div className="pt-10 pb-16 sm:pb-20">
        <HeroSection />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        {/* ダッシュボード的入口エリア */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* NEWSカード */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col"
          >
            <div className="flex items-center justify-between text-[10px] text-text-sub">
              <p className="font-semibold tracking-[0.32em] text-text-sub">
                NEWS
              </p>
              {news.length > 0 && (
                <p className="text-[10px]">
                  {news.length}件のニュース
                </p>
              )}
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-900 sm:text-[15px]">
              いま押さえておきたいクルマのニュースを編集して整理。
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-sub">
              国内メーカー公式発表や専門メディアの記事を、
              タイトルと要約付きで一覧にしています。
              気になる記事は元サイトでじっくりチェックできます。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-slate-900 px-3 py-1 font-medium tracking-[0.18em] text-white">
                RSSダイジェスト
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                メーカー別
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                カテゴリ別
              </span>
            </div>
            <div className="mt-5 pt-3">
              <Link
                href="/news"
                className="inline-flex items-center justify-center rounded-full bg-tiffany-500 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-white shadow-soft-strong hover:bg-tiffany-600 hover:shadow-soft-stronger"
              >
                NEWS一覧を開く
              </Link>
            </div>
          </GlassCard>

          {/* COLUMNカード */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col"
          >
            <div className="flex items-center justify-between text-[10px] text-text-sub">
              <p className="font-semibold tracking-[0.32em] text-text-sub">
                COLUMN
              </p>
              {columns.length > 0 && (
                <p className="text-[10px]">
                  {columns.length}本のコラム
                </p>
              )}
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-900 sm:text-[15px]">
              オーナーの本音やトラブル、技術の背景まで「ニュースの先」を読む。
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-sub">
              実際のオーナー目線のストーリーや、
              故障・修理のリアル、ブランドや技術の背景など、
              腹落ちする読み物を少しずつ増やしていきます。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                オーナーストーリー
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                メンテナンス
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                技術・歴史
              </span>
            </div>
            <div className="mt-5 pt-3">
              <Link
                href="/column"
                className="inline-flex items-center justify-center rounded-full border border-tiffany-400 bg-white/80 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-tiffany-700 shadow-soft-card hover:bg-white"
              >
                コラム一覧を開く
              </Link>
            </div>
          </GlassCard>

          {/* CARSカード */}
          <GlassCard
            as="article"
            interactive
            className="flex h-full flex-col"
          >
            <div className="flex items-center justify-between text-[10px] text-text-sub">
              <p className="font-semibold tracking-[0.32em] text-text-sub">
                CARS
              </p>
              {cars.length > 0 && (
                <p className="text-[10px]">
                  {cars.length}車種掲載
                </p>
              )}
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-900 sm:text-[15px]">
              スペックとストーリーを同じフォーマットで追える車種データベース。
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-sub">
              ボディタイプやセグメント、エンジン、維持費の目安などを
              共通レイアウトで整理。
              将来の比較機能や検索機能の土台になるエリアです。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                セダン
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                SUV
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-text-sub">
                スポーツ
              </span>
            </div>
            <div className="mt-5 pt-3">
              <Link
                href="/cars"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-800 hover:bg-white"
              >
                CARS一覧を開く
              </Link>
            </div>
          </GlassCard>
        </section>

        {/* 最新ニュースダイジェスト */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                LATEST NEWS
              </p>
              <h2 className="mt-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                いま押さえておきたいニュース
              </h2>
            </div>
            <Link
              href="/news"
              className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
            >
              すべてのニュースを見る
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {latestNews.map((item) => {
              const title = item.titleJa || item.title;
              return (
                <GlassCard
                  key={item.id}
                  as="article"
                  interactive
                  padding="sm"
                  className="h-full"
                >
                  <Link href={`/news/${item.id}`} className="block">
                    <p className="font-body-light text-[10px] tracking-[0.24em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900">
                      {title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-text-sub">
                      <span>{item.sourceName ?? "EXTERNAL"}</span>
                      {item.publishedAt && (
                        <span>
                          {new Date(item.publishedAt).toLocaleDateString(
                            "ja-JP",
                            {
                              month: "2-digit",
                              day: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              );
            })}
            {latestNews.length === 0 && (
              <p className="text-xs text-text-sub">
                まだニュースがありません。RSS連携の準備ができ次第、ここに最新ニュースを表示します。
              </p>
            )}
          </div>
        </section>

        {/* 新着コラムと注目CARSを横並びに */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* コラム側 */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                  LATEST COLUMN
                </p>
                <h2 className="mt-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  最近追加したコラム
                </h2>
              </div>
              <Link
                href="/column"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>

            <div className="space-y-3">
              {latestColumns.map((column) => (
                <GlassCard
                  key={column.id}
                  as="article"
                  interactive
                  padding="sm"
                >
                  <Link
                    href={`/column/${column.slug}`}
                    className="block space-y-1"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                      COLUMN
                    </p>
                    <h3 className="text-sm font-semibold leading-snug text-slate-900">
                      {column.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-text-sub">
                      {column.summary}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-text-sub">
                      {column.readMinutes && (
                        <span>
                          約{column.readMinutes}
                          分で読めます
                        </span>
                      )}
                      {column.publishedAt && (
                        <span>
                          {new Date(column.publishedAt).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                </GlassCard>
              ))}
              {latestColumns.length === 0 && (
                <p className="text-xs text-text-sub">
                  まだコラムがありません。まずはBMW 530iや身の回りの出来事から、
                  オーナー目線の読み物を増やしていく予定です。
                </p>
              )}
            </div>
          </div>

          {/* CARS側 */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                  CARS PICKUP
                </p>
                <h2 className="mt-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  まずはこの3台から
                </h2>
              </div>
              <Link
                href="/cars"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </Link>
            </div>

            <div className="space-y-3">
              {featuredCars.map((car) => (
                <GlassCard
                  key={car.id}
                  as="article"
                  interactive
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                      {car.maker}
                    </p>
                    <Link
                      href={`/cars/${car.slug}`}
                      className="block"
                    >
                      <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900">
                        {car.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                        {car.summary}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-text-sub">
                        {car.bodyType && <span>{car.bodyType}</span>}
                        {car.segment && <span>{car.segment}</span>}
                        {car.releaseYear && (
                          <span>{car.releaseYear}年頃デビュー</span>
                        )}
                      </div>
                    </Link>
                  </div>
                </GlassCard>
              ))}
              {featuredCars.length === 0 && (
                <p className="text-xs text-text-sub">
                  車種データはこれから増やしていきます。
                  まずはBMW 5シリーズやハリアー、GT-Rなど、
                  代表的な数台から整理していく予定です。
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
