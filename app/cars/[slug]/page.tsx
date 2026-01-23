import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { buildCarDescription, buildCarTitleBase, withBrand } from "@/lib/seo/serp";
import { isIndexableCar } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

import {
  getAllCars,
  getCarBySlug,
  getOwnershipGuidesForCarSlug,
  getRelatedColumnsForCarSlug,
  type CarItem,
} from "@/lib/cars";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません",
      description: "指定された車種が見つかりませんでした。",
      robots: { index: false, follow: true },
    };
  }

  const titleBase = buildCarTitleBase(car);
  const titleFull = withBrand(titleBase);
  const description = buildCarDescription(car);
  const url = `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`;

  const rawImage = (car.heroImage ?? car.ogImageUrl ?? car.mainImage ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: titleBase,
    description,
    alternates: { canonical: url },
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
    robots: isIndexableCar(car) ? undefined : NOINDEX_ROBOTS,
  };
}

function formatYearLabel(year?: number): string | null {
  if (!year) return null;
  if (!Number.isFinite(year)) return null;
  return String(year);
}

type HeadingBlock = { type: "h"; level: 2 | 3; text: string; id: string };
type ParagraphBlock = { type: "p"; text: string };
type ListBlock = { type: "ul"; items: string[] };
type DividerBlock = { type: "hr" };
type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | DividerBlock;

function slugifyId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s　]+/g, "-")
    .replace(/[^a-z0-9\-\u3040-\u30ff\u3400-\u9fff]/g, "")
    .slice(0, 80);
}

function safeList(input?: (string | null | undefined)[] | null): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

