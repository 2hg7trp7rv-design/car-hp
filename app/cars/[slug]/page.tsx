import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { CompareAddButton } from "@/components/compare/CompareAddButton";
import { ScrollSpecTable } from "@/components/content/ScrollSpecTable";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { pickExistingLocalPublicAssetPath, resolveOgImageUrl } from "@/lib/public-assets";
import { getInternalLinkIndex } from "@/lib/content/internal-link-index";
import { buildCarDescription, buildCarTitleBase, withBrand } from "@/lib/seo/serp";
import { isIndexableCar } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getRedirectDestination } from "@/lib/seo/redirects";
import { ENABLE_CAR_IMAGES } from "@/lib/features";

import {
  getAllCars,
  getIndexCars,
  getCarBySlug,
  getOwnershipGuidesForCarSlug,
  getRelatedColumnsForCarSlug,
  getRelatedHeritageForCarSlug,
  type CarItem,
} from "@/lib/cars";
import { cn } from "@/lib/utils";
import { ExhibitionLabel } from "@/components/content/ExhibitionLabel";

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
  const image = resolveOgImageUrl(rawImage, getSiteUrl());

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
  pushP(
    "同じ予算帯・同じ使い方で迷いやすい候補だけを、最大3台に絞って並べます。数字より『乗り方』と『維持の現実』で比べると失敗しにくい。",
  );

  pushBody("compare");

  pushHr();

  // 07 関連リンク
  pushH2("関連リンク");
  pushP(
    "最後に、購入判断を一段進めるための『次に読む3本』を置きます。迷ったらこの順で読むと早い。",
  );

  pushBody("links");

  return { blocks, checkPoints, takeaways };
}

function mapCarBadge(car: CarItem): string {
  if (car.segment) return String(car.segment);
  if (car.bodyType) return String(car.bodyType);
  if (car.maker) return String(car.maker);
  return "CAR";
}

type NextReadCard = {
  href: string;
  title: string;
  excerpt?: string | null;
  badge: "GUIDE" | "COLUMN" | "HERITAGE";
  date?: string | null;
  imageSrc?: string | null;
};

function buildParentPillarLabel(car: CarItem): string {
  const href = String(car.parentPillarId ?? "").trim();
  if (!href) return "上位ページへ";
  if (href.startsWith("/cars/makers/")) return `${String(car.maker ?? "").toUpperCase()}の車種一覧へ`;
  if (href.startsWith("/cars/segments/")) return `${String(car.segment ?? "セグメント")}の車種一覧へ`;
  if (href.startsWith("/cars/body-types/")) return `${String(car.bodyType ?? "ボディタイプ")}の車種一覧へ`;
  return "上位ページへ";
}

function pickCompareCars(allCars: CarItem[], car: CarItem, max = 3): CarItem[] {
  const bySlug = new Map(allCars.map((c) => [c.slug, c] as const));

  const out: CarItem[] = [];
  const seen = new Set<string>();

  const resolveCar = (rawSlug: string): CarItem | null => {
    const s = String(rawSlug ?? "").trim();
    if (!s) return null;

    const direct = bySlug.get(s);
    if (direct) return direct;

    const dest = getRedirectDestination(`/cars/${s}`);
    if (dest && dest.startsWith("/cars/")) {
      const destSlug = dest.slice("/cars/".length).trim();
      const hit = bySlug.get(destSlug);
      if (hit) return hit;
    }

    return null;
  };

  // 1) 明示指定（入力順を尊重）
  const explicit = Array.isArray(car.relatedCarSlugs) ? car.relatedCarSlugs : [];
  for (const sRaw of explicit) {
    const hit = resolveCar(typeof sRaw === "string" ? sRaw : "");
    if (!hit) continue;
    if (hit.slug === car.slug) continue;
    if (seen.has(hit.slug)) continue;

    seen.add(hit.slug);
    out.push(hit);
    if (out.length >= max) return out;
  }

  // 2) 補完（同セグメント → 同ボディタイプ → 同メーカー）
  const pool = allCars.filter((c) => c.slug !== car.slug);
  const append = (predicate: (c: CarItem) => boolean) => {
    for (const cand of pool) {
      if (out.length >= max) break;
      if (!predicate(cand)) continue;
      if (seen.has(cand.slug)) continue;
      seen.add(cand.slug);
      out.push(cand);
    }
  };

  if (out.length < max && car.segment) append((c) => c.segment === car.segment);
  if (out.length < max && car.bodyType) append((c) => c.bodyType === car.bodyType);
  if (out.length < max && car.makerKey) append((c) => c.makerKey === car.makerKey);

  return out.slice(0, max);
}

