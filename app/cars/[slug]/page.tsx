import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { ScrollSpecTable } from "@/components/content/ScrollSpecTable";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildCarDescription, buildCarTitleBase, withBrand } from "@/lib/seo/serp";
import { isIndexableCar } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { ENABLE_CAR_IMAGES } from "@/lib/features";

import {
  getAllCars,
  getCarBySlug,
  getOwnershipGuidesForCarSlug,
  getRelatedColumnsForCarSlug,
  getRelatedHeritageForCarSlug,
  type CarItem,
} from "@/lib/cars";
import { cn } from "@/lib/utils";

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
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };
type DividerBlock = { type: "hr" };
type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | TableBlock | DividerBlock;

type CarSection = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

function chapterNo(index: number): string {
  return String(index + 1).padStart(2, "0");
}

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

function formatBodyText(text: string) {
  // “。”で強制改行（引用符などの直後に句点が来るケースも崩れないように調整）
  const normalized = text.replace(/\r\n?/g, "\n");
  let out = normalized.replace(/。(?!\n)/g, "。\n");
  out = out.replace(/。\n([」』）\]】〉》”’])/g, "。$1\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function buildSectionsFromBlocks(blocks: ContentBlock[]): CarSection[] {
  const sections: CarSection[] = [];
  let current: CarSection | null = null;

  for (const b of blocks) {
    if (b.type === "h" && b.level === 2) {
      if (current) sections.push(current);
      current = { id: b.id, title: b.text, blocks: [] };
      continue;
    }
    if (!current) {
      current = { id: "content", title: "本文", blocks: [] };
    }
    current.blocks.push(b);
  }

  if (current) sections.push(current);

  // 空のセクションを弾く（hrだけ等）
  return sections.filter((s) => s.blocks.some((b) => b.type !== "hr"));
}



type CarBodySectionKey =
  | "conclusion"
  | "check"
  | "trouble"
  | "maintenance"
  | "used"
  | "compare"
  | "links";

function mapCarBodySectionHeadingToKey(headingRaw: string): CarBodySectionKey | null {
  const h = String(headingRaw ?? "")
    .replace(/^\d+\.?\s*/, "")
    .trim();

  if (!h) return null;

  if (/結論|向く人|向かない人/.test(h)) return "conclusion";
  if (/最重要チェック|チェック|買う前/.test(h)) return "check";
  if (/弱点|故障|トラブル/.test(h)) return "trouble";
  if (/維持費|維持|コスト/.test(h)) return "maintenance";
  if (/中古|狙う|相場/.test(h)) return "used";
  if (/比較|ライバル/.test(h)) return "compare";
  if (/関連リンク|関連/.test(h)) return "links";

  return null;
}

