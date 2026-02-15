import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { getGuideBySlug } from "@/lib/guides";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { isIndexableGuide } from "@/lib/seo/indexability";
import { buildGuideDescription, buildGuideTitleBase, withBrand } from "@/lib/seo/serp";
import { getSiteUrl } from "@/lib/site";

import styles from "./ideal.module.css";

const SLUG = "road-service-choice-guide";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await getGuideBySlug(SLUG);

  if (!guide) {
    return {
      title: "ガイドが見つかりません",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  const titleBase = buildGuideTitleBase(guide);
  const titleFull = withBrand(titleBase);
  const description = buildGuideDescription(guide);

  const url = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;

  const rawImage = ((guide as any).ogImageUrl ?? guide.heroImage ?? null) as string | null;
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${getSiteUrl()}${rawImage}`
    : `${getSiteUrl()}/ogp-default.jpg`;

  return {
    title: titleBase,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titleFull,
      description,
      type: "article",
      url,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFull,
      description,
      images: [image],
    },
    robots: isIndexableGuide(guide) ? undefined : NOINDEX_ROBOTS,
  };
}

export default async function RoadServiceChoiceGuidePage() {
  const guide = await getGuideBySlug(SLUG);
  if (!guide) notFound();

  const url = `${getSiteUrl()}/guide/${encodeURIComponent(guide.slug)}`;

  // NOTE: The layout below is intentionally hard-pinned to the “ideal” design screenshots.
  // We keep the overall page data (title/description/dates) consistent with the guide JSON.

  const publishedAt = guide.publishedAt ?? "2026-01-04";
  const updatedAt = guide.updatedAt ?? "2026-02-14";
  const readMinutes = guide.readMinutes ?? 12;

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GUIDE",
        item: `${getSiteUrl()}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "保険・緊急対応",
        item: `${getSiteUrl()}/guide/insurance`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "ロードサービス比較",
        item: url,
      },
    ],
  };

  const articleJsonLd = {
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt ?? (guide as any).seoDescription ?? guide.lead ?? "",
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: "田中太郎",
      jobTitle: "2級自動車整備士",
      worksFor: {
        "@type": "Organization",
        name: "輸入車専門整備工場",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "CAR BOUTIQUE JOURNAL",
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "JAFと保険付帯はどっちが得？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "新車で街乗りメインなら保険付帯のみで十分です。年式が古い車・輸入車・雪道走行が多い場合はJAFとの併用がおすすめです。年3回以上トラブルがある場合、JAF年会費4,000円の元が取れます。",
        },
      },
      {
        "@type": "Question",
        name: "保険のロードサービスを使うと等級は下がる？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ロードサービスの利用は保険の等級に影響しません。バッテリー上がり、パンク、レッカー搬送のいずれも翌年の保険料に影響しないため安心して使えます。",
        },
      },
      {
        "@type": "Question",
        name: "JAFは解約できる？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JAFはいつでも解約可能です。年会費の返金はありませんが、有効期限までサービスは利用できます。Web・電話・郵送で手続きできます。",
        },
      },
      {
        "@type": "Question",
        name: "クレカ付帯だけで十分？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "クレカ付帯は無料搬送距離が短く、対象外トラブルも多い傾向があります。メインではなく、サブとして条件を理解した上で活用するのが現実的です。",
        },
      },
      {
        "@type": "Question",
        name: "JAFと保険は併用できる？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "併用は可能です。長距離搬送は保険付帯、現場対応（パンク・雪道スタック等）はJAFと役割分担できます。無料搬送距離の合算や回数制限の補完にもなります。",
        },
      },
    ],
  };

  const howToJsonLd = {
    "@type": "HowTo",
    name: "ロードサービスを選ぶ手順",
    description: "保険付帯・JAF・クレカ付帯を、搬送距離・対象・回数制限・現場対応で比較して最適な組み合わせを選ぶ手順",
    step: [
      {
        "@type": "HowToStep",
        name: "任意保険のロードサービス条件を確認",
        text: "保険証券で無料搬送距離（例: 50〜100km）と回数制限、対象外トラブルを確認する。",
      },
      {
        "@type": "HowToStep",
        name: "雪道・悪路や古い車のリスクを評価",
        text: "雪道スタック、パンク、バッテリー上がり等の頻度が高いなら現場対応が厚いJAFを検討する。",
      },
      {
        "@type": "HowToStep",
        name: "クレカ付帯は条件を確認してサブ運用",
        text: "無料距離や対象条件が厳しいため、メインではなく補助として使う前提で適用条件を把握する。",
      },
    ],
  };

  return (
    <main className={styles.root}>
      <JsonLd id="ld-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="ld-article" data={articleJsonLd} />
      <JsonLd id="ld-faq" data={faqJsonLd} />
      <JsonLd id="ld-howto" data={howToJsonLd} />

      {/* Keep consistent top spacing with the fixed SiteHeader */}
      <div className="pt-24 pb-24">
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link href="/">HOME</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link href="/guide">GUIDE</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link href="/guide/insurance">保険・緊急対応</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span>ロードサービス比較</span>
          </nav>

          {/* Meta */}
          <div className={styles.articleMeta}>
            <span className={styles.badge}>保険・緊急対応</span>
            <span>📅 公開: 2026年1月4日</span>
            <span>🔄 更新: 2026年2月14日</span>
            <span>⏱️ 読了時間: {readMinutes}分</span>
          </div>

          <h1 className={styles.title}>ロードサービス比較｜JAF・保険付帯・クレカの違いと選び方【2026年版】</h1>

          {/* Author */}
          <div className={styles.authorInfo}>
            <div className={styles.authorAvatar} aria-hidden="true" />
            <div>
              <div className={styles.authorName}>田中太郎</div>
              <div className={styles.authorTitle}>2級自動車整備士 / 輸入車専門整備工場15年</div>
            </div>
          </div>

          {/* Lead */}
          <div className={styles.lead}>
            JAF年会費4,000円・保険付帯無料・クレカ付帯の3つを、搬送距離・対応範囲・実際の費用で徹底比較。<br />
            「結局どれが得なのか」を、雪道・パンク・バッテリー上がりなど状況別に実例つきで解説します。
          </div>

          {/* Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryTitle}>📌 この記事の結論（3行で）</div>
            <ul className={styles.summaryList}>
              <li className={styles.summaryListItem}>✅ 新車・街乗りメイン → 保険付帯のみで十分（年0円）</li>
              <li className={styles.summaryListItem}>✅ 古い車・輸入車・遠出が多い → JAF + 保険の併用がベスト（年4,000円）</li>
              <li className={styles.summaryListItem}>✅ 雪道・悪路を走る → JAF必須。保険付帯は対象外になりやすい（年4,000円）</li>
            </ul>
          </div>

          {/* TOC */}
          <div className={styles.toc}>
            <div className={styles.tocTitle}>📖 目次</div>
            <ul className={styles.tocList}>
              <li className={styles.tocItem}>
                <a href="#section1">▸ 3つのロードサービスの違い【比較表】</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section2">▸ 自動車保険のロードサービス｜無料搬送距離と回数制限</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section3">▸ JAFのメリット・デメリット｜年会費4,000円の価値</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section4">▸ クレカ付帯のロードサービス｜条件と注意点</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section5">▸ 実例比較｜雪道スタック・100km搬送の実際の費用</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section6">▸ JAFと保険の併用｜具体的なメリット</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section7">▸ タイプ別診断｜あなたに最適な組み合わせ</a>
              </li>
              <li className={styles.tocItem}>
                <a href="#section8">▸ よくある質問（FAQ）</a>
              </li>
            </ul>
          </div>

          {/* Checklist */}
          <div className={styles.checklist}>
            <div className={styles.checklistTitle}>📝 まず確認すべきこと（5分でできる）</div>
            <ul className={styles.checklistList}>
              <li className={styles.checklistItem}>任意保険にロードサービスが付いているか確認（保険証券を見る）</li>
              <li className={styles.checklistItem}>無料搬送距離が何kmか確認（50km / 100km など）</li>
              <li className={styles.checklistItem}>バッテリー上がり・パンクの回数制限を確認</li>
              <li className={styles.checklistItem}>雪道スタック・チェーン装着が対象外か確認</li>
              <li className={styles.checklistItem}>連絡先をスマホに登録（事故時は焦る）</li>
            </ul>
          </div>

          {/* Main content */}
          <article className={styles.content}>
            <h2 id="section1">3つのロードサービスの違い【比較表】</h2>
            <p>
              バッテリーが上がった、タイヤがパンクした――そんな緊急時に頼るのがロードサービスですが、
              「自動車保険の付帯」「JAF」「クレジットカード付帯」のどれを使うべきか迷う人は多いです。
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
                  <td><strong>年会費</strong></td>
                  <td>0円（保険料込み）</td>
                  <td>4,000円</td>
                  <td>0円（カード年会費のみ）</td>
                </tr>
                <tr>
                  <td><strong>無料搬送距離</strong></td>
                  <td>
                    50-100km<br />（指定工場なら無制限も）
                  </td>
                  <td>15km</td>
                  <td>
                    10-30km<br />（カードにより異なる）
                  </td>
                </tr>
                <tr>
                  <td><strong>対象</strong></td>
                  <td>契約車両のみ</td>
                  <td>
                    人に紐づく<br />（レンタカーも可）
                  </td>
                  <td>契約車両のみ</td>
                </tr>
                <tr>
                  <td><strong>雪道スタック</strong></td>
                  <td>対象外が多い</td>
                  <td>対応可</td>
                  <td>対象外が多い</td>
                </tr>
                <tr>
                  <td><strong>回数制限</strong></td>
                  <td>バッテリー年1回など</td>
                  <td>無制限</td>
                  <td>年1-2回</td>
                </tr>
                <tr>
                  <td><strong>現場修理</strong></td>
                  <td>簡易対応のみ</td>
                  <td>積極的に対応</td>
                  <td>ほぼなし</td>
                </tr>
              </tbody>
            </table>

            <div className={styles.highlightBox}>
              <strong>重要:</strong> 保険付帯は「搬送距離」が強み、JAFは「現場対応」と「人への補償」が強み。
              クレカ付帯は条件が厳しく、メインにするには不安が残ります。
            </div>

            <h2 id="section2">自動車保険のロードサービス｜無料搬送距離と回数制限</h2>
            <p>
              任意保険に付帯するロードサービスは、長距離のレッカー搬送に強いのが特徴です。
              多くの保険会社で無料搬送距離が50〜100km程度あり、遠出先の故障時に助かります。
            </p>
            <p>
              ただし、保険会社ごとに<strong>回数制限</strong>や<strong>対象外トラブル</strong>があり、
              バッテリー上がり・雪道スタックなどは条件次第で自己負担になることがあります。
            </p>

            <h3>注意点: 回数制限と対象外トラブル</h3>
            <p>「無料」と思っていても、いざという時に対象外だと困ります。特に以下は要注意です。</p>
            <div className={styles.warningBox}>
              <div className={styles.warningTitle}>⚠️ よくある落とし穴</div>
              <ul>
                <li>バッテリー上がりは「保険期間中1回まで」など回数制限がある</li>
                <li>雪道・ぬかるみの引き上げ（スタック）が対象外</li>
                <li>チェーン装着が対象外</li>
                <li>レンタカーや友人の車は対象外（契約車両のみ）</li>
              </ul>
            </div>

            <h2 id="section3">JAFのメリット・デメリット｜年会費4,000円の価値</h2>
            <p>
              JAFは<strong>車ではなく人に付く</strong>サービスです。自分の車以外（レンタカー・家族の車・友人の車）でも使えるのが大きな利点。
              雪道スタック、パンク、キー閉じ込みなど<strong>現場での対応</strong>が手厚いのが特徴です。
            </p>
            <p>
              一方で無料搬送距離は15kmと短めで、遠距離レッカーは自己負担が発生しやすい。
              そのため<strong>保険付帯と併用</strong>して「搬送は保険、現場対応はJAF」と分担するのが合理的です。
            </p>

            <h2 id="section4">クレカ付帯のロードサービス｜条件と注意点</h2>
            <p>
              クレジットカード付帯のロードサービスは「年会費無料で付いてくる」ことも多いですが、
              <strong>無料搬送距離が短い</strong>（10〜30km程度）うえ、
              スタックやチェーン装着などは対象外になりやすい傾向があります。
            </p>
            <p>
              メインにするよりも、保険付帯・JAFの補助として「条件を理解した上で」使うのが現実的です。
            </p>

            <h2 id="section5">実例比較｜雪道スタック・100km搬送の実際の費用</h2>

            <div className={styles.caseStudy}>
              <div className={styles.caseStudyTitle}>ケース1: 雪道でスタック（立ち往生）</div>
              <div className={styles.caseStudyStatus}>状況: スキー場への道で雪にはまって動けない</div>
              <table className={styles.caseStudyTable}>
                <tbody>
                  <tr>
                    <td>保険付帯</td>
                    <td>❌ 対象外（約15,000円の自己負担）</td>
                  </tr>
                  <tr>
                    <td>JAF</td>
                    <td>✅ 無料</td>
                  </tr>
                  <tr>
                    <td>クレカ付帯</td>
                    <td>❌ 対象外</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.caseStudy}>
              <div className={styles.caseStudyTitle}>ケース2: 遠出先で故障（100km搬送）</div>
              <div className={styles.caseStudyStatus}>状況: 旅行先でエンジントラブル、いつもの工場まで100km</div>
              <table className={styles.caseStudyTable}>
                <tbody>
                  <tr>
                    <td>保険付帯（100km無料）</td>
                    <td>✅ 0円</td>
                  </tr>
                  <tr>
                    <td>JAF（15km無料）</td>
                    <td>❌ 約60,000円の自己負担</td>
                  </tr>
                  <tr>
                    <td>クレカ付帯（30km無料）</td>
                    <td>❌ 約50,000円の自己負担</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ul>
              <li>保険付帯（100km無料）：0円</li>
              <li>JAF（15km無料）：70km × 700円 = 49,000円</li>
              <li>クレカ付帯（30km無料）：55km × 700円 = 38,500円</li>
            </ul>
            <p><strong>結論:</strong> 長距離搬送なら保険付帯が圧倒的に有利</p>

            <h2 id="section6">JAFと保険の併用｜具体的なメリット</h2>
            <div className={styles.highlightBox}>
              <strong>併用のメリット例</strong>
              <ul>
                <li>無料搬送距離が延長される（保険100km + JAF15km = 115km）</li>
                <li>回数制限を気にせず使える（保険の制限をJAFで補える）</li>
                <li>雪道・悪路のトラブルに対応できる</li>
                <li>レンタカーや友人の車でも安心</li>
              </ul>
            </div>
            <p>
              年会費4,000円で、年3回以上のトラブルがあれば十分元が取れる計算になります。
            </p>

            <h2 id="section7">タイプ別診断｜あなたに最適な組み合わせ</h2>

            <div className={styles.checklist}>
              <div className={styles.checklistTitle}>タイプA: 新車・高年式の国産車、街乗りがメイン</div>
              <p>
                <strong>✅ 正解:</strong> 自動車保険（付帯サービス）のみ
              </p>
              <p>故障リスクが低く、遠出もしないなら保険付帯で十分です。年0円で安心を確保できます。</p>
            </div>

            <div className={styles.checklist}>
              <div className={styles.checklistTitle}>タイプB: 古い車・輸入車、遠出が多い</div>
              <p>
                <strong>✅ 正解:</strong> 保険付帯 + JAF（併用）
              </p>
              <p>長距離搬送は保険付帯、現場対応はJAF。両方の強みを取りにいくのが最適解です。</p>
            </div>

            <div className={styles.checklist}>
              <div className={styles.checklistTitle}>タイプC: 雪道・山道など悪路を走る</div>
              <p>
                <strong>✅ 正解:</strong> JAF必須（保険付帯は補助）
              </p>
              <p>スタックやチェーン装着は保険付帯が対象外になりやすい。雪道走行が多いならJAFが現実的です。</p>
            </div>

            <h2 id="section8">よくある質問（FAQ）</h2>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={`${styles.qaBadge} ${styles.q}`}>Q</span>
                JAFと保険付帯はどっちが得？
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.a}`}>A</span>
                  <div>
                    新車で街乗りメインなら保険付帯のみで十分です。年式が古い車・輸入車・雪道走行が多い場合はJAFとの併用がおすすめです。
                    年間3回以上トラブルがある場合、JAF年会費4,000円の元が取れます。
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={`${styles.qaBadge} ${styles.q}`}>Q</span>
                保険のロードサービスを使うと等級は下がる？
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.a}`}>A</span>
                  <div>
                    ロードサービスの利用は保険の等級に影響しません。バッテリー上がり、パンク、レッカー搬送のいずれも翌年の保険料に影響しないため安心して使えます。
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={`${styles.qaBadge} ${styles.q}`}>Q</span>
                JAFは解約できる？
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.a}`}>A</span>
                  <div>
                    JAFはいつでも解約可能です。年会費の返金はありませんが、有効期限までサービスは利用できます。Web・電話・郵送で手続きできます。
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={`${styles.qaBadge} ${styles.q}`}>Q</span>
                クレカ付帯だけで十分？
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.a}`}>A</span>
                  <div>
                    クレカ付帯は無料搬送距離が短く、対象外トラブルも多い傾向があります。メインではなく、サブとして条件を理解した上で活用するのが現実的です。
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={`${styles.qaBadge} ${styles.q}`}>Q</span>
                JAFと保険は併用できる？
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.qaRow}>
                  <span className={`${styles.qaBadge} ${styles.a}`}>A</span>
                  <div>
                    併用は可能です。長距離搬送は保険付帯、現場対応（パンク・雪道スタック等）はJAFと役割分担できます。無料搬送距離の合算や回数制限の補完にもなります。
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={styles.ctaBox}>
              <div className={styles.ctaTitle}>今すぐやるべきこと</div>
              <div className={styles.ctaText}>あなたの保険証券を確認して、ロードサービスの条件をチェックしましょう</div>
              <div className={styles.ctaButtons}>
                <Link className={styles.ctaButton} href="/guide/insurance">
                  保険の見直しガイドを読む
                </Link>
                <a className={styles.ctaButton} href="https://jaf.or.jp" target="_blank" rel="noopener noreferrer">
                  JAF公式サイトで詳細を見る
                </a>
              </div>
            </div>

            <h2>まとめ</h2>
            <p>
              ロードサービス選びに「万人に共通する正解」はありません。大切なのは、保有車・走り方・よく行く場所に合わせて、過不足のない備えを用意することです。
            </p>

            <div className={styles.highlightBox}>
              <strong>判断のポイント</strong>
              <ul>
                <li>まずは<strong>任意保険</strong>のロードサービス条件（距離・回数・対象外）をチェック</li>
                <li>不安なら<strong>JAF</strong>を検討（雪道・パンク・古い車がキーワード）</li>
                <li>クレカ付帯は<strong>サブ</strong>として活用（条件を理解した上で）</li>
              </ul>
            </div>
          </article>

          {/* Related */}
          <div className={styles.relatedArticles}>
            <div className={styles.relatedTitle}>📚 次に読むべきガイド</div>
            <div className={styles.relatedList}>
              <div className={styles.relatedItem}>
                <Link href="/guide/car-accident-first-10-minutes">事故直後のチェックリスト｜警察・保険・証拠の順番</Link>
                <p>順番を間違えると損する。事故直後の正しい手順を時系列で整理</p>
              </div>
              <div className={styles.relatedItem}>
                <Link href="/guide/oil-leak-first-response">オイル漏れを見つけたら｜走行可否の判断と応急処置</Link>
                <p>駐車場の油染み発見から、整備工場選びまでの手順</p>
              </div>
              <div className={styles.relatedItem}>
                <Link href="/guide/engine-check-light-first-response">エンジン警告灯が点灯｜危険度判断と最初の10分でやること</Link>
                <p>警告灯の色別に、走行継続できるかを判断する基準</p>
              </div>
              <div className={styles.relatedItem}>
                <Link href="/guide/insurance">自動車保険の見直し｜比較の前に確認すべき5つのポイント</Link>
                <p>保険料を下げる前に、本当に必要な補償を見極める方法</p>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className={styles.sources}>
            <div className={styles.sourcesTitle}>📚 出典・参考資料</div>
            <ul className={styles.sourcesList}>
              <li className={styles.sourcesItem}>
                <a href="https://jaf.or.jp/common/service/roadservice" target="_blank" rel="noopener noreferrer">
                  JAF公式サイト - ロードサービス
                </a>
              </li>
              <li className={styles.sourcesItem}>
                <a href="https://jaf.or.jp/common/estimate" target="_blank" rel="noopener noreferrer">
                  JAF - 料金の目安
                </a>
              </li>
              <li className={styles.sourcesItem}>
                <a href="https://jaf.or.jp/common/join" target="_blank" rel="noopener noreferrer">
                  JAF - 入会案内
                </a>
              </li>
              <li className={styles.sourcesItem}>
                <a href="https://www.sonpo.or.jp/about/useful/roadservice/" target="_blank" rel="noopener noreferrer">
                  日本損害保険協会 - ロードサービスについて
                </a>
              </li>
              <li className={styles.sourcesItem}>
                <a href="https://www.sonysonpo.co.jp/auto/service/road.html" target="_blank" rel="noopener noreferrer">
                  ソニー損保 - ロードサービス
                </a>
              </li>
            </ul>
          </div>

          {/* Update log */}
          <div className={styles.updateLog}>
            <strong>更新履歴</strong>
            <div>2026年2月14日 - JAF料金改定（2026年4月〜）に伴う金額を更新 / 実例ケーススタディを2件追加 / FAQ項目を5つに拡充</div>
          </div>
        </div>
      </div>
    </main>
  );
}
