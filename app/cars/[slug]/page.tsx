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

// CarItem の拡張版
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  zeroTo100?: number; // 0-100km/h 加速タイム（秒）
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

  // 「。」で区切って 2 文ずつ 1 段落にまとめる
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

// ヒーロー説明 / 性格カード共通のテキスト表示
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

// 表示用フォーマッタ
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
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

  return (
    <main className="min-h-screen bg-transparent pb-20">
      {/* ヘッダー / 概要ブロック */}
      <section className="mx-auto max-w-3xl px-5 pb-6 pt-12 sm:px-6 sm:pt-16">
        {/* カテゴリラベル */}
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-tiffany-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500">
            CAR DATABASE
          </span>
        </div>

        {/* タイトル */}
        <h1 className="serif-heading mb-8 text-3xl font-medium leading-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>

        {/* 概要ボックス（グレーカード） */}
        {overviewText && (
          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-soft-card sm:p-8">
            <MultilineText text={overviewText} variant="hero" />

            {/* 下部タグ行 */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
              {car.segment && (
                <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] tracking-[0.14em] text-slate-600">
                  {car.segment}
                </span>
              )}
              {car.difficulty && (
                <span className="text-[11px] tracking-[0.06em] text-slate-500">
                  維持難易度:
                  <span className="ml-1 font-medium text-slate-800">
                    {car.difficulty}
                  </span>
                </span>
              )}
              {car.bodyType && (
                <span className="text-[11px] tracking-[0.06em] text-slate-500">
                  ボディタイプ:
                  <span className="ml-1 font-medium text-slate-800">
                    {car.bodyType}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 本文 2カラムレイアウト */}
      <section className="mx-auto grid max-w-3xl gap-8 px-5 sm:px-6 md:max-w-5xl md:grid-cols-[1fr_1.15fr]">
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

        {/* 性格 / 価格コメント */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="serif-heading text-lg font-medium text-slate-900">
                このクルマの性格
              </h2>

              {/* 新車価格カプセル */}
              {car.priceNew && (
                <div className="self-start rounded-full bg-slate-900 px-4 py-2 sm:self-auto">
                  <p className="text-[9px] font-medium tracking-[0.16em] text-white">
                    新車価格目安 {car.priceNew}
                  </p>
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
    </main>
  );
}
