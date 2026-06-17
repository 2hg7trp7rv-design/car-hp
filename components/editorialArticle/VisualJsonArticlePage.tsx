'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ChapterData, CheckItem, JunaBubbleData, MechanismItem, RiskItem, StepItem, SystemCardItem, VisualArticleData } from "@/types/visual-article";
import styles from "@/components/editorialArticle/visual-json-article.module.css";

type IconProps = { className?: string };

function Icon({ name, className }: IconProps & { name?: string }) {
  const label = name === "Zap" ? "⚡" : name === "CircleDot" ? "◎" : "〰";
  return <span className={className} aria-hidden="true">{label}</span>;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`${styles.reveal} ${visible ? styles.visible : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function RichText({ value, className }: { value: string; className?: string }) {
  const parts = value.split(/(<strong>.*?<\/strong>)/g).filter(Boolean);
  return <span className={className}>{parts.map((part, index) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/);
    return match ? <strong key={index}>{match[1]}</strong> : <span key={index}>{part}</span>;
  })}</span>;
}

function TopNav({ data }: { data: VisualArticleData["meta"] }) {
  return <nav className={styles.topNav}><div><b>CAR BOUTIQUE</b><span>講座 / LESSON {data.lessonNumber}</span></div></nav>;
}

function JunaBubble({ data }: { data: JunaBubbleData }) {
  return <aside className={styles.juna}><img src="/images/cbj/columns/cbj-guide-chara-1.PNG" alt="JUNA" /><div><i />{data.badge ? <em>{data.badge}</em> : null}{data.name ? <b>{data.name}</b> : null}<p><RichText value={data.text} /></p></div></aside>;
}

function SectionLabel({ en, ja }: { en: string; ja?: string }) {
  return <p className={styles.label}><span>{en}</span>{ja ? <small>{ja}</small> : null}</p>;
}

function Hero({ data }: { data: VisualArticleData["meta"] }) {
  const accent = data.title.replace(/^車のカスタムで/u, "");
  return <header className={styles.hero}><div className={styles.container}><Reveal><div className={styles.meta}><span>{data.columnLabel}</span><i>/</i><span>{data.columnSubLabel}</span></div><h1>車のカスタムで<br /><strong>{accent}</strong></h1><p>{data.description}</p><div className={styles.tags}>{data.tags.map((tag) => <span key={tag.label} className={tag.accent ? styles.tagAccent : undefined}>{tag.accent ? "● " : ""}{tag.label}</span>)}</div></Reveal></div></header>;
}

function IndexNav({ items }: { items: VisualArticleData["indexItems"] }) {
  return <section className={styles.section}><div className={styles.container}><Reveal><SectionLabel en="INDEX" ja="この記事の流れ" /><div className={styles.indexList}>{items.map((item) => <a key={item.number} href={item.href}><span>{item.number}</span><b>{item.title}</b><i>→</i></a>)}</div></Reveal></div></section>;
}

function ChapterHeader({ chapter }: { chapter: Pick<ChapterData, "number" | "title" | "description"> }) {
  return <div className={styles.chapterHead}><span>{chapter.number}</span><small>CHAPTER</small><h2>{chapter.title}</h2><p>{chapter.description}</p></div>;
}

function SystemCards({ items = [] }: { items?: SystemCardItem[] }) {
  if (!items.length) return null;
  return <div className={styles.systems}>{items.map((item) => <article key={item.number}><Icon name={item.icon} className={styles.icon} /><div><small>SYSTEM {item.number}</small><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>;
}

function Mechanism({ data }: { data: MechanismItem }) {
  return <section className={styles.mechanism}><span>{data.label}</span><h3>{data.title}</h3><p>{data.description}</p>{data.diagramImage ? <img src={data.diagramImage} alt={data.title} /> : null}{data.caption ? <small>{data.caption}</small> : null}</section>;
}

function RiskCards({ items = [] }: { items?: RiskItem[] }) {
  if (!items.length) return null;
  return <div className={styles.risks}>{items.map((item) => <article key={item.title}><span>×</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>;
}

function CheckCards({ items = [] }: { items?: CheckItem[] }) {
  if (!items.length) return null;
  return <div className={styles.checks}>{items.map((item) => <article key={item.title}><span>✓</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>;
}

function Chapter({ chapter }: { chapter: ChapterData }) {
  return <section id={chapter.id} className={styles.chapter}><div className={styles.container}><Reveal><ChapterHeader chapter={chapter} /></Reveal><div className={styles.bubbleStack}>{chapter.junaComments?.map((comment, index) => <Reveal key={`${chapter.id}-juna-${index}`} delay={80 * index}><JunaBubble data={comment} /></Reveal>)}</div><Reveal><SystemCards items={chapter.systems} />{chapter.mechanisms?.map((item) => <Mechanism key={item.title} data={item} />)}<RiskCards items={chapter.risks} /><CheckCards items={chapter.checks} /></Reveal></div></section>;
}

function CheckSection({ data }: { data: VisualArticleData["checkSection"] }) {
  return <section className={styles.checkSection}><div className={styles.container}><Reveal><SectionLabel en={data.label} ja="取り付け前の判断" /><h2>{data.title}</h2><p>{data.description}</p><div>{data.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></Reveal></div></section>;
}

function Steps({ items }: { items: StepItem[] }) {
  return <ol className={styles.steps}>{items.map((item) => <li key={item.number}><span>{String(item.number).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol>;
}

function FinalSection({ data }: { data: VisualArticleData }) {
  return <section id="chapter05" className={styles.final}><div className={styles.container}><Reveal><ChapterHeader chapter={{ number: "05", title: "失敗しにくい進め方", description: "順番が大事。派手さより、戻せること・説明できることを軸に。" }} /></Reveal><Reveal><Steps items={data.steps} /></Reveal><Reveal><blockquote>{data.editorNote.text.map((line, index) => <span key={line} className={data.editorNote.accentParts.includes(index) ? styles.noteAccent : undefined}>{line}</span>)}<cite>{data.editorNote.attribution}</cite></blockquote></Reveal><Reveal><div className={styles.summary}><SectionLabel en={data.finalSummary.label} ja={data.finalSummary.subLabel} /><h2>{data.finalSummary.title}</h2>{data.finalSummary.items.map((item) => <article key={item.num}><span>{item.num}</span><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div></Reveal><Reveal><JunaBubble data={data.finalJuna} /></Reveal></div></section>;
}

export function VisualJsonArticlePage({ data }: { data: VisualArticleData }) {
  return <main className={styles.page} data-cbj-visual-json-article><TopNav data={data.meta} /><Hero data={data.meta} /><section className={styles.intro}><div className={styles.container}><Reveal><JunaBubble data={data.junaIntro} /></Reveal></div></section><IndexNav items={data.indexItems} />{data.chapters.map((chapter) => <Chapter key={chapter.id} chapter={chapter} />)}<CheckSection data={data.checkSection} /><FinalSection data={data} /><footer className={styles.footer}>CAR BOUTIQUE JOURNAL</footer></main>;
}
