'use client';

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { ReactNode } from "react";
import type {
  ChapterData,
  CheckItem,
  JunaBubbleData,
  MechanismItem,
  RiskItem,
  StepItem,
  SystemCardItem,
  VisualArticleData,
} from "@/types/visual-article";
import type { EditorialArticleLabels, EditorialArticleViewModel } from "@/components/editorialArticle/EditorialArticlePage";
import styles from "@/components/editorialArticle/visual-json-article.module.css";

type IconProps = { className?: string };
type VisualJsonArticlePageProps = {
  data: VisualArticleData;
  article?: EditorialArticleViewModel;
  labels?: EditorialArticleLabels;
};

function WindIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h10.5a3 3 0 1 0-2.7-4.3" /><path d="M3 13h15.5a3 3 0 1 1-2.7 4.3" /><path d="M5 18h6" /></svg>;
}
function CircleDotIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.7" /></svg>;
}
function ZapIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
}
function ArrowRightIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

function Icon({ name, className }: IconProps & { name?: string }) {
  if (name === "Zap") return <ZapIcon className={className} />;
  if (name === "CircleDot") return <CircleDotIcon className={className} />;
  return <WindIcon className={className} />;
}

function FadeIn({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={`${styles.fadeIn} ${styles.visible} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function RichText({ value, className }: { value: string; className?: string }) {
  const parts = value.split(/(<strong>.*?<\/strong>)/g).filter(Boolean);
  return <span className={className}>{parts.map((part, index) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/);
    return match ? <strong key={index}>{match[1]}</strong> : <span key={index}>{part}</span>;
  })}</span>;
}

function TopNav({ data }: { data: VisualArticleData["meta"] }) {
  return <nav className={styles.topNav}><div className={styles.topNavInner}><span className={styles.navBrand}>CAR BOUTIQUE</span><span className={styles.navLesson}><span className={styles.navLessonJp}>講座</span> / LESSON {data.lessonNumber}</span></div></nav>;
}

function JunaBubble({ data }: { data: JunaBubbleData }) {
  return <div className={styles.junaBubble}><img src="/images/cbj/columns/cbj-guide-chara-1.PNG" alt="JUNA" className={styles.junaAvatar} /><div className={styles.junaBubbleContent}><div className={styles.junaBubbleTriangle} /><div className={styles.junaBubbleCard}>{data.badge ? <span className={styles.junaBadge}>{data.badge}</span> : null}{data.name ? <div className={styles.junaName}>{data.name}</div> : null}<p className={styles.junaText}><RichText value={data.text} /></p></div></div></div>;
}

function SectionLabel({ en, ja }: { en: string; ja?: string }) {
  return <div className={styles.sectionLabel}><span className={styles.sectionLabelText}>{en}</span>{ja ? <span className={styles.sectionLabelJa}>{ja}</span> : null}</div>;
}

function Hero({ data }: { data: VisualArticleData["meta"] }) {
  const accent = data.title.replace(/^車のカスタムで/u, "");
  return <section className={styles.hero}><div className={styles.container}><FadeIn><div className={styles.heroMeta}><span className={styles.heroMetaLabel}>{data.columnLabel}</span><span className={styles.heroMetaSlash}>/</span><span className={styles.heroMetaSub}>{data.columnSubLabel}</span></div><h1 className={styles.heroTitle}>車のカスタムで<br /><span className={styles.heroTitleAccent}>{accent}</span></h1><p className={styles.heroDescription}>{data.description}</p><div className={styles.heroTags}>{data.tags.map((tag) => <span key={tag.label} className={`${styles.heroTag} ${tag.accent ? styles.heroTagAccent : ""}`}>{tag.accent ? `● ${tag.label}` : tag.label}</span>)}</div></FadeIn></div></section>;
}

function IndexNav({ items }: { items: VisualArticleData["indexItems"] }) {
  return <section className={styles.indexSection}><div className={styles.container}><FadeIn><SectionLabel en="INDEX" ja="この記事の流れ" /><div className={styles.indexList}>{items.map((item) => <a key={item.number} href={item.href} className={styles.indexItem}><span className={styles.indexItemNum}>{item.number}</span><span className={styles.indexItemTitle}>{item.title}</span><ArrowRightIcon className={styles.indexItemArrow} /></a>)}</div></FadeIn></div></section>;
}

function Divider() {
  return <div className={styles.container}><FadeIn><div className={styles.divider}><div className={styles.dividerLine} /></div></FadeIn></div>;
}

function ChapterHeader({ number, title, description }: Pick<ChapterData, "number" | "title" | "description">) {
  const segments: Array<{ text: string; accent: boolean }> = [];
  const regex = /「([^」]+)」/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(title)) !== null) {
    if (match.index > lastIndex) segments.push({ text: title.slice(lastIndex, match.index), accent: false });
    segments.push({ text: `「${match[1]}」`, accent: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < title.length) segments.push({ text: title.slice(lastIndex), accent: false });
  if (segments.length === 0) segments.push({ text: title, accent: false });

  return <div className={styles.chapterHeader}><div className={styles.chapterWatermark}>{number}</div><span className={styles.chapterLabel}>CHAPTER</span><h2 className={styles.chapterTitle}>{segments.map((segment, index) => <span key={index} className={segment.accent ? styles.chapterAccent : ""}>{segment.text}</span>)}</h2><p className={styles.chapterDescription}>{description}</p></div>;
}

function SystemCards({ items }: { items: SystemCardItem[] }) {
  return <div className={styles.systemList}>{items.map((sys) => <div key={sys.number} className={styles.systemCard}><Icon name={sys.icon} className={styles.systemIcon} /><div><span className={styles.systemNum}>SYSTEM {sys.number}</span><h4 className={styles.systemTitle}>{sys.title}</h4><p className={styles.systemDesc}>{sys.description}</p></div></div>)}</div>;
}

function MechanismBlock({ data }: { data: MechanismItem }) {
  return <div className={styles.mechanism}><span className={styles.mechanismLabel}>{data.label}</span><h3 className={styles.mechanismTitle}>{data.title}</h3><p className={styles.mechanismDesc}>{data.description}</p>{data.diagramImage ? <div className={styles.mechanismDiagram}><img src={data.diagramImage} alt={data.title} />{data.caption ? <span className={styles.mechanismCaption}>{data.caption}</span> : null}</div> : null}</div>;
}

function RiskSection({ title, subtitle = "RISKS TO WATCH", items }: { title: string; subtitle?: string; items: RiskItem[] }) {
  return <div className={styles.riskSection}><div className={styles.riskHeader}><div className={styles.riskIcon}><span className={styles.riskIconText}>!</span></div><div className={styles.riskTitleWrap}><h3 className={styles.riskTitle}>{title}</h3><span className={styles.riskSubtitle}>{subtitle}</span></div></div><div className={styles.riskList}>{items.map((item) => <div key={item.title} className={styles.riskCard}><div className={styles.riskCardInner}><span className={styles.riskCardMark}>×</span><div><h4 className={styles.riskCardTitle}>{item.title}</h4><p className={styles.riskCardDesc}>{item.description}</p></div></div></div>)}</div></div>;
}

function CheckCards({ title, subtitle = "HOW TO DO IT RIGHT", items }: { title: string; subtitle?: string; items: CheckItem[] }) {
  return <div className={styles.checkSection}><div className={styles.checkHeader}><div className={styles.checkIcon}><svg className={styles.checkIconSvg} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 8 6.5 11.5 13 4.5" /></svg></div><div className={styles.checkTitleWrap}><h3 className={styles.checkTitle}>{title}</h3><span className={styles.checkSubtitle}>{subtitle}</span></div></div><div className={styles.checkList}>{items.map((item) => <div key={item.title} className={styles.checkItem}><div className={styles.checkBox}><svg className={styles.checkBoxSvg} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 8 6.5 11.5 13 4.5" /></svg></div><div><h4 className={styles.checkItemTitle}>{item.title}</h4><p className={styles.checkItemDesc}>{item.description}</p></div></div>)}</div></div>;
}

function StandaloneCheck({ data }: { data: VisualArticleData["checkSection"] }) {
  const title = data.title.replace("安心材料にしない", "").trim();
  return <section className={styles.standaloneCheck}><div className={styles.container}><FadeIn><span className={styles.standaloneCheckLabel}>{data.label}</span><h2 className={styles.standaloneCheckTitle}>{title}<br /><span className={styles.chapterAccent}>安心材料にしない</span></h2><p className={styles.standaloneCheckDesc}>{data.description}</p><div className={styles.standaloneCheckTags}>{data.tags.map((tag) => <span key={tag} className={styles.standaloneCheckTag}>{tag}</span>)}</div></FadeIn></div></section>;
}

function StepsSection({ items }: { items: StepItem[] }) {
  return <div className={styles.stepsSection}><div className={styles.stepsList}>{items.map((step) => <FadeIn key={step.number} delay={step.number * 60}><div className={styles.stepItem}><span className={styles.stepNumber}>+{step.number}</span><div><h4 className={styles.stepTitle}>{step.title}</h4><p className={styles.stepDesc}>{step.description}</p></div></div></FadeIn>)}</div></div>;
}

function EditorNote({ data }: { data: VisualArticleData["editorNote"] }) {
  return <div className={styles.editorNote}><p className={styles.editorNoteText}>{data.text.map((line, index) => <span key={line}>{data.accentParts.includes(index) ? <span className={styles.editorNoteAccent}>{line}</span> : line}{index < data.text.length - 1 ? <br /> : null}</span>)}</p><p className={styles.editorNoteAttr}>— {data.attribution}</p></div>;
}

function FinalSummary({ data }: { data: VisualArticleData["finalSummary"] }) {
  return <div className={styles.finalSummary}><SectionLabel en={data.label} ja={data.subLabel} /><h2 className={styles.finalSummaryTitle}><span>大事なのは、</span><span className={styles.chapterAccent}>戻せること</span><span>と</span><span className={styles.chapterAccent}>説明できること</span></h2><div className={styles.finalSummaryList}>{data.items.map((item) => <div key={item.num} className={styles.finalSummaryItem}><span className={styles.finalSummaryNum}>{item.num}</span><div><h4 className={styles.finalSummaryItemTitle}>{item.title}</h4><p className={styles.finalSummaryItemDesc}>{item.desc}</p></div></div>)}</div></div>;
}

function ChapterRenderer({ chapter }: { chapter: ChapterData }) {
  const introComments = chapter.junaComments.slice(0, -1);
  const summaryComment = chapter.junaComments[chapter.junaComments.length - 1];
  return <section id={chapter.id} className={styles.chapter}><div className={styles.container}><FadeIn><ChapterHeader number={chapter.number} title={chapter.title} description={chapter.description} /></FadeIn>{introComments.map((comment, index) => <div key={`${chapter.id}-intro-${index}`} className={styles.chapterJuna}><FadeIn><JunaBubble data={comment} /></FadeIn></div>)}{chapter.systems?.length ? <FadeIn><SystemCards items={chapter.systems} /></FadeIn> : null}{chapter.mechanisms?.map((mech) => <div key={mech.title} className={styles.mechanismWrap}><FadeIn><MechanismBlock data={mech} /></FadeIn></div>)}{chapter.risks?.length ? <div className={styles.riskWrap}><FadeIn><RiskSection title="ここがヤバい" items={chapter.risks} /></FadeIn></div> : null}{chapter.checks?.length ? <div className={styles.checkWrap}><FadeIn><CheckCards title="じゃあ、こうしよう" items={chapter.checks} /></FadeIn></div> : null}{summaryComment ? <div className={styles.chapterJuna}><FadeIn><JunaBubble data={summaryComment} /></FadeIn></div> : null}</div></section>;
}

function RelatedGuideSection({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) {
  const actions = article?.actionBox?.actions ?? [];
  const related = article?.relatedItems ?? [];
  if (!actions.length && !related.length) return null;
  return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="RELATED GUIDE" ja={labels?.relatedTitle ?? "関連する実用ガイド"} />{article?.actionBox?.body ? <p className={styles.layoutLead}>{article.actionBox.body}</p> : null}<div className={styles.relatedGuideGrid}>{actions.map((action) => <Link key={action.href} href={action.href} className={styles.relatedGuideCard}><span>GUIDE</span><b>{action.label}</b><ArrowRightIcon className={styles.relatedGuideArrow} /></Link>)}{related.map((item) => <Link key={item.href} href={item.href} className={styles.relatedGuideCard}><span>{item.metaLabel || "RELATED"}</span><b>{item.title}</b>{item.summary ? <p>{item.summary}</p> : null}<ArrowRightIcon className={styles.relatedGuideArrow} /></Link>)}</div></FadeIn></div></section>;
}

function FaqSection({ article }: { article?: EditorialArticleViewModel }) {
  const faq = article?.faq ?? [];
  if (!faq.length) return null;
  return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="FAQ" ja="よくある質問" /><div className={styles.faqList}>{faq.map((item) => <details key={item.question} className={styles.faqItem}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></FadeIn></div></section>;
}

function ReferencesSection({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) {
  const sources = article?.sources ?? [];
  if (!sources.length) return null;
  return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="REFERENCES" ja={labels?.sourcesTitle ?? "出典・参考資料"} /><ol className={styles.referenceList}>{sources.map((source, index) => <li key={source}><span>{String(index + 1).padStart(2, "0")}</span><a href={source} target="_blank" rel="noreferrer">{source.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></li>)}</ol></FadeIn></div></section>;
}

function UpdateNote({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) {
  if (!article?.updateText) return null;
  return <section className={styles.updateNoteSection}><div className={styles.container}><FadeIn><SectionLabel en="UPDATE NOTE" ja={labels?.updateTitle ?? "更新履歴"} /><div className={styles.updateNote}>{article.updateText}</div></FadeIn></div></section>;
}

function Footer() {
  return <footer className={styles.footer}><div className={styles.footerInner}><span className={styles.footerBrand}>CAR BOUTIQUE JOURNAL</span><div className={styles.footerLinks}><Link href="/column" className={styles.footerLink}>コラム一覧へ</Link><Link href="/legal/privacy" className={styles.footerLink}>Privacy</Link><Link href="/legal/terms" className={styles.footerLink}>Terms</Link><Link href="/contact" className={styles.footerLink}>Contact</Link></div><p className={styles.footerCopy}>© 2026 CAR BOUTIQUE JOURNAL</p></div></footer>;
}

export function VisualJsonArticlePage({ data, article, labels }: VisualJsonArticlePageProps) {
  return <div className={styles.page} data-cbj-visual-json-article><TopNav data={data.meta} /><Hero data={data.meta} /><section className={styles.sectionSpacing}><div className={styles.container}><FadeIn><JunaBubble data={data.junaIntro} /></FadeIn></div></section><IndexNav items={data.indexItems} /><Divider />{data.chapters.map((chapter) => <ChapterRenderer key={chapter.id} chapter={chapter} />)}<StandaloneCheck data={data.checkSection} /><Divider /><section id="chapter05" className={styles.chapter}><div className={styles.container}><FadeIn><ChapterHeader number="05" title="失敗しにくい進め方" description="順番が大事。派手さより、戻せること・説明できることを軸に。" /></FadeIn><div className={styles.chapterJuna}><FadeIn><JunaBubble data={{ text: "カスタムは自由に楽しめる。ただし、順番が大事。見た目や価格だけで選ばず、戻せることと説明できることを残す。" }} /></FadeIn></div><StepsSection items={data.steps} /><EditorNote data={data.editorNote} /><Divider /><FadeIn><FinalSummary data={data.finalSummary} /></FadeIn></div></section><RelatedGuideSection article={article} labels={labels} /><FaqSection article={article} /><ReferencesSection article={article} labels={labels} /><UpdateNote article={article} labels={labels} /><Footer /></div>;
}
