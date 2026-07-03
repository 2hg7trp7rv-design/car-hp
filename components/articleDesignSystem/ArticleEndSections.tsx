import Link from "next/link";

import { ArticleIcon } from "@/components/articleDesignSystem/icons";
import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";
import type { ArticlePageLabels, ArticleViewModel } from "@/types/article-design-system";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

function formatDateDot(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace(/-/g, ".");
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

type SourceDisplay = {
  title: string;
  meta: string;
};

const SOURCE_LABELS: Array<[RegExp, SourceDisplay]> = [
  [/naltec\.go\.jp\/faq\/0004\.html$/u, { title: "自動車技術総合機構｜後付け部品に関するFAQ", meta: "公的機関 / 装着状態での審査" }],
  [/naltec\.go\.jp\/faq\/0003\.html$/u, { title: "自動車技術総合機構｜保安基準・検査に関するFAQ", meta: "公的機関 / 検査・保安基準" }],
  [/mlit\.go\.jp\/.*\/huseikaizou\/h1\/h1-2\/?$/u, { title: "国土交通省｜不正改造防止に関する資料", meta: "公的機関 / 保安基準・不正改造" }],
  [/mlit\.go\.jp\/.*\/huseikaizou\/h2\/h2-1\/?$/u, { title: "国土交通省｜保安基準と改造に関する資料", meta: "公的機関 / 改造時の確認" }],
  [/mlit\.go\.jp\/jidosha\/content\/001332203\.pdf$/u, { title: "国土交通省｜自動車特定整備制度の概要", meta: "公的機関 / 電子制御装置整備" }],
  [/mlit\.go\.jp\/jidosha\/jidosha_fr9_000016\.html$/u, { title: "国土交通省｜特定整備制度・電子制御装置整備", meta: "公的機関 / カメラ・レーダー調整" }],
  [/mlit\.go\.jp\/jidosha\/jidosha_fr9_Target_vehicle\.html$/u, { title: "国土交通省｜電子制御装置整備の対象車両", meta: "公的機関 / 対象装置の確認" }],
  [/jaspa\.or\.jp\/user\/remodel\/exclusion\.html$/u, { title: "日本自動車整備振興会連合会｜不正改造の排除", meta: "業界団体 / 整備・保安基準" }],
  [/napac\.jp\/cms\/ja\/asea\/quality-auth\/?$/u, { title: "NAPAC｜ASEA品質認定制度", meta: "業界団体 / アフターパーツ品質認定" }],
  [/napac\.jp\/cms\/ja\/jasma\/certified-muffler-jasma\/?$/u, { title: "NAPAC｜JASMA認定マフラー", meta: "業界団体 / マフラー認定" }],
  [/toyota\.jp\/after_service\/support\/general\/?$/u, { title: "トヨタ自動車｜アフターサービス・保証", meta: "メーカー公式 / 保証条件" }],
  [/toyota\.jp\/after_service\/support\/special\/?$/u, { title: "トヨタ自動車｜保証が適用されない事項", meta: "メーカー公式 / 保証対象外の考え方" }],
  [/aftc\.or\.jp\/content\/files\/pdf\/aftc_info\/aftcinfo_20190326\.pdf$/u, { title: "自動車公正取引協議会｜修復歴表示に関する資料", meta: "業界団体 / 中古車表示・修復歴" }],
  [/jucda\.or\.jp\/soudan\/trouble\/afterdelivery\/05\.html$/u, { title: "日本中古自動車販売協会連合会｜購入後トラブル相談", meta: "業界団体 / 中古車購入後の確認" }],
  [/bosch-mobility\.com\/en\/solutions\/sensors\/air-mass-meter\/?$/u, { title: "Bosch Mobility｜Air mass meter", meta: "メーカー公式 / 吸入空気量センサー" }],
  [/denso\.com\/.*\/air-flow-sensor\/?$/u, { title: "DENSO｜Air Flow Sensor", meta: "メーカー公式 / エアフローセンサー" }],
  [/ngkntk\.com\/.*\/map-vs-maf-sensors\/?$/u, { title: "Niterra｜MAPとMAFセンサーの基礎", meta: "メーカー系情報 / 吸気センサー" }],

  [/bosch-mobility\.com\/en\/solutions\/sensors\/hotfilm-airflow-sensor\/?$/u, { title: "Bosch Mobility｜Hot-film air-mass meter", meta: "メーカー公式 / 吸入空気量センサー" }],
  [/denso-am\.eu\/products\/engine-management-systems\/mass-air-flow-sensors\/?$/u, { title: "DENSO｜How do Mass Air Flow sensors work", meta: "メーカー公式 / MAFセンサー・吸気温度" }],
  [/densoautoparts\.com\/engine-management-sensors-mass-air-flow-sensors\/?$/u, { title: "DENSO Auto Parts｜Mass Air Flow Sensors", meta: "メーカー公式 / エンジン制御センサー" }],
  [/hks-power\.co\.jp\/product\/intake\/spf\/index\.html$/u, { title: "HKS｜スーパーパワーフロー", meta: "メーカー公式 / むき出しエアクリーナー" }],
  [/hks-power\.co\.jp\/product_search\/product\/download\/3469\/ja\/70019-AT108\.pdf$/u, { title: "HKS｜スーパーパワーフロー取扱説明書", meta: "メーカー公式 / 適合・取付注意" }],
  [/hks-power\.co\.jp\/en\/tuning\/step03\.html$/u, { title: "HKS｜Beginners guide to tuning / INTAKE", meta: "メーカー公式 / 吸気方式・吸気温度" }],
  [/blitz\.co\.jp\/support\/manual\/aircleaner\/core_282\.pdf$/u, { title: "BLITZ｜エアクリーナー取扱説明書", meta: "メーカー公式 / 適合・取付注意" }],
  [/blitz\.co\.jp\/support\/manual\/aircleaner\/core_269\.pdf$/u, { title: "BLITZ｜エアクリーナー取扱説明書", meta: "メーカー公式 / 適合・配管・純正部品保管" }],
  [/blitz\.co\.jp\/support\/manual\/aircleaner\/core_223\.pdf$/u, { title: "BLITZ｜エアクリーナー取扱説明書", meta: "メーカー公式 / エアフロ学習・干渉確認" }],
  [/haltech\.com\/news-events\/news\/maf-vs-map\/?$/u, { title: "Haltech｜MAFとMAPの違い", meta: "メーカー系情報 / エンジン制御" }],
  [/kandn\.com\/faq\/?$/u, { title: "K&N｜フィルター製品FAQ", meta: "メーカー公式 / 社外フィルターの取扱い" }],
  [/kyb\.co\.jp\/en\/products\/automotive\.html$/u, { title: "KYB｜Automotive shock absorbers", meta: "メーカー公式 / ショックアブソーバー" }],
  [/monroe\.com\/technical-resources\/shocks-101\/symptoms-worn-shock-struts\.html$/u, { title: "Monroe｜ショック・ストラット劣化症状", meta: "メーカー公式 / 足回り症状" }],
  [/yorozu-corp\.co\.jp\/en\/products\/suspension\/?$/u, { title: "ヨロズ｜Suspension products", meta: "メーカー公式 / サスペンション部品" }],
  [/bridgestoneamericas\.com\/en\/company\/safety\/maintaining-tires\/tire-inflation\/?$/u, { title: "Bridgestone Americas｜Tire inflation", meta: "メーカー公式 / タイヤ空気圧" }],
  [/bridgestonetire\.com\/content\/dam\/.*Maintenance_and_Safety_Manual.*\.pdf$/u, { title: "Bridgestone Firestone｜タイヤ整備・安全マニュアル", meta: "メーカー公式 / タイヤ点検" }],
  [/bosch-mobility\.com\/en\/solutions\/vehicle-computer\/central-gateway\/?$/u, { title: "Bosch Mobility｜Central gateway", meta: "メーカー公式 / 車両ネットワーク" }],
  [/iso\.org\/standard\/86384\.html$/u, { title: "ISO 11898｜Controller area network", meta: "国際規格 / CAN通信" }],
  [/iso\.org\/standard\/67244\.html$/u, { title: "ISO 14229｜Unified diagnostic services", meta: "国際規格 / 車両診断通信" }],
  [/unece\.org\/transport\/vehicle-regulations\/wp29\/cyber-security-and-cyber-security-management-system\/?$/u, { title: "UNECE WP.29｜Cyber security and CSMS", meta: "国際基準 / 車両サイバーセキュリティ" }],
  [/elaws\.e-gov\.go\.jp\/document\?lawid=335AC0000000105$/u, { title: "e-Gov法令検索｜道路交通法", meta: "公的法令 / 運転中の注視防止" }],
  [/nhtsa\.gov\/(?:vehicle-safety|risky-driving)\/distracted-driving\/?$/u, { title: "NHTSA｜Distracted driving", meta: "公的機関 / 脇見運転防止" }],
  [/federalregister\.gov\/documents\/2013\/04\/26\/2013-09883\/visual-manual-nhtsa-driver-distraction-guidelines-for-in-vehicle-electronic-devices$/u, { title: "NHTSA｜車載電子機器の視覚操作ガイドライン", meta: "公的機関 / 車載表示・操作負荷" }],
  [/nhtsa\.gov\/vehicle-safety\/driver-assistance-technologies\/?$/u, { title: "NHTSA｜Driver assistance technologies", meta: "公的機関 / ADASの基礎" }],
  [/nhtsa\.gov\/vehicle-safety\/tires\/?$/u, { title: "NHTSA｜Tires", meta: "公的機関 / タイヤ安全" }],
  [/vcci\.jp\/general\/flow\.html$/u, { title: "VCCI協会｜自主規制の内容と適用範囲", meta: "業界団体 / 電子機器の適合確認" }],
  [/fcc\.gov\/oet\/ea\/rfdevice$/u, { title: "FCC｜RF機器の認可制度", meta: "公的機関 / 電波機器認可" }],
];

function sourceDisplay(value: string): SourceDisplay {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./u, "");
    const path = url.pathname === "/" ? "" : url.pathname;
    const key = `${host}${path}${url.search}`;
    const matched = SOURCE_LABELS.find(([pattern]) => pattern.test(key));
    if (matched) return matched[1];
    return { title: host, meta: "参考資料" };
  } catch {
    return { title: value, meta: "参考資料" };
  }
}