function parseCarBodyMarkdownBySection(markdown: string): Record<CarBodySectionKey, ContentBlock[]> {
  const out: Record<CarBodySectionKey, ContentBlock[]> = {
    conclusion: [],
    check: [],
    trouble: [],
    maintenance: [],
    used: [],
    compare: [],
    links: [],
  };

  const raw = (markdown ?? "").trim();
  if (!raw) return out;

  const lines = raw.split(/\r?\n/);
  let current: CarBodySectionKey = "conclusion";

  // Minimal markdown pipe-table parser (supports: |a|b| + separator row |---|---|)
  const splitPipeRow = (l: string): string[] => {
    const trimmed = (l ?? "").toString().trim();
    if (!trimmed) return [];
    if (!trimmed.includes("|")) return [];
    const parts = trimmed.split("|").map((p) => p.trim());
    if (parts[0] === "") parts.shift();
    if (parts[parts.length - 1] === "") parts.pop();
    return parts;
  };

  const isSeparatorRow = (l: string): boolean => {
    const cells = splitPipeRow(l);
    if (cells.length < 2) return false;
    return cells.every((c) => /^:?-{3,}:?$/.test(c));
  };

  const isTableStartAt = (idx: number): boolean => {
    const head = splitPipeRow(lines[idx] ?? "");
    if (head.length < 2) return false;
    return isSeparatorRow(lines[idx + 1] ?? "");
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    // empty
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // section heading marker: "## ..."
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const nextKey = mapCarBodySectionHeadingToKey(h2[1] ?? "");
      if (nextKey) current = nextKey;
      i += 1;
      continue;
    }

    // hr
    if (/^---+\s*$/.test(line.trim())) {
      out[current].push({ type: "hr" });
      i += 1;
      continue;
    }

    // h3
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      const text = (h3[1] ?? "").trim();
      if (text) {
        const id = slugifyId(text) || "detail";
        out[current].push({ type: "h", level: 3, text, id });
      }
      i += 1;
      continue;
    }

    // markdown image line -> fallback as paragraph
    const img = line.trim().match(/^!\[(.*?)\]\((.*?)\)\s*$/);
    if (img) {
      const alt = (img[1] ?? "").trim();
      const src = (img[2] ?? "").trim();
      const label = alt ? `${alt}（${src}）` : src;
      if (label) out[current].push({ type: "p", text: `画像: ${label}` });
      i += 1;
      continue;
    }

    // markdown table (pipe)
    if (isTableStartAt(i)) {
      const headers = splitPipeRow(lines[i] ?? "");
      i += 2; // header + separator
      const rows: string[][] = [];

      while (i < lines.length) {
        const rowLine = lines[i] ?? "";
        if (!rowLine.trim()) break;
        if (/^##\s+/.test(rowLine.trim())) break;
        if (/^---+\s*$/.test(rowLine.trim())) break;
        if (/^###\s+/.test(rowLine.trim())) break;
        if (/^[-*]\s+/.test(rowLine)) break;
        if (!rowLine.includes("|")) break;

        const cells = splitPipeRow(rowLine);
        if (cells.length === 0) break;
        rows.push(cells);
        i += 1;
      }

      out[current].push({ type: "table", headers, rows });
      continue;
    }

    // list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push(String(lines[i] ?? "").replace(/^[-*]\s+/, "").trim());
        i += 1;
      }
      const cleaned = items.map((s) => s.trim()).filter(Boolean);
      if (cleaned.length > 0) out[current].push({ type: "ul", items: cleaned });
      continue;
    }

    // paragraph (collect until blank / marker / hr / heading / list)
    const paraLines: string[] = [line];
    i += 1;

    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (!next.trim()) {
        i += 1;
        break;
      }
      if (/^##\s+/.test(next.trim())) break;
      if (/^---+\s*$/.test(next.trim())) break;
      if (/^###\s+/.test(next.trim())) break;
      if (/^[-*]\s+/.test(next)) break;
      if (isTableStartAt(i)) break;
      paraLines.push(next);
      i += 1;
    }

    const paragraph = paraLines.join("\n").trim();
    if (paragraph) out[current].push({ type: "p", text: paragraph });
  }

  return out;
}

