// app/guide/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";

import { getAllGuides, getGuideBySlug, type GuideItem } from "@/lib/guides";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllHeritage, getHeritagePreviewText, type HeritageItem } from "@/lib/heritage";
import { getLatestNews, type NewsItem } from "@/lib/news";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

// 【変更】共通CTAコンポーネントとSEOコンポーネントをインポート
import { CtaBlock } from "@/components/monetize/CtaBlock";
import { JsonLd } from "@/components/seo/JsonLd";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { CtaImpressionSentinel } from "@/components/analytics/CtaImpressionSentinel";
import { GuideOutline } from "@/components/guide/GuideOutline";
import { GuideQuickCards, type GuideQuickCard } from "@/components/guide/GuideQuickCards";
import { GuideHubShortcutShelf } from "@/components/guide/GuideHubShortcutShelf";
import { FixedGuideShelf } from "@/components/guide/FixedGuideShelf";
import { GuideTakeawayKit } from "@/components/guide/GuideTakeawayKit";

import type { CanonicalGuideCategoryKey } from "@/lib/guides/canonical";


type PageProps = {
  params: { slug: string };
};

type HeadingBlock = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ContentBlock =
  | { type: "heading"; heading: HeadingBlock }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "hr" };

type StepHeading = {
  id: string;
  stepNumber: number;
  label: string;
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

function normToken(v: unknown): string {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function scoreTagOverlap(base: string[], candidate?: string[] | null): number {
  if (!Array.isArray(candidate) || candidate.length === 0) return 0;
  if (!Array.isArray(base) || base.length === 0) return 0;

  const set = new Set(base.map(normToken).filter(Boolean));
  let hit = 0;
  for (const t of candidate) {
    if (set.has(normToken(t))) hit += 1;
  }
  return hit;
}

function newsSortTimeMs(n: NewsItem): number {
  const raw = n.publishedAt ?? n.updatedAt ?? (n as any).createdAt ?? "";
  if (!raw) return 0;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return 0;
  return d.getTime();
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

function buildHubShortcuts(key: CanonicalGuideCategoryKey, guideTitle: string, tags: string[] = []) {
  switch (key) {
    case "SELL": {
      const joined = `${guideTitle} ${(tags || []).join(" ")}`;
      const needsLoan = /残債|ローン|支払い|所有権|信販/.test(joined);

      const baseLinks = [
        {
          href: "/guide/hub-sell-compare",
          label: "比較の使い方（売却HUB）",
          description: "電話や比較条件で詰まらないための、最短ルート。",
          navId: "hub_shortcut_sell_compare",
        },
        {
          href: "/guide/hub-sell-price",
          label: "相場を掴む（売却HUB：相場）",
          description: "今の相場を取って、判断材料を作る。まずは“数字”から。",
          navId: "hub_shortcut_sell_price",
        },
        {
          href: "/guide/hub-sell-prepare",
          label: "減額を防ぐ（売却HUB：準備）",
          description: "書類・傷・残債など、詰まりやすい所だけ先に整える。",
          navId: "hub_shortcut_sell_prepare",
        },
        {
          href: "/guide/hub-sell",
          label: "全体像から（売却HUB）",
          description: "迷っている時ほど、全体像から。損しやすいポイントだけ先に潰す。",
          navId: "hub_shortcut_sell_overview",
        },
      ];

      if (!needsLoan) return baseLinks;

      // ローン/残債系の記事だけ、入口を差し替える（4枠を維持）
      return [
        {
          href: "/guide/hub-sell-loan",
          label: "残債ありの手放し（売却HUB）",
          description: "名義・所有権・入金までの詰まりポイントを先に整理。",
          navId: "hub_shortcut_sell_loan",
        },
        ...baseLinks.slice(0, 3),
      ];
    }

    case "BUY":
      return [
        {
          href: "/guide/hub-usedcar",
          label: "購入HUB（中古車）",
          description: "条件を絞って、見るべきポイントを揃えた状態で探す。",
          navId: "hub_shortcut_buy_usedcar",
        },
        {
          href: "/guide/hub-loan",
          label: "ローンHUB（支払い設計）",
          description: "月々の現実的なラインを先に決めて、後から崩れない形に。",
          navId: "hub_shortcut_buy_loan",
        },
      ];

    case "MONEY":
      return [
        {
          href: "/guide/hub-loan",
          label: "ローンHUB（支払いの土台）",
          description: "金利/返済/残価でブレる部分を先に押さえて、比較の精度を上げる。",
          navId: "hub_shortcut_money_loan",
        },
        {
          href: "/guide/maintenance-cost-simulation",
          label: "維持費の見積もり（シミュレーション）",
          description: "税金・車検・保険・消耗品をまとめて見て、月々の実感値を作る。",
          navId: "hub_shortcut_money_cost",
        },
        {
          href: "/guide/hub-shaken",
          label: "車検HUB（費用と流れ）",
          description: "車検の相場・内訳・当日の流れを押さえて、無駄な出費を減らす。",
          navId: "hub_shortcut_money_shaken",
        },
      ];

    case "INSURANCE":
      return [
        {
          href: "/guide/insurance",
          label: "保険HUB（比較の入口）",
          description: "条件を揃えて比較するだけで、保険料と納得感が両立しやすい。",
          navId: "hub_shortcut_insurance",
        },
      ];

    case "LEASE":
      return [
        {
          href: "/guide/lease",
          label: "リースHUB（条件の見方）",
          description: "月額の前に、契約条件の差が出る所だけ押さえる。",
          navId: "hub_shortcut_lease",
        },
        {
          href: "/guide/hub-loan",
          label: "購入（ローン）と比較する",
          description: "迷う時は、月々の目安を同じ条件で揃えて比べる。",
          navId: "hub_shortcut_lease_compare_loan",
        },
      ];

    case "GOODS":
    case "MAINTENANCE":
      return [
        {
          href: "/guide/hub-consumables",
          label: "消耗品HUB（交換目安）",
          description: "タイヤ/バッテリー/オイルなど、交換の目安を先に把握して判断を速くする。",
          navId: "hub_shortcut_consumables",
        },
        {
          href: "/guide/maintenance",
          label: "メンテ用品HUB（定番を揃える）",
          description: "日常で困りやすい順に、最低限の定番を薄く揃える。",
          navId: "hub_shortcut_maintenance",
        },
      ];

    case "TROUBLE":
      return [
        {
          href: "/guide/hub-import-trouble",
          label: "輸入車メンテ・故障HUB",
          description: "症状別の優先順位（止める/様子見）と費用感の当たりを作る。",
          navId: "hub_shortcut_trouble_import",
        },
        {
          href: "/guide/hub-consumables",
          label: "消耗品HUB（交換目安）",
          description: "原因が消耗品なら“交換の目安”で早く判断できる。",
          navId: "hub_shortcut_trouble_consumables",
        },
        {
          href: "/guide/hub-shaken",
          label: "車検HUB（費用と流れ）",
          description: "修理/点検の前に、見積もりと落とし穴を整理する。",
          navId: "hub_shortcut_trouble_shaken",
        },
        {
          href: "/guide/maintenance",
          label: "メンテ用品HUB（定番を揃える）",
          description: "トラブル予防と“困った時の最低限”を薄く揃える。",
          navId: "hub_shortcut_trouble_maintenance",
        },
      ];

    case "LIFE":
      return [
        {
          href: "/guide/hub-paperwork",
          label: "名義変更・必要書類HUB",
          description: "書類で止まりやすい所を先に整理して、手戻りを減らす。",
          navId: "hub_shortcut_life_paperwork",
        },
        {
          href: "/guide/hub-sell-prepare",
          label: "売却前の準備（段取り）",
          description: "書類・傷・残債など、詰まりポイントを先に整える。",
          navId: "hub_shortcut_life_sell_prepare",
        },
      ];

    default:
      return [];
  }
}

function normalizeCategoryRaw(category?: GuideItem["category"] | null): string {
  return (category ?? "").toString().trim();
}

function inferCategoryFromText(guide: GuideItem & { tags?: unknown; summary?: unknown }) {
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
  const raw = normalizeCategoryRaw(guide.category);
  if (!raw) return inferCategoryFromText(guide as any);

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
    case "LEASE":
    case "カーリース":
    case "リース":
      return "LEASE";
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
      return inferCategoryFromText(guide as any);
  }
}

function mapColumnCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術・歴史";
    default:
      return "コラム";
  }
}

