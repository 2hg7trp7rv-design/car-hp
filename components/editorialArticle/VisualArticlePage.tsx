import Link from "next/link";

import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import type {
  EditorialArticleLabels,
  EditorialArticlePageProps,
  EditorialArticleViewModel,
} from "@/components/editorialArticle/EditorialArticlePage";
import customRegretVisualJson from "@/data/article-layouts/modern-car-custom-regret-reason-column.visual.json";
import styles from "@/components/editorialArticle/kinto-json-article.module.css";

type AnyRecord = Record<string, unknown>;
type VisualArticle = EditorialArticleViewModel & { slug?: string | null; layoutId?: string | null };
type VisualArticleProps = Omit<EditorialArticlePageProps, "article"> & { article: VisualArticle };
type VisualCard = { number?: string; title: string; body: string; avoid?: string; check?: string; category?: string; image?: string; imageAlt?: string };
type VisualChapter = { label: string; title: string; score?: string; body?: string; risks?: string[]; actionTitle?: string; action?: string; summary?: string; character?: string; image?: string; imageAlt?: string; dark?: boolean };
type VisualRisk = { title: string; body: string };
type VisualStep = { title: string; body: string };
type VisualLayout = {
  slug?: string;
  template?: string;
  hero?: { label?: string; category?: string; title?: string; subtitle?: string; lead?: string; score?: string; character?: string; image?: string; imageAlt?: string };
  intro?: { body?: string; important?: string; chips?: string[] };
  overview?: { label?: string; title?: string; body?: string; image?: string; imageAlt?: string; cards?: VisualCard[] };
  chapters?: VisualChapter[];
  check?: { label?: string; title?: string; body?: string; warning?: string; image?: string; imageAlt?: string; chips?: string[] };
  guide?: { label?: string; title?: string; items?: VisualCard[] };
  tips?: { label?: string; title?: string; body?: string; image?: string; imageAlt?: string; items?: VisualCard[] };
  darkRisk?: { label?: string; title?: string; score?: string; body?: string; image?: string; imageAlt?: string; risks?: VisualRisk[]; summary?: string; character?: string };
  steps?: { label?: string; title?: string; image?: string; imageAlt?: string; items?: VisualStep[]; summary?: string; character?: string };
  mindset?: { label?: string; title?: string; body?: string; character?: string };
  summary?: { label?: string; title?: string; body?: string; image?: string; imageAlt?: string; character?: string; pillars?: VisualCard[] };
};
type RawSection = { id?: string | null; title?: string | null; displayTitle?: string | null; deck?: string | null; chapterLabel?: string | null; blocks?: unknown };

