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

export default async function HomePage() {
  // ニュース・コラム・CARSのダイジェストを取得
  const news = await getLatestNews(4);
  const columns = (await getAllColumns()).slice(0, 3);
  const cars = (await getAllCars()).slice(0, 4);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      {/* ヒーローセクション */}
      <section className="section-y pt-4 sm:pt-6">
        <HeroSection />
      </section>

      {/* ダッシュボード見出し */}
      <section className="mt-16 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          DASHBOARD
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          いま、このサイトでできること
        </h2>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          気になるニュースをざっと眺めて、オーナーの本音コラムを読み、
          気になる車種のページをチェックする。CAR BOUTIQUEの主要エリアを
          一目ですぐ飛べるダッシュボードにまとめています。
        </p>
      </section>

      {/* ダッシュボード本体（Bentoっぽい3カラム＋下段2カラム） */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* 左大枠 NEWSダイジェスト */}
        <GlassCard
          as="section"
          interactive
          className="flex flex-col lg:col-span-2"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                NEWS
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-[15px]">
                いま押さえておきたいニュース
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-text-sub">
                メーカー発表やメディア記事から、
                まずチェックしておきたいトピックをピックアップして並べます。
              </p>
            </div>
            <Link
              href="/news"
              className="hidden text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline sm:inline"
            >
              ニュース一覧へ
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {news.length === 0 && (
              <p className="text-[11px] text-text-sub">
                ニュースデータを準備中です。
              </p>
            )}
            {news.map((item) => {
              const title = item.titleJa || item.title;
              return (
                <Link
                  key={item.id}
                  href={`/news/${encodeURIComponent(item.id)}`}
                  className="block rounded-xl bg-white/60 px-3 py-2.5 text-left text-xs leading-relaxed text-text-sub transition hover:bg-white/90"
                >
                  <p className="font-body-light text-[10px] tracking-[0.22em] text-brand-tiffanySoft">
                    {item.category || "NEWS"}
                  </p>
                  <p className="mt-1 line-clamp-2 font-medium text-slate-900">
                    {title}
                  </p>
                  {item.excerpt && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-text-sub">
                      {item.excerpt}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 sm:hidden">
            <Link
              href="/news"
              className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
            >
              ニュース一覧を見る
            </Link>
          </div>
        </GlassCard>

        {/* 右上 COLUMNダイジェスト */}
        <GlassCard
          as="section"
          interactive
          className="flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              COLUMN
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-[15px]">
              オーナーの本音と、もう一歩深い話
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-text-sub">
              維持費、トラブル、ブランドの歴史など、
              ニュースの背景にあるストーリーをじっくり読むエリアです。
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {columns.length === 0 && (
              <p className="text-[11px] text-text-sub">
                コラムは順次追加していきます。
              </p>
            )}
            {columns.map((column) => (
              <Link
                key={column.id}
                href={`/column/${column.slug}`}
                className="block rounded-xl bg-white/60 px-3 py-2 text-left text-[11px] leading-relaxed text-text-sub transition hover:bg-white/90"
              >
                <p className="line-clamp-2 font-medium text-slate-900">
                  {column.title}
                </p>
                <p className="mt-1 line-clamp-2">
                  {column.summary}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-3">
            <Link
              href="/column"
              className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
            >
              コラム一覧を見る
            </Link>
          </div>
        </GlassCard>

        {/* 下段 GUIDE + CARS */}
        <div className="lg:col-span-3 mt-4 grid gap-4 md:grid-cols-2 lg:mt-6">
          {/* GUIDEカード */}
          <GlassCard
            as="section"
            interactive
            className="flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                GUIDE
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-[15px]">
                買い方・維持費・保険など、暮らし寄りの話
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-text-sub">
                「かっこいい」の先にある、お金と生活のリアルを
                少しずつガイドとしてまとめていきます。
              </p>
            </div>
            <div className="mt-4">
              <Link
                href="/guide"
                className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-5 py-2 text-[11px] font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg:white"
              >
                GUIDEページへ
              </Link>
            </div>
          </GlassCard>

          {/* CARSカード */}
          <GlassCard
            as="section"
            interactive
            className="flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                CARS
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900 sm:text-[15px]">
                気になる車種を、同じフォーマットで比較
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-text-sub">
                スペックだけでなく、長所短所や維持費感、トラブル傾向まで。
                将来の比較機能を見据えてテンプレートを整えています。
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-text-sub">
              {cars.length === 0 && (
                <p className="col-span-2 text-[11px] text-text-sub">
                  車種データは順次追加していきます。
                </p>
              )}
              {cars.map((car) => (
                <Link
                  key={car.id}
                  href={`/cars/${car.slug}`}
                  className="rounded-xl bg-white/60 px-3 py-2 text-left leading-snug text-text-sub transition hover:bg-white/90"
                >
                  <p className="line-clamp-2 font-medium text-slate-900">
                    {car.name}
                  </p>
                  {car.segment && (
                    <p className="mt-0.5 text-[10px]">
                      {car.segment}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-3">
              <Link
                href="/cars"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧を見る
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
