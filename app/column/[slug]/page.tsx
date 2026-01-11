// app/column/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site";
import {
  buildColumnDescription,
  buildColumnTitleBase,
  withBrand,
} from "@/lib/seo/serp";

import { getColumnBySlug, getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import type { CanonicalGuideCategoryKey } from "@/lib/guides/canonical";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { FixedGuideShelf } from "@/components/guide/FixedGuideShelf";
import { Button } from "@/components/ui/button";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ShelfImpression } from "@/components/analytics/ShelfImpression";
import { JsonLd } from "@/components/seo/JsonLd";
import { isIndexableColumn } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

// アフィリエイトCTA
import { AffiliateCtaBlock } from "@/components/guide/AffiliateCtaBlock";
import { GuideMonetizeBlock } from "@/components/guide/GuideMonetizeBlock";

// ★追加: URL定義ファイルのインポート
import { AFFILIATE_URLS } from "@/lib/affiliate-constants";
import { inferGoodsMonetizeKeyForColumn } from "@/lib/monetize/inferGoodsMonetizeKey";

import ColumnReaderShell from "./reader-shell";


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
      title: "コラムが見つかりません",
      description: "指定されたコラムが見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  // NOTE: layout.tsx の title.template で末尾にブランドが付く。
  // ページ側では “ブランド抜きの title” を返す（重複防止）。
  const titleBase = buildColumnTitleBase(item);
  const titleFull = withBrand(titleBase);
  const description = buildColumnDescription(item);
  const url = `${getSiteUrl()}/column/${encodeURIComponent(
    params.slug,
  )}`;

  const rawImage = ((item as any).heroImage ?? (item as any).ogImageUrl ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: titleBase,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titleFull,
      description,
      type: "article",
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
    robots: isIndexableColumn(item) ? undefined : NOINDEX_ROBOTS,
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
    case "MARKET":
      return "市場・価格動向";
    default:
      return "コラム";
  }
}

function mapGuideCategoryLabel(key: CanonicalGuideCategoryKey): string {
  switch (key) {
    case "MONEY":
      return "お金・維持費";
    case "BUY":
      return "購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "INSURANCE":
      return "保険・補償";
    case "LEASE":
      return "リース・残価";
    case "GOODS":
      return "カー用品・パーツ";
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "DRIVING":
      return "運転・ドライブ";
    case "LIFE":
      return "維持・生活";
    default:
      return "その他";
  }
}

function inferGuideCategoryKey(guide: GuideItem & { tags?: unknown; summary?: unknown }) {
  const title = (guide.title ?? "").toString();
  const summary = (guide.summary ?? "").toString();
  const tags = Array.isArray((guide as any).tags) ? ((guide as any).tags as unknown[]) : [];
  const tagText = tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(" ");

  const text = `${title} ${summary} ${tagText}`;

  if (/保険|補償|等級|車両保険/.test(text)) return "INSURANCE" as const;
  if (/リース|残価|サブスク/.test(text)) return "LEASE" as const;
  if (/売却|査定|買取|下取り|手放|一括査定|名義変更|ローン残債/.test(text)) return "SELL" as const;
  if (/ローン|金利|維持費|税金|車検|コスト|支払い|月々/.test(text)) return "MONEY" as const;
  if (/ドラレコ|チャイルドシート|タイヤ|バッテリー|洗車|用品|コーティング|パーツ/.test(text))
    return "GOODS" as const;
  if (/オイル|点検|整備|メンテ/.test(text)) return "MAINTENANCE" as const;
  if (/故障|トラブル|警告灯|事故|修理/.test(text)) return "TROUBLE" as const;
  if (/運転|ドライブ|高速|雪道|駐車/.test(text)) return "DRIVING" as const;
  if (/維持|所有|家族|生活|駐車場/.test(text)) return "LIFE" as const;
  if (/購入|買う|見積|値引|納期/.test(text)) return "BUY" as const;

  return "OTHER" as const;
}