function mapHeritageKindLabel(kind: HeritageItem["kind"] | null | undefined) {
  switch (kind) {
    case "ERA":
      return "ERA";
    case "BRAND":
      return "BRAND";
    case "CAR":
      return "CAR HISTORY";
    default:
      return "HERITAGE";
  }
}


function normalizeJapaneseTypography(input: string): string {
  if (!input) return "";

  // 1) 全角スペースを半角へ
  let out = input.replace(/　/g, " ");

  // 2) 日本語の間の不要な空白を除去（例: 外 装 / 初 期R35）
  const ja = "\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u3400-\u4DBF\uF900-\uFAFF\u30FC";
  const reJaJa = new RegExp(`([${ja}])\\s+([${ja}])`, "g");
  const reJaPunct = new RegExp(`([${ja}])\\s+([、。！？）」』】])`, "g");
  const rePunctJa = new RegExp(`([、。！？（「『【])\\s+([${ja}])`, "g");

  // 連鎖するケースがあるので少しだけ反復
  for (let i = 0; i < 4; i += 1) {
    const next = out.replace(reJaJa, "$1$2").replace(reJaPunct, "$1$2").replace(rePunctJa, "$1$2");
    if (next === out) break;
    out = next;
  }

  // 3) 連続スペースの圧縮（URL等は壊さない範囲）
  out = out.replace(/ {2,}/g, " ");

  return out.trim();
}

