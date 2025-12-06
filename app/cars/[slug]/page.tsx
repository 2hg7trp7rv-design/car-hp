// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { CarRotator } from "@/components/car/CarRotator";
import {
  getAllCars,
  getCarBySlug,
  type CarItem,
} from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import {
  getG30TemplateBySlug,
  type G30CarTemplate,
} from "@/lib/car-bmw-530i-g30";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

/**
 * CarItemをこのページ用に少し拡張したローカル型
 */
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
};

// ===== ユーティリティ =====

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDifficulty(difficulty?: string | null): string {
  switch (difficulty) {
    case "basic":
      return "★☆☆ 維持は比較的しやすい";
    case "intermediate":
      return "★★☆ 少し手間とコストがかかる";
    case "advanced":
      return "★★★ 維持には覚悟と予算が必要";
    default:
      return "維持難易度: 情報不足";
  }
}

function formatBodyAndSegment(
  bodyType?: string | null,
  segment?: string | null,
): string {
  if (bodyType && segment) return `${bodyType} / ${segment}`;
  if (bodyType) return bodyType;
  if (segment) return segment;
  return "ボディ/セグメント: 情報不足";
}

function formatPowerAndTorque(
  powerPs?: number,
  torqueNm?: number,
): string {
  if (!powerPs && !torqueNm) return "出力情報なし";
  if (powerPs && torqueNm) {
    return `${powerPs}ps / ${torqueNm}Nm`;
  }
  if (powerPs) return `${powerPs}ps`;
  return `${torqueNm}Nm`;
}

function ensureExtended(car: CarItem): ExtendedCarItem {
  return {
    ...car,
    // heroImageをmainImageとしても扱えるようにしておく（undefinedのままでもOK）
    mainImage: car.heroImage,
  };
}

function buildMainImage(car: ExtendedCarItem): string {
  return (
    car.heroImage ??
    car.mainImage ??
    "/images/cars/placeholder-luxury-sedan.jpg"
  );
}

function buildKeywords(car: ExtendedCarItem): string[] {
  const keywords: string[] = [];

  keywords.push(car.maker);
  keywords.push(car.slug);

  if (car.grade) keywords.push(car.grade);
  if (car.segment) keywords.push(car.segment);
  if (car.bodyType) keywords.push(car.bodyType);
  if (car.engine) keywords.push(car.engine);

  if (Array.isArray(car.tags)) {
    for (const tag of car.tags) {
      if (tag) keywords.push(tag);
    }
  }

  return Array.from(
    new Set(
      keywords
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => k.toUpperCase()),
    ),
  );
}

async function getRelatedContentForCar(car: ExtendedCarItem): Promise<{
  relatedNews: NewsItem[];
  relatedColumns: ColumnItem[];
}> {
  const [news, columns] = await Promise.all([
    getLatestNews(80),
    getAllColumns(),
  ]);

  const keywords = new Set<string>(buildKeywords(car));

  const relatedNews: NewsItem[] = news
    .filter((item) => {
      if (item.maker && item.maker === car.maker) return true;

      const tags: string[] = item.tags ?? [];
      if (
        tags.some((tag: string) =>
          keywords.has(tag.toUpperCase()),
        )
      ) {
        return true;
      }

      const title = `${item.titleJa ?? ""} ${
        item.title
      }`.toUpperCase();

      return Array.from(keywords).some(
        (kw) => kw && title.includes(kw),
      );
    })
    .slice(0, 5);

  const relatedColumns: ColumnItem[] = columns
    .filter((c) => {
      const relatedCarSlugs: string[] = c.relatedCarSlugs ?? [];

      if (relatedCarSlugs.includes(car.slug)) {
        return true;
      }

      const title = `${c.title} ${c.summary}`.toUpperCase();
      return Array.from(keywords).some(
        (kw) => kw && title.includes(kw),
      );
    })
    .slice(0, 5);

  return { relatedNews, relatedColumns };
}

function getG30Template(
  car: ExtendedCarItem,
): G30CarTemplate | undefined {
  const template = getG30TemplateBySlug(car.slug);

  // lib/car-bmw-530i-g30.ts側はG30CarTemplate | nullを返すので
  // このページではnullをundefinedに正規化して扱う
  if (!template) {
    return undefined;
  }

  return template;
}

// ===== Next.js メタ情報 =====

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
    };
  }

  const extended = ensureExtended(car);
  const title = extended.name ?? extended.slug;
  const description =
    extended.summaryLong ??
    extended.summary ??
    "CAR BOUTIQUEによる車種別インプレッションとオーナー目線の解説。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
    },
  };
}

// ===== メインページ =====

