// app/cars/[slug]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, getCarBySlug } from "@/lib/cars";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car)
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種は見つかりませんでした。",
    };

  return {
    title: `${car.name} | CAR DETAIL | CAR BOUTIQUE`,
    description:
      car.summaryLong ??
      car.summary ??
      "性格や維持費のイメージまで含めて整理した車種詳細ページです。",
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        {/* パンくず */}
        <nav className="mb-6 text-[11px] text-text-sub">
          <Link href="/" className="hover:underline hover:text-text-main">
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link href="/cars" className="hover:underline hover:text-text-main">
            CARS
          </Link>
          <span className="mx-1">/</span>
          <span>{car.name}</span>
        </nav>

        {/* 車タイトル */}
        <header className="mb-8">
          <p className="font-body-light text-[10px] tracking-[0.35em] text-text-sub">
            CAR DETAIL
          </p>
          <h1 className="font-display-serif mt-2 text-2xl font-semibold sm:text-3xl">
            {car.maker && `${car.maker} `}
            {car.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-sub">
            {car.summaryLong ?? car.summary}
          </p>
        </header>

        {/* 情報カード群 */}
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* メイン概要 */}
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-text-sub">
              {car.releaseYear && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {car.releaseYear}年式
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {car.segment}
                </span>
              )}
              {car.bodyType && (
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {car.bodyType}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{car.summaryLong}</p>
          </GlassCard>

          {/* ① 好きになれるポイント */}
          {car.positivePoints && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                好きになれるポイント
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-text-sub">
                {car.positivePoints.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* ② 気になるかもしれないポイント */}
          {car.negativePoints && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                気になるかもしれないポイント
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-text-sub">
                {car.negativePoints.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* ③ 合う人・合わない人 */}
          {car.matching && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                この車の合う人・合わない人
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-sm mb-1">向いている人</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-text-sub">
                    {car.matching.good.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">向かない人</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-text-sub">
                    {car.matching.bad.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ④ よくあるトラブル傾向 */}
          {car.troublePoints && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                よくあるトラブル傾向
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-text-sub">
                {car.troublePoints.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* ⑤ 維持費と付き合い方のコツ */}
          {car.maintenanceTips && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                維持費と付き合い方のコツ
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-text-sub">
                {car.maintenanceTips.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* ⑥ モデルチェンジで変わったところ */}
          {car.modelChange && (
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display-serif text-lg font-semibold mb-3">
                モデルチェンジで変わったところ
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-text-sub">
                {car.modelChange.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* MAIN SPEC */}
          <GlassCard className="p-4 sm:p-5">
            <h2 className="font-display-serif text-sm font-semibold tracking-[0.18em] text-text-sub">
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
              <SpecRow label="トランスミッション" value={car.transmission} />
              <SpecRow label="駆動方式" value={car.drive} />
              <SpecRow label="燃料" value={car.fuel} />
              <SpecRow
                label="実燃費目安"
                value={
                  car.fuelEconomy ? `${car.fuelEconomy}km/L前後` : undefined
                }
              />
            </div>
          </GlassCard>

          {/* SIZE & DIMENSION */}
          <GlassCard className="p-4 sm:p-5">
            <h2 className="font-display-serif text-sm font-semibold tracking-[0.18em] text-text-sub">
              SIZE & DIMENSION
            </h2>
            <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2 sm:text-sm">
              <SpecRow
                label="全長×全幅×全高"
                value={
                  car.sizeMmLength &&
                  car.sizeMmWidth &&
                  car.sizeMmHeight
                    ? `${car.sizeMmLength} × ${car.sizeMmWidth} × ${car.sizeMmHeight}mm`
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
                  car.weightKg ? `${car.weightKg.toLocaleString()}kg` : undefined
                }
              />
            </div>
          </GlassCard>

          {/* 戻るリンク */}
          <div className="text-right">
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

type SpecRowProps = { label: string; value?: string | null };
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
