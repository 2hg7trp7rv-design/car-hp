import type { Metadata } from "next";
import { referenceMetadata } from "@/lib/learning-metadata";
import Image from "next/image";
import Link from "next/link";
import { ReferenceFrame } from "@/components/learning/ReferenceFrame";
import { AirFilterFigure } from "@/components/learning/AirFilterFigure";
import { LEARNING_STAGES, LEARNING_TOPICS } from "@/lib/learning";
import styles from "./refbook-home.module.css";

export const metadata: Metadata = {
  ...referenceMetadata("CAR BOUTIQUE JOURNAL｜ふたりと図解で学ぶ、クルマの参考書", "車が好き。その先の「わかる」へ。会話と図解で、エンジン・吸排気・足回り・タイヤ・安全装備・メンテナンスを学ぶ自動車メディア。", "/"),
  title: { absolute: "CAR BOUTIQUE JOURNAL｜ふたりと図解で学ぶ、クルマの参考書" },
  description: "車が好き。その先の「わかる」へ。シュナと莉奈の会話と図解で、エンジン・吸排気・足回り・タイヤ・安全装備・メンテナンスを学ぶ自動車メディア。",
  alternates: { canonical: "/" },
};
const Arrow = () => <span aria-hidden="true">→</span>;
export default function Home() {
  return <ReferenceFrame><main className={styles.main} data-cbj-refbook-home>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>ふたりと図解で学ぶ、クルマの参考書</p>
        <h1 id="home-title">車が好き。<span>その先の<span className={styles.highlight}>「わかる」</span>へ。</span></h1>
        <p className={styles.lead}>名前を知るところから、専門的な話のその先まで。<br/>シュナと莉奈と、ひとつずつ。</p>
        <Link href="/learn" className={styles.primary}>はじめの一歩を読む <Arrow /></Link>
        <p className={styles.handNote}>知れば、もっと好きになる。</p>
      </div>
      <div className={styles.heroVisual}><Image src="/images/cbj/learning/hero.webp" alt="車好きのシュナと、整備に詳しい莉奈が、青い車とエンジン・マフラー・足回りを囲んで話しています" width={1536} height={1024} sizes="(max-width: 760px) 100vw, 65vw" preload quality={88}/></div>
    </section>
    <section className={styles.section} aria-labelledby="path-title">
      <div className={styles.sectionHead}><h2 id="path-title">いまの自分に合う入口から。</h2><p>気になるところから、ひとつずつ深めよう。</p></div>
      <div className={styles.stageGrid}>{Object.entries(LEARNING_STAGES).map(([key,stage])=><Link className={styles.stageCard} data-stage={key} href={`/learn?stage=${key}`} key={key}>
        <div><span className={styles.stageSymbol} aria-hidden="true">{key==='start'?'▤':key==='mechanism'?'⚙':'▥'}</span><h3>{stage.label}</h3><p>{stage.description}</p></div>
        <div className={styles.stagePortraits}><Image src={`/images/cbj/learning/${key==='mechanism'?'rina':'shuna'}.webp`} alt="" width={320} height={320} sizes="130px"/>{key==='evaluation'?<Image src="/images/cbj/learning/rina.webp" alt="" width={320} height={320} sizes="100px"/>:null}</div><span className={styles.circle}><Arrow/></span>
      </Link>)}</div>
    </section>
    <section className={styles.section} id="topics" aria-labelledby="topics-title">
      <div className={styles.sectionHead}><h2 id="topics-title">気になるテーマから学ぼう</h2><p>クルマのいろいろなところを知ると、もっと好きになります。</p></div>
      <div className={styles.topicGrid}>{Object.entries(LEARNING_TOPICS).map(([key,topic])=><Link href={`/learn?topic=${key}`} className={styles.topic} key={key}>
        <Image src={topic.image} alt="" width={192} height={192} sizes="(max-width: 600px) 74px, 120px"/><div><h3>{topic.title}</h3><p>{topic.description}</p></div><span className={styles.circle}><Arrow/></span>
      </Link>)}</div>
    </section>
    <section className={styles.lessonPreview} aria-labelledby="sample-title">
      <div className={styles.sampleCopy}>
        <div className={styles.tags}><span>図解レッスンの一例</span><span>{LEARNING_STAGES.start.label}</span><span>吸気・排気</span></div>
        <h2 id="sample-title">エアクリーナーって、なに？</h2>
        <p className={styles.goal}>この回のゴール：役割をひとことで説明できる</p>
        <div className={styles.dialogue}><Image src="/images/cbj/learning/shuna.webp" alt="" width={80} height={80}/><div><strong>シュナ</strong><p>エンジンに、どうして<br/>フィルターが必要なの？</p></div></div>
        <div className={styles.dialogue}><Image src="/images/cbj/learning/rina.webp" alt="" width={80} height={80}/><div><strong>莉奈</strong><p>吸い込む空気のほこりを、<br/>取り除くためだよ。</p></div></div>
      </div>
      <AirFilterFigure/>
      <div className={styles.sampleBottom}><p>☀ <strong>ここだけ覚えよう：</strong>エンジンに入る空気をきれいにする。</p><Link href="/learn/air-cleaner/what-is-air-cleaner#checkpoint">わかったか確かめる <Arrow/></Link><Link href="/learn/air-cleaner/air-path">次は、どこについているの？ <Arrow/></Link></div>
    </section>
    <section className={styles.section} aria-labelledby="choose-title">
      <div className={styles.sectionHead}><h2 id="choose-title">知識がついたら、選び方へ。</h2><p>しくみを知ると、選ぶときの見方が変わります。</p></div>
      <div className={styles.chooseGrid}>
        <Link href="/choose/air-filter"><Image src="/images/cbj/topic-icons/engine-basics.png" alt="" width={120} height={120}/><div><h3>交換が必要か知る</h3><p>目的と車の状態から、エアフィルターを考える。</p></div><Arrow/></Link>
        <Link href="/choose/drive-recorder"><span className={styles.cameraIcon} aria-hidden="true">▣</span><div><h3>違いを比べる</h3><p>ドラレコの画角・夜間の映像・取付条件を整理。</p></div><Arrow/></Link>
        <Link href="/choose/car-wash"><Image src="/images/cbj/learning/topic-maintenance.webp" alt="" width={120} height={120}/><div><h3>自分の車に合うものを探す</h3><p>洗う素材と、コーティングの指定から選ぶ。</p></div><Arrow/></Link>
      </div>
    </section>
  </main></ReferenceFrame>;
}
