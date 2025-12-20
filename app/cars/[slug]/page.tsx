// app/cars/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, Sparkles, ChevronRight, ArrowLeft } from "lucide-react";

import { getSiteUrl } from "@/lib/site";
import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";

/**
 * CAR DETAIL PAGE
 * Design Spec:
 * - High-end “CAR BOUTIQUE” presentation.
 * - Monotone + accent, serif + sans mix.
 * - App Router (Next.js 14), Tailwind CSS only.
 */

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const cars = getAllCars();
  return cars.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = getCarBySlug(params.slug);
  if (!car) return {};

  const title = `${car.name} | CAR BOUTIQUE`;
  const description =
    car.summary ||
    car.description ||
    `${car.name}の特徴・スペック・中古相場をCAR BOUTIQUEで。`;
  const image =
    (car as any).heroImage ||
    (car as any).image ||
    (car as any).images?.[0] ||
    "/images/hero/default-car.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}/cars/${car.slug}`,
      type: "article",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function CarDetailPage({ params }: PageProps) {
  const car = getCarBySlug(params.slug);
  if (!car) notFound();

  const heroImage =
    (car as any).heroImage ||
    (car as any).image ||
    (car as any).images?.[0] ||
    "/images/hero/default-car.jpg";

  const maker = (car as any).maker || "";
  const englishTitle = maker.toUpperCase();
  const japaneseTitle = car.name;
  const heroCopy =
    car.summary ||
    car.description ||
    "フェラーリ プロサングエは、ブランド初の4ドアSUVとして登場したモデルです。";

  const tagPills = [
    car.bodyType,
    car.engine,
    car.drive,
    car.transmission,
    `${car.releaseYear}年式`,
  ].filter(Boolean);

  const cautionPoints = [
    "注意を怠ると維持費が高額になる",
    "部品やメンテナンス費用が割高",
    "燃費の悪化と税金の高さに留意",
  ];

  const charmPoints = [
    "フェラーリらしいV12自然吸気エンジンの官能性",
    "SUVでありながらクーペのような流麗なデザイン",
    "上質なインテリアと圧倒的な存在感",
  ];

  const specs = [
    { label: "年式", value: car.releaseYear || "2023年" },
    { label: "エンジン", value: car.engine || "6.5L V12 NA" },
    { label: "ボディタイプ", value: car.bodyType || "SUV" },
    { label: "乗車定員", value: car.grade || "4人乗り" },
    { label: "駆動方式", value: car.drive || "AWD" },
    { label: "トランスミッション", value: car.transmission || "8AT" },
  ];

  return (
    <main className="bg-white text-black">
      {/* ================================
       * A. HERO SECTION
       * ================================ */}
      <section className="relative bg-black">
        <div className="relative h-[480px] sm:h-[540px]">
          <Image
            src={heroImage}
            alt={car.name}
            fill
            className="object-cover object-center opacity-95"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end justify-center pb-10">
          <div className="max-w-3xl px-6 text-center text-white">
            <h1 className="font-serif text-3xl sm:text-5xl">{englishTitle}</h1>
            <p className="mt-1 font-serif text-lg sm:text-2xl">
              {japaneseTitle}
            </p>

            {/* タグ群 */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {tagPills.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 説明文 */}
            <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">
              {heroCopy}
            </p>

            {/* CTAボタン */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#market"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                中古価格相場をチェック
              </a>
              <Link
                href="/cars"
                className="rounded-full border border-white/30 px-6 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 inline-block h-4 w-4" />
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
       * B. FEATURE CARDS
       * ================================ */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
        <h2 className="text-center font-serif text-2xl sm:text-3xl">
          このクルマの特徴
        </h2>

        <div className="mt-8 grid gap-6">
          {/* 注意点カード */}
          <div className="rounded-2xl border border-black/10 bg-yellow-50/60 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-black/60" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-black">
                  注意すべきポイント
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-black/80">
                  {cautionPoints.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-black/50" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 魅力カード */}
          <div className="rounded-2xl border border-black/10 bg-gray-50 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-black/60" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-black">
                  絶対的な魅力
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-black/80">
                  {charmPoints.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-black/40" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
       * C. SPEC & DETAILS
       * ================================ */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* 概要 */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">概要</h2>
            <p className="mt-4 text-sm leading-relaxed text-black/80 sm:text-base">
              フェラーリ プロサングエは、ブランド初の4ドア4シーターSUVとして開発され、
              エンジンには自然吸気V12ユニットを搭載。伝統的なフェラーリの走りと快適性を両立させ、
              プレミアムSUV市場において独自の地位を築きました。
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-black">
                  資産価値
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/75">
                  希少性とブランド力の高さから、価格維持率は非常に良好。
                  長期保有でも資産的価値を失いにくい車種です。
                </p>
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-black">
                  オーナーの評判
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/75">
                  高級SUVでありながらフェラーリらしいドライビングフィールが評価され、
                  家族層にも人気の高いモデルとなっています。
                </p>
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-black">
                  トラブル傾向
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/75">
                  電子制御系統やサスペンションの警告が稀に報告されていますが、
                  定期的なメンテナンスで回避可能です。
                </p>
              </div>
            </div>
          </div>

          {/* 基本スペック表 */}
          <aside>
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl">基本スペック</h2>
              <dl className="mt-5 divide-y divide-black/10">
                {specs.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[120px_1fr] gap-4 py-2 sm:py-3"
                  >
                    <dt className="text-xs font-medium text-black/50">
                      {s.label}
                    </dt>
                    <dd className="text-sm font-medium text-black">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href="#market"
                className="mt-6 block rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-black/90"
              >
                中古在庫を探す
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* ================================
       * D. FOOTER CTA
       * ================================ */}
      <section
        id="market"
        className="mx-auto max-w-5xl px-5 pb-20 text-center sm:px-6"
      >
        <h2 className="font-serif text-xl sm:text-2xl">中古在庫を探す</h2>
        <p className="mt-3 text-sm leading-relaxed text-black/70">
          最新の中古市場相場や在庫状況をチェックして、理想の1台を見つけましょう。
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://example.com/used"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
          >
            中古車を探す
          </a>
          <a
            href="https://example.com/column"
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-medium text-black transition hover:bg-black/5"
          >
            関連コラムを読む
          </a>
        </div>
      </section>
    </main>
  );
}
