// app/cars/[slug]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { getAllCars, getCarBySlug, type CarItemInternal } from "@/lib/cars";

type Props = { params: { slug: string } };

// SSG 用パス生成
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

// SEO メタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
    };
  }

  const title = car.name ?? car.slug;
  const description =
    car.summaryLong ??
    car.summary ??
    "CAR BOUTIQUEによる車種別インプレッションとオーナー目線の解説。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
  };
}

// string / string[] / undefined を配列に正規化
function normalizeList(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => v.trim()).filter(Boolean);
  }
  // 1本の文字列の場合は、改行か「・」で区切る
  return value
    .split(/(?:\r?\n|・)/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  // ①〜⑥ 用データ整形
  const positivePoints = normalizeList(
    car.positivePoints ?? car.favoritePoints,
  );
  const negativePoints = normalizeList(
    car.negativePoints ?? car.cautionPoints,
  );

  const matchingGood = normalizeList(
    car.matching?.good ??
      car.matchingGood ??
      car.suitableFor,
  );
  const matchingBad = normalizeList(
    car.matching?.bad ??
      car.matchingBad ??
      car.notFor,
  );

  const troublePoints = normalizeList(
    car.troublePoints ?? car.troubleFaq,
  );

  const maintenanceTips = normalizeList(
    car.maintenanceTips ?? car.ownershipTips,
  );

  const modelChangePoints = normalizeList(
    car.modelChange ?? car.modelChangePoints,
  );

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        {/* パンくず */}
        <nav className="mb-6 text-[11px] text-text-sub sm:mb-8">
          <Link href="/" className="hover:underline">
            HOME
          </Link>
          <span className="mx-1">/</span>
          <Link href="/cars" className="hover:underline">
            CARS
          </Link>
          <span className="mx-1">/</span>
          <span>{car.name}</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-8 sm:mb-10">
          <p className="text-[11px] tracking-[0.35em] text-text-sub">
            CAR DETAIL
          </p>
          <h1 className="font-display-serif mt-3 text-2xl leading-tight tracking-tight sm:text-3xl">
            {car.maker?.toUpperCase()}{" "}
            {car.name}
          </h1>
          {car.summaryLong && (
            <p className="mt-4 text-sm leading-relaxed text-text-sub sm:text-[15px]">
              {car.summaryLong}
            </p>
          )}
        </header>

        {/* 基本情報 + リード */}
        <section className="mb-8 sm:mb-10">
          <GlassCard className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
              {car.releaseYear && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-text-sub shadow-soft">
                  {car.releaseYear}年式
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-text-sub shadow-soft">
                  {car.segment}
                </span>
              )}
              {car.bodyType && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-text-sub shadow-soft">
                  {car.bodyType}
                </span>
              )}
            </div>
            {car.summary && (
              <p className="text-sm leading-relaxed text-text-main sm:text-[15px]">
                {car.summary}
              </p>
            )}
          </GlassCard>
        </section>

        {/* ① 好きになれるポイント */}
        {positivePoints.length > 0 && (
          <section className="mb-6 sm:mb-7">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-3 font-display-serif text-lg font-semibold">
                好きになれるポイント
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                {positivePoints.map((p, i) => (
                  <li key={i}>・{p}</li>
                ))}
              </ul>
            </GlassCard>
          </section>
        )}

        {/* ② 気になるかもしれないポイント */}
        {negativePoints.length > 0 && (
          <section className="mb-6 sm:mb-7">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-3 font-display-serif text-lg font-semibold">
                気になるかもしれないポイント
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                {negativePoints.map((p, i) => (
                  <li key={i}>・{p}</li>
                ))}
              </ul>
            </GlassCard>
          </section>
        )}

        {/* ③ この車の合う人・合わない人 */}
        {(matchingGood.length > 0 || matchingBad.length > 0) && (
          <section className="mb-6 sm:mb-7">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-4 font-display-serif text-lg font-semibold">
                この車の合う人・合わない人
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {matchingGood.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-text-main">
                      相性がいい人
                    </h3>
                    <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                      {matchingGood.map((p, i) => (
                        <li key={i}>・{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchingBad.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-text-main">
                      おすすめしづらい人
                    </h3>
                    <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                      {matchingBad.map((p, i) => (
                        <li key={i}>・{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassCard>
          </section>
        )}

        {/* ④ よくあるトラブル傾向 */}
        {troublePoints.length > 0 && (
          <section className="mb-6 sm:mb-7">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-3 font-display-serif text-lg font-semibold">
                よくあるトラブル傾向
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                {troublePoints.map((p, i) => (
                  <li key={i}>・{p}</li>
                ))}
              </ul>
            </GlassCard>
          </section>
        )}

        {/* ⑤ 維持費と付き合い方のコツ */}
        {maintenanceTips.length > 0 && (
          <section className="mb-6 sm:mb-7">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-3 font-display-serif text-lg font-semibold">
                維持費と付き合い方のコツ
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                {maintenanceTips.map((p, i) => (
                  <li key={i}>・{p}</li>
                ))}
              </ul>
            </GlassCard>
          </section>
        )}

        {/* ⑥ モデルチェンジで変わったところ */}
        {modelChangePoints.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <GlassCard className="p-6 sm:p-8">
              <h2 className="mb-3 font-display-serif text-lg font-semibold">
                モデルチェンジで変わったところ
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-text-sub">
                {modelChangePoints.map((p, i) => (
                  <li key={i}>・{p}</li>
                ))}
              </ul>
            </GlassCard>
          </section>
        )}

        {/* MAIN SPEC / SIZE & DIMENSION は小さめカード */}
        <section className="mt-4 grid gap-6 sm:grid-cols-2">
          <GlassCard className="p-5 text-xs leading-relaxed text-text-sub sm:p-6 sm:text-sm">
            <h2 className="mb-3 font-display-serif text-base font-semibold text-text-main">
              MAIN SPEC
            </h2>
            <dl className="space-y-2">
              {car.bodyType && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    ボディタイプ
                  </dt>
                  <dd>{car.bodyType}</dd>
                </div>
              )}
              {car.engine && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    エンジン
                  </dt>
                  <dd>{car.engine}</dd>
                </div>
              )}
              {car.powerPs && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    最高出力
                  </dt>
                  <dd>{car.powerPs}ps</dd>
                </div>
              )}
              {car.transmission && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    トランスミッション
                  </dt>
                  <dd>{car.transmission}</dd>
                </div>
              )}
              {car.drive && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    駆動方式
                  </dt>
                  <dd>{car.drive}</dd>
                </div>
              )}
              {car.fuel && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    燃料
                  </dt>
                  <dd>{car.fuel}</dd>
                </div>
              )}
            </dl>
          </GlassCard>

          <GlassCard className="p-5 text-xs leading-relaxed text-text-sub sm:p-6 sm:text-sm">
            <h2 className="mb-3 font-display-serif text-base font-semibold text-text-main">
              SIZE & DIMENSION
            </h2>
            <dl className="space-y-2">
              {car.size && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    全長×全幅×全高
                  </dt>
                  <dd>{car.size}</dd>
                </div>
              )}
              {car.wheelbaseMm && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    ホイールベース
                  </dt>
                  <dd>{car.wheelbaseMm}mm</dd>
                </div>
              )}
              {car.weightKg && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-text-sub/70">
                    車両重量
                  </dt>
                  <dd>{car.weightKg}kg</dd>
                </div>
              )}
            </dl>
          </GlassCard>
        </section>

        {/* 一覧へのリンク */}
        <div className="mt-8 text-right">
          <Link
            href="/cars"
            className="text-[11px] text-text-sub underline-offset-4 hover:text-text-main hover:underline"
          >
            車種一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
