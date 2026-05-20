import { Fragment, type CSSProperties } from "react";
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
import { DecisionArticleMotion } from "@/components/detail/DecisionArticleMotion";

import styles from "@/components/guide/detail/guide-decision.module.css";

export type DecisionRelatedItem = {
  slug: string;
  href: string;
  metaLabel: string;
  title: string;
  summary: string;
  date?: string | null;
};

export type DecisionArticleLabels = {
  relatedTitle: string;
  relatedAriaLabel?: string;
  sourcesTitle?: string;
  updateTitle?: string;
  footerListHref: string;
  footerListLabel: string;
};

export type DecisionArticleViewModel = {
  title: string;
  eyebrowLabel: string;
  breadcrumbTrail: GuideBreadcrumbItem[];
  author: GuideAuthorProfile;
  lead?: string | null;
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
  relatedItems?: DecisionRelatedItem[] | null;
  heroImage?: string | null;
};

export type DecisionArticlePageProps = {
  article: DecisionArticleViewModel;
  labels: DecisionArticleLabels;
  linkIndex: Record<string, InternalLinkMeta>;
};

type SectionKind = "conclusion" | "process" | "targets" | "paid" | "cannot" | "prohibited" | "impact" | "standard";

type NormalizedSection = GuideDetailSection & {
  id: string;
  displayTitle: string;
  deck?: string;
  chapterLabel: string;
  kind: SectionKind;
};

type HeroCopy = {
  titleLines: string[];
  lead: string | null;
  closingTitle: string;
};

const GUIDE_IMAGES = [
  "/images/cbj/guide-hero.jpg",
  "/images/cbj/column-hero.jpg",
  "/images/cbj/car-nissan-z-rz34-hero.jpg",
];

const COLUMN_IMAGES = [
  "/images/cbj/column-hero.jpg",
  "/images/cbj/guide-hero.jpg",
  "/images/cbj/car-ferrari-purosangue-hero.jpg",
];

function formatDateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function slugifyId(text?: string | null): string {
  return (text ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function stripSectionPrefix(text?: string | null): string {
  return stripLeadingDisplayNumber(text)
    .replace(/^\s*(先に結論|結論|流れ|対象|差押えの対象|すでに払った人|払えない人|車への影響|やってはいけないこと)\s*[｜|:：]?\s*/u, (match) => {
      if (/^\s*(先に結論|結論)\s*[｜|:：]/u.test(match)) return "";
      return match.includes("｜") || match.includes("|") || match.includes(":") || match.includes("：") ? "" : match;
    })
    .trim();
}

function stripLeadingDisplayNumber(text?: string | null): string {
  return String(text ?? "")
    .replace(/^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩])\s*[\).）．.、:：-]?\s*/u, "")
    .replace(/^\s*\d{1,2}\s*[\).）．.、:：-]\s*/u, "")
    .trim();
}

function fitTitleStyle(text?: string | null, scale = 1): CSSProperties {
  const count = Math.max(4, Array.from(String(text ?? "").replace(/\s+/g, "").trim()).length);
  // 端末幅に対して、長い日本語タイトルも1行内に収まるように文字数から可変値を作る。
  // ここで下限を上げるとスマホ幅で再びはみ出すため、CSS側の最小値も低めにする。
  const vw = Math.min(8.2, Math.max(2.15, (82 * scale) / count));
  return {
    "--cbj-title-chars": count,
    "--cbj-title-vw": `${vw.toFixed(3)}vw`,
  } as CSSProperties;
}

