import type { Metadata } from "next";
import { referenceMetadata } from "@/lib/learning-metadata";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLearningCourses,getLearningCourse,learningHref,LEARNING_STAGES,LEARNING_TOPICS } from "@/lib/learning";
import { publicationPolicy } from "@/lib/content/publication";
import styles from "../learning.module.css";
type Props={params:Promise<{course:string}>};
export function generateStaticParams(){return getLearningCourses().map(c=>({course:c.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const c=getLearningCourse((await params).course);if(!c)return{};return {...referenceMetadata(c.title,c.description,learningHref(c.slug)),robots:{index:publicationPolicy(c).indexable,follow:true}};}
export default async function CoursePage({params}:Props){const c=getLearningCourse((await params).course);if(!c)notFound();return <main className={styles.course}>
 <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><Link href="/learn">学ぶ</Link><span>{c.title}</span></nav>
 <header className={styles.courseHero}><div><p className={styles.kicker}>{LEARNING_TOPICS[c.topic].title} · 全{c.lessons.length}回</p><h1>{c.title}</h1><p>{c.description}</p><Link className={styles.primary} href={learningHref(c.slug,c.lessons[0].slug)}>最初の疑問から読む <span aria-hidden="true">→</span></Link></div><Image src={LEARNING_TOPICS[c.topic].image} alt="" width={240} height={240}/></header>
 <section className={styles.outcomes}><h2>このテーマで、わかること</h2><ul>{c.outcomes.map(o=><li key={o}>{o}</li>)}</ul></section>
 <section><h2 className={styles.sectionTitle}>気になる疑問からでも。</h2>{Object.entries(LEARNING_STAGES).map(([stage,meta])=><section className={styles.outlineStage} key={stage}><h3 data-stage={stage}>{meta.label}<span>{meta.description}</span></h3><ol>{c.lessons.filter(l=>l.stage===stage).map(l=><li key={l.slug}><Link href={learningHref(c.slug,l.slug)}><strong>{l.title}</strong><span>{l.goal}</span><b aria-hidden="true">→</b></Link></li>)}</ol></section>)}</section>
 {c.relatedGuideSlug?<p className={styles.relatedLine}>実車で気になることは、<Link href={`/guide/${c.relatedGuideSlug}`}>関連ガイドでも確かめる →</Link></p>:null}
 <p className={styles.editorNote}>制作：CAR BOUTIQUE JOURNAL 編集部 · 更新 {c.updatedAt}{c.verifiedAt?` · 資料確認 ${c.verifiedAt}`:''}<br/>図表は各回の注記に従ってお読みください。整備・適合の確認には対象車の取扱説明書とメーカー資料を使います。</p>
 </main>;}
