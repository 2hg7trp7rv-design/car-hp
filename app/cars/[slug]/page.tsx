// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCarBySlug, type CarItem } from "@/lib/cars";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

function difficultyLabel(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "初めての輸入車・ファミリーにも扱いやすいバランスタイプ";
    case "intermediate":
      return "走りや質感にも少しこだわりたい人向けの中級者モデル";
    case "advanced":
      return "クルマ好き・玄人向けの上級者モデル";
    default:
      return "扱いやすさと楽しさのバランス型";
  }
}

function makerLabel(maker: string): string {
  if (!maker) return "OTHER";
  return maker.toUpperCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description:
        "指定された車種ページが見つかりませんでした。CARS一覧から改めてお探しください。",
    };
  }

  const title = `${car.name} | CARSデータベース | CAR BOUTIQUE`;
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
      url: `https://car-hp.vercel.app/cars/${car.slug}`,
      images: car.heroImage
        ? [{ url: car.heroImage, alt: car.name }]
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
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          CARS
        </p>
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          指定された車種が見つかりませんでした。
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-sub">
          URLが古い、または車種データがまだ整備されていない可能性があります。
        </p>
        <div className="mt-6">
          <Link href="/cars">
            <Button variant="outline" size="lg">
              CARS一覧へ戻る
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const maker = makerLabel(car.maker);
  const hasSpecBlock =
    car.engine ||
    car.powerPs ||
    car.torqueNm ||
    car.transmission ||
    car.drive ||
    car.fuel ||
    car.fuelEconomy ||
    car.priceNew ||
    car.priceUsed;

  const relatedNewsHref =
    car.maker && car.maker !== "OTHER"
      ? `/news?maker=${encodeURIComponent(car.maker)}`
      : "/news";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      {/* ヒーローエリア */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          {/* 左: 画像ヒーロー */}
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
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-text-sub">
                    画像は順次追加予定です
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 z-[1] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-50">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-slate-200">
                      {maker}
                    </p>
                    <h1 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl">
                      {car.name}
                    </h1>
                    {car.grade && (
                      <p className="mt-1 text-[11px] text-slate-100">
                        グレード {car.grade}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    {car.releaseYear && (
                      <span className="rounded-full bg-white/15 px-3 py-1">
                        {car.releaseYear}年頃デビュー
                      </span>
                    )}
                    {car.bodyType && (
                      <span className="rounded-full bg-white/15 px-3 py-1">
                        {car.bodyType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右: 概要カード */}
          <div className="space-y-4">
            <GlassCard padding="lg" className="h-full">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                OVERVIEW
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                {car.summaryLong ?? car.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-text-sub">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  {difficultyLabel(car.difficulty)}
                </span>
                {car.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-text-sub">
                <Link href="/cars">
                  <Button variant="secondary" size="sm">
                    CARS一覧へ戻る
                  </Button>
                </Link>
                <Link href={relatedNewsHref}>
                  <Button variant="outline" size="sm">
                    関連ニュースをNEWSで見る
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 下段: スペック＋読み物エリア */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* 左カラム: 性格・乗り味の説明エリア（テキストは今はサマリー中心） */}
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-text-sub">
              CHARACTER
            </h2>
            <p className="mt-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              このクルマの性格と、ざっくりイメージ。
            </p>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-sub sm:text-[15px]">
              <p>
                {car.summaryLong ??
                  car.summary ??
                  "この車種の詳しいレビューやオーナーの本音は、順次コラムとして追加していく予定です。"}
              </p>
              <p className="text-xs text-slate-500">
                具体的なオーナー体験談やトラブル事例、維持費のリアルなどは、
                COLUMNやGUIDEコンテンツとして別途整理していきます。
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <GlassCard padding="md">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                  おすすめしたい人のイメージ
                </p>
                <p className="mt-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                  {difficultyLabel(car.difficulty)}
                </p>
              </GlassCard>

              <GlassCard padding="md">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                  これから追加していくコンテンツ
                </p>
                <ul className="mt-3 space-y-1 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                  <li>• オーナー目線の「ここが好き／ここは注意」</li>
                  <li>• 代表的なトラブル傾向と対策メモ</li>
                  <li>• 年式や走行距離ごとの相場感</li>
                  <li>• 同じクラスのクルマとの比較</li>
                </ul>
              </GlassCard>
            </div>
          </div>

          {/* 右カラム: スペック・価格カード */}
          <div className="space-y-4">
            {hasSpecBlock && (
              <GlassCard padding="lg">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                  SPEC
                </p>

                <dl className="mt-3 space-y-2 text-xs text-text-sub sm:text-[13px]">
                  {car.engine && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">エンジン</dt>
                      <dd className="text-right text-slate-800">
                        {car.engine}
                      </dd>
                    </div>
                  )}
                  {(car.powerPs || car.torqueNm) && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">出力・トルク（参考値）</dt>
                      <dd className="text-right text-slate-800">
                        {car.powerPs && `${car.powerPs}ps`}
                        {car.powerPs && car.torqueNm && " / "}
                        {car.torqueNm && `${car.torqueNm}Nm`}
                      </dd>
                    </div>
                  )}
                  {car.transmission && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">トランスミッション</dt>
                      <dd className="text-right text-slate-800">
                        {car.transmission}
                      </dd>
                    </div>
                  )}
                  {car.drive && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">駆動方式</dt>
                      <dd className="text-right text-slate-800">
                        {car.drive}
                      </dd>
                    </div>
                  )}
                  {car.fuel && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">推奨燃料</dt>
                      <dd className="text-right text-slate-800">
                        {car.fuel}
                      </dd>
                    </div>
                  )}
                  {car.fuelEconomy && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">実用燃費の目安</dt>
                      <dd className="text-right text-slate-800">
                        {car.fuelEconomy}
                      </dd>
                    </div>
                  )}
                  {(car.priceNew || car.priceUsed) && (
                    <div className="flex flex-col gap-2 pt-1">
                      {car.priceNew && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">新車時の価格帯</dt>
                          <dd className="text-right text-slate-800">
                            {car.priceNew}
                          </dd>
                        </div>
                      )}
                      {car.priceUsed && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">現在の中古車相場感</dt>
                          <dd className="text-right text-slate-800">
                            {car.priceUsed}
                          </dd>
                        </div>
                      )}
                    </div>
                  )}
                </dl>
              </GlassCard>
            )}

            <GlassCard padding="md">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                NEXT STEP
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                他の車種と比較して検討したい場合は、
                まずはCARS一覧から気になるモデルをピックアップして、
                将来的に追加予定の比較機能と組み合わせて見ていくイメージです。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Link href="/cars">
                  <Button size="sm" variant="secondary">
                    他の車種も見る
                  </Button>
                </Link>
                <Link href={relatedNewsHref}>
                  <Button size="sm" variant="outline">
                    メーカー別ニュースへ
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </main>
  );
}