function formatSentenceBreaks(text: string): string {
  return (text ?? "")
    .replace(/。/g, "。\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeSections(sections?: GuideDetailSection[] | null): NormalizedSection[] {
  return (sections ?? []).map((section, index) => {
    const rawTitle = section.title ?? `セクション${index + 1}`;
    const id = section.id?.trim() || slugifyId(rawTitle) || `section-${index + 1}`;
    const kind = resolveSectionKind(rawTitle, index);
    return {
      ...section,
      title: rawTitle,
      id,
      displayTitle: resolveSectionTitle(rawTitle, kind),
      deck: resolveSectionDeck(rawTitle, kind) ?? undefined,
      chapterLabel: resolveChapterLabel(rawTitle, index, kind),
      kind,
    };
  });
}

function resolveSectionKind(title?: string | null, index = 0): SectionKind {
  const text = (title ?? "").replace(/\s+/g, "");
  if (/やってはいけない|危険|禁止|無視|自己判断/.test(text)) return "prohibited";
  if (/流れ|督促|催告|財産調査|PROCESS/i.test(text)) return "process";
  if (/対象|預金|給与|生命保険|不動産|TARGET/i.test(text)) return "targets";
  if (/すでに|払った|行き違い|延滞金だけ|ALREADY/i.test(text)) return "paid";
  if (/払えない|分納|猶予|納付計画|CANNOT/i.test(text)) return "cannot";
  if (/車検|売却|名義変更|登録|影響|IMPACT/i.test(text)) return "impact";
  if (/結論|先に/.test(text) || index === 0) return "conclusion";
  return "standard";
}

function resolveChapterLabel(_title: string | null | undefined, index: number, kind: SectionKind): string {
  switch (kind) {
    case "conclusion":
      return "CONCLUSION";
    case "process":
      return "PROCESS";
    case "targets":
      return "TARGETS";
    case "paid":
      return "ALREADY PAID";
    case "cannot":
      return "CANNOT PAY";
    case "prohibited":
      return "PROHIBITED";
    case "impact":
      return "IMPACT";
    default:
      return `CHAPTER ${String(index + 1).padStart(2, "0")}`;
  }
}

function resolveArticleKind(labels: DecisionArticleLabels): "GUIDE" | "COLUMN" {
  return labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE";
}

function getHeroImages(kind: "GUIDE" | "COLUMN") {
  return kind === "COLUMN" ? COLUMN_IMAGES : GUIDE_IMAGES;
}

function compactText(text?: string | null): string {
  return (text ?? "").replace(/\s+/g, "").trim();
}

function firstSentence(text?: string | null): string | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  const match = t.match(/^(.+?[。.!?！？])/u);
  return (match?.[1] ?? t).trim();
}

function normalizeDisplayTitleSource(text?: string | null): string {
  return (text ?? "")
    .replace(/[「」『』]/g, "")
    .replace(/\s+/g, " ")
    .replace(/。+$/u, "")
    .trim();
}

function splitJapaneseDisplayTitle(text?: string | null): string[] {
  const source = normalizeDisplayTitleSource(text);
  if (!source) return [];

  const explicit = source
    .split(/[｜|:：]/u)
    .map((part) => normalizeDisplayTitleSource(part))
    .filter(Boolean);

  if (explicit.length >= 2) return explicit.slice(0, 3);
  if (source.length <= 13) return [source];

  const phraseBreaks = [
    "とは",
    "とき",
    "理由",
    "方法",
    "選び方",
    "考え方",
    "注意点",
    "確認すること",
    "見直す",
    "比較",
    "違い",
    "流れ",
    "影響",
    "タイミング",
  ];

  for (const token of phraseBreaks) {
    const position = source.indexOf(token);
    if (position >= 5 && position + token.length < source.length) {
      const head = source.slice(0, position + token.length).trim();
      const tail = source.slice(position + token.length).replace(/^[、,。\s]+/u, "").trim();
      if (head && tail) return [head, tail].slice(0, 3);
    }
  }

  const softBreaks = Array.from(source.matchAll(/[、,・/／]/gu))
    .map((match) => match.index ?? -1)
    .filter((position) => position >= 6 && position <= 18);
  if (softBreaks.length > 0) {
    const position = softBreaks[Math.floor(softBreaks.length / 2)];
    const head = source.slice(0, position + 1).trim();
    const tail = source.slice(position + 1).trim();
    if (head && tail) return [head, tail];
  }

  const ideal = Math.min(14, Math.max(8, Math.round(source.length / 2)));
  let cut = ideal;
  for (let i = ideal; i >= 7; i -= 1) {
    if (/[がをではにのとへも]/u.test(source[i] ?? "")) {
      cut = i + 1;
      break;
    }
  }

  const lines = [source.slice(0, cut), source.slice(cut)]
    .map((part) => normalizeDisplayTitleSource(part))
    .filter(Boolean);

  if (lines.length === 2 && lines[1].length > 18) {
    const tail = lines[1];
    const tailCut = Math.min(13, Math.max(7, Math.round(tail.length / 2)));
    return [lines[0], normalizeDisplayTitleSource(tail.slice(0, tailCut)), normalizeDisplayTitleSource(tail.slice(tailCut))].filter(Boolean);
  }

  return lines.slice(0, 3);
}

