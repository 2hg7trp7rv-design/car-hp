import Image from "next/image";
import Link from "next/link";

import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import type { GuideDetailSection } from "@/lib/content-types";
import type { EditorialArticleLabels, EditorialArticlePageProps, EditorialArticleViewModel } from "@/components/editorialArticle/EditorialArticlePage";
import customRegretLayoutJson from "@/data/article-layouts/modern-car-custom-regret-reason-column.layout.json";
import styles from "@/components/editorialArticle/kinto-json-article.module.css";

type AnyBlock = Record<string, unknown>;
type ArticleSection = GuideDetailSection & { id: string; displayTitle?: string | null; deck?: string | null; chapterLabel?: string | null };
type KintoArticle = EditorialArticleViewModel & { slug?: string | null; layoutId?: string | null };
type KintoArticleProps = Omit<EditorialArticlePageProps, "article"> & { article: KintoArticle };
type SectionType = "chapter" | "check" | "guide" | "tips" | "dark-risk" | "steps" | "mindset" | "conclusion";
type SectionSpec = { type: SectionType; id: string; label: string; variant?: "white" | "offwhite" | "dark"; score?: string; character?: string; summaryVariant?: "light" | "offwhite" | "dark" };
type LayoutConfig = { slug: string; designSystem?: string; hero?: { score?: string; imageSrc?: string; imageAlt?: string; character?: string }; imageOverrides?: Record<string, string>; sections?: Record<string, SectionSpec>; mindset?: { accent?: string }; conclusion?: { pillars?: Array<{ title: string; body: string }>; bottomImage?: string } };

const layoutJson = customRegretLayoutJson as LayoutConfig;
const text = (value: unknown) => (typeof value === "string" ? value : "");
const textList = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const objectList = (value: unknown): AnyBlock[] => (Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as AnyBlock[]) : []);
const blocksOf = (section: ArticleSection): AnyBlock[] => objectList((section as unknown as { blocks?: unknown }).blocks);
const stripNumber = (value?: string | null) => String(value ?? "").replace(/^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩]|\d{1,2})\s*[\).）．.、:：-]?\s*/u, "").trim();
const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const idFrom = (value: string, index: number) => value.trim().toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `section-${index + 1}`;
const sectionTitle = (section: ArticleSection, index: number) => section.displayTitle?.trim() || stripNumber(section.title) || `セクション${index + 1}`;
const mainTitle = (value: string) => stripNumber(value.split(/。\n|\n/u)[0]).replace(/。$/u, "") || value;
const subTitle = (value: string) => value.split(/。\n|\n/u).slice(1).join("。 ").replace(/。$/u, "").trim();