export default async function CarDetailPage({ params }: PageProps) {
  const carBase = await getCarBySlug(params.slug);
  if (!carBase) notFound();

  const car = ensureExtended(carBase);
  const { relatedNews, relatedColumns } =
    await getRelatedContentForCar(car);
  const g30Template = getG30Template(car);

  const mainImage = buildMainImage(car);

  const heroTitle = car.name ?? car.slug;
  const heroSubtitle = formatBodyAndSegment(
    car.bodyType,
    car.segment,
  );

  const hasStrengths = Array.isArray(car.strengths);
  const hasWeaknesses = Array.isArray(car.weaknesses);
  const hasTrouble =
    Array.isArray(car.troubleTrends) &&
    car.troubleTrends.length > 0;

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/cars"
            className="hover:text-slate-800"
          >
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">
            {car.name ?? car.slug}
          </span>
        </nav>

        {/* ヒーロー */}
        <section className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Reveal>
            <GlassCard
              padding="none"
              className="relative overflow-hidden border border-slate-200/80 bg-slate-950/95"
            >
              {/* 背景グラデーション */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(15,23,42,1))]" />

              {/* 車ローテーター */}
              <div className="relative z-10">
                <CarRotator
                  mainImage={mainImage}
                  maker={car.maker}
                  name={car.name ?? car.slug}
                  difficulty={car.difficulty}
                  bodyType={car.bodyType}
                  segment={car.segment}
                />
              </div>

              {/* 下部ラベル */}
              <div className="relative z-10 border-t border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-900/80 px-4 py-3 text-[11px] text-slate-100 sm:px-5 sm:py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-400/90 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-950">
                      {car.maker}
                    </span>
                    {car.releaseYear && (
                      <span className="text-[10px] text-slate-300">
                        since {car.releaseYear}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100">
                    {formatBodyAndSegment(
                      car.bodyType,
                      car.segment,
                    )}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100">
                    {formatDifficulty(car.difficulty)}
                  </span>

                  {car.engine && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100">
                      {car.engine}
                    </span>
                  )}

                  <span className="ml-auto text-[10px] text-slate-400">
                    CAR DATABASE
                  </span>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          {/* テキストブロック */}
          <Reveal delay={80}>
            <GlassCard padding="lg">
              <div className="space-y-4 text-[13px]">
                <div>
                  <h1 className="serif-heading text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                    {heroTitle}
                  </h1>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {heroSubtitle}
                    {car.releaseYear
                      ? ` / since ${car.releaseYear}`
                      : ""}
                  </p>
                  <p className="max-w-xl text-[11px] leading-relaxed text-slate-600">
                    {car.summaryLong ?? car.summary}
                  </p>
                </div>

                <div className="grid gap-3 text-[11px] text-slate-700 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      ENGINE&POWER
                    </p>
                    <p>
                      {car.engine ?? "エンジン情報なし"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatPowerAndTorque(
                        car.powerPs,
                        car.torqueNm,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      DRIVE&TRANSMISSION
                    </p>
                    <p>
                      {car.drive ?? "駆動方式: 不明"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {car.transmission ??
                        "トランスミッション情報なし"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      FUEL&MAINTENANCE
                    </p>
                    <p>
                      {car.costImpression ??
                        "維持費感: 情報不足"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {car.fuel ?? "燃料区分: 不明"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={80}>
            <GlassCard
              padding="none"
              className="overflow-hidden border border-slate-200/80 bg-white"
            >
              <div className="grid h-full gap-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                {/* 「このクルマと暮らすイメージ」 */}
                <div className="relative flex flex-col justify-between border-b border-slate-100 bg-gradient-to-br from-tiffany-50/80 via-white to-slate-50/90 p-4 text-[11px] text-slate-800 md:border-b-0 md:border-r">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                      HOW THIS CAR FITS YOUR LIFE
                    </p>
                    <p className="mb-2 text-xs font-medium text-slate-900">
                      このクルマと暮らすイメージ
                    </p>
                    <p className="max-w-md text-[11px] leading-relaxed text-slate-700">
                      {g30Template?.lifestyle?.summary ??
                        "街乗りから長距離ドライブまで、どんなシーンで気持ちよく走れるか。日々の生活や休日の過ごし方をイメージしながら、このクルマとの距離感を整理していきます。"}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-700">
                    <div className="rounded-xl bg-white/80 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                        BEST MATCH
                      </p>
                      <ul className="space-y-1">
                        {(g30Template?.lifestyle?.bestFor ??
                          [
                            "高速道路をよく使うロングドライブ派",
                            "運転そのものを楽しみたい人",
                          ]
                        ).map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-1.5"
                          >
                            <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-emerald-400/80" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-slate-900/95 p-3 text-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.8)]">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-slate-300">
                        NOT FOR
                      </p>
                      <ul className="space-y-1 text-[10px]">
                        {(g30Template?.lifestyle?.notFor ??
                          [
                            "短距離の街乗りメインで、燃費と取り回しだけを重視する人",
                            "維持費を最小限に抑えたい人",
                          ]
                        ).map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-1.5"
                          >
                            <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-rose-400/80" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 維持費&トラブル傾向 */}
                <div className="flex flex-col justify-between bg-slate-900/98 p-4 text-[11px] text-slate-50">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-emerald-200">
                      COST&TROUBLE
                    </p>
                    <p className="mb-2 text-xs font-medium text-white">
                      維持費とトラブルのリアル
                    </p>

                    <p className="mb-2 text-[11px] leading-relaxed text-slate-100">
                      {g30Template?.maintenance?.summary ??
                        car.costImpression ??
                        "輸入車としては標準的な維持費感ですが、年数や走行距離に応じて足まわりや電装系のリフレッシュ費用がかかり始めます。"}
                    </p>

                    {hasTrouble && (
                      <div className="mt-2 rounded-lg bg-slate-800/80 p-3 text-[10px]">
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-amber-200">
                          よく話題に上がるトラブル傾向
                        </p>
                        <ul className="space-y-1.5">
                          {car.troubleTrends!.map((t) => (
                            <li
                              key={t}
                              className="flex items-start gap-1.5"
                            >
                              <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-amber-400/80" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {g30Template?.maintenance?.roughCosts && (
                    <div className="mt-3 rounded-lg bg-slate-900/80 p-3 text-[10px] text-slate-100">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-200">
                        年間ざっくり維持費の目安
                      </p>
                      <p className="leading-relaxed">
                        {
                          g30Template.maintenance.roughCosts
                            .yearlyRoughTotal
                        }
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        想定走行距離や使用環境によって大きく変わるため、「イメージ」として参考にしてください。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </Reveal>
        </section>

        {/* メインコンテンツ: スペックと特徴 */}
        <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* 左: スペック&特徴 */}
          <Reveal>
            <GlassCard padding="lg">
              <div className="space-y-6 text-[11px] text-slate-800">
                {/* MAIN SPEC */}
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    MAIN SPEC
                  </p>
                  <p className="mb-2 text-xs font-medium text-slate-900">
                    主要スペック
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <SpecRow label="メーカー">
                        {car.maker}
                      </SpecRow>
                      <SpecRow label="ボディタイプ">
                        {car.bodyType ?? "情報不足"}
                      </SpecRow>
                      <SpecRow label="セグメント">
                        {car.segment ?? "情報不足"}
                      </SpecRow>
                      <SpecRow label="グレード">
                        {car.grade ?? "記載なし"}
                      </SpecRow>
                    </div>
                    <div className="space-y-1">
                      <SpecRow label="エンジン">
                        {car.engine ?? "情報不足"}
                      </SpecRow>
                      <SpecRow label="トランスミッション">
                        {car.transmission ?? "情報不足"}
                      </SpecRow>
                      <SpecRow label="駆動方式">
                        {car.drive ?? "情報不足"}
                      </SpecRow>
                      <SpecRow label="燃料種別">
                        {car.fuel ?? "情報不足"}
                      </SpecRow>
                    </div>
                  </div>
                </div>

                {/* SIZE&PACKAGE */}
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    SIZE&PACKAGE
                  </p>
                  <p className="mb-2 text-xs font-medium text-slate-900">
                    サイズ&パッケージ
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <SpecRow label="全長">
                        {car.lengthMm
                          ? `${car.lengthMm}mm`
                          : "情報不足"}
                      </SpecRow>
                      <SpecRow label="全幅">
                        {car.widthMm
                          ? `${car.widthMm}mm`
                          : "情報不足"}
                      </SpecRow>
                      <SpecRow label="全高">
                        {car.heightMm
                          ? `${car.heightMm}mm`
                          : "情報不足"}
                      </SpecRow>
                      <SpecRow label="ホイールベース">
                        {car.wheelbaseMm
                          ? `${car.wheelbaseMm}mm`
                          : "情報不足"}
                      </SpecRow>
                    </div>
                    <div className="space-y-1">
                      <SpecRow label="車両重量">
                        {car.weightKg
                          ? `${car.weightKg}kg`
                          : "情報不足"}
                      </SpecRow>
                      <SpecRow label="トランク容量">
                        {car.trunkCapacityL
                          ? `${car.trunkCapacityL}L`
                          : "情報不足"}
                      </SpecRow>
                      <SpecRow label="定員">
                        {car.seats
                          ? `${car.seats}名`
                          : "情報不足"}
                      </SpecRow>
                    </div>
                  </div>
                </div>

                {/* ドライブフィールなど */}
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    CHARACTER
                  </p>
                  <p className="mb-2 text-xs font-medium text-slate-900">
                    走り味とキャラクター
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.16em] text-emerald-700">
                        GOOD POINTS
                      </p>
                      <ul className="space-y-1.5">
                        {(car.strengths ??
                          g30Template?.character?.strengths ??
                          [
                            "高速域での安定感と余裕ある加速",
                            "長距離でも疲れにくいシートと静粛性",
                            "上質なインテリアと作り込み",
                          ]
                        ).map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-1.5"
                          >
                            <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-emerald-400/80" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.16em] text-rose-700">
                        CARE POINTS
                      </p>
                      <ul className="space-y-1.5 text-[10px]">
                        {(car.weaknesses ??
                          g30Template?.character?.weaknesses ??
                          [
                            "街乗り中心だとサイズと取り回しに気を使う",
                            "タイヤやブレーキなど消耗品の単価はそれなり",
                            "中古車は個体差が大きく、状態の見極めが重要",
                          ]
                        ).map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-1.5"
                          >
                            <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-rose-400/80" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          {/* 右: 関連ニュース&コラム */}
          <Reveal delay={80}>
            <GlassCard padding="lg" className="space-y-5">
              {/* 関連ニュース */}
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  RELATED NEWS
                </p>
                <p className="mb-2 text-xs font-medium text-slate-900">
                  この車種に関連する最新ニュース
                </p>

                {relatedNews.length === 0 ? (
                  <p className="text-[10px] text-slate-500">
                    現在、この車種に直接関連づけられたニュースはありません。
                    メーカー別ニュース一覧からチェックする想定。
                  </p>
                ) : (
                  <ul className="space-y-2 text-[11px]">
                    {relatedNews.map((news) => (
                      <li key={news.id}>
                        <Link
                          href={`/news/${encodeURIComponent(
                            news.id,
                          )}`}
                          className="group block rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] transition hover:border-tiffany-300 hover:bg-white"
                        >
                          <p className="line-clamp-2 font-medium text-slate-900 group-hover:text-tiffany-700">
                            {news.titleJa ?? news.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {formatDate(
                              news.publishedAt ?? news.createdAt,
                            )}{" "}
                            •{" "}
                            {news.sourceName ??
                              news.maker ??
                              "公式サイト"}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 関連コラム */}
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  RELATED COLUMNS
                </p>
                <p className="mb-2 text-xs font-medium text-slate-900">
                  同じ車種やテーマのコラム
                </p>

                {relatedColumns.length === 0 ? (
                  <p className="text-[10px] text-slate-500">
                    この車種に紐づくコラムは準備中です。
                    整備記録やオーナー体験記を順次追加していく予定です。
                  </p>
                ) : (
                  <ul className="space-y-2 text-[11px]">
                    {relatedColumns.map((col) => (
                      <li key={col.id}>
                        <Link
                          href={`/column/${col.slug}`}
                          className="group block rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] transition hover:border-tiffany-300 hover:bg-tiffany-50/60"
                        >
                          <p className="line-clamp-2 font-medium text-slate-900 group-hover:text-tiffany-800">
                            {col.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {col.summary}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(
                              col.publishedAt ?? col.updatedAt,
                            )}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassCard>
          </Reveal>
        </section>

        {/* 下部: 他の車種への導線 */}
        <section>
          <Reveal>
            <GlassCard padding="lg">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  MORE CARS
                </p>
                <p className="text-xs text-slate-900">
                  他の車種もあわせてチェック
                </p>
              </div>
              <p className="mb-3 text-[11px] text-slate-600">
                近いキャラクターの車種や、同じメーカーの別ボディタイプなど、
                比較検討しやすい車種をCARSページから探せる想定です。
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <Link
                  href="/cars?maker=BMW"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-700 transition hover:border-tiffany-300 hover:bg-tiffany-50"
                >
                  BMWの他の車種を見る
                </Link>
                <Link
                  href="/cars?bodyType=セダン"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-700 transition hover:border-tiffany-300 hover:bg-tiffany-50"
                >
                  輸入セダンを比較する
                </Link>
                <Link
                  href="/cars"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.16em] text-slate-700 transition hover:border-tiffany-300 hover:bg-tiffany-50"
                >
                  CARS一覧に戻る
                </Link>
              </div>
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}

type SpecRowProps = {
  label: string;
  children: React.ReactNode;
};

function SpecRow({ label, children }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[11px]">
      <span className="text-[10px] text-slate-500">
        {label}
      </span>
      <span className="max-w-[65%] text-right text-[11px] text-slate-800">
        {children}
      </span>
    </div>
  );
}
