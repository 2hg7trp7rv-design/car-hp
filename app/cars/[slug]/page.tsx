// app/cars/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCars, getCarBySlug, type Car } from "@/lib/cars";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種の情報が見つかりませんでした。",
    };
  }

  const title = `${car.name}の詳細 | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "スペック、長所短所、トラブル傾向、維持費感をまとめた車種解説ページです。";

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

  const difficultyLabel =
    car.difficulty === "advanced"
      ? "マニアック寄り"
      : car.difficulty === "basic"
      ? "ライト向け"
      : null;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top_left,#0ABAB5_0%,#ffffff_45%,#ffffff_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* パンくず */}
        <nav className="text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link href="/cars" className="hover:text-slate-700">
            CARS
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-700">{car.name}</span>
        </nav>

        {/* ヘッダー */}
        <section className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-200 backdrop-blur md:p-8">
          <div className="mb-4 text-xs font-semibold tracking-[0.18em] text-slate-500">
            CAR DETAIL
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {car.name}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>
              {car.maker}
              {car.releaseYear ? `・${car.releaseYear}年` : null}
            </span>
            {car.bodyType && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {car.bodyType}
              </span>
            )}
            {car.segment && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {car.segment}
              </span>
            )}
            {difficultyLabel && (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                {difficultyLabel}の解説
              </span>
            )}
          </div>
          {car.summaryLong ? (
            <p className="text-sm leading-relaxed text-slate-700 md:text-base">
              {car.summaryLong}
            </p>
          ) : car.summary ? (
            <p className="text-sm leading-relaxed text-slate-700 md:text-base">
              {car.summary}
            </p>
          ) : null}
        </section>

        {/* スペック&サイズ */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-4 text-sm font-semibold tracking-[0.18em] text-slate-500">
              MAIN SPEC
            </h2>
            <dl className="space-y-2 text-sm text-slate-700">
              {car.engine && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">エンジン</dt>
                  <dd className="flex-1">{car.engine}</dd>
                </div>
              )}
              {(car.powerPs || car.torqueNm) && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">出力</dt>
                  <dd className="flex-1">
                    {car.powerPs ? `${car.powerPs}ps` : ""}
                    {car.powerPs && car.torqueNm ? " / " : ""}
                    {car.torqueNm ? `${car.torqueNm}Nm` : ""}
                  </dd>
                </div>
              )}
              {car.transmission && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">
                    トランスミッション
                  </dt>
                  <dd className="flex-1">{car.transmission}</dd>
                </div>
              )}
              {car.drive && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">駆動方式</dt>
                  <dd className="flex-1">{car.drive}</dd>
                </div>
              )}
              {car.fuel && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">燃料</dt>
                  <dd className="flex-1">{car.fuel}</dd>
                </div>
              )}
              {car.fuelEconomy && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">燃費目安</dt>
                  <dd className="flex-1">{car.fuelEconomy}</dd>
                </div>
              )}
              {car.specHighlights && (
                <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  {car.specHighlights}
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-4 text-sm font-semibold tracking-[0.18em] text-slate-500">
              SIZE &amp; DIMENSION
            </h2>
            <dl className="space-y-2 text-sm text-slate-700">
              {(car.sizeMmLength || car.sizeMmWidth || car.sizeMmHeight) && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">
                    全長×全幅×全高
                  </dt>
                  <dd className="flex-1">
                    {car.sizeMmLength ?? "−"}×
                    {car.sizeMmWidth ?? "−"}×
                    {car.sizeMmHeight ?? "−"}mm
                  </dd>
                </div>
              )}
              {car.wheelbaseMm && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">
                    ホイールベース
                  </dt>
                  <dd className="flex-1">{car.wheelbaseMm}mm</dd>
                </div>
              )}
              {car.weightKg && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">車両重量</dt>
                  <dd className="flex-1">{car.weightKg}kg</dd>
                </div>
              )}
              {car.costNewPriceRange && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">
                    新車価格帯
                  </dt>
                  <dd className="flex-1">{car.costNewPriceRange}</dd>
                </div>
              )}
              {car.costUsedPriceRange && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">
                    中古価格帯
                  </dt>
                  <dd className="flex-1">{car.costUsedPriceRange}</dd>
                </div>
              )}
              {car.maintenanceCostLevel && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">維持費感</dt>
                  <dd className="flex-1">
                    {car.maintenanceCostLevel === "low"
                      ? "国産並み〜やや高め"
                      : car.maintenanceCostLevel === "medium"
                      ? "やや高め"
                      : "高め(それなりの覚悟が必要)"}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* 好き/気になるポイント */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
              好きになれるポイント
            </h2>
            {car.pros ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {car.pros}
              </p>
            ) : (
              <p className="text-sm text-slate-400">準備中です。</p>
            )}
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
              気になるかもしれないポイント
            </h2>
            {car.cons ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {car.cons}
              </p>
            ) : (
              <p className="text-sm text-slate-400">準備中です。</p>
            )}
          </div>
        </section>

        {/* トラブル&維持費 */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
              よくあるトラブル傾向
            </h2>
            {car.troubleTrends ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {car.troubleTrends}
              </p>
            ) : (
              <p className="text-sm text-slate-400">準備中です。</p>
            )}
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
            <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
              維持費と付き合い方のコツ
            </h2>
            {car.maintenanceTips ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {car.maintenanceTips}
              </p>
            ) : (
              <p className="text-sm text-slate-400">準備中です。</p>
            )}
          </div>
        </section>

        {/* このクルマと合う/合わない */}
        <section className="rounded-3xl bg-white/80 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
            このクルマと合う人・合わない人
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold text-teal-700">
                相性がいい人
              </h3>
              {car.recommendFor ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {car.recommendFor}
                </p>
              ) : (
                <p className="text-sm text-slate-400">準備中です。</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold text-slate-700">
                他のクルマをおすすめしたい人
              </h3>
              {car.notFor ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {car.notFor}
                </p>
              ) : (
                <p className="text-sm text-slate-400">準備中です。</p>
              )}
            </div>
          </div>

          {car.changeSummary && (
            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="mb-1 font-semibold text-slate-700">
                モデルチェンジで変わったところ
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {car.changeSummary}
              </p>
            </div>
          )}

          {car.referenceUrl && (
            <div className="mt-4">
              <a
                href={car.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
              >
                メーカー公式サイトを見る
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
