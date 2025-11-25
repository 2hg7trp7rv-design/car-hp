// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
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

export const revalidate = 600;

function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
}

export default async function HomePage() {
  const [news, columns, cars] = await Promise.all([
    getLatestNews(4),
    getAllColumns(),
    getAllCars(),
  ]);

  const latestColumns = columns.slice(0, 3);
  const latestCars = cars.slice(0, 3);

  return (
    <main className="bg-site">
      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-10 sm:space-y-14 sm:px-6 sm:pt-14 lg:px-8">
        <HeroSection />

        {/* Bento Grid */}
        <section className="mt-10">
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                OVERVIEW
              </p>
              <h2 className="mt-2 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                いま、このサイトでできること
              </h2>
            </div>
            <p className="hidden max-w-xs text-[11px] leading-relaxed text-text-sub md:block">
              NEWS/COLUMN/GUIDE/CARSの4つを中心に、
              「情報を集める」「読み物として楽しむ」「将来の比較のベースを作る」
              という三つの役割を持たせています。
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {/* NEWS: 横長カード */}
            <GlassCard
              as="section"
              interactive
              className="md:col-span-2 md:row-span-1 flex flex-col"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-text-sub">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  NEWS
                </div>
                <Link
                  href="/news"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                まずは「最近どんな話題があるか」をざっと眺める
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                RSSで拾ったニュースを、あとから編集コメントやタグを付けていく予定です。
                今はシンプルな一覧ですが、「どんなニュースが流れているか」を把握する入口として使えます。
              </p>

              <div className="mt-3 grid gap-2 text-[11px]">
                {news.map((item) => {
                  const title = item.titleJa || item.title;
                  return (
                    <Link
                      key={item.id}
                      href={`/news/${item.id}`}
                      className="flex items-baseline justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-left text-[11px] text-slate-800 hover:bg-white"
                    >
                      <span className="line-clamp-1 flex-1">
                        {truncate(title, 52)}
                      </span>
                      <span className="shrink-0 text-[10px] text-text-sub">
                        {item.sourceName ?? "NEWS"}
                      </span>
                    </Link>
                  );
                })}
                {news.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    ニュースデータがまだありません。RSS連携の準備が整い次第、ここに流れてきます。
                  </p>
                )}
              </div>
            </GlassCard>

            {/* COLUMN: 縦長カード */}
            <GlassCard
              as="section"
              interactive
              className="md:row-span-2 flex flex-col"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-text-sub">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  COLUMN
                </div>
                <Link
                  href="/column"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                オーナー目線の本音や、トラブルの裏側まで
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                試乗記よりも一歩踏み込んだ、「買ってからどうだったか」の話を集める場所です。
                メンテナンスやトラブルの記録、技術や歴史の解説もここにまとめていきます。
              </p>

              <div className="mt-4 flex-1 space-y-2">
                {latestColumns.map((column) => (
                  <Link
                    key={column.id}
                    href={`/column/${column.slug}`}
                    className="block rounded-xl bg-white/70 px-3 py-2 text-left hover:bg-white"
                  >
                    <p className="line-clamp-2 text-[11px] font-medium text-slate-900">
                      {column.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10px] text-text-sub">
                      {column.summary}
                    </p>
                  </Link>
                ))}
                {latestColumns.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    コラムはこれから追加していきます。
                    まずはB48やG30など、身近なテーマから整えていく予定です。
                  </p>
                )}
              </div>
            </GlassCard>

            {/* GUIDE */}
            <GlassCard
              as="section"
              interactive
              className="md:col-span-1 flex flex-col"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-text-sub">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  GUIDE
                </div>
                <Link
                  href="/guide"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                お金と維持の話を、ざっくり整理する場所
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                「欲しい」と思ったあとに付いてくる、見積もりや維持費、
                修理費と向き合うときの考え方などをまとめていきます。
              </p>

              <ul className="mt-3 space-y-1 text-[11px] text-text-sub">
                <li>輸入車を買う前に確認しておきたいポイント</li>
                <li>車検・タイヤ・保険・税金のざっくり年間コスト</li>
                <li>手放すか迷ったときの判断軸</li>
              </ul>
            </GlassCard>

            {/* CARS */}
            <GlassCard
              as="section"
              interactive
              className="md:col-span-2 flex flex-col"
            >
              <div className="mb-3 flex items-center justify-between text-[11px] text-text-sub">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  CARS
                </div>
                <Link
                  href="/cars"
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  一覧を見る
                </Link>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                将来の比較機能を見据えた、車種ごとの「台帳」
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                BMW 530i G30をはじめ、気になる車種を同じフォーマットで整理していきます。
                スペックだけでなく、価格感やトラブル傾向も将来的に紐づける想定です。
              </p>

              <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                {latestCars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${car.slug}`}
                    className="rounded-xl bg-white/70 px-3 py-2 text-left hover:bg-white"
                  >
                    <p className="line-clamp-2 font-medium text-slate-900">
                      {car.name}
                    </p>
                    <p className="mt-1 text-[10px] text-text-sub">
                      {truncate(car.summary, 40)}
                    </p>
                  </Link>
                ))}
                {latestCars.length === 0 && (
                  <p className="text-[11px] text-text-sub">
                    車種データは順次追加予定です。
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}
