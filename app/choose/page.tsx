import Link from "next/link";
import { CHOICE_GUIDES } from "@/lib/commerce";
import { referenceMetadata } from "@/lib/learning-metadata";
import styles from "./choose.module.css";

export const metadata = referenceMetadata(
  "選ぶ｜しくみを知って、自分に合う用品へ",
  "ドラレコ、洗車用品、エアフィルター。使う目的と車の条件から比較し、必要な商品候補を探すための選び方。",
  "/choose",
);

export default function ChoosePage() {
  return <main className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><span aria-current="page">選ぶ</span></nav>
    <header className={styles.heading}><p className={styles.kicker}>わかったことを、選ぶ力に。</p><h1>自分のクルマと暮らしに、<br />合うものを選ぼう。</h1><p className={styles.lead}>人気の機能が、いつも必要とは限りません。<br />何のために使うか、車に合うか、手入れを続けられるか。ひとつずつ比べると、選ぶ理由が見えてきます。</p></header>
    <div className={styles.indexIntro}><p><strong>しくみを学ぶ → 条件を比べる → 候補を探す。</strong><br />いま困っていることから、選び方を開いてみてください。</p></div>
    <ol className={styles.topicList}>{CHOICE_GUIDES.map((guide, index) => <li key={guide.slug}><span className={styles.topicNumber} aria-hidden="true">0{index + 1}</span><div><p className={styles.kicker}>{guide.theme}</p><h2><Link href={`/choose/${guide.slug}`}>{guide.title}の選び方 →</Link></h2><p>{guide.description}</p><Link href={guide.learningHref}>先にしくみを学ぶ</Link></div></li>)}</ol>
    <p className={styles.note}>交換せずに点検・調整をする、今の用品を正しく使い続ける。そんな選択も含めて考えます。</p>
  </main>;
}
