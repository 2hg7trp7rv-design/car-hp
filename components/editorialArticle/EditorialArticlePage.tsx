import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import type {
  GuideActionBox,
  GuideAuthorProfile,
  GuideBreadcrumbItem,
  GuideDetailBlock,
  GuideDetailSection,
  GuideFaqItem,
} from "@/lib/content-types";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import { EditorialArticleMotionClient } from "@/components/editorialArticle/EditorialArticleMotionClient";

import styles from "@/components/editorialArticle/editorial-article.module.css";

export type EditorialRelatedItem = {
  slug: string;
  href: string;
  metaLabel: string;
  title: string;
  summary: string;
  date?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
};

export type EditorialArticleLabels = {
  relatedTitle: string;
  relatedAriaLabel?: string;
  sourcesTitle?: string;
  updateTitle?: string;
  footerListHref: string;
  footerListLabel: string;
};

export type EditorialArticleViewModel = {
  title: string;
  eyebrowLabel: string;
  breadcrumbTrail: GuideBreadcrumbItem[];
  author: GuideAuthorProfile;
  lead?: string | null;
  body?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readMinutes?: number | null;
  keyPoints?: string[] | null;
  checkpoints?: string[] | null;
  sections?: GuideDetailSection[] | null;
  faq?: GuideFaqItem[] | null;
  actionBox?: GuideActionBox | null;
  sources?: string[] | null;
  updateText?: string | null;
  relatedItems?: EditorialRelatedItem[] | null;
  heroImage?: string | null;
  heroAlt?: string | null;
  suppressHeroVisual?: boolean | null;
};

export type EditorialArticlePageProps = {
  article: EditorialArticleViewModel;
  labels: EditorialArticleLabels;
  linkIndex: Record<string, InternalLinkMeta>;
};

type ArticleKind = "GUIDE" | "COLUMN";

const SUSPENSION_ARTICLE_HERO_IMAGE = "/images/cbj/guides/suspension-system-map-article-41.webp";
const SUSPENSION_ARTICLE_HERO_ALT = "車のサスペンション構造を、タイヤ、スプリング、ダンパー、サブフレーム、スタビライザーに分けて示した図解";

type EditorialSection = GuideDetailSection & {
  id: string;
  displayTitle: string;
  chapterLabel: string;
};

