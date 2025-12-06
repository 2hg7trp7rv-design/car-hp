// app/cars/[slug]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import CarRotator from "@/components/car/CarRotator";

import {
  getAllCars,
  getCarBySlug,
  type CarItem,
} from "@/lib/cars";
import {
  getLatestColumns,
  type ColumnItem,
} from "@/lib/columns";
import {
  getLatestGuides,
  type GuideItem,
} from "@/lib/guides";
import {
  getLatestNews,
  type NewsItem,
} from "@/lib/news";
import {
  getG30TemplateBySlug,
  type G30CarTemplate,
} from "@/lib/car-bmw-530i-g30";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

type ExtendedCarItem = CarItem & {
  mainImage?: string;
};

type PageData = {
  car: ExtendedCarItem;
  template?: G30CarTemplate;
  latestColumns: ColumnItem[];
  latestGuides: GuideItem[];
  latestNews: NewsItem[];
};

// ==== ユーティリティ ====

function extendCar(car: CarItem): ExtendedCarItem {
  return {
    ...car,
    mainImage: car.heroImage ?? undefined,
  };
}

function formatCarTitle(car: CarItem): string {
  if (car.name) return car.name;
  return car.slug.replace(/-/g, " ").toUpperCase();
}

function formatDifficultyLabel(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "維持難易度: やさしい";
    case "intermediate":
      return "維持難易度: ふつう";
    case "advanced":
      return "維持難易度: 上級者向け";
    default:
      return "";
  }
}

function formatSegmentLabel(segment?: string | null): string {
  if (!segment) return "";
  return segment;
}

function formatBodyTypeLabel(bodyType?: string | null): string {
  if (!bodyType) return "";
  return bodyType;
}

function formatPs(ps?: number | null): string | null {
  if (!ps) return null;
  return `${ps}ps`;
}

function formatTorqueNm(nm?: number | null): string | null {
  if (!nm) return null;
  return `${nm}Nm`;
}

function formatWeightKg(kg?: number | null): string | null {
  if (!kg) return null;
  return `${kg.toLocaleString()}kg`;
}

function formatZeroTo100(sec?: number | null): string | null {
  if (!sec) return null;
  return `${sec.toFixed(1)}秒`;
}

function formatModelYears(
  from?: number | null,
  to?: number | null,
): string | null {
  if (!from && !to) return null;
  if (from && to) return `${from}〜${to}年頃`;
  if (from) return `${from}年頃〜`;
  return `〜${to}年頃`;
}

function formatFuelLabel(fuel?: string | null): string {
  if (!fuel) return "";
  return fuel;
}

// G30専用テンプレート（あれば）
function getG30Template(car: ExtendedCarItem): G30CarTemplate | undefined {
  if (car.slug !== "bmw-530i-g30") return undefined;
  const template = getG30TemplateBySlug(car.slug);
  return template ?? undefined;
}

async function fetchPageData(slug: string): Promise<PageData | null> {
  const carBase = await getCarBySlug(slug);
  if (!carBase) return null;

  const car = extendCar(carBase);

  const [latestColumns, latestGuides, latestNews] = await Promise.all([
    getLatestColumns(4),
    getLatestGuides(4),
    getLatestNews(4),
  ]);

  const template = getG30Template(car);

  return {
    car,
    template,
    latestColumns,
    latestGuides,
    latestNews,
  };
}

// ==== Next.js SSG ====

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種ページは存在しません。",
    };
  }

  const titleCore = formatCarTitle(car);
  const description =
    car.summaryLong ??
    car.summary ??
    `${car.maker ?? ""} ${titleCore} の車種別インプレッションと維持・トラブル解説。`;

  return {
    title: `${titleCore} | CAR BOUTIQUE`,
    description,
  };
}

// ==== 小さな表示用コンポーネント ====

type SpecItemProps = {
  label: string;
  value?: string | null;
};

function SpecItem({ label, value }: SpecItemProps) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm">
      <span className="text-xs font-medium tracking-wide text-slate-400">
        {label}
      </span>
      <span className="font-semibold text-slate-50">{value}</span>
    </div>
  );
}

type PillProps = {
  children: React.ReactNode;
};

function Pill({ children }: PillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs font-medium tracking-wide text-slate-200">
      {children}
    </span>
  );
}

