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
  G30TemplateBySlug,
  type G30CarTemplate,
} from "@/lib/car-bmw-530i-g30";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

/**
 * CarItem をこのページ用に少し拡張したローカル型
 */
type ExtendedCarItem = CarItem & {
  mainImage?: string | null;
  heroImage?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
  costImpression?: string;
};

// ===== ユーティリティ =====

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

function formatDifficulty(difficulty?: CarItem["difficulty"]): string {
  switch (difficulty) {
    case "basic":
      return "維持難易度：やさしい";
    case "intermediate":
      return "維持難易度：ふつう";
    case "advanced":
      return "維持難易度：上級者向け";
    default:
      return "維持難易度：データなし";
  }
}

function formatDimension(
  lengthMm?: number,
  widthMm?: number,
  heightMm?: number,
): string {
  if (!lengthMm || !widthMm || !heightMm) return "サイズ情報なし";
  return `${lengthMm}×${widthMm}×${heightMm}mm`;
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
    mainImage: car.heroImage ?? car.heroImage ?? null,
  };
}

function buildMainImage(car: ExtendedCarItem): string {
  return (
    car.heroImage ??
    car.mainImage ??
    "/images/cars/default-sedan-hero.jpg"
  );
}

// 関連NEWS/COLUMN 用のキーワード
function buildKeywords(car: ExtendedCarItem): string[] {
  const keywords: string[] = [];

  keywords.push(car.name);
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
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .map((v) => v.trim().toUpperCase()),
    ),
  );
}

async function getRelatedCars(
  baseCar: ExtendedCarItem,
): Promise<CarItem[]> {
  const all = await getAllCars();
  const candidates = all.filter((car) => car.slug !== baseCar.slug);

  const sameMaker = candidates.filter(
    (car) => car.maker === baseCar.maker,
  );
  const sameSegment = candidates.filter(
    (car) =>
      car.segment &&
      baseCar.segment &&
      car.segment === baseCar.segment &&
      car.maker !== baseCar.maker,
  );

  const merged: CarItem[] = [];
  const pushUnique = (c: CarItem) => {
    if (!merged.some((m) => m.slug === c.slug)) {
      merged.push(c);
    }
  };

  sameMaker.forEach(pushUnique);
  sameSegment.forEach(pushUnique);

  return merged.slice(0, 4);
}

async function getRelatedNewsAndColumns(car: ExtendedCarItem): Promise<{
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
      if (tags.some((tag: string) => keywords.has(tag.toUpperCase()))) {
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
      const relatedCarSlugs: string[] =
        // @ts-expect-error 型定義側に拡張予定のフィールド
        c.relatedCarSlugs ?? [];

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
  return G30TemplateBySlug[car.slug];
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
  };
}

// ===== G30 用：走行シーン共通カードコンポーネント =====

type SceneImpression = {
  title: string;
  summary: string;
  pros?: string[];
  cons?: string[];
};

type SceneSectionProps = {
  label: string;
  impression?: SceneImpression;
};

