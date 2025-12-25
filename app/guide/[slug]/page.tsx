import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRelatedSlugs } from "@/lib/linking/related";
import { getAllCars } from "@/lib/cars";
import { getAllColumns } from "@/lib/columns";
import { getAllGuides, getGuideBySlug, type GuideItem } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import { buildDetailMetadata } from "@/lib/seo/detail-metadata";
import { buildGuideDetailModel } from "@/lib/viewmodel/guide-detail";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { DetailPageScaffold } from "@/components/page/DetailPageScaffold";

import { RelatedSection } from "@/components/related/RelatedSection";
import { RelatedCarsGrid } from "@/components/related/RelatedCarsGrid";
import { RelatedColumnsGrid } from "@/components/related/RelatedColumnsGrid";
import { RelatedHeritageGrid } from "@/components/related/RelatedHeritageGrid";
import { CtaBlock } from "@/components/monetize/CtaBlock";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function mapCategoryLabel(category: string | null | undefined): string {
  switch (category) {
    case "MONEY":
    case "BUY":
      return "お金・購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "MAINTENANCE_COST":
      return "維持費・お金まわり";
    default:
      return "ガイド";
  }
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません | CAR BOUTIQUE",
      description: "指定されたガイドが見つかりませんでした。",
    };
  }

  const description =
    guide.summary || "維持費・売却・購入計画などを、手順ベースで整理したガイドです。";

  const title = `${guide.title} | CAR BOUTIQUE`;
  const canonicalPath = `/guide/${encodeURIComponent(params.slug)}`;

  return buildDetailMetadata({
    title,
    description,
    canonicalPath,
    ogImage: (guide as any).heroImage ?? null,
  });
}