const customRegretVisual = customRegretVisualJson as unknown as VisualLayout;
const characterSet = [
  "/images/cbj/columns/cbj-guide-chara-1.PNG",
  "/images/cbj/columns/cbj-guide-chara-2.PNG",
  "/images/cbj/columns/cbj-guide-chara-3.PNG",
  "/images/cbj/columns/cbj-guide-chara-4.PNG",
];
const fallbackArticleImage = "/images/cbj/columns/custom-regret-card-article-20.webp";
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const textValue = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value || typeof value !== "object") return "";
  const record = value as AnyRecord;
  const title = textValue(record.title);
  const description = textValue(record.description ?? record.body ?? record.text ?? record.label);
  if (title && description) return `${title}：${description}`;
  return title || description;
};
const textList = (value: unknown): string[] => Array.isArray(value) ? value.map(textValue).filter((item) => item.length > 0) : [];
const objectList = (value: unknown): AnyRecord[] => Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as AnyRecord[]) : [];
const stripNumber = (value?: string | null) => String(value ?? "").replace(/^\s*(?:第?\d{1,2}(?:章|話|部|項)|[①②③④⑤⑥⑦⑧⑨⑩]|\d{1,2})\s*[\).）．.、:：-]?\s*/u, "").trim();
const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function EagerImage({ src, alt = "", className, width, height }: { src?: string | null; alt?: string; className?: string; width: number; height: number }) {
  if (!src) return null;
  // Native img is intentional here: full-page PDF/screenshot capture was missing Next.js optimized images.
  // Direct public paths render synchronously and avoid the gray placeholder state.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} width={width} height={height} loading="eager" decoding="sync" />;
}
function sectionTitle(section: RawSection, index: number) {
  return stripNumber(section.displayTitle || section.title) || `CHAPTER ${String(index + 1).padStart(2, "0")}`;
}
function blocksOf(section: RawSection): AnyRecord[] {
  return objectList(section.blocks);
}
function firstParagraph(section: RawSection) {
  const paragraph = blocksOf(section).find((block) => text(block.type) === "paragraph" && text(block.text));
  return text(paragraph?.text) || text(section.deck);
}
function firstList(section: RawSection) {
  const list = blocksOf(section).find((block) => text(block.type) === "list" && textList(block.items).length > 0);
  return textList(list?.items);
}
function normalizeSections(article: VisualArticle): RawSection[] {
  return ((article.sections ?? []) as unknown as RawSection[]).map((section, index) => ({ ...section, id: text(section.id) || `visual-section-${index + 1}` }));
}
function categoryFromLabels(labels: EditorialArticleLabels) {
  return labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE";
}
function titleLines(title: string) {
  const clean = stripNumber(title);
  if (clean.includes("｜")) return clean.split("｜").slice(0, 2).join("\n");
  if (clean.includes("？")) return clean.replace("？", "？\n");
  return clean.replace(/(理由|注意点|見分け方|選び方|リスク)/u, "$1\n").trim();
}
function compact(value?: string | null, limit = 170) {
  const clean = String(value ?? "").replace(/\s+/g, " ").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}…` : clean;
}
function createAutoLayout(article: VisualArticle, labels: EditorialArticleLabels): VisualLayout {
  const sections = normalizeSections(article);
  const overviewCards = (article.keyPoints?.length ? article.keyPoints : sections.map((section, index) => `${sectionTitle(section, index)}。${firstParagraph(section)}`)).slice(0, 3).map((body, index) => ({ number: String(index + 1).padStart(2, "0"), title: sectionTitle(sections[index] ?? {}, index), body: compact(textValue(body), 86) }));
  const chapters = sections.slice(0, 5).map((section, index) => ({
    label: section.chapterLabel || `CHAPTER ${String(index + 2).padStart(2, "0")}`,
    title: titleLines(sectionTitle(section, index)),
    score: `${Math.max(6, 10 - index)}/10`,
    body: compact(firstParagraph(section), 190),
    risks: firstList(section).slice(0, 4),
    actionTitle: "どうすればいい？",
    action: compact(textList((blocksOf(section).find((block) => text(block.type) === "callout") ?? {}).items).join("。") || textValue((blocksOf(section).find((block) => text(block.type) === "callout") ?? {}).body) || "確認する項目を先に決め、取り付け後に状態を見て、説明できる記録を残します。", 150),
    summary: compact(section.deck || firstParagraph(section), 120),
    character: characterSet[(index + 1) % characterSet.length],
    image: article.heroImage ?? fallbackArticleImage,
  }));
  const checkpointItems = (article.checkpoints?.length ? article.checkpoints : article.keyPoints ?? []).map(textValue).filter((item) => item.length > 0).slice(0, 6);
  return {
    hero: { label: "保存版", category: categoryFromLabels(labels), title: titleLines(article.title), subtitle: article.eyebrowLabel || labels.footerListLabel, lead: compact(article.lead, 145), score: "10/10", character: characterSet[3], image: article.heroImage ?? fallbackArticleImage },
    intro: { body: compact(article.lead || article.body, 180), important: compact(textValue(article.keyPoints?.[0]) || textValue(article.checkpoints?.[0]) || "あとで困らない形で、戻せることと説明できることを残します。", 120), chips: checkpointItems.slice(0, 3) },
    overview: { label: "CHAPTER 01", title: "まず全体像を\n短く整理する", body: "細かい本文に入る前に、判断に必要なポイントをカードで確認します。", image: article.heroImage ?? fallbackArticleImage, cards: overviewCards },
    chapters,
    check: { label: "CHECK", title: "先に確認したい\nチェックポイント", body: "本文を読み進める前に、判断を左右する項目だけを先に押さえます。", warning: compact(textValue(article.checkpoints?.[0]) || textValue(article.keyPoints?.[0]) || "条件や状態によって判断は変わります。必ず自分の車の状態で確認します。", 120), chips: checkpointItems },
    guide: { label: "GUIDE", title: "避けたい選び方と\n確認したいこと", items: chapters.slice(0, 4).map((chapter, index) => ({ category: stripNumber(chapter.title).split("\n")[0] || `項目${index + 1}`, title: stripNumber(chapter.title).split("\n")[0] || `項目${index + 1}`, body: chapter.body ?? "", avoid: chapter.risks?.[0] || "見た目や評判だけで決める", check: chapter.action || "自分の使い方、戻しやすさ、説明できる記録を確認する" })) },
    tips: { label: "TIPS", title: "後悔しにくい判断材料を\n残す", body: "使い方、状態、記録、戻しやすさを残すほど、整備や売却でも説明しやすくなります。", items: checkpointItems.map((item, index) => ({ title: `確認${String(index + 1).padStart(2, "0")}`, body: compact(item, 70) })) },
    steps: { label: "CHAPTER 06", title: "失敗しにくい\n進め方", items: [{ title: "目的を言葉にする", body: "なぜ必要なのかを先に整理します。" }, { title: "現状を点検する", body: "純正状態や消耗品を確認します。" }, { title: "小さく試す", body: "戻せる範囲から始めます。" }, { title: "結果を見る", body: "取り付け後の変化を確認します。" }, { title: "記録を残す", body: "説明できる状態にします。" }], character: characterSet[3], summary: "順番が大事。まず状態を確認してから、戻せる部品から試そう。記録を残すのを忘れずに。" },
    mindset: { label: "VIEW", title: "大切なのは\n理由を説明できること", body: "良い判断は、派手な要素を足すことではありません。その車の使い方に合っていて、あとから理由を説明できることです。", character: characterSet[1] },
    summary: { label: "SUMMARY", title: "最後に残すべき\n3つの判断軸", body: "細かい内容よりも、最後は戻せること、説明できること、安全性や診断性を壊していないことを確認します。", image: article.heroImage ?? fallbackArticleImage, character: characterSet[3], pillars: [{ number: "01", title: "戻せること", body: "元の状態へ戻せる余地を残す。" }, { number: "02", title: "説明できること", body: "理由と内容を記録しておく。" }, { number: "03", title: "壊さないこと", body: "安全性、保証、診断性を崩さない。" }] },
  };
}
function resolveLayout(article: VisualArticle, labels: EditorialArticleLabels) {
  const visualSlug = typeof customRegretVisual.slug === "string" && customRegretVisual.slug.trim().length > 0 ? customRegretVisual.slug : null;
  if (visualSlug && (article.slug === visualSlug || article.layoutId === visualSlug)) return customRegretVisual;
  return createAutoLayout(article, labels);
}
function Rich({ value, linkIndex, className }: { value?: string | null; linkIndex: Record<string, InternalLinkMeta>; className?: string }) {
  return value ? <TextWithInternalLinkCards text={value} linkIndex={linkIndex} as="p" className={styles.richText} textClassName={className ?? styles.bodyText} cardsClassName={styles.inlineCards} /> : null;
}
function Score({ value }: { value?: string }) {
  const score = String(value ?? "10/10").replace("/10", "");
  return <div className={styles.score}><span className={styles.scoreNum}>{score}</span><span className={styles.scoreDen}>/10</span></div>;
}
function SectionTitle({ label, title, body, dark = false }: { label?: string; title?: string; body?: string; dark?: boolean }) {
  const lines = String(title ?? "").split("\n");
  return <div className={styles.sectionHead}>{label ? <p className={styles.sectionLabel}>{label}</p> : null}<h2 className={styles.sectionTitle}>{lines.map((line, index) => <span key={index}>{renderInlineMarkdown(line)}{index < lines.length - 1 ? <br /> : null}</span>)}</h2>{body ? <p className={cx(styles.sectionLead, dark && styles.sectionLeadDark)}>{body}</p> : null}</div>;
}
function ImageFigure({ src, alt, dark = false }: { src?: string | null; alt?: string | null; dark?: boolean }) {
  if (!src) return null;
  return <figure className={cx(styles.mediaFrame, dark && styles.mediaFrameDark)}><EagerImage src={src} alt={alt ?? ""} width={1184} height={666} /></figure>;
}
function SummaryCard({ src, label = "まとめ", textValue, dark = false }: { src?: string; label?: string; textValue?: string; dark?: boolean }) {
  if (!textValue) return null;
  return <aside className={cx(styles.summaryCard, dark && styles.summaryCardDark)}>{src ? <EagerImage className={styles.summaryCharacter} src={src} alt="" width={160} height={240} /> : null}<div><span>{label}</span><p>{textValue}</p></div></aside>;
}
function Hero({ article, labels, layout }: { article: VisualArticle; labels: EditorialArticleLabels; layout: VisualLayout }) {
  const hero = layout.hero ?? {};
  return <header className={styles.hero}><div className={styles.container}><div className={styles.heroBadge}>{hero.label ?? "保存版"}</div><div className={styles.heroGrid}><div className={styles.heroCopy}><p className={styles.heroEyebrow}>{hero.category ?? categoryFromLabels(labels)}</p><h1 className={styles.heroTitle}>{String(hero.title ?? titleLines(article.title)).split("\n").map((line, index) => <span className={index === 1 ? styles.heroAccent : undefined} key={index}>{line}<br /></span>)}</h1>{hero.subtitle ? <p className={styles.heroSubtitle}>{hero.subtitle}</p> : null}{hero.lead ? <p className={styles.heroLead}>{hero.lead}</p> : null}</div><div className={styles.heroSide}>{hero.image ? <EagerImage className={styles.heroPhoto} src={hero.image} alt={hero.imageAlt || article.title} width={640} height={400} /> : null}<Score value={hero.score} />{hero.character ? <EagerImage className={styles.heroCharacter} src={hero.character} alt="" width={260} height={390} /> : null}</div></div></div></header>;
}
function Intro({ layout, linkIndex }: { layout: VisualLayout; linkIndex: Record<string, InternalLinkMeta> }) {
  const intro = layout.intro;
  if (!intro) return null;
  return <section className={cx(styles.section, styles.sectionSoft)}><div className={styles.readContainer}><Rich value={intro.body} linkIndex={linkIndex} className={styles.introText} />{intro.important ? <aside className={styles.importantBox}><span className={styles.importantLabel}>重要</span><p className={styles.importantText}>{intro.important}</p></aside> : null}{intro.chips?.length ? <div className={styles.chipRow}>{intro.chips.map((chip) => <span className={styles.chip} key={chip}>{chip}</span>)}</div> : null}</div></section>;
}
function Overview({ layout, linkIndex }: { layout: VisualLayout; linkIndex: Record<string, InternalLinkMeta> }) {
  const overview = layout.overview;
  if (!overview) return null;
  return <section className={cx(styles.section, styles.sectionWhite)}><div className={styles.container}><SectionTitle label={overview.label} title={overview.title} body={overview.body} /><ImageFigure src={overview.image} alt={overview.imageAlt} /><div className={styles.overviewGrid}>{overview.cards?.map((card, index) => <article className={styles.card} key={`${card.title}-${index}`}>{card.image ? <EagerImage className={styles.cardImage} src={card.image} alt={card.imageAlt || card.title} width={640} height={420} /> : null}<span className={styles.cardNumber}>{card.number ?? String(index + 1).padStart(2, "0")}</span><h3 className={styles.cardTitle}>{card.title}</h3><Rich value={card.body} linkIndex={linkIndex} className={styles.cardBody} /></article>)}</div></div></section>;
}
function Chapter({ chapter, index, linkIndex }: { chapter: VisualChapter; index: number; linkIndex: Record<string, InternalLinkMeta> }) {
  const dark = Boolean(chapter.dark);
  return <section className={cx(styles.section, dark ? styles.sectionDark : index % 2 ? styles.sectionSoft : styles.sectionWhite)}><div className={styles.container}><div className={styles.chapterHeader}><SectionTitle label={chapter.label} title={chapter.title} body={chapter.body} dark={dark} /><Score value={chapter.score} /></div><ImageFigure src={chapter.image} alt={chapter.imageAlt || chapter.title} dark={dark} />{chapter.risks?.length ? <div className={styles.riskList}>{chapter.risks.map((risk) => <span className={styles.riskTag} key={risk}>× {risk}</span>)}</div> : null}{chapter.action ? <aside className={styles.actionBox}><span className={styles.actionLabel}>{chapter.actionTitle ?? "どうすればいい？"}</span><Rich value={chapter.action} linkIndex={linkIndex} className={styles.cardBody} /></aside> : null}<SummaryCard src={chapter.character} textValue={chapter.summary} dark={dark} /></div></section>;
}
function DarkRisk({ layout }: { layout: VisualLayout }) {
  const risk = layout.darkRisk;
  if (!risk) return null;
  return <section className={cx(styles.section, styles.sectionDark)}><div className={styles.container}><div className={styles.chapterHeader}><SectionTitle label={risk.label} title={risk.title} body={risk.body} dark /><Score value={risk.score} /></div><ImageFigure src={risk.image} alt={risk.imageAlt} dark /><div className={styles.darkRiskGrid}>{risk.risks?.map((item) => <article className={styles.darkRiskCard} key={item.title}><span>×</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div><SummaryCard src={risk.character} textValue={risk.summary} dark /></div></section>;
}
function CheckSection({ layout }: { layout: VisualLayout }) {
  const check = layout.check;
  if (!check) return null;
  return <section className={cx(styles.section, styles.sectionSoft)}><div className={styles.container}><SectionTitle label={check.label} title={check.title} body={check.body} /><ImageFigure src={check.image} alt={check.imageAlt} />{check.warning ? <aside className={styles.importantBox}><span className={styles.importantLabel}>注意</span><p className={styles.importantText}>{check.warning}</p></aside> : null}{check.chips?.length ? <div className={styles.chipRow}>{check.chips.map((chip) => <span className={styles.chip} key={chip}>{chip}</span>)}</div> : null}</div></section>;
}
function GuideCompare({ layout }: { layout: VisualLayout }) {
  const guide = layout.guide;
  if (!guide?.items?.length) return null;
  return <section className={cx(styles.section, styles.sectionWhite)}><div className={styles.container}><SectionTitle label={guide.label} title={guide.title} /><div className={styles.guideList}>{guide.items.map((item) => <article className={styles.guideRow} key={item.category ?? item.title}><h3>{item.category ?? item.title}</h3><div><span>避けたい</span><p>{item.avoid}</p></div><div><span>確認したい</span><p>{item.check}</p></div></article>)}</div></div></section>;
}
function TipsSection({ layout, linkIndex }: { layout: VisualLayout; linkIndex: Record<string, InternalLinkMeta> }) {
  const tips = layout.tips;
  if (!tips?.items?.length) return null;
  return <section className={cx(styles.section, styles.sectionSoft)}><div className={styles.container}><SectionTitle label={tips.label} title={tips.title} body={tips.body} /><ImageFigure src={tips.image} alt={tips.imageAlt} /><div className={styles.tipsGrid}>{tips.items.map((item, index) => <article className={styles.card} key={`${item.title}-${index}`}><span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span><h3 className={styles.cardTitle}>{item.title}</h3><Rich value={item.body} linkIndex={linkIndex} className={styles.cardBody} /></article>)}</div></div></section>;
}
function Steps({ layout }: { layout: VisualLayout }) {
  const steps = layout.steps;
  if (!steps?.items?.length) return null;
  return <section className={cx(styles.section, styles.sectionWhite)}><div className={styles.container}><SectionTitle label={steps.label} title={steps.title} /><ImageFigure src={steps.image} alt={steps.imageAlt} /><ol className={styles.stepList}>{steps.items.map((step, index) => <li className={styles.stepItem} key={step.title}><span className={styles.stepNum}>{String(index + 1)}</span><div><h3 className={styles.stepTitle}>{step.title}</h3><p className={styles.cardBody}>{step.body}</p></div></li>)}</ol><SummaryCard src={steps.character} textValue={steps.summary} /></div></section>;
}
function Mindset({ layout }: { layout: VisualLayout }) {
  const mindset = layout.mindset;
  if (!mindset) return null;
  return <section className={cx(styles.section, styles.sectionSoft)}><div className={styles.readContainer}><SectionTitle label={mindset.label} title={mindset.title} /><SummaryCard src={mindset.character} label="心構え" textValue={mindset.body} /></div></section>;
}
function Summary({ layout, linkIndex, article }: { layout: VisualLayout; linkIndex: Record<string, InternalLinkMeta>; article: VisualArticle }) {
  const summary = layout.summary;
  if (!summary) return null;
  const summaryImage = summary.image || article.heroImage || undefined;
  const summaryAlt = summary.imageAlt || article.heroAlt || article.title;
  return <section className={cx(styles.section, styles.sectionWhite)}><div className={styles.container}><SectionTitle label={summary.label} title={summary.title} body={summary.body} /><div className={styles.finalSummaryGrid}>{summary.pillars?.map((pillar, index) => <article className={styles.finalPillar} key={pillar.title}><span>{pillar.number ?? String(index + 1).padStart(2, "0")}</span><h3>{pillar.title}</h3><Rich value={pillar.body} linkIndex={linkIndex} className={styles.cardBody} /></article>)}</div><SummaryCard src={summary.character} label="まとめ" textValue={summary.body} /><ImageFigure src={summaryImage} alt={summaryAlt} /></div></section>;
}
function MetaSection({ labels }: { labels: EditorialArticleLabels }) {
  return <section className={styles.metaSection}><div className={styles.container}><footer className={styles.footerCompact}><b>CAR BOUTIQUE JOURNAL</b><nav className={styles.footerLinks}><Link href={labels.footerListHref}>{labels.footerListLabel}</Link><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/contact">Contact</Link></nav><small>© 2026 CAR BOUTIQUE JOURNAL</small></footer></div></section>;
}
export function VisualArticlePage({ article, labels, linkIndex }: VisualArticleProps) {
  const layout = resolveLayout(article, labels);
  return <main className={styles.articlePage} data-cbj-visual-article><Hero article={article} labels={labels} layout={layout} /><Intro layout={layout} linkIndex={linkIndex} /><Overview layout={layout} linkIndex={linkIndex} />{layout.chapters?.map((chapter, index) => <Chapter key={`${chapter.label}-${chapter.title}`} chapter={chapter} index={index} linkIndex={linkIndex} />)}<DarkRisk layout={layout} /><CheckSection layout={layout} /><GuideCompare layout={layout} /><TipsSection layout={layout} linkIndex={linkIndex} /><Steps layout={layout} /><Mindset layout={layout} /><Summary layout={layout} linkIndex={linkIndex} article={article} /><MetaSection labels={labels} /></main>;
}