function SceneSection({ label, impression }: SceneSectionProps) {
  if (!impression) return null;

  return (
    <GlassCard
      padding="md"
      className="h-full border border-slate-200/80 bg-white/90"
    >
      <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <h3 className="mb-1 text-xs font-semibold text-slate-900">
        {impression.title}
      </h3>
      <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
        {impression.summary}
      </p>
      <div className="grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
        {impression.pros && impression.pros.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-600">
              GOOD
            </p>
            <ul className="space-y-1">
              {impression.pros.map((p) => (
                <li key={p} className="flex gap-1">
                  <span className="mt-[3px] inline-block h-[6px] w-[6px] rounded-full bg-emerald-400/80" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {impression.cons && impression.cons.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-rose-600">
              CARE
            </p>
            <ul className="space-y-1">
              {impression.cons.map((p) => (
                <li key={p} className="flex gap-1">
                  <span className="mt-[3px] inline-block h-[6px] w-[6px] rounded-full bg-rose-400/80" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ===== メインページ =====

export default async function CarDetailPage({ params }: PageProps) {
  const carBase = await getCarBySlug(params.slug);
  if (!carBase) notFound();

  const car = ensureExtended(carBase);
  const mainImage = buildMainImage(car);
  const g30Template = getG30Template(car);

  const [{ relatedNews, relatedColumns }, relatedCars] =
    await Promise.all([
      getRelatedNewsAndColumns(car),
      getRelatedCars(car),
    ]);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">
            {car.name ?? car.slug}
          </span>
        </nav>

        {/* ヒーローセクション */}
        <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Reveal>
            <GlassCard
              as="section"
              padding="lg"
              className="relative overflow-hidden border border-slate-200/80 bg-gradient-to-br from-white via-white to-tiffany-50/70"
            >
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
              <div className="pointer-events-none absolute -right-32 bottom-[-40%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.25),_transparent_70%)] blur-3xl" />

              <div className="relative z-10 space-y-3 text-xs">
                <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-700">
                  CAR DATABASE
                </p>
                <h1 className="serif-heading text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                  {car.name}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {car.maker} {car.segment}
                  {car.releaseYear
                    ? ` / since ${car.releaseYear}`
                    : ""}
                </p>
                <p className="max-w-xl text-[11px] leading-relaxed text-slate-600">
                  {car.summaryLong ?? car.summary}
                </p>

                <div className="mt-3 grid gap-2 text-[11px] text-slate-700 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      BODY
                    </p>
                    <p>{car.bodyType ?? "不明"}</p>
                    <p className="text-[10px] text-slate-500">
                      {car.segment ?? "セグメント情報なし"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      POWERTRAIN
                    </p>
                    <p>{car.engine ?? "エンジン情報なし"}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatPowerAndTorque(
                        car.powerPs,
                        car.torqueNm,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                      OWNERSHIP
                    </p>
                    <p>{formatDifficulty(car.difficulty)}</p>
                    <p className="text-[10px] text-slate-500">
                      {car.fuel ?? "燃料区分：不明"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={80}>
            <GlassCard
              padding="none"
              className="overflow-hidden border border-slate-200/80 bg-slate-950/95"
            >
              <CarRotator
                imageUrl={mainImage}
                alt={car.name}
                aspectRatio={16 / 9}
                autoRotate={true}
                className="h-full"
              />
            </GlassCard>
          </Reveal>
        </section>

        {/* スペック＋オーナーインプレ */}
        <section className="mb-12 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
          <Reveal>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/90"
            >
              <h2 className="mb-3 text-xs font-semibold tracking-[0.24em] text-slate-500">
                MAIN SPEC
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-700">
                <div>
                  <dt className="text-[10px] text-slate-400">
                    ボディタイプ
                  </dt>
                  <dd>{car.bodyType ?? "―"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    セグメント
                  </dt>
                  <dd>{car.segment ?? "―"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    エンジン
                  </dt>
                  <dd>{car.engine ?? "―"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    最高出力/最大トルク
                  </dt>
                  <dd>
                    {formatPowerAndTorque(
                      car.powerPs,
                      car.torqueNm,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    駆動方式/ミッション
                  </dt>
                  <dd>
                    {car.drive ?? "―"} /{" "}
                    {car.transmission ?? "―"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    燃費(カタログ)
                  </dt>
                  <dd>{car.fuelEconomy ?? "―"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    サイズ(全長×全幅×全高)
                  </dt>
                  <dd>
                    {formatDimension(
                      car.lengthMm,
                      car.widthMm,
                      car.heightMm,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    ホイールベース
                  </dt>
                  <dd>
                    {car.wheelbaseMm
                      ? `${car.wheelbaseMm}mm`
                      : "―"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    車両重量
                  </dt>
                  <dd>
                    {car.weightKg
                      ? `${car.weightKg}kg`
                      : "―"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    タイヤサイズ(前/後)
                  </dt>
                  <dd>
                    {car.tiresFront || car.tiresRear
                      ? `${car.tiresFront ?? "?"} / ${
                          car.tiresRear ?? "?"
                        }`
                      : "―"}
                  </dd>
                </div>
              </dl>
            </GlassCard>
          </Reveal>

          <Reveal delay={80}>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/90"
            >
              <h2 className="mb-3 text-xs font-semibold tracking-[0.24em] text-slate-500">
                OWNER&apos;S IMPRESSION
              </h2>
              <div className="space-y-3 text-[11px] text-slate-700">
                {car.costImpression && (
                  <p className="leading-relaxed">
                    {car.costImpression}
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {car.strengths && car.strengths.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-600">
                        気に入っているところ
                      </p>
                      <ul className="space-y-1">
                        {car.strengths.map((s) => (
                          <li
                            key={s}
                            className="flex gap-1"
                          >
                            <span className="mt-[3px] inline-block h-[6px] w-[6px] rounded-full bg-emerald-400/80" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {car.weaknesses &&
                    car.weaknesses.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-rose-600">
                          気になるところ
                        </p>
                        <ul className="space-y-1">
                          {car.weaknesses.map((s) => (
                            <li
                              key={s}
                              className="flex gap-1"
                            >
                              <span className="mt-[3px] inline-block h-[6px] w-[6px] rounded-full bg-rose-400/80" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                {car.troubleTrends &&
                  car.troubleTrends.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-amber-600">
                        ありがちなトラブル・注意点
                      </p>
                      <ul className="space-y-1">
                        {car.troubleTrends.map((t) => (
                          <li key={t} className="flex gap-1">
                            <span className="mt-[3px] inline-block h-[6px] w-[6px] rounded-full bg-amber-400/80" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </GlassCard>
          </Reveal>
        </section>

        {/* G30専用シーン別インプレッション */}
        {g30Template && (
          <section className="mb-12">
            <Reveal>
              <h2 className="mb-4 text-xs font-semibold tracking-[0.24em] text-slate-500">
                USAGE SCENES (BMW G30 TEMPLATE)
              </h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              <Reveal>
                <SceneSection
                  label="CITY / 都内の街乗り"
                  impression={g30Template.usageImpressions.city}
                />
              </Reveal>
              <Reveal delay={60}>
                <SceneSection
                  label="HIGHWAY / 高速道路"
                  impression={g30Template.usageImpressions.highway}
                />
              </Reveal>
              <Reveal delay={120}>
                <SceneSection
                  label="LONG TRIP / 長距離ドライブ"
                  impression={g30Template.usageImpressions.longTrip}
                />
              </Reveal>
              <Reveal delay={180}>
                <SceneSection
                  label="MAINTENANCE / 維持と付き合い方"
                  impression={g30Template.usageImpressions.maintenance}
                />
              </Reveal>
            </div>
          </section>
        )}

        {/* 関連ニュース・コラム・他の候補 */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Reveal>
              <GlassCard
                as="section"
                padding="lg"
                className="border border-slate-200/80 bg-white/95"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold tracking-[0.24em] text-slate-500">
                    RELATED NEWS
                  </h2>
                  <Link
                    href="/news"
                    className="text-[10px] tracking-[0.18em] text-tiffany-700 hover:underline"
                  >
                    NEWS一覧へ
                  </Link>
                </div>
                {relatedNews.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    現時点でこの車種に紐づけたニュースはありません。
                  </p>
                ) : (
                  <ul className="space-y-2 text-[11px]">
                    {relatedNews.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/news/${encodeURIComponent(
                            item.id,
                          )}`}
                          className="group block rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:text-tiffany-700">
                            {item.titleJa ?? item.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {item.commentJa ?? item.excerpt}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                            {item.maker && (
                              <span>{item.maker}</span>
                            )}
                            {item.category && (
                              <>
                                <span>・</span>
                                <span>{item.category}</span>
                              </>
                            )}
                            {(item.publishedAt ||
                              item.createdAt) && (
                              <>
                                <span>・</span>
                                <span>
                                  {formatDate(
                                    item.publishedAt ??
                                      item.createdAt,
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </Reveal>

            <Reveal delay={80}>
              <GlassCard
                as="section"
                padding="lg"
                className="border border-slate-200/80 bg-white/95"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold tracking-[0.24em] text-slate-500">
                    RELATED COLUMNS
                  </h2>
                  <Link
                    href="/column"
                    className="text-[10px] tracking-[0.18em] text-tiffany-700 hover:underline"
                  >
                    コラム一覧へ
                  </Link>
                </div>
                {relatedColumns.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    関連するコラムはまだ登録されていません。
                  </p>
                ) : (
                  <ul className="space-y-2 text-[11px]">
                    {relatedColumns.map((col) => (
                      <li key={col.id}>
                        <Link
                          href={`/column/${encodeURIComponent(
                            col.slug,
                          )}`}
                          className="group block rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:text-tiffany-700">
                            {col.title}
                          </p>
                          {col.summary && (
                            <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                              {col.summary}
                            </p>
                          )}
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                            {col.category && (
                              <span>{col.category}</span>
                            )}
                            {col.publishedAt && (
                              <>
                                <span>・</span>
                                <span>
                                  {formatDate(col.publishedAt)}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/95"
            >
              <h2 className="mb-3 text-xs font-semibold tracking-[0.24em] text-slate-500">
                OTHER CANDIDATES
              </h2>
              {relatedCars.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  条件が近い他の候補車種はまだ登録されていません。
                </p>
              ) : (
                <ul className="space-y-2 text-[11px]">
                  {relatedCars.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/cars/${encodeURIComponent(
                          c.slug,
                        )}`}
                        className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-tiffany-700">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {c.maker} /{" "}
                            {c.segment ?? "セグメント不明"}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          詳しく見る →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
