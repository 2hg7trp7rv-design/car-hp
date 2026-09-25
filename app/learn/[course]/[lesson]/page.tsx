import type { Metadata } from "next";
import { referenceMetadata } from "@/lib/learning-metadata";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningCourses,getLearningCourse,learningHref,LEARNING_STAGES,LEARNING_TOPICS,type LearningBlock } from "@/lib/learning";
import { publicationPolicy } from "@/lib/content/publication";
import { LessonBlock } from "@/components/learning/LessonBlock";
import styles from "../../learning.module.css";
type Props={params:Promise<{course:string;lesson:string}>};
// 全講座・全回は生成時に確定するため、未知のURLはルーティングの時点で404にする。
export const dynamicParams = false;
export function generateStaticParams(){return getLearningCourses().flatMap(c=>c.lessons.map(l=>({course:c.slug,lesson:l.slug})));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const p=await params,c=getLearningCourse(p.course),l=c?.lessons.find(l=>l.slug===p.lesson);if(!c||!l)return{};return{...referenceMetadata(`${l.title}｜${c.title}`,l.summary??l.goal,learningHref(c.slug,l.slug)),robots:{index:publicationPolicy(c).indexable,follow:true}};}
type Heading = Extract<LearningBlock, { type: "heading" }>;
function teachingGroups(blocks: LearningBlock[]) {
 const groups: { talk: LearningBlock[]; visual?: LearningBlock; heading?: Heading }[] = [];
 let talk: LearningBlock[] = [], heading: Heading | undefined;
 const flush = (visual?: LearningBlock) => {
  if (talk.length || visual || heading) groups.push({ talk, visual, heading });
  talk = []; heading = undefined;
 };
 for (const block of blocks) {
  if (block.type === "heading") { flush(); heading = block; }
  else if (block.type === "dialogue") talk.push(block);
  else flush(block);
 }
 flush();
 return groups;
}
export default async function LessonPage({params}:Props){const p=await params,c=getLearningCourse(p.course),lessonIndex=c?.lessons.findIndex(l=>l.slug===p.lesson)??-1;if(!c||lessonIndex<0)notFound();const l=c.lessons[lessonIndex],previous=c.lessons[lessonIndex-1],next=c.lessons[lessonIndex+1];const review=c.lessons.find(r=>r.slug===l.checkpoint.review);const sources=c.sources.filter(s=>l.sources.includes(s.id));const headings=l.blocks.filter((b):b is Heading=>b.type==='heading');
 const jsonLd={'@context':'https://schema.org','@type':'LearningResource',name:l.title,description:l.summary??l.goal,inLanguage:'ja',educationalLevel:LEARNING_STAGES[l.stage].label,url:`${getSiteUrl()}${learningHref(c.slug,l.slug)}`,dateModified:c.updatedAt,author:{'@type':'Organization',name:'CAR BOUTIQUE JOURNAL 編集部'},isPartOf:{'@type':'Course',name:c.title,url:`${getSiteUrl()}${learningHref(c.slug)}`}};
 return <main className={styles.lesson} data-learning-lesson={l.slug}>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
 <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><Link href="/learn">学ぶ</Link><Link href={learningHref(c.slug)}>{c.title}</Link></nav>
 <header className={styles.lessonHead}><div className={styles.lessonMeta}><span className={styles.badge} data-stage={l.stage}>{LEARNING_STAGES[l.stage].label}</span><span>{LEARNING_TOPICS[c.topic].title}</span><span>全{c.lessons.length}回のうち第{lessonIndex+1}回</span></div><h1>{l.title}</h1>{l.summary?<p className={styles.lessonSummary}>{l.summary}</p>:null}<p className={styles.goal}><strong>今日のゴール</strong>{l.goal}</p>
 {l.prerequisites.length?<p className={styles.prerequisites}>先に知っておくと読みやすい：{l.prerequisites.map(slug=>{const prerequisite=c.lessons.find(r=>r.slug===slug);return prerequisite?<Link key={slug} href={learningHref(c.slug,slug)}>{prerequisite.title}</Link>:null;})}</p>:null}</header>
 <div className={styles.lessonLayout}><article className={`${styles.lessonBody} ${l.stage==='start'?styles.foundation:''}`} aria-label="会話と図解のレッスン">
 {headings.length?<nav className={styles.lessonContents} aria-label="この記事の目次"><p>この記事でわかること</p><ol>{headings.map(h=><li key={h.id}><a href={`#${h.id}`}>{h.title}</a></li>)}</ol></nav>:null}
 {teachingGroups(l.blocks).map((group,i)=><section key={i} className={styles.teachingGroup} aria-label={group.heading?.title??`会話と図解 ${i+1}`}>
 {group.heading?<><h2 id={group.heading.id} className={styles.lessonSectionTitle}>{group.heading.title}</h2><p className={styles.sectionSources}>この節の参考：{group.heading.sources.map(id=>{const source=sources.find(s=>s.id===id);return source?<a key={id} href={`#source-${id}`}>{source.title}</a>:null;})}</p></>:null}
 <div className={group.visual&&group.talk.length?styles.paired:undefined}>{group.talk.length?<div className={styles.conversation}>{group.talk.map((block,j)=><LessonBlock key={j} block={block}/>)}</div>:null}{group.visual?<LessonBlock block={group.visual}/>:null}</div></section>)}
 <section className={styles.takeaways}><h2>ここだけ覚えよう</h2><ul>{l.takeaways.map(t=><li key={t}>{t}</li>)}</ul></section>
 <section id="checkpoint" className={styles.checkpoint}><p className={styles.kicker}>わかったか、確かめよう</p><h2>{l.checkpoint.question}</h2><p>自分の言葉で考えてから、答えを開いてみよう。</p><details><summary>答えと理由を見る <span aria-hidden="true">＋</span></summary><p>{l.checkpoint.answer}</p>{review?<Link href={learningHref(c.slug,review.slug)}>迷ったら「{review.title}」を読み直す →</Link>:null}</details></section>
 <nav className={styles.lessonPager} aria-label="前後のレッスン">{previous?<Link rel="prev" href={learningHref(c.slug,previous.slug)}><small>← 前の疑問へ</small><strong>{previous.title}</strong></Link>:<Link href={learningHref(c.slug)}><small>このテーマの</small><strong>目次に戻る</strong></Link>}{next?<Link rel="next" href={learningHref(c.slug,next.slug)}><small>次の疑問へ →</small><strong>{next.title}</strong></Link>:<Link href={c.selectionHref??'/learn'}><small>{c.selectionHref?'学んだことを使って':'次の興味へ'}</small><strong>{c.selectionLabel??'ほかのテーマも読む'} →</strong></Link>}</nav>
 {c.relatedGuideSlug?<p className={styles.relatedLine}>{c.relatedGuideIntro??'実車の条件も確かめたいときは、'} <Link href={`/guide/${c.relatedGuideSlug}`}>関連ガイドへ →</Link></p>:null}
 <section className={styles.sources}><h2>この回の出典・参考資料</h2><ul>{sources.map(s=><li key={s.id} id={`source-${s.id}`}><a href={s.url} rel="noopener noreferrer" target="_blank">{s.title} <span aria-label="新しいタブで開く">↗</span></a><p>{s.note}</p></li>)}</ul></section>
 <p className={styles.editorNote}>制作・資料確認：CAR BOUTIQUE JOURNAL 編集部<br/>更新 {c.updatedAt}{c.verifiedAt?` · 資料確認 ${c.verifiedAt}`:''}。シュナと莉奈は架空の案内役です。図の寸法や配置を整備手順として使わず、対象車の取扱説明書を確認してください。</p>
 </article><aside className={styles.lessonRail}><h2>このテーマの目次</h2><p>{c.title}</p><ol>{c.lessons.map(item=><li key={item.slug}><Link href={learningHref(c.slug,item.slug)} aria-current={item.slug===l.slug?'page':undefined}><span className={styles.badge} data-stage={item.stage}>{LEARNING_STAGES[item.stage].label}</span>{item.title}</Link></li>)}</ol><Link href="/glossary">わからない言葉を調べる →</Link><Link href="/learn">ほかのテーマも見る →</Link></aside></div>
 </main>;
}
