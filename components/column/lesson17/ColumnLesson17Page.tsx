import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import styles from "./lesson17.module.css";

const SLUG = "modern-car-custom-regret-reason-column";
const ARTICLE_URL = `/column/${SLUG}`;

const indexItems = [
  ["01", "カスタムは車全体で考える"],
  ["02", "吸気系のリスクと対策"],
  ["03", "足回りのリスクと対策"],
  ["04", "電装品のリスクと対策"],
  ["05", "失敗しにくい進め方"],
] as const;

const relatedGuides = [
  {
    eyebrow: "GUIDE / 吸気",
    title: "社外エアクリーナーで後悔しないための確認項目",
    href: "/guide/aftermarket-air-cleaner-risk-guide",
    body: "吸気温度、センサー位置、雨水対策、純正戻しまでを部品選びの前に確認します。",
  },
  {
    eyebrow: "GUIDE / 足回り",
    title: "電子制御ダンパー車に車高調を入れる前の注意点",
    href: "/guide/electronic-damper-coilover-risk-guide",
    body: "警告表示、キャンセラー、アライメント、診断性を車種別に確認します。",
  },
  {
    eyebrow: "GUIDE / ADAS",
    title: "ローダウン後にADASの確認が必要になる理由",
    href: "/guide/adas-lowered-car-aiming-risk-guide",
    body: "カメラやレーダーの扱いは車種ごとに異なります。施工前後の確認項目を整理します。",
  },
  {
    eyebrow: "GUIDE / 電装",
    title: "TVキャンセラーと車載ネットワークのリスク",
    href: "/guide/tv-canceller-can-risk-guide",
    body: "電源、診断、ネットワーク構成を含め、安易な接続で起きる問題を確認します。",
  },
] as const;

const sources = [
  {
    label: "自動車技術総合機構｜後付け自動車部品に関するFAQ",
    href: "https://www.naltec.go.jp/faq/0004.html",
  },
  {
    label: "自動車技術総合機構｜審査事務規程に関するFAQ",
    href: "https://www.naltec.go.jp/faq/0003.html",
  },
  {
    label: "国土交通省｜不正改造の具体例",
    href: "https://www.mlit.go.jp/jidosha/jidosha/tenkenseibi/huseikaizou/h1/h1-2/",
  },
  {
    label: "日本自動車整備振興会連合会｜不正改造車を排除する運動",
    href: "https://www.jaspa.or.jp/user/remodel/exclusion.html",
  },
  {
    label: "NAPAC｜JASMA認定マフラー",
    href: "https://www.napac.jp/cms/ja/jasma/certified-muffler-jasma",
  },
  {
    label: "トヨタ自動車｜保証の案内（メーカー保証の確認例）",
    href: "https://toyota.jp/after_service/support/general/",
  },
] as const;