function buildBlocksForCar(car: CarItem): {
  blocks: ContentBlock[];
  checkPoints: string[];
  takeaways: string[];
} {
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
  const checkPoints = uniqKeepOrder([...weaknesses, ...troubles, ...maintenance]).slice(0, 7);

  const bodySections = parseCarBodyMarkdownBySection(car.body ?? "");
  const pushBody = (key: CarBodySectionKey) => {
    const list = bodySections[key];
    if (!list || list.length === 0) return;
    for (const b of list) blocks.push(b);
  };


  // ─────────────────────────────────────────
  // 企画書: CARS 固定構成（最低限）
  // 01 結論：向く人/向かない人
  // 02 買う前の最重要チェック
  // 03 弱点・故障
  // 04 維持費の構造
  // 05 中古で狙うなら
  // 06 比較対象
  // 07 関連リンク
  // ─────────────────────────────────────────

  // 01 結論
  pushH2("結論：この車が向く人 / 向かない人");
  pushP(car.summaryLong ?? car.summary ?? null);

  const bestFor = safeList(car.bestFor);
  const notFor = safeList(car.notFor);

  if (bestFor.length > 0) {
    pushH3("向く人");
    pushUl(bestFor);
  }
  if (notFor.length > 0) {
    pushH3("向かない人");
    pushUl(notFor);
  }
  if (bestFor.length === 0 && notFor.length === 0) {
    pushP(
      "※この車種の『向く/向かない』は整理中です。現時点では、強み・弱み・トラブル傾向を先に確認してください。",
    );
  }

  pushBody("conclusion");

  pushHr();

  // 02 買う前の最重要チェック
  pushH2("買う前の最重要チェック");
  if (checkPoints.length > 0) {
    pushP("購入前に“ここだけは先に確認”したいポイントです。下のチェックリストを参照してください。");
  } else {
    pushP("購入前チェック項目は整理中です。現時点では弱み・トラブル傾向を参照してください。");
  }

  pushBody("check");

  pushHr();

  // 03 弱点・故障
  pushH2("弱点・故障（注意点）");
  if (weaknesses.length > 0) {
    pushH3("弱み・注意点");
    pushUl(weaknesses);
  }
  if (troubles.length > 0) {
    pushH3("トラブル傾向");
    pushUl(troubles);
  }
  if (weaknesses.length === 0 && troubles.length === 0) {
    pushP("弱点・故障傾向は整理中です。");
  }

  pushBody("trouble");

  pushHr();

  // 04 維持費の構造
  pushH2("維持費の構造");
  const yearly = car.maintenanceSimulation?.yearlyRoughTotal ?? null;
  const yearlyYen = car.maintenanceCostYenPerYear;

  const costBullets: string[] = [];
  if (yearly) costBullets.push(`年間の目安: ${yearly}`);
  if (typeof yearlyYen === "number" && Number.isFinite(yearlyYen)) {
    costBullets.push(`維持費（年）: 約${Math.round(yearlyYen / 10000)}万円（目安）`);
  }
  if (car.costImpression) costBullets.push(car.costImpression);

  if (costBullets.length > 0) {
    pushUl(costBullets);
  } else {
    pushP("維持費の目安は整理中です。");
  }

  if (maintenance.length > 0) {
    pushH3("メンテナンスの要点");
    pushUl(maintenance);
  }

  pushBody("maintenance");

  pushHr();

  // 05 中古で狙うなら
  pushH2("中古で狙うなら");
  const usedBullets: string[] = [];
  if (car.priceUsed) usedBullets.push(`中古相場: ${car.priceUsed}`);
  if (car.purchasePriceSafe) usedBullets.push(car.purchasePriceSafe);
  if (car.releaseYear) usedBullets.push(`発売年: ${car.releaseYear}`);
  if (car.bodyType) usedBullets.push(`ボディ: ${car.bodyType}`);
  if (car.segment) usedBullets.push(`セグメント: ${car.segment}`);
  if (car.engine) usedBullets.push(`エンジン: ${car.engine}`);
  if (car.drive) usedBullets.push(`駆動: ${car.drive}`);
  if (car.transmission) usedBullets.push(`トランスミッション: ${car.transmission}`);
  if (car.fuel) usedBullets.push(`燃料: ${car.fuel}`);
  if (car.priceNew) usedBullets.push(`新車価格: ${car.priceNew}`);

  if (usedBullets.length > 0) {
    pushUl(usedBullets);
  } else {
    pushP("中古相場・狙い方は整理中です。");
  }

  // 主要スペック（参考）
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
    pushH3("主要スペック（参考）");
    pushUl(specs);
  }

  pushBody("used");

  pushHr();

  // 06 比較対象
  pushH2("比較対象（3台以内）");
  pushP("比較候補と次に見るべき車種は、ページ下部の OTHER CARS / COMPARE から辿れます。");

  pushBody("compare");

  pushHr();

  // 07 関連リンク
  pushH2("関連リンク");
  pushP("購入判断に必要なガイド・関連ストーリーは、ページ下部の RECOMMEND から辿れます。");

  pushBody("links");

  return { blocks, checkPoints, takeaways };
}

function mapCarBadge(car: CarItem): string {
  if (car.segment) return String(car.segment);
  if (car.bodyType) return String(car.bodyType);
  if (car.maker) return String(car.maker);
  return "CAR";
}

function pickOtherCars(allCars: CarItem[], currentSlug: string, count = 2): CarItem[] {
  const pool = allCars.filter((c) => c.slug !== currentSlug);
  if (pool.length === 0 || count <= 0) return [];

  // Deterministic “random” (SSGでも安定させるため)
  let hash = 0;
  for (let i = 0; i < currentSlug.length; i++) {
    hash = (hash * 31 + currentSlug.charCodeAt(i)) >>> 0;
  }

  const start = hash % pool.length;
  const out: CarItem[] = [];
  for (let i = 0; i < pool.length && out.length < count; i++) {
    const candidate = pool[(start + i) % pool.length];
    if (!candidate) continue;
    out.push(candidate);
  }

  return out;
}


