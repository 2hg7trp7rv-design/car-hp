import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { PullQuote } from "@/components/content/PullQuote";
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
import { getEditorialSurfaceClass } from "@/lib/detail-theme";
import { buildEditorialPullQuote } from "@/lib/editorial-quote";
import { normalizeEditorialHeadingLabel } from "@/lib/editorial-heading";
import { resolveColumnCardImage, resolveGuideCardImage, resolveHeritageCardImage } from "@/lib/display-tag-media";
import { getEditorialCarImageBySlug } from "@/lib/editorial-assets";

import {
  getAllCars,
  getIndexCars,
  getCarBySlug,
  getOwnershipGuidesForCarSlug,
  getRelatedColumnsForCarSlug,
  getRelatedHeritageForCarSlug,
  type CarItem,
} from "@/lib/cars";

type Props = {
  params: { slug: string };
};

function resolveCarHeroImagePath(car: Pick<CarItem, "slug" | "heroImage" | "mainImage" | "ogImageUrl">): string | null {
  return (
    getEditorialCarImageBySlug(car.slug) ??
    ((car.heroImage ?? car.mainImage ?? car.ogImageUrl ?? null) as string | null) ??
    null
  );
}

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

  const rawImage = resolveCarHeroImagePath(car);
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

function trimHeroCopy(value?: string | null, max = 118): string | null {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).replace(/[、。,. ]+$/g, "")}…`;
}

const MAKER_JA_LABELS: Record<string, string[]> = {
  Ferrari: ["フェラーリ"],
  FERRARI: ["フェラーリ"],
  Lamborghini: ["ランボルギーニ"],
  LAMBORGHINI: ["ランボルギーニ"],
  Nissan: ["日産", "ニッサン"],
  NISSAN: ["日産", "ニッサン"],
  Toyota: ["トヨタ"],
  TOYOTA: ["トヨタ"],
  Honda: ["ホンダ"],
  HONDA: ["ホンダ"],
  Suzuki: ["スズキ"],
  SUZUKI: ["スズキ"],
  Lexus: ["レクサス"],
  LEXUS: ["レクサス"],
  Mitsubishi: ["三菱"],
  MITSUBISHI: ["三菱"],
  Lotus: ["ロータス"],
  LOTUS: ["ロータス"],
  BMW: ["BMW", "ビーエムダブリュー"],
};

function trimSentenceEnd(value?: string | null): string {
  return String(value ?? "")
    .replace(/[。．.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripMakerPrefix(value: string, car: CarItem): string {
  const maker = String(car.maker ?? "").trim();
  const variants = new Set<string>([
    maker,
    maker.toUpperCase(),
    maker.toLowerCase(),
    trimSentenceEnd(car.maker),
    ...(MAKER_JA_LABELS[maker] ?? []),
    ...(MAKER_JA_LABELS[maker.toUpperCase()] ?? []),
  ].filter(Boolean));

  let out = trimSentenceEnd(value);
  for (const variant of variants) {
    const re = new RegExp(`^${escapeRegex(variant)}(?:[\\s\\u3000・/／-]+)?`, "i");
    out = out.replace(re, "").trim();
  }
  return trimSentenceEnd(out);
}

function buildHeroDisplayTitle(car: CarItem): string {
  const fromName = stripMakerPrefix(trimSentenceEnd(car.name), car);
  const fromJa = stripMakerPrefix(trimSentenceEnd(car.titleJa), car);
  const fromTitle = stripMakerPrefix(trimSentenceEnd(car.title), car);

  if (fromName && fromName.length >= 3) return fromName;
  if (fromJa) return fromJa;
  if (fromTitle) return fromTitle;
  if (fromName) return fromName;

  return trimSentenceEnd(car.name ?? car.titleJa ?? car.title ?? "");
}

function countGlyphs(value: string): number {
  return Array.from(String(value ?? "").trim()).length;
}

function pickHeroLead(car: CarItem): string | null {
  const source = String(car.summary ?? car.summaryLong ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!source) return null;

  const firstSentence = (source.match(/^.*?[。.!?！？](?:[」』）】”’])?/u)?.[0] ?? source)
    .replace(/\s+/g, " ")
    .trim();

  const candidate = firstSentence || source;
  return trimHeroCopy(candidate, 56);
}

function heroTitleLayout(title: string): { className: string; maxWidthClass: string } {
  const length = countGlyphs(title);

  if (length >= 28) {
    return {
      className: "text-[clamp(2.05rem,8.8vw,3.35rem)] leading-[0.94] tracking-[-0.048em]",
      maxWidthClass: "max-w-[12ch]",
    };
  }

  if (length >= 20) {
    return {
      className: "text-[clamp(2.3rem,9.8vw,3.8rem)] leading-[0.93] tracking-[-0.052em]",
      maxWidthClass: "max-w-[11.4ch]",
    };
  }

  if (length >= 14) {
    return {
      className: "text-[clamp(2.6rem,11vw,4.2rem)] leading-[0.91] tracking-[-0.056em]",
      maxWidthClass: "max-w-[10.8ch]",
    };
  }

  return {
    className: "text-[clamp(2.9rem,12vw,4.65rem)] leading-[0.9] tracking-[-0.062em]",
    maxWidthClass: "max-w-[10ch]",
  };
}

type HeadingBlock = { type: "h"; level: 2 | 3; text: string; id: string };
type ParagraphBlock = { type: "p"; text: string };
type ListBlock = { type: "ul"; items: string[] };
type DetailsBlock = { type: "details"; summary: string; items: string[] };
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };
type DividerBlock = { type: "hr" };
type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | DetailsBlock | TableBlock | DividerBlock;

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
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^a-z0-9\-\u3040-\u30ff\u3400-\u9fff]/g, "")
    .slice(0, 80);
}

function safeList(input?: (string | null | undefined)[] | null): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
}

function normalizeSuitabilityText(input: string): string {
  return String(input ?? "")
    .normalize("NFKC")
    .trim()
    // punctuation/spacing differences are noise for dedup
    .replace(/[、。・，,]/g, "")
    .replace(/[\s\u3000]+/g, "")
    // bestFor/notFor は語尾に「人」が付くが、本文側は付かないことがある
    .replace(/人$/g, "");
}

function buildSuitabilitySet(car: CarItem): Set<string> {
  const set = new Set<string>();
  for (const v of [...safeList(car.bestFor), ...safeList(car.notFor)]) {
    const key = normalizeSuitabilityText(v);
    if (key) set.add(key);
  }
  return set;
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
      current = { id: b.id, title: normalizeEditorialHeadingLabel(b.text), blocks: [] };
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

  // Chapter 02 のチェックポイントは、Chapter 03 の弱点・トラブルと重複しやすい。
  // そのまま両方を出すと “同じ箇条書きが2回” になり、体験として雑に見える。
  // データは保持しつつ、Chapter 03 側では既出項目を折りたたみ（details）に回す。
  const normalizeBullet = (s: string): string =>
    String(s ?? "")
      .trim()
      .replace(/[\s\u3000]+/g, " ");

  const checkPointSet = new Set(checkPoints.map(normalizeBullet));

  const bodySections = parseCarBodyMarkdownBySection(car.body ?? "");

  const suitabilitySet = buildSuitabilitySet(car);

  // body は「本文の拡張」用。ただし、同じ情報を structured fields でも出しているため
  // そのまま出すと重複表示になるケースがある（特に『向く人/向かない人』『比較』『関連リンク』）。
  // ここでは“本文の価値を保ったまま”重複だけを抑制する。

  const isInternalPathListItem = (text: string): boolean => {
    const t = String(text ?? "").trim();
    return /^\/(cars|guide|column|heritage|compare)\//.test(t);
  };

  const stripSuitabilitySubsections = (list: ContentBlock[]): ContentBlock[] => {
    const out: ContentBlock[] = [];
    let skipping = false;

    const isSuitabilityHeading = (b: ContentBlock): boolean =>
      b.type === "h" &&
      b.level === 3 &&
      /^(向く人|向かない人)$/.test(String((b as any).text ?? "").trim());

    const isSuitabilityList = (b: ContentBlock): boolean => {
      if (suitabilitySet.size === 0) return false;
      if (b.type !== "ul") return false;
      const items = Array.isArray(b.items) ? b.items : [];
      if (items.length === 0) return false;

      // 本文側の箇条書きが bestFor/notFor と実質同じなら、二重表示なので落とす
      return items.every((it) => {
        const key = normalizeSuitabilityText(String(it ?? ""));
        return key ? suitabilitySet.has(key) : false;
      });
    };

    for (const b of list) {
      if (isSuitabilityList(b)) {
        continue;
      }

      if (isSuitabilityHeading(b)) {
        // H3 を出すと、上で生成した structured bullet と二重になる
        skipping = true;
        continue;
      }

      if (skipping) {
        // 直後のリストはほぼ確実に重複
        if (b.type === "ul") continue;

        // 次の小見出し / セクション区切りで復帰
        if (b.type === "h" && b.level === 3) skipping = false;
        if (b.type === "hr") skipping = false;

        // まれに段落だけ入っている場合は残す（価値があることがある）
        if (skipping) {
          out.push(b);
          continue;
        }
      }

      out.push(b);
    }

    return out;
  };

  const stripInternalLinkLists = (list: ContentBlock[]): ContentBlock[] => {
    const out: ContentBlock[] = [];
    for (const b of list) {
      if (b.type !== "ul") {
        out.push(b);
        continue;
      }
      const items = (b.items ?? []).filter((it) => !isInternalPathListItem(it));
      if (items.length === 0) continue;
      out.push({ ...b, items });
    }
    return out;
  };

  const pushBody = (key: CarBodySectionKey) => {
    const rawList = bodySections[key];
    if (!rawList || rawList.length === 0) return;

    let list = rawList;
    if (key === "conclusion") list = stripSuitabilitySubsections(list);
    if (key === "compare" || key === "links") list = stripInternalLinkLists(list);

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
  pushH2("この車が向く人 / 向かない人");
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
    const unique = weaknesses.filter((w) => !checkPointSet.has(normalizeBullet(w)));
    if (unique.length > 0) pushUl(unique);
  }
  if (troubles.length > 0) {
    pushH3("トラブル傾向");
    const unique = troubles.filter((t) => !checkPointSet.has(normalizeBullet(t)));
    if (unique.length > 0) pushUl(unique);
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
    "同じ予算帯・同じ使い方で迷いやすい候補を、最大3台まで。",
  );

  pushBody("compare");

  pushHr();

  // 07 関連リンク
  pushH2("関連リンク");
  pushP(
    "購入前に確認しておきたい関連記事を。",
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
  badge: "ガイド" | "視点" | "系譜";
  date?: string | null;
  imageSrc?: string | null;
};

function buildParentPillarLabel(car: CarItem): string {
  const href = String(car.parentPillarId ?? "").trim();
  if (!href) return "上位ページ";
  if (href.startsWith("/cars/makers/")) return `${String(car.maker ?? "").toUpperCase()}の車種一覧`;
  if (href.startsWith("/cars/segments/")) return `${String(car.segment ?? "セグメント")}の車種一覧`;
  if (href.startsWith("/cars/body-types/")) return `${String(car.bodyType ?? "ボディタイプ")}の車種一覧`;
  return "上位ページ";
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
  const append = (predicate: (_item: CarItem) => boolean) => {
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
      badge: "ガイド",
      date: guide.updatedAt ?? guide.publishedAt ?? null,
      imageSrc: resolveGuideCardImage(guide),
    });
  }

  const column = args.columns[0];
  if (column) {
    push({
      href: `/column/${column.slug}`,
      title: column.title,
      excerpt: column.summary ?? null,
      badge: "視点",
      date: column.updatedAt ?? column.publishedAt ?? null,
      imageSrc: resolveColumnCardImage(column),
    });
  }

  const heritage = args.heritage[0];
  if (heritage) {
    push({
      href: `/heritage/${heritage.slug}`,
      title: heritage.title,
      excerpt: heritage.summary ?? null,
      badge: "系譜",
      date: heritage.updatedAt ?? heritage.publishedAt ?? null,
      imageSrc: resolveHeritageCardImage(heritage),
    });
  }

  // 足りない場合は固定の“判断に効く”導線で埋める
  if (out.length < 3) {
    push({
      href: "/guide/hub-usedcar",
      title: "中古車の探し方",
      excerpt: "車種選びより先に、条件と判断軸を固めるためのまとめ。",
      badge: "ガイド",
    });
  }
  if (out.length < 3) {
    push({
      href: "/column/dealer-shaken-is-expensive-myth",
      title: "ディーラー車検を考える。得するケースと見直すケース。",
      excerpt: "維持費のブレを減らすために、車検の考え方を先に整える。",
      badge: "視点",
    });
  }
  if (out.length < 3) {
    push({
      href: "/column/usedcar-low-mileage-trap",
      title: "低走行の中古車を見るとき。買っていい個体と避けたい個体を分ける基準。",
      excerpt: "距離だけで決めないための、現車チェックの軸。",
      badge: "視点",
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

  const resolvedHeroImagePath = resolveCarHeroImagePath(car);
  const safeHeroImage = pickExistingLocalPublicAssetPath(resolvedHeroImagePath, null);

  const linkIndex = await getInternalLinkIndex();

  const { blocks, checkPoints, takeaways } = buildBlocksForCar(car);
  const sections = buildSectionsFromBlocks(blocks);
  const toc = sections.map((s) => ({ id: s.id, title: s.title }));

  const indexCarsForNav = await getIndexCars();
  const allCarsForNav = await getAllCars();
  const listCars = car.publicState === "index" ? indexCarsForNav : allCarsForNav;
  const compareCars = pickCompareCars(indexCarsForNav, car, 3);
  const showInlineCompareAdd = compareCars.length > 0 && sections.some((sec) => sec.title.includes("比較対象"));

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

  const recommendGuides = getOwnershipGuidesForCarSlug(car.slug, { limit: 5 });
  const recommendColumns = getRelatedColumnsForCarSlug(car.slug, 5);
  const recommendHeritage = getRelatedHeritageForCarSlug(car.slug, 5);
  const nextReads = pickNextReads({ guides: recommendGuides, columns: recommendColumns, heritage: recommendHeritage });

  const parentPillarHref = (car.parentPillarId ?? "").trim() || "/cars";
  const parentPillarLabel = buildParentPillarLabel(car);

  const introParagraph =
    sections
      .flatMap((section) => section.blocks)
      .find((block): block is Extract<ContentBlock, { type: "p" }> => block.type === "p")?.text ?? null;
  const introQuoteText = buildEditorialPullQuote([
    car.summaryLong,
    car.summary,
    takeaways[0],
    introParagraph,
  ]);
  const numberFormatter = new Intl.NumberFormat("ja-JP");
  const yearlyCostLabel =
    (car.maintenanceSimulation?.yearlyRoughTotal ?? "").trim() ||
    (typeof car.maintenanceCostYenPerYear === "number" && Number.isFinite(car.maintenanceCostYenPerYear)
      ? `約${numberFormatter.format(car.maintenanceCostYenPerYear)}円 / 年`
      : "");
  const moneyLabel = (car.purchasePriceSafe ?? car.priceUsed ?? car.priceNew ?? "").trim();

  const quickFacts = [
    { label: "メーカー", value: car.maker },
    { label: "年式感", value: yearLabel ?? "" },
    { label: "ボディ", value: car.bodyType ?? "" },
    { label: "セグメント", value: car.segment ?? "" },
    { label: "燃料", value: car.fuel ?? "" },
    { label: "駆動", value: car.drive ?? "" },
    { label: "想定購入帯", value: moneyLabel },
    { label: "維持費の目安", value: yearlyCostLabel, note: car.costImpression ?? "" },
  ].filter((item) => item.value && item.value.trim().length > 0);

  const heroMetaLabel = [car.maker?.toUpperCase?.() ?? car.maker, yearLabel].filter(Boolean).join(" ");
  const heroDisplayTitle = buildHeroDisplayTitle(car);
  const heroTitleStyle = heroTitleLayout(heroDisplayTitle);
  const heroLead = pickHeroLead(car);
  const heroChips = uniqKeepOrder([car.bodyType ?? badge, car.drive ?? "", car.segment ?? ""]).slice(0, 3);

  return (
    <main className="detail-page">
      <DetailFixedBackground seed={params.slug} imageSrc={resolvedHeroImagePath} />

      <div id="top" />

      <JsonLd
        id={`ld-breadcrumb-car-${car.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: `${getSiteUrl()}/` },
            { "@type": "ListItem", position: 2, name: "車種", item: `${getSiteUrl()}/cars` },
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

      <section className="relative isolate overflow-hidden bg-[#070606] text-white">
        <div className="absolute inset-0">
          {ENABLE_CAR_IMAGES && safeHeroImage ? (
            <Image
              src={safeHeroImage}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover brightness-[0.95] contrast-[1.01] saturate-[0.94]"
              style={{ objectPosition: "50% 42%" }}
              priority
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(160deg,rgba(229,235,239,0.92),rgba(246,242,235,1))]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,6,0.02)_0%,rgba(7,6,6,0.08)_44%,rgba(7,6,6,0.24)_70%,rgba(7,6,6,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_34%)]" />
        </div>

        <div className="detail-shell relative flex min-h-[calc(100svh-64px)] items-end pb-12 pt-24 sm:pb-14 sm:pt-28 lg:min-h-[calc(100svh-72px)] lg:pb-20 lg:pt-32">
          <div className="w-full max-w-[30rem]">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-white/72 sm:text-[11px]">
              {heroMetaLabel || "車種プロフィール"}
            </p>
            <h1 className={`mt-2 break-words font-semibold text-white ${heroTitleStyle.className} ${heroTitleStyle.maxWidthClass}`}>
              {heroDisplayTitle}
            </h1>
            {heroLead ? (
              <p
                className="mt-4 max-w-[24rem] text-[14px] leading-[1.84] text-white/84 sm:text-[15px]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {heroLead}
              </p>
            ) : null}
            {heroChips.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {heroChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/24 bg-black/18 px-4 text-[11px] tracking-[0.08em] text-white/84 backdrop-blur-[2px]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="detail-shell pb-24 pt-10 sm:pt-12">
        <Breadcrumb
          tone="paper"
          items={[
            { label: "ホーム", href: "/" },
            { label: "車種", href: "/cars" },
            { label: title },
          ]}
        />

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_360px]">
          <div className="detail-card p-6 sm:p-8">
            <p className="detail-kicker">判断の要点</p>
            <div className="mt-5 detail-mini-grid detail-mini-grid-3">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="detail-fact-card">
                  <p className="detail-fact-label">{fact.label}</p>
                  <p className="detail-fact-value">{fact.value}</p>
                  {"note" in fact && fact.note ? <p className="detail-fact-note">{fact.note}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <section className="detail-card-muted p-6">
              <p className="detail-kicker">ナビゲーション</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={parentPillarHref} className="detail-button-secondary">
                  {parentPillarLabel}
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/compare" className="detail-button">
                  車種比較へ
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="detail-inline-meta mt-6">
                {car.maker ? (
                  <span>
                    <strong>メーカー</strong> {car.maker}
                  </span>
                ) : null}
                {car.bodyType ? (
                  <span>
                    <strong>ボディ</strong> {car.bodyType}
                  </span>
                ) : null}
                {car.segment ? (
                  <span>
                    <strong>立ち位置</strong> {car.segment}
                  </span>
                ) : null}
                {car.fuel ? (
                  <span>
                    <strong>燃料</strong> {car.fuel}
                  </span>
                ) : null}
              </div>
            </section>

            {takeaways.length > 0 ? (
              <section className="detail-card-wash p-6">
                <p className="detail-kicker">要点</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  押さえておきたい点
                </h2>
                <ul className="mt-5 space-y-4">
                  {takeaways.map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="mt-[0.72em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                      <TextWithInternalLinkCards
                        text={t}
                        linkIndex={linkIndex}
                        as="span"
                        className="flex-1"
                        textClassName="cb-stage-body cb-stage-body-strong"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </section>

        {introQuoteText ? (
          <section className="mt-8">
            <PullQuote text={introQuoteText} />
          </section>
        ) : null}

        {toc.length > 1 ? (
          <section className="mt-10">
            <InThisStoryToc items={toc} sticky />
          </section>
        ) : null}

        <section className="mt-12 space-y-8 cb-prose">
          {sections.map((sec, idx) => {
            const isBase = idx === 1;
            return (
              <div key={sec.id} className={`${getEditorialSurfaceClass(idx)} overflow-hidden`}>
                <div className="cb-stage-chapterTop">
                  <p className="cb-stage-chapterLabel"><span className="cb-stage-chapterNumber">{chapterNo(idx)}</span>.</p>
                  <h2 id={sec.id} className="cb-stage-chapterTitle scroll-mt-28">
                    {sec.title}
                  </h2>
                </div>

                <div className="mx-6 h-px bg-[rgba(14,12,10,0.08)]" />

                <div className="px-6 py-6 sm:px-8 sm:py-7">
                  {isBase && checkPoints.length > 0 ? (
                    <div className="detail-card-fog mb-6 p-5">
                      <p className="detail-kicker">確認ポイント</p>
                      <p className="mt-2 text-[16px] font-semibold text-[var(--text-primary)]">
                        購入前に確認したいこと
                      </p>
                      <ul className="mt-4 space-y-3">
                        {checkPoints.map((c) => (
                          <li key={c} className="flex items-start gap-3">
                            <span className="mt-[0.72em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                            <TextWithInternalLinkCards
                              text={c}
                              linkIndex={linkIndex}
                              as="span"
                              className="flex-1"
                              textClassName="cb-stage-body cb-stage-body-strong"
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
                            {normalizeEditorialHeadingLabel(b.text)}
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
                            textClassName="cb-stage-body cb-stage-body-strong"
                          />
                        );
                      }
                      if (b.type === "ul") {
                        return (
                          <ul key={i} className="cb-prose-block space-y-4">
                            {b.items.map((it) => (
                              <li key={it} className="flex items-start gap-3">
                                <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                                <TextWithInternalLinkCards
                                  text={it}
                                  linkIndex={linkIndex}
                                  as="span"
                                  className="flex-1"
                                  textClassName="cb-stage-body cb-stage-body-strong"
                                />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (b.type === "details") {
                        return (
                          <details
                            key={i}
                            className="group cb-prose-block overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)]"
                          >
                            <summary
                              className="cb-tap flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-[13px] text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(27,63,229,0.4)] [&::-webkit-details-marker]:hidden"
                            >
                              <span className="min-w-0 truncate">{b.summary}</span>
                              <span className="shrink-0 text-[10px] tracking-[0.22em] text-[var(--accent-strong)]">
                                <span className="group-open:hidden">開く</span>
                                <span className="hidden group-open:inline">閉じる</span>
                                <span className="ml-2 inline-block transition-transform duration-300 group-open:rotate-180">▾</span>
                              </span>
                            </summary>
                            <div className="mx-4 h-px bg-[rgba(14,12,10,0.08)]" />
                            <div className="px-4 py-4">
                              <ul className="space-y-4">
                                {b.items.map((it) => (
                                  <li key={it} className="flex items-start gap-3">
                                    <span className="mt-[0.75em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent-base)]" />
                                    <TextWithInternalLinkCards
                                      text={it}
                                      linkIndex={linkIndex}
                                      as="span"
                                      className="flex-1"
                                      textClassName="cb-stage-body cb-stage-body-strong"
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </details>
                        );
                      }
                      if (b.type === "table") {
                        return <ScrollSpecTable key={i} headers={b.headers} rows={b.rows} />;
                      }
                      if (b.type === "hr") {
                        return <div key={i} className="h-px bg-[rgba(14,12,10,0.08)]" />;
                      }
                      return null;
                    })}

                    {sec.title.includes("比較対象") && compareCars.length > 0 ? (
                      <div className="detail-card-muted mt-8 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[11px] tracking-[0.22em] text-[var(--text-tertiary)]">比較候補</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {showInlineCompareAdd ? (
                              <CompareAddButton
                                slug={car.slug}
                                source="car_compare_section"
                                mode="pill"
                                label="比較に追加"
                                className="!h-9 !rounded-full !border-[var(--border-default)] !bg-[rgba(251,248,243,0.9)] !px-4 !text-[11px] !tracking-[0.18em] !text-[var(--text-secondary)]"
                              />
                            ) : null}
                            <Link
                              href="/compare"
                              className="text-[11px] tracking-[0.22em] text-[var(--accent-strong)] hover:text-[var(--accent-base)]"
                            >
                              車種比較へ
                            </Link>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {compareCars.map((cc) => (
                            <div key={cc.slug} className="relative">
                              <ContentRowCard
                                href={`/cars/${cc.slug}`}
                                title={cc.titleJa ?? cc.title}
                                date={formatYearLabel(cc.releaseYear)}
                                badge={mapCarBadge(cc)}
                                badgeTone="accent"
                                hideImage={!ENABLE_CAR_IMAGES}
                                imageSrc={cc.heroImage ?? null}
                                excerpt={cc.summaryLong ?? cc.summary ?? null}
                              />
                              <div className="absolute right-3 top-3 z-20">
                                <CompareAddButton
                                  slug={cc.slug}
                                  source="car_compare_section"
                                  mode="icon"
                                  className="!h-9 !w-9 !rounded-full !border-[var(--border-default)] !bg-[rgba(251,248,243,0.96)] !text-[var(--text-secondary)] shadow-soft"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {sec.title.includes("関連リンク") ? (
                      <div className="detail-card-muted mt-8 p-4">
                        <p className="text-[11px] tracking-[0.22em] text-[var(--text-tertiary)]">次に読む</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {nextReads.map((nr) => (
                            <ContentRowCard
                              key={nr.href}
                              href={nr.href}
                              title={nr.title}
                              date={nr.date ?? null}
                              badge={nr.badge}
                              badgeTone="accent"
                              hideImage={!ENABLE_CAR_IMAGES}
                              imageSrc={nr.imageSrc ?? null}
                              posterVariant={
                                nr.badge === "ガイド"
                                  ? "guide"
                                  : nr.badge === "視点"
                                    ? "column"
                                    : "heritage"
                              }
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

        <section className="mt-14">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={backToCarsHref} className="detail-button-secondary">
              車種一覧
            </Link>
            <Link href="/compare" className="detail-button">
              車種比較
            </Link>
            {!showInlineCompareAdd ? (
              <CompareAddButton
                slug={car.slug}
                source="car_footer"
                mode="pill"
                label="比較に追加"
                className="!h-11 !rounded-full !border-[var(--border-default)] !bg-[rgba(251,248,243,0.9)] !px-5 !text-[11px] !tracking-[0.18em] !text-[var(--text-secondary)]"
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
