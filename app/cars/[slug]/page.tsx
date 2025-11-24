// app/cars/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCars, getCarBySlug } from "@/lib/cars";

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

  const recommendForLines = car.recommendFor
    ? car.recommendFor.split("\n").filter(Boolean)
    : [];
  const notForLines = car.notFor ? car.notFor.split("\n").filter(Boolean) : [];

  return (
    <main className="min-h-screen px-4 pt-20 pb-24 md:px-8 md:pt-24">
      <article className="mx-auto flex max-w-5xl flex-col gap-8 md:gap-10">
        {/* パンくず */}
        <nav className="text-[11px] text-slate-500">
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

        {/* Car detail */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            CAR DETAIL
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            {car.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {car.maker}
              {car.releaseYear ? `・${car.releaseYear}年` : null}
            </span>
            {car.bodyType && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.bodyType}
              </span>
            )}
            {car.segment && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.segment}
              </span>
            )}
            {car.grade && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.grade}
              </span>
            )}
          </div>

          {car.summaryLong || car.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
              {car.summaryLong ?? car.summary}
            </p>
          ) : null}
        </section>

        {/* 好きになれるポイント */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            好きになれるポイント
          </h2>
          {car.pros ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {car.pros}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">準備中です。</p>
          )}
        </section>

        {/* 気になるかもしれないポイント */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            気になるかもしれないポイント
          </h2>
          {car.cons ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {car.cons}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">準備中です。</p>
          )}
        </section>

        {/* この車の合う人・合わない人 */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            この車の合う人・合わない人
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-[#0ABAB5]">
                相性がいい人
              </h3>
              {recommendForLines.length > 0 ? (
                <ul className="mt-2 space-y-1.5 list-none text-sm leading-relaxed text-slate-700">
                  {recommendForLines.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#0ABAB5]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">準備中です。</p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-700">
                他の車をおすすめしたい人
              </h3>
              {notForLines.length > 0 ? (
                <ul className="mt-2 space-y-1.5 list-none text-sm leading-relaxed text-slate-700">
                  {notForLines.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-slate-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">準備中です。</p>
              )}
            </div>
          </div>
        </section>

        {/* よくあるトラブル傾向 */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            よくあるトラブル傾向
          </h2>
          {car.troubleTrends ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {car.troubleTrends}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">準備中です。</p>
          )}
        </section>

        {/* 維持費と付き合い方のコツ */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            維持費と付き合い方のコツ
          </h2>
          {car.maintenanceTips ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {car.maintenanceTips}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">準備中です。</p>
          )}
        </section>

        {/* モデルチェンジで変わったところ */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            モデルチェンジで変わったところ
          </h2>
          {car.changeSummary ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {car.changeSummary}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">準備中です。</p>
          )}
        </section>

        {/* MAIN SPEC */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            MAIN SPEC
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            {car.bodyType && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">ボディタイプ</dt>
                <dd className="flex-1">{car.bodyType}</dd>
              </div>
            )}
            {car.engine && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">エンジン</dt>
                <dd className="flex-1">{car.engine}</dd>
              </div>
            )}
            {(car.powerPs || car.torqueNm) && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">出力</dt>
                <dd className="flex-1">
                  {car.powerPs ? `${car.powerPs}ps` : ""}
                  {car.powerPs && car.torqueNm ? " / " : ""}
                  {car.torqueNm ? `${car.torqueNm}Nm` : ""}
                </dd>
              </div>
            )}
            {car.transmission && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">
                  トランスミッション
                </dt>
                <dd className="flex-1">{car.transmission}</dd>
              </div>
            )}
            {car.drive && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">駆動方式</dt>
                <dd className="flex-1">{car.drive}</dd>
              </div>
            )}
            {car.fuel && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">燃料</dt>
                <dd className="flex-1">{car.fuel}</dd>
              </div>
            )}
            {car.fuelEconomy && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">燃費目安</dt>
                <dd className="flex-1">{car.fuelEconomy}</dd>
              </div>
            )}
            {car.costNewPriceRange && (
              <div className="flex gap-3 pt-2">
                <dt className="w-28 shrink-0 text-slate-500">新車価格帯</dt>
                <dd className="flex-1">{car.costNewPriceRange}</dd>
              </div>
            )}
            {car.costUsedPriceRange && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-slate-500">中古価格帯</dt>
                <dd className="flex-1">{car.costUsedPriceRange}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* SIZE & DIMENSION */}
        <section className="rounded-3xl bg-white/90 p-6 shadow-md shadow-slate-200 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
            SIZE &amp; DIMENSION
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-700">
            {(car.sizeMmLength || car.sizeMmWidth || car.sizeMmHeight) && (
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-500">
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
                <dt className="w-32 shrink-0 text-slate-500">
                  ホイールベース
                </dt>
                <dd className="flex-1">{car.wheelbaseMm}mm</dd>
              </div>
            )}
            {car.weightKg && (
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-500">車両重量</dt>
                <dd className="flex-1">{car.weightKg}kg</dd>
              </div>
            )}
          </dl>
        </section>

        {/* 公式サイト */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/cars"
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            ← 車種一覧へ戻る
          </Link>
          {car.referenceUrl && (
            <a
              href={car.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-xs font-medium text-white shadow-md shadow-slate-400/40 hover:bg-slate-800"
            >
              メーカー公式サイト
            </a>
          )}
        </section>
      </article>
    </main>
  );
}
