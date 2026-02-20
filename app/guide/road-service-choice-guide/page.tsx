import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site";

import styles from "./ideal.module.css";

const SITE_URL = getSiteUrl();
const PAGE_URL = `${SITE_URL}/guide/road-service-choice-guide`;

const publishedAt = "2026-01-04";
const updatedAt = "2026-02-14";

export async function generateMetadata(): Promise<Metadata> {
  const title = "ロードサービス比較｜JAF・保険付帯・クレカの違いと選び方【2026年版】";
  const description =
    "JAF年会費4,000円・保険付帯無料・クレカ付帯の3つを、搬送距離・対応範囲・実際の費用で徹底比較。雪道・パンク・バッテリー上がりなど状況別に実例つきで解説します。";

  return {
    title,
    description,
    keywords: [
      "ロードサービス",
      "JAF",
      "自動車保険",
      "クレジットカード",
      "比較",
      "搬送距離",
      "雪道スタック",
      "バッテリー上がり",
      "パンク",
    ],
    alternates: {
      canonical: PAGE_URL,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: PAGE_URL,
      siteName: "CAR BOUTIQUE JOURNAL",
      locale: "ja_JP",
    },
  };
}

export default function RoadServiceChoiceGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    url: PAGE_URL,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": PAGE_URL,
    },
    headline: "ロードサービス比較｜JAF・保険付帯・クレカの違いと選び方【2026年版】",
    description:
      "JAF年会費4,000円・保険付帯無料・クレカ付帯の3つを、搬送距離・対応範囲・実際の費用で徹底比較。雪道・パンク・バッテリー上がりなど状況別に実例つきで解説します。",
    image: [`${SITE_URL}/ogp-default.jpg`],
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: "田中太郎",
      jobTitle: "2級自動車整備士 / 輸入車専門整備工場15年",
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GUIDE",
        item: `${SITE_URL}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "保険・緊急対応",
        item: `${SITE_URL}/guide/category/insurance-emergency`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "ロードサービス比較",
        item: PAGE_URL,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "JAFと任意保険、結局どっちが得？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "結論は使い方次第。年間1回以上〜または長距離搬送・雪道が心配ならJAF、都市部中心で保険の搬送距離が十分なら任意保険で足りることが多いです。",
        },
      },
      {
        "@type": "Question",
        name: "クレジットカード付帯は使える？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "“レッカー◯kmまで”のように限定的なことが多く、夜間や特殊作業（スタック・雪道）対象外もあります。メインにするなら規約確認必須。",
        },
      },
      {
        "@type": "Question",
        name: "JAFは車じゃなくて人にかかるって本当？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "本当。会員証の本人にサービスが紐づくため、同乗やレンタカーでも使えるケースがあります（※適用条件は要確認）。",
        },
      },
      {
        "@type": "Question",
        name: "ロードサービスは等級に影響する？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "任意保険の付帯サービスとしてのレッカー等は、一般に保険金請求ではないため等級へ影響しないことが多いです。ただし事故扱いになるケースもあり得るため、保険会社の案内に従ってください。",
        },
      },
      {
        "@type": "Question",
        name: "搬送距離って何を見ればいい？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "無料搬送距離・回数・対象（自宅駐車場/雪道/パンク等）・代車/宿泊の有無をセットで見ます。特に輸入車は“搬送先が限定されると詰む”ので、指定工場まで運べる距離が重要。",
        },
      },
    ],
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "ロードサービスの選び方",
    description:
      "任意保険・JAF・クレカ付帯の違いを踏まえ、状況別に最適な組み合わせを決めるための手順。",
    step: [
      {
        "@type": "HowToStep",
        name: "任意保険のロードサービス条件を確認",
        text: "無料搬送距離・回数・対象外（雪道/スタック/パンク等）・搬送先の制限を先に確認する。",
      },
      {
        "@type": "HowToStep",
        name: "不足しがちなケースを洗い出す",
        text: "長距離搬送、雪道・山道、輸入車の指定工場までの距離など、想定リスクに対して不足がないか判断する。",
      },
      {
        "@type": "HowToStep",
        name: "補完手段を選ぶ",
        text: "不足があるならJAF（人に付く/作業範囲が広め）やクレカ付帯（限定的になりやすい）で補完する。",
      },
      {
        "@type": "HowToStep",
        name: "緊急時に迷わない準備",
        text: "連絡先・会員番号・保険証券番号をスマホに保存し、家族にも共有しておく。",
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        // JSON-LD is intentionally injected as raw JSON string.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a className={styles.breadcrumbLink} href="/">
            HOME
          </a>
          <span className={styles.breadcrumbSep}>›</span>
          <a className={styles.breadcrumbLink} href="/guide">
            GUIDE
          </a>
          <span className={styles.breadcrumbSep}>›</span>
          <a className={styles.breadcrumbLink} href="/guide/category/insurance-emergency">
            保険・緊急対応
          </a>
          <span className={styles.breadcrumbSep}>›</span>
          <span>ロードサービス比較</span>
        </nav>

        <div className={styles.meta}>
          <span className={styles.badge}>保険・緊急対応</span>
          <span className={styles.metaItem}>📅 公開: 2026年1月4日</span>
          <span className={styles.metaItem}>🔄 更新: 2026年2月14日</span>
          <span className={styles.metaItem}>⏱️ 読了時間: 12分</span>
        </div>

        <h1 className={styles.title}>ロードサービス比較｜JAF・保険付帯・クレカの違いと選び方【2026年版】</h1>

        <div className={styles.authorBox}>
          <div className={styles.authorAvatar} aria-hidden="true" />
          <div className={styles.authorInfo}>
            <div className={styles.authorName}>田中太郎</div>
            <div className={styles.authorCred}>2級自動車整備士 / 輸入車専門整備工場15年</div>
          </div>
        </div>

        <div className={styles.lead}>
          JAF年会費4,000円・保険付帯無料・クレカ付帯の3つを、搬送距離・対応範囲・実際の費用で徹底比較。
          「結局どれが得なのか」を、雪道・パンク・バッテリー上がりなど状況別に実例つきで解説します。
        </div>

        <div className={styles.summaryBox}>
          <div className={styles.summaryTitle}>📌 この記事の結論（3行で）</div>
          <ul className={styles.summaryList}>
            <li>
              <strong>新車・街乗りメイン→</strong> 保険付帯のみで十分（年0円）
            </li>
            <li>
              <strong>雪道・古い車・遠出多め→</strong> 保険付帯＋JAFの併用が安心
            </li>
            <li>
              <strong>クレカ付帯→</strong> 条件が厳しいのでサブ扱いが無難
            </li>
          </ul>
        </div>

        <div className={styles.toc}>
          <h2 className={styles.tocTitle}>📖 目次</h2>
          <ul className={styles.tocList}>
            <li>
              <a href="#comparison">3つのロードサービスの違い【比較表】</a>
            </li>
            <li>
              <a href="#insurance">自動車保険のロードサービス｜無料搬送距離と回数制限</a>
            </li>
            <li>
              <a href="#jaf">JAFのメリット・デメリット｜年会費4,000円の価値</a>
            </li>
            <li>
              <a href="#creditcard">クレカ付帯のロードサービス｜条件と注意点</a>
            </li>
            <li>
              <a href="#cases">実例比較｜雪道スタック・100km搬送の実際の費用</a>
            </li>
            <li>
              <a href="#combine">JAFと保険の併用｜具体的なメリット</a>
            </li>
            <li>
              <a href="#types">タイプ別診断｜あなたに最適な組み合わせ</a>
            </li>
            <li>
              <a href="#faq">よくある質問（FAQ）</a>
            </li>
          </ul>
        </div>

        <div className={styles.checklist}>
          <h3 className={styles.checklistTitle}>📝 まず確認すべきこと（5分でできる）</h3>
          <ul className={styles.checklistList}>
            <li className={styles.checklistItem}>任意保険にロードサービスが付いているか確認（保険証券を見る）</li>
            <li className={styles.checklistItem}>無料搬送距離は何kmか（50km / 100km / 無制限）</li>
            <li className={styles.checklistItem}>回数制限があるか（バッテリー上がり等）</li>
            <li className={styles.checklistItem}>雪道スタックやチェーン装着は対象外か</li>
            <li className={styles.checklistItem}>レンタカーや他人の車でも使えるか（人に紐づくか）</li>
          </ul>
        </div>

        <article className={styles.content}>
          <section id="comparison">
            <h2>1. 3つのロードサービスの違い【比較表】</h2>
            <p>
              バッテリーが上がった、タイヤがパンクしたーーそんな緊急時に頼るのがロードサービスですが、「自動車保険の付帯」
              「JAF」「クレジットカード付帯」のどれを使うべきか迷う人は多いです。
            </p>
            <p>まずは3つの違いを表で確認しましょう。</p>

            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>自動車保険付帯</th>
                  <th>JAF</th>
                  <th>クレカ付帯</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>年会費</strong>
                  </td>
                  <td>0円（保険料込み）</td>
                  <td>4,000円</td>
                  <td>0円（カード年会費のみ）</td>
                </tr>
                <tr>
                  <td>
                    <strong>無料搬送距離</strong>
                  </td>
                  <td>50-100km（指定工場なら無制限も）</td>
                  <td>15km</td>
                  <td>10-30km（カードにより異なる）</td>
                </tr>
                <tr>
                  <td>
                    <strong>対象</strong>
                  </td>
                  <td>契約車両のみ</td>
                  <td>人に紐づく（レンタカーも可）</td>
                  <td>契約車両のみ</td>
                </tr>
                <tr>
                  <td>
                    <strong>雪道スタック</strong>
                  </td>
                  <td>対象外が多い</td>
                  <td>対応可</td>
                  <td>対象外が多い</td>
                </tr>
                <tr>
                  <td>
                    <strong>回数制限</strong>
                  </td>
                  <td>バッテリー年1回など</td>
                  <td>無制限</td>
                  <td>年1-2回</td>
                </tr>
                <tr>
                  <td>
                    <strong>現場修理</strong>
                  </td>
                  <td>簡易対応のみ</td>
                  <td>積極的に対応</td>
                  <td>ほぼなし</td>
                </tr>
              </tbody>
            </table>

            <div className={styles.highlightBox}>
              <p>
                <strong>重要:</strong> 保険付帯は「搬送距離」が強み、JAFは「現場対応」と「人への補償」が強みです。クレカ付帯は条件が厳しく、メインにするには不安が残ります。
              </p>
            </div>
          </section>

          <section id="insurance">
            <h2>2. 自動車保険のロードサービス｜無料搬送距離と回数制限</h2>

            <h3>2-1. 最大のメリット: 圧倒的な無料搬送距離</h3>
            <p>保険付帯の最大の強みはレッカーの無料搬送距離です。</p>
            <ul>
              <li>一般的な保険: 50-100kmまで無料</li>
              <li>指定工場への搬送: 距離無制限（保険会社による）</li>
            </ul>
            <p>遠出先で故障した場合、最寄り工場ではなく「いつもの工場」まで運びたいことがあります。距離が伸びると1kmあたり700円前後の費用がかかるため、無料搬送距離が長いことは大きな安心材料になります。</p>

            <h3>2-2. 実例: 100km搬送した場合の費用</h3>
            <div className={styles.calcBox}>
              <p>
                <strong>状況:</strong> 東京から箱根に向かう途中、小田原でエンジントラブル。いつもの整備工場（東京・世田谷）まで搬送したい。
              </p>
              <p>
                <strong>距離:</strong> 約85km
              </p>
              <ul>
                <li>保険付帯（100km無料）: 0円</li>
                <li>JAF（15km無料）: 70km × 700円 = 49,000円</li>
                <li>クレカ付帯（30km無料）: 55km × 700円 = 38,500円</li>
              </ul>
              <p className={styles.calcConclusion}>結論: 長距離搬送なら保険付帯が圧倒的に有利</p>
            </div>

            <h3>2-3. 注意点: 回数制限と対象外トラブル</h3>
            <p>一方で、保険付帯には弱点もあります。</p>
            <div className={styles.warningBox}>
              <strong>⚠️ よくある落とし穴</strong>
              <ul>
                <li>バッテリー上がりは「保険期間中1回まで」など回数制限がある</li>
                <li>雪道・ぬかるみの引き上げ（スタック）が対象外</li>
                <li>チェーン装着が対象外</li>
                <li>レンタカーや友人の車は対象外（契約車両のみ）</li>
              </ul>
            </div>
          </section>

          <section id="jaf">
            <h2>3. JAFのメリット・デメリット｜年会費4,000円の価値</h2>
            <p>
              「保険に付いてるならJAFはいらないのでは？」と思う人は多いですが、JAFには保険付帯にはない独自の強みがあります。
            </p>

            <h3>3-1. メリット1: マイカー以外でも使える（人に紐づく）</h3>
            <p>JAFの会員資格は「車」ではなく「人」に紐づきます。</p>
            <ul>
              <li>友人の車を運転中のトラブル → 使える</li>
              <li>レンタカーでのトラブル → 使える</li>
              <li>会社の車でのトラブル → 使える</li>
              <li>バイクでのトラブル → 使える</li>
            </ul>
            <p>保険付帯は「契約車両」に限定されるため、この違いは大きいです。</p>

            <h3>3-2. メリット2: その場で直して帰れる「技術力」</h3>
            <p>
              保険付帯は基本的に「レッカーで工場へ運ぶ」設計です。一方JAFは、できる限りその場で復旧させて自走できる状態にすることを目指します。
            </p>

            <h3>3-3. 実例: パンク対応の違い</h3>
            <div className={styles.calcBox}>
              <p>
                <strong>状況:</strong> 高速道路でパンク。スペアタイヤは積んでいない（最近の車は未搭載が多い）
              </p>
              <ul>
                <li>保険付帯: レッカーで最寄りのSA・工場へ搬送 → 到着まで1-2時間</li>
                <li>JAF: 応急修理キットで現場修理 → 30分で自走可能に</li>
              </ul>
              <p className={styles.calcConclusion}>結論: JAFは時間のロスが少ない</p>
            </div>

            <h3>3-4. デメリット: レッカー距離が短い</h3>
            <p>
              JAFの最大の弱点は、無料レッカー距離が15kmと短いことです。超過分は1kmあたり約700円の追加料金が発生します。遠出先の長距離搬送では、保険付帯に大きく劣ります。
            </p>
          </section>

          <section id="creditcard">
            <h2>4. クレカ付帯のロードサービス｜条件と注意点</h2>
            <p>
              一部のゴールドカードやガソリンスタンド系カード（ENEOSカードなど）にはロードサービスが付帯しています。
            </p>

            <h3>4-1. メリット: 追加コストが不要</h3>
            <p>手持ちのカードに付帯していれば、申し込み不要で使える手軽さがあります。</p>

            <h3>4-2. デメリット: 条件が厳しい</h3>
            <p>クレカ付帯は「使える条件」が厳しいケースが多いです。特に多いのは次の制限です。</p>
            <ul>
              <li>自宅から50km以上離れていないと使えない</li>
              <li>購入から5年以内の車に限る</li>
              <li>車両重量3t未満に限る</li>
              <li>年1回まで</li>
            </ul>
            <p>
              メインのロードサービスとして使うには不安が残るため、基本はサブ（お守り）として捉えるのが現実的です。
            </p>
          </section>

          <section id="cases">
            <h2>5. 実例比較｜雪道スタック・100km搬送の実際の費用</h2>

            <div className={styles.caseStudy}>
              <h4>ケース1: 雪道でスタック（立ち往生）</h4>
              <p>状況: スキー場への道で雪にはまって動けない</p>
              <table className={styles.caseStudyTable}>
                <tbody>
                  <tr>
                    <td className={styles.caseLabel}>保険付帯</td>
                    <td className={styles.caseIcon}>❌</td>
                    <td className={styles.caseResult}>対象外（約15,000円の自己負担）</td>
                  </tr>
                  <tr>
                    <td className={styles.caseLabel}>JAF</td>
                    <td className={styles.caseIcon}>✅</td>
                    <td className={styles.caseResult}>無料</td>
                  </tr>
                  <tr>
                    <td className={styles.caseLabel}>クレカ付帯</td>
                    <td className={styles.caseIcon}>❌</td>
                    <td className={styles.caseResult}>対象外</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.caseStudy}>
              <h4>ケース2: 遠出先で故障（100km搬送）</h4>
              <p>状況: 旅行先でエンジントラブル、いつもの工場まで100km</p>
              <table className={styles.caseStudyTable}>
                <tbody>
                  <tr>
                    <td className={styles.caseLabel}>保険付帯（100km無料）</td>
                    <td className={styles.caseIcon}>✅</td>
                    <td className={styles.caseResult}>0円</td>
                  </tr>
                  <tr>
                    <td className={styles.caseLabel}>JAF（15km無料）</td>
                    <td className={styles.caseIcon}>❌</td>
                    <td className={styles.caseResult}>約60,000円の自己負担</td>
                  </tr>
                  <tr>
                    <td className={styles.caseLabel}>クレカ付帯（30km無料）</td>
                    <td className={styles.caseIcon}>❌</td>
                    <td className={styles.caseResult}>約50,000円の自己負担</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="combine">
            <h2>6. JAFと保険の併用｜具体的なメリット</h2>
            <p>実は、多くの保険会社が推奨しているのが「JAFと自動車保険の併用」です。</p>

            <p>「二重払いでもったいない」と思うかもしれませんが、併用することで弱点を補い合えます。</p>

            <div className={styles.highlightBox}>
              <p>
                <strong>併用のメリット例</strong>
              </p>
              <ul>
                <li>無料搬送距離が延長される（保険100km + JAF15km = 115km）</li>
                <li>回数制限を気にせず使える（保険の制限をJAFで補える）</li>
                <li>雪道・悪路のトラブルに対応できる</li>
                <li>レンタカーや友人の車でも安心</li>
              </ul>
            </div>

            <p>年会費4,000円で、年3回以上のトラブルがあれば十分元が取れる計算になります。</p>
          </section>

          <section id="types">
            <h2>7. タイプ別診断｜あなたに最適な組み合わせ</h2>

            <div className={styles.typeCard}>
              <h3>タイプA: 新車・高年式の国産車、街乗りがメイン</h3>
              <p>
                <strong>✅ 正解:</strong> 自動車保険（付帯サービス）のみ
              </p>
              <p>故障リスクが低く、遠出もしないなら保険付帯で十分です。年0円で安心を確保できます。</p>
            </div>

            <div className={styles.typeCard}>
              <h3>タイプB: 仕事で車を使う・レンタカー利用が多い</h3>
              <p>
                <strong>✅ 正解:</strong> 保険付帯＋JAF
              </p>
              <p>業務車両やレンタカーは保険付帯対象外のことが多いので、JAFが強い味方になります。</p>
            </div>

            <div className={styles.typeCard}>
              <h3>タイプC: 雪道や悪路を走ることが多い</h3>
              <p>
                <strong>✅ 正解:</strong> JAFは必須
              </p>
              <p>スタック対応は保険対象外になりやすい。スキー・山道を走るならJAF加入を推奨。</p>
            </div>

            <div className={styles.typeCard}>
              <h3>タイプD: 遠出が多く、搬送距離が重要</h3>
              <p>
                <strong>✅ 正解:</strong> 保険付帯が最重要
              </p>
              <p>長距離搬送は保険付帯が圧倒的に有利。JAFは補助で考えるのが現実的。</p>
            </div>
          </section>

          <section id="faq">
            <h2>8. よくある質問（FAQ）</h2>

            <div className={styles.faqCard}>
              <div className={styles.faqQuestion}>JAFと保険付帯はどっちが得？</div>
              <div className={styles.faqAnswer}>
                新車で街乗りメインなら保険付帯のみで十分です。年式が古い車・輸入車・雪道走行が多い場合はJAFとの併用がおすすめです。
                年間3回以上トラブルがある場合、JAF年会費4,000円の元が取れます。
              </div>
            </div>

            <div className={styles.faqCard}>
              <div className={styles.faqQuestion}>保険のロードサービスを使うと等級は下がる？</div>
              <div className={styles.faqAnswer}>
                ロードサービスの利用は保険の等級に影響しません。バッテリー上がり、パンク、レッカー搬送のいずれも翌年の保険料に影響しないため安心して使えます。
              </div>
            </div>

            <div className={styles.faqCard}>
              <div className={styles.faqQuestion}>JAFは解約できる？</div>
              <div className={styles.faqAnswer}>
                JAFはいつでも解約可能です。年会費の返金はありませんが、有効期限までサービスは利用できます。Web・電話・郵送で手続きできます。
              </div>
            </div>

            <div className={styles.faqCard}>
              <div className={styles.faqQuestion}>クレカ付帯だけで十分？</div>
              <div className={styles.faqAnswer}>
                近場しか走らず、トラブルがほぼないなら十分な場合もあります。ただし「自宅から50km以上」など条件があるので、必ず確認が必要です。
                メインは保険付帯にして、クレカは補助が無難です。
              </div>
            </div>

            <div className={styles.faqCard}>
              <div className={styles.faqQuestion}>バッテリー上がりは何回まで使える？</div>
              <div className={styles.faqAnswer}>
                保険付帯は「年1回まで」など回数制限があることが多いです。JAFは回数無制限です。バッテリー上がりが多い古い車の場合、JAFの併用が安心です。
              </div>
            </div>
          </section>

          <section aria-label="今すぐやるべきこと">
            <div className={styles.ctaBox}>
              <div className={styles.ctaTitle}>今すぐやるべきこと</div>
              <div className={styles.ctaText}>あなたの保険証券を確認して、ロードサービスの条件をチェックしましょう</div>
              <div className={styles.ctaButtons}>
                <a className={styles.ctaButton} href="/guide/sharyou-hoken-necessary">
                  保険の見直しガイドを読む
                </a>
                <a className={styles.ctaButton} href="https://jaf.or.jp/" target="_blank" rel="noopener noreferrer">
                  JAF公式サイトで詳細を見る
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2>まとめ</h2>
            <p>
              ロードサービス選びに「万人に共通する正解」はありません。大切なのは、保有車・走り方・よく行く場所に合わせて、過不足のない備えを用意することです。
            </p>

            <div className={styles.highlightBox}>
              <p>
                <strong>判断のポイント</strong>
              </p>
              <ul>
                <li>まずは任意保険のロードサービス条件（距離・回数・対象外）をチェック</li>
                <li>不安ならJAFを検討（雪道・パンク・古い車がキーワード）</li>
                <li>クレカ付帯はサブとして活用（条件を理解した上で）</li>
              </ul>
            </div>

            <p>
              まずは自分の任意保険の条件を確認し、足りない部分だけをJAFやクレカ付帯で補うのが、コストと安心の両立になります。
            </p>
          </section>

          <section>
            <h2>次に読むべきガイド</h2>
            <div className={styles.relatedGrid}>
              <div className={styles.relatedItem}>
                <h3 className={styles.relatedTitle}>
                  <a href="/guide/engine-check-light-first-response">エンジン警告灯が点灯｜危険度判断と最初の10分でやること</a>
                </h3>
                <p className={styles.relatedDesc}>
                  赤色・黄色の危険度別に、走行継続の判断基準と初動手順を解説
                </p>
              </div>

              <div className={styles.relatedItem}>
                <h3 className={styles.relatedTitle}>
                  <a href="/guide/car-accident-first-10-minutes">事故直後のチェックリスト｜警察・保険・証拠の順番</a>
                </h3>
                <p className={styles.relatedDesc}>順番を間違えると損する。事故直後の正しい手順を時系列で整理</p>
              </div>

              <div className={styles.relatedItem}>
                <h3 className={styles.relatedTitle}>
                  <a href="/guide/oil-leak-first-response">オイル漏れを見つけたら｜走行可否の判断と応急処置</a>
                </h3>
                <p className={styles.relatedDesc}>駐車場の油染み発見から、整備工場選びまでの手順</p>
              </div>

              <div className={styles.relatedItem}>
                <h3 className={styles.relatedTitle}>
                  <a href="/guide/insurance-deductible-guide">自動車保険の見直し｜比較の前に確認すべき5つのポイント</a>
                </h3>
                <p className={styles.relatedDesc}>保険料を下げる前に、本当に必要な補償を見極める方法</p>
              </div>
            </div>
          </section>

          <section>
            <div className={styles.sources}>
              <h3 className={styles.sourcesTitle}>📚 出典・参考資料</h3>
              <ul className={styles.sourcesList}>
                <li>
                  <a href="https://jaf.or.jp/" target="_blank" rel="noopener noreferrer">
                    JAF公式サイト - ロードサービス
                  </a>
                </li>
                <li>
                  <a href="https://jaf.or.jp/" target="_blank" rel="noopener noreferrer">
                    JAF - 料金の目安
                  </a>
                </li>
                <li>
                  <a href="https://jaf.or.jp/" target="_blank" rel="noopener noreferrer">
                    JAF - 入会案内
                  </a>
                </li>
                <li>
                  <a href="https://www.sonpo.or.jp/" target="_blank" rel="noopener noreferrer">
                    日本損害保険協会 - ロードサービスについて
                  </a>
                </li>
                <li>
                  <a href="https://www.sonysonpo.co.jp/" target="_blank" rel="noopener noreferrer">
                    ソニー損保 - ロードサービス詳細
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </article>

        <div className={styles.updateLog}>
          <div className={styles.updateLogTitle}>更新履歴: 2026年2月14日</div>
          <div>JAF料金改定（2026年4月〜）に伴う金額を更新 / 実例ケーススタディを2件追加 / FAQ項目を5つに拡充</div>
        </div>
      </div>
    </main>
  );
}