function resolveHeroCopy(article: DecisionArticleViewModel): HeroCopy {
  const title = (article.title ?? "").trim();
  const normalized = compactText(title);

  if (normalized.includes("自動車税") && normalized.includes("差押予告通知")) {
    return {
      titleLines: ["差押予告", "通知が来たとき"],
      lead:
        "普通車で最初に確認すること。督促、催告、差押予告、財産調査。同じ紙だと思わない。",
      closingTitle: "差押予告書が届いたら、まず発行元の県税事務所へ。",
    };
  }

  const [main, ...rest] = title.split(/。/u).map((part) => part.trim()).filter(Boolean);
  const primary = main || title;
  const titleLines = [normalizeDisplayTitleSource(primary) || primary];
  const sub = rest.join("。");
  const lead = [sub, firstSentence(article.lead)].filter(Boolean).join("。").replace(/。{2,}/g, "。");

  return {
    titleLines: titleLines.length > 0 ? titleLines : [primary],
    lead: lead || article.lead || null,
    closingTitle: firstSentence(article.lead) ?? primary,
  };
}

function resolveSectionTitle(title?: string | null, kind: SectionKind = "standard"): string {
  const stripped = stripSectionPrefix(title) || (title ?? "");
  const compact = compactText(title);

  if (kind === "conclusion") return "先に結論";
  if (kind === "process") return "督促、催告、差押予告";
  if (kind === "targets") return "差押えの対象";
  if (kind === "paid") return "すでに払った人";
  if (kind === "cannot") return "払えない人";
  if (kind === "impact") return "車への影響";
  if (kind === "prohibited") return "やってはいけないこと";

  if (stripped.length > 18 && stripped.includes("｜")) return stripped.split("｜")[0].trim();
  return stripped;
}

function resolveSectionDeck(title?: string | null, kind: SectionKind = "standard"): string | null {
  const compact = compactText(title);
  if (kind === "conclusion") return "支払いを後回しにできる案内ではなく、滞納整理が進んだ合図として見る。";
  if (kind === "process") return "督促、催告、差押予告、財産調査。同じ紙ではなく、段階が違う。";
  if (kind === "targets") return "車だけを見るのではなく、預金、給与、保険、不動産まで確認する。";
  if (kind === "paid") return "行き違いか、延滞金だけ残ったのか。支払記録で切り分ける。";
  if (kind === "cannot") return "分納したい、では足りない。いつ、いくら、どう完納するかを説明する。";
  if (kind === "impact") return "タイヤロック、公売、車検、売却。車の予定が近いほど先に確認する。";
  if (kind === "prohibited") return "無視、自己判断、名義変更だけで解決しようとする動きは避ける。";
  if (compact.length > 18) return stripSectionPrefix(title);
  return null;
}

