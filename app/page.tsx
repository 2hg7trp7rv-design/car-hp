// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
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

  // 追加1 新着コラムと注目CARS用の配列
  const latestColumns: ColumnItem[] = [...columns]
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return a.publishedAt < b.publishedAt ? 1 : -1;
    })
    .slice(0, 4);

  const featuredCars: CarItem[] = cars.slice(0, 4);

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
            <p className="mt-1 text-[11px] text-text-sub">
              詳しくはNEWSページで、カテゴリやメーカー別にも絞り込めます。
            </p>
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
              const categoryLabel = item.category || "NEWS";
              const makerLabel = item.maker || "";

              return (
                <GlassCard
                  key={item.id}
                  as="article"
                  interactive
                  className="flex h-full flex-col p-4 sm:p-5"
                >
                  <Link href={`/news/${item.id}`} className="block h-full">
                    <div className="flex h-full flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-sub">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-medium tracking-[0.22em] text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                          {categoryLabel}
                        </span>
                        {makerLabel && (
                          <span className="rounded-full bg-white/80 px-3 py-1">
                            {makerLabel}
                          </span>
                        )}
                      </div>

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

      {/* 新着コラム＋注目CARSダイジェスト 追加2 */}
      <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* 新着コラム */}
        <div className="space-y-4">
          <header className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                NEW COLUMNS
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                最近追加されたコラム
              </h2>
            </div>
            <Link
              href="/column"
              className="text-[11px] font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              コラム一覧へ
            </Link>
          </header>

          {latestColumns.length === 0 ? (
            <p className="text-sm text-text-sub">
              まだコラムがありません。追加され次第ここに表示されます。
            </p>
          ) : (
            <div className="space-y-3">
              {latestColumns.map((column) => (
                <ColumnDigestCard key={column.id} column={column} />
              ))}
            </div>
          )}
        </div>

        {/* 注目CARS */}
        <div className="space-y-4">
          <header className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                FEATURED CARS
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                まずチェックしておきたい車種
              </h2>
            </div>
            <Link
              href="/cars"
              className="text-[11px] font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              CARS一覧へ
            </Link>
          </header>

          {featuredCars.length === 0 ? (
            <p className="text-sm text-text-sub">
              まだ車種データがありません。順次追加していきます。
            </p>
          ) : (
            <div className="space-y-3">
              {featuredCars.map((car) => (
                <CarDigestCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// 追加3 コラムとCARSのダイジェストカード

type ColumnDigestProps = {
  column: ColumnItem;
};

function ColumnDigestCard({ column }: ColumnDigestProps) {
  return (
    <Link href={`/column/${column.slug}`}>
      <article className="group rounded-3xl border border-white/80 bg-white/90 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
          COLUMN
        </p>
        <h3 className="mt-2 line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
          {column.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
          {column.summary}
        </p>
      </article>
    </Link>
  );
}

type CarDigestProps = {
  car: CarItem;
};

function CarDigestCard({ car }: CarDigestProps) {
  return (
    <Link href={`/cars/${car.slug}`}>
      <article className="group rounded-3xl border border-white/80 bg-white/90 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
          {car.maker && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              {car.maker}
            </span>
          )}
          {car.bodyType && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
              {car.bodyType}
            </span>
          )}
          {car.releaseYear && (
            <span className="ml-auto text-[10px] text-slate-400">
              {car.releaseYear}年頃
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-semibold leading-relaxed text-slate-900">
          {car.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
          {car.summary ??
            "この車種の詳しいレビューや維持費のリアルは、順次CARSページに追加していきます。"}
        </p>
      </article>
    </Link>
  );
}