export function Checkpoints({ items }: { items?: string[] | null }) {
  const values = (items ?? []).filter(Boolean);
  if (!values.length) return null;
  return (
    <section className={styles.finalChecklist}>
      <header><ArticleIcon name="check" /><span>CHECK</span><h2>最後に確認すること</h2></header>
      <ol>{values.map((item, index) => <li key={item}><span>{index + 1}</span><p>{renderInlineMarkdown(item)}</p></li>)}</ol>
    </section>
  );
}

export function ActionBox({ article }: { article: ArticleViewModel }) {
  const box = article.actionBox;
  if (!box) return null;
  return (
    <section className={styles.actionBox}>
      <span>NEXT ACTION</span>
      <h2>{renderInlineMarkdown(box.title)}</h2>
      {box.body ? <p>{renderInlineMarkdown(box.body)}</p> : null}
      <div>{box.actions.map((action) => action.external
        ? <a key={action.href} href={action.href} target="_blank" rel="noreferrer"><span>{action.label}</span><ArticleIcon name="arrow" /></a>
        : <Link key={action.href} href={action.href}><span>{action.label}</span><ArticleIcon name="arrow" /></Link>)}</div>
    </section>
  );
}

export function AuthorCard({ article }: { article: ArticleViewModel }) {
  return (
    <section className={styles.authorCard}>
      <div className={styles.authorIcon}><ArticleIcon name="person" /></div>
      <div>
        <span>AUTHOR / EDITOR</span>
        <h2>{article.author.name}</h2>
        {article.author.credential ? <p>{article.author.credential}</p> : null}
        <dl>
          {article.publishedAt ? <div><dt>公開</dt><dd>{formatDateDot(article.publishedAt)}</dd></div> : null}
          {article.updatedAt ? <div><dt>更新</dt><dd>{formatDateDot(article.updatedAt)}</dd></div> : null}
        </dl>
      </div>
    </section>
  );
}