function renderTitleLines(lines: string[]) {
  const safeLine = lines
    .map((line) => (line ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return <span className={styles.titleLine}>{safeLine}</span>;
}

function hasDecisionCards(section: NormalizedSection): boolean {
  return section.blocks.some((block) => block.type === "decisionCards");
}

function renderShortDisplayText(text: string, maxLength = 94): string {
  const source = (text ?? "").replace(/\s+/g, " ").trim();
  if (source.length <= maxLength) return formatSentenceBreaks(source);

  const first = source.match(/^(.+?[。.!?！？])/u)?.[1]?.trim();
  if (first && first.length <= maxLength + 18) return formatSentenceBreaks(first);

  return `${source.slice(0, maxLength).replace(/[、,。\s]+$/u, "")}。`;
}

function renderSourcesSummary(source?: string | null): string {
  const safeSource = String(source ?? "").trim();
  if (!isExternalHref(safeSource)) return safeSource;
  try {
    const url = new URL(safeSource);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.split("/").filter(Boolean).slice(0, 2).join(" / ");
    return path ? `${host} / ${path}` : host;
  } catch {
    return safeSource;
  }
}

function renderQuietAction(action: GuideActionBox["actions"][number], index: number) {
  if (action.external || isExternalHref(action.href)) {
    return (
      <a key={index} href={action.href} className={styles.endTextLink} target="_blank" rel="noreferrer">
        {action.label}
      </a>
    );
  }

  return (
    <Link key={index} href={action.href} className={styles.endTextLink}>
      {action.label}
    </Link>
  );
}

function EditorialFigure({ src, label, alt, priority = false }: { src: string; label: string; alt: string; priority?: boolean }) {
  return (
    <figure className={styles.figureBlock} data-cbj-reveal data-cbj-parallax>
      <div className={styles.figureImageWrap}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 780px) 100vw, 620px"
          className={styles.figureImage}
        />
      </div>
      <figcaption className={styles.figureCaption}>{label}</figcaption>
    </figure>
  );
}

function renderInlineImageBlock(block: Extract<GuideDetailBlock, { type: "image" }>, index: number) {
  const fit = block.fit === "contain" ? "contain" : "cover";
  const imageClass = fit === "contain" ? styles.inlineFigureImageContain : styles.inlineFigureImageCover;
  const wrapStyle = {
    aspectRatio: block.aspectRatio?.trim() || "4 / 3",
  } as CSSProperties;

  return (
    <figure key={index} className={styles.inlineFigureBlock} data-cbj-reveal data-cbj-parallax>
      <div className={styles.inlineFigureImageWrap} style={wrapStyle}>
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes="(max-width: 780px) 100vw, 860px"
          className={imageClass}
        />
      </div>
      {block.label ? <figcaption className={styles.inlineFigureCaption}>{block.label}</figcaption> : null}
    </figure>
  );
}

function renderParagraph(text: string, index: number, linkIndex: Record<string, InternalLinkMeta>) {
  return (
    <TextWithInternalLinkCards
      key={index}
      text={formatSentenceBreaks(text)}
      linkIndex={linkIndex}
      as="p"
      className={styles.copyWrap}
      textClassName={styles.paragraph}
      cardsClassName={styles.inlineCards}
    />
  );
}

function renderList(items: string[], index: number, linkIndex: Record<string, InternalLinkMeta>, compact = false) {
  return (
    <ul key={index} className={compact ? styles.compactList : styles.editorialList}>
      {items.map((item, itemIndex) => (
        <li key={itemIndex} className={styles.editorialListItem}>
          <TextWithInternalLinkCards
            text={formatSentenceBreaks(item)}
            linkIndex={linkIndex}
            as="span"
            className={styles.listTextWrap}
            textClassName={styles.listItemText}
            cardsClassName={styles.inlineCards}
          />
        </li>
      ))}
    </ul>
  );
}

function renderComparisonTable(block: Extract<GuideDetailBlock, { type: "comparisonTable" }>, index: number) {
  const headers = block.headers ?? [];
  const leadHeader = headers[0] ?? "項目";
  const valueHeaders = headers.slice(1);

  return (
    <section key={index} className={styles.matrixWrap}>
      {block.title ? <p className={styles.microTitle}>{block.title}</p> : null}
      <div className={styles.matrixGrid}>
        {block.rows.map((row, rowIndex) => {
          const title = row[0] ?? `${leadHeader}${rowIndex + 1}`;
          const values = row.slice(1);
          return (
            <article key={rowIndex} className={styles.matrixCard} data-cbj-reveal data-cbj-delay={rowIndex * 80}>
              <span className={styles.matrixNumber}>{String(rowIndex + 1).padStart(2, "0")}</span>
              <h3 className={styles.matrixTitle}>{stripLeadingDisplayNumber(title)}</h3>
              <dl className={styles.matrixData}>
                {values.map((value, valueIndex) => (
                  <div key={valueIndex} className={styles.matrixRow}>
                    <dt>{valueHeaders[valueIndex] ?? "内容"}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
      {block.note ? <p className={styles.tableNote}>{block.note}</p> : null}
    </section>
  );
}

function renderFlow(block: Extract<GuideDetailBlock, { type: "flow" }>, index: number) {
  return (
    <section key={index} className={styles.sequenceWrap}>
      {block.title ? <p className={styles.microTitle}>{block.title}</p> : null}
      <ol className={styles.sequenceList}>
        {block.steps.map((step, stepIndex) => (
          <li key={stepIndex} className={styles.sequenceItem} data-cbj-reveal data-cbj-delay={stepIndex * 80}>
            <span className={styles.sequenceNumber}>{String(stepIndex + 1).padStart(2, "0")}</span>
            <div className={styles.sequenceBody}>
              <h3 className={styles.sequenceTitle}>{stripLeadingDisplayNumber(step.title)}</h3>
              {step.body ? <p className={styles.sequenceText}>{renderShortDisplayText(step.body, 82)}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderTimeline(block: Extract<GuideDetailBlock, { type: "timeline" }>, index: number) {
  return (
    <section key={index} className={styles.sequenceWrap}>
      {block.title ? <p className={styles.microTitle}>{block.title}</p> : null}
      <ol className={styles.sequenceList}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} className={styles.sequenceItem} data-cbj-reveal data-cbj-delay={itemIndex * 80}>
            <span className={styles.sequenceNumber}>{String(itemIndex + 1).padStart(2, "0")}</span>
            <div className={styles.sequenceBody}>
              <p className={styles.sequenceKicker}>{item.label}</p>
              {item.title ? <h3 className={styles.sequenceTitle}>{stripLeadingDisplayNumber(item.title)}</h3> : null}
              {item.body ? <p className={styles.sequenceText}>{renderShortDisplayText(item.body, 82)}</p> : null}
              {item.items && item.items.length > 0 ? (
                <ul className={styles.compactList}>
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

function renderDecisionCards(block: Extract<GuideDetailBlock, { type: "decisionCards" }>, index: number, dark = false) {
  return (
    <section key={index} className={styles.cardSuite}>
      {block.title ? <p className={dark ? styles.darkMicroTitle : styles.microTitle}>{block.title}</p> : null}
      <div className={styles.cardGrid}>
        {block.cards.map((card, cardIndex) => (
          <article key={cardIndex} className={dark ? styles.darkCard : styles.whiteCard} data-cbj-reveal data-cbj-delay={cardIndex * 90}>
            <span className={dark ? styles.darkBadge : styles.cardBadge}>{card.badge ?? `CASE ${String(cardIndex + 1).padStart(2, "0")}`}</span>
            <h3 className={dark ? styles.darkCardTitle : styles.cardTitle}>{stripLeadingDisplayNumber(card.title)}</h3>
            {card.body ? <p className={dark ? styles.darkCardBody : styles.cardBody}>{renderShortDisplayText(card.body, dark ? 76 : 90)}</p> : null}
            {card.items && card.items.length > 0 ? (
              <ul className={dark ? styles.darkList : styles.compactList}>
                {card.items.map((entry, entryIndex) => (
                  <li key={entryIndex}>{entry}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function renderKeyPointCards(items: string[]) {
  if (items.length === 0) return null;
  return (
    <div className={styles.keyPointGrid}>
      {items.slice(0, 5).map((item, index) => (
        <article key={index} className={styles.keyPointCard} data-cbj-reveal data-cbj-delay={index * 90}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{formatSentenceBreaks(item)}</p>
        </article>
      ))}
    </div>
  );
}

function renderCaseStudy(block: Extract<GuideDetailBlock, { type: "caseStudy" }>, index: number) {
  return (
    <section key={index} className={styles.cardSuite}>
      {block.title ? <p className={styles.microTitle}>{block.title}</p> : null}
      <div className={styles.cardGrid}>
        {block.cases.map((entry, caseIndex) => (
          <article key={caseIndex} className={styles.whiteCard} data-cbj-reveal data-cbj-delay={caseIndex * 90}>
            <span className={styles.cardBadge}>CASE {String(caseIndex + 1).padStart(2, "0")}</span>
            <h3 className={styles.cardTitle}>{stripLeadingDisplayNumber(entry.title)}</h3>
            {entry.intro ? <p className={styles.cardBody}>{formatSentenceBreaks(entry.intro)}</p> : null}
            <dl className={styles.caseTable}>
              {entry.rows.map((row, rowIndex) => (
                <div key={rowIndex} className={styles.caseRow}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.value}
                    {row.note ? <span>{row.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderCallout(block: Extract<GuideDetailBlock, { type: "callout" }>, index: number, dark = false) {
  return (
    <section key={index} className={dark || block.tone === "warn" ? styles.warningPanel : styles.notePanel}>
      <span className={styles.calloutMark}>!</span>
      <div>
        {block.title ? <h3 className={styles.calloutTitle}>{stripLeadingDisplayNumber(block.title)}</h3> : null}
        {block.body ? <p className={styles.calloutBody}>{formatSentenceBreaks(block.body)}</p> : null}
        {block.items && block.items.length > 0 ? (
          <ul className={dark || block.tone === "warn" ? styles.darkList : styles.compactList}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function renderBlock(
  block: GuideDetailBlock,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
  sectionKind: SectionKind,
) {
  if (block.type === "paragraph") return renderParagraph(block.text, index, linkIndex);
  if (block.type === "image") return renderInlineImageBlock(block, index);
  if (block.type === "list") return renderList(block.items, index, linkIndex);
  if (block.type === "comparisonTable") return renderComparisonTable(block, index);
  if (block.type === "callout") return renderCallout(block, index, sectionKind === "prohibited");
  if (block.type === "flow") return renderFlow(block, index);
  if (block.type === "timeline") return renderTimeline(block, index);
  if (block.type === "decisionCards") return renderDecisionCards(block, index, sectionKind === "prohibited");
  if (block.type === "caseStudy") return renderCaseStudy(block, index);
  return null;
}

function renderCheckpointPanel(checkpoints: string[]) {
  if (checkpoints.length === 0) return null;
  return (
    <aside className={styles.checkPanel} aria-label="確認メモ" data-cbj-reveal>
      <p className={styles.checkLabel}>CHECK</p>
      <ul className={styles.checkGrid}>
        {checkpoints.slice(0, 5).map((item, index) => (
          <li key={index} className={styles.checkItem} data-cbj-reveal data-cbj-delay={index * 60}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{renderShortDisplayText(item, 46)}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function renderFaqItems(faq: GuideFaqItem[]) {
  if (faq.length === 0) return null;
  return (
    <section className={`${styles.editorialSection} ${styles.faqSection}`} aria-label="よくある質問" data-cbj-reveal data-cbj-parallax>
      <span className={styles.backgroundChapter}>FAQ</span>
      <div className={styles.sectionHead} data-cbj-reveal>
        <p className={styles.sectionEyebrow}>FAQ</p>
        <h2 className={styles.sectionTitle}>よくある質問</h2>
      </div>
      <div className={styles.faqList}>
        {faq.map((item, index) => (
          <details key={index} className={styles.faqItem} data-cbj-reveal data-cbj-delay={index * 70}>
            <summary className={styles.faqQuestion}>
              <span>Q</span>
              <strong>{item.question}</strong>
            </summary>
            <div className={styles.faqAnswer}>{formatSentenceBreaks(item.answer)}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function renderSection(
  section: NormalizedSection,
  index: number,
  linkIndex: Record<string, InternalLinkMeta>,
  imageSrc?: string,
  injectedKeyPoints: string[] = [],
) {
  const isDark = section.kind === "prohibited";
  const sectionClass = [
    styles.editorialSection,
    isDark ? styles.darkSection : "",
    section.kind === "process" ? styles.processSection : "",
    section.kind === "targets" ? styles.targetSection : "",
    section.kind === "cannot" ? styles.cannotSection : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section key={section.id} id={section.id} className={sectionClass} data-cbj-reveal data-cbj-parallax>
      <span className={styles.backgroundChapter}>{String(index + 1).padStart(2, "0")}</span>
      {imageSrc && index > 0 ? (
        <EditorialFigure src={imageSrc} label={index % 2 === 0 ? "THE ROAD" : "THE COCKPIT"} alt="CAR BOUTIQUE JOURNAL editorial image" />
      ) : null}
      <div className={styles.sectionHead} data-cbj-reveal>
        <p className={isDark ? styles.darkEyebrow : styles.sectionEyebrow}>{section.chapterLabel}</p>
        <h2 className={isDark ? styles.darkSectionTitle : styles.sectionTitle} style={fitTitleStyle(section.displayTitle, 0.80)}>{renderTitleLines([section.displayTitle])}</h2>
        {section.deck ? <p className={isDark ? styles.darkSectionDeck : styles.sectionDeck}>{section.deck}</p> : null}
      </div>
      <div className={styles.sectionBody}>
        {section.kind === "conclusion" && injectedKeyPoints.length > 0 && !hasDecisionCards(section) ? renderKeyPointCards(injectedKeyPoints) : null}
        {section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex, linkIndex, section.kind))}
      </div>
    </section>
  );
}

export function DecisionArticlePage({ article, labels, linkIndex }: DecisionArticlePageProps) {
  const articleKind = resolveArticleKind(labels);
  const images = getHeroImages(articleKind);
  const sections = normalizeSections(article.sections);
  const keyPoints = article.keyPoints ?? [];
  const checkpoints = article.checkpoints ?? [];
  const faq = article.faq ?? [];
  const actionBox = article.actionBox ?? null;
  const relatedItems = article.relatedItems ?? [];
  const sources = (article.sources ?? []).map((source) => String(source ?? "").trim()).filter(Boolean);
  const breadcrumbTrail = article.breadcrumbTrail ?? [];
  const updated = formatDateDot(article.updatedAt ?? article.publishedAt);
  const heroCopy = resolveHeroCopy(article);
  const closingActions = actionBox?.actions ?? [];
  const heroBackgroundImage = article.heroImage?.trim() || images[0];

  return (
    <main className={styles.page} data-cbj-article-page>
      <DecisionArticleMotion />
      <div id="top" />

      <section className={styles.hero} aria-labelledby="decision-article-title" data-cbj-reveal data-cbj-parallax>
        <div className={styles.heroBackdrop} aria-hidden="true">
          <Image
            src={heroBackgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.heroBackdropImage}
          />
        </div>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {breadcrumbTrail.map((item, index) => (
              <span key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
                {item.href ? (
                  <Link className={styles.breadcrumbLink} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                {index < breadcrumbTrail.length - 1 ? <span className={styles.breadcrumbSep}>/</span> : null}
              </span>
            ))}
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.metaLine} data-cbj-reveal data-cbj-delay={80}>
                <span>{articleKind}</span>
                <span>{article.eyebrowLabel}</span>
                {updated ? <span>{updated}</span> : null}
                {article.readMinutes ? <span>{article.readMinutes} MIN</span> : null}
              </div>
              <h1 id="decision-article-title" className={styles.title} style={fitTitleStyle(heroCopy.titleLines.join(""), 1)} data-cbj-reveal data-cbj-delay={160}>{renderTitleLines(heroCopy.titleLines)}</h1>
              {heroCopy.lead ? <p className={styles.lead} data-cbj-reveal data-cbj-delay={260}>{formatSentenceBreaks(heroCopy.lead)}</p> : null}

              <div className={styles.chapterCue} aria-label="スクロール案内" data-cbj-reveal data-cbj-delay={360}>
                <span className={styles.chapterNumber}>01</span>
                <span className={styles.chapterWord}>CHAPTER</span>
                <span className={styles.chapterTopic}>先に結論</span>
                <span className={styles.chapterLine} />
                <span className={styles.scrollWord}>SCROLL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.articleRail}>
        <article className={styles.content}>
          {sections.map((section, index) => (
            <Fragment key={section.id}>
              {renderSection(
                section,
                index,
                linkIndex,
                index === 1 ? images[0] : index === 3 ? images[1] : undefined,
                index === 0 ? keyPoints : [],
              )}
              {index === 0 ? renderCheckpointPanel(checkpoints) : null}
            </Fragment>
          ))}
        </article>

        {renderFaqItems(faq)}

        {(sources.length > 0 || article.updateText) ? (
          <div className={styles.metaArchive} data-cbj-reveal data-cbj-parallax>
            {sources.length > 0 ? (
              <details className={styles.sourceDetails}>
                <summary>{labels.sourcesTitle ?? "出典・参考資料"}</summary>
                <p className={styles.sourceDeck}>自治体・公的機関・関連資料の公開情報を確認しています。</p>
                <ol className={styles.sourceList}>
                  {sources.map((source, index) => (
                    <li key={index}>
                      {isExternalHref(source) ? (
                        <a href={source} target="_blank" rel="noreferrer" className={styles.sourceLink}>
                          {renderSourcesSummary(source)}
                        </a>
                      ) : (
                        source
                      )}
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}

            {article.updateText ? (
              <p className={styles.updateLine}>
                <span>{labels.updateTitle ?? "更新履歴"}</span>
                {article.updateText}
              </p>
            ) : null}
          </div>
        ) : null}

        <section className={styles.endCard} data-cbj-reveal data-cbj-parallax>
          <div className={styles.endImageWrap}>
            <Image src={images[2]} alt="CAR BOUTIQUE JOURNAL closing image" fill sizes="(max-width: 780px) 100vw, 640px" className={styles.endImage} />
          </div>
          <p className={styles.endBrand}>CAR BOUTIQUE JOURNAL</p>
          <h2 style={fitTitleStyle(heroCopy.closingTitle, 0.78)}>{renderTitleLines([heroCopy.closingTitle])}</h2>
          {(actionBox?.body ?? heroCopy.lead) ? <p className={styles.endLead}>{formatSentenceBreaks(actionBox?.body ?? heroCopy.lead ?? "")}</p> : null}
          {relatedItems.length > 0 ? (
            <p className={styles.endRelatedHint}>{labels.relatedTitle}は一覧から確認できます。</p>
          ) : null}
          <div className={styles.footerLinks}>
            <Link href="#top" className={styles.endTextLink}>TOP</Link>
            <Link href={labels.footerListHref} className={styles.endTextLink}>{labels.footerListLabel}</Link>
            {closingActions.map(renderQuietAction)}
          </div>
        </section>
      </div>
    </main>
  );
}