function shouldInsertSpaceBetween(prev: string, next: string): boolean {
  const p = prev.slice(-1);
  const n = next.slice(0, 1);
  if (!p || !n) return false;

  // 英数字が連続する場合のみスペースを維持（例: EV SUV / V8 5.0）
  const isAsciiWord = (ch: string) => /[A-Za-z0-9]/.test(ch);
  if (isAsciiWord(p) && isAsciiWord(n)) return true;

  // "..." と括弧の前など、英数字の後ろはスペースを残したいケース
  if (isAsciiWord(p) && /[\(\[]/.test(n)) return true;

  return false;
}

function joinParagraphLines(lines: string[]): string {
  const trimmed = lines.map((l) => l.trim()).filter(Boolean);
  if (trimmed.length === 0) return "";

  let out = trimmed[0] ?? "";
  for (let i = 1; i < trimmed.length; i += 1) {
    const seg = trimmed[i] ?? "";
    out += shouldInsertSpaceBetween(out, seg) ? ` ${seg}` : seg;
  }

  return normalizeJapaneseTypography(out);
}

function parseBody(body: string | undefined): {
  blocks: ContentBlock[];
  headings: HeadingBlock[];
} {
  const src = (body ?? "").replace(/^\uFEFF/, "");

  // NOTE:
  // - guides*.json の一部は本文の先頭に "# タイトル" を含む
  // - 詳細ページ側ですでに <h1>{guide.title}</h1> を描画しているため、
  //   先頭の H1 行は UI 上の「二重タイトル」になりやすい
  // - 先頭の H1（#）は目次/本文から除外する
  const rawLines = src.split(/\r?\n/);
  const lines: string[] = [];
  let skippedLeadingH1 = false;

  for (let i = 0; i < rawLines.length; i += 1) {
    const l = rawLines[i] ?? "";
    const trimmed = l.trim();

    if (!skippedLeadingH1) {
      if (!trimmed) continue;
      if (trimmed.startsWith("# ") || trimmed.startsWith("＃ ")) {
        skippedLeadingH1 = true;
        continue;
      }
      skippedLeadingH1 = true;
    }

    lines.push(l);
  }
  const blocks: ContentBlock[] = [];
  const headings: HeadingBlock[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: "paragraph",
        text: joinParagraphLines(currentParagraph),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({
        type: "list",
        items: [...currentList],
      });
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    // Markdown の水平線（---）
    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      return;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = normalizeJapaneseTypography(line.slice(4).trim());
      const heading: HeadingBlock = {
        id: `h3-${index}`,
        text,
        level: 3,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = normalizeJapaneseTypography(line.slice(3).trim());
      const heading: HeadingBlock = {
        id: `h2-${index}`,
        text,
        level: 2,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(normalizeJapaneseTypography(line.slice(2).trim()));
      return;
    }

    flushList();
    currentParagraph.push(normalizeJapaneseTypography(line));
  });

  flushParagraph();
  flushList();

  return { blocks, headings };
}

function stripMarkdownLite(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

type QuickSection = {
  id: string;
  title: string;
  bullets: string[];
  paragraphs: string[];
};

function buildQuickCardsFromBlocks(blocks: ContentBlock[]): GuideQuickCard[] {
  const sections: QuickSection[] = [];
  let current: QuickSection | null = null;

  const flush = () => {
    if (current) sections.push(current);
    current = null;
  };

  for (const block of blocks) {
    if (block.type === "heading" && block.heading.level === 2) {
      flush();
      current = {
        id: block.heading.id,
        title: block.heading.text,
        bullets: [],
        paragraphs: [],
      };
      continue;
    }

    if (!current) continue;

    if (block.type === "list" && current.bullets.length === 0) {
      current.bullets = block.items
        .map((it) => stripMarkdownLite(it))
        .filter(Boolean)
        .slice(0, 6);
      continue;
    }

    if (block.type === "paragraph" && current.paragraphs.length < 2) {
      const cleaned = stripMarkdownLite(block.text);
      if (cleaned) current.paragraphs.push(cleaned);
    }
  }
  flush();

  const usable = sections.filter((s) => s.bullets.length > 0 || s.paragraphs.length > 0);
  if (usable.length === 0) return [];

  const picked: QuickSection[] = [];
  const pick = (re: RegExp) => {
    const hit = usable.find((s) => re.test(s.title));
    if (hit && !picked.includes(hit)) picked.push(hit);
  };

  // 優先順位: 結論 → 手順/初動 → NG/注意 → 次に読む
  pick(/結論|先に結論|まとめ|要点/);
  pick(/最短|手順|流れ|まず|チェック|初動|やること|順番/);
  pick(/やってはいけない|注意|失敗|NG|危険/);
  pick(/次に読む|次にやる|関連/);

  // 足りなければ上から埋める
  for (const s of usable) {
    if (picked.length >= 3) break;
    if (!picked.includes(s)) picked.push(s);
  }

  const toBulletsFromParagraphs = (paras: string[]) => {
    const joined = paras.join(" ").replace(/\s+/g, " ").trim();
    if (!joined) return [];
    const parts = joined
      .split(/。/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((p) => (p.endsWith("。") ? p : `${p}。`));
    return parts;
  };

  return picked
    .slice(0, 3)
    .map((s) => {
      const bullets = (s.bullets.length > 0 ? s.bullets : toBulletsFromParagraphs(s.paragraphs)).slice(0, 4);
      return {
        id: s.id,
        title: s.title,
        bullets,
      } satisfies GuideQuickCard;
    })
    .filter((c) => c.bullets.length > 0);
}

function inlineNodes(text: string): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  const tokenRegex = /(\*\*.+?\*\*|https?:\/\/[^\s]+|\/(?:guide|cars|column|heritage)\/[^\s]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const start = match.index;
    const token = match[0];

    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      result.push(
        <span key={`${start}-bold`} className="font-semibold text-slate-900">
          {inner}
        </span>,
      );
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      result.push(
        <a
          key={`${start}-link`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-tiffany-400/80 underline-offset-2"
        >
          {token}
        </a>,
      );
    } else if (token.startsWith("/")) {
      const cleaned = token.replace(/[。、，,）)】』」]+$/g, "");
      const trail = token.slice(cleaned.length);

      result.push(
        <Link
          key={`${start}-internal`}
          href={cleaned}
          className="underline decoration-tiffany-400/80 underline-offset-2"
        >
          {cleaned}
        </Link>,
      );
      if (trail) result.push(trail);
    } else {
      result.push(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

async function getRelatedColumnsForGuide(guide: GuideItem): Promise<ColumnItem[]> {
  const allColumns = await getAllColumns();

  const guideWithMeta = guide as GuideItem & {
    category?: string | null;
    tags?: string[] | null;
  };

  const guideTags = new Set(guideWithMeta.tags ?? []);
  const guideCategory = (guideWithMeta.category ?? null) as string | null;

  const scored = allColumns.map((col) => {
    let score = 0;

    if (col.tags && guideTags.size > 0) {
      const overlap = col.tags.filter((t) => guideTags.has(t)).length;
      if (overlap > 0) {
        score += 2 + overlap * 0.2;
      }
    }

    if (
      guideCategory === "MONEY" ||
      guideCategory === "BUY" ||
      guideCategory === "MAINTENANCE_COST"
    ) {
      if (col.category === "MAINTENANCE" || col.category === "TECHNICAL") {
        score += 1;
      }
    } else if (guideCategory === "SELL") {
      if (col.category === "TECHNICAL") {
        score += 1.5;
      }
    }

    const haystack = `${col.title} ${col.summary ?? ""}`.toLowerCase();
    const words = `${guide.title} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.some((w) => haystack.includes(w))) {
      score += 0.5;
    }

    return { col, score };
  });

  const pickedByScore = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.col);

  if (pickedByScore.length > 0) {
    return pickedByScore;
  }

  let fallback = allColumns;

  if (guideCategory) {
    const byCategory = allColumns.filter(
      (col) => col.category === "TECHNICAL" || col.category === "MAINTENANCE",
    );
    if (byCategory.length > 0) {
      fallback = byCategory;
    }
  }

  const sortedFallback = [...fallback].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  return sortedFallback.slice(0, 4);
}

async function getRelatedCarsForGuide(
  guide: GuideItem & { relatedCarSlugs?: (string | null)[] },
): Promise<CarItem[]> {
  const allCars = await getAllCars();

  const slugs = (guide.relatedCarSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );
  if (slugs.length === 0) return [];

  const slugSet = new Set(slugs);

  const orderMap = new Map<string, number>();
  slugs.forEach((s, idx) => orderMap.set(s, idx));

  return allCars
    .filter((car) => car.slug && slugSet.has(car.slug))
    .sort((a, b) => {
      const ai = orderMap.get(a.slug ?? "") ?? 0;
      const bi = orderMap.get(b.slug ?? "") ?? 0;
      return ai - bi;
    });
}

async function getRelatedHeritageForGuide(
  guide: GuideItem & { relatedCarSlugs?: (string | null)[]; tags?: string[] | null },
): Promise<HeritageItem[]> {
  const allHeritage = await getAllHeritage();

  const guideCarSlugs = (guide.relatedCarSlugs ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  const guideCarSet = new Set(guideCarSlugs);
  const guideTags = new Set((guide.tags ?? []).filter((t) => typeof t === "string" && t.trim().length > 0));

  const scored = allHeritage.map((h) => {
    let score = 0;

    const hCarSlugs = ((h as any).relatedCarSlugs ?? []) as unknown[];
    const hCarOverlap =
      Array.isArray(hCarSlugs) && guideCarSet.size > 0
        ? hCarSlugs.filter((x) => typeof x === "string" && guideCarSet.has(x)).length
        : 0;

    if (hCarOverlap > 0) score += 3 + hCarOverlap * 0.5;

    const hTags = (h.tags ?? []) as unknown[];
    const hTagOverlap =
      Array.isArray(hTags) && guideTags.size > 0
        ? hTags.filter((x) => typeof x === "string" && guideTags.has(x)).length
        : 0;

    if (hTagOverlap > 0) score += 1 + hTagOverlap * 0.2;

    const haystack = `${h.title} ${getHeritagePreviewText(h, { maxChars: 280 })}`.toLowerCase();
    const words = `${guide.title} ${guide.summary ?? ""}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.some((w) => haystack.includes(w))) score += 0.4;

    return { h, score };
  });

  const picked = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.h);

  if (picked.length > 0) return picked;

  const sortedFallback = [...allHeritage].sort((a, b) => {
    const ta = a.publishedAt
      ? new Date(a.publishedAt).getTime()
      : a.updatedAt
      ? new Date(a.updatedAt).getTime()
      : 0;
    const tb = b.publishedAt
      ? new Date(b.publishedAt).getTime()
      : b.updatedAt
      ? new Date(b.updatedAt).getTime()
      : 0;
    return tb - ta;
  });

  return sortedFallback.slice(0, 4);
}

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  // NOTE: layout.tsx の title.template で末尾にブランドが付く。
  // ページ側では “ブランド抜きの title” を返す（重複防止）。
  const titleBase = buildGuideTitleBase(guide);
  const titleFull = withBrand(titleBase);
  const description = buildGuideDescription(guide);

  // 【追加】canonical URLの設定 (仕様書7.4)
  const url = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;

  // OGP 画像（なければデフォルト）
  const rawImage = ((guide as any).ogImageUrl ?? guide.heroImage ?? null) as
    | string
    | null;
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
  };
}

function extractStepHeadings(headings: HeadingBlock[]): StepHeading[] {
  const result: StepHeading[] = [];

  headings.forEach((h) => {
    const m = h.text.match(/^STEP\s*(\d+)[\.\:：]?\s*(.*)$/i);
    if (!m) return;

    const stepNumber = Number(m[1]);
    const rawLabel = m[2]?.trim() ?? "";
    const label = rawLabel || `STEP ${stepNumber}`;

    if (!Number.isNaN(stepNumber)) {
      result.push({
        id: h.id,
        stepNumber,
        label,
      });
    }
  });

  return result.sort((a, b) => a.stepNumber - b.stepNumber);
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guideRaw = await getGuideBySlug(params.slug);

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

  const { blocks, headings } = parseBody(guide.body);
  const quickCards = buildQuickCardsFromBlocks(blocks);
  const relatedColumns = await getRelatedColumnsForGuide(guide);
  const relatedCars = await getRelatedCarsForGuide(guide);
  const relatedHeritage = await getRelatedHeritageForGuide(guide);
  const guideTags = Array.isArray(guide.tags)
    ? guide.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : [];

  // 追加：ガイド内容に近い OFFICIAL NEWS（内部リンクを増やす目的）
  const relatedNews: NewsItem[] = await (async () => {
    const makerHints = new Set<string>();
    for (const car of relatedCars) {
      const mk = normToken(car.maker);
      if (mk) makerHints.add(mk);
    }

    const shouldRecommend = guideTags.length > 0 || makerHints.size > 0;
    if (!shouldRecommend) return [];

    try {
      const latest = await getLatestNews(200);

      const scored = latest
        .map((n) => {
          let score = 0;
          score += scoreTagOverlap(guideTags, n.tags) * 2;

          const makerKey = normToken(n.maker);
          if (makerKey && makerHints.has(makerKey)) score += 2;

          return { n, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          return newsSortTimeMs(b.n) - newsSortTimeMs(a.n);
        })
        .slice(0, 4)
        .map((x) => x.n);

      return scored;
    } catch {
      return [];
    }
  })();
  const stepHeadings = extractStepHeadings(headings);

  const relatedCarSlugs = (guide.relatedCarSlugs ?? []).filter(
    (slug): slug is string => typeof slug === "string" && slug.trim().length > 0,
  );

  const allGuides = await getAllGuides();
  const internalLinkSlugs = (guide.internalLinks ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
  const internalRelatedGuides = internalLinkSlugs
    .map((slug) => allGuides.find((g) => g.slug === slug))
    .filter((g): g is GuideItem => Boolean(g));

  // CtaBlockへの移行により resolveAffiliateLinksForGuide は削除
  // const affiliateLinksResolved = ...

  const monetizeKey = (guide.monetizeKey ?? "car_search_conditions") as any;

  const categoryKey = getGuideCategoryKey(guide as GuideItem);
  const hubShortcuts = buildHubShortcuts(categoryKey, guide.title, guide.tags);

  const primaryDate = guide.publishedAt ?? guide.updatedAt;

  // 【追加】構造化データ (仕様書7.4)
  const pageUrl = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;

  const rawImage = (guide as any).ogImageUrl ?? (guide as any).heroImage ?? null;
  const schemaImage = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

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
        name: "GUIDE",
        item: `${getSiteUrl()}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.titleJa ?? guide.title,
        item: pageUrl,
      },
    ],
  };

  const structuredData = {
    headline: guide.titleJa ?? guide.title,
    description:
      (guide as any).seoDescription ??
      guide.summary ??
      "CAR BOUTIQUEのガイド記事です。",
    datePublished: guide.publishedAt ?? undefined,
    dateModified: guide.updatedAt ?? guide.publishedAt ?? undefined,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: [schemaImage],
    author: {
      "@type": "Organization",
      name: "CAR BOUTIQUE",
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE",
      url: getSiteUrl(),
    },
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 【追加】構造化データ出力 */}
      <JsonLd id="jsonld-guide-detail-breadcrumb" data={breadcrumbData} />
      <JsonLd id="jsonld-guide-detail-article" type="Article" data={structuredData} />
      
      <ScrollDepthTracker />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-0 top-0 h-[40vh] w-full bg-gradient-to-b from-white/90 via-white/70 to-transparent" />
        <div className="absolute -left-[18%] top-[10%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.15),_transparent_70%)] blur-[110px]" />
        <div className="absolute -right-[20%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.22),_transparent_75%)] blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
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
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                GUIDE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>{mapGuideCategoryLabel(getGuideCategoryKey(guide))}</span>
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
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] tracking-[0.18em] text-slate-100 shadow-soft">
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
                        className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] tracking-[0.12em]"
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

          <Reveal delay={260}>
            <div className="mt-4 max-w-3xl">
              <GuideQuickCards categoryKey={getGuideCategoryKey(guide)} cards={quickCards} />
            </div>
          </Reveal>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <section className="w-full lg:w-[68%]">
            <GlassCard
              variant="standard"
              magnetic={false}
              padding="none"
              className="border border-slate-200/80 bg-white/95 shadow-soft-card"
            >
              <article className="p-5 sm:p-7">
                <GuideOutline categoryLabel={mapGuideCategoryLabel(getGuideCategoryKey(guide))} />

                {stepHeadings.length > 0 && (
                  <section className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-4 text-[11px] shadow-soft-sm sm:px-5 sm:py-5">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                      GUIDE STEPS
                    </p>
                    <div className="relative pl-4">
                      <div className="absolute bottom-1 left-[10px] top-1 w-px bg-gradient-to-b from-tiffany-300/40 via-slate-200/80 to-transparent" />
                      <ol className="space-y-3">
                        {stepHeadings.map((s, idx) => (
                          <li key={s.id} className="relative flex gap-3">
                            <div className="relative mt-[2px] flex h-5 w-5 items-center justify-center">
                              <div className="absolute h-5 w-5 rounded-full bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.35)]" />
                              <div className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-tiffany-400 to-tiffany-600" />
                            </div>
                            <a href={`#${s.id}`} className="group inline-flex flex-1 flex-col gap-0.5">
                              <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                                STEP {s.stepNumber.toString().padStart(2, "0")}
                              </span>
                              <span className="text-[11px] font-medium text-slate-800 group-hover:text-tiffany-700">
                                {s.label}
                              </span>
                              {idx === 0 && (
                                <span className="mt-0.5 text-[11px] text-slate-400">
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
                  {blocks.map((block, index) => {
                    if (block.type === "heading") {
                      const Tag = block.heading.level === 2 ? "h2" : "h3";

                      const isStepHeading = /^STEP\s*\d+/i.test(block.heading.text);

                      const baseClass = isStepHeading
                        ? "mt-10 mb-4 text-sm font-semibold tracking-[0.18em] text-slate-800 sm:text-[14px] uppercase"
                        : block.heading.level === 2
                        ? "mt-12 mb-5 font-serif text-xl font-medium text-slate-900 sm:text-2xl"
                        : "mt-8 mb-3 text-base font-semibold tracking-[0.04em] text-slate-800";

                      return (
                        <Reveal key={block.heading.id} delay={index === 0 ? 0 : 60}>
                          <Tag id={block.heading.id} className={baseClass}>
                            {block.heading.text}
                          </Tag>
                        </Reveal>
                      );
                    }

                    if (block.type === "hr") {
                      return (
                        <Reveal key={`hr-${index}`} delay={40}>
                          <hr className="my-8 border-slate-200/70" />
                        </Reveal>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <Reveal key={`list-${index}`} delay={80}>
                          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-slate-800">
                            {block.items.map((item) => {
                              const m = item.match(
                                /^(.+?)(?:：|:)\s*(\/(?:guide|cars|column|heritage)\/[\w\-./%]+)$/,
                              );

                              if (m) {
                                const label = m[1]?.trim() ?? item;
                                const href = m[2]?.trim() ?? "";

                                return (
                                  <li key={item} className="flex gap-2">
                                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-tiffany-400" />
                                    <Link
                                      href={href}
                                      className="underline decoration-tiffany-400/80 underline-offset-2"
                                    >
                                      {label}
                                    </Link>
                                  </li>
                                );
                              }

                              return (
                                <li key={item} className="flex gap-2">
                                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-tiffany-400" />
                                  <span>{inlineNodes(item)}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </Reveal>
                      );
                    }

                    return (
                      <Reveal key={`p-${index}`} delay={60}>
                        <p className="mt-4 text-[15px] leading-relaxed text-slate-800 sm:text-[16px]">
                          {inlineNodes(block.text)}
                        </p>
                      </Reveal>
                    );
                  })}
                </div>
              </article>
            </GlassCard>

            <GuideTakeawayKit categoryKey={categoryKey} guideTitle={guide.title} tags={guide.tags} />

            {hubShortcuts.length > 0 && (
              <div className="mt-8">
                <GuideHubShortcutShelf
                  title="次の行動（HUB）"
                  links={hubShortcuts}
                />
              </div>
            )}
            
            {/* 【変更】末尾CTA (仕様書4.4.1 - 外部への出口) */}
            <div className="mt-8">
              <CtaImpressionSentinel
                pageType="guide"
                contentId={guide.slug}
                monetizeKey={monetizeKey}
                position="bottom"
                ctaId={`guide_${guide.slug}_${monetizeKey}_bottom`}
                variant="default"
              >
                <CtaBlock
                  monetizeKey={monetizeKey}
                  pageType="guide"
                  contentId={guide.slug}
                  position="bottom"
                />
              </CtaImpressionSentinel>
            </div>

            {internalRelatedGuides.length > 0 && (
              <section className="mt-10 lg:mt-12">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h2 className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                    このガイドと一緒に読まれているGUIDE
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {internalRelatedGuides.map((g) => (
                    <Link key={g.slug} href={`/guide/${encodeURIComponent(g.slug)}`}>
                      <GlassCard className="group h-full border border-slate-200/80 bg-white/92 p-4 text-[11px] shadow-soft-sm transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:bg-white">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {mapGuideCategoryLabel(getGuideCategoryKey(g as GuideItem))}
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

            {/* 固定導線：GUIDE HUB（保険 / 売却 / 維持費） */}
            <div className="mt-10">
              <FixedGuideShelf />
            </div>

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
                <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-slate-400">
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

                <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
                  一度読み切ったあとに気になる見出しだけをもう一度辿り直せるようにする前提の簡易的な目次です。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-[11px] text-slate-600 shadow-sm">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-slate-400">
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
          <section className="mt-16 lg:mt-20">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連する車種
              </h2>
              <Link
                href="/cars"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                CARS一覧へ
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedCars.map((car) => (
                <Link key={car.slug} href={`/cars/${encodeURIComponent(car.slug)}`}>
                  <GlassCard className="group h-full border border-slate-200/80 bg-white/90 p-4 text-[11px] shadow-soft-sm transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">
                          {car.maker}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-slate-900 group-hover:underline">
                          {car.name}
                        </p>
                      </div>
                      {car.releaseYear && (
                        <span className="text-[11px] text-slate-400">{car.releaseYear}年頃</span>
                      )}
                    </div>
                    {car.summary && (
                      <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-slate-600">
                        {car.summary}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
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
          <section className="mt-20 lg:mt-24">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連するコラム
              </h2>
              <Link
                href="/column"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedColumns.map((col) => (
                <Link key={col.id} href={`/column/${encodeURIComponent(col.slug)}`}>
                  <GlassCard className="h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                        {mapColumnCategoryLabel(col.category)}
                      </span>
                      {col.readMinutes && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          約{col.readMinutes}分
                        </span>
                      )}
                      {col.publishedAt && (
                        <span className="ml-auto text-[11px] text-slate-400">
                          {formatDate(col.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                      {col.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                      {col.summary}
                    </p>

                    {col.tags && col.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-500">
                        {col.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-50 px-2 py-1">
                            {tag}
                          </span>
                        ))}
                        {col.tags.length > 3 && (
                          <span className="rounded-full bg-slate-50 px-2 py-1">
                            +{col.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedHeritage.length > 0 && (
          <section className="mt-20 lg:mt-24">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連するHERITAGE
              </h2>
              <Link
                href="/heritage"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                HERITAGE一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedHeritage.map((h) => {
                const preview = getHeritagePreviewText(h, { maxChars: 160 });

                return (
                  <Link key={h.id} href={`/heritage/${encodeURIComponent(h.slug)}`}>
                    <GlassCard className="h-full border border-slate-200/80 bg-white/92 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {mapHeritageKindLabel(h.kind)}
                        </span>
                        {(h as any).brandName && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {(h as any).brandName}
                          </span>
                        )}
                        {h.publishedAt && (
                          <span className="ml-auto text-[11px] text-slate-400">
                            {formatDate(h.publishedAt)}
                          </span>
                        )}
                      </div>

                      <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                        {h.title}
                      </h3>

                      {preview && (
                        <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                          {preview}
                        </p>
                      )}
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {relatedNews.length > 0 && (
          <section className="mt-20 lg:mt-24">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連するOFFICIAL NEWS
              </h2>
              <Link
                href="/news"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                NEWS一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedNews.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || `/news/${encodeURIComponent(n.id)}`}
                >
                  <GlassCard className="h-full border border-slate-200/80 bg-white/92 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {n.maker && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {n.maker}
                        </span>
                      )}
                      {n.category && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {n.category}
                        </span>
                      )}
                      {n.publishedAt && (
                        <span className="ml-auto text-[11px] text-slate-400">
                          {formatDate(n.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                      {n.titleJa ?? n.title}
                    </h3>

                    {(n.excerpt || n.commentJa) && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                        {n.excerpt ?? n.commentJa}
                      </p>
                    )}
                  </GlassCard>
                </Link>
              ))}
            </div>

            {guideTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {guideTags.slice(0, 2).map((tag) => (
                  <Link
                    key={tag}
                    href={`/news?tag=${encodeURIComponent(tag)}`}
                    rel="nofollow"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] text-slate-600 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-200 hover:text-tiffany-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                    <span>#{tag} のNEWS</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}