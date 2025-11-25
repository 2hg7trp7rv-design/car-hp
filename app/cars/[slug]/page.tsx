// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, type CarItem } from "@/lib/cars";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種ページが見つかりませんでした。",
    };
  }

  return {
    title: `${car.name} | CAR BOUTIQUE`,
    description: car.summaryLong ?? car.summary,
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const title = car.name;
  const subtitleParts: string[] = [];
  if (car.maker) subtitleParts.push(car.maker);
  if (car.releaseYear) subtitleParts.push(`${car.releaseYear}年頃登場`);
  const subtitle = subtitleParts.join("・");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white pb-16 pt-20 sm:pt-24">
      {/* ヒーロー */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              CARS
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-xs text-text-sub sm:text-[13px]">
                {subtitle}
              </p>
            )}

            <p className="mt-4 text-sm leading-relaxed text-text-sub sm:text-[15px]">
              {car.summaryLong ?? car.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-text-sub">
              {car.bodyType && (
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  {car.bodyType}
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {car.segment}
                </span>
              )}
              <span className="rounded-full bg-white/80 px-3 py-1">
                {difficultyLabel(car.difficulty)}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="primary">
                同じメーカーのニュースを見る
              </Button>
              <Link
                href="/cars"
                className="text-xs font-medium tracking-[0.18em] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ戻る
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tiffany-50 via-white to-slate-50 shadow-soft-card">
              <div className="relative aspect-[4/3] w-full">
                {car.heroImage ? (
                  <Image
                    src={car.heroImage}
                    alt={car.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-text-sub">
                    画像は順次追加していきます
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/5 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* スペックとストーリー */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <GlassCard className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              SPEC
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-text-sub">
              {car.engine && (
                <>
                  <span className="text-slate-500">エンジン</span>
                  <span className="text-slate-800">{car.engine}</span>
                </>
              )}
              {typeof car.powerPs === "number" && (
                <>
                  <span className="text-slate-500">最高出力</span>
                  <span className="text-slate-800">
                    {car.powerPs}
                    ps前後
                  </span>
                </>
              )}
              {typeof car.torqueNm === "number" && (
                <>
                  <span className="text-slate-500">最大トルク</span>
                  <span className="text-slate-800">
                    {car.torqueNm}
                    Nm前後
                  </span>
                </>
              )}
              {car.transmission && (
                <>
                  <span className="text-slate-500">トランスミッション</span>
                  <span className="text-slate-800">{car.transmission}</span>
                </>
              )}
              {car.drive && (
                <>
                  <span className="text-slate-500">駆動方式</span>
                  <span className="text-slate-800">{car.drive}</span>
                </>
              )}
              {car.fuel && (
                <>
                  <span className="text-slate-500">燃料</span>
                  <span className="text-slate-800">{car.fuel}</span>
                </>
              )}
              {car.fuelEconomy && (
                <>
                  <span className="text-slate-500">実用燃費目安</span>
                  <span className="text-slate-800">{car.fuelEconomy}</span>
                </>
              )}
              {car.priceNew && (
                <>
                  <span className="text-slate-500">新車時価格帯</span>
                  <span className="text-slate-800">{car.priceNew}</span>
                </>
              )}
              {car.priceUsed && (
                <>
                  <span className="text-slate-500">中古車価格帯</span>
                  <span className="text-slate-800">{car.priceUsed}</span>
                </>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              STORY
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-sub sm:text-[15px]">
              {car.summaryLong ??
                "この車種のストーリーや、オーナー目線での長所短所、維持費感などは順次追記していきます。"}
            </p>

            {car.tags && car.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-text-sub">
                {car.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
