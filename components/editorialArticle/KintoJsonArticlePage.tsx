import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import type { GuideDetailSection } from "@/lib/content-types";
import type { EditorialArticleLabels, EditorialArticlePageProps, EditorialArticleViewModel } from "@/components/editorialArticle/EditorialArticlePage";

import styles from "@/components/editorialArticle/kinto-json-article.module.css";

type ArticleSection = GuideDetailSection & { id: string; displayTitle: string; label: string };

const stripNumber = (text?: string | null) => String(text ?? "")
  .replace(/^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩])\s*[\).）．.、:：-]?\s*/u, "")
  .replace(/^\s*\d{1,2}\s*[\).）．.、:：-]?\s*/u, "")
  .trim();
const compact = (text?: string | null) => String(text ?? "").replace(/\s+/g, "").trim();
const idFrom = (text: string, index: number) => text.trim().toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `section-${index + 1}`;

function dateDot(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function labelFor(title: string, index: number, labels: EditorialArticleLabels): string {
  const text = compact(title);
  if (/まとめ|SUMMARY/.test(text)) return "SUMMARY";
  if (/中古/.test(text)) return "USED CAR";
  if (/戻せない|負担|RISK/.test(text)) return "RISK";
  if (/車検|LEGAL|保安/.test(text)) return "LEGAL";
  if (/進め方|FLOW|順番/.test(text)) return "FLOW";
  if (/選び方|PARTS|カスタム別/.test(text)) return "PARTS";
  return labels.footerListHref.startsWith("/column") ? (index === 0 ? "BASICS" : "VIEW") : (index === 0 ? "BASICS" : "GUIDE");
}

function normalizeSections(article: EditorialArticleViewModel, labels: EditorialArticleLabels): ArticleSection[] {
  return (article.sections ?? []).map((section, index) => {
    const title = stripNumber(section.title) || `セクション${index + 1}`;
    return { ...section, id: section.id?.trim() || idFrom(title, index), displayTitle: section.displayTitle?.trim() || title, label: section.chapterLabel?.trim() || labelFor(title, index, labels) };
  });
}

function RichText({ text, linkIndex, as = "p", className, highlights }: { text: string; linkIndex: Record<string, InternalLinkMeta>; as?: "p" | "span"; className?: string; highlights?: string[] | null }) {
  return <TextWithInternalLinkCards text={text} linkIndex={linkIndex} as={as} className={styles.richText} textClassName={className ?? styles.paragraph} cardsClassName={styles.inlineCards} highlights={highlights ?? undefined} />;
}

function renderList(items: string[] = [], key: string, linkIndex: Record<string, InternalLinkMeta>) {
  return <ol key={key} className={styles.stepList}>{items.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><RichText text={item} linkIndex={linkIndex} as="span" className={styles.smallText} /></li>)}</ol>;
}

function renderImage(block: any, key: string) {
  if (!block.src) return null;
  return <figure key={key} className={styles.figure}><Image src={block.src} alt={block.alt || ""} width={1600} height={1000} sizes="(max-width: 760px) 100vw, 760px" />{(block.label || block.alt) ? <figcaption>{block.label || block.alt}</figcaption> : null}</figure>;
}

function renderTable(block: any, key: string, linkIndex: Record<string, InternalLinkMeta>) {
  const valueHeaders = (block.headers ?? []).slice(1);
  return <section key={key} className={styles.checkBlock}>{block.title ? <h3>{renderInlineMarkdown(stripNumber(block.title))}</h3> : null}<div className={styles.checkRows}>{(block.rows ?? []).map((row: string[], rowIndex: number) => {
    const title = stripNumber(row[0] ?? `${rowIndex + 1}`);
    const values = row.slice(1);
    return <article key={rowIndex}><span className={styles.checkCat}>{title}</span>{values.length <= 1 ? <RichText text={values[0] ?? ""} linkIndex={linkIndex} className={styles.smallText} /> : <div className={styles.cardPair}>{values.map((value, valueIndex) => <div key={valueIndex} className={valueIndex === 0 ? styles.warnCard : styles.infoCard}><b>{valueHeaders[valueIndex] ?? `内容${valueIndex + 1}`}</b><RichText text={value} linkIndex={linkIndex} className={styles.smallText} /></div>)}</div>}</article>;
  })}</div>{block.note ? <p className={styles.note}>{renderInlineMarkdown(block.note)}</p> : null}</section>;
}

function renderFlow(block: any, key: string) {
  const steps = block.steps ?? block.items ?? [];
  return <section key={key} className={styles.flowBlock}>{block.title ? <h3>{renderInlineMarkdown(stripNumber(block.title))}</h3> : null}<ol>{steps.map((step: any, index: number) => <li key={index}><span>{step.label || String(index + 1).padStart(2, "0")}</span><div>{step.title ? <h4>{renderInlineMarkdown(stripNumber(step.title))}</h4> : null}{step.body ? <p>{renderInlineMarkdown(step.body)}</p> : null}</div></li>)}</ol></section>;
}

function renderCallout(block: any, key: string, linkIndex: Record<string, InternalLinkMeta>) {
  return <aside key={key} className={block.tone === "warn" ? styles.warnCard : styles.infoCard}>{block.title ? <b>{renderInlineMarkdown(stripNumber(block.title))}</b> : null}{block.body ? <RichText text={block.body} linkIndex={linkIndex} className={styles.cardText} /> : null}{block.items?.length ? renderList(block.items, `${key}-items`, linkIndex) : null}</aside>;
}

