// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// CarItem の拡張版（仕様書ベースで optional に寄せて拡張）
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  zeroTo100?: number;
  priceNew?: string;
  priceUsed?: string;
  fuelEconomy?: string;
  relatedNewsIds?: string[];
  relatedColumnSlugs?: string[];
  relatedHeritageIds?: string[];
};

type MultilineTextProps = {
  text: string;
  variant: "hero" | "card";
};

// テキストを読みやすい段落に分割
function splitIntoParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 手動の空行区切りがあれば優先
  const manualBlocks = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (manualBlocks.length > 1) return manualBlocks;

  // 「。」で区切って2文ずつ1段落にまとめる
  const sentences = trimmed
    .split("。")
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) return [trimmed];

  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join("。");
    paras.push(chunk + "。");
  }
  return paras;
}

// ヒーロー説明/カード共通のテキスト表示
function MultilineText({ text, variant }: MultilineTextProps) {
  const paragraphs = splitIntoParagraphs(text);

  if (variant === "hero") {
    return (
      <div className="space-y-4">
        {paragraphs.map((block, index) => (
          <p
            key={index}
            className="text-[13px] leading-[1.9] text-text-sub sm:text-[14px]"
          >
            {block}
          </p>
        ))}
      </div>
    );
  }

  // card variant: 箇条書き風
  return (
    <div className="space-y-3">
      {paragraphs.map((block, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          <p className="text-[12px] leading-relaxed text-text-sub sm:text-[13px]">
            {block}
          </p>
        </div>
      ))}
    </div>
  );
}

// SSG 用: 動的パス
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

// 維持難易度ラベル
function formatDifficultyLabel(
  difficulty: ExtendedCarItem["difficulty"],
): string | null {
  switch (difficulty) {
    case "basic":
      return "扱いやすさ やさしめ";
    case "intermediate":
      return "扱いやすさ ふつう";
    case "advanced":
      return "扱いやすさ しっかり準備";
    default:
      return null;
  }
}

// 0-100km/h 加速表示
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
}

// メタデータ
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
  const description = car.summaryLong ?? car.summary ?? "";

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

