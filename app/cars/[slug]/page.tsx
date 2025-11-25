// app/cars/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarBySlug, type CarItem } from "@/lib/cars";
import { GlassCard } from "@/components/GlassCard";

type Props = {
  params: { slug: string };
};

function difficultyLabel(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "初めてでも扱いやすい";
    case "intermediate":
      return "少しこだわりたい人向け";
    case "advanced":
      return "クルマ好き向け・玄人向け";
    default:
      return "バランスタイプ";
  }
}

function formatSpecValue(value?: string | number): string {
  if (value === undefined || value === null || value === "") {
    return "―";
  }
  return String(value);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CARS | CAR BOUTIQUE",
      description: "指定された車種ページが見つかりませんでした。",
    };
  }

  const title = `${car.name} | CARS | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "CAR BOUTIQUEの車種データベースページです。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(car.slug)}`,
      images: car.heroImage
        ? [{ url: car.heroImage }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const difficulty = difficultyLabel(car.difficulty);
  const summaryLong = car.summaryLong ?? car.summary;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* パンくずとラベル */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-sub">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/cars"
              className="inline-flex items-center gap-1 text-[11px] text-text-sub underline-offset-4 hover:underline"
            >
              <span>◀</span>
              <span>CARS一覧に戻る</span>
            </Link>
            <span className="hidden text-slate-400 sm:inline">/</span>
            <span className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              CARS DETAIL
            </span>
          </div>
          {car.tags && car.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {car.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/80 px-2 py-1 text-[10px] text-text-sub"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ヒーローエリア */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          {/* 左: テキスト */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              {car.maker} / CARS
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {car.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-sub">
              {car.releaseYear && (
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  {car.releaseYear}年頃登場
                </span>
              )}
              {car.grade && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  グレード{car.grade}
                </span>
              )}
              {car.bodyType && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  {car.bodyType}
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  {car.segment}
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-text-sub sm:text-[15px]">
              {summaryLong}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-text-sub">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                {difficulty}
              </span>
              {car.drive && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  駆動方式:{car.drive}
                </span>
              )}
              {car.fuel && (
                <span className="rounded-full bg-white/80 px-3 py-1">
                  燃料:{car.fuel}
                </span>
              )}
            </div>
          </div>

          {/* 右: 画像＋ミニカード */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tiffany-50 via-white to-slate-50 shadow-soft-card">
              <div className="relative aspect-[4/3] w-full">
                {car.heroImage ? (
                  <Image
                    src={car.heroImage}
                    alt={car.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tiffany-50 via-white to-slate-50 text-xs text-text-sub">
                    画像は順次追加予定です
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-3 right-3 sm:left-auto sm:right-0 sm:w-[70%]">
              <GlassCard className="pointer-events-auto p-4 shadow-soft-card">
                <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                  SPEC DIGEST
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-text-sub">
                  {car.engine && (
                    <div>
                      <p className="text-[10px] text-slate-400">エンジン</p>
                      <p className="font-medium text-slate-800">
                        {car.engine}
                      </p>
                    </div>
                  )}
                  {car.powerPs && (
                    <div>
                      <p className="text-[10px] text-slate-400">最高出力</p>
                      <p className="font-medium text-slate-800">
                        {car.powerPs}ps
                      </p>
                    </div>
                  )}
                  {car.torqueNm && (
                    <div>
                      <p className="text-[10px] text-slate-400">最大トルク</p>
                      <p className="font-medium text-slate-800">
                        {car.torqueNm}Nm
                      </p>
                    </div>
                  )}
                  {car.fuelEconomy && (
                    <div>
                      <p className="text-[10px] text-slate-400">実用燃費目安</p>
                      <p className="font-medium text-slate-800">
                        {car.fuelEconomy}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* スペックセクション */}
        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <GlassCard as="section" className="h-full">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              基本スペック
            </h2>
            <p className="mt-1 text-[11px] text-text-sub">
              カタログスペックを中心に、このクルマのキャラクターをざっと把握するための一覧です。
            </p>

            <div className="mt-4 grid gap-x-6 gap-y-3 text-sm text-slate-800 sm:grid-cols-2">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">メーカー</span>
                <span>{car.maker}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">ボディタイプ</span>
                <span>{formatSpecValue(car.bodyType)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">セグメント</span>
                <span>{formatSpecValue(car.segment)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">グレード</span>
                <span>{formatSpecValue(car.grade)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">エンジン</span>
                <span>{formatSpecValue(car.engine)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">最高出力</span>
                <span>
                  {car.powerPs ? `${car.powerPs}ps` : "―"}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">最大トルク</span>
                <span>
                  {car.torqueNm ? `${car.torqueNm}Nm` : "―"}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">トランスミッション</span>
                <span>{formatSpecValue(car.transmission)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">駆動方式</span>
                <span>{formatSpecValue(car.drive)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">燃料</span>
                <span>{formatSpecValue(car.fuel)}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-xs sm:text-[13px]">
                <span className="text-text-sub">実用燃費目安</span>
                <span>{formatSpecValue(car.fuelEconomy)}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-xs text-text-sub sm:text-[12px]">
              <div className="rounded-2xl bg-tiffany-50/60 px-4 py-3 text-[11px] text-tiffany-800">
                スペック値はカタログや一般的な目安ベースで整理しており、
                実際のコンディションや仕様により前後します。
              </div>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard as="section" className="h-full">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                価格感とマーケットの立ち位置
              </h2>
              <div className="mt-3 grid gap-3 text-xs text-text-sub sm:text-[13px]">
                <div className="flex items-baseline justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="text-[11px] text-text-sub">
                    新車時価格帯
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatSpecValue(car.priceNew)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="text-[11px] text-text-sub">
                    中古車相場の目安
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatSpecValue(car.priceUsed)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-sub">
                  中古車価格は年式や走行距離、修復歴、
                  装備内容などによって大きく変動します。
                  ここでの金額はあくまで執筆時点での目安として整理しています。
                </p>
              </div>
            </GlassCard>

            <GlassCard as="section" padding="sm" className="h-full">
              <div className="p-2 sm:p-3">
                <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">
                  このクルマと暮らすイメージ
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                  今後は、実際のオーナー体験や、
                  維持費・トラブル傾向などをコラムやGUIDEと連動させて追記していきます。
                  まずはCARSページで気になる車種を眺めながら、
                  自分の生活とのフィット感をイメージするためのベースとして活用してください。
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}
