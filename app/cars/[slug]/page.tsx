// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, getAllCars, type CarItem } from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

function formatDateYear(year?: number | null) {
  if (!year) return "";
  if (Number.isNaN(year)) return "";
  return `${year}年ごろ`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildTitle(car: CarItem): string {
  const base = car.name;
  if (car.grade) {
    return `${base} ${car.grade}`;
  }
  return base;
}

function buildDescription(car: CarItem): string {
  if (car.summaryLong) return car.summaryLong;
  if (car.summary) return car.summary;
  return `${car.name}の特徴やスペック、維持費感、長所短所をオーナー目線で整理しました。`;
}

function buildOgImageUrl(car: CarItem): string {
  if (car.heroImage) return car.heroImage;
  if (car.mainImage) return car.mainImage;
  return "/images/og-default-cars.jpg";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "お探しのCARSページは見つかりませんでした。",
    };
  }

  const title = buildTitle(car);
  const description = buildDescription(car);
  const imageUrl = buildOgImageUrl(car);

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

function formatNumber(value?: number | null, unit?: string) {
  if (value === undefined || value === null) return "";
  const v = value.toLocaleString("ja-JP");
  return unit ? `${v}${unit}` : v;
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const title = buildTitle(car);
  const yearLabel = formatDateYear(car.releaseYear);

  const allCars = await getAllCars();
  const relatedCars = allCars
    .filter((c) => c.slug !== car.slug && c.maker === car.maker)
    .slice(0, 4);

  const relatedNews = await getLatestNews(40);
  const filteredNews = relatedNews
    .filter((n) => {
      if (!n.maker) return false;
      const makerUpper = n.maker.toUpperCase();
      const carMakerUpper = car.maker.toUpperCase();
      if (makerUpper === carMakerUpper) return true;
      if (carMakerUpper === "BMW" && makerUpper === "ALPINA") return true;
      if (carMakerUpper === "TOYOTA" && makerUpper === "LEXUS") return true;
      if (carMakerUpper === "HONDA" && makerUpper === "ACURA") return true;
      return false;
    })
    .slice(0, 6);

  const otherCars = allCars.filter((c) => c.slug !== car.slug).slice(0, 6);

  const heritageLinks = [
    {
      href: "/heritage",
      label: "ブランドの物語を読む",
      description: "BMWやメルセデスなど、ブランドの歴史と哲学をまとめたHERITAGEへ。",
    },
    {
      href: "/guide",
      label: "買い方・維持費ガイドへ",
      description: "輸入車との付き合い方や維持費感をまとめたGUIDEへ。",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#d2f0f0] via-white to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-6 text-[11px] text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">DETAIL</span>
        </nav>

        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {car.maker && (
              <span className="rounded-full bg-white/70 px-3 py-1 tracking-[0.08em] text-slate-700">
                {car.maker}
              </span>
            )}
            {yearLabel && (
              <span className="rounded-full bg-white/60 px-3 py-1 tracking-[0.08em] text-slate-600">
                登場は{yearLabel}
              </span>
            )}
            {car.bodyType && (
              <span className="rounded-full bg-white/50 px-3 py-1 tracking-[0.08em] text-slate-600">
                {car.bodyType}
              </span>
            )}
            {car.segment && (
              <span className="rounded-full bg-white/40 px-3 py-1 tracking-[0.08em] text-slate-600">
                {car.segment}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              CAR BOUTIQUE CARS DETAIL
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {car.summary && (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
                {car.summary}
              </p>
            )}
          </div>
        </header>

        <section className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {car.summaryLong && (
              <GlassCard className="border border-white/60 bg-white/70 p-5 backdrop-blur">
                <h2 className="mb-3 text-sm font-semibold tracking-[0.18em] text-slate-500">
                  このクルマの性格と立ち位置
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {car.summaryLong}
                </p>
              </GlassCard>
            )}

            {filteredNews.length > 0 && (
              <GlassCard className="border border-white/50 bg-white/70 p-5 backdrop-blur">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500">
                    関連ニュースから読み解く「いま」
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    最新の動きやキャンペーンをピックアップ
                  </span>
                </div>

                <ul className="space-y-3">
                  {filteredNews.map((n: NewsItem) => (
                    <li key={n.id}>
                      <Link
                        href={`/news/${n.id}`}
                        className="group block rounded-md border border-white/70 bg-white/80 px-3 py-2 text-xs leading-snug text-slate-800 shadow-sm transition hover:border-slate-200 hover:bg-white hover:shadow"
                      >
                        <p className="line-clamp-2 font-medium text-slate-900 group-hover:text-slate-950">
                          {n.titleJa ?? n.title}
                        </p>
                        {n.sourceName && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            {n.sourceName}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatDate(n.publishedAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </div>

          <aside className="space-y-4">
            <GlassCard className="border border-white/70 bg-white/80 p-4 text-xs text-slate-800 shadow-sm backdrop-blur">
              <h2 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                基本スペック
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {car.engine && (
                  <>
                    <dt className="text-[11px] text-slate-500">エンジン</dt>
                    <dd className="text-[13px] text-slate-900">
                      {car.engine}
                    </dd>
                  </>
                )}
                {car.powerPs !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">最高出力</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.powerPs, "ps")}
                    </dd>
                  </>
                )}
                {car.torqueNm !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">最大トルク</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.torqueNm, "Nm")}
                    </dd>
                  </>
                )}
                {car.transmission && (
                  <>
                    <dt className="text-[11px] text-slate-500">トランスミッション</dt>
                    <dd className="text-[13px] text-slate-900">
                      {car.transmission}
                    </dd>
                  </>
                )}
                {car.drive && (
                  <>
                    <dt className="text-[11px] text-slate-500">駆動方式</dt>
                    <dd className="text-[13px] text-slate-900">{car.drive}</dd>
                  </>
                )}
                {car.fuel && (
                  <>
                    <dt className="text-[11px] text-slate-500">燃料種別</dt>
                    <dd className="text-[13px] text-slate-900">{car.fuel}</dd>
                  </>
                )}
                {car.fuelEconomy && (
                  <>
                    <dt className="text-[11px] text-slate-500">カタログ燃費</dt>
                    <dd className="text-[13px] text-slate-900">
                      {car.fuelEconomy}
                    </dd>
                  </>
                )}
                {car.lengthMm !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">全長</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.lengthMm, "mm")}
                    </dd>
                  </>
                )}
                {car.widthMm !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">全幅</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.widthMm, "mm")}
                    </dd>
                  </>
                )}
                {car.heightMm !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">全高</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.heightMm, "mm")}
                    </dd>
                  </>
                )}
                {car.wheelbaseMm !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">ホイールベース</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.wheelbaseMm, "mm")}
                    </dd>
                  </>
                )}
                {car.weightKg !== undefined && (
                  <>
                    <dt className="text-[11px] text-slate-500">車両重量</dt>
                    <dd className="text-[13px] text-slate-900">
                      {formatNumber(car.weightKg, "kg")}
                    </dd>
                  </>
                )}
                {car.tiresFront && (
                  <>
                    <dt className="text-[11px] text-slate-500">タイヤサイズ前</dt>
                    <dd className="text-[13px] text-slate-900">
                      {car.tiresFront}
                    </dd>
                  </>
                )}
                {car.tiresRear && (
                  <>
                    <dt className="text-[11px] text-slate-500">タイヤサイズ後</dt>
                    <dd className="text-[13px] text-slate-900">
                      {car.tiresRear}
                    </dd>
                  </>
                )}
              </dl>
            </GlassCard>

            <GlassCard className="border border-white/70 bg-white/70 p-4 text-xs text-slate-800 backdrop-blur">
              <h2 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                このクルマを選ぶなら
              </h2>
              <p className="mb-3 text-[13px] leading-relaxed text-slate-800">
                CARSページは、あくまで編集部の目線でまとめた「性格診断書」のようなものです。
                実際の個体差や整備状況によって印象は変わるので、
                最後はかならず現車確認と試乗をしたうえで判断してください。
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full justify-center border-slate-300 bg-white/80 text-[12px] text-slate-800 hover:border-slate-400 hover:bg-white"
              >
                <a
                  href="/guide"
                  aria-label="GUIDEページへ"
                >
                  維持費や買い方のGUIDEへ
                </a>
              </Button>
            </GlassCard>
          </aside>
        </section>

        {filteredNews.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-600">
                RELATED NEWS
              </h2>
              <span className="text-[11px] text-slate-400">
                同じメーカーのニュースから、いまの空気感をつかむ
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredNews.map((n: NewsItem) => (
                <GlassCard
                  key={n.id}
                  className="flex flex-col justify-between border border-white/70 bg-white/80 p-4 text-xs text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-200 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {n.category || "LATEST"}
                    </p>
                    <Link
                      href={`/news/${n.id}`}
                      className="mb-1 block text-sm font-medium leading-snug text-slate-900 hover:text-slate-950"
                    >
                      {n.titleJa ?? n.title}
                    </Link>
                    {n.editorNote && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        編集部メモ
                        {n.editorNote}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{n.sourceName}</span>
                    <span>{formatDate(n.publishedAt)}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {relatedCars.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-600">
                RELATED CARS
              </h2>
              <span className="text-[11px] text-slate-400">
                同じメーカーやキャラクターのクルマを、もう少しだけ覗いてみる
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedCars.map((c) => (
                <GlassCard
                  key={c.id}
                  className="flex flex-col justify-between border border-white/70 bg-white/80 p-4 text-xs text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-200 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {c.maker}
                    </p>
                    <Link
                      href={`/cars/${c.slug}`}
                      className="mb-1 block text-sm font-medium leading-snug text-slate-900 hover:text-slate-950"
                    >
                      {buildTitle(c)}
                    </Link>
                    {c.summary && (
                      <p className="mt-1 line-clamp-2 text-[12px] text-slate-600">
                        {c.summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {c.bodyType && <span>{c.bodyType}</span>}
                    {c.segment && <span className="ml-2">{c.segment}</span>}
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-600">
              OTHER CARS
            </h2>
            <span className="text-[11px] text-slate-400">
              まったく別ジャンルのクルマを、ブティックを覗くように眺めてみる
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {otherCars.map((c) => (
              <GlassCard
                key={c.id}
                className="flex flex-col justify-between border border-white/70 bg-white/80 p-4 text-xs text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-200 hover:bg-white hover:shadow-md"
              >
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {c.maker}
                  </p>
                  <Link
                    href={`/cars/${c.slug}`}
                    className="mb-1 block text-sm font-medium leading-snug text-slate-900 hover:text-slate-950"
                  >
                    {buildTitle(c)}
                  </Link>
                  {c.summary && (
                    <p className="mt-1 line-clamp-2 text-[12px] text-slate-600">
                      {c.summary}
                    </p>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {c.bodyType && <span>{c.bodyType}</span>}
                  {c.segment && <span className="ml-2">{c.segment}</span>}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="grid gap-4 md:grid-cols-2">
            {heritageLinks.map((link) => (
              <GlassCard
                key={link.href}
                className="flex flex-col justify-between border border-white/70 bg-white/80 p-4 text-xs text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-200 hover:bg-white hover:shadow-md"
              >
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    NEXT STORY
                  </p>
                  <h3 className="mb-1 text-sm font-medium text-slate-900">
                    {link.label}
                  </h3>
                  <p className="text-[12px] text-slate-600">
                    {link.description}
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-[12px] font-medium text-slate-900 underline-offset-4 hover:underline"
                  >
                    この記事へ進む
                    <span className="ml-1 text-[11px]">→</span>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/cars"
            className="inline-flex items-center text-xs font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            <span className="mr-1">←</span>
            CARS一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