const faqs = [
  {
    question: "車検対応品なら、そのまま取り付けても問題ありませんか？",
    answer:
      "表示だけでは判断できません。対象車種、型式、年式、取り付け方法、ほかの部品との組み合わせを含め、装着された状態で基準に適合している必要があります。",
  },
  {
    question: "カスタムするとメーカー保証はすべて無効になりますか？",
    answer:
      "一律にすべて無効になるとは限りません。変更箇所と故障の関係、メーカーや販売店の保証規定によって扱いが変わります。購入前に書面で確認してください。",
  },
  {
    question: "最初に何から変えると後悔しにくいですか？",
    answer:
      "まず純正状態での不満を具体化し、タイヤ、空気圧、消耗品、アライメントなど基礎状態を整えます。そのうえで、加工が少なく純正へ戻しやすい変更から始めると判断しやすくなります。",
  },
  {
    question: "中古のカスタム車は避けるべきですか？",
    answer:
      "一律に避ける必要はありません。ただし、純正部品、施工履歴、配線加工、警告灯、診断記録、試乗時の違和感を確認できない車は、維持や売却で不利になる可能性があります。",
  },
] as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function SectionHeading({ number, eyebrow, title, lead }: { number: string; eyebrow: string; title: string; lead: string }) {
  return (
    <header className={styles.sectionHeading}>
      <div className={styles.sectionNumber}>{number}</div>
      <div>
        <p className={styles.sectionEyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
        <p>{lead}</p>
      </div>
    </header>
  );
}

function InfoBox({ tone = "teal", title, children }: { tone?: "teal" | "amber" | "rose"; title: string; children: ReactNode }) {
  return (
    <aside className={`${styles.infoBox} ${styles[`infoBox_${tone}`]}`}>
      <p className={styles.infoLabel}>{tone === "amber" ? "確認" : tone === "rose" ? "注意" : "要点"}</p>
      <h3>{title}</h3>
      <div>{children}</div>
    </aside>
  );
}

function NavigatorTalk({ side, name, image, children }: { side: "juna" | "rina"; name: string; image: string; children: ReactNode }) {
  const isJuna = side === "juna";
  return (
    <div className={`${styles.talk} ${isJuna ? styles.talkJuna : styles.talkRina}`}>
      <Image className={styles.avatar} src={image} alt="" width={56} height={56} />
      <div className={styles.talkBody}>
        <p className={styles.talkName}>{name}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}

function SystemMap() {
  const items = [
    ["変更", "部品・設定・車高・配線"],
    ["入力", "空気量・姿勢・電源・信号"],
    ["制御", "ECU・診断・安全装置"],
    ["運用", "車検・保証・整備・売却"],
  ] as const;

  return (
    <figure className={styles.diagram} aria-labelledby="system-map-caption">
      <div className={styles.systemMap}>
        {items.map(([label, text], index) => (
          <div className={styles.systemStepWrap} key={label}>
            <div className={styles.systemStep}>
              <span>{label}</span>
              <strong>{text}</strong>
            </div>
            {index < items.length - 1 ? <span className={styles.systemArrow}><ArrowIcon /></span> : null}
          </div>
        ))}
      </div>
      <figcaption id="system-map-caption">部品交換は、制御や運用まで連鎖して考える。</figcaption>
    </figure>
  );
}

function IntakeDiagram() {
  return (
    <figure className={styles.diagram} aria-labelledby="intake-caption">
      <div className={styles.intakeDiagram}>
        <div className={styles.intakeOutside}>
          <span>外気</span>
          <strong>温度・水分・異物</strong>
        </div>
        <span className={styles.diagramArrow}><ArrowIcon /></span>
        <div className={styles.intakeFilter}>
          <span>吸気部品</span>
          <strong>形状・遮熱・固定</strong>
        </div>
        <span className={styles.diagramArrow}><ArrowIcon /></span>
        <div className={styles.intakeSensor}>
          <span>センサー／ECU</span>
          <strong>車種ごとの計測と補正</strong>
        </div>
      </div>
      <figcaption id="intake-caption">音や見た目だけでなく、吸い込む空気と計測条件を確認する。</figcaption>
    </figure>
  );
}

function SuspensionDiagram() {
  const items = [
    ["車高", "最低地上高・干渉"],
    ["タイヤ", "接地・偏摩耗"],
    ["灯火", "光軸・照射範囲"],
    ["運転支援", "車種別の校正要否"],
  ] as const;

  return (
    <figure className={styles.diagram} aria-labelledby="suspension-caption">
      <div className={styles.suspensionDiagram}>
        <div className={styles.carOutline} aria-hidden="true">
          <div className={styles.carRoof} />
          <div className={styles.carBody} />
          <div className={`${styles.wheel} ${styles.wheelLeft}`} />
          <div className={`${styles.wheel} ${styles.wheelRight}`} />
          <div className={styles.roadLine} />
        </div>
        <div className={styles.impactGrid}>
          {items.map(([title, body]) => (
            <div key={title}>
              <span>{title}</span>
              <strong>{body}</strong>
            </div>
          ))}
        </div>
      </div>
      <figcaption id="suspension-caption">車高変更は、車体姿勢だけでなく周辺の確認項目も増やす。</figcaption>
    </figure>
  );
}

function NetworkDiagram() {
  const nodes = ["パワートレーン", "ブレーキ", "ボディ", "運転支援", "診断"];
  return (
    <figure className={styles.diagram} aria-labelledby="network-caption">
      <div className={styles.networkDiagram}>
        <div className={styles.gateway}>ゲートウェイ</div>
        <div className={styles.networkNodes}>
          {nodes.map((node) => <div key={node}>{node}</div>)}
        </div>
        <div className={styles.aftermarketDevice}>後付け機器<br /><small>電源・信号・診断への影響を確認</small></div>
      </div>
      <figcaption id="network-caption">車載ネットワークは複数系統とゲートウェイで構成される。構成は車種ごとに異なる。</figcaption>
    </figure>
  );
}

function ProcessFlow() {
  const steps = [
    ["01", "目的を決める", "見た目、快適性、走行性能のどれを変えたいかを一つに絞る。"],
    ["02", "適合を確認", "型式、年式、グレード、装備、他部品との組み合わせまで確認する。"],
    ["03", "施工先を選ぶ", "診断や校正を含めて対応できるか、見積もりと保証範囲を確認する。"],
    ["04", "記録して施工", "純正状態、部品番号、施工内容、警告表示、診断結果を残す。"],
    ["05", "施工後に点検", "異音、警告灯、タイヤ摩耗、電圧、運転支援の挙動を確認する。"],
  ] as const;

  return (
    <ol className={styles.processFlow}>
      {steps.map(([number, title, body]) => (
        <li key={number}>
          <span>{number}</span>
          <div><strong>{title}</strong><p>{body}</p></div>
        </li>
      ))}
    </ol>
  );
}

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles.checklist}>
      {items.map((item) => (
        <li key={item}><span><CheckIcon /></span><p>{item}</p></li>
      ))}
    </ul>
  );
}