// ==== ページ本体 ====

export default async function CarDetailPage({ params }: PageProps) {
  const data = await fetchPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { car, template, latestColumns, latestGuides, latestNews } = data;

  const title = formatCarTitle(car);
  const difficultyLabel = formatDifficultyLabel(car.difficulty);
  const segmentLabel = formatSegmentLabel(car.segment);
  const bodyTypeLabel = formatBodyTypeLabel(car.bodyType);
  const mainImage = car.mainImage;

  const ps = formatPs(car.powerPs);
  const torque = formatTorqueNm(car.torqueNm);
  const weight = formatWeightKg(car.weightKg);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);
  const modelYears = formatModelYears(
    car.modelYearFrom,
    car.modelYearTo,
  );
  const fuelLabel = formatFuelLabel(car.fuel);

  const headline =
    template?.headline ??
    car.summary ??
    "数字とストーリーで、このクルマの「素の性格」を整理します。";

  const longLead =
    template?.lead ??
    car.summaryLong ??
    "スペックだけでは見えない、維持のしやすさ・走りのキャラクター・日常との相性を中心に整理しました。";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.12),_transparent_55%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:pt-16">
          {/* 左側: テキスト */}
          <div className="flex-1 space-y-6">
            <Reveal asChild>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-slate-950/60 px-3 py-1 text-xs font-medium text-teal-50/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                <span>CAR DATABASE</span>
                {difficultyLabel && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-100/80">
                      {difficultyLabel}
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            <Reveal asChild delay={0.05}>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                {car.maker && (
                  <span className="mr-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {car.maker}
                  </span>
                )}
                <span className="block">{title}</span>
              </h1>
            </Reveal>

            <Reveal asChild delay={0.1}>
              <p className="max-w-xl text-sm leading-relaxed text-slate-200/90 sm:text-base">
                {headline}
              </p>
            </Reveal>

            <Reveal asChild delay={0.15}>
              <div className="flex flex-wrap gap-2 pt-1">
                {bodyTypeLabel && <Pill>{bodyTypeLabel}</Pill>}
                {segmentLabel && <Pill>{segmentLabel}</Pill>}
                {modelYears && <Pill>{modelYears}</Pill>}
                {fuelLabel && <Pill>{fuelLabel}</Pill>}
              </div>
            </Reveal>

            <Reveal asChild delay={0.2}>
              <div className="flex flex-wrap items-center gap-3 pt-4 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1">
                  車種データとオーナー視点で、「付き合い方」を整理
                </span>
                <Link
                  href="/cars"
                  className="inline-flex items-center text-xs font-medium text-teal-300 hover:text-teal-200"
                >
                  他の車種一覧へ戻る
                  <span className="ml-1 text-[0.65rem]">↩</span>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* 右側: 画像 / CarRotator */}
          <Reveal asChild delay={0.1}>
            <div className="flex-1 lg:max-w-xl">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-teal-400/20 bg-gradient-to-br from-teal-500/5 via-slate-900/60 to-sky-500/10 blur-[1px]" />
                <div className="relative rounded-[1.9rem] border border-slate-800/80 bg-slate-950/80 p-2 shadow-[0_30px_90px_rgba(15,23,42,0.9)]">
                  <CarRotator
                    imageUrl={mainImage}
                    alt={`${car.maker ?? ""} ${title}`.trim()}
                    aspectRatio="16/9"
                    autoRotate
                    className="rounded-[1.5rem]"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 概要＋スペック */}
      <section className="border-b border-slate-800/70 bg-slate-950/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:flex-row lg:py-14">
          {/* 概要 */}
          <div className="lg:w-[55%]">
            <Reveal asChild>
              <GlassCard className="h-full bg-slate-950/70">
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-400">
                    OVERVIEW
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-100 sm:text-[0.95rem]">
                    {longLead}
                  </p>

                  {template?.usage && (
                    <div className="mt-4 space-y-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-50/90">
                      <div className="font-semibold tracking-wide text-amber-300">
                        オーナー目線で見る「ちょうどよさ」
                      </div>
                      <p className="leading-relaxed">
                        {template.usage}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </Reveal>
          </div>

          {/* スペック */}
          <div className="lg:w-[45%]">
            <Reveal asChild delay={0.05}>
              <GlassCard className="h-full bg-slate-950/70">
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-400">
                    MAIN SPEC
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SpecItem label="エンジン" value={car.engine} />
                    <SpecItem label="最高出力" value={ps} />
                    <SpecItem label="最大トルク" value={torque} />
                    <SpecItem
                      label="トランスミッション"
                      value={car.transmission}
                    />
                    <SpecItem
                      label="駆動方式"
                      value={car.drive}
                    />
                    <SpecItem
                      label="0-100km/h"
                      value={zeroTo100}
                    />
                    <SpecItem
                      label="車両重量"
                      value={weight}
                    />
                    <SpecItem
                      label="全長×全幅×全高"
                      value={car.sizeText ?? undefined}
                    />
                  </div>

                  {template?.ownership && (
                    <div className="mt-4 space-y-2 rounded-2xl border border-sky-500/25 bg-sky-500/5 p-3 text-xs text-sky-50/90">
                      <div className="font-semibold tracking-wide text-sky-300">
                        維持とお金のざっくり感覚
                      </div>
                      <p className="leading-relaxed">
                        {template.ownership}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 関連コンテンツ */}
      <section className="border-b border-slate-800/70 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Reveal asChild>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-400">
                  READ WITH THIS CAR
                </h2>
                <p className="text-sm text-slate-200/90">
                  この車種を検討するときに、あわせて読みたい記事たち。
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {/* コラム */}
            <Reveal asChild delay={0.05}>
              <GlassCard className="bg-slate-950/80">
                <div className="flex h-full flex-col">
                  <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-slate-400">
                    COLUMN
                  </h3>
                  <div className="space-y-3">
                    {latestColumns.map((col) => (
                      <Link
                        key={col.id}
                        href={`/column/${col.slug}`}
                        className="group block rounded-xl border border-transparent px-2 py-2 hover:border-slate-700/80 hover:bg-slate-900/70"
                      >
                        <div className="text-[0.7rem] font-medium tracking-[0.18em] text-slate-500">
                          {col.categoryLabel}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-50 group-hover:text-teal-100">
                          {col.titleJa ?? col.title}
                        </div>
                        {col.readMinutes && (
                          <div className="mt-1 text-xs text-slate-400">
                            約{col.readMinutes}分で読めます
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/column"
                      className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-teal-200"
                    >
                      コラム一覧へ
                      <span className="ml-1 text-[0.65rem]">↗</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* GUIDE */}
            <Reveal asChild delay={0.08}>
              <GlassCard className="bg-slate-950/80">
                <div className="flex h-full flex-col">
                  <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-slate-400">
                    GUIDE
                  </h3>
                  <div className="space-y-3">
                    {latestGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`/guide/${guide.slug}`}
                        className="group block rounded-xl border border-transparent px-2 py-2 hover:border-slate-700/80 hover:bg-slate-900/70"
                      >
                        <div className="text-[0.7rem] font-medium tracking-[0.18em] text-slate-500">
                          {guide.categoryLabel}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-50 group-hover:text-teal-100">
                          {guide.titleJa ?? guide.title}
                        </div>
                        {guide.readMinutes && (
                          <div className="mt-1 text-xs text-slate-400">
                            約{guide.readMinutes}分で読めます
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/guide"
                      className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-teal-200"
                    >
                      ガイド一覧へ
                      <span className="ml-1 text-[0.65rem]">↗</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>

            {/* NEWS */}
            <Reveal asChild delay={0.11}>
              <GlassCard className="bg-slate-950/80">
                <div className="flex h-full flex-col">
                  <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-slate-400">
                    NEWS
                  </h3>
                  <div className="space-y-3">
                    {latestNews.map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.id}`}
                        className="group block rounded-xl border border-transparent px-2 py-2 hover:border-slate-700/80 hover:bg-slate-900/70"
                      >
                        <div className="text-[0.7rem] font-medium tracking-[0.18em] text-slate-500">
                          {item.sourceName}
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-50 group-hover:text-teal-100">
                          {item.titleJa ?? item.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/news"
                      className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-teal-200"
                    >
                      ニュース一覧へ
                      <span className="ml-1 text-[0.65rem]">↗</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
