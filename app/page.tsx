import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { refbookRounded, refbookSans } from "./refbook-fonts";
import styles from "./refbook-home.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "CAR BOUTIQUE JOURNAL — 車の“なんで？”に、0から答える参考書",
  },
  description:
    "絵と図と例え話で、車の「なぜ？」が「なるほど！」に変わる。部品の名前も知らない初学者から学べる自動車メディアです。",
  alternates: { canonical: "/" },
};

const learningSteps = [
  {
    number: "01",
    title: "まず「それ何？」から",
    body: "部品の名前も知らなくてOK。「これって何？」という素朴な疑問から、絵と例え話でイメージを掴む。",
    tone: styles.stepPink,
  },
  {
    number: "02",
    title: "仕組みを図で理解",
    body: "断面図と比較表で「なぜそうなるか」を構造から理解。丸暗記じゃなく、理屈で覚える。",
    tone: styles.stepBlue,
  },
  {
    number: "03",
    title: "発展で「裏側」へ",
    body: "「なんでこうなるの？」の一歩先。一見矛盾に見える制度や仕組みの裏側まで一直線。",
    tone: styles.stepYellow,
  },
] as const;

const topics = [
  {
    icon: "🔧",
    title: "排気系・マフラー",
    body: "マフラーとは？から「静かなのに車検に落ちる謎」まで。排気ガスの旅を追いかける。",
    tone: styles.topicPink,
    status: "公開中",
    href: "/guide",
  },
  {
    icon: "💨",
    title: "ターボ・過給機",
    body: "「空気を詰め込むと、なぜ速くなる？」NAとターボの維持費逆転の法則まで。",
    tone: styles.topicBlue,
    status: "準備中",
  },
  {
    icon: "🛞",
    title: "足回り・サスペンション",
    body: "乗り心地と走りを決める足回り。車高調とダウンサス、何が違うの？",
    tone: styles.topicYellow,
    status: "準備中",
  },
  {
    icon: "🔋",
    title: "エンジンの基礎",
    body: "エンジンって何してるの？4ストロークから直噴・ハイブリッドの違いまで。",
    tone: styles.topicGreen,
    status: "準備中",
  },
  {
    icon: "📋",
    title: "車検・制度",
    body: "車検は何を見てるの？保安基準、改造と法律の境界線を正しく理解する。",
    tone: styles.topicPurple,
    status: "準備中",
  },
  {
    icon: "💰",
    title: "維持費・お金",
    body: "車の本当のコスト。税金、保険、燃料、整備——「乗り続ける」の値段。",
    tone: styles.topicOrange,
    status: "準備中",
  },
] as const;

function TopicCard({ topic }: { topic: (typeof topics)[number] }) {
  const content = (
    <>
      <div className={styles.topicIcon} aria-hidden="true">
        {topic.icon}
      </div>
      <h3>{topic.title}</h3>
      <p>{topic.body}</p>
      <div className={styles.topicMeta}>
        <span className={styles.topicCount}>全2レッスン</span>
        <span
          className={topic.status === "公開中" ? styles.badgeOpen : styles.badgeSoon}
        >
          {topic.status}
        </span>
      </div>
    </>
  );

  if ("href" in topic) {
    return (
      <Link className={`${styles.topic} ${topic.tone}`} href={topic.href}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`${styles.topic} ${styles.topicSoon} ${topic.tone}`}
      aria-disabled="true"
    >
      {content}
    </div>
  );
}