function pickNextReads(args: {
  guides: ReturnType<typeof getOwnershipGuidesForCarSlug>;
  columns: ReturnType<typeof getRelatedColumnsForCarSlug>;
  heritage: ReturnType<typeof getRelatedHeritageForCarSlug>;
}): NextReadCard[] {
  const out: NextReadCard[] = [];
  const push = (item: NextReadCard) => {
    if (out.some((x) => x.href === item.href)) return;
    out.push(item);
  };

  // まずは「次の一手」になりやすい順
  const guide = args.guides[0];
  if (guide) {
    push({
      href: `/guide/${guide.slug}`,
      title: guide.title,
      excerpt: guide.lead ?? null,
      badge: "GUIDE",
      date: guide.updatedAt ?? guide.publishedAt ?? null,
      imageSrc: guide.heroImage ?? null,
    });
  }

  const column = args.columns[0];
  if (column) {
    push({
      href: `/column/${column.slug}`,
      title: column.title,
      excerpt: column.summary ?? null,
      badge: "COLUMN",
      date: column.updatedAt ?? column.publishedAt ?? null,
      imageSrc: column.heroImage ?? null,
    });
  }

  const heritage = args.heritage[0];
  if (heritage) {
    push({
      href: `/heritage/${heritage.slug}`,
      title: heritage.title,
      excerpt: heritage.summary ?? null,
      badge: "HERITAGE",
      date: heritage.updatedAt ?? heritage.publishedAt ?? null,
      imageSrc: heritage.heroImage ?? null,
    });
  }

  // 足りない場合は固定の“判断に効く”導線で埋める
  if (out.length < 3) {
    push({
      href: "/guide/hub-usedcar",
      title: "中古車検索HUB（候補の絞り方）",
      excerpt: "車種選びより先に、条件と判断軸を固めるためのまとめ。",
      badge: "GUIDE",
    });
  }
  if (out.length < 3) {
    push({
      href: "/column/dealer-shaken-is-expensive-myth",
      title: "ディーラー車検は高い？ 実は得するケースと損するケース",
      excerpt: "維持費のブレを減らすために、車検の考え方を先に整える。",
      badge: "COLUMN",
    });
  }
  if (out.length < 3) {
    push({
      href: "/column/usedcar-low-mileage-trap",
      title: "低走行の中古車は当たり？ 見分ける基準",
      excerpt: "距離だけで決めないための、現車チェックの軸。",
      badge: "COLUMN",
    });
  }

  return out.slice(0, 3);
}


