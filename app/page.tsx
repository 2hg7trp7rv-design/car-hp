import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { refbookRounded, refbookSans } from "./refbook-fonts";
import styles from "./refbook-home.module.css";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";
import { getAllGuides } from "@/lib/guides";
import { getHomeTopics } from "@/lib/home-topics";
import { CBJ_CHARACTERS } from "@/lib/brand/cbj-characters";

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

type HomeTopic = ReturnType<typeof getHomeTopics>[number];

function TopicCard({ topic }: { topic: HomeTopic }) {
  const ready = topic.lessons.length > 0;
  return (
    <article className={`${styles.topic} ${styles[topic.tone]} ${ready ? "" : styles.topicSoon}`}>
      <div className={styles.topicIcon} aria-hidden="true">
        <Image src={`/images/cbj/topic-icons/${topic.icon}.png`} alt="" width={192} height={192} sizes="64px" />
      </div>
      <h3>{topic.title}</h3>
      <p>{topic.body}</p>
      <div className={styles.topicMeta}>
        {ready ? <span className={styles.topicCount}>全{topic.lessons.length}レッスン</span> : null}
        <span className={ready ? styles.badgeOpen : styles.badgeSoon}>{ready ? "公開中" : "準備中"}</span>
      </div>
      {ready ? <ul className={styles.lessonLinks}>{topic.lessons.map((lesson) => (
        <li key={lesson.href}><Link href={lesson.href}>{lesson.title} →</Link></li>
      ))}</ul> : null}
    </article>
  );
}

export default async function Home() {
  const topics = getHomeTopics(await getAllGuides());
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
              src={CBJ_CHARACTERS.shuna.top}
              alt="車の疑問を尋ねるシュナ"
              width={1600}
              height={1600}
              sizes="(max-width: 681px) 150px, (max-width: 1182px) 22vw, 260px"
              quality={88}
              preload
            />
            <Image
              src={CBJ_CHARACTERS.rina.top}
              alt="車について解説する莉奈"
              width={1600}
              height={1600}
              sizes="(max-width: 681px) 150px, (max-width: 1182px) 22vw, 260px"
              quality={88}
              preload
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
              <span className={styles.noBreak}>基礎から仕組み、実践へと理解を深めよう。</span>
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
            <p>公開中のレッスンから、気になる疑問を選んでみよう。</p>
          </div>
          <div className={styles.topicGrid}>
            {topics.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </div>
          <p className={styles.browseAll}><Link href="/guide">すべてのガイドを見る →</Link></p>
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
                src={CBJ_CHARACTERS.shuna.card}
                alt="シュナ"
                width={1600}
                height={1600}
                sizes="(max-width: 860px) 140px, 180px"
                quality={88}
              />
            </article>
            <article className={`${styles.characterCard} ${styles.rinaCard}`}>
              <h3>莉奈</h3>
              <span className={styles.characterRole}>マスター・解説者</span>
              <p>
                黒髪お姉さん。整備から車検制度まで熟知するマスター。難しい話を図と例え話に翻訳するのが大得意。
              </p>
              <Image
                src={CBJ_CHARACTERS.rina.card}
                alt="莉奈"
                width={1600}
                height={1600}
                sizes="(max-width: 860px) 140px, 180px"
                quality={88}
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
          <CookieSettingsButton />
        </nav>
        <small>© 2026 CAR BOUTIQUE JOURNAL</small>
      </footer>
    </div>
  );
}