function compactText(text?: string | null): string {
  return String(text ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function slugifyId(text?: string | null): string {
  return String(text ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function resolveArticleKind(labels: EditorialArticleLabels): ArticleKind {
  return labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE";
}
function normalizeTagForCompare(value?: string | null): string {
  return compactText(value)
    .toUpperCase()
    .replace(/／.+$/u, "")
    .replace(/実用ガイド|考察コラム|ガイド|コラム/u, (matched) =>
      matched === "コラム" || matched === "考察コラム" ? "COLUMN" : "GUIDE",
    );
}

function buildHeaderTags(articleKind: ArticleKind, eyebrowLabel?: string | null): { label: string; variant: "teal" | "soft" | "ghost" }[] {
  const baseTags: { label: string; variant: "teal" | "soft" | "ghost" }[] = [
    { label: articleKind, variant: "teal" },
    { label: String(eyebrowLabel ?? "").trim(), variant: "soft" },
    { label: articleKind === "COLUMN" ? "EDITORIAL" : "CAR BASICS", variant: "ghost" },
  ];
  const seen = new Set<string>();
  const out: { label: string; variant: "teal" | "soft" | "ghost" }[] = [];
  for (const item of baseTags) {
    if (!item.label) continue;
    const key = normalizeTagForCompare(item.label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function headerTagClassName(variant: "teal" | "soft" | "ghost"): string {
  if (variant === "teal") return `${styles.tag} ${styles.tagTeal}`;
  if (variant === "ghost") return `${styles.tag} ${styles.tagGhost}`;
  return `${styles.tag} ${styles.tagSoft}`;
}


function stripLeadingDisplayNumber(text?: string | null): string {
  return String(text ?? "")
    .replace(
      /^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩])\s*[\).）．.、:：-]?\s*/u,
      "",
    )
    .replace(/^\s*\d{1,2}\s*[\).）．.、:：-]?\s*/u, "")
    .trim();
}

function normalizeSectionTitle(title?: string | null, index = 0): string {
  const stripped = stripLeadingDisplayNumber(title);
  if (index === 0 && (!stripped || /結論|要点|先に/u.test(stripped)))
    return "先に結論";
  return stripped || `セクション${index + 1}`;
}

function resolveChapterLabel(
  title?: string | null,
  index = 0,
  kind: ArticleKind = "GUIDE",
): string {
  const text = compactText(title);
  if (index === 0 || /結論|先に|要点/.test(text))
    return kind === "COLUMN" ? "POINT" : "CONCLUSION";
  if (/まとめ|最後/.test(text)) return "SUMMARY";
  if (/失敗|危険|注意|やってはいけない|リスク|不快|トラブル|底づき|フルバンプ|バンプタッチ|ストローク/.test(text))
    return kind === "COLUMN" ? "COUNTERPOINT" : "FAILURE PATTERN";
  if (/ダンパー|減衰|揺れの収まり|収まり方/.test(text))
    return kind === "COLUMN" ? "BACKGROUND" : "DAMPER";
  if (/タイヤ|空気圧|扁平|摩耗/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "TIRE & PRESSURE";
  if (/柔らかい|硬い|乗り心地|乗り味|バランスの良い|接地/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "RIDE FEEL";
  if (/確認|試乗|中古|チェック|見る|相談|症状|違和感/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "TEST DRIVE";
  if (/費用|金額|保険|税|ローン|維持費|支払い/.test(text)) return "COST / RISK";
  if (/仕組み|構造|部品|方式|何で決まる|なぜ|理由/.test(text))
    return kind === "COLUMN" ? "BACKGROUND" : "MECHANISM";
  if (/比較|違い|選び方|選ぶ/.test(text))
    return kind === "COLUMN" ? "VIEWPOINT" : "CHECK POINT";
  return kind === "COLUMN" ? "VIEWPOINT" : "CHECK POINT";
}

function splitMarkdownTableRow(line: string): string[] {
  let cells = String(line ?? "")
    .trim()
    .split("|")
    .map((cell) => cell.trim());
  if (cells[0] === "") cells = cells.slice(1);
  if (cells[cells.length - 1] === "") cells = cells.slice(0, -1);
  return cells;
}

function isMarkdownSeparator(line: string): boolean {
  const cells = splitMarkdownTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function markdownBodyToSections(
  body?: string | null,
  kind: ArticleKind = "GUIDE",
): GuideDetailSection[] {
  const source = String(body ?? "").trim();
  if (!source) return [];

  const lines = source.split(/\r?\n/u);
  const sections: GuideDetailSection[] = [];
  let current: GuideDetailSection = {
    id: "conclusion",
    title: kind === "COLUMN" ? "要点" : "先に結論",
    blocks: [],
  };

  const pushSection = () => {
    if (current.blocks.length > 0 || sections.length === 0) {
      current.id =
        current.id ||
        slugifyId(current.title) ||
        `section-${sections.length + 1}`;
      sections.push(current);
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      i += 1;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/u);
    if (h2) {
      if (current.blocks.length > 0) pushSection();
      const title = h2[1].trim();
      current = { id: slugifyId(title), title, blocks: [] };
      i += 1;
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/u);
    if (h3) {
      current.blocks.push({
        type: "subheading",
        title: h3[1].trim(),
        level: 3,
      });
      i += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s+/.test(lines[i] ?? "")) {
        quoteLines.push(
          String(lines[i] ?? "")
            .replace(/^>\s+/, "")
            .trim(),
        );
        i += 1;
      }
      const text = quoteLines.join(" ").trim();
      if (text) current.blocks.push({ type: "quote", text });
      continue;
    }

    if (/^---+$/.test(line)) {
      current.blocks.push({ type: "divider" });
      i += 1;
      continue;
    }

    if (line.startsWith("![")) {
      const m = line.match(/^!\[(.*?)\]\((.*?)\)$/u);
      if (m)
        current.blocks.push({
          type: "image",
          alt: m[1] ?? "",
          src: m[2] ?? "",
        });
      i += 1;
      continue;
    }

    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      isMarkdownSeparator(lines[i + 1] ?? "")
    ) {
      const headers = splitMarkdownTableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").includes("|")) {
        const row = splitMarkdownTableRow(lines[i] ?? "");
        if (row.length) rows.push(row);
        i += 1;
      }
      current.blocks.push({ type: "comparisonTable", headers, rows });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push(
          String(lines[i] ?? "")
            .replace(/^[-*]\s+/, "")
            .trim(),
        );
        i += 1;
      }
      current.blocks.push({ type: "list", items });
      continue;
    }

    let paragraph = line;
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^##\s+/.test(lines[i] ?? "") &&
      !/^###\s+/.test(lines[i] ?? "") &&
      !/^[-*]\s+/.test(lines[i] ?? "") &&
      !/^>\s+/.test(lines[i] ?? "") &&
      !/^---+$/.test(String(lines[i] ?? "").trim()) &&
      !String(lines[i] ?? "")
        .trim()
        .startsWith("![") &&
      !(
        String(lines[i] ?? "").includes("|") &&
        isMarkdownSeparator(lines[i + 1] ?? "")
      )
    ) {
      paragraph += ` ${String(lines[i] ?? "").trim()}`;
      i += 1;
    }
    current.blocks.push({ type: "paragraph", text: paragraph });
  }

  if (current.blocks.length > 0) pushSection();
  return sections;
}

function normalizeSections(
  article: EditorialArticleViewModel,
  kind: ArticleKind,
): EditorialSection[] {
  const rawSections =
    article.sections && article.sections.length > 0
      ? article.sections
      : markdownBodyToSections(article.body, kind);

  return rawSections.map((section, index) => {
    const title = normalizeSectionTitle(section.title, index);
    const displayTitle =
      String(section.displayTitle ?? "").trim() || title;
    const id = section.id?.trim() || slugifyId(title) || `section-${index + 1}`;
    return {
      ...section,
      id,
      title,
      displayTitle,
      chapterLabel:
        section.chapterLabel?.trim() ||
        resolveChapterLabel(title, index, kind),
    };
  });
}

function sourceLabel(source: string): string {
  return source
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[?#].*$/u, "")
    .replace(/\/$/u, "");
}

function sentenceClass(flow?: string | null): string {
  return flow === "natural" ? styles.paragraphNatural : styles.paragraph;
}

function RichText({
  text,
  linkIndex,
  as = "p",
  className,
  highlights,
}: {
  text: string;
  linkIndex: Record<string, InternalLinkMeta>;
  as?: "p" | "span";
  className?: string;
  highlights?: string[] | null;
}) {
  return (
    <TextWithInternalLinkCards
      text={text}
      linkIndex={linkIndex}
      as={as}
      className={styles.richTextWrap}
      textClassName={className ?? styles.paragraph}
      cardsClassName={styles.inlineCards}
      highlights={highlights ?? undefined}
    />
  );
}

function splitSentenceLines(text: string): string[] {
  return String(text ?? "")
    .replace(/([。！？])(?!(?:\n|$))/gu, "$1\n")
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderSentenceText(text: string): ReactNode {
  const lines = splitSentenceLines(text);
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="cbj-sentence-line">
          {renderInlineMarkdown(line)}
        </span>
      ))}
    </>
  );
}

function renderTitleLines(lines: ReactNode[]) {
  const flattened = lines.flatMap((line) =>
    typeof line === "string" ? splitSentenceLines(line) : [line],
  );
  return flattened.map((line, index) => (
    <span key={index} className={styles.titleLine}>
      {line}
    </span>
  ));
}

function renderInlineText(text: string): ReactNode {
  return renderSentenceText(text);
}

