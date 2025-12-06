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

// 表示用フォーマッタ系（必要最低限）
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
}

// Page コンポーネント本体（Next.js が要求する型に合わせる）
export default async function CarDetailPage({ params }: PageProps) {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    notFound();
  }

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  return (
    <main className="min-h-screen bg-slate-950/90 text-slate-50">
      <section className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-950/95">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:py-14">
          <div className="flex-1 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              CAR DATABASE
            </p>
            <h1 className="text-2xl font-semibold tracking-wide text-slate-50 md:text-3xl">
              {title}
            </h1>
            {car.summaryLong && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                {car.summaryLong}
              </p>
            )}
            {!car.summaryLong && car.summary && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                {car.summary}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 text-xs text-slate-300 md:items-end">
            {car.segment && (
              <p className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                {car.segment}
              </p>
            )}
            {car.difficulty && (
              <p className="text-[11px] tracking-wide text-slate-400">
                維持難易度:
                <span className="ml-1 font-medium text-slate-100">
                  {car.difficulty}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800/60 bg-slate-950/95">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] md:py-10">
          <GlassCard className="h-full bg-slate-900/60">
            <div className="space-y-4 p-4 md:p-5">
              <h2 className="text-sm font-semibold tracking-wide text-slate-50">
                基本スペック
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-200 md:grid-cols-3">
                {car.releaseYear && (
                  <>
                    <dt className="text-slate-400">登場年</dt>
                    <dd className="col-span-1 md:col-span-2">
                      {car.releaseYear}年頃
                    </dd>
                  </>
                )}
                {car.engine && (
                  <>
                    <dt className="text-slate-400">エンジン</dt>
                    <dd className="col-span-1 md:col-span-2">{car.engine}</dd>
                  </>
                )}
                {car.powerPs && (
                  <>
                    <dt className="text-slate-400">最高出力</dt>
                    <dd className="col-span-1 md:col-span-2">
                      {car.powerPs}ps
                    </dd>
                  </>
                )}
                {car.torqueNm && (
                  <>
                    <dt className="text-slate-400">最大トルク</dt>
                    <dd className="col-span-1 md:col-span-2">
                      {car.torqueNm}Nm
                    </dd>
                  </>
                )}
                {car.drive && (
                  <>
                    <dt className="text-slate-400">駆動方式</dt>
                    <dd className="col-span-1 md:col-span-2">{car.drive}</dd>
                  </>
                )}
                {car.transmission && (
                  <>
                    <dt className="text-slate-400">トランスミッション</dt>
                    <dd className="col-span-1 md:col-span-2">
                      {car.transmission}
                    </dd>
                  </>
                )}
                {zeroTo100 && (
                  <>
                    <dt className="text-slate-400">加速性能</dt>
                    <dd className="col-span-1 md:col-span-2">{zeroTo100}</dd>
                  </>
                )}
              </dl>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="bg-slate-900/60">
              <div className="space-y-3 p-4 md:p-5">
                <h2 className="text-sm font-semibold tracking-wide text-slate-50">
                  このクルマの性格
                </h2>
                {car.costImpression && (
                  <p className="text-xs leading-relaxed text-slate-200">
                    {car.costImpression}
                  </p>
                )}
                {!car.costImpression && car.summary && (
                  <p className="text-xs leading-relaxed text-slate-200">
                    {car.summary}
                  </p>
                )}
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <Link
                href="/cars"
                className="text-xs font-medium text-sky-300 underline-offset-4 hover:underline"
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
