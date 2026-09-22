import type { Metadata } from "next";
import { referenceMetadata } from "@/lib/learning-metadata";
import Image from "next/image";
import Link from "next/link";
import { getLearningCourses, LEARNING_STAGES, LEARNING_TOPICS, learningHref, type LearningStage, type LearningTopic } from "@/lib/learning";
import styles from "./learning.module.css";
type Props={searchParams:Promise<{topic?:string;stage?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const p=await searchParams;return {...referenceMetadata("学ぶ｜会話と図解のクルマの参考書","エンジンからメンテナンスまで。興味のあるテーマと、いまの知識に合う入口から学べます。",'/learn'),robots:p.topic||p.stage?{index:false,follow:true}:undefined};}
export default async function LearnPage({searchParams}:Props){
 const p=await searchParams;
 const topic=p.topic&&Object.hasOwn(LEARNING_TOPICS,p.topic)?p.topic as LearningTopic:undefined;
 const stage=p.stage&&Object.hasOwn(LEARNING_STAGES,p.stage)?p.stage as LearningStage:undefined;
 const courses=getLearningCourses().filter(c=>!topic||c.topic===topic);
 const href=(t?:string,s?:string)=>{const query=new URLSearchParams();if(t)query.set('topic',t);if(s)query.set('stage',s);return '/learn'+(query.size?'?'+query.toString():'');};
 return <main className={styles.index}>
  <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><span>学ぶ</span></nav>
  <header className={styles.indexHead}><p className={styles.kicker}>会話と図解で、ひとつずつ。</p><h1>今日は、どこから知ろう？</h1><p>気になるテーマの中で、名前からしくみ、条件やデータへ。<br/>途中から読んでも、わからない言葉は前の回へ戻れます。</p></header>
  <nav className={styles.filterGroup} aria-label="学び方で絞り込む"><Link href={href(topic)} aria-current={!stage?'page':undefined}>すべての入口</Link>{Object.entries(LEARNING_STAGES).map(([k,s])=><Link key={k} href={href(topic,k)} data-stage={k} aria-current={stage===k?'page':undefined}>{s.label}</Link>)}</nav>
  <nav className={styles.filterGroup} aria-label="テーマで絞り込む"><Link href={href(undefined,stage)} aria-current={!topic?'page':undefined}>すべてのテーマ</Link>{Object.entries(LEARNING_TOPICS).map(([k,t])=><Link key={k} href={href(k,stage)} aria-current={topic===k?'page':undefined}>{t.title}</Link>)}</nav>
  <h2 className={styles.resultTitle}>{topic?LEARNING_TOPICS[topic].title:'テーマを選ぶ'}{stage?` · ${LEARNING_STAGES[stage].label}`:''}<span>{courses.length}講座</span></h2>
  <div className={styles.courseGrid}>{courses.map(c=><article className={styles.courseCard} key={c.slug}>
   <div className={styles.courseCardHead}><Image src={LEARNING_TOPICS[c.topic].image} alt="" width={100} height={100}/><div><p className={styles.kicker}>{LEARNING_TOPICS[c.topic].title}</p><h2><Link href={learningHref(c.slug)}>{c.title}</Link></h2></div></div><p>{c.description}</p>
   <ul>{c.lessons.filter(l=>!stage||l.stage===stage).map(l=><li key={l.slug}><Link href={learningHref(c.slug,l.slug)}><span className={styles.badge} data-stage={l.stage}>{LEARNING_STAGES[l.stage].label}</span><span>{l.title}</span><span aria-hidden="true">→</span></Link></li>)}</ul>
  </article>)}</div>
  <aside className={styles.hostNote}><Image src="/images/cbj/learning/shuna.webp" alt="" width={64} height={64}/><p><strong>シュナ</strong>は「車は好きだけど、まだ知らないことがいっぱい」。<br/><strong>莉奈</strong>は、しくみと理由を一緒に考える案内役です。ふたりは架空のキャラクター。記事の制作・資料確認はCAR BOUTIQUE JOURNAL編集部が担当します。</p><Image src="/images/cbj/learning/rina.webp" alt="" width={64} height={64}/></aside>
 </main>;
}