export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const title = car.titleJa ?? car.title;
  const badge = mapCarBadge(car);
  const yearLabel = formatYearLabel(car.releaseYear);

  const linkIndex = await getInternalLinkIndex();

  const { blocks, checkPoints, takeaways } = buildBlocksForCar(car);
  const sections = buildSectionsFromBlocks(blocks);
  const toc = sections.map((s) => ({ id: s.id, title: s.title }));

  const allCarsForNav = await getAllCars();
  const otherCars = pickOtherCars(allCarsForNav, car.slug, 2);

  // CAR DATABASE への戻り先（/cars のページングを維持）
  const listPerPage = 12;
  const carIndexInList = allCarsForNav.findIndex((c) => c.slug === car.slug);
  const pageInList = carIndexInList >= 0 ? Math.floor(carIndexInList / listPerPage) + 1 : 1;
  const backToCarsHref =
    pageInList > 1
      ? `/cars?page=${pageInList}#car-${car.slug}`
      : `/cars#car-${car.slug}`;

  // “recommend” はこの車種に紐づく Heritage / Guide / Column を全件カードで出す
  const recommendGuides = getOwnershipGuidesForCarSlug(car.slug, { limit: 9999 });
  const recommendColumns = getRelatedColumnsForCarSlug(car.slug, 9999);
  const recommendHeritage = getRelatedHeritageForCarSlug(car.slug, 9999);
  const hasRecommend =
    recommendGuides.length + recommendColumns.length + recommendHeritage.length > 0;
  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground />

      <div id="top" />

      <div className="page-shell pb-24 pt-24">
        <JsonLd
          id={`ld-breadcrumb-car-${car.slug}`}
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "HOME", item: `${getSiteUrl()}/` },
              { "@type": "ListItem", position: 2, name: "CARS", item: `${getSiteUrl()}/cars` },
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
          tone="light"
          items={[
            { label: "HOME", href: "/" },
            { label: "CARS", href: "/cars" },
            { label: title },
          ]}
        />

        <header className="mt-6">
          <h1 className="serif-heading text-[28px] leading-[1.25] tracking-tight text-white sm:text-[34px]">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-white/90 backdrop-blur">
              {badge}
            </span>
            {yearLabel ? (
              <span className="text-[10px] tracking-[0.22em] text-white/60">{yearLabel}</span>
            ) : null}
          </div>
        </header>

        {/* Parent pillar (internal linking rule: early link) */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-6 backdrop-blur">
            <p className="text-[11px] tracking-[0.22em] text-white/65">PILLAR</p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/85">
              車種選びの前提（読む順番・チェックの基準）は、中古車検索HUBでまとめています。
            </p>
            <Link
              href="/guide/hub-usedcar"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] tracking-[0.22em] text-white/85 backdrop-blur hover:bg-white/10"
            >
              中古車検索HUBへ
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>


        {/* Hero image */}
        {ENABLE_CAR_IMAGES && (car.heroImage || car.mainImage) ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={(car.heroImage ?? car.mainImage) as string}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover opacity-95"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        ) : null}

        {/* Takeaways */}
        {takeaways.length > 0 ? (
          <section className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
              <div className="px-7 py-7 sm:px-9 sm:py-8">
                <p className="text-[11px] tracking-[0.22em] text-white/65">TAKEAWAYS</p>
                <h2 className="serif-heading mt-2 text-[18px] text-white">まず押さえるポイント</h2>
              </div>
              <div className="mx-6 h-px bg-white/10" />
              <ul className="space-y-5 px-7 py-7 sm:px-9 sm:py-8">
                {takeaways.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                    <TextWithInternalLinkCards
                      text={t}
                      linkIndex={linkIndex}
                      as="span"
                      className="flex-1"
                      textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Fixed / Sticky TOC (heritage詳細の章立てをcarsにも) */}
        {toc.length > 1 ? (
          <section className="mt-10">
            <InThisStoryToc items={toc} sticky />
          </section>
        ) : null}

        {/* Sections */}
        <section className="mt-10 space-y-10">
          {sections.map((sec, idx) => {
            const isBase = idx === 1; // 買う前の最重要チェック（ここにチェックポイントを寄せる）
            return (
              <div key={sec.id} className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
                <div className="px-7 py-7 sm:px-9 sm:py-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[12px] tracking-[0.22em] text-white/65">
                      CHAPTER {chapterNo(idx)}
                    </span>
                    <h2
                      id={sec.id}
                      className="serif-heading scroll-mt-28 text-[22px] leading-[1.35] text-white sm:text-[26px]"
                    >
                      {sec.title}
                    </h2>
                  </div>
                </div>

                <div className="mx-6 h-px bg-white/10" />

                <div className="px-6 py-6">
                  {/* Check points（2章の直後） */}
                  {isBase && checkPoints.length > 0 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-[#0ABAB5]/25 bg-[#0ABAB5]/10">
                      <div className="px-4 py-3">
                        <p className="text-[10px] tracking-[0.22em] text-white/80">CHECK POINTS</p>
                        <p className="mt-1 text-[13px] font-medium text-white">購入前に確認したいこと</p>
                      </div>
                      <div className="h-px bg-[#0ABAB5]/20" />
                      <ul className="space-y-2 px-4 py-3">
                        {checkPoints.map((c) => (
                          <li key={c} className="flex items-start gap-3">
                            <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                            <TextWithInternalLinkCards
                              text={c}
                              linkIndex={linkIndex}
                              as="span"
                              className="flex-1"
                              textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="space-y-8">
                    {sec.blocks.map((b, i) => {
                      if (b.type === "h" && b.level === 3) {
                        return (
                          <h3
                            key={`${b.id}-${i}`}
                            id={b.id}
                            className="serif-heading scroll-mt-28 pt-2 text-[18px] font-semibold leading-relaxed text-white"
                          >
                            {b.text}
                          </h3>
                        );
                      }
                      if (b.type === "p") {
                        return (
                          <TextWithInternalLinkCards
                            key={i}
                            text={formatBodyText(b.text)}
                            linkIndex={linkIndex}
                            as="p"
                            textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                          />
                        );
                      }
                      if (b.type === "ul") {
                        return (
                          <ul key={i} className="space-y-4">
                            {b.items.map((it) => (
                              <li key={it} className="flex items-start gap-3">
                                <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                                <TextWithInternalLinkCards
                                  text={it}
                                  linkIndex={linkIndex}
                                  as="span"
                                  className="flex-1"
                                  textClassName="text-[15px] leading-[2.05] tracking-[0.08em] text-white/85"
                                />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (b.type === "table") {
                        return <ScrollSpecTable key={i} headers={b.headers} rows={b.rows} />;
                      }
                      if (b.type === "hr") {
                        return <div key={i} className="h-px bg-white/10" />;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Internal navigation (CAR LIST を廃止 → OTHER CARS / RECOMMEND に置き換え) */}
        <section className="mt-14" aria-label="内部回遊">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] tracking-[0.22em] text-white/70">OTHER CARS</p>
              <Link
                href={backToCarsHref}
                className="text-[11px] tracking-[0.22em] text-white/70 hover:text-[#0ABAB5]"
              >
                CAR DATABASEへ戻る
              </Link>
            </div>

            {otherCars.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {otherCars.map((oc) => (
                  <ContentRowCard
                    key={oc.slug}
                    href={`/cars/${oc.slug}`}
                    title={oc.titleJa ?? oc.title}
                    date={formatYearLabel(oc.releaseYear)}
                    badge={mapCarBadge(oc)}
                    badgeTone="dark"
                    hideImage={!ENABLE_CAR_IMAGES}
                    imageSrc={oc.heroImage ?? null}
                    excerpt={oc.summaryLong ?? oc.summary ?? null}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-white/60">現在、表示できる他の車種がありません。</p>
            )}

            {hasRecommend ? (
              <div className="mt-8">
                <p className="text-[11px] tracking-[0.22em] text-white/70">RECOMMEND</p>

                {recommendHeritage.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-[11px] tracking-[0.22em] text-white/55">HERITAGE</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {recommendHeritage.map((h) => (
                        <ContentRowCard
                          key={h.slug}
                          href={`/heritage/${h.slug}`}
                          title={h.title}
                          date={h.updatedAt ?? null}
                          imageSrc={h.heroImage ?? null}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {recommendGuides.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-[11px] tracking-[0.22em] text-white/55">GUIDE</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {recommendGuides.map((g) => (
                        <ContentRowCard
                          key={g.slug}
                          href={`/guide/${g.slug}`}
                          title={g.title}
                          date={g.updatedAt ?? null}
                          imageSrc={g.heroImage ?? null}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {recommendColumns.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-[11px] tracking-[0.22em] text-white/55">COLUMN</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {recommendColumns.map((c) => (
                        <ContentRowCard
                          key={c.slug}
                          href={`/column/${c.slug}`}
                          title={c.title}
                          date={c.updatedAt ?? null}
                          imageSrc={c.heroImage ?? null}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={backToCarsHref}
              className="rounded-full border border-white/20 bg-black/20 px-5 py-3 text-[12px] tracking-[0.18em] text-white/90 backdrop-blur hover:bg-white/10"
            >
              CAR DATABASEへ戻る
            </Link>
            <Link
              href="/compare"
              className="rounded-full border border-white/20 bg-[#0ABAB5]/10 px-5 py-3 text-[12px] tracking-[0.18em] text-white/90 backdrop-blur hover:bg-[#0ABAB5]/20"
            >
              車種比較（COMPARE）
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
