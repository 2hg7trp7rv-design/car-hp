// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getColumnBySlug, getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

import ColumnReaderShell from "./reader-shell";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

// ColumnItemの拡張メタ用型
type ColumnWithMeta = ColumnItem & {
  readMinutes?: number | null;
  tags?: string[] | null;
  relatedCarSlugs?: (string | null)[];
  relatedGuideSlugs?: (string | null)[];
  relatedHeritageSlugs?: (string | null)[];
};

type GuideWithMeta = GuideItem & {
  category?: string | null;
  tags?: string[] | null;
};

type HeritageWithMeta = HeritageItem;

// SSG 用パス
export async function generateStaticParams() {
  const items = await getAllColumns();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getColumnBySlug(params.slug);

  if (!item) {
    return {
      title: "コラムが見つかりません | CAR BOUTIQUE",
      description: "指定されたコラムが見つかりませんでした。",
    };
  }

  const description =
    item.summary ||
    "トラブル・修理の実例や、ブランドの歴史・技術解説などを整理したコラムです。";

  const title = `${item.title} | CAR BOUTIQUE`;
  const url = `https://car-hp.vercel.app/column/${encodeURIComponent(
    params.slug,
  )}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// カテゴリ表示用
function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "技術・歴史・ブランド";
    case "OWNER_STORY":
      return "オーナーストーリー";
    default:
      return "コラム";
  }
}

// ガイドカテゴリ表示用（軽めのラベル）
function mapGuideCategoryLabel(category?: GuideItem["category"] | null): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "SELL":
      return "売却・乗り換え";
    case "BUY":
      return "購入計画";
    case "MAINTENANCE_COST":
      return "維持費の考え方";
    default:
      return "ガイド";
  }
}

// コラムに関連するコラム候補を抽出
function pickRelatedColumns(base: ColumnWithMeta, allColumns: ColumnItem[]) {
  const candidates = allColumns.filter((c) => c.id !== base.id);

  const scored = candidates
    .map((c) => {
      let score = 0;

      // カテゴリ一致
      if (c.category && base.category && c.category === base.category) {
        score += 2;
      }

      const baseTags = new Set(base.tags ?? []);
      if (c.tags && baseTags.size > 0) {
        const overlap = c.tags.filter((t) => baseTags.has(t)).length;
        if (overlap > 0) {
          score += 1 + overlap * 0.2;
        }
      }

      // タイトル・概要のざっくりキーワード
      const haystack = `${c.title} ${c.summary ?? ""}`.toLowerCase();
      const words = `${base.title} ${base.summary ?? ""}`
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);

      if (words.some((w) => haystack.includes(w))) {
        score += 0.5;
      }

      return { column: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map((x) => x.column);
}

// コラムに関連するガイドを抽出
function pickRelatedGuidesForColumn(column: ColumnWithMeta, guides: GuideWithMeta[]) {
  const relatedSlugs = (column.relatedGuideSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  if (relatedSlugs.length > 0) {
    const ordered = relatedSlugs
      .map((slug) => guides.find((g) => g.slug === slug))
      .filter((g): g is GuideWithMeta => Boolean(g));
    if (ordered.length > 0) {
      return ordered.slice(0, 4);
    }
  }

  const columnTags = new Set(column.tags ?? []);
  const columnCategory = column.category ?? null;

  const scored = guides
    .map((g) => {
      let score = 0;

      if (g.tags && columnTags.size > 0) {
        const overlap = g.tags.filter((t) => columnTags.has(t)).length;
        if (overlap > 0) {
          score += 2 + overlap * 0.2;
        }
      }

      if (columnCategory === "MAINTENANCE") {
        if (g.category === "MONEY" || g.category === "MAINTENANCE_COST") {
          score += 1.5;
        }
      } else if (columnCategory === "TECHNICAL") {
        if (g.category === "BUY" || g.category === "SELL") {
          score += 1;
        }
      } else if (columnCategory === "OWNER_STORY") {
        if (g.category === "MONEY" || g.category === "SELL") {
          score += 1;
        }
      }

      const haystack = `${g.title} ${g.summary ?? ""}`.toLowerCase();
      const words = `${column.title} ${column.summary ?? ""}`
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);

      if (words.some((w) => haystack.includes(w))) {
        score += 0.5;
      }

      return { guide: g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map((x) => x.guide);
}

// コラムに関連する車種を抽出
function pickRelatedCarsForColumn(column: ColumnWithMeta, cars: CarItem[]) {
  const relatedSlugs = (column.relatedCarSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  if (relatedSlugs.length > 0) {
    const ordered = relatedSlugs
      .map((slug) => cars.find((c) => c.slug === slug))
      .filter((c): c is CarItem => Boolean(c));
    if (ordered.length > 0) {
      return ordered.slice(0, 6);
    }
  }

  const titleSummary = `${column.title} ${column.summary ?? ""} ${
    column.body ?? ""
  }`.toLowerCase();

  const scored = cars
    .map((car) => {
      let score = 0;
      const name = `${car.maker ?? ""} ${car.name ?? ""}`.trim().toLowerCase();
      const alt = (car.slug ?? "").toLowerCase();

      if (name && titleSummary.includes(name)) {
        score += 3;
      }
      if (alt && titleSummary.includes(alt)) {
        score += 1.5;
      }

      return { car, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored.map((x) => x.car);
}

// コラムに関連するHERITAGEを抽出
function pickRelatedHeritageForColumn(
  column: ColumnWithMeta,
  heritageList: HeritageWithMeta[],
) {
  const relatedSlugs = (column.relatedHeritageSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  if (relatedSlugs.length > 0) {
    const ordered = relatedSlugs
      .map((slug) => heritageList.find((h) => h.slug === slug))
      .filter((h): h is HeritageWithMeta => Boolean(h));
    if (ordered.length > 0) {
      return ordered.slice(0, 3);
    }
  }

  return [];
}

export default async function ColumnDetailPage({ params }: Props) {
  const [item, allColumns, allGuidesRaw, allCars, allHeritageRaw] =
    await Promise.all([
      getColumnBySlug(params.slug),
      getAllColumns(),
      getAllGuides(),
      getAllCars(),
      getAllHeritage(),
    ]);

  if (!item) {
    notFound();
  }

  const columnWithMeta = item as ColumnWithMeta;
  const guidesWithMeta = allGuidesRaw as GuideWithMeta[];
  const heritageWithMeta = allHeritageRaw as HeritageWithMeta[];

  const relatedColumns = pickRelatedColumns(columnWithMeta, allColumns);
  const relatedGuides = pickRelatedGuidesForColumn(columnWithMeta, guidesWithMeta);
  const relatedCars = pickRelatedCarsForColumn(columnWithMeta, allCars);
  const relatedHeritage = pickRelatedHeritageForColumn(columnWithMeta, heritageWithMeta);

  const primaryDate = item.publishedAt ?? item.updatedAt ?? null;

  return (
    <>
      {/* 読書体験本体（本文レイアウト・Progress barなどは ColumnReaderShell 側） */}
      <ColumnReaderShell item={item} />

      {/* コラムのメタ情報小ブロック（読後に一度見返す想定） */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-[11px] text-slate-600 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-50">
                {mapCategoryLabel(item.category)}
              </span>
              {columnWithMeta.readMinutes != null && (
                <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] tracking-[0.16em] text-slate-600">
                  約{columnWithMeta.readMinutes}分で読めるボリューム感
                </span>
              )}
              {primaryDate && (
                <span className="ml-auto text-[10px] tracking-[0.16em] text-slate-400">
                  UPDATED {formatDate(primaryDate)}
                </span>
              )}
            </div>
            {columnWithMeta.tags && columnWithMeta.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {columnWithMeta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] tracking-[0.12em] text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* このコラムと関連する車種 */}
      {relatedCars.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  RELATED CARS
                </p>
                <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                  このコラムと関連の深い車種
                </h2>
              </div>
              <Link
                href="/cars"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((car) => (
                <Link key={car.slug} href={`/cars/${encodeURIComponent(car.slug)}`}>
                  <GlassCard
                    as="article"
                    padding="md"
                    interactive
                    className="group h-full border border-slate-200/80 bg-white/90 text-xs shadow-soft transition hover:-translate-y-[2px] hover:border-tiffany-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                            {car.maker}
                          </p>
                          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-tiffany-700">
                            {car.name}
                          </h3>
                        </div>
                        <div className="text-right text-[10px] text-slate-500">
                          {car.releaseYear && <p>{car.releaseYear}年頃</p>}
                          {car.segment && <p className="mt-1 line-clamp-1">{car.segment}</p>}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                        {car.bodyType && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.bodyType}
                          </span>
                        )}
                        {car.drive && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5">
                            {car.drive}
                          </span>
                        )}
                      </div>
                      {car.summary && (
                        <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {car.summary}
                        </p>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* 関連ガイド */}
      {relatedGuides.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  GUIDE TOGETHER
                </p>
                <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                  お金や段取りを整理するガイド
                </h2>
              </div>
              <Link
                href="/guide"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                GUIDE一覧へ
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedGuides.map((guide) => (
              <Reveal key={guide.id}>
                <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                  <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                        {mapGuideCategoryLabel(guide.category)}
                      </span>
                      {guide.publishedAt && (
                        <span className="ml-auto text-[10px] text-slate-400">
                          {formatDate(guide.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                      {guide.title}
                    </h3>

                    {guide.summary && (
                      <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                        {guide.summary}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 関連HERITAGE */}
      {relatedHeritage.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                  BRAND HERITAGE
                </p>
                <h2 className="serif-heading mt-1 text-sm font-medium text-slate-900 sm:text-base">
                  関連するブランドのHERITAGE
                </h2>
              </div>
              <Link
                href="/heritage"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                HERITAGE一覧へ
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedHeritage.map((h) => (
              <Reveal key={h.slug}>
                <Link href={`/heritage/${encodeURIComponent(h.slug)}`}>
                  <GlassCard className="border border-slate-200/80 bg-gradient-to-br from-vapor/90 via-white to-white p-5 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                      BRAND STORY
                    </p>
                    <h3 className="mt-2 text-[15px] font-serif font-semibold text-slate-900">
                      {h.heroTitle ?? h.title}
                    </h3>
                    {h.lead && (
                      <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                        {h.lead}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* RELATED COLUMN セクション */}
      {relatedColumns.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
                  NEXT READ
                </p>
                <h2 className="mt-1 text-xs font-semibold tracking-[0.22em] text-slate-700">
                  RELATED COLUMN
                </h2>
              </div>
              <Link
                href="/column"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedColumns.map((col) => (
              <Reveal key={col.id}>
                <Link href={`/column/${encodeURIComponent(col.slug)}`}>
                  <GlassCard
                    as="article"
                    padding="md"
                    interactive
                    className="group relative h-full overflow-hidden border border-white/80 bg-white/92 text-xs shadow-soft"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-2xl" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col gap-2">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {mapCategoryLabel(col.category)}
                        </span>
                        {col.readMinutes && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            約{col.readMinutes}分
                          </span>
                        )}
                        {col.publishedAt && (
                          <span className="ml-auto text-[10px] text-slate-400">
                            {formatDate(col.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {col.title}
                      </h3>

                      {col.summary && (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                          {col.summary}
                        </p>
                      )}

                      {col.tags && col.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
                          {col.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-50 px-2 py-1">
                              #{tag}
                            </span>
                          ))}
                          {col.tags.length > 3 && (
                            <span className="rounded-full bg-slate-50 px-2 py-1">
                              +{col.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* モバイル向けの戻る導線 */}
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:hidden">
        <div className="border-t border-slate-100 pt-4">
          <Reveal>
            <Button
              asChild
              variant="primary"
              size="sm"
              magnetic
              className="w-full justify-center rounded-full text-[11px] tracking-[0.2em]"
            >
              <Link href="/column">コラム一覧へ戻る</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </>
  );
}