function getGuideCategoryKey(guide: GuideItem): CanonicalGuideCategoryKey {
  const raw = (guide.category ?? "").toString().trim();
  if (!raw) return inferGuideCategoryKey(guide as any);

  switch (raw) {
    case "MONEY":
    case "MAINTENANCE_COST":
    case "維持費・コスト":
      return "MONEY";
    case "BUY":
    case "BUYING":
    case "購入ガイド":
      return "BUY";
    case "SELL":
    case "売却・査定":
      return "SELL";
    case "保険・補償":
      return "INSURANCE";
    case "カー用品・パーツ":
      return "GOODS";
    case "MAINTENANCE":
    case "メンテナンス":
      return "MAINTENANCE";
    case "TROUBLE":
      return "TROUBLE";
    case "DRIVING":
      return "DRIVING";
    case "LIFE":
    case "維持・所有":
      return "LIFE";
    default:
      return inferGuideCategoryKey(guide as any);
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
  const pageUrl = `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`;

  const schemaDescription =
    (item as any).seoDescription ??
    item.summary ??
    "トラブル・修理の実例や、ブランドの歴史・技術解説などを整理したコラムです。";

  const rawSchemaImage = (columnWithMeta.heroImage ?? (item as any).heroImage ?? (item as any).ogImageUrl ?? null) as
    | string
    | null;

  const schemaImage = rawSchemaImage
    ? rawSchemaImage.startsWith("http")
      ? rawSchemaImage
      : `${getSiteUrl()}${rawSchemaImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  const published = item.publishedAt ?? null;
  const modified = item.updatedAt ?? published ?? null;

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
        name: "COLUMN",
        item: `${getSiteUrl()}/column`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.title,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: schemaDescription,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished: published ?? undefined,
    dateModified: modified ?? undefined,
    image: schemaImage ? [schemaImage] : undefined,
    author: { "@type": "Organization", name: "CAR BOUTIQUE" },
    publisher: { "@type": "Organization", name: "CAR BOUTIQUE" },
  };


  // ★ 修正: アフィリエイトリンクを定数から読み込むように変更
  const renderCta = () => {
    // カテゴリやタグに応じて出し分け
    if (columnWithMeta.category === "MARKET" || columnWithMeta.tags?.includes("相場") || columnWithMeta.tags?.includes("購入")) {
      return (
        <AffiliateCtaBlock
          title="この車の市場価格をチェック"
          description="市場に出回る前の非公開車両や、プロが厳選した良質な在庫情報を確認できます。"
          buttonLabel="在庫・価格を見る"
          href={AFFILIATE_URLS.SEARCH_INVENTORY}
          monetizeKey="car_search_conditions"
          type="buy"
        />
      );
    }
    if (columnWithMeta.category === "MAINTENANCE" || columnWithMeta.tags?.includes("故障") || columnWithMeta.tags?.includes("車検")) {
      return (
        <AffiliateCtaBlock
          title="維持費の不安を解消する"
          description="輸入車専門の保証サービスなら、突発的な修理費用の不安から解放されます。"
          buttonLabel="保証サービスを確認"
          href={AFFILIATE_URLS.WARRANTY}
          monetizeKey="warranty_service"
          type="insurance"
        />
      );
    }
    if (columnWithMeta.category === "OWNER_STORY" || columnWithMeta.tags?.includes("売却")) {
        return (
          <AffiliateCtaBlock
            title="愛車の価値を知る"
            description="輸入車専門の買取サービスで、あなたの愛車の本当の価値を査定してもらいましょう。"
            buttonLabel="無料査定を申し込む"
            href={AFFILIATE_URLS.SELL_ASSESSMENT}
            monetizeKey="sell_price_check"
            type="sell"
          />
        );
      }
    return null;
  };

  // ★ タグ連動: 用品系のPRを1枠だけ自動差し込み
  const goodsMonetizeKey = inferGoodsMonetizeKeyForColumn({
    title: columnWithMeta.title,
    category: columnWithMeta.category,
    tags: columnWithMeta.tags ?? [],
  });

  return (
    <>
      <JsonLd id="jsonld-column-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-column-detail-article" data={articleJsonLd} />
      <ScrollDepthTracker />

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

      {/* ★ CTAブロック (記事の直後に配置) */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <Reveal delay={200}>
          {renderCta()}
        </Reveal>
      </section>

      {/* ★ PRブロック（タグ連動で1枠だけ自動差し込み） */}
      {goodsMonetizeKey && (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <GuideMonetizeBlock
            monetizeKey={goodsMonetizeKey}
            pageType="column"
            contentId={item.slug}
            position="column_goods_pick"
            variant="auto_tag_v1"
          />
        </section>
      )}


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
              <TrackedLink
                href="/cars"
                toType="cars"
                toId="index"
                shelfId="column_related_cars_header"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </TrackedLink>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ShelfImpression shelfId="column_related_cars" variant="related_cars">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {relatedCars.map((car) => (
                  <TrackedLink
                    key={car.slug}
                    href={`/cars/${encodeURIComponent(car.slug)}`}
                    toType="cars"
                    toId={car.slug}
                    shelfId="column_related_cars"
                  >
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
                  </TrackedLink>
                ))}
              </div>
            </ShelfImpression>
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
              <TrackedLink
                href="/guide"
                toType="guide"
                toId="index"
                shelfId="column_related_guides_header"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                GUIDE一覧へ
              </TrackedLink>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ShelfImpression shelfId="column_related_guides" variant="related_guides">
              <div className="grid gap-4 md:grid-cols-2">
                {relatedGuides.map((guide) => (
                  <Reveal key={guide.id}>
                    <TrackedLink
                      href={`/guide/${encodeURIComponent(guide.slug)}`}
                      toType="guide"
                      toId={guide.slug}
                      shelfId="column_related_guides"
                    >
                      <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {mapGuideCategoryLabel(getGuideCategoryKey(guide))}
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
                    </TrackedLink>
                  </Reveal>
                ))}
              </div>
            </ShelfImpression>
          </Reveal>
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
              <TrackedLink
                href="/heritage"
                toType="heritage"
                toId="index"
                shelfId="column_related_heritage_header"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                HERITAGE一覧へ
              </TrackedLink>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ShelfImpression shelfId="column_related_heritage" variant="related_heritage">
              <div className="grid gap-4 md:grid-cols-2">
                {relatedHeritage.map((h) => (
                  <Reveal key={h.slug}>
                    <TrackedLink
                      href={`/heritage/${encodeURIComponent(h.slug)}`}
                      toType="heritage"
                      toId={h.slug}
                      shelfId="column_related_heritage"
                    >
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
                    </TrackedLink>
                  </Reveal>
                ))}
              </div>
            </ShelfImpression>
          </Reveal>
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
              <TrackedLink
                href="/column"
                toType="column"
                toId="index"
                shelfId="column_related_columns_header"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </TrackedLink>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ShelfImpression shelfId="column_related_columns" variant="related_columns">
              <div className="grid gap-4 md:grid-cols-2">
                {relatedColumns.map((col) => (
                  <Reveal key={col.id}>
                    <TrackedLink
                      href={`/column/${encodeURIComponent(col.slug)}`}
                      toType="column"
                      toId={col.slug}
                      shelfId="column_related_columns"
                    >
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
                    </TrackedLink>
                  </Reveal>
                ))}
              </div>
            </ShelfImpression>
          </Reveal>
        </section>
      )}

      {/* 固定導線：GUIDE HUB（保険 / 売却 / 維持費） */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
        <FixedGuideShelf />
      </section>

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
