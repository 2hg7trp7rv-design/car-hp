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
type VisualJsonArticlePageProps = { data: VisualArticleData; article?: EditorialArticleViewModel; labels?: EditorialArticleLabels };
type TitleSegment = { text: string; accent: boolean };

function WindIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h10.5a3 3 0 1 0-2.7-4.3" /><path d="M3 13h15.5a3 3 0 1 1-2.7 4.3" /><path d="M5 18h6" /></svg>; }
function CircleDotIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.7" /></svg>; }
function ZapIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>; }
function ArrowRightIcon({ className }: IconProps) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>; }
function Icon({ name, className }: IconProps & { name?: string }) { if (name === "Zap") return <ZapIcon className={className} />; if (name === "CircleDot") return <CircleDotIcon className={className} />; return <WindIcon className={className} />; }
function FadeIn({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) { return <div className={`${styles.fadeIn} ${styles.visible} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>; }
function RichText({ value, className }: { value: string; className?: string }) { const parts = value.split(/(<strong>.*?<\/strong>)/g).filter(Boolean); return <span className={className}>{parts.map((part, index) => { const match = part.match(/^<strong>(.*?)<\/strong>$/); return match ? <strong key={index}>{match[1]}</strong> : <span key={index}>{part}</span>; })}</span>; }
function trimUrl(url: string) { return url.replace(/^https?:\/\//, "").replace(/\/$/, ""); }
function resolveDiagramImage(src?: string) { if (!src) return src; if (src.includes("intake")) return "/diagram-intake.png"; if (src.includes("suspension")) return "/diagram-suspension.png"; if (src.includes("canbus") || src.includes("can-bus")) return "/diagram-canbus.png"; return src; }

function segmentTitle(title: string, accentParts: number[] = []): TitleSegment[] {
  const terms = ["説明できること", "戻せること", "進め方", "失敗しにくい", "車全体", "吸気系", "足回り", "電装品"].filter((term) => title.includes(term));
  if (!terms.length) return [{ text: title, accent: accentParts.includes(0) }];
  const ranges = terms.map((term) => ({ term, start: title.indexOf(term), end: title.indexOf(term) + term.length })).filter((range) => range.start >= 0).sort((a, b) => a.start - b.start);
  const segments: string[] = [];
  let cursor = 0;
  ranges.forEach((range) => { if (range.start > cursor) segments.push(title.slice(cursor, range.start)); segments.push(title.slice(range.start, range.end)); cursor = range.end; });
  if (cursor < title.length) segments.push(title.slice(cursor));
  return segments.filter(Boolean).map((text, index) => ({ text, accent: accentParts.includes(index) }));
}
function SegmentedTitle({ title, accentParts }: { title: string; accentParts: number[] }) { return <>{segmentTitle(title, accentParts).map((segment, index) => <span key={`${segment.text}-${index}`} className={segment.accent ? styles.chapterAccent : undefined}>{segment.text}</span>)}</>; }

function VisualPolishStyles() {
  const css = `
    /* 1組目：RISK / CHECK を理想の紙面カード構造へ */
    .${styles.riskSection}{background:transparent!important;border:0!important;padding:0!important;border-radius:0!important;}
    .${styles.riskHeader}{display:grid!important;grid-template-columns:44px 1fr!important;gap:18px!important;align-items:center!important;margin-bottom:28px!important;}
    .${styles.riskIcon}{width:34px!important;height:34px!important;border-radius:10px!important;background:transparent!important;border:2px solid #3A8B8B!important;color:#3A8B8B!important;}
    .${styles.riskIconText}{font-size:18px!important;line-height:1!important;color:#3A8B8B!important;}
    .${styles.riskTitle}{font-family:'Noto Serif JP',serif!important;font-size:26px!important;line-height:1.25!important;letter-spacing:.02em!important;font-weight:700!important;color:#253032!important;}
    .${styles.riskSubtitle}{font-size:12px!important;letter-spacing:.25em!important;color:#9B958E!important;margin-top:8px!important;}
    .${styles.riskList}{display:grid!important;gap:18px!important;}
    .${styles.riskCard}{background:#FFFDF8!important;border:1px solid #DED6C7!important;border-left:5px solid #3A8B8B!important;border-radius:18px!important;padding:24px 24px 24px 28px!important;box-shadow:none!important;}
    .${styles.riskCardInner}{display:grid!important;grid-template-columns:24px 1fr!important;gap:14px!important;align-items:start!important;}
    .${styles.riskCardMark}{width:24px!important;height:24px!important;border-radius:0!important;background:transparent!important;color:#3A8B8B!important;font-size:24px!important;font-weight:400!important;line-height:1!important;}
    .${styles.riskCardTitle}{font-family:'Noto Serif JP',serif!important;font-size:20px!important;line-height:1.5!important;color:#253032!important;font-weight:700!important;}
    .${styles.riskCardDesc}{font-size:15px!important;line-height:2!important;color:#6D675F!important;margin-top:12px!important;}
    .${styles.checkSection}{background:transparent!important;border:0!important;padding:0!important;border-radius:0!important;}
    .${styles.checkHeader}{display:grid!important;grid-template-columns:44px 1fr!important;gap:18px!important;align-items:center!important;margin:0 0 26px!important;}
    .${styles.checkIcon}{width:38px!important;height:38px!important;border-radius:12px!important;background:#4FC3BE!important;color:#fff!important;}
    .${styles.checkTitle}{font-family:'Noto Serif JP',serif!important;font-size:28px!important;line-height:1.25!important;letter-spacing:.02em!important;color:#253032!important;}
    .${styles.checkSubtitle}{font-size:12px!important;letter-spacing:.25em!important;color:#9B958E!important;margin-top:8px!important;}
    .${styles.checkList}{background:#E4F7F5!important;border:2px solid #AEE8E2!important;border-radius:26px!important;padding:28px 26px!important;display:grid!important;gap:0!important;}
    .${styles.checkItem}{background:transparent!important;border-radius:0!important;padding:0 0 24px 0!important;display:grid!important;grid-template-columns:34px 1fr!important;gap:18px!important;border-bottom:1px dashed rgba(58,139,139,.32)!important;box-shadow:none!important;}
    .${styles.checkItem}:not(:first-child){padding-top:24px!important;}
    .${styles.checkItem}:last-child{border-bottom:0!important;padding-bottom:0!important;}
    .${styles.checkBox}{width:28px!important;height:28px!important;border-radius:8px!important;background:transparent!important;border:2px solid #4FBDB7!important;color:#4FBDB7!important;}
    .${styles.checkBoxSvg}{width:17px!important;height:17px!important;}
    .${styles.checkItemTitle}{font-family:'Noto Serif JP',serif!important;font-size:19px!important;line-height:1.55!important;color:#2C8F8D!important;font-weight:700!important;}
    .${styles.checkItemDesc}{font-size:15px!important;line-height:1.95!important;color:#596861!important;margin-top:10px!important;}

    /* 2組目：CHAPTER 05 手順を丸数字タイムラインへ */
    .${styles.stepsSection}{padding-top:52px!important;}
    .${styles.stepsList}{position:relative!important;display:flex!important;flex-direction:column!important;gap:46px!important;margin-left:0!important;}
    .${styles.stepsList}::before{content:"";position:absolute;left:26px;top:28px;bottom:28px;width:4px;background:#A9E7E2;border-radius:999px;}
    .${styles.stepItem}{position:relative!important;display:grid!important;grid-template-columns:58px 1fr!important;gap:26px!important;align-items:start!important;}
    .${styles.stepNumber}{position:relative!important;z-index:2!important;width:54px!important;height:54px!important;min-width:54px!important;border-radius:999px!important;display:grid!important;place-items:center!important;background:#12BFB8!important;color:#fff!important;font-family:'DM Sans',sans-serif!important;font-size:27px!important;font-weight:800!important;line-height:1!important;box-shadow:0 0 0 2px rgba(255,255,255,.32) inset!important;}
    .${styles.stepTitle}{font-family:'Noto Serif JP',serif!important;font-size:24px!important;line-height:1.45!important;color:#253032!important;font-weight:700!important;}
    .${styles.stepDesc}{font-size:17px!important;line-height:2!important;color:#6D675F!important;margin-top:12px!important;}

    /* 3組目：CHECK単独カードを理想のアイボリーカード + アウトラインタグへ */
    .${styles.standaloneCheck}{background:#F5F1EB!important;border-top:1px solid rgba(229,224,216,.72)!important;border-bottom:1px solid rgba(229,224,216,.72)!important;padding:72px 0!important;}
    .${styles.standaloneCheckCard}{background:#EFE8D8!important;border:2px solid #DED7C8!important;border-radius:30px!important;box-shadow:none!important;padding:42px 42px 46px!important;}
    .${styles.standaloneCheckLabel}{font-size:13px!important;letter-spacing:.32em!important;margin-bottom:26px!important;color:#188B89!important;}
    .${styles.standaloneCheckTitle}{font-size:clamp(34px,8vw,48px)!important;line-height:1.34!important;letter-spacing:-.02em!important;color:#253032!important;}
    .${styles.standaloneCheckDesc}{font-size:18px!important;line-height:2.15!important;color:#676158!important;margin-top:28px!important;}
    .${styles.standaloneCheckTags}{gap:18px 18px!important;margin-top:34px!important;}
    .${styles.standaloneCheckTag}{background:transparent!important;border:2px solid #A6E1DC!important;border-radius:999px!important;color:#253032!important;font-weight:700!important;font-size:16px!important;padding:11px 22px!important;}

    /* 4組目：SUMMARY を理想の大見出し + 01〜03カードへ */
    .${styles.finalSummaryCard}{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;}
    .${styles.finalSummaryTitle}{font-size:clamp(42px,10vw,68px)!important;line-height:1.18!important;letter-spacing:-.055em!important;margin-top:16px!important;color:#253032!important;}
    .${styles.finalSummaryList}{margin-top:56px!important;display:grid!important;gap:24px!important;}
    .${styles.finalSummaryItem}{display:grid!important;grid-template-columns:84px 1fr!important;gap:28px!important;align-items:start!important;padding:30px 34px!important;border:1px solid #DDD6C7!important;background:#FFFDF8!important;border-radius:26px!important;box-shadow:none!important;}
    .${styles.finalSummaryNum}{font-family:'DM Sans',sans-serif!important;font-size:40px!important;line-height:1!important;font-weight:800!important;letter-spacing:-.05em!important;color:#10BDB7!important;min-width:0!important;white-space:nowrap!important;}
    .${styles.finalSummaryItemTitle}{font-family:'Noto Serif JP',serif!important;font-size:28px!important;line-height:1.35!important;color:#253032!important;font-weight:700!important;}
    .${styles.finalSummaryItemDesc}{font-size:18px!important;line-height:2!important;color:#6D675F!important;margin-top:14px!important;}

    .${styles.relatedGuideCard} p{display:none!important;}
    .${styles.mechanismDiagram}{display:flex!important;flex-direction:column!important;align-items:center!important;overflow:visible!important;}
    .${styles.mechanismDiagram} img{width:auto!important;max-width:100%!important;max-height:224px!important;object-fit:contain!important;min-width:0!important;}

    @media(max-width:560px){
      .${styles.topNavInner}{padding-left:24px!important;padding-right:24px!important;}
      .${styles.navBrand}{letter-spacing:.16em!important;}
      .${styles.riskHeader},.${styles.checkHeader}{grid-template-columns:40px 1fr!important;gap:14px!important;}
      .${styles.riskTitle}{font-size:24px!important;}
      .${styles.checkTitle}{font-size:25px!important;}
      .${styles.riskCard}{padding:22px 18px 22px 22px!important;}
      .${styles.riskCardTitle}{font-size:18px!important;}
      .${styles.riskCardDesc}{font-size:14px!important;}
      .${styles.checkList}{padding:24px 20px!important;border-radius:24px!important;}
      .${styles.checkItem}{grid-template-columns:32px 1fr!important;gap:14px!important;}
      .${styles.checkItemTitle}{font-size:18px!important;}
      .${styles.checkItemDesc}{font-size:14px!important;}
      .${styles.stepsList}{gap:42px!important;}
      .${styles.stepsList}::before{left:24px!important;}
      .${styles.stepItem}{grid-template-columns:52px 1fr!important;gap:20px!important;}
      .${styles.stepNumber}{width:50px!important;height:50px!important;min-width:50px!important;font-size:25px!important;}
      .${styles.stepTitle}{font-size:22px!important;}
      .${styles.stepDesc}{font-size:16px!important;}
      .${styles.standaloneCheckCard}{padding:34px 30px 38px!important;}
      .${styles.standaloneCheckTitle}{font-size:34px!important;}
      .${styles.standaloneCheckDesc}{font-size:16px!important;}
      .${styles.standaloneCheckTag}{font-size:14px!important;padding:9px 16px!important;}
      .${styles.finalSummaryTitle}{font-size:40px!important;}
      .${styles.finalSummaryList}{margin-top:40px!important;gap:20px!important;}
      .${styles.finalSummaryItem}{grid-template-columns:58px 1fr!important;gap:18px!important;padding:24px 22px!important;border-radius:22px!important;}
      .${styles.finalSummaryNum}{font-size:34px!important;}
      .${styles.finalSummaryItemTitle}{font-size:23px!important;}
      .${styles.finalSummaryItemDesc}{font-size:16px!important;}
      .${styles.mechanismDiagram} img{width:100%!important;max-height:none!important;}
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function TopNav({ data }: { data: VisualArticleData["meta"] }) { return <nav className={styles.topNav}><div className={styles.topNavInner}><span className={styles.navBrand}>CAR BOUTIQUE</span><span className={styles.navLesson}><span className={styles.navLessonJp}>講座</span> / LESSON {data.lessonNumber}</span></div></nav>; }
function JunaBubble({ data }: { data: JunaBubbleData }) { return <div className={styles.junaBubble}><img src="/juna-avatar.png" alt="JUNA" className={styles.junaAvatar} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = "/images/cbj/columns/cbj-guide-chara-1.PNG"; }} /><div className={styles.junaBubbleContent}><div className={styles.junaBubbleTriangle} /><div className={styles.junaBubbleCard}>{data.badge ? <span className={styles.junaBadge}>{data.badge}</span> : null}{data.name ? <div className={styles.junaName}>{data.name}</div> : null}<p className={styles.junaText}><RichText value={data.text} /></p></div></div></div>; }
function SectionLabel({ en, ja }: { en: string; ja?: string }) { return <div className={styles.sectionLabel}><span className={styles.sectionLabelText}>{en}</span>{ja ? <span className={styles.sectionLabelJa}>{ja}</span> : null}</div>; }
function Hero({ data }: { data: VisualArticleData["meta"] }) { const lead = "車のカスタムで"; const accent = data.title.startsWith(lead) ? data.title.slice(lead.length) : data.title; return <section className={styles.hero}><div className={styles.container}><FadeIn><div className={styles.heroMeta}><span className={styles.heroMetaLabel}>{data.columnLabel}</span><span className={styles.heroMetaSlash}>/</span><span className={styles.heroMetaSub}>{data.columnSubLabel}</span></div><h1 className={styles.heroTitle}>{data.title.startsWith(lead) ? <>{lead}<br /><span className={styles.heroTitleAccent}>{accent}</span></> : data.title}</h1><p className={styles.heroDescription}>{data.description}</p><div className={styles.heroTags}>{data.tags.map((tag) => <span key={tag.label} className={`${styles.heroTag} ${tag.accent ? styles.heroTagAccent : ""}`}>{tag.accent ? `● ${tag.label}` : tag.label}</span>)}</div></FadeIn></div></section>; }
function IndexNav({ items }: { items: VisualArticleData["indexItems"] }) { return <section className={styles.indexSection}><div className={styles.container}><FadeIn><SectionLabel en="INDEX" ja="この記事の流れ" /><div className={styles.indexList}>{items.map((item) => <a key={item.number} href={item.href} className={styles.indexItem}><span className={styles.indexItemNum}>{item.number}</span><span className={styles.indexItemTitle}>{item.title}</span><ArrowRightIcon className={styles.indexItemArrow} /></a>)}</div></FadeIn></div></section>; }
function Divider() { return <div className={styles.container}><FadeIn><div className={styles.divider}><div className={styles.dividerLine} /></div></FadeIn></div>; }
function ChapterHeader({ number, title, titleAccentParts, description }: Pick<ChapterData, "number" | "title" | "titleAccentParts" | "description">) { return <div className={styles.chapterHeader}><div className={styles.chapterWatermark}>{number}</div><span className={styles.chapterLabel}>CHAPTER</span><h2 className={styles.chapterTitle}><SegmentedTitle title={title} accentParts={titleAccentParts} /></h2><p className={styles.chapterDescription}>{description}</p></div>; }
function SystemCards({ items }: { items?: SystemCardItem[] }) { if (!items?.length) return null; return <div className={styles.systemList}>{items.map((sys) => <div key={sys.number} className={styles.systemCard}><Icon name={sys.icon} className={styles.systemIcon} /><div><span className={styles.systemNum}>SYSTEM {sys.number}</span><h4 className={styles.systemTitle}>{sys.title}</h4><p className={styles.systemDesc}>{sys.description}</p></div></div>)}</div>; }
function MechanismBlock({ data }: { data: MechanismItem }) { const imageSrc = resolveDiagramImage(data.diagramImage); return <div className={styles.mechanism}><span className={styles.mechanismLabel}>{data.label}</span><h3 className={styles.mechanismTitle}>{data.title}</h3><p className={styles.mechanismDesc}>{data.description}</p>{imageSrc ? <div className={styles.mechanismDiagram}><img src={imageSrc} alt={data.title} loading="lazy" decoding="async" />{data.caption ? <span className={styles.mechanismCaption}>{data.caption}</span> : null}</div> : null}</div>; }
function RiskSection({ title, subtitle = "RISKS TO WATCH", items }: { title: string; subtitle?: string; items: RiskItem[] }) { return <div className={styles.riskSection}><div className={styles.riskHeader}><div className={styles.riskIcon}><span className={styles.riskIconText}>!</span></div><div className={styles.riskTitleWrap}><h3 className={styles.riskTitle}>{title}</h3><span className={styles.riskSubtitle}>{subtitle}</span></div></div><div className={styles.riskList}>{items.map((item) => <div key={item.title} className={styles.riskCard}><div className={styles.riskCardInner}><span className={styles.riskCardMark}>×</span><div><h4 className={styles.riskCardTitle}>{item.title}</h4><p className={styles.riskCardDesc}>{item.description}</p></div></div></div>)}</div></div>; }
function CheckCards({ title, subtitle = "HOW TO DO IT RIGHT", items }: { title: string; subtitle?: string; items: CheckItem[] }) { return <div className={styles.checkSection}><div className={styles.checkHeader}><div className={styles.checkIcon}><svg className={styles.checkIconSvg} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 8 6.5 11.5 13 4.5" /></svg></div><div className={styles.checkTitleWrap}><h3 className={styles.checkTitle}>{title}</h3><span className={styles.checkSubtitle}>{subtitle}</span></div></div><div className={styles.checkList}>{items.map((item) => <div key={item.title} className={styles.checkItem}><div className={styles.checkBox}><svg className={styles.checkBoxSvg} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 8 6.5 11.5 13 4.5" /></svg></div><div><h4 className={styles.checkItemTitle}>{item.title}</h4><p className={styles.checkItemDesc}>{item.description}</p></div></div>)}</div></div>; }
function StandaloneCheck({ data }: { data: VisualArticleData["checkSection"] }) { const title = data.title.replace("安心材料にしない", "").trim(); return <section className={styles.standaloneCheck}><div className={styles.container}><FadeIn><div className={styles.standaloneCheckCard}><span className={styles.standaloneCheckLabel}>{data.label}</span><h2 className={styles.standaloneCheckTitle}>{title}<br /><span className={styles.chapterAccent}>安心材料にしない</span></h2><p className={styles.standaloneCheckDesc}>{data.description}</p><div className={styles.standaloneCheckTags}>{data.tags.map((tag) => <span key={tag} className={styles.standaloneCheckTag}>{tag}</span>)}</div></div></FadeIn></div></section>; }
function StepsSection({ items }: { items: StepItem[] }) { return <div className={styles.stepsSection}><div className={styles.stepsList}>{items.map((step) => <FadeIn key={step.number} delay={step.number * 60}><div className={styles.stepItem}><span className={styles.stepNumber}>{step.number}</span><div><h4 className={styles.stepTitle}>{step.title}</h4><p className={styles.stepDesc}>{step.description}</p></div></div></FadeIn>)}</div></div>; }
function EditorNote({ data }: { data: VisualArticleData["editorNote"] }) { return <div className={styles.editorNote}><p className={styles.editorNoteText}>{data.text.map((line, index) => <span key={line}>{data.accentParts.includes(index) ? <span className={styles.editorNoteAccent}>{line}</span> : line}{index < data.text.length - 1 ? <br /> : null}</span>)}</p><p className={styles.editorNoteAttr}>— {data.attribution}</p></div>; }
function FinalSummary({ data }: { data: VisualArticleData["finalSummary"] }) { return <div className={styles.finalSummary}><SectionLabel en={data.label} ja={data.subLabel} /><div className={styles.finalSummaryCard}><h2 className={styles.finalSummaryTitle}><SegmentedTitle title={data.title} accentParts={data.titleAccentParts} /></h2><div className={styles.finalSummaryList}>{data.items.map((item) => <div key={item.num} className={styles.finalSummaryItem}><span className={styles.finalSummaryNum}>{item.num}</span><div><h4 className={styles.finalSummaryItemTitle}>{item.title}</h4><p className={styles.finalSummaryItemDesc}>{item.desc}</p></div></div>)}</div></div></div>; }
function ChapterRenderer({ chapter }: { chapter: ChapterData }) { const introComments = chapter.junaComments.slice(0, -1); const summaryComment = chapter.junaComments[chapter.junaComments.length - 1]; return <section id={chapter.id} className={styles.chapter}><div className={styles.container}><FadeIn><ChapterHeader number={chapter.number} title={chapter.title} titleAccentParts={chapter.titleAccentParts} description={chapter.description} /></FadeIn>{introComments.map((comment, index) => <div key={`${chapter.id}-intro-${index}`} className={styles.chapterJuna}><FadeIn><JunaBubble data={comment} /></FadeIn></div>)}{chapter.systems?.length ? <FadeIn><SystemCards items={chapter.systems} /></FadeIn> : null}{chapter.mechanisms?.map((mech) => <div key={mech.title} className={styles.mechanismWrap}><FadeIn><MechanismBlock data={mech} /></FadeIn></div>)}{chapter.risks?.length ? <div className={styles.riskWrap}><FadeIn><RiskSection title="ここがヤバい" items={chapter.risks} /></FadeIn></div> : null}{chapter.checks?.length ? <div className={styles.checkWrap}><FadeIn><CheckCards title="じゃあ、こうしよう" items={chapter.checks} /></FadeIn></div> : null}{summaryComment ? <div className={styles.chapterJuna}><FadeIn><JunaBubble data={summaryComment} /></FadeIn></div> : null}</div></section>; }
function RelatedGuideSection({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) { const actions = (article?.actionBox?.actions ?? []).slice(0, 3); const related = article?.relatedItems ?? []; const cards = actions.length ? actions.map((action) => ({ href: action.href, meta: "GUIDE", title: action.label })) : related.slice(0, 3).map((item) => ({ href: item.href, meta: item.metaLabel || "RELATED", title: item.title })); if (!cards.length) return null; return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="RELATED GUIDE" ja={labels?.relatedTitle ?? "関連する実用ガイド"} /><div className={styles.relatedGuideGrid}>{cards.map((card) => <Link key={card.href} href={card.href} className={styles.relatedGuideCard}><span>{card.meta}</span><b>{card.title}</b><ArrowRightIcon className={styles.relatedGuideArrow} /></Link>)}</div></FadeIn></div></section>; }
function FaqSection({ article }: { article?: EditorialArticleViewModel }) { const faq = article?.faq ?? []; if (!faq.length) return null; return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="FAQ" ja="よくある質問" /><div className={styles.faqList}>{faq.map((item) => <details key={item.question} className={styles.faqItem}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></FadeIn></div></section>; }
function ReferencesSection({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) { const sources = article?.sources ?? []; if (!sources.length) return null; const primary = sources.slice(0, 5); const rest = sources.slice(5); const renderItem = (source: string, index: number) => <li key={source}><span>{String(index + 1).padStart(2, "0")}</span><a href={source} target="_blank" rel="noreferrer">{trimUrl(source)}</a></li>; return <section className={styles.layoutSection}><div className={styles.container}><FadeIn><SectionLabel en="REFERENCES" ja={labels?.sourcesTitle ?? "出典・参考資料"} /><ol className={styles.referenceList}>{primary.map(renderItem)}</ol>{rest.length ? <details className={styles.faqItem}><summary>その他の参考資料を表示</summary><ol className={styles.referenceList}>{rest.map((source, index) => renderItem(source, index + primary.length))}</ol></details> : null}</FadeIn></div></section>; }
function UpdateNote({ article, labels }: { article?: EditorialArticleViewModel; labels?: EditorialArticleLabels }) { if (!article?.updateText) return null; const [date, ...body] = article.updateText.split("："); return <section className={styles.updateNoteSection}><div className={styles.container}><FadeIn><SectionLabel en="UPDATE NOTE" ja={labels?.updateTitle ?? "更新履歴"} /><div className={styles.updateNote}><strong>{date}</strong>{body.length ? <details className={styles.faqItem}><summary>更新内容を表示</summary><p>{body.join("：")}</p></details> : null}</div></FadeIn></div></section>; }
function Footer() { return <footer className={styles.footer}><div className={styles.footerInner}><span className={styles.footerBrand}>CAR BOUTIQUE JOURNAL</span><div className={styles.footerLinks}><Link href="/column" className={styles.footerLink}>コラム一覧へ</Link><Link href="/legal/privacy" className={styles.footerLink}>Privacy</Link><Link href="/legal/terms" className={styles.footerLink}>Terms</Link><Link href="/contact" className={styles.footerLink}>Contact</Link></div><p className={styles.footerCopy}>© 2026 CAR BOUTIQUE JOURNAL</p></div></footer>; }
export function VisualJsonArticlePage({ data, article, labels }: VisualJsonArticlePageProps) { const process = data.processChapter; return <div className={styles.page} data-cbj-visual-json-article><VisualPolishStyles /><TopNav data={data.meta} /><Hero data={data.meta} /><section className={styles.sectionSpacing}><div className={styles.container}><FadeIn><JunaBubble data={data.junaIntro} /></FadeIn></div></section><IndexNav items={data.indexItems} /><Divider />{data.chapters.map((chapter) => <ChapterRenderer key={chapter.id} chapter={chapter} />)}<StandaloneCheck data={data.checkSection} /><Divider /><section id={process.id} className={styles.chapter}><div className={styles.container}><FadeIn><ChapterHeader number={process.number} title={process.title} titleAccentParts={process.titleAccentParts} description={process.description} /></FadeIn><div className={styles.chapterJuna}><FadeIn><JunaBubble data={process.juna} /></FadeIn></div><StepsSection items={data.steps} /><EditorNote data={data.editorNote} /><Divider /><FadeIn><FinalSummary data={data.finalSummary} /></FadeIn><div className={styles.chapterJuna}><FadeIn><JunaBubble data={data.finalJuna} /></FadeIn></div></div></section><RelatedGuideSection article={article} labels={labels} /><FaqSection article={article} /><ReferencesSection article={article} labels={labels} /><UpdateNote article={article} labels={labels} /><Footer /></div>; }
