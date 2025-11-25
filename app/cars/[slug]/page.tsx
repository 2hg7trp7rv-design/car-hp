// app/cars/[slug]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { getAllCars, getCarBySlug } from "@/lib/cars";

type Props = {
  params: { slug: string };
};

// 静的生成用パラメータ
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

// メタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種は見つかりませんでした。",
    };
  }

  const title = `${car.name} | CAR DETAIL | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "性格や維持費のイメージまで含めて整理した車種詳細ページです。";

  return {
    title,
    description,
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  // makerや年式などは無い場合もあるので安全に扱う
  const makerLabel = car.maker ?? "";
  const yearLabel = car.releaseYear ? `${car.releaseYear}年式` : "";
  const segmentLabel = car.segment ?? "";
  const bodyTypeLabel = car.bodyType ?? "";

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        {/* パンくず */}
        <nav className="mb-4 text-[11px] text-text-sub">
          <Link
            href="/"
            className="underline-offset-4 hover:text-text-main hover:underline"
          >
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link
            href="/cars"
            className="underline-offset-4 hover:text-text-main hover:underline"
          >
            CARS
          </Link>
          <span className="mx-1">/</span>
          <span>{car.name}</span>
        </nav>

        {/* 見出し＋概要カード */}
        <div className="mb-6 sm:mb-8">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            CAR DETAIL
          </p>
          <h1 className="font-display-serif mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {makerLabel && `${makerLabel} `}
            {car.name}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-sm">
            {car.summaryLong ?? car.summary}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* 基本情報カード */}
          <GlassCard className="p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-text-sub">
              {yearLabel && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {yearLabel}
                </span>
              )}
              {segmentLabel && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {segmentLabel}
                </span>
              )}
              {bodyTypeLabel && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {bodyTypeLabel}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-text-sub sm:text-sm">
              {car.summaryLong ?? car.summary}
            </p>
          </GlassCard>

          {/* MAIN SPEC */}
          <GlassCard className="p-4 sm:p-5">
            <h2 className="font-display-serif text-sm font-semibold tracking-[0.18em] text-text-sub sm:text-xs">
              MAIN SPEC
            </h2>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2 sm:text-sm">
              <SpecRow label="ボディタイプ" value={car.bodyType} />
              <SpecRow label="エンジン" value={car.engine} />
              <SpecRow
                label="最高出力"
                value={
                  car.powerPs ? `${car.powerPs.toLocaleString()}ps` : undefined
                }
              />
              <SpecRow
                label="最大トルク"
                value={
                  car.torqueNm
                    ? `${car.torqueNm.toLocaleString()}Nm`
                    : undefined
                }
              />
              <SpecRow label="トランスミッション" value={car.transmission} />
              <SpecRow label="駆動方式" value={car.drive} />
              <SpecRow label="燃料" value={car.fuel} />
              <SpecRow
                label="実燃費目安"
                value={car.fuelEconomy ? `${car.fuelEconomy}km/L前後` : undefined}
              />
            </div>
          </GlassCard>

          {/* コストイメージ */}
          {(car.costNewPriceRange || car.costUsedPriceRange) && (
            <GlassCard className="p-4 sm:p-5">
              <h2 className="font-display-serif text-sm font-semibold tracking-[0.18em] text-text-sub sm:text-xs">
                COST IMAGE
              </h2>
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2 sm:text-sm">
                <SpecRow label="新車価格の目安" value={car.costNewPriceRange} />
                <SpecRow label="中古価格の目安" value={car.costUsedPriceRange} />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-text-sub">
                価格帯はグレードや装備、走行距離、状態によって大きく変動します。
                あくまでざっくりとした目安として捉えてください。
              </p>
            </GlassCard>
          )}

          {/* SIZE & DIMENSION */}
          {(car.sizeMmLength ||
            car.sizeMmWidth ||
            car.sizeMmHeight ||
            car.wheelbaseMm ||
            car.weightKg) && (
            <GlassCard className="p-4 sm:p-5">
              <h2 className="font-display-serif text-sm font-semibold tracking-[0.18em] text-text-sub sm:text-xs">
                SIZE &amp; DIMENSION
              </h2>
              <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2 sm:text-sm">
                <SpecRow
                  label="全長×全幅×全高"
                  value={
                    car.sizeMmLength &&
                    car.sizeMmWidth &&
                    car.sizeMmHeight
                      ? `${car.sizeMmLength.toLocaleString()} × ${car.sizeMmWidth.toLocaleString()} × ${car.sizeMmHeight.toLocaleString()}mm`
                      : undefined
                  }
                />
                <SpecRow
                  label="ホイールベース"
                  value={
                    car.wheelbaseMm
                      ? `${car.wheelbaseMm.toLocaleString()}mm`
                      : undefined
                  }
                />
                <SpecRow
                  label="車両重量"
                  value={
                    car.weightKg
                      ? `${car.weightKg.toLocaleString()}kg`
                      : undefined
                  }
                />
              </div>
            </GlassCard>
          )}

          {/* 一覧へ戻る */}
          <div className="mt-2 text-right">
            <Link
              href="/cars"
              className="text-[11px] text-text-sub underline-offset-4 hover:text-text-main hover:underline"
            >
              車種一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// 小さな行表示コンポーネント（undefinedなら行ごと非表示）
type SpecRowProps = {
  label: string;
  value?: string | null;
};

function SpecRow({ label, value }: SpecRowProps) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-sub">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