function layoutFor(article: KintoArticle): LayoutConfig | null {
  return article.slug === layoutJson.slug || article.layoutId === layoutJson.slug || article.layoutId === layoutJson.designSystem ? layoutJson : null;
}
function sectionsFor(article: KintoArticle): ArticleSection[] {
  return ((article.sections ?? []) as ArticleSection[]).map((section, index) => ({ ...section, id: section.id?.trim() || idFrom(sectionTitle(section, index), index) }));
}
function dotDate(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
function rich({ value, linkIndex, className }: { value?: string | null; linkIndex: Record<string, InternalLinkMeta>; className?: string }) {
  return value ? <TextWithInternalLinkCards text={value} linkIndex={linkIndex} as="p" className={styles.richText} textClassName={className ?? styles.bodyText} cardsClassName={styles.inlineCards} /> : null;
}
function AccentTitle({ title, hero = false }: { title: string; hero?: boolean }) {
  const clean = stripNumber(title);
  return clean.includes("後悔しやすい理由") ? <>{clean.replace(/後悔しやすい理由/u, "")}<span className={hero ? styles.heroTitleAccent : styles.chapterTitleAccent}>後悔しやすい理由</span></> : <>{clean}</>;
}
function ScoreBadge({ value }: { value?: string }) {
  const score = String(value ?? "10").replace("/10", "");
  return <div className={styles.scoreBadge} aria-hidden="true"><span className={styles.scoreNum}>{score}</span><span className={styles.scoreDen}>/10</span></div>;
}
function importantLine(article: KintoArticle) {
  for (const section of sectionsFor(article)) {
    for (const block of blocksOf(section)) {
      const hit = textList(block.highlights).find((item) => /戻せる|説明|安全|物理的|使い続け|後悔/.test(item));
      if (hit) return hit;
    }
  }
  return article.keyPoints?.[0] ?? article.checkpoints?.[0] ?? null;
}

function Hero({ article, labels, layout }: { article: KintoArticle; labels: EditorialArticleLabels; layout: LayoutConfig | null }) {
  const updated = dotDate(article.updatedAt || article.publishedAt);
  return <header className={styles.hero}><div className={styles.heroTopline} /><div className={styles.container}><div className={styles.saveTag}><span className={styles.saveTagLabel}>保存版</span></div><div className={styles.heroGrid}><div className={styles.heroCopy}><p className={styles.heroEyebrow}>{labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE"}</p><h1 className={styles.heroTitle}><AccentTitle title={mainTitle(article.title)} hero /></h1><p className={styles.heroLead}>{subTitle(article.title) || article.lead || ""}</p><dl className={styles.heroMeta}>{updated ? <div><dt>UPDATED</dt><dd>{updated}</dd></div> : null}{article.readMinutes ? <div><dt>READ</dt><dd>{article.readMinutes} MIN</dd></div> : null}</dl></div>{layout?.hero?.character ? <div className={styles.heroCharacterWrap}><ScoreBadge value={layout.hero.score} /><Image className={styles.heroCharacter} src={layout.hero.character} alt="" width={220} height={330} priority /></div> : null}</div></div></header>;
}
function Intro({ article, layout, linkIndex }: { article: KintoArticle; layout: LayoutConfig | null; linkIndex: Record<string, InternalLinkMeta> }) {
  const src = layout?.hero?.imageSrc ?? article.heroImage;
  const important = importantLine(article);
  return <section className={styles.intro}><div className={styles.containerText}>{rich({ value: article.lead, linkIndex, className: styles.leadBody })}{src ? <Image className={styles.imgHero} src={src} alt={layout?.hero?.imageAlt || article.heroAlt || article.title} width={1200} height={675} priority /> : null}{important ? <aside className={styles.importantBox}><span className={styles.importantBoxAccent}>重要</span><p className={styles.importantText}>{important}</p></aside> : null}</div></section>;
}
function ChapterHeader({ section, spec, index }: { section: ArticleSection; spec: SectionSpec; index: number }) {
  return <div className={styles.chapterHeaderFlex}><div><p className={styles.chapterLabel}>{spec.label || `CHAPTER ${String(index + 1).padStart(2, "0")}`}</p><h2 className={styles.chapterTitle}><AccentTitle title={sectionTitle(section, index)} /></h2>{section.deck ? <span className={styles.chapterDeck}>{section.deck}</span> : null}</div>{spec.character ? <Image className={styles.chapterCharacter} src={spec.character} alt="" width={120} height={180} /> : spec.score ? <div className={styles.chapterScore}>{spec.score}</div> : null}</div>;
}
function Figure({ block, layout }: { block: AnyBlock; layout: LayoutConfig | null }) {
  const rawSrc = text(block.src);
  const src = rawSrc ? layout?.imageOverrides?.[rawSrc] ?? rawSrc : "";
  const caption = text(block.label) || text(block.alt);
  return src ? <figure className={styles.figure}><Image className={styles.imgSection} src={src} alt={caption} width={1200} height={675} />{caption ? <figcaption className={styles.figcaption}>{caption}</figcaption> : null}</figure> : null;
}
function ListBlock({ items, linkIndex }: { items: string[]; linkIndex: Record<string, InternalLinkMeta> }) {
  return <ol className={styles.stepList}>{items.map((item, index) => <li className={styles.stepItem} key={index}><span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span>{rich({ value: item, linkIndex, className: styles.stepDesc })}</li>)}</ol>;
}
function Cards({ items, linkIndex }: { items: AnyBlock[]; linkIndex: Record<string, InternalLinkMeta> }) {
  return <div className={styles.systemsGrid}>{items.map((item, index) => <article className={styles.borderCardNeutral} key={index}><span className={styles.borderCardLabelNeutral}>{text(item.badge) || text(item.number) || String(index + 1).padStart(2, "0")}</span>{item.title ? <h3 className={styles.cardTitle}>{renderInlineMarkdown(stripNumber(text(item.title)))}</h3> : null}{item.body || item.intro ? rich({ value: text(item.body) || text(item.intro), linkIndex, className: styles.cardText }) : null}{Array.isArray(item.items) ? <ListBlock items={textList(item.items)} linkIndex={linkIndex} /> : null}</article>)}</div>;
}
function TableBlock({ block, linkIndex }: { block: AnyBlock; linkIndex: Record<string, InternalLinkMeta> }) {
  const headers = Array.isArray(block.headers) ? block.headers.slice(1) : [];
  const rows = Array.isArray(block.rows) ? (block.rows as unknown[][]) : [];
  const ngOk = headers.some((header) => /NG|避けたい|OK|確認/.test(text(header)));
  if (ngOk) return <div className={styles.checkRow}>{rows.map((row, i) => <article className={styles.borderCardTiffany} key={i}><h3 className={styles.cardTitle}>{stripNumber(text(row[0]))}</h3><div className={styles.checkRow}>{row.slice(1).map((value, j) => <section key={j} className={j === 0 ? styles.borderCardWarning : styles.borderCardTiffany}><span className={j === 0 ? styles.borderCardLabelWarning : styles.borderCardLabelTiffany}>{j === 0 ? "NG" : "OK"}</span>{rich({ value: text(value), linkIndex, className: styles.cardText })}</section>)}</div></article>)}</div>;
  return <div className={styles.systemsGrid}>{rows.map((row, i) => <article className={styles.borderCardTiffany} key={i}><span className={styles.borderCardLabelTiffany}>{String(i + 1).padStart(2, "0")}</span><h3 className={styles.cardTitle}>{stripNumber(text(row[0]))}</h3>{rich({ value: text(row[1]), linkIndex, className: styles.cardText })}</article>)}</div>;
}
function FlowBlock({ block }: { block: AnyBlock }) {
  return <ol className={styles.stepList}>{objectList(block.steps ?? block.items).map((step, index) => <li className={styles.stepItem} key={index}><span className={styles.stepNum}>{text(step.label) || String(index + 1).padStart(2, "0")}</span><div>{step.title ? <h3 className={styles.stepTitle}>{renderInlineMarkdown(stripNumber(text(step.title)))}</h3> : null}{step.body ? <p className={styles.stepDesc}>{renderInlineMarkdown(text(step.body))}</p> : null}</div></li>)}</ol>;
}
function Callout({ block, linkIndex }: { block: AnyBlock; linkIndex: Record<string, InternalLinkMeta> }) {
  const warn = block.tone === "warn";
  return <aside className={warn ? styles.borderCardWarning : styles.solutionBox}>{block.title ? <span className={warn ? styles.borderCardLabelWarning : styles.solutionBoxLabel}>{renderInlineMarkdown(stripNumber(text(block.title)))}</span> : null}{block.body ? rich({ value: text(block.body), linkIndex, className: styles.cardText }) : null}{Array.isArray(block.items) ? <ListBlock items={textList(block.items)} linkIndex={linkIndex} /> : null}</aside>;
}
function RenderBlock({ block, layout, linkIndex, index }: { block: AnyBlock; layout: LayoutConfig | null; linkIndex: Record<string, InternalLinkMeta>; index: number }) {
  switch (block.type) {
    case "paragraph": return rich({ value: text(block.text), linkIndex, className: index === 0 ? styles.leadBody : styles.bodyText });
    case "image": return <Figure block={block} layout={layout} />;
    case "list": return <ListBlock items={textList(block.items)} linkIndex={linkIndex} />;
    case "subheading": return <h3 className={styles.cardTitle}>{renderInlineMarkdown(stripNumber(text(block.title)))}</h3>;
    case "quote": return <blockquote className={styles.mindsetBox}><p className={styles.mindsetAccent}>{renderInlineMarkdown(text(block.text))}</p></blockquote>;
    case "comparisonTable": return <TableBlock block={block} linkIndex={linkIndex} />;
    case "callout": return <Callout block={block} linkIndex={linkIndex} />;
    case "flow": case "timeline": return <FlowBlock block={block} />;
    case "decisionCards": case "editorialBoard": case "caseStudy": return <Cards items={objectList(block.cards ?? block.items ?? block.cases)} linkIndex={linkIndex} />;
    default: return null;
  }
}
function CharacterSummary({ spec, textValue }: { spec?: SectionSpec; textValue?: string | null }) {
  if (!spec?.character || !textValue) return null;
  const variant = spec.summaryVariant === "dark" ? styles.charSummaryDark : spec.summaryVariant === "offwhite" ? styles.charSummaryOffwhite : styles.charSummaryLight;
  return <aside className={cx(styles.charSummary, variant)}><Image className={styles.charSummaryImg} src={spec.character} alt="" width={120} height={180} /><div><span className={styles.charSummaryLabel}>{spec.type === "dark-risk" ? "CHECK" : "GUIDE"}</span><p className={styles.charSummaryText}>{textValue}</p></div></aside>;
}
function SectionRenderer({ section, spec, index, layout, linkIndex }: { section: ArticleSection; spec: SectionSpec; index: number; layout: LayoutConfig | null; linkIndex: Record<string, InternalLinkMeta> }) {
  if (spec.type === "mindset") return <MindsetSection section={section} spec={spec} index={index} layout={layout} linkIndex={linkIndex} />;
  if (spec.type === "conclusion") return <Conclusion section={section} spec={spec} index={index} layout={layout} linkIndex={linkIndex} />;
  const wrapper = spec.type === "dark-risk" || spec.variant === "dark" ? styles.sectionDark : spec.variant === "offwhite" ? styles.sectionOffwhite : styles.sectionWhite;
  const blocks = blocksOf(section);
  const highlight = blocks.flatMap((block) => textList(block.highlights)).find(Boolean);
  return <section id={section.id} className={cx(styles.section, wrapper)}><div className={styles.container}><ChapterHeader section={section} spec={spec} index={index} /><div className={styles.contentFlow}>{blocks.map((block, i) => <RenderBlock key={i} block={block} index={i} layout={layout} linkIndex={linkIndex} />)}</div><CharacterSummary spec={spec} textValue={highlight || section.deck} /></div></section>;
}
function MindsetSection({ section, spec, index, layout, linkIndex }: { section: ArticleSection; spec: SectionSpec; index: number; layout: LayoutConfig | null; linkIndex: Record<string, InternalLinkMeta> }) {
  const blocks = blocksOf(section);
  return <section id={section.id} className={cx(styles.section, styles.sectionOffwhite)}><div className={styles.containerText}><ChapterHeader section={section} spec={spec} index={index} /><div className={styles.mindsetBox}><p className={styles.mindsetAccent}>{layout?.mindset?.accent ?? sectionTitle(section, index)}</p><div className={styles.contentFlow}>{blocks.map((block, i) => <RenderBlock key={i} block={block} index={i} layout={layout} linkIndex={linkIndex} />)}</div></div></div></section>;
}
function Conclusion({ section, spec, index, layout, linkIndex }: { section: ArticleSection; spec: SectionSpec; index: number; layout: LayoutConfig | null; linkIndex: Record<string, InternalLinkMeta> }) {
  const blocks = blocksOf(section);
  return <section id={section.id} className={cx(styles.section, styles.sectionWhite)}><div className={styles.container}><ChapterHeader section={section} spec={spec} index={index} /><div className={styles.conclusionLead}>{blocks.slice(0, 2).map((block, i) => <RenderBlock key={i} block={block} index={i} layout={layout} linkIndex={linkIndex} />)}</div>{layout?.conclusion?.pillars?.length ? <div className={styles.pillarsGrid}>{layout.conclusion.pillars.map((pillar, i) => <article className={styles.borderCardTiffany} key={i}><span className={styles.borderCardLabelTiffany}>{String(i + 1).padStart(2, "0")}</span><h3 className={styles.cardTitle}>{pillar.title}</h3><p className={styles.cardText}>{pillar.body}</p></article>)}</div> : null}{layout?.conclusion?.bottomImage ? <Image className={styles.imgSection} src={layout.conclusion.bottomImage} alt="カスタム前に確認したい3つの柱" width={1200} height={675} /> : null}{blocks.slice(2).map((block, i) => <RenderBlock key={i} block={block} index={i + 2} layout={layout} linkIndex={linkIndex} />)}</div></section>;
}
export function KintoJsonArticlePage({ article, labels, linkIndex }: KintoArticleProps) {
  const layout = layoutFor(article);
  const sections = sectionsFor(article);
  const related = article.relatedItems ?? [];
  const sources = (article.sources ?? []).filter(Boolean);
  return <main className={styles.articlePage} data-cbj-article-page><Hero article={article} labels={labels} layout={layout} /><Intro article={article} layout={layout} linkIndex={linkIndex} />{sections.map((section, index) => { const spec = layout?.sections?.[section.id] ?? ({ type: "chapter", id: section.id, label: section.chapterLabel || `CHAPTER ${String(index + 1).padStart(2, "0")}`, variant: index % 2 ? "offwhite" : "white" } as SectionSpec); return <SectionRenderer key={section.id} section={section} spec={spec} index={index} layout={layout} linkIndex={linkIndex} />; })}{article.faq?.length ? <section className={styles.faqSection} id="faq"><div className={styles.containerText}><p className={styles.faqLabel}>FAQ ／ よくある質問</p><h2 className={styles.faqTitle}>よくある質問</h2>{article.faq.map((item, index) => <details className={styles.faqItem} key={index}><summary className={styles.faqSummary}><b>Q</b>{item.question}<i>＋</i></summary><p className={styles.faqAnswer}>{item.answer}</p></details>)}</div></section> : null}{(sources.length || article.updateText) ? <section className={styles.sourceSection}><div className={styles.containerText}>{sources.length ? <details className={styles.sourceDetails}><summary className={styles.sourceSummary}>{labels.sourcesTitle ?? "出典・参考資料"}<span>{sources.length}件</span></summary><ol className={styles.sourceList}>{sources.map((source, index) => <li key={index}>{source}</li>)}</ol></details> : null}{article.updateText ? <details className={styles.sourceDetails}><summary className={styles.sourceSummary}>{labels.updateTitle ?? "更新履歴"}<span>表示</span></summary><p className={styles.faqAnswer}>{article.updateText}</p></details> : null}</div></section> : null}{related.length ? <section className={styles.relatedSection}><div className={styles.container}><p className={styles.relatedLabel}>RELATED</p><h2 className={styles.relatedTitle}>{labels.relatedTitle}</h2><div className={styles.relatedGrid}>{related.slice(0, 3).map((item) => <Link className={styles.relatedCard} key={item.href} href={item.href}>{item.imageSrc ? <Image src={item.imageSrc} alt={item.imageAlt || item.title} width={640} height={400} /> : null}<small>{item.metaLabel}</small><b>{item.title}</b><span>{item.summary}</span></Link>)}</div></div></section> : null}</main>;
}
