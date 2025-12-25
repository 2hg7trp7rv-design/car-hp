// app/column/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getColumnBySlug, getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { DetailPageScaffold } from "@/components/page/DetailPageScaffold";

import { RelatedSection } from "@/components/related/RelatedSection";
import { RelatedCarsGrid } from "@/components/related/RelatedCarsGrid";
import { RelatedGuidesGrid } from "@/components/related/RelatedGuidesGrid";
import { RelatedColumnsGrid } from "@/components/related/RelatedColumnsGrid";
import { RelatedHeritageGrid } from "@/components/related/RelatedHeritageGrid";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

// アフィリエイトCTA
import { AffiliateCtaBlock } from "@/components/guide/AffiliateCtaBlock";

// ★追加: URL定義ファイルのインポート
import { AFFILIATE_URLS } from "@/lib/affiliate-constants";
import { buildDetailMetadata } from "@/lib/seo/detail-metadata";
import { ColumnReaderShell } from "@/components/content/ColumnReaderShell";
import { buildColumnDetailModel, mapColumnCategoryLabel as mapCategoryLabel } from "@/lib/viewmodel/column-detail";

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
  heroImage?: string;
};

type GuideWithMeta = GuideItem & {
  category?: string | null;
  tags?: string[] | null;
  relatedCarSlugs?: (string | null)[];
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
  const canonicalPath = `/column/${encodeURIComponent(params.slug)}`;

  return buildDetailMetadata({
    title,
    description,
    canonicalPath,
    ogImage: (item as any).heroImage ?? null,
  });
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

  const model = buildColumnDetailModel({
    column: columnWithMeta,
    allColumns,
    allGuides: guidesWithMeta,
    allCars,
    allHeritage: heritageWithMeta,
  });

  const relatedColumns = model.relatedColumns;
  const relatedGuides = model.relatedGuides;
  const relatedCars = model.relatedCars;
  const relatedHeritage = model.relatedHeritage;


  return (
    <DetailPageScaffold jsonLd={model.jsonLd}>
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
              {model.dateLabel && (
                <span className="ml-auto text-[10px] tracking-[0.16em] text-slate-400">
                  UPDATED {model.dateLabel ?? ""}
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

      {/* ★ CTAブロック (記事の直後に配置) */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <Reveal delay={200}>
          {renderCta()}
        </Reveal>
      </section>

      {/* このコラムと関連する車種 */}
      {relatedCars.length > 0 && (
        <RelatedSection
          eyebrow="RELATED CARS"
          title="このコラムと関連する車種"
          hrefAll="/cars"
          hrefLabel="CARS一覧へ →"
          className="mt-14 lg:mt-18"
        >
          <RelatedCarsGrid cars={relatedCars} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" />
        </RelatedSection>
      )}

{/* 関連ガイド */}
      {relatedGuides.length > 0 && (
        <RelatedSection
          eyebrow="RELATED GUIDE"
          title="お金や段取りを整理するガイド"
          hrefAll="/guide"
          hrefLabel="GUIDE一覧へ →"
          className="mt-14 lg:mt-18"
        >
          <RelatedGuidesGrid guides={relatedGuides} />
        </RelatedSection>
      )}

{/* 関連HERITAGE */}
      {relatedHeritage.length > 0 && (
        <RelatedSection
          eyebrow="RELATED HERITAGE"
          title="関連するブランドのHERITAGE"
          hrefAll="/heritage"
          hrefLabel="HERITAGE一覧へ →"
          className="mt-14 lg:mt-18"
        >
          <RelatedHeritageGrid heritage={relatedHeritage} maxChars={180} />
        </RelatedSection>
      )}

{/* RELATED COLUMN セクション */}
      {relatedColumns.length > 0 && (
        <RelatedSection
          eyebrow="NEXT READ"
          title="次に読むべきコラム"
          hrefAll="/column"
          hrefLabel="コラム一覧へ →"
          className="mt-14 lg:mt-18"
        >
          <RelatedColumnsGrid columns={relatedColumns} />
        </RelatedSection>
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