function renderParagraph(
  block: Extract<GuideDetailBlock, { type: "paragraph" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const isLead = index === 0;
  return (
    <RichText
      key={index}
      text={block.text}
      linkIndex={linkIndex}
      className={isLead ? styles.leadParagraph : sentenceClass(block.flow)}
      highlights={block.highlights}
    />
  );
}

function renderList(
  items: string[],
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
  compact = false,
) {
  if (!items.length) return null;
  return (
    <div
      key={index}
      className={compact ? styles.listCardCompact : styles.listCard}
      data-cbj-reveal
    >
      <div className={styles.listGrid}>
        {items.map((item, itemIndex) => (
          <article key={itemIndex} className={styles.listItem}>
            <span className={styles.listNumber}>
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <RichText
              text={item}
              linkIndex={linkIndex}
              as="span"
              className={styles.listItemText}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

type FigureVisualKind =
  | "suspension-components"
  | "damper-weak"
  | "damper-strong"
  | "suspension-types"
  | "suspension-soft"
  | "suspension-hard"
  | "suspension-balanced"
  | "suspension-failure"
  | "air-measurement"
  | "air-cleaner-risk"
  | "tv-canceller-can"
  | "diagnostic-scan";

function resolveFigureVisualKind(
  block: Extract<GuideDetailBlock, { type: "image" }>,
): FigureVisualKind | null {
  const text = compactText(`${block.src} ${block.alt}`);
  if (/suspension-components|タイヤ、スプリング、ダンパー|部品ビジュアル/.test(text)) return "suspension-components";
  if (/damper-weak|減衰力が弱/.test(text)) return "damper-weak";
  if (/damper-strong|減衰力が強すぎ/.test(text)) return "damper-strong";
  if (/suspension-types|ストラット|ダブルウィッシュボーン|マルチリンク/.test(text)) return "suspension-types";
  if (/suspension-soft|柔らかい足回り/.test(text)) return "suspension-soft";
  if (/suspension-hard|硬い足回り/.test(text)) return "suspension-hard";
  if (/balanced|バランスの良い足回り/.test(text)) return "suspension-balanced";
  if (/failure-flow|ストローク|バンプタッチ|接地感低下/.test(text)) return "suspension-failure";
  if (/air-measurement|Lジェトロ|Dジェトロ|純正ボックス/.test(text)) return "air-measurement";
  if (/air-cleaner-risk|剥き出し型エアクリーナー|MAF|熱源|遮熱/.test(text)) return "air-cleaner-risk";
  if (/tv-canceller-can|CAN通信|矛盾/.test(text)) return "tv-canceller-can";
  if (/diagnostic-scan|OBD2|通信エラー/.test(text)) return "diagnostic-scan";
  return null;
}

function figureCaption(block: Extract<GuideDetailBlock, { type: "image" }>, kind: FigureVisualKind | null): string {
  const explicitLabel = String(block.label ?? "").trim();
  if (explicitLabel) return explicitLabel;
  if (block.src.includes("suspension-damping-comparison-article-41")) return "ダンパーの違いは、段差後の揺れ方とタイヤの接地感に出る。";
  if (block.src.includes("tire-pressure-contact-patch-article-41")) return "空気圧が変わると、接地面と乗り味の出方も変わる。";
  if (kind === "suspension-components") return "足回りは、タイヤ・スプリング・ダンパー・ブッシュ・ボディ側の受け止め方で印象が変わる。";
  if (kind === "damper-weak") return "減衰力が弱いと、段差後の上下動が長く残りやすい。";
  if (kind === "damper-strong") return "減衰力を強めすぎると、足が動く前に入力が車体へ入りやすい。";
  if (kind === "suspension-types") return "方式そのものより、タイヤの動きをどう管理するかを見る。";
  if (kind === "suspension-soft") return "柔らかい足は入力を丸めやすいが、揺れが残ると不安につながる。";
  if (kind === "suspension-hard") return "硬い足は姿勢変化を抑えやすいが、荒れた路面で跳ねると逆効果になる。";
  if (kind === "suspension-balanced") return "良い足は、入力をいなしながら短く自然に収める。";
  if (kind === "suspension-failure") return "車高・ストローク・バンプタッチ・接地感を一つの流れで見る。";
  if (kind === "air-measurement") return "吸入空気量の測り方が変わると、社外インテークの影響も変わる。";
  if (kind === "air-cleaner-risk") return "剥き出し型は、熱源・センサー位置・遮熱の条件でリスクが変わる。";
  if (kind === "tv-canceller-can") return "現代車の制御は、単独の映像信号ではなく車両ネットワーク全体とつながっている。";
  if (kind === "diagnostic-scan") return "通信エラーは、症状が出る前に診断履歴として残ることがある。";
  return String(block.alt ?? "").replace(/の?(?:構造)?ビジュアル|の様子|のイメージ図/gu, "").trim();
}

function renderWavePath(kind: FigureVisualKind) {
  if (kind === "damper-weak") {
    return <path d="M72 210 C128 70, 190 340, 260 205 S398 70, 470 205 S602 328, 676 210" fill="none" stroke="#ff5b3a" strokeWidth="4" strokeLinecap="round" />;
  }
  if (kind === "damper-strong") {
    return <path d="M96 210 L270 82 L330 318 L385 145 L422 210 L684 210" fill="none" stroke="#0d1216" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />;
  }
  return <path d="M96 210 C180 90, 292 318, 392 210 C460 150, 532 150, 680 210" fill="none" stroke="#00708d" strokeWidth="4" strokeLinecap="round" />;
}

function renderArticleVisualSvg(kind: FigureVisualKind) {
  if (kind === "damper-weak" || kind === "damper-strong" || kind === "suspension-balanced") {
    const label = kind === "damper-weak" ? "DAMPER / WEAK" : kind === "damper-strong" ? "DAMPER / TOO STRONG" : "DAMPER / BALANCED";
    const sub = kind === "damper-weak" ? "揺れが残る" : kind === "damper-strong" ? "入力が直接入る" : "短く自然に収まる";
    return (
      <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect width="800" height="420" fill="#f4f9fa" />
        <g stroke="#d7e5e9" strokeWidth="1"><path d="M72 210 H728" strokeDasharray="4 7" /><path d="M72 140 H728" opacity="0.45" /><path d="M72 280 H728" opacity="0.45" /></g>
        {renderWavePath(kind)}
        <g fill="#064e63" fontFamily="Manrope, Noto Sans JP" textAnchor="middle"><text x="400" y="68" fontSize="17" fontWeight="800" letterSpacing="5">{label}</text><text x="400" y="352" fontSize="18" fontWeight="700">{sub}</text></g>
      </svg>
    );
  }
  if (kind === "suspension-components") {
    return (
      <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect width="800" height="460" fill="#f4f9fa" /><path d="M140 205 Q400 104 660 205 L640 244 H160 Z" fill="#fff" stroke="#00708d" strokeWidth="3" /><rect x="170" y="244" width="460" height="24" rx="5" fill="#e8f3f5" stroke="#00708d" strokeWidth="2" /><g stroke="#00708d" strokeWidth="3" fill="none"><path d="M224 270 v76" /><path d="M574 270 v76" /><path d="M210 282 q14 8 28 0 q-14 16 -28 0 q14 24 28 0 q-14 32 -28 0" /><path d="M560 282 q14 8 28 0 q-14 16 -28 0 q14 24 28 0 q-14 32 -28 0" /></g><circle cx="224" cy="366" r="44" fill="#0d1216" stroke="#00708d" strokeWidth="3" /><circle cx="224" cy="366" r="18" fill="#fff" /><circle cx="574" cy="366" r="44" fill="#0d1216" stroke="#00708d" strokeWidth="3" /><circle cx="574" cy="366" r="18" fill="#fff" /><line x1="80" y1="420" x2="720" y2="420" stroke="#0d1216" strokeWidth="2" /><g fill="#064e63" fontFamily="Manrope, Noto Sans JP" fontSize="13" fontWeight="800" letterSpacing="3" textAnchor="middle"><text x="400" y="158">BODY</text><text x="120" y="294">SPRING</text><text x="680" y="294">DAMPER</text><text x="224" y="444">TIRE</text><text x="574" y="444">TIRE</text></g></svg>
    );
  }
  if (kind === "suspension-types") {
    const labels = ["STRUT", "DOUBLE WISHBONE", "MULTI LINK", "TORSION BEAM", "RIGID AXLE"];
    return <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect width="800" height="420" fill="#f4f9fa" />{labels.map((label, index) => { const x = 95 + index * 152; return <g key={label} transform={`translate(${x} 0)`}><rect x="-54" y="96" width="108" height="172" rx="18" fill="#fff" stroke="#d7e5e9" /><circle cx="0" cy="230" r="34" fill="#0d1216" /><path d="M-36 182 L0 112 L36 182" fill="none" stroke="#00708d" strokeWidth="3" strokeLinecap="round" /><path d="M-42 230 H42" stroke="#ff5b3a" strokeWidth="3" strokeLinecap="round" opacity={index === 3 ? 1 : 0.28} /><text x="0" y="310" textAnchor="middle" fill="#064e63" fontFamily="Manrope" fontSize="11" fontWeight="800" letterSpacing="2">{label}</text></g>; })}</svg>;
  }
  if (kind === "suspension-soft" || kind === "suspension-hard" || kind === "suspension-failure") {
    const isSoft = kind === "suspension-soft";
    const isFailure = kind === "suspension-failure";
    const title = isSoft ? "SOFT / ABSORB" : isFailure ? "LOW STROKE / FAILURE" : "HARD / REACTION";
    const stroke = isSoft ? "#00708d" : "#ff5b3a";
    return <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect width="800" height="420" fill="#f4f9fa" /><g stroke="#d7e5e9" strokeWidth="2"><path d="M60 306 H740" /><path d="M60 338 H740" opacity=".55" /></g><path d={isSoft ? "M90 306 Q160 260 230 306 T370 306 T510 306 T710 306" : "M90 306 L170 268 L230 330 L300 262 L370 332 L460 270 L530 330 L710 306"} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><g transform="translate(400 210)"><path d="M-220 -20 Q0 -82 220 -20 L190 34 H-190 Z" fill="#fff" stroke="#0d1216" strokeWidth="3" /><circle cx="-150" cy="80" r="42" fill="#0d1216" /><circle cx="150" cy="80" r="42" fill="#0d1216" /><path d={isFailure ? "M-150 20 v52 M150 20 v52" : "M-150 5 v66 M150 5 v66"} stroke="#00708d" strokeWidth={isFailure ? "6" : "3"} /></g><text x="400" y="78" textAnchor="middle" fill="#064e63" fontFamily="Manrope" fontSize="18" fontWeight="800" letterSpacing="5">{title}</text></svg>;
  }
  if (kind === "air-measurement" || kind === "air-cleaner-risk") {
    const risk = kind === "air-cleaner-risk";
    return <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect width="800" height="420" fill="#f4f9fa" /><g fill="#fff" stroke="#d7e5e9" strokeWidth="2"><rect x="80" y="142" width="150" height="116" rx="18" /><rect x="325" y="142" width="150" height="116" rx="18" /><rect x="570" y="142" width="150" height="116" rx="18" /></g><g stroke="#00708d" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M230 200 H325" /><path d="M475 200 H570" /></g><g fill="#064e63" fontFamily="Manrope, Noto Sans JP" textAnchor="middle" fontWeight="800"><text x="155" y="197" fontSize="17">{risk ? "HEAT" : "AIR"}</text><text x="400" y="197" fontSize="17">MAF</text><text x="645" y="197" fontSize="17">ECU</text><text x="400" y="326" fontSize="14" letterSpacing="3">{risk ? "POSITION / SENSOR / HEAT SHIELD" : "L-JETRO / D-JETRO / AIR BOX"}</text></g>{risk ? <circle cx="155" cy="116" r="30" fill="#ff5b3a" opacity=".82" /> : null}</svg>;
  }
  if (kind === "tv-canceller-can" || kind === "diagnostic-scan") {
    const scan = kind === "diagnostic-scan";
    return <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect width="800" height="420" fill="#f4f9fa" /><g stroke="#00708d" strokeWidth="4" fill="none"><path d="M160 140 H640 V280 H160 Z" /><path d="M160 210 H640" /><path d="M280 140 V280" /><path d="M520 140 V280" /></g>{[{ label: "ECU", x: 160, y: 140 },{ label: "NAVI", x: 400, y: 140 },{ label: "METER", x: 640, y: 140 },{ label: "ADAS", x: 160, y: 280 },{ label: "BODY", x: 400, y: 280 },{ label: scan ? "DTC" : "CAN", x: 640, y: 280 }].map((node) => <g key={node.label}><circle cx={node.x} cy={node.y} r="46" fill="#fff" stroke={scan && node.label === "DTC" ? "#ff5b3a" : "#d7e5e9"} strokeWidth="3"/><text x={node.x} y={node.y + 5} textAnchor="middle" fill="#064e63" fontFamily="Manrope" fontSize="16" fontWeight="800">{node.label}</text></g>)}<text x="400" y="350" textAnchor="middle" fill="#064e63" fontFamily="Manrope" fontSize="14" fontWeight="800" letterSpacing="3">{scan ? "DIAGNOSTIC HISTORY" : "NETWORK CONTRADICTION"}</text></svg>;
  }
  return null;
}

function renderVisualFigure(
  block: Extract<GuideDetailBlock, { type: "image" }>,
  index: number,
  kind: FigureVisualKind,
) {
  return (
    <figure key={index} className={styles.figureBlock} data-cbj-reveal>
      <div className={styles.figureImageWrap}>{renderArticleVisualSvg(kind)}</div>
      <figcaption className={styles.figureCaption}>{figureCaption(block, kind)}</figcaption>
    </figure>
  );
}
function renderSubheading(
  block: Extract<GuideDetailBlock, { type: "subheading" }>,
  index: number,
) {
  const HeadingTag = block.level === 4 ? "h4" : "h3";
  return (
    <HeadingTag key={index} className={styles.subheadingBlock} data-cbj-reveal>
      {renderSentenceText(stripLeadingDisplayNumber(block.title))}
    </HeadingTag>
  );
}


function renderImage(
  block: Extract<GuideDetailBlock, { type: "image" }>,
  index: number,
) {
  if (!block.src) return null;
  const shouldUseArticleImage = /-article-(?:\d+)\.(?:webp|png|jpe?g)$/i.test(block.src);
  const visualKind = shouldUseArticleImage ? null : resolveFigureVisualKind(block);
  if (visualKind) return renderVisualFigure(block, index, visualKind);
  return (
    <figure key={index} className={styles.figureBlock} data-cbj-reveal>
      <div className={styles.figureImageWrap}>
        <Image
          src={block.src}
          alt={block.alt || ""}
          width={1600}
          height={1000}
          sizes="(max-width: 760px) 100vw, 760px"
          className={styles.figureImage}
        />
      </div>
      {block.alt ? (
        <figcaption className={styles.figureCaption}>{figureCaption(block, null)}</figcaption>
      ) : null}
    </figure>
  );
}

function renderComparisonTable(
  block: Extract<GuideDetailBlock, { type: "comparisonTable" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const headers = block.headers ?? [];
  const leadHeader = headers[0] ?? "項目";
  const valueHeaders = headers.slice(1);
  const leadValues = block.rows.map((row) =>
    String(stripLeadingDisplayNumber(row[0] ?? "")).trim().toUpperCase(),
  );
  const isDecisionCards =
    block.display === "cards" &&
    block.rows.length === 2 &&
    leadValues.every((value) => value === "NG" || value === "OK");
  const isIndexedCards = block.display === "cards" && !isDecisionCards;

  return (
    <section key={index} className={styles.tableBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <div
        className={styles.tableRows}
        role="table"
        aria-label={block.title ?? "記事内の整理表"}
      >
        {block.rows.map((row, rowIndex) => {
          const title = stripLeadingDisplayNumber(
            row[0] ?? `${leadHeader}${rowIndex + 1}`,
          );
          const normalizedTitle = String(title).trim().toUpperCase();
          const values = row.slice(1);
          const rowClassName = [
            styles.tableRow,
            isIndexedCards ? styles.tableRowIndexed : "",
            isDecisionCards ? styles.tableRowDecision : "",
            isDecisionCards && normalizedTitle === "NG" ? styles.tableRowDecisionNg : "",
            isDecisionCards && normalizedTitle === "OK" ? styles.tableRowDecisionOk : "",
          ]
            .filter(Boolean)
            .join(" ");

          const valueNode =
            values.length <= 1 ? (
              <RichText
                text={values[0] ?? ""}
                linkIndex={linkIndex}
                as="span"
                className={styles.tableText}
              />
            ) : (
              <dl className={styles.tablePairs}>
                {values.map((value, valueIndex) => (
                  <div key={valueIndex} className={styles.tablePair}>
                    <dt>
                      {renderSentenceText(valueHeaders[valueIndex] ?? `内容${valueIndex + 1}`)}
                    </dt>
                    <dd>
                      <RichText
                        text={value}
                        linkIndex={linkIndex}
                        as="span"
                        className={styles.tableText}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            );

          return (
            <article
              key={rowIndex}
              className={rowClassName}
              role="row"
              aria-label={isDecisionCards ? title : undefined}
            >
              {isIndexedCards ? (
                <div className={styles.tableRowIndex} aria-hidden="true">
                  <span>{String(rowIndex + 1).padStart(2, "0")}</span>
                </div>
              ) : null}

              <div
                className={[
                  styles.tableRowContent,
                  isDecisionCards ? styles.tableRowContentDecision : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {!isDecisionCards ? (
                  <h4 className={styles.tableLabel} role="rowheader">
                    {renderSentenceText(title)}
                  </h4>
                ) : null}

                {isDecisionCards ? (
                  <span
                    className={[
                      styles.decisionCardIcon,
                      normalizedTitle === "NG"
                        ? styles.decisionCardIconNg
                        : styles.decisionCardIconOk,
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {normalizedTitle === "NG" ? "✕" : "○"}
                  </span>
                ) : null}

                <div
                  className={[
                    styles.tableValue,
                    isDecisionCards ? styles.tableValueDecision : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="cell"
                >
                  {valueNode}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {block.note ? (
        <p className={styles.blockNote}>{renderInlineText(block.note)}</p>
      ) : null}
    </section>
  );
}

function renderFlow(
  block: Extract<GuideDetailBlock, { type: "flow" }>,
  index: number,
) {
  return (
    <section key={index} className={styles.stepBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <ol className={styles.stepList}>
        {block.steps.map((step, stepIndex) => (
          <li key={stepIndex} className={styles.stepItem}>
            <div className={styles.stepIndex}>
              <span>{String(stepIndex + 1).padStart(2, "0")}</span>
              {(step as any).label ? <small>{(step as any).label}</small> : null}
            </div>
            <div className={styles.stepBody}>
              <h4>{renderSentenceText(stripLeadingDisplayNumber(step.title))}</h4>
              {step.body ? <p>{renderInlineText(step.body)}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderTimeline(
  block: Extract<GuideDetailBlock, { type: "timeline" }>,
  index: number,
) {
  return (
    <section key={index} className={styles.stepBlock} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      <ol className={styles.stepList}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} className={styles.stepItem}>
            <div className={styles.stepIndex}>
              <span>{String(itemIndex + 1).padStart(2, "0")}</span>
              {item.label ? <small>{item.label}</small> : null}
            </div>
            <div className={styles.stepBody}>
              {item.title ? (
                <h4>{renderSentenceText(stripLeadingDisplayNumber(item.title))}</h4>
              ) : null}
              {item.body ? <p>{renderInlineText(item.body)}</p> : null}
              {item.items && item.items.length > 0 ? (
                <ul>
                  {item.items.map((entry, entryIndex) => (
                    <li key={entryIndex}>{entry}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderDecisionCards(
  block: Extract<GuideDetailBlock, { type: "decisionCards" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.cardStack} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.cards.map((card, cardIndex) => (
        <article key={cardIndex} className={styles.infoCard}>
          {card.badge ? <p className={styles.cardLabel}>{card.badge}</p> : null}
          <h4>{renderSentenceText(stripLeadingDisplayNumber(card.title))}</h4>
          {card.body ? (
            <RichText
              text={card.body}
              linkIndex={linkIndex}
              className={styles.cardText}
            />
          ) : null}
          {card.items && card.items.length > 0
            ? renderList(card.items, cardIndex, linkIndex, true)
            : null}
        </article>
      ))}
    </section>
  );
}

function renderCaseStudy(
  block: Extract<GuideDetailBlock, { type: "caseStudy" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.cardStack} data-cbj-reveal>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.cases.map((entry, caseIndex) => (
        <article key={caseIndex} className={styles.infoCard}>
          <h4>{renderSentenceText(stripLeadingDisplayNumber(entry.title))}</h4>
          {entry.intro ? (
            <RichText
              text={entry.intro}
              linkIndex={linkIndex}
              className={styles.cardText}
            />
          ) : null}
          {entry.rows.length > 0 ? (
            <dl className={styles.caseRows}>
              {entry.rows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.value}
                    {row.note ? <span>{row.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function renderCallout(
  block: Extract<GuideDetailBlock, { type: "callout" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  const className =
    block.tone === "warn"
      ? styles.warnCard
      : block.tone === "accent"
        ? styles.summaryCard
        : styles.noteCard;
  return (
    <aside key={index} className={className} data-cbj-reveal>
      {block.title ? <h3>{renderSentenceText(stripLeadingDisplayNumber(block.title))}</h3> : null}
      {block.body ? (
        <RichText
          text={block.body}
          linkIndex={linkIndex}
          className={styles.cardText}
        />
      ) : null}
      {block.items && block.items.length > 0
        ? renderList(block.items, index, linkIndex, true)
        : null}
    </aside>
  );
}

function renderEditorialBoard(
  block: Extract<GuideDetailBlock, { type: "editorialBoard" }>,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  return (
    <section key={index} className={styles.boardBlock} data-cbj-reveal>
      <p className={styles.cardLabel}>{block.eyebrow ?? "CBJ NOTE"}</p>
      {block.title ? (
        <h3 className={styles.blockTitle}>
          {renderSentenceText(stripLeadingDisplayNumber(block.title))}
        </h3>
      ) : null}
      {block.lead ? (
        <RichText
          text={block.lead}
          linkIndex={linkIndex}
          className={styles.cardText}
        />
      ) : null}
      <div className={styles.boardGrid}>
        {block.items.map((item, itemIndex) => (
          <article key={itemIndex} className={styles.infoCard}>
            <p className={styles.cardLabel}>
              {item.number ?? String(itemIndex + 1).padStart(2, "0")}
            </p>
            <h4>{renderSentenceText(stripLeadingDisplayNumber(item.title))}</h4>
            {item.body ? (
              <RichText
                text={item.body}
                linkIndex={linkIndex}
                className={styles.cardText}
              />
            ) : null}
            {item.items && item.items.length > 0
              ? renderList(item.items, itemIndex, linkIndex, true)
              : null}
          </article>
        ))}
      </div>
      {block.note ? (
        <p className={styles.blockNote}>{renderInlineText(block.note)}</p>
      ) : null}
    </section>
  );
}

function renderQuote(
  block: Extract<GuideDetailBlock, { type: "quote" }>,
  index: number,
) {
  return (
    <blockquote key={index} className={styles.quoteBlock} data-cbj-reveal>
      <p>{renderInlineText(block.text)}</p>
      {block.caption ? <cite>{block.caption}</cite> : null}
    </blockquote>
  );
}

function renderDivider(index: number) {
  return <hr key={index} className={styles.dividerBlock} aria-hidden="true" />;
}

function renderBlock(
  block: GuideDetailBlock,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
) {
  if (block.type === "paragraph")
    return renderParagraph(block, index, linkIndex);
  if (block.type === "quote") return renderQuote(block, index);
  if (block.type === "divider") return renderDivider(index);
  if (block.type === "image") return renderImage(block, index);
  if (block.type === "list") return renderList(block.items, index, linkIndex);
  if (block.type === "subheading") return renderSubheading(block, index);
  if (block.type === "comparisonTable")
    return renderComparisonTable(block, index, linkIndex);
  if (block.type === "callout") return renderCallout(block, index, linkIndex);
  if (block.type === "flow") return renderFlow(block, index);
  if (block.type === "timeline") return renderTimeline(block, index);
  if (block.type === "decisionCards")
    return renderDecisionCards(block, index, linkIndex);
  if (block.type === "caseStudy")
    return renderCaseStudy(block, index, linkIndex);
  if (block.type === "editorialBoard")
    return renderEditorialBoard(block, index, linkIndex);
  return null;
}

function renderInjectedKeyPoints(
  items: string[],
  linkIndex: Record<string, InternalLinkMeta>,
) {
  if (items.length === 0) return null;
  return (
    <section className={styles.listCard} data-cbj-reveal>
      <h3 className={styles.blockTitle}>最初に確認すること</h3>
      <div className={styles.listGrid}>
        {items.slice(0, 5).map((item, index) => (
          <article key={index} className={styles.listItem}>
            <span className={styles.listNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <RichText
              text={item}
              linkIndex={linkIndex}
              as="span"
              className={styles.listItemText}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function renderFaqItems(faq: GuideFaqItem[]) {
  if (faq.length === 0) return null;
  return (
    <section
      className={styles.faqSection}
      aria-label="よくある質問"
      data-cbj-reveal
    >
      <p className={styles.sectionEyebrow}>FAQ ／ よくある質問</p>
      <h2 className={styles.sectionTitle}>よくある質問</h2>
      <div className={styles.faqList}>
        {faq.map((item, index) => (
          <details key={index} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              <span className={styles.faqQuestionBadge}>Q</span>
              <strong className={styles.faqQuestionText}>{item.question}</strong>
              <i className={styles.faqQuestionToggle} aria-hidden="true">＋</i>
            </summary>
            <div className={styles.faqAnswer}>
              {renderInlineText(item.answer)}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function renderSection(
  section: EditorialSection,
  index: number,
  articleKind: ArticleKind,
  linkIndex: Record<string, InternalLinkMeta>,
  injectedKeyPoints: string[],
) {
  return (
    <section
      key={section.id}
      id={section.id}
      className={styles.editorialSection}
      data-cbj-reveal
    >
      <div className={styles.sectionHead}>
        <p className={styles.sectionEyebrow}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">／</span>
          <span>
            {section.chapterLabel ||
              resolveChapterLabel(section.title, index, articleKind)}
          </span>
        </p>
        <h2 className={styles.sectionTitle}>{renderSentenceText(section.displayTitle)}</h2>
        {section.deck ? (
          <p className={styles.sectionDeck}>{renderSentenceText(section.deck)}</p>
        ) : null}
      </div>
      <div className={styles.sectionBody}>
        {section.blocks.map((block, blockIndex) => (
          <Fragment key={`${section.id}-${blockIndex}`}>
            {renderBlock(block, blockIndex, linkIndex)}
          </Fragment>
        ))}
        {index === 0
          ? renderInjectedKeyPoints(injectedKeyPoints, linkIndex)
          : null}
      </div>
    </section>
  );
}

function renderSources(sources: string[], title?: string) {
  if (sources.length === 0) return null;
  return (
    <details className={styles.sourcesBox} data-cbj-reveal>
      <summary>
        <span>{title ?? "出典・参考資料"}</span>
        <span>{sources.length}件</span>
      </summary>
      <ol>
        {sources.map((source, index) => (
          <li key={index}>
            {/^(https?:\/\/)/i.test(source) ? (
              <a href={source} target="_blank" rel="noreferrer">
                {sourceLabel(source)}
              </a>
            ) : (
              source
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

function renderUpdate(updateText?: string | null, title?: string) {
  if (!updateText) return null;
  return (
    <details className={styles.updateBox} data-cbj-reveal>
      <summary>
        <span>{title ?? "更新履歴"}</span>
        <span>表示</span>
      </summary>
      <p>{updateText}</p>
    </details>
  );
}

function renderRelated(
  relatedItems: EditorialRelatedItem[],
  labels: EditorialArticleLabels,
) {
  if (relatedItems.length === 0) return null;
  return (
    <section
      className={styles.relatedSection}
      aria-label={labels.relatedAriaLabel ?? labels.relatedTitle}
      data-cbj-reveal
    >
      <h2>{renderSentenceText(labels.relatedTitle)}</h2>
      <div className={styles.relatedGrid}>
        {relatedItems.slice(0, 3).map((item, index) => (
          <Link key={item.href} href={item.href} className={styles.relatedCard}>
            <div className={styles.relatedVisual} aria-hidden="true">
              {item.imageSrc ? (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt || item.title}
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                  className={styles.relatedVisualImage}
                />
              ) : (
                <>
                  <span>
                    {(item.metaLabel || labels.relatedTitle || "READ").slice(0, 14)}
                  </span>
                  <i />
                </>
              )}
            </div>
            <div className={styles.relatedBody}>
              <span className={styles.relatedMeta}>{item.metaLabel}</span>
              <h3>{renderSentenceText(item.title)}</h3>
              <p>{item.summary}</p>
              <small>
                {index === 0 ? "READ NEXT" : "READ"}
                {item.date ? `　${item.date}` : ""}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function readMinutesLabel(minutes?: number | null): string | null {
  if (!minutes) return null;
  return `${minutes} min`;
}

function sectionHasPointLikeBlock(section?: EditorialSection | null): boolean {
  return Boolean(
    section?.blocks?.some((block) => {
      const type = (block as GuideDetailBlock).type;
      return (
        type === "list" ||
        type === "decisionCards" ||
        type === "editorialBoard" ||
        type === "comparisonTable"
      );
    }),
  );
}

function renderProgress() {
  return (
    <div className={styles.progress} aria-hidden="true">
      <div className={styles.progressBar} data-cbj-progress-bar />
    </div>
  );
}

function renderHeroDiagram(
  articleKind: ArticleKind,
  article: EditorialArticleViewModel,
) {
  if (article.suppressHeroVisual) return null;

  const textForVisual = compactText(`${article.title} ${article.eyebrowLabel} ${article.lead ?? ""}`);
  const isSuspensionVisual = articleKind === "GUIDE" && /足回り|サスペンション|ダンパー|スプリング|車高調|減衰/.test(textForVisual);

  if (!isSuspensionVisual && article.heroImage) {
    return (
      <section className={styles.heroVisual} data-cbj-reveal data-cbj-delay="180">
        <div className={`${styles.heroFrame} ${styles.heroFrameImage}`}>
          <Image
            src={article.heroImage}
            alt={article.heroAlt || article.title}
            fill
            sizes="(max-width: 880px) 100vw, 1280px"
            className={styles.heroPhoto}
            priority
          />
        </div>
      </section>
    );
  }

  if (!isSuspensionVisual) return null;

  return (
    <section className={styles.heroVisual} data-cbj-reveal data-cbj-delay="180">
      <div className={`${styles.heroFrame} ${styles.heroFrameImage}`}>
        <Image
          src={SUSPENSION_ARTICLE_HERO_IMAGE}
          alt={SUSPENSION_ARTICLE_HERO_ALT}
          fill
          sizes="(max-width: 880px) 100vw, 1280px"
          className={styles.heroPhoto}
          priority
        />
        <div className={styles.heroBadge}>
          <span>図解</span>
          SUSPENSION SYSTEM MAP
        </div>
        <div className={`${styles.heroCaption} ${styles.heroCaptionLight}`}>
          <span>足回りは、部品名ではなく役割で見ると理解しやすい。</span>
          <small>CBJ Editorial / 2026</small>
        </div>
      </div>
    </section>
  );

}

function renderAuthorBar(article: EditorialArticleViewModel) {
  return (
    <div className={styles.authorBar} data-cbj-reveal data-cbj-delay="240">
      <div className={styles.authorCard}>
        <div className={styles.authorAvatar}>編</div>
        <div className={styles.authorWho}>
          <b>{article.author.name}</b>
          {article.author.credential ? (
            <small>{article.author.credential}</small>
          ) : null}
        </div>
      </div>
      <div className={styles.shareActions} aria-label="この記事をシェア">
        <Link href="#" aria-label="X">
          X
        </Link>
        <Link href="#" aria-label="LINE">
          LINE
        </Link>
        <Link href="#" aria-label="リンクをコピー">
          COPY
        </Link>
        <Link href="#" aria-label="保存">
          SAVE
        </Link>
      </div>
    </div>
  );
}

function renderToc(sections: EditorialSection[], faqLength: number) {
  const tocSections =
    faqLength > 0
      ? [
          ...sections,
          { id: "faq", displayTitle: "よくある質問" } as EditorialSection,
        ]
      : sections;
  if (tocSections.length === 0) return null;
  return (
    <aside className={styles.toc} aria-label="目次">
      <div className={styles.tocTitle}>CONTENTS / 目次</div>
      <ol>
        {tocSections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={styles.tocLink}
              data-cbj-toc-link
            >
              {renderSentenceText(section.displayTitle)}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function renderRail(
  article: EditorialArticleViewModel,
  readLabel: string | null,
  articleKind: ArticleKind,
) {
  const editorPick = article.lead
    ? article.lead.split(/[。！？]/u)[0]
    : article.title;
  return (
    <aside className={styles.rail} aria-label="記事メタ情報">
      {readLabel ? (
        <div className={styles.railCard}>
          <h4>READING TIME</h4>
          <p className={styles.railNumber}>
            {readLabel.replace(/\s*min$/i, "")}
            <span>min</span>
          </p>
        </div>
      ) : null}
      <div className={styles.railCard}>
        <h4>SECTION</h4>
        <p className={styles.railNumber}>
          CBJ<span>{articleKind.toLowerCase()}</span>
        </p>
      </div>
      <div className={`${styles.railCard} ${styles.railCardAccent}`}>
        <h4>EDITOR&apos;S PICK</h4>
        <p>{editorPick}</p>
      </div>
    </aside>
  );
}

export function EditorialArticlePage({
  article,
  labels,
  linkIndex,
}: EditorialArticlePageProps) {
  const articleKind = resolveArticleKind(labels);
  const sections = normalizeSections(article, articleKind);
  const sources = (article.sources ?? [])
    .map((source) => String(source ?? "").trim())
    .filter(Boolean);
  const faq = article.faq ?? [];
  const updated = formatDateDot(article.updatedAt ?? article.publishedAt);
  const published = formatDateDot(article.publishedAt);
  const readLabel = readMinutesLabel(article.readMinutes);
  const keyPoints = article.keyPoints ?? [];
  const checkpoints = article.checkpoints ?? [];
  const injectedKeyPoints = keyPoints.length > 0 ? keyPoints : checkpoints;
  const relatedItems = article.relatedItems ?? [];
  const shouldInjectKeyPoints = !sectionHasPointLikeBlock(sections[0]);
  const headerTags = buildHeaderTags(articleKind, article.eyebrowLabel);

  return (
    <main
      className={styles.page}
      data-cbj-article-page
      data-kind={articleKind.toLowerCase()}
    >
      <EditorialArticleMotionClient />
      {renderProgress()}
      <div id="top" />
      <div className={styles.breadcrumbStrip} aria-label="パンくずリスト">
        <div className={styles.breadcrumbRoute}>
          {article.breadcrumbTrail
            .filter((item) => Boolean(item.href))
            .map((item, index, items) => (
              <Fragment key={`${item.label}-${index}`}>
                {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                {index < items.length - 1 ? <span>／</span> : null}
              </Fragment>
            ))}
          {article.breadcrumbTrail.some((item) => Boolean(item.href)) ? <span>／</span> : null}
        </div>
        <p className={styles.breadcrumbCurrent}>{renderSentenceText(article.title)}</p>
      </div>

      <header className={styles.head}>
        <div className={styles.headMeta} data-cbj-reveal>
          {headerTags.map((tag) => (
            <span key={`${tag.variant}-${tag.label}`} className={headerTagClassName(tag.variant)}>
              {tag.label}
            </span>
          ))}
          <div className={styles.metaRow}>
            {updated ? <span>UPDATED {updated}</span> : null}
            {readLabel ? (
              <>
                <span className={styles.metaDot} />{" "}
                <span>READ {readLabel.toUpperCase()}</span>
              </>
            ) : null}
            {published ? (
              <>
                <span className={styles.metaDot} /> <span>{published}</span>
              </>
            ) : null}
          </div>
        </div>
        <h1 className={styles.headTitle} data-cbj-reveal data-cbj-delay="80">
          {renderTitleLines([article.title])}
        </h1>
        {article.lead ? (
          <p className={styles.headLede} data-cbj-reveal data-cbj-delay="140">
            {article.lead}
          </p>
        ) : null}
      </header>

      {renderHeroDiagram(articleKind, article)}
      {renderAuthorBar(article)}

      <div className={styles.layout}>
        {renderToc(sections, faq.length)}
        <div className={styles.content}>
          {sections.map((section, index) =>
            renderSection(
              section,
              index,
              articleKind,
              linkIndex,
              index === 0 && shouldInjectKeyPoints ? injectedKeyPoints : [],
            ),
          )}
          {renderFaqItems(faq)}
          {renderSources(sources, labels.sourcesTitle)}
          {renderUpdate(article.updateText, labels.updateTitle)}
        </div>
        {renderRail(article, readLabel, articleKind)}
      </div>

      {renderRelated(relatedItems, labels)}
    </main>
  );
}
