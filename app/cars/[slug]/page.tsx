// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// CarItem の拡張版（任意フィールドだけ追加）
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
  // 0-100km/h 加速タイム（秒）
  zeroTo100?: number;
};

type MultilineTextProps = {
  text: string;
  variant: "hero" | "card";
};

/**
 * テキストを読みやすい段落に分割するヘルパー
 * 1. 空行(\n\n)があればそれで区切る
 * 2. 無ければ「。」を目安に2文ずつまとめて段落にする
 */
function splitIntoParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const manual = trimmed
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (manual.length > 1) return manual;

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

/**
 * 文章を段落または箇条書き風にレンダリング
 * hero: ヒーロー用の説明テキスト
 * card: カード内の「このクルマの性格」
 */
function MultilineText({ text, variant }: MultilineTextProps) {
  const paragraphs = splitIntoParagraphs(text);

  if (variant === "hero") {
    return (
      <div className="mt-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-4 shadow-soft-sm">
          <div className="pointer-events-none absolute -left-10 -top-12 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,216,208,0.35),_transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -right-16 bottom-[-40%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.25),_transparent_70%)] blur-3xl" />
          <div className="relative space-y-2 border-l border-slate-200/80 pl-3">
            {paragraphs.map((block, index) => (
              <p
                key={index}
                className="text-[12px] leading-[1.9] text-text-sub sm:text-[13px]"
              >
                {block}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // card variant: 箇条書き風
  return (
    <ul className="space-y-2">
      {paragraphs.map((block, index) => (
        <li
          key={index}
          className="relative pl-3 text-[12px] leading-relaxed text-text-sub sm:text-[13px]"
        >
          <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
          {block}
        </li>
      ))}
    </ul>
  );
}

function CarBadgeIllustration() {
  return (
    <div className="relative h-10 w-28 overflow-hidden rounded-full bg-gradient-to-r from-tiffany-200/70 via-white to-slate-100/80">
      <div className="absolute inset-y-1 left-2 right-6 rounded-full border border-white/70 bg-white/40" />
      <div className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-slate-200/80 shadow-sm" />
      <div className="absolute inset-y-[11px] left-3 right-7 rounded-full border-t border-slate-300/70" />
    </div>
  );
}

// SSG 用: 動的パス生成
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({
    slug: car.slug,
  }));
}

// メタデータ生成
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
  const description =
    car.summaryLong ??
    car.summary ??
    "CAR BOUTIQUEによる車種別インプレッションとオーナー目線の解説。";

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

// 表示用フォーマッタ系
function formatZeroTo100(value?: number): string | null {
  if (value == null) return null;
  return `${value.toFixed(1)}秒 (0-100km/h)`;
}

function formatMakerAndName(car: ExtendedCarItem): string {
  if (car.maker && car.name) return `${car.maker} ${car.name}`;
  if (car.name) return car.name;
  return car.slug;
}

// Page コンポーネント本体
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
    <main className="min-h-screen">
      {/* ヒーローエリア */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-white/90 via-white/80 to-ice-vapor/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-end lg:px-8">
          <div className="flex-1 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
              CAR DATABASE
            </p>
            <div className="flex items-center gap-3">
              <h1 className="serif-heading text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <div className="hidden shrink-0 sm:block">
                <CarBadgeIllustration />
              </div>
            </div>
            {overviewText && (
              <MultilineText text={overviewText} variant="hero" />
            )}
          </div>

          <div className="flex flex-col items-start gap-3 text-[11px] text-slate-600 md:items-end">
            {car.segment && (
              <p className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] tracking-[0.18em] text-slate-700">
                {car.segment}
              </p>
            )}
            {car.difficulty && (
              <p className="tracking-[0.05em] text-slate-600">
                維持難易度:
                <span className="ml-1 font-medium text-slate-800">
                  {car.difficulty}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 本文エリア */}
      <section className="bg-gradient-to-b from-ice-vapor/80 via-ice-vapor/60 to-white">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] lg:px-8">
          {/* 基本スペック */}
          <GlassCard className="h-full border-slate-200/80 bg-white/90">
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="serif-heading text-sm font-semibold tracking-[0.12em] text-slate-900">
                  基本スペック
                </h2>
                <div className="hidden text-[10px] text-slate-500 sm:flex sm:flex-col sm:items-end sm:gap-1">
                  {car.bodyType && <span>{car.bodyType}</span>}
                  {car.fuel && <span>{car.fuel}</span>}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] text-slate-800 sm:grid-cols-3">
                {car.releaseYear && (
                  <>
                    <dt className="text-text-sub">登場年</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.releaseYear}年頃
                    </dd>
                  </>
                )}
                {car.engine && (
                  <>
                    <dt className="text-text-sub">エンジン</dt>
                    <dd className="col-span-1 sm:col-span-2">{car.engine}</dd>
                  </>
                )}
                {car.powerPs && (
                  <>
                    <dt className="text-text-sub">最高出力</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.powerPs}ps
                    </dd>
                  </>
                )}
                {car.torqueNm && (
                  <>
                    <dt className="text-text-sub">最大トルク</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.torqueNm}Nm
                    </dd>
                  </>
                )}
                {car.drive && (
                  <>
                    <dt className="text-text-sub">駆動方式</dt>
                    <dd className="col-span-1 sm:col-span-2">{car.drive}</dd>
                  </>
                )}
                {car.transmission && (
                  <>
                    <dt className="text-text-sub">トランスミッション</dt>
                    <dd className="col-span-1 sm:col-span-2">
                      {car.transmission}
                    </dd>
                  </>
                )}
                {zeroTo100 && (
                  <>
                    <dt className="text-text-sub">加速性能</dt>
                    <dd className="col-span-1 sm:col-span-2">{zeroTo100}</dd>
                  </>
                )}
              </dl>
            </div>
          </GlassCard>

          {/* 性格・維持費コメント */}
          <div className="space-y-4">
            <GlassCard className="border-slate-200/80 bg-white/90">
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="serif-heading text-sm font-semibold tracking-[0.12em] text-slate-900">
                    このクルマの性格
                  </h2>
                  {car.priceNew && (
                    <p className="rounded-full bg-slate-900/90 px-3 py-1 text-[10px] tracking-[0.14em] text-white">
                      新車価格目安 {car.priceNew}
                    </p>
                  )}
                </div>
                {characterText && (
                  <MultilineText text={characterText} variant="card" />
                )}
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <Link
                href="/cars"
                className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
              >
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