export function RelatedSection({ article, labels }: { article: ArticleViewModel; labels: ArticlePageLabels }) {
  const related = article.relatedItems ?? [];
  if (!related.length) return null;
  return (
    <section className={styles.relatedSection} aria-label={labels.relatedAriaLabel || labels.relatedTitle}>
      <span>RELATED</span>
      <h2>{labels.relatedTitle}</h2>
      <div>
        {related.map((item) => (
          <Link href={item.href} key={item.slug}>
            {item.imageSrc ? <figure>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.imageSrc} alt={item.imageAlt || item.title} width={320} height={180} loading="lazy" decoding="async" /></figure> : null}
            <section><span>{item.metaLabel}</span><h3>{item.title}</h3><p>{item.summary}</p>{item.date ? <small>{item.date}</small> : null}</section>
            <ArticleIcon name="arrow" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({ article }: { article: ArticleViewModel }) {
  const faq = article.faq ?? [];
  if (!faq.length) return null;
  return (
    <section className={styles.faqSection}>
      <span>FAQ</span>
      <h2>よくある質問</h2>
      <div>{faq.map((item, index) => <details key={`${index}-${item.question}`}><summary><b>Q</b><span>{item.question}</span><i /></summary><div><b>A</b><p>{renderInlineMarkdown(item.answer)}</p></div></details>)}</div>
    </section>
  );
}

export function SourcesSection({ article, labels }: { article: ArticleViewModel; labels: ArticlePageLabels }) {
  const sources = article.sources ?? [];
  if (!sources.length && !article.updateText) return null;
  return (
    <section className={styles.sourcesSection}>
      <header><ArticleIcon name="source" /><div><span>REFERENCES</span><h2>{labels.sourcesTitle || "出典・参考資料"}</h2></div></header>
      {sources.length ? <ol>{sources.map((source, index) => {
        const display = sourceDisplay(source);
        return (
          <li key={source}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <a href={source} target="_blank" rel="noreferrer">
              <strong>{display.title}</strong>
              {display.meta ? <small>{display.meta}</small> : null}
            </a>
          </li>
        );
      })}</ol> : null}
      {article.updateText ? <p><ArticleIcon name="calendar" />{labels.updateTitle || "更新履歴"}：{article.updateText}</p> : null}
    </section>
  );
}

export function ArticleFooter({ labels }: { labels: ArticlePageLabels }) {
  return (
    <footer className={styles.articleFooter}>
      <div>
        <strong>CAR BOUTIQUE JOURNAL</strong>
        <nav aria-label="記事フッター">
          <Link href={labels.footerListHref}>{labels.footerListLabel}</Link>
          <Link href="/legal/about">運営情報</Link>
          <Link href="/legal/editorial-policy">編集方針</Link>
          <Link href="/legal/privacy">プライバシー</Link>
          <Link href="/contact">お問い合わせ</Link>
        </nav>
        <small>© 2026 CAR BOUTIQUE JOURNAL</small>
      </div>
    </footer>
  );
}