function uniqKeepOrder(list: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of list) {
    const key = v.trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function buildBlocksForCar(car: CarItem): { blocks: ContentBlock[]; checkPoints: string[]; takeaways: string[] } {
  const blocks: ContentBlock[] = [];

  const pushH2 = (text: string) => {
    const id = slugifyId(text) || "section";
    blocks.push({ type: "h", level: 2, text, id });
  };
  const pushH3 = (text: string) => {
    const id = slugifyId(text) || "subsection";
    blocks.push({ type: "h", level: 3, text, id });
  };
  const pushP = (text?: string | null) => {
    const t = (text ?? "").trim();
    if (!t) return;
    blocks.push({ type: "p", text: t });
  };
  const pushUl = (items: string[]) => {
    const it = items.map((s) => s.trim()).filter(Boolean);
    if (it.length === 0) return;
    blocks.push({ type: "ul", items: it });
  };
  const pushHr = () => blocks.push({ type: "hr" });

  const strengths = safeList(car.strengths);
  const weaknesses = safeList(car.weaknesses);
  const troubles = safeList(car.troubleTrends);
  const maintenance = safeList(car.maintenanceNotes);

  const takeaways = uniqKeepOrder(strengths).slice(0, 4);
  const checkPoints = uniqKeepOrder([...weaknesses, ...troubles, ...maintenance]).slice(0, 6);

  // 01 概要
  pushH2("概要");
  pushP(car.summaryLong ?? null);
  if (!car.summaryLong) pushP(car.summary ?? null);

  // 02 価格・基本情報
  pushH2("価格・基本情報");
  const baseFacts: string[] = [];
  if (car.releaseYear) baseFacts.push(`発売年: ${car.releaseYear}`);
  if (car.bodyType) baseFacts.push(`ボディ: ${car.bodyType}`);
  if (car.segment) baseFacts.push(`セグメント: ${car.segment}`);
  if (car.engine) baseFacts.push(`エンジン: ${car.engine}`);
  if (car.drive) baseFacts.push(`駆動: ${car.drive}`);
  if (car.transmission) baseFacts.push(`トランスミッション: ${car.transmission}`);
  if (car.fuel) baseFacts.push(`燃料: ${car.fuel}`);
  if (car.priceNew) baseFacts.push(`新車価格: ${car.priceNew}`);
  if (car.priceUsed) baseFacts.push(`中古価格: ${car.priceUsed}`);
  pushUl(baseFacts);
  if (baseFacts.length === 0) {
    pushP("この車種ページは、車両の特徴を“強み/弱み/トラブル傾向”で整理しています。");
  }

  pushHr();

  // 03 強み
  if (strengths.length > 0) {
    pushH2("強み");
    pushUl(strengths);
  }

  // 04 弱み・注意点
  if (weaknesses.length > 0) {
    pushH2("弱み・注意点");
    pushUl(weaknesses);
  }

  // 05 トラブル傾向
  if (troubles.length > 0) {
    pushH2("トラブル傾向");
    pushUl(troubles);
  }

  // 06 維持費・整備
  if (car.costImpression || maintenance.length > 0) {
    pushH2("維持費・整備のメモ");
    if (car.costImpression) pushP(car.costImpression);
    if (maintenance.length > 0) {
      pushH3("メンテナンスの要点");
      pushUl(maintenance);
    }
  }

  // 07 スペック
  const specs: string[] = [];
  if (car.powerPs) specs.push(`最高出力: ${car.powerPs}ps`);
  if (car.torqueNm) specs.push(`最大トルク: ${car.torqueNm}Nm`);
  if (car.fuelEconomy) specs.push(`燃費: ${car.fuelEconomy}`);
  if (car.zeroTo100) specs.push(`0-100km/h: ${car.zeroTo100}s`);
  if (car.lengthMm) specs.push(`全長: ${car.lengthMm}mm`);
  if (car.widthMm) specs.push(`全幅: ${car.widthMm}mm`);
  if (car.heightMm) specs.push(`全高: ${car.heightMm}mm`);
  if (car.wheelbaseMm) specs.push(`ホイールベース: ${car.wheelbaseMm}mm`);
  if (car.weightKg) specs.push(`車重: ${car.weightKg}kg`);

  if (specs.length > 0) {
    pushH2("主要スペック");
    pushUl(specs);
  }

  return { blocks, checkPoints, takeaways };
}

function mapCarBadge(car: CarItem): string {
  if (car.segment) return String(car.segment);
  if (car.bodyType) return String(car.bodyType);
  if (car.maker) return String(car.maker);
  return "CAR";
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const title = car.titleJa ?? car.title;
  const badge = mapCarBadge(car);
  const yearLabel = formatYearLabel(car.releaseYear);

  const { blocks, checkPoints, takeaways } = buildBlocksForCar(car);

  const relatedGuides = getOwnershipGuidesForCarSlug(car.slug, { limit: 4 });
  const relatedColumns = getRelatedColumnsForCarSlug(car.slug, 4);

  const relatedGuidesMain = relatedGuides.slice(0, 2);
  const relatedGuidesMini = relatedGuides.slice(2, 4);

  const relatedColumnsMain = relatedColumns.slice(0, 2);
  const relatedColumnsMini = relatedColumns.slice(2, 4);

  let step = 0;
  let renderedSteps = 0;

  return (
    <main className="bg-site text-text-main">
      <div className="page-shell pb-24 pt-24">
        <JsonLd
          id={`ld-breadcrumb-car-${car.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "HOME",
                item: `${getSiteUrl()}/`,
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
                name: title,
                item: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
              },
            ],
          }}
        />

        <JsonLd
          id={`ld-car-${car.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            mainEntityOfPage: `${getSiteUrl()}/cars/${encodeURIComponent(car.slug)}`,
          }}
        />

        <Breadcrumb
          items={[
            { label: "HOME", href: "/" },
            { label: "CARS", href: "/cars" },
            { label: title },
          ]}
        />

        <header className="mt-6">
          <h1 className="serif-heading text-[28px] leading-[1.25] tracking-tight text-[#222222] sm:text-[34px]">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#222222] px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-white">
              {badge}
            </span>
            {yearLabel ? (
              <span className="text-[10px] tracking-[0.22em] text-[#222222]/45">{yearLabel}</span>
            ) : null}
          </div>
        </header>

        {car.heroImage || car.mainImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#222222]/10 bg-white shadow-soft">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={(car.heroImage ?? car.mainImage) as string}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : null}

        {takeaways.length > 0 ? (
          <section className="mt-8 rounded-2xl border border-[#EDE4D8] bg-[#FAF7F1] p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                +
              </span>
              <h2 className="text-[12px] font-semibold tracking-[0.22em] text-[#222222]">おすすめポイント</h2>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {takeaways.map((t, idx) => (
                <li key={idx} className="flex gap-3 text-[13px] leading-relaxed text-[#222222]/80">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0ABAB5] shadow-soft">
                    +
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <article className="mt-10">
          <div className="space-y-8">
            {blocks.map((b, idx) => {
              if (b.type === "h" && b.level === 2) {
                step += 1;
                renderedSteps += 1;
                return (
                  <div key={`${b.id}-${idx}`} className="pt-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[13px] font-semibold tracking-[0.18em] text-[#0ABAB5]">
                        {String(step).padStart(2, "0")}.
                      </span>
                      <h2 id={b.id} className="text-[18px] font-semibold tracking-tight text-[#222222]">
                        {b.text}
                      </h2>
                    </div>
                    <div className="mt-3 h-px w-full bg-[#222222]/10" />

                    {renderedSteps === 2 && checkPoints.length > 0 ? (
                      <div className="mt-6 rounded-2xl border border-[#0ABAB5]/25 bg-[#0ABAB5]/10 p-6 shadow-soft">
                        <p className="text-[11px] font-semibold tracking-[0.22em] text-[#0ABAB5]">
                          — 購入前に CHECK POINT
                        </p>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[#222222]/80">
                          {checkPoints.map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (b.type === "h" && b.level === 3) {
                return (
                  <h3
                    key={`${b.id}-${idx}`}
                    id={b.id}
                    className="text-[15px] font-semibold tracking-tight text-[#222222]"
                  >
                    {b.text}
                  </h3>
                );
              }

              if (b.type === "p") {
                return (
                  <p key={idx} className="text-[14px] leading-relaxed text-[#222222]/80">
                    {b.text}
                  </p>
                );
              }

              if (b.type === "ul") {
                return (
                  <ul
                    key={idx}
                    className="list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-[#222222]/80"
                  >
                    {b.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                );
              }

              if (b.type === "hr") {
                return <div key={idx} className="h-px w-full bg-[#222222]/10" />;
              }

              return null;
            })}
          </div>
        </article>

        {relatedGuides.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-baseline justify-between">
              <h2 className="serif-heading text-[20px] tracking-tight text-[#222222]">関連ガイド</h2>
              <Link
                href="/guide"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedGuidesMain.map((g) => (
                <ContentGridCard
                  key={g.slug}
                  href={`/guide/${encodeURIComponent(g.slug)}`}
                  title={g.title}
                  date={g.publishedAt ? String(g.publishedAt).slice(0, 10).replaceAll("-", ".") : undefined}
                  imageSrc={g.heroImage ?? null}
                />
              ))}
            </div>

            {relatedGuidesMini.length > 0 ? (
              <div className="mt-6 space-y-3">
                {relatedGuidesMini.map((g) => (
                  <ContentRowCard
                    key={g.slug}
                    href={`/guide/${encodeURIComponent(g.slug)}`}
                    title={g.title}
                    excerpt={g.summary ?? null}
                    imageSrc={g.heroImage ?? null}
                    badge={(g.tags ?? [])[0] ?? (g.category ? String(g.category) : "GUIDE")}
                    badgeTone="light"
                    date={g.publishedAt ? String(g.publishedAt).slice(0, 10).replaceAll("-", ".") : null}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {relatedColumns.length > 0 ? (
          <section className="mt-14">
            <div className="flex items-baseline justify-between">
              <h2 className="serif-heading text-[20px] tracking-tight text-[#222222]">関連コラム</h2>
              <Link
                href="/column"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedColumnsMain.map((c) => (
                <ContentGridCard
                  key={c.slug}
                  href={`/column/${encodeURIComponent(c.slug)}`}
                  title={c.titleJa ?? c.title}
                  date={(c.publishedAt ?? c.updatedAt) ? String((c.publishedAt ?? c.updatedAt)).slice(0, 10).replaceAll("-", ".") : undefined}
                  imageSrc={c.heroImage ?? null}
                />
              ))}
            </div>

            {relatedColumnsMini.length > 0 ? (
              <div className="mt-6 space-y-3">
                {relatedColumnsMini.map((c) => (
                  <ContentRowCard
                    key={c.slug}
                    href={`/column/${encodeURIComponent(c.slug)}`}
                    title={c.titleJa ?? c.title}
                    excerpt={c.summary ?? null}
                    imageSrc={c.heroImage ?? null}
                    badge={c.category ? String(c.category) : "COLUMN"}
                    badgeTone="light"
                    date={(c.publishedAt ?? c.updatedAt) ? String((c.publishedAt ?? c.updatedAt)).slice(0, 10).replaceAll("-", ".") : null}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-14 flex flex-wrap gap-2">
          <Link
            href="/cars"
            className="inline-flex items-center rounded-full bg-[#0ABAB5] px-7 py-4 text-[11px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
          >
            CAR DATABASEへ戻る
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white px-7 py-4 text-[11px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
          >
            車種比較（COMPARE）
          </Link>
        </div>
      </div>
    </main>
  );
}