export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const title = car.titleJa ?? car.title;
  const badge = mapCarBadge(car);
  const yearLabel = formatYearLabel(car.releaseYear);

  const safeHeroImage = pickExistingLocalPublicAssetPath(
    (((car.heroImage ?? car.mainImage) as string | null) ?? null),
    null,
  );

  const linkIndex = await getInternalLinkIndex();

  const { blocks, checkPoints, takeaways } = buildBlocksForCar(car);
  const sections = buildSectionsFromBlocks(blocks);
  const toc = sections.map((s) => ({ id: s.id, title: s.title }));

  const indexCarsForNav = await getIndexCars();
  const allCarsForNav = await getAllCars();
  const listCars = car.publicState === "index" ? indexCarsForNav : allCarsForNav;
  const compareCars = pickCompareCars(indexCarsForNav, car, 3);

  // CAR DATABASE への戻り先（/cars は基本 index のみ。準備中の車種はトグル付き）
  const listPerPage = 12;
  const carIndexInList = listCars.findIndex((c) => c.slug === car.slug);
  const pageInList = carIndexInList >= 0 ? Math.floor(carIndexInList / listPerPage) + 1 : 1;
  const backToCarsHref =
    car.publicState === "index"
      ? pageInList > 1
        ? `/cars?page=${pageInList}#car-${car.slug}`
        : `/cars#car-${car.slug}`
      : pageInList > 1
        ? `/cars?includeNoindex=1&page=${pageInList}#car-${car.slug}`
        : `/cars?includeNoindex=1#car-${car.slug}`;

  // “次に読む”は最後の章で3本だけ出す
  const recommendGuides = getOwnershipGuidesForCarSlug(car.slug, { limit: 5 });
  const recommendColumns = getRelatedColumnsForCarSlug(car.slug, 5);
  const recommendHeritage = getRelatedHeritageForCarSlug(car.slug, 5);
  const nextReads = pickNextReads({ guides: recommendGuides, columns: recommendColumns, heritage: recommendHeritage });

  const parentPillarHref = (car.parentPillarId ?? "").trim() || "/cars";
  const parentPillarLabel = buildParentPillarLabel(car);
  return (
    <main className="relative text-white">
      {/* Fixed background (CARS / HERITAGE / GUIDE / COLUMN で共通) */}
      <DetailFixedBackground seed={params.slug} imageSrc={((car.heroImage ?? car.mainImage) as string | null) ?? null} />

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

        <ExhibitionLabel
          n="01"
          title={ title }
          subtitle={ car.maker || null }
          meta={ [car.maker, car.releaseYear ? String(car.releaseYear) : null].filter(Boolean).join(" / ") || null }
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
            <CompareAddButton
              slug={car.slug}
              source="car_header"
              className="h-7 px-3 text-[10px] tracking-[0.22em]"
            />
          </div>
        </header>

        {/* Parent pillar (internal linking rule: early link) */}
        <section className="mt-8">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-6 backdrop-blur">
            <p className="text-[11px] tracking-[0.22em] text-white/65">PILLAR</p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/85">
              迷ったら、上位ページに戻って条件を整理してから見ると早いです。まず「{parentPillarLabel}」→
              「中古車検索HUB」→ このページ、の順で進めるのがおすすめ。
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={parentPillarHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] tracking-[0.22em] text-white/85 backdrop-blur hover:bg-white/10"
              >
                {parentPillarLabel}
                <span aria-hidden>→</span>
              </Link>

              <Link
                href="/guide/hub-usedcar"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] tracking-[0.22em] text-white/85 backdrop-blur hover:bg-white/10"
              >
                中古車検索HUBへ
                <span aria-hidden>→</span>
              </Link>

              <Link
                href={backToCarsHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] tracking-[0.22em] text-white/85 backdrop-blur hover:bg-white/10"
              >
                CAR DATABASEへ戻る
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>


        {/* Hero image */}
        {ENABLE_CAR_IMAGES && safeHeroImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={safeHeroImage}
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
                      textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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
        <section className="mt-10 space-y-10 cb-prose">
          {sections.map((sec, idx) => {
            const isBase = idx === 1; // 買う前の最重要チェック（ここにチェックポイントを寄せる）
            return (
              <div key={sec.id} className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 backdrop-blur">
                <div className="cb-stage-chapterTop">
                  <p className="cb-stage-chapterLabel">
                    CHAPTER {chapterNo(idx)}
                  </p>
                  <h2 id={sec.id} className="cb-stage-chapterTitle scroll-mt-28">
                    {sec.title}
                  </h2>
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
                              textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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
                            className="cb-prose-block cb-stage-h3 scroll-mt-28 pt-2"
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
                            className="cb-prose-block"
                            textClassName="cb-stage-body cb-stage-body-strong text-white/85"
                          />
                        );
                      }
                      if (b.type === "ul") {
                        return (
                          <ul key={i} className="cb-prose-block space-y-4">
                            {b.items.map((it) => (
                              <li key={it} className="flex items-start gap-3">
                                <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0ABAB5]" />
                                <TextWithInternalLinkCards
                                  text={it}
                                  linkIndex={linkIndex}
                                  as="span"
                                  className="flex-1"
                                  textClassName="cb-stage-body cb-stage-body-strong text-white/85"
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

                    {sec.title.includes("比較対象") ? (
                      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[11px] tracking-[0.22em] text-white/70">COMPARE CANDIDATES</p>
                          <Link
                            href="/compare"
                            className="text-[11px] tracking-[0.22em] text-white/70 hover:text-[#0ABAB5]"
                          >
                            車種比較へ
                          </Link>
                        </div>

                        {compareCars.length > 0 ? (
                          <div className="mt-4 grid gap-3">
                            {compareCars.map((cc) => (
                              <div key={cc.slug} className="relative">
  <ContentRowCard
                                    href={`/cars/${cc.slug}`}
                                    title={cc.titleJa ?? cc.title}
                                    date={formatYearLabel(cc.releaseYear)}
                                    badge={mapCarBadge(cc)}
                                    badgeTone="dark"
                                    hideImage={!ENABLE_CAR_IMAGES}
                                    imageSrc={cc.heroImage ?? null}
                                    excerpt={cc.summaryLong ?? cc.summary ?? null}
                                  />
  <div className="absolute right-3 top-3 z-20">
    <CompareAddButton slug={cc.slug} source="car_compare_section" mode="icon" className="h-9 w-9" />
  </div>
</div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-[13px] leading-relaxed text-white/70">
                            比較候補は準備中です。気になる車種を
                            <Link href="/compare" className="mx-1 underline decoration-white/40 hover:text-[#0ABAB5]">
                              車種比較
                            </Link>
                            に追加して、同じ軸で並べてください。
                          </p>
                        )}
                      </div>
                    ) : null}

                    {sec.title.includes("関連リンク") ? (
                      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-4">
                        <p className="text-[11px] tracking-[0.22em] text-white/70">NEXT READS</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {nextReads.map((nr) => (
                            <ContentRowCard
                              key={nr.href}
                              href={nr.href}
                              title={nr.title}
                              date={nr.date ?? null}
                              badge={nr.badge}
                              badgeTone="dark"
                              hideImage={!ENABLE_CAR_IMAGES || !nr.imageSrc}
                              imageSrc={nr.imageSrc ?? null}
                              excerpt={nr.excerpt ?? null}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
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