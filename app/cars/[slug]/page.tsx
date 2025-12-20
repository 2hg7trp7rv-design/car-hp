// app/cars/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getSiteUrl } from "@/lib/site";
import { getAllCars, getCarBySlug, type CarItem } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import {
  getAllHeritage,
  getHeritagePreviewText,
  type HeritageItem,
} from "@/lib/heritage";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { JsonLd } from "@/components/seo/JsonLd";

export const runtime = "edge";

type PageProps = {
  params: {
    slug: string;
  };
};

// CarItem の拡張版（JSON側の揺れをここで吸収）
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;

  // 説明/印象
  costImpression?: string;

  // 特徴（任意）
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];

  // 数値（任意）
  zeroTo100?: number;
  priceNew?: string;
  priceUsed?: string;
  fuelEconomy?: string;

  // 任意: 関連ID
  relatedNewsIds?: string[];
  relatedColumnSlugs?: string[];
  relatedHeritageIds?: string[];

  // こんな人におすすめ/向いていない
  bestFor?: string[];
  notFor?: string[];

  // 維持メモ
  maintenanceNotes?: string[];

  // サイズ系スペック
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;
};

type GuideWithMeta = GuideItem & {
  relatedCarSlugs?: (string | null)[];
};

type ColumnWithMeta = ColumnItem & {
  relatedCarSlugs?: (string | null)[];
};

type HeritageWithMeta = HeritageItem & {
  keyCarSlugs?: (string | null)[];
  heroTitle?: string | null;
  kind?: string | null;
  brandName?: string | null;
};

type MultilineTextProps = {
  text: string;
  className?: string;
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

// 汎用: 段落表示
function MultilineText({ text, className }: MultilineTextProps) {
  const paragraphs = splitIntoParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className ?? "space-y-4"}>
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

function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function pickGuidesForCar(
  carSlug: string,
  guides: GuideWithMeta[],
  limit = 4,
): GuideWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const filtered = guides.filter((g) =>
    (g.relatedCarSlugs ?? [])
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .includes(target),
  );
  return filtered.slice(0, limit);
}

function pickColumnsForCar(
  carSlug: string,
  columns: ColumnWithMeta[],
  limit = 4,
): ColumnWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const filtered = columns.filter((c) =>
    (c.relatedCarSlugs ?? [])
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .includes(target),
  );
  return filtered.slice(0, limit);
}

function pickHeritageForCar(
  carSlug: string,
  heritageList: HeritageWithMeta[],
  limit = 4,
): HeritageWithMeta[] {
  const target = carSlug.trim();
  if (!target) return [];
  const hits = heritageList.filter((h) =>
    (h.keyCarSlugs ?? [])
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .includes(target),
  );
  return hits.slice(0, limit);
}

function mapHeritageKindLabel(kind?: string | null): string {
  switch (kind) {
    case "brand":
      return "BRAND";
    case "model":
      return "MODEL";
    case "era":
      return "ERA";
    case "culture":
      return "CULTURE";
    default:
      return "HERITAGE";
  }
}

function pickList(
  primary?: string[] | null,
  secondary?: string[] | null,
  fallback?: string[] | null,
  limit = 4,
): string[] {
  const p = (primary ?? []).filter((v) => typeof v === "string" && v.trim());
  if (p.length > 0) return p.slice(0, limit);

  const s = (secondary ?? []).filter((v) => typeof v === "string" && v.trim());
  if (s.length > 0) return s.slice(0, limit);

  const f = (fallback ?? []).filter((v) => typeof v === "string" && v.trim());
  if (f.length > 0) return f.slice(0, limit);

  return [];
}

