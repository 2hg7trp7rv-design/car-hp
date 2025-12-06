// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// CarItem の拡張版（任意フィールドだけ追加）
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  // 0-100km/h 加速タイム（秒）
  zeroTo100?: number;
};

// SSG 用: 動的パス生成
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({
    slug: car.slug,
  }));
}

// メタデータ生成
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const titleBase = car.name ?? car.slug;
  const description =
    car.summaryLong ??
    car.summary ??
    "CAR BOUTIQUEによる車種別インプレッションとオーナー目線の解説。";

  return {
    title: `${titleBase} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${titleBase} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(car.slug)}`,
    },
  };
}

// 表示用フォーマッタ系
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
}

// Page コンポーネント本体
export default async function CarDetailPage({ params }: PageProps) {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    notFound();
  }

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  return (
    <main className="min-h-screen">
      {/* ヒーローエリア：他ページと同系の淡いグラデーション */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-white/90 via-white/80 to-ice-vapor/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end lg:px-8">
          <div className="flex-1 space-y-3">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
              CAR DATABASE
            </p>
            <h1 className="serif-heading text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {car.summaryLong && (
              <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                {car.summaryLong}
              </p>
            )}
            {!car.summaryLong && car.summary && (
              <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                {car.summary}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 text-[11px] text-slate-600 md:items-end">
            {car.segment && (
              <p className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] tracking-[0.18em] text-slate-700">
                {car.segment}
              </p>
            )}
            {car.difficulty && (
              <p className="tracking-[0.05em] text-slate-600">
                維持難易度:
                <span className="ml-1 font-medium text-slate-800">
                  {car.difficulty}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 本文エリア：淡い背景＋ガラスカード */}
      <section className="bg-gradient-to-b from-ice-vapor/80 via-ice-vapor/60 to-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] lg:px-8">
          {/* 基本スペック */}
          <GlassCard className="h-full border-slate-200/80 bg-white/85">
            <div className="space-y-4 p-4 sm:p-5">
              <h2 className="serif-heading text-sm font-semibold tracking-[0.12em] text-slate-900">
                基本スペック
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] text-slate-800 sm:grid-cols-3">
                {car.releaseYear && (
                  <>
                    <dt className="text-text-sub">登場年</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.releaseYear}年頃
                    </dd>
                  </>
                )}
                {car.engine && (
                  <>
                    <dt className="text-text-sub">エンジン</dt>
                    <dd className="col-span-1 sm:col-span-2">{car.engine}</dd>
                  </>
                )}
                {car.powerPs && (
                  <>
                    <dt className="text-text-sub">最高出力</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.powerPs}ps
                    </dd>
                  </>
                )}
                {car.torqueNm && (
                  <>
                    <dt className="text-text-sub">最大トルク</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.torqueNm}Nm
                    </dd>
                  </>
                )}
                {car.drive && (
                  <>
                    <dt className="text-text-sub">駆動方式</dt>
                    <dd className="col-span-1 sm:col-span-2">{car.drive}</dd>
                  </>
                )}
                {car.transmission && (
                  <>
                    <dt className="text-text-sub">トランスミッション</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.transmission}
                    </dd>
                  </>
                )}
                {zeroTo100 && (
                  <>
                    <dt className="text-text-sub">加速性能</dt>
                    <dd className="col-span-1 sm:col-span-2">{zeroTo100}</dd>
                  </>
                )}
              </dl>
            </div>
          </GlassCard>

          {/* 性格・維持費コメント */}
          <div className="space-y-4">
            <GlassCard className="border-slate-200/80 bg-white/85">
              <div className="space-y-3 p-4 sm:p-5">
                <h2 className="serif-heading text-sm font-semibold tracking-[0.12em] text-slate-900">
                  このクルマの性格
                </h2>
                {car.costImpression && (
                  <p className="text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    {car.costImpression}
                  </p>
                )}
                {!car.costImpression && car.summary && (
                  <p className="text-[11px] leading-relaxed text-text-sub sm:text-xs">
                    {car.summary}
                  </p>
                )}
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <Link
                href="/cars"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