export default function Home() {
  return (
    <div
      className={`${styles.page} ${refbookSans.variable} ${refbookRounded.variable}`}
      data-cbj-refbook-home
    >
      <header className={styles.header}>
        <Link className={styles.logo} href="/" aria-label="CAR BOUTIQUE JOURNAL ホーム">
          CAR BOUTIQUE JOURNAL <span className={styles.logoBadge}>参考書</span>
        </Link>
        <nav className={styles.topNav} aria-label="トップページ内ナビゲーション">
          <a href="#path">学び方</a>
          <a href="#topics">トピック一覧</a>
          <a href="#chars">キャラクター</a>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="home-title">
          <span className={styles.heroBadge}>📖 車の宇宙一わかりやすい参考書</span>
          <h1 id="home-title">
            <span className={styles.noBreak}>車の</span>
            <span className={`${styles.highlightPink} ${styles.noBreak}`}>「なんで？」</span>
            <span className={styles.noBreak}>に、</span>
            <br />
            <span className={styles.noBreak}>二人と一緒に</span>
            <br />
            <span className={`${styles.highlightBlue} ${styles.noBreak}`}>0から1</span>
            <span className={styles.noBreak}>で答える。</span>
          </h1>
          <p className={styles.lead}>
            CAR BOUTIQUE JOURNALは、<span className={styles.noBreak}>部品の名前も知らない</span>
            <span className={styles.noBreak}>初学者から、</span>
            <span className={styles.noBreak}>もっと深く知りたい</span>
            <span className={styles.noBreak}>マスター候補まで。</span>
            <span className={styles.noBreak}>絵と図と例え話で、</span>
            <span className={styles.noBreak}>車の「なぜ？」が</span>
            <span className={styles.noBreak}>「なるほど！」に変わる</span>
            <span className={styles.noBreak}>自動車メディアです。</span>
          </p>
          <div className={styles.heroCharacters}>
            <Image
              src="/images/cbj/refbook/char-shuna.png"
              alt="車の疑問を尋ねるシュナ"
              width={1024}
              height={1024}
              sizes="(max-width: 860px) 34vw, 22vw"
              priority
            />
            <Image
              src="/images/cbj/refbook/char-rina.png"
              alt="車について解説する莉奈"
              width={1024}
              height={1024}
              sizes="(max-width: 860px) 34vw, 22vw"
              priority
            />
          </div>
          <div className={styles.heroCta}>
            <a className={`${styles.button} ${styles.buttonPink}`} href="#topics">
              トピックを選ぶ →
            </a>
            <a className={`${styles.button} ${styles.buttonWhite}`} href="#path">
              学び方を見る
            </a>
          </div>
        </section>

        <section className={styles.block} id="path" aria-labelledby="path-title">
          <div className={styles.sectionHead}>
            <span className={`${styles.sectionKicker} ${styles.kickerPink}`}>HOW TO LEARN</span>
            <h2 id="path-title">このサイトの「階段」の登り方</h2>
            <p>
              <span className={styles.noBreak}>どの記事も、基礎→実践→発展の3ステップ。</span>
              <span className={styles.noBreak}>気づけば難しい話まで読めてる。</span>
            </p>
          </div>
          <div className={styles.pathGrid}>
            {learningSteps.map((step, index) => (
              <article className={`${styles.pathCard} ${step.tone}`} key={step.number}>
                <div className={styles.pathNumber}>{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {index < learningSteps.length - 1 ? (
                  <span className={styles.pathArrow} aria-hidden="true">
                    →
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.block} id="topics" aria-labelledby="topics-title">
          <div className={styles.sectionHead}>
            <span className={`${styles.sectionKicker} ${styles.kickerBlue}`}>TOPICS</span>
            <h2 id="topics-title">
              <span className={styles.noBreak}>トピックを選んで、</span>
              <span className={styles.noBreak}>学び始めよう</span>
            </h2>
            <p>各トピックの中に「基礎→発展」のレッスンが並んでいるよ。まずは気になる所から。</p>
          </div>
          <div className={styles.topicGrid}>
            {topics.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </div>
        </section>

        <section className={styles.block} id="chars" aria-labelledby="characters-title">
          <div className={styles.sectionHead}>
            <span className={`${styles.sectionKicker} ${styles.kickerYellow}`}>TEACHERS</span>
            <h2 id="characters-title">案内人はこの二人</h2>
          </div>
          <div className={styles.characterGrid}>
            <article className={`${styles.characterCard} ${styles.shunaCard}`}>
              <h3>シュナ</h3>
              <span className={styles.characterRole}>初学者・読者の代弁者</span>
              <p>
                金髪ギャル。車の知識はゼロだけど「なんで？」が止まらない。みんなが聞きづらい素朴な疑問を、全力で莉奈にぶつける。
              </p>
              <Image
                src="/images/cbj/refbook/char-shuna.png"
                alt="シュナ"
                width={1024}
                height={1024}
                sizes="(max-width: 860px) 140px, 180px"
              />
            </article>
            <article className={`${styles.characterCard} ${styles.rinaCard}`}>
              <h3>莉奈</h3>
              <span className={styles.characterRole}>マスター・解説者</span>
              <p>
                黒髪お姉さん。整備から車検制度まで熟知するマスター。難しい話を図と例え話に翻訳するのが大得意。
              </p>
              <Image
                src="/images/cbj/refbook/char-rina.png"
                alt="莉奈"
                width={1024}
                height={1024}
                sizes="(max-width: 860px) 140px, 180px"
              />
            </article>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>CAR BOUTIQUE JOURNAL</div>
        <p>車の宇宙一わかりやすい参考書</p>
        <nav aria-label="フッターナビゲーション">
          <a href="#topics">トピック一覧</a>
          <a href="#chars">キャラクター</a>
          <Link href="/legal/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy">Privacy</Link>
        </nav>
        <small>© 2026 CAR BOUTIQUE JOURNAL</small>
      </footer>
    </div>
  );
}
