// app/cars/[slug]/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCarBySlug,
  getAllCars,
  type CarItem,
} from "@/lib/cars";
import { GlassCard } from "@/components/GlassCard";

type Props = {
  params: { slug: string };
};

function difficultyLabel(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "初めてでも扱いやすいバランス型";
    case "intermediate":
      return "少しこだわりたい人向け";
    case "advanced":
      return "クルマ好き・玄人向け";
    default:
      return "バランスタイプ";
  }
}

function difficultyBadgeColor(
  difficulty?: CarItem["difficulty"],
): string {
  switch (difficulty) {
    case "basic":
      return "bg-emerald-50 text-emerald-700";
    case "intermediate":
      return "bg-sky-50 text-sky-700";
    case "advanced":
      return "bg-slate-900 text-white";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description:
        "指定された車種ページが見つかりませんでした。",
    };
  }

  const title = `${car.name} | CARS | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "CARSページでは、スペックや長所短所、維持費感などを整理していきます。";

  const ogImage = car.heroImage ?? car.mainImage ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: car.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
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

  const difficultyText = difficultyLabel(car.difficulty);
  const difficultyClass = difficultyBadgeColor(car.difficulty);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* パンくず */}
        <nav className="mb-4 text-[11px] text-text-sub">
          <Link
            href="/"
            className="hover:underline"
          >
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link
            href="/cars"
            className="hover:underline"
          >
            CARS
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700">
            {car.name}
          </span>
        </nav>

        {/* ヘッダー＋ヒーロー */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
              CARS
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              {car.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-sub">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                {car.maker}
              </span>
              {car.releaseYear && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {car.releaseYear}年頃登場
                </span>
              )}
              <span
                className={[
                  "rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.12em]",
                  difficultyClass,
                ].join(" ")}
              >
                {difficultyText}
              </span>
            </div>

            {car.summary && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-sub sm:text-[15px]">
                {car.summary}
              </p>
            )}

            {car.summaryLong && (
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
                {car.summaryLong}
              </p>
            )}

            {/* ハイライトスペック */}
            <div className="mt-6 grid gap-3 text-[11px] text-text-sub sm:grid-cols-3">
              {car.engine && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    POWERTRAIN
                  </p>
                  <p className="mt-1 text-xs text-slate-800">
                    {car.engine}
                  </p>
                </div>
              )}
              {(car.powerPs || car.torqueNm) && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    OUTPUT
                  </p>
                  <p className="mt-1 text-xs text-slate-800">
                    {car.powerPs && `${car.powerPs}ps`}
                    {car.powerPs && car.torqueNm && " / "}
                    {car.torqueNm && `${car.torqueNm}Nm`}
                  </p>
                </div>
              )}
              {(car.drive || car.transmission) && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    DRIVE
                  </p>
                  <p className="mt-1 text-xs text-slate-800">
                    {[car.drive, car.transmission]
                      .filter(Boolean)
                      .join(" × ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 画像側 */}
          <div className="relative">
            <GlassCard padding="none" className="overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3] w-full">
                {car.heroImage || car.mainImage ? (
                  <Image
                    src={car.heroImage ?? car.mainImage ?? ""}
                    alt={car.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
                    <p className="text-xs font-medium tracking-[0.18em] text-white/70">
                      PHOTO COMING SOON
                    </p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-100">
                  <span className="rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm">
                    {car.bodyType ?? "BODY TYPE準備中"}
                  </span>
                  {car.segment && (
                    <span className="rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm">
                      {car.segment}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* メイン情報ブロック */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* 左カラム: 詳細テキスト / コメント用エリア */}
          <div className="space-y-6">
            <GlassCard as="section">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                OVERVIEW
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-sub sm:text-[13px]">
                このページでは、スペック表だけでは見えにくい
                「使い勝手」「維持費感」「トラブル傾向」なども、
                今後少しずつ追記していきます。
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

            {/* 将来の長所・短所・トラブルノート用の枠 */}
            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard as="section" className="h-full">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-emerald-700">
                  GOOD POINTS
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                  長所や「ここが好き」と感じるポイントを、
                  実際のオーナー体験ベースで少しずつ追記していく予定です。
                </p>
              </GlassCard>
              <GlassCard as="section" className="h-full">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-rose-700">
                  CARE POINTS
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-text-sub">
                  持病になりやすい部分や、維持で気をつけたいポイントなども、
                  データと経験談をもとに整理していきます。
                </p>
              </GlassCard>
            </div>
          </div>

          {/* 右カラム: スペック / お金周り */}
          <div className="space-y-4">
            <GlassCard as="section" padding="md">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                SPEC SHEET
              </p>
              <dl className="mt-3 space-y-2 text-[11px] text-text-sub">
                <SpecRow label="ボディタイプ" value={car.bodyType} />
                <SpecRow label="セグメント" value={car.segment} />
                <SpecRow label="グレード" value={car.grade} />
                <SpecRow
                  label="駆動方式 × ミッション"
                  value={
                    car.drive || car.transmission
                      ? [car.drive, car.transmission]
                          .filter(Boolean)
                          .join(" × ")
                      : undefined
                  }
                />
                <SpecRow label="エンジン" value={car.engine} />
                <SpecRow
                  label="最高出力"
                  value={car.powerPs ? `${car.powerPs}ps` : undefined}
                />
                <SpecRow
                  label="最大トルク"
                  value={car.torqueNm ? `${car.torqueNm}Nm` : undefined}
                />
                <SpecRow label="燃料" value={car.fuel} />
                <SpecRow label="実用燃費目安" value={car.fuelEconomy} />
              </dl>
            </GlassCard>

            <GlassCard as="section" padding="md">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                PRICE / RUNNING COST
              </p>
              <dl className="mt-3 space-y-2 text-[11px] text-text-sub">
                <SpecRow label="新車時価格帯" value={car.priceNew} />
                <SpecRow label="中古車相場目安" value={car.priceUsed} />
              </dl>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                価格や相場は、年式や走行距離、市場環境によって大きく変動します。
                あくまで「目安」としてご覧ください。
              </p>
            </GlassCard>

            <GlassCard as="section" padding="md">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
                NAVIGATION
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Link
                  href="/cars"
                  className="rounded-full border border-tiffany-400/70 bg-white/80 px-4 py-1.5 font-medium text-tiffany-700 hover:bg-white"
                >
                  CARS一覧へ戻る
                </Link>
                <Link
                  href="/news"
                  className="rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-slate-700 hover:bg-white"
                >
                  関連しそうなニュースを見る
                </Link>
                <Link
                  href="/column"
                  className="rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-slate-700 hover:bg-white"
                >
                  オーナー本音コラムを読む
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}

type SpecRowProps = {
  label: string;
  value?: string;
};

function SpecRow({ label, value }: SpecRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <dt className="w-[40%] shrink-0 text-[10px] font-semibold text-slate-500">
        {label}
      </dt>
      <dd className="flex-1 text-[11px] text-slate-800">
        {value}
      </dd>
    </div>
  );
}
