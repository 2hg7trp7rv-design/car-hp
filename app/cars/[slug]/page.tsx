// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種ページは見つかりませんでした。",
    };
  }

  const title = `${car.name} | CARS`;
  const description =
    car.summaryLong ??
    car.summary ??
    "CAR BOUTIQUEによる車種詳細ページです。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${car.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

function formatPower(car: CarItem): string | undefined {
  if (car.powerPs) return `${car.powerPs}ps`;
  if (car.powerKw) return `${car.powerKw}kW`;
  return undefined;
}

function formatTorque(car: CarItem): string | undefined {
  if (car.torqueNm) return `${car.torqueNm}Nm`;
  if (car.torqueKgfm) return `${car.torqueKgfm}kgfm`;
  return undefined;
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const power = formatPower(car);
  const torque = formatTorque(car);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{car.name}</span>
        </nav>

        {/* ヘッダーセクション */}
        <header className="mb-10 space-y-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-[1px] shadow-soft-card">
          <div className="h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-7 text-slate-50 md:px-8 md:py-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] tracking-[0.22em] text-slate-300">
              <span className="rounded-full bg-slate-800/80 px-3 py-1">
                CARS DETAIL
              </span>
              {car.maker && (
                <span className="rounded-full bg-slate-800/80 px-3 py-1">
                  {car.maker}
                </span>
              )}
              {car.bodyType && (
                <span className="rounded-full bg-slate-800/80 px-3 py-1">
                  {car.bodyType}
                </span>
              )}
              {car.difficulty && (
                <span className="rounded-full bg-slate-800/80 px-3 py-1">
                  難易度{car.difficulty}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-balance text-2xl font-semibold leading-snug tracking-[0.08em] md:text-3xl">
                  {car.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
                  {car.grade && <span>{car.grade}</span>}
                  {car.segment && (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px]">
                      {car.segment}
                    </span>
                  )}
                  {car.releaseYear && (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px]">
                      登場{car.releaseYear}年頃
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 text-right text-[11px] text-slate-200 md:items-end">
                {car.engine && <p>POWERTRAIN{car.engine}</p>}
                {power && <p>MAX POWER{power}</p>}
                {torque && <p>MAX TORQUE{torque}</p>}
              </div>
            </div>
          </div>
        </header>

        {/* 本文2カラム: ストーリー＋スペック */}
        <div className="mb-12 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ストーリー側 */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-xs font-medium tracking-[0.2em] text-slate-500">
              CHARACTER
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-800">
              {car.summaryLong ??
                car.summary ??
                "この車種についての詳しいストーリーや所有感、トラブル傾向などは、今後少しずつ追記していく予定です。"}
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 text-xs text-slate-700">
              <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500">
                OWNER&apos;S NOTE PLAN
              </p>
              <p className="mt-2 leading-relaxed">
                将来的にはここに、「高速道路での疲れ方」「街乗りでの扱いやすさ」
                「壊れたときの体験談や費用感」といったリアルな声をまとめ、
                ニュースやカタログスペックだけでは見えない部分を補っていく予定です。
              </p>
            </div>
          </section>

          {/* スペック側 */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 text-xs text-slate-800 shadow-sm">
              <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-slate-500">
                BASIC SPEC
              </h2>
              <dl className="space-y-2">
                {car.maker && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">メーカー</dt>
                    <dd>{car.maker}</dd>
                  </div>
                )}
                {car.bodyType && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">
                      ボディタイプ
                    </dt>
                    <dd>{car.bodyType}</dd>
                  </div>
                )}
                {car.segment && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">セグメント</dt>
                    <dd>{car.segment}</dd>
                  </div>
                )}
                {car.engine && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">エンジン</dt>
                    <dd>{car.engine}</dd>
                  </div>
                )}
                {power && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">最高出力</dt>
                    <dd>{power}</dd>
                  </div>
                )}
                {torque && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">最大トルク</dt>
                    <dd>{torque}</dd>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">
                      トランスミッション
                    </dt>
                    <dd>{car.transmission}</dd>
                  </div>
                )}
                {car.drive && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">駆動方式</dt>
                    <dd>{car.drive}</dd>
                  </div>
                )}
                {car.fuel && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">燃料種別</dt>
                    <dd>{car.fuel}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs text-slate-800 shadow-sm">
              <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-slate-500">
                SIZE &amp; WEIGHT
              </h2>
              <dl className="space-y-2">
                {car.size && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">サイズ</dt>
                    <dd>{car.size}</dd>
                  </div>
                )}
                {car.weight && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">車両重量</dt>
                    <dd>{car.weight}</dd>
                  </div>
                )}
                {car.wheelbase && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-slate-400">ホイールベース</dt>
                    <dd>{car.wheelbase}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs text-slate-800 shadow-sm">
              <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-slate-500">
                COST &amp; MAINTENANCE PLAN
              </h2>
              <p className="leading-relaxed text-slate-700">
                維持費の目安や、よくあるトラブルとその費用感、
                「この価格帯なら他にどんな選択肢があるか」といった比較軸も、
                少しずつ整理していく予定です。
                実体験ベースのコラムとリンクさせていきます。
              </p>
            </div>
          </aside>
        </div>

        {/* 回遊導線 NEWS / COLUMN */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 text-xs text-slate-800 shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-tiffany-700">
              NEWS
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              この車種やメーカーの最新ニュースもあわせてチェック。
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              CARSページで気になった車種があれば、
              NEWSページでメーカーを絞り込んで最新情報を追うイメージです。
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href={"/news"}
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white transition hover:bg-slate-700"
              >
                NEWS一覧へ
              </Link>
              {car.maker && (
                <Link
                  href={`/news?maker=${encodeURIComponent(car.maker)}`}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-slate-700 transition hover:border-slate-500"
                >
                  {car.maker}のNEWSだけ見る
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs text-slate-800 shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
              COLUMN
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              トラブルや修理のリアルな話はコラムで。
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              例えばB48エンジンの持病や、輸入車の保証・延長保証の実態など、
              少しシビアな話はCOLUMNセクションと紐づけて整理していきます。
            </p>
            <div className="mt-3">
              <Link
                href="/column"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-slate-700 transition hover:border-slate-500"
              >
                コラム一覧へ
              </Link>
            </div>
          </div>
        </section>

        {/* 戻るリンク */}
        <div className="mt-8 flex justify-between border-t border-slate-200 pt-6 text-xs">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-slate-500 transition hover:text-slate-900"
          >
            <span className="text-[10px]">←</span>
            <span className="tracking-[0.18em]">CARS一覧に戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