// メインページ
export default async function CarDetailPage({ params }: PageProps) {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    notFound();
  }

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);
  const overviewText = car.summaryLong ?? car.summary ?? "";
  const characterText = car.costImpression ?? car.summary ?? "";

  const difficultyLabel = formatDifficultyLabel(car.difficulty);

  const hasStrengths = Array.isArray(car.strengths) && car.strengths.length > 0;
  const hasWeaknesses =
    Array.isArray(car.weaknesses) && car.weaknesses.length > 0;
  const hasTroubleTrends =
    Array.isArray(car.troubleTrends) && car.troubleTrends.length > 0;

  const hasRelated =
    (car.relatedNewsIds && car.relatedNewsIds.length > 0) ||
    (car.relatedColumnSlugs && car.relatedColumnSlugs.length > 0) ||
    (car.relatedHeritageIds && car.relatedHeritageIds.length > 0);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-600">{car.name ?? car.slug}</span>
        </nav>

        {/* ヒーロー/概要ブロック */}
        <section className="mb-10 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/90 to-vapor/70 p-6 shadow-soft-card backdrop-blur-sm sm:p-8">
          {/* ラベル */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-[6px] w-[6px] rounded-full bg-tiffany-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500">
                CAR DATABASE
              </span>
            </div>
            {difficultyLabel && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-medium tracking-[0.16em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {difficultyLabel}
              </span>
            )}
          </div>

          {/* タイトル/タグ */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="serif-heading text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600">
                {car.segment && (
                  <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    {car.segment}
                  </span>
                )}
                {car.bodyType && (
                  <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    {car.bodyType}
                  </span>
                )}
                {car.drive && (
                  <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    {car.drive}
                  </span>
                )}
                {car.releaseYear && (
                  <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    登場:{car.releaseYear}年頃
                  </span>
                )}
                {car.fuelEconomy && (
                  <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    燃費目安:{car.fuelEconomy}
                  </span>
                )}
              </div>
            </div>

            {(car.priceNew || car.priceUsed) && (
              <div className="mt-2 flex flex-col items-start gap-1 text-[11px] text-slate-600 sm:items-end">
                {car.priceNew && (
                  <p className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    新車価格目安:{car.priceNew}
                  </p>
                )}
                {car.priceUsed && (
                  <p className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    中古相場イメージ:{car.priceUsed}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 概要テキスト */}
          {overviewText && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <MultilineText text={overviewText} variant="hero" />
            </div>
          )}
        </section>

        {/* メインコンテンツグリッド */}
        <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* 基本スペック */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <h2 className="serif-heading mb-6 text-lg font-medium text-slate-900">
                基本スペック
              </h2>
              <dl className="space-y-4">
                {[
                  {
                    label: "登場年",
                    value: car.releaseYear ? `${car.releaseYear}年頃` : null,
                  },
                  { label: "エンジン", value: car.engine },
                  {
                    label: "最高出力",
                    value: car.powerPs ? `${car.powerPs}ps` : null,
                  },
                  {
                    label: "最大トルク",
                    value: car.torqueNm ? `${car.torqueNm}Nm` : null,
                  },
                  { label: "駆動方式", value: car.drive },
                  { label: "トランスミッション", value: car.transmission },
                  { label: "加速性能", value: zeroTo100 },
                  { label: "燃料", value: car.fuel },
                  { label: "燃費目安", value: car.fuelEconomy },
                ].map(
                  (item, index) =>
                    item.value && (
                      <div
                        key={index}
                        className="flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="text-[11px] font-medium text-slate-400">
                          {item.label}
                        </dt>
                        <dd className="max-w-[60%] text-right text-[12px] font-medium text-slate-800">
                          {item.value}
                        </dd>
                      </div>
                    ),
                )}
              </dl>
            </div>
          </div>

          {/* 性格/お金まわり */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  このクルマの性格とお金まわり
                </h2>

                {(car.priceNew || car.priceUsed) && (
                  <div className="flex flex-col items-start gap-1 text-[10px] text-slate-500 sm:items-end">
                    {car.priceNew && (
                      <p className="rounded-full bg-slate-900 px-4 py-1.5 font-medium tracking-[0.12em] text-white">
                        新車帯:{car.priceNew}
                      </p>
                    )}
                    {car.priceUsed && (
                      <p className="rounded-full bg-slate-100 px-3 py-1">
                        中古帯:{car.priceUsed}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {characterText && (
                <div className="text-slate-600">
                  <MultilineText text={characterText} variant="card" />
                </div>
              )}

              <div className="mt-8 text-right">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 underline-offset-4 transition hover:text-tiffany-600 hover:underline"
                >
                  一覧に戻る
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 長所/短所セクション */}
        {(hasStrengths || hasWeaknesses) && (
          <section className="mb-10 rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  オーナー目線の長所と気になるポイント
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  カタログスペックでは見えにくい部分を「実際に持つなら」という目線で整理
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {hasStrengths && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-emerald-700">
                    いいところ
                  </h3>
                  <ul className="space-y-2.5 text-[12px] text-slate-700">
                    {car.strengths?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <p className="leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasWeaknesses && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-rose-700">
                    注意したいところ
                  </h3>
                  <ul className="space-y-2.5 text-[12px] text-slate-700">
                    {car.weaknesses?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        <p className="leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* トラブル傾向/維持の注意 */}
        {hasTroubleTrends && (
          <section className="mb-10 rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  トラブル傾向と維持の注意点
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  よく名前が出る持病や気を付けたい部品などをざっくり整理
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 text-[12px] text-slate-700">
              {car.troubleTrends?.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <p className="leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 関連コンテンツへの導線（ID/slugベース） */}
        {hasRelated && (
          <section className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="serif-heading text-lg font-medium text-slate-900">
                  関連ニュース/コラム/HERITAGEへ
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  この車種に関連するニュースやコラム ブランドのHERITAGEへ飛べるアンカー
                  詳細は各ページ側で確認する想定
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {car.relatedNewsIds?.map((id) => (
                <Link
                  key={id}
                  href={`/news/${encodeURIComponent(id)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連ニュースへ:id:{id}
                </Link>
              ))}
              {car.relatedColumnSlugs?.map((slug) => (
                <Link
                  key={slug}
                  href={`/column/${encodeURIComponent(slug)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連コラムへ:{slug}
                </Link>
              ))}
              {car.relatedHeritageIds?.map((id) => (
                <Link
                  key={id}
                  href={`/heritage/${encodeURIComponent(id)}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  関連HERITAGEへ:id:{id}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