function RelatedCard({ eyebrow, title, body, href }: (typeof relatedGuides)[number]) {
  return (
    <Link className={styles.relatedCard} href={href}>
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className={styles.relatedArrow}>詳しく読む <ArrowIcon /></span>
    </Link>
  );
}

export default function ColumnLesson17Page() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${ARTICLE_URL}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "コラム", item: `${siteUrl}/column` },
      { "@type": "ListItem", position: 3, name: "車のカスタムで後悔しやすい理由", item: pageUrl },
    ],
  };
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "車のカスタムで後悔しやすい理由",
    description: "純正を崩す前に、車検・保証・整備入庫・売却まで含めて確認したい判断軸を整理します。",
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    datePublished: "2026-06-02",
    dateModified: "2026-06-23",
    author: { "@type": "Organization", name: "CAR BOUTIQUE JOURNAL 編集部", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512x512.png` },
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className={styles.scope} id="article-top">
      <JsonLd id="lesson17-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="lesson17-article" data={articleJsonLd} />
      <JsonLd id="lesson17-faq" data={faqJsonLd} />

      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="CAR BOUTIQUE JOURNAL ホーム">
            <span>CAR BOUTIQUE</span>
            <strong>JOURNAL</strong>
          </Link>
          <p>COLUMN / LESSON 17</p>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="パンくずリスト">
              <Link href="/">ホーム</Link><span>/</span><Link href="/column">コラム</Link><span>/</span><span>現代車のカスタム</span>
            </nav>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>COLUMN / 現代車の付き合い方</p>
                <h1>車のカスタムで<br /><em>後悔しやすい理由</em></h1>
                <p className={styles.heroLead}>純正を崩す前に。その変更が、車検・保証・整備入庫・売却まで、車全体にどう関わるかを確認する。</p>
                <div className={styles.metaRow}>
                  <span>読了 15分</span><span>初級〜中級</span><time dateTime="2026-06-23">2026.06.23 更新</time>
                </div>
              </div>
              <div className={styles.heroVisual}>
                <div className={styles.heroLesson}>LESSON <strong>17</strong></div>
                <Image src="/assets/car-illustration.webp" alt="カスタムされた車のイラスト" width={640} height={360} priority />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.articleShell}>
          <section className={styles.indexCard} aria-labelledby="index-title">
            <div className={styles.indexHeader}><p>INDEX</p><h2 id="index-title">この記事の流れ</h2></div>
            <ol>
              {indexItems.map(([number, title]) => (
                <li key={number}><a href={`#section-${number}`}><span>{number}</span><strong>{title}</strong><ArrowIcon /></a></li>
              ))}
            </ol>
          </section>

          <article className={styles.article}>
            <section className={styles.intro}>
              <p className={styles.introLead}>カスタムは、車の楽しみ方のひとつです。ただし現代車では、ひとつの変更が別の制御や整備判断へ影響することがあります。重要なのは「付けられるか」だけでなく、「戻せるか」「説明できるか」「変更後を確認できるか」です。</p>
              <SystemMap />
              <div className={styles.navigatorBlock}>
                <NavigatorTalk side="juna" name="JUNA" image="/assets/char-juna-avatar.webp">見た目が気に入った部品でも、車全体への影響まで確認した方がいいってこと？</NavigatorTalk>
                <NavigatorTalk side="rina" name="莉奈" image="/assets/char-rina-avatar.webp">そう。まずは適合、装着状態、純正戻し、施工後の確認方法までを一つのセットとして考えます。</NavigatorTalk>
              </div>
              <p className={styles.characterNote}>JUNAと莉奈は、記事の理解を補助するナビゲーションキャラクターです。実在の資格者や個人の体験談を示すものではありません。</p>
            </section>

            <section className={styles.chapter} id="section-01">
              <SectionHeading number="01" eyebrow="BASICS" title="カスタムは車全体で考える" lead="購入前に確認したいのは、部品の性能だけではありません。" />
              <p>現代車は、機械部品、センサー、制御ユニット、診断機能、安全装置が組み合わさっています。変更の影響範囲は車種、年式、グレード、装備によって異なるため、一般論だけで適否を決めないことが重要です。</p>
              <div className={styles.threeCards}>
                <div><span>FIT</span><h3>自分の車への適合</h3><p>型式、年式、エンジン、駆動方式、装備まで一致しているか。</p></div>
                <div><span>STATE</span><h3>装着された状態</h3><p>部品単体ではなく、取り付け方法や他部品との組み合わせに問題がないか。</p></div>
                <div><span>AFTER</span><h3>変更後の運用</h3><p>診断、整備入庫、保証、車検、売却時に説明できる状態か。</p></div>
              </div>
              <InfoBox title="「車検対応」の表示だけでは判断しない">
                <p>自動車技術総合機構は、後付け部品について、表示の有無だけでなく車両へ装着された状態で基準適合性を確認すると案内しています。対象車種と取り付け状態を施工店へ確認してください。</p>
                <a href="https://www.naltec.go.jp/faq/0004.html" target="_blank" rel="noreferrer">公式FAQを確認する <ArrowIcon /></a>
              </InfoBox>
              <h3 className={styles.subheading}>購入前の5項目</h3>
              <Checklist items={[
                "メーカー適合表で型式・年式・グレード・装備を確認する。",
                "車検、灯火、騒音、最低地上高など該当する基準を装着状態で確認する。",
                "メーカー保証と販売店の入庫方針を、購入前に確認する。",
                "純正部品、説明書、保証書、認定書類、施工明細を保管する。",
                "施工前後の状態を写真と診断記録で残す。",
              ]} />
            </section>

            <section className={styles.chapter} id="section-02">
              <SectionHeading number="02" eyebrow="INTAKE" title="吸気系のリスクと対策" lead="音や見た目だけでなく、空気の取り入れ方と計測条件を見る。" />
              <p>吸気部品の変更では、吸気温度、雨水や異物の入りにくさ、センサー周辺の気流、固定方法を確認します。問題が起きるかどうかは製品設計と車両側の制御によって異なるため、「社外品だから危険」「純正形状なら必ず安全」と一括りにはできません。</p>
              <IntakeDiagram />
              <div className={styles.riskGrid}>
                <div><span>01</span><h3>熱の影響</h3><p>エンジンルーム内の空気を吸いやすい配置では、走行条件によって吸気温度が上がることがあります。</p><strong>確認：外気導入、遮熱、停車時と走行時の状態</strong></div>
                <div><span>02</span><h3>計測条件</h3><p>センサー位置や周辺形状が変わると、車種によっては診断値や燃料補正へ影響する可能性があります。</p><strong>確認：メーカー指定位置、施工後の診断値、警告表示</strong></div>
                <div><span>03</span><h3>水分・異物</h3><p>フィルターの位置や清掃方法によって、水分や異物を取り込むリスクが変わります。</p><strong>確認：防水経路、メンテナンス周期、固定状態</strong></div>
              </div>
              <InfoBox tone="amber" title="数値は車種別に確認する">
                <p>吸気温度や燃料補正の許容範囲は、車両や制御方式で異なります。ネット上の一律な基準値ではなく、メーカー資料と施工店の診断結果を基準にしてください。</p>
              </InfoBox>
              <Link className={styles.inlineGuide} href="/guide/aftermarket-air-cleaner-risk-guide"><span>関連Guide</span><strong>社外エアクリーナーの確認項目を詳しく読む</strong><ArrowIcon /></Link>
            </section>

            <section className={styles.chapter} id="section-03">
              <SectionHeading number="03" eyebrow="SUSPENSION" title="足回りのリスクと対策" lead="車高変更は、乗り心地だけでなく接地・灯火・運転支援まで確認する。" />
              <p>ローダウンや車高調整を行うと、アライメント、タイヤと車体の干渉、最低地上高、灯火の向き、運転支援装置の確認が必要になる場合があります。必要な作業は車種や変更量によって異なります。</p>
              <SuspensionDiagram />
              <div className={styles.comparisonGrid}>
                <article><p className={styles.badgeMuted}>施工前</p><h3>基準状態を残す</h3><ul><li>現在の車高とタイヤ状態</li><li>アライメント測定値</li><li>警告灯・診断コード</li><li>運転支援機能の状態</li></ul></article>
                <article><p className={styles.badgeTeal}>施工後</p><h3>変化を確認する</h3><ul><li>タイヤ・フェンダーの干渉</li><li>アライメントと直進性</li><li>灯火・運転支援の確認</li><li>増し締めと異音点検</li></ul></article>
              </div>
              <InfoBox title="最低地上高は9cmだけで終わらない">
                <p>一般的な乗用車では、自動車下面について9cmが一つの基準になりますが、ホイールベースやオーバーハングなど別の確認条件もあります。測定方法を含め、施工店や検査機関へ確認してください。</p>
                <a href="https://www.naltec.go.jp/faq/0003.html" target="_blank" rel="noreferrer">審査事務規程のFAQを確認する <ArrowIcon /></a>
              </InfoBox>
              <div className={styles.linkPair}>
                <Link href="/guide/car-suspension-hard-soft-merit-demerit">足回りと乗り心地の違いを読む <ArrowIcon /></Link>
                <Link href="/guide/adas-lowered-car-aiming-risk-guide">ADAS確認の考え方を読む <ArrowIcon /></Link>
              </div>
            </section>

            <section className={styles.chapter} id="section-04">
              <SectionHeading number="04" eyebrow="ELECTRICAL" title="電装品のリスクと対策" lead="電源だけでなく、診断とネットワーク構成まで確認する。" />
              <p>車載ネットワークは、複数の通信系統とゲートウェイで構成されるのが一般的です。すべてのECUが一つの配線へ直接つながっているとは限らず、構成は車種ごとに異なります。後付け機器は、電源、アース、診断端子、通信線のどこへ接続するかを確認します。</p>
              <NetworkDiagram />
              <div className={styles.riskList}>
                <div><span>電源</span><p>常時電源かACC電源か、車両のスリープ制御と低電圧保護に対応しているか。</p></div>
                <div><span>アース</span><p>メーカーや施工要領に沿った接続点か。接触不良やノイズがないか。</p></div>
                <div><span>診断</span><p>OBD端子を常時占有する機器は、診断や車両状態へ影響しないか。</p></div>
                <div><span>通信</span><p>車種専用品か、ゲートウェイやセキュリティ機能への対応が確認されているか。</p></div>
              </div>
              <InfoBox tone="rose" title="CE・FCC・VCCIはCAN適合の証明ではない">
                <p>これらは電波やEMCなどに関する表示であり、特定車両のCAN通信へ適合することを直接保証するものではありません。車種別適合と施工要領を確認してください。</p>
              </InfoBox>
              <h3 className={styles.subheading}>電装品を取り付ける前の確認</h3>
              <Checklist items={[
                "車種別の適合と、指定された接続方法を確認する。",
                "常時電源、ACC電源、低電圧保護の仕様を確認する。",
                "配線を切断・分岐する場合は、純正復帰方法と施工保証を確認する。",
                "施工前後に警告灯と診断コードを確認する。",
                "暗電流は機器単体の推測ではなく、車両がスリープした状態で実測する。",
              ]} />
              <Link className={styles.inlineGuide} href="/guide/tv-canceller-can-risk-guide"><span>関連Guide</span><strong>TVキャンセラーと車載ネットワークの注意点を読む</strong><ArrowIcon /></Link>
            </section>

            <section className={styles.chapter} id="section-05">
              <SectionHeading number="05" eyebrow="PROCESS" title="失敗しにくい進め方" lead="正しい順番で、戻せる状態と確認記録を残す。" />
              <ProcessFlow />
              <InfoBox title="保証は変更前に確認する">
                <p>カスタムによって保証が一律にすべて無効になるとは限りません。一方で、変更箇所と不具合の関係、メーカーや販売店の規定によって保証対象外になる場合があります。口頭だけでなく、可能な範囲で書面やメールに残してください。</p>
              </InfoBox>
              <h3 className={styles.subheading}>最終チェックリスト</h3>
              <Checklist items={[
                "目的と期待する変化を一文で説明できる。",
                "型式・年式・グレード・装備まで適合を確認した。",
                "装着状態での車検・保安基準を確認した。",
                "メーカー保証と販売店の入庫方針を確認した。",
                "純正部品、説明書、保証書、認定書類、施工明細を保管する。",
                "施工前後の写真、測定値、診断結果を残す。",
                "異常時に純正へ戻す方法と費用を確認した。",
              ]} />
              <div className={styles.conclusion}>
                <p className={styles.conclusionLabel}>CONCLUSION</p>
                <h3>後悔しにくいカスタムは、派手さではなく「戻せる・確認できる・説明できる」で決まる。</h3>
                <p>部品を否定するのではなく、自分の車に合うかを順番に確認する。その過程を残しておけば、車検、保証、整備、売却で判断しやすくなります。</p>
              </div>
            </section>

            <section className={styles.relatedSection} aria-labelledby="related-title">
              <p className={styles.sectionEyebrow}>NEXT GUIDE</p>
              <h2 id="related-title">部品ごとの注意点を確認する</h2>
              <div className={styles.relatedGrid}>{relatedGuides.map((guide) => <RelatedCard key={guide.href} {...guide} />)}</div>
            </section>

            <section className={styles.faqSection} aria-labelledby="faq-title">
              <p className={styles.sectionEyebrow}>FAQ</p>
              <h2 id="faq-title">よくある質問</h2>
              <div className={styles.faqList}>
                {faqs.map((faq) => (
                  <details key={faq.question}><summary>{faq.question}<span>＋</span></summary><p>{faq.answer}</p></details>
                ))}
              </div>
            </section>

            <section className={styles.authorCard} aria-labelledby="author-title">
              <div className={styles.authorMark}>CBJ</div>
              <div>
                <p className={styles.sectionEyebrow}>AUTHOR / EDITOR</p>
                <h2 id="author-title">CAR BOUTIQUE JOURNAL 編集部</h2>
                <p>整備、カスタム、中古車、車検に関する公開情報を整理し、初心者が判断しやすい形へ編集しています。車種固有の最終判断は、メーカー、販売店、認証工場、検査機関へ確認してください。</p>
                <Link href="/legal/about">編集方針を見る <ArrowIcon /></Link>
              </div>
            </section>

            <section className={styles.sourcesSection} aria-labelledby="sources-title">
              <p className={styles.sectionEyebrow}>SOURCES</p>
              <h2 id="sources-title">出典・確認先</h2>
              <ol>
                {sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowIcon /></a></li>)}
              </ol>
              <p className={styles.sourceNote}>制度、審査事務規程、メーカー保証、製品の適合情報は更新されることがあります。施工時点の最新版を確認してください。</p>
            </section>

            <div className={styles.topLink}><a href="#article-top">ページ上部へ戻る <span>↑</span></a></div>
          </article>
        </div>
      </main>

      <footer className={styles.siteFooter}>
        <div><p>CAR BOUTIQUE JOURNAL</p><span>自動車を、選びやすく。付き合いやすく。</span></div>
        <nav aria-label="フッターナビゲーション"><Link href="/cars">CARS</Link><Link href="/guide">GUIDE</Link><Link href="/column">COLUMN</Link><Link href="/heritage">HERITAGE</Link></nav>
      </footer>
    </div>
  );
}