export default async function GuideDetailPage({ params }: PageProps) {
  const [guideRaw, allGuides, allCars, allColumns, allHeritage] = await Promise.all([
    getGuideBySlug(params.slug),
    getAllGuides(),
    getAllCars(),
    getAllColumns(),
    getAllHeritage(),
  ]);

  if (!guideRaw) {
    notFound();
  }

  const guide = guideRaw as GuideItem & {
    readMinutes?: number | null;
    tags?: string[] | null;
    category?: string | null;
    relatedCarSlugs?: (string | null)[];
    monetizeKey?: string | null;
    // affiliateLinks は CtaBlock への移行により不要になりますが型定義として残します
    affiliateLinks?: Record<string, string> | null;
    internalLinks?: string[] | null;
  };

  const model = buildGuideDetailModel({ guide, allCars, allColumns, allHeritage });
  const { blocks, headings, stepHeadings, relatedColumns, relatedCars, relatedHeritage, jsonLd } = model;

  const relatedCarSlugs = getRelatedSlugs(guide as any, "cars");

  const internalLinkSlugs = (guide.internalLinks ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  const internalRelatedGuides = internalLinkSlugs
    .map((slug) => allGuides.find((g) => g.slug === slug))
    .filter((g): g is GuideItem => Boolean(g));

  // CtaBlockへの移行により resolveAffiliateLinksForGuide は削除
  // const affiliateLinksResolved = ...

  const monetizeKey = (guide.monetizeKey ?? "car_search_conditions") as any;

  let firstParagraphRendered = false;
  const primaryDate = guide.publishedAt ?? guide.updatedAt;

  // 【追加】構造化データ (仕様書7.4)

  return (
    <DetailPageScaffold jsonLd={jsonLd}>
      <main className="min-h-screen bg-site text-text-main">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-0 top-0 h-[40vh] w-full bg-gradient-to-b from-white/90 via-white/70 to-transparent" />
        <div className="absolute -left-[18%] top-[10%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.15),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[20%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.22),_transparent_75%)] blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <nav aria-label="パンくずリスト" className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-slate-800">
            GUIDE
          </Link>
          <span className="mx-2">/</span>
          <span className="truncate text-slate-400 align-middle">{guide.title}</span>
        </nav>

        <header className="mb-12 lg:mb-14">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                GUIDE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>{mapCategoryLabel(guide.category ?? null)}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="serif-heading mt-4 text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-3xl lg:text-[2.3rem]">
              {guide.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {guide.readMinutes != null && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] tracking-[0.18em] text-slate-100 shadow-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  約 {guide.readMinutes} 分で読めます
                </span>
              )}
              {primaryDate && (
                <>
                  <span className="h-[1px] w-6 bg-slate-200" />
                  <span className="tracking-[0.16em]">PUBLISHED {formatDate(primaryDate)}</span>
                </>
              )}
              {guide.tags && guide.tags.length > 0 && (
                <>
                  <span className="h-[1px] w-6 bg-slate-200" />
                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] tracking-[0.12em]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>

          {guide.summary && (
            <Reveal delay={220}>
              <p className="mt-5 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                {guide.summary}
              </p>
            </Reveal>
          )}
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <section className="w-full lg:w-[68%]">
            <GlassCard className="relative overflow-hidden border border-slate-200/80 bg-white/92 px-5 py-6 shadow-soft sm:px-7 sm:py-8">
              <div className="pointer-events-none absolute -right-28 -top-28 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.2),_transparent_70%)] blur-3xl" />
              <div className="pointer-events-none absolute -left-24 bottom-[-30%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.25),_transparent_70%)] blur-3xl" />

              <article className="relative z-10">
                <div className="mb-5 rounded-2xl bg-slate-50/80 px-4 py-3 text-[11px] text-slate-700">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">
                    GUIDE OUTLINE
                  </p>
                  <p className="mt-1 leading-relaxed">
                    このガイドは「{mapCategoryLabel(guide.category ?? null)}」に関する基本的な考え方や順番を整理するためのメモです。細かい数字の比較というよりも まずここから押さえておくと楽という目線で構成しています。
                  </p>
                </div>

                {stepHeadings.length > 0 && (
                  <section className="mb-6 rounded-2xl border border-tiffany-100 bg-gradient-to-br from-tiffany-50/90 via-white to-white px-4 py-4 text-[11px] shadow-soft-card sm:px-5 sm:py-5">
                    <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-tiffany-700">
                      GUIDE STEPS
                    </p>
                    <div className="relative pl-4">
                      <div className="absolute left-[10px] top-1 bottom-1 w-px bg-gradient-to-b from-tiffany-300/60 via-slate-200/80 to-transparent" />
                      <ol className="space-y-3">
                        {stepHeadings.map((s, idx) => (
                          <li key={s.id} className="relative flex gap-3">
                            <div className="relative mt-[2px] flex h-5 w-5 items-center justify-center">
                              <div className="absolute h-5 w-5 rounded-full bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.35)]" />
                              <div className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-tiffany-400 to-tiffany-600" />
                            </div>
                            <a href={`#${s.id}`} className="group inline-flex flex-1 flex-col gap-0.5">
                              <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                                STEP {s.stepNumber.toString().padStart(2, "0")}
                              </span>
                              <span className="text-[11px] font-medium text-slate-800 group-hover:text-tiffany-700">
                                {s.label}
                              </span>
                              {idx === 0 && (
                                <span className="mt-0.5 text-[10px] text-slate-400">
                                  上から順にざっくりこの順番で考える前提のステップです。
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>
                )}

                <div className="mt-6">
                  {/* 【変更】冒頭CTA (仕様書4.4.1) - GuideMonetizeBlockをCtaBlockへ置換 */}
                  <CtaBlock
                    monetizeKey={monetizeKey}
                    pageType="guide"
                    contentId={guide.slug}
                    position="top"
                    // 必要に応じてclassNameでスタイル調整してください
                  />

                <ContentBlocks variant="guide" blocks={blocks} />
                </div>

                {/* 【変更】中盤CTA (仕様書4.4.1) */}
                <CtaBlock
                  monetizeKey="loan_estimate" // 例：記事途中は見積もり系
                  pageType="guide"
                  contentId={guide.slug}
                  position="middle"
                />
              </article>
            </GlassCard>
            
            {/* 【変更】末尾CTA (仕様書4.4.1 - 外部への出口) */}
            <div className="mt-8">
              <CtaBlock
                monetizeKey={monetizeKey}
                pageType="guide"
                contentId={guide.slug}
                position="bottom"
              />
            </div>

            {internalRelatedGuides.length > 0 && (
              <section className="mt-10 lg:mt-12">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h2 className="text-[10px] font-semibold tracking-[0.22em] text-slate-600">
                    このガイドと一緒に読まれているGUIDE
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {internalRelatedGuides.map((g) => (
                    <Link key={g.slug} href={`/guide/${encodeURIComponent(g.slug)}`}>
                      <GlassCard className="group h-full border border-slate-200/80 bg-white/92 p-4 text-[11px] shadow-soft-sm transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:bg-white">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {mapCategoryLabel((g as any).category ?? null)}
                          </span>
                          {(g as any).readMinutes && (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                              約{(g as any).readMinutes}分
                            </span>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                          {g.title}
                        </h3>
                        {g.summary && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                            {g.summary}
                          </p>
                        )}
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 border-t border-slate-100 pt-6 lg:hidden">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                  ←
                </span>
                GUIDE一覧へ戻る
              </Link>
            </div>
          </section>

          <aside className="hidden w-[32%] lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 text-[11px] text-slate-600 shadow-soft backdrop-blur">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  CONTENTS
                </p>

                {headings.length === 0 ? (
                  <p className="text-[11px] text-slate-400">このガイドには見出しが設定されていません。</p>
                ) : (
                  <ul className="space-y-2">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className={`block leading-relaxed transition-colors hover:text-tiffany-600 ${
                            h.level === 3 ? "pl-3 text-slate-500" : ""
                          }`}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400">
                  一度読み切ったあとに気になる見出しだけをもう一度辿り直せるようにする前提の簡易的な目次です。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-[11px] text-slate-600 shadow-sm">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                  BACK TO GUIDE
                </p>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">
                    ←
                  </span>
                  GUIDE一覧に戻る
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {relatedCars.length > 0 && (
          <RelatedSection
            eyebrow="RELATED CARS"
            title="このガイドと関連する車種"
            hrefAll="/cars"
            hrefLabel="CARS一覧へ →"
            className="mt-16 lg:mt-20"
          >
            <RelatedCarsGrid
              cars={relatedCars}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            />
          </RelatedSection>
        )}

        {relatedCars.length === 0 && relatedCarSlugs.length > 0 && (
          <section className="mt-16 lg:mt-20">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連する車種(仮)
              </h2>
              <Link
                href="/cars"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedCarSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/cars/${encodeURIComponent(slug)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] text-slate-600 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:text-tiffany-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                  <span className="uppercase tracking-[0.12em]">{slug}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedColumns.length > 0 && (
          <RelatedSection
            eyebrow="RELATED COLUMN"
            title="このガイドと関連するコラム"
            hrefAll="/column"
            hrefLabel="コラム一覧へ →"
            className="mt-20 lg:mt-24"
          >
            <RelatedColumnsGrid columns={relatedColumns} />
          </RelatedSection>
        )}

        {relatedHeritage.length > 0 && (
          <RelatedSection
            eyebrow="RELATED HERITAGE"
            title="このガイドと関連するHERITAGE"
            hrefAll="/heritage"
            hrefLabel="HERITAGE一覧へ →"
            className="mt-20 lg:mt-24"
          >
            <RelatedHeritageGrid heritage={relatedHeritage} maxChars={180} />
          </RelatedSection>
        )}


      </div>
      </main>
    </DetailPageScaffold>
  );
}
