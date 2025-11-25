// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { getLatestNews } from "@/lib/news";
import { getAllColumns } from "@/lib/columns";
import { getAllCars } from "@/lib/cars";

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
  const [news, columns, cars] = await Promise.all([
    getLatestNews(8),
    getAllColumns(),
    getAllCars(),
  ]);

  const latestNews = news.slice(0, 4);
  const latestColumns = columns.slice(0, 3);
  const featuredCars = cars.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      {/* ヒーロー */}
      <HeroSection />

      {/* ダッシュボード的入口 */}
      <section className="mt-16 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              DASHBOARD
            </p>
            <h2 className="mt-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              いまサイトでできること
            </h2>
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-text-sub sm:text-xs">
              NEWSで最新動向を押さえ、COLUMNで一歩踏み込んだ読み物を、
              CARSで気になる車種のスペックとストーリーをざっと眺められます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-text-sub">
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-soft">
              NEWS {news.length}件
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-soft">
              COLUMN {columns.length}本
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-soft">
              CARS {cars.length}台
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* 左カラム: NEWS＋COLUMN */}
          <div className="space-y-4">
            {/* NEWS ブロック */}
            <GlassCard padding="sm" className="h-full">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                    NEWS
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    最新ニュースダイジェスト
                  </h3>
                  <p className="mt-1 text-[11px] text-text-sub">
                    直近のニュースから、雰囲気をつかむための数本をピックアップ。
                  </p>
                </div>
                <Link
                  href="/news"
                  className="text-[10px] font-medium tracking-[0.18em] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  すべて見る
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {latestNews.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    まだニュースデータがありません。news-latest.jsonを整備すると表示されます。
                  </p>
                )}

                {latestNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${encodeURIComponent(item.id)}`}
                    className="block rounded-xl bg-white/60 px-3 py-2.5 text-left text-[11px] text-slate-800 transition hover:bg-white"
                  >
                    <p className="font-body-light text-[10px] uppercase tracking-[0.22em] text-brand-tiffanySoft">
                      {item.category || "NEWS"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 font-medium text-slate-900">
                      {item.titleJa || item.title}
                    </p>
                    {item.excerpt && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-text-sub">
                        {item.excerpt}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between text-[10px] text-text-sub">
                      <span>{item.sourceName ?? "EXTERNAL"}</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* COLUMN ブロック */}
            <GlassCard padding="sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                    COLUMN
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    コラムとストーリー
                  </h3>
                  <p className="mt-1 text-[11px] text-text-sub">
                    オーナー体験やトラブル、技術解説など、
                    「ニュースのもう一歩先」を読むエリア。
                  </p>
                </div>
                <Link
                  href="/column"
                  className="text-[10px] font-medium tracking-[0.18em] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {latestColumns.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    まだコラムがありません。columns.jsonを整備するとここに表示されます。
                  </p>
                )}

                {latestColumns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/column/${c.slug}`}
                    className="block rounded-xl bg-white/60 px-3 py-2 text-left text-[11px] text-slate-800 transition hover:bg-white"
                  >
                    <p className="line-clamp-1 font-medium text-slate-900">
                      {c.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-text-sub">
                      {c.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* 右カラム: CARS ブロック */}
          <div className="space-y-4">
            <GlassCard padding="sm" className="h-full">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                    CARS
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    車種データベースの入り口
                  </h3>
                  <p className="mt-1 text-[11px] text-text-sub">
                    まずは少数精鋭から、スペックと性格が分かる車種ページを整えていきます。
                  </p>
                </div>
                <Link
                  href="/cars"
                  className="text-[10px] font-medium tracking-[0.18em] text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧へ
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {featuredCars.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    まだ車種データがありません。cars.jsonを整備するとここに表示されます。
                  </p>
                )}

                {featuredCars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${car.slug}`}
                    className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-[11px] text-slate-800 transition hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-text-sub">
                        {car.maker}
                      </p>
                      <p className="mt-0.5 line-clamp-1 font-medium text-slate-900">
                        {car.name}
                      </p>
                      {car.summary && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-text-sub">
                          {car.summary}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex flex-col items-end text-right text-[10px] text-text-sub">
                      {car.bodyType && <span>{car.bodyType}</span>}
                      {car.segment && <span>{car.segment}</span>}
                      {car.releaseYear && <span>{car.releaseYear}年頃</span>}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-r from-tiffany-50/90 to-white/90 px-3 py-2 text-[10px] text-text-sub">
                まずはBMW 530i G30など、オーナー体験と紐づけて深掘りしたい車種から
                少しずつ増やしていく想定です。
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </main>
  );
}