function renderCards(block: any, key: string, linkIndex: Record<string, InternalLinkMeta>) {
  const items = block.cards ?? block.items ?? block.cases ?? [];
  return <section key={key} className={styles.cardsBlock}>{block.title ? <h3>{renderInlineMarkdown(stripNumber(block.title))}</h3> : null}<div>{items.map((item: any, index: number) => <article key={index} className={styles.infoCard}><span>{item.badge ?? item.number ?? String(index + 1).padStart(2, "0")}</span><b>{renderInlineMarkdown(stripNumber(item.title))}</b>{item.body || item.intro ? <RichText text={item.body ?? item.intro} linkIndex={linkIndex} className={styles.cardText} /> : null}{item.items?.length ? renderList(item.items, `${key}-${index}`, linkIndex) : null}</article>)}</div></section>;
}

function renderBlock(block: any, index: number, linkIndex: Record<string, InternalLinkMeta>) {
  const key = `block-${index}`;
  switch (block.type) {
    case "paragraph": return <RichText key={key} text={block.text} linkIndex={linkIndex} className={index === 0 ? styles.leadParagraph : styles.paragraph} highlights={block.highlights} />;
    case "image": return renderImage(block, key);
    case "list": return renderList(block.items, key, linkIndex);
    case "subheading": return <h3 key={key} className={styles.subheading}>{renderInlineMarkdown(stripNumber(block.title))}</h3>;
    case "quote": return <blockquote key={key} className={styles.quote}>{renderInlineMarkdown(block.text)}</blockquote>;
    case "divider": return <hr key={key} className={styles.divider} />;
    case "comparisonTable": return renderTable(block, key, linkIndex);
    case "callout": return renderCallout(block, key, linkIndex);
    case "flow": case "timeline": return renderFlow(block, key);
    case "decisionCards": case "editorialBoard": case "caseStudy": return renderCards(block, key, linkIndex);
    default: return null;
  }
}

function KeyPoints({ article, linkIndex }: { article: EditorialArticleViewModel; linkIndex: Record<string, InternalLinkMeta> }) {
  const items = article.keyPoints?.length ? article.keyPoints : article.checkpoints;
  if (!items?.length) return null;
  return <aside className={styles.importantBox}><b>重要</b><ol>{items.slice(0, 3).map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><RichText text={item} linkIndex={linkIndex} as="span" className={styles.cardText} /></li>)}</ol></aside>;
}

function sectionClass(section: ArticleSection, index: number) {
  const text = compact(`${section.label} ${section.title}`);
  return [styles.section, index % 2 === 0 ? styles.whiteSection : styles.softSection, /戻せない|負担|RISK/.test(text) ? styles.darkSection : ""].filter(Boolean).join(" ");
}

function Hero({ article, labels }: { article: EditorialArticleViewModel; labels: EditorialArticleLabels }) {
  const updated = dateDot(article.updatedAt || article.publishedAt);
  return <section className={styles.hero}><div className={styles.topLine} /><div className={styles.container}><div className={styles.saveTag}><span>{labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE"}</span><i /></div><div className={styles.heroLayout}><div><h1>{article.title}</h1>{article.lead ? <p>{article.lead}</p> : null}<dl className={styles.heroMeta}>{updated ? <div><dt>UPDATED</dt><dd>{updated}</dd></div> : null}{article.readMinutes ? <div><dt>READ</dt><dd>{article.readMinutes} MIN</dd></div> : null}</dl></div><div className={styles.heroCharacter} aria-hidden="true" /></div></div></section>;
}

export function KintoJsonArticlePage({ article, labels, linkIndex }: EditorialArticlePageProps) {
  const sections = normalizeSections(article, labels);
  const faq = article.faq ?? [];
  const sources = (article.sources ?? []).filter(Boolean);
  const related = article.relatedItems ?? [];
  return <main className={styles.page} data-cbj-article-page><Hero article={article} labels={labels} /><section className={styles.introBand}><div className={styles.containerSm}>{article.lead ? <p>{article.lead}</p> : null}<KeyPoints article={article} linkIndex={linkIndex} /></div></section>{sections.map((section, index) => <section key={section.id} id={section.id} className={sectionClass(section, index)}><div className={styles.container}><div className={styles.chapterHead}><div><span>{String(index + 1).padStart(2, "0")} ／ {section.label}</span><h2>{section.displayTitle}</h2>{section.deck ? <p>{section.deck}</p> : null}</div><i aria-hidden="true" /></div><div className={styles.bodyFlow}>{section.blocks.map((block, blockIndex) => <Fragment key={`${section.id}-${blockIndex}`}>{renderBlock(block, blockIndex, linkIndex)}</Fragment>)}</div></div></section>)}{faq.length ? <section className={styles.faqSection} id="faq"><div className={styles.container}><span>FAQ ／ よくある質問</span><h2>よくある質問</h2><div>{faq.map((item, index) => <details key={index}><summary><b>Q</b>{item.question}<i>＋</i></summary><p>{item.answer}</p></details>)}</div></div></section> : null}{(sources.length || article.updateText) ? <section className={styles.sourceSection}><div className={styles.container}>{sources.length ? <details><summary>{labels.sourcesTitle ?? "出典・参考資料"}<span>{sources.length}件</span></summary><ol>{sources.map((source, index) => <li key={index}>{source}</li>)}</ol></details> : null}{article.updateText ? <details><summary>{labels.updateTitle ?? "更新履歴"}<span>表示</span></summary><p>{article.updateText}</p></details> : null}</div></section> : null}{related.length ? <section className={styles.relatedSection}><div className={styles.container}><span>RELATED</span><h2>{labels.relatedTitle}</h2><div>{related.slice(0, 3).map((item) => <Link key={item.href} href={item.href}>{item.imageSrc ? <Image src={item.imageSrc} alt={item.imageAlt || item.title} width={640} height={400} /> : null}<small>{item.metaLabel}</small><b>{item.title}</b><p>{item.summary}</p></Link>)}</div></div></section> : null}</main>;
}