// メタデータ
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const titleBase = car.name ?? car.slug;
  const description = car.summaryLong ?? car.summary ?? "";

  // Canonical URL
  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;

  const ogImage = (car.heroImage ?? car.mainImage ?? "").trim();
  return {
    title: `${titleBase} | CAR BOUTIQUE`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${titleBase} | CAR BOUTIQUE`,
      description,
      type: "article",
      url,
      images: ogImage ? [ogImage] : [],
    },
  };
}

// メインページ
export default async function CarDetailPage({ params }: PageProps) {
  const [carRaw, allGuidesRaw, allColumnsRaw, allHeritageRaw] =
    await Promise.all([
      getCarBySlug(params.slug),
      getAllGuides(),
      getAllColumns(),
      getAllHeritage(),
    ]);

  if (!carRaw) notFound();

  const car = carRaw as ExtendedCarItem;
  const guidesWithMeta = allGuidesRaw as GuideWithMeta[];
  const columnsWithMeta = allColumnsRaw as ColumnWithMeta[];
  const heritageWithMeta = allHeritageRaw as HeritageWithMeta[];

  const relatedGuides = pickGuidesForCar(car.slug, guidesWithMeta, 2);
  const relatedColumns = pickColumnsForCar(car.slug, columnsWithMeta, 2);
  const relatedHeritage = pickHeritageForCar(car.slug, heritageWithMeta, 2);

  const title = formatMakerAndName(car);
  const zeroTo100 = formatZeroTo100(car.zeroTo100);

  const overviewText = car.summaryLong ?? car.summary ?? "";
  const difficultyLabel = formatDifficultyLabel(car.difficulty);

  const heroImageSrc = (car.heroImage ?? car.mainImage ?? "").trim();
  const heroImage = heroImageSrc.length > 0 ? heroImageSrc : null;

  // mock寄せ: 2枚カードの中身
  const worries = pickList(car.weaknesses, car.troubleTrends, null, 4);
  const points = pickList(car.maintenanceNotes, car.strengths, null, 3);

  // JSON-LD（Product/Vehicle相当）
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: heroImage ? [heroImage] : [],
    description: overviewText,
    brand: car.maker
      ? {
          "@type": "Brand",
          name: car.maker,
        }
      : undefined,
    vehicleConfiguration: car.bodyType ?? undefined,
    vehicleEngine: car.engine
      ? {
          "@type": "EngineSpecification",
          name: car.engine,
        }
      : undefined,
    modelDate: car.releaseYear ?? undefined,
  };

  // パンくず（JSON-LD）
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "CARS",
        item: `${getSiteUrl()}/cars`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: car.name ?? car.slug,
        item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* JSON-LD */}
      <JsonLd id={`jsonld-car-${car.slug}-product`} data={structuredData} />
      <JsonLd id={`jsonld-car-${car.slug}-breadcrumb`} data={breadcrumbData} />

      <ScrollDepthTracker />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
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

        {/* =========================
         * Hero（mock寄せ）
         * - SPでも「説明 + 画像」を横並び
         * - CTAは "中古価格情報をチェック" → 在庫セクションへスクロール
         * ========================= */}
        <section className="mb-10 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-soft-card backdrop-blur-sm sm:p-8">
          {/* ラベル行 */}
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

          {/* タイトル / タグ */}
          <h1 className="serif-heading text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600">
            {car.bodyType && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.bodyType}
              </span>
            )}
            {car.drive && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {car.drive}
              </span>
            )}
            {car.releaseYear && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                登場:{car.releaseYear}年頃
              </span>
            )}
            {car.fuelEconomy && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                燃費目安:{car.fuelEconomy}
              </span>
            )}
            {zeroTo100 && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                加速:{zeroTo100}
              </span>
            )}
          </div>

          {/* 説明 + 画像（SPも横並び） */}
          <div className="mt-6 grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5 sm:gap-6">
            <div className="min-w-0">
              {overviewText ? (
                <MultilineText text={overviewText} />
              ) : (
                <p className="text-[13px] leading-[1.9] text-text-sub sm:text-[14px]">
                  —
                </p>
              )}

              <div className="mt-5">
                <Link
                  href="#inventory"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-[12px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                >
                  中古価格情報をチェック →
                </Link>
              </div>
            </div>

            <div className="min-w-0">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <div className="relative aspect-[4/3] w-full">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 420px, 40vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
         * 特徴（mock寄せ：2枚カード）
         * ========================= */}
        <section className="mb-10">
          <h2 className="serif-heading mb-4 text-xl font-medium text-slate-900">
            このクルマの特徴
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* 左: 画像+オーバーレイ（よくある悩み） */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
              <div className="absolute inset-0">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover opacity-70"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/55 to-slate-950/85" />
              </div>

              <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">⚠️</span>
                  <p className="text-[12px] font-semibold text-white/90">
                    よくある悩み
                  </p>
                </div>

                <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-white/90">
                  {(worries.length > 0
                    ? worries
                    : [
                        "維持費と修理コストの振れ幅が大きい",
                        "車幅・サイズ感に慣れが必要",
                        "保険・保証の条件が年式/個体で変わる",
                      ]
                  ).map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-white/70" />
                      <span className="line-clamp-2">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 右: 白カード（維持費面で効く箇所） */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-center gap-2">
                <span className="text-[12px]">🏛️</span>
                <p className="text-[12px] font-semibold text-slate-900">
                  維持費面で効く箇所
                </p>
              </div>

              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-700">
                {(points.length > 0
                  ? points
                  : [
                      "実用域での燃費/タイヤ/ブレーキ摩耗",
                      "消耗品の単価（グレード差が出やすい）",
                      "保険・保証の条件（年式/距離）",
                    ]
                ).map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                    <span className="line-clamp-2">{t}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
                ※ 年式・個体差で大きく変動します。現物確認と見積もり比較を推奨します。
              </p>
            </div>
          </div>
        </section>

        {/* =========================
         * 在庫/次の導線（mock寄せ：2タイル+CTA）
         * ========================= */}
        <section id="inventory" className="mb-12 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft-card backdrop-blur-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[14px]">🔎</span>
            <h2 className="serif-heading text-base font-medium text-slate-900">
              中古在庫を探す
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* 左タイル：GUIDE をNEWS表記で見せる（mock寄せ） */}
            <Link
              href={
                relatedGuides[0]
                  ? `/guide/${encodeURIComponent(relatedGuides[0].slug)}`
                  : "/guide"
              }
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/90"
            >
              <div className="relative aspect-[16/10]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover opacity-80 transition group-hover:scale-[1.02]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                  NEWS
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-relaxed text-white">
                    {relatedGuides[0]?.title ?? "中古在庫を探す"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 text-[11px] text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <span className="text-[12px]">🔎</span>
                  中古在庫を探す
                </span>
                <span className="text-slate-400">›</span>
              </div>
            </Link>

            {/* 右タイル：COLUMN */}
            <Link
              href={
                relatedColumns[0]
                  ? `/column/${encodeURIComponent(relatedColumns[0].slug)}`
                  : "/column"
              }
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/90"
            >
              <div className="relative aspect-[16/10]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover opacity-80 transition group-hover:scale-[1.02]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-slate-700">
                  COLUMN
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-relaxed text-white">
                    {relatedColumns[0]?.title ?? "保険料の目安を出す"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 text-[11px] text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <span className="text-[12px]">➕</span>
                  保険料の目安を出す
                </span>
                <span className="text-slate-400">›</span>
              </div>
            </Link>
          </div>

          {/* 補助: 関連HERITAGE（あれば） */}
          {relatedHeritage.length > 0 && (
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                RELATED HERITAGE
              </p>
              <div className="grid gap-2">
                {relatedHeritage.map((h) => {
                  const preview = getHeritagePreviewText(h, { maxChars: 90 });
                  return (
                    <Link
                      key={h.id}
                      href={`/heritage/${encodeURIComponent(h.slug)}`}
                      className="rounded-xl bg-white px-3 py-2 text-[11px] text-slate-700 shadow-sm transition hover:shadow"
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {mapHeritageKindLabel(h.kind)}
                        </span>
                        {h.brandName ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {h.brandName}
                          </span>
                        ) : null}
                        {h.publishedAt ? (
                          <span className="ml-auto text-slate-400">
                            {formatDate(h.publishedAt)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-1 font-semibold text-slate-900">
                        {h.heroTitle ?? h.title}
                      </p>
                      {preview ? (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                          {preview}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* =========================
         * NEXT ACTION（既存方針：外部導線の受け皿）
         * ========================= */}
        <section className="mt-14">
          <Reveal>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft-card backdrop-blur-sm sm:p-8">
              <div className="mb-5">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-tiffany-600">
                  NEXT ACTION
                </p>
                <h2 className="serif-heading mt-1 text-lg font-medium text-slate-900">
                  次に取れるアクション
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  気になったら、現実的な選択肢をここで確認
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/guide"
                  className="flex items-center justify-center rounded-full border border-slate-900 px-5 py-3 text-[12px] font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  維持費・注意点を見る
                </Link>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-[12px] font-medium text-slate-700 transition hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  中古車相場をチェック
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  保険・ローンを比較する
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* フッター導線 */}
        <div className="mt-10 text-right">
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
    </main>
  );
}
