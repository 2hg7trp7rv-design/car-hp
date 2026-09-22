import Link from "next/link";
import { referenceMetadata } from "@/lib/learning-metadata";
import { ChoiceHeader, ChoiceSources, CriteriaTable } from "@/components/commerce/ChoiceElements";
import styles from "../choose.module.css";

export const metadata = referenceMetadata(
  "エアフィルターの選び方｜純正維持と社外3形態を比較",
  "純正交換型・密閉型・露出型の違いと、車両型式、管理方法、交換する目的。純正維持も含めてエアフィルターを選ぶための比較基準。",
  "/choose/air-filter",
);

export default function AirFilterChoice() {
  return <main className={styles.page}>
    <ChoiceHeader title="エアフィルター" theme="吸気・排気" description="交換時期だから整備するのか、吸気の特性を変えたいのか。目的を分けると、純正を保つ選択と、社外品で変わる範囲を落ち着いて比較できます。" learningHref="/learn/air-cleaner" learningLabel="エアクリーナーの役割から学ぶ" />
    <section id="conditions" className={styles.section}>
      <h2>交換したい理由を、先に言葉にする</h2>
      <p>劣化や汚れに対応する整備なら、車両指定の純正フィルターへ交換し、純正の箱や配管を維持する選択が出発点になります。今の状態に不具合がなく、変えたい目的もないなら、指定どおりの点検と交換を続ける選び方もあります。</p>
      <p>吸気音や構成を変えたい場合は、フィルターだけでなく、箱・配管・センサー周辺の変更範囲まで確認します。商品名に「高効率」とあっても、自分の車の全条件で出力が上がるとは判断できません。</p>
      <p className={styles.learningLink}><span>変更前に、影響を整理する</span><Link href="/guide/aftermarket-air-cleaner-risk-guide">社外エアクリーナーのリスクを読む →</Link></p>
    </section>
    <section id="compare" className={styles.section}>
      <h2>社外品は、変える範囲で比べる</h2>
      <CriteriaTable caption="純正を維持する選択と、社外品の3形態" headers={["選択肢", "主に変わる範囲", "確認したいこと"]} rows={[
        ["純正を維持", "車両指定のフィルターで整備し、箱・配管を保つ", "車両の指定品番、使用条件と点検・交換の案内。"],
        ["純正交換型", "純正の箱を残して、フィルターを交換", "寸法とシール、ろ材、交換・洗浄の可否。"],
        ["密閉型", "箱を含めた吸気キットへ交換", "導入口と配管、センサーの取り付け、必要な付属部品。"],
        ["露出型", "フィルターを箱の外へ露出させる構成", "熱や水の影響、固定方法、センサー周辺、管理頻度。"],
      ]} />
      <p className={styles.note}>この3形態は、変更範囲を整理するための分類です。製品ごとの構成は異なり、名前だけで集じん性能、吸気抵抗、出力の優劣は決まりません。</p>
      <h3>「洗えるか」は、ろ材と製品の指定で決める</h3>
      <p><a href="https://www.hks-power.co.jp/aftersupport/faq/spfr_rsr.html">HKSのスーパーパワーフロー用フィルター</a>には、洗って再使用できないという案内があります。一方、<a href="https://www.knfilters.com/cleaning">K&amp;Nの手入れ資料</a>は、製品の種類に応じた洗浄や給油を案内しています。別製品の洗い方を、そのまま流用しないでください。</p>
      <p>乾式・湿式、使い切り・再使用の別、指定の洗浄剤やオイル、乾燥方法まで読んで、継続できる管理を選びます。交換間隔も、見た目や他車の数字だけでは決めず、対象製品と使用環境の指定に従います。</p>
    </section>
    <section id="next" className={styles.section}>
      <h2>品番を探す前に、この4点をそろえる</h2>
      <ol><li><strong>車両型式・エンジン型式・年式。</strong> 車名が同じでも適合は分かれることがあります。</li><li><strong>グレードや仕様、いま付いている部品。</strong> 適合表の備考や除外条件も読みます。</li><li><strong>交換する範囲と追加部品。</strong> 配管、固定、センサー、調整の要否を対象キットで確認します。</li><li><strong>続けられる管理。</strong> 交換フィルターの品番と入手方法、点検・交換・洗浄の手順を確認します。</li></ol>
      <div className={styles.decision}><h3>迷ったら、目的と適合を整備店へ</h3><p>「型式はこれ、いまは純正、変えたいのはこの点」と伝えると、純正を保つ案と社外品を同じ条件で検討できます。現状の不調がある場合は、部品選びの前に原因を点検しましょう。</p></div>
      <a className={styles.manufacturerLink} href="https://www.hks-power.co.jp/product/search?tab=vehicle">HKS公式で車種別の適合候補を確認する ↗</a>
      <p className={styles.note}>メーカー検索では、車両型式と年式を選び、吸気カテゴリーの製品詳細・備考まで確認します。純正品番は車両メーカーや販売店で確認してください。</p>
      <nav className={styles.related} aria-label="関連する学習とガイド"><Link href="/learn/air-cleaner">エアクリーナーの教科書へ戻る →</Link><Link href="/guide/aftermarket-air-cleaner-risk-guide">交換による影響を詳しく読む →</Link><Link href="/choose">ほかの用品の選び方 →</Link></nav>
    </section>
    <ChoiceSources sources={[
      { title: "HKS｜車種別製品検索", href: "https://www.hks-power.co.jp/product/search?tab=vehicle", note: "メーカー、車種、車両型式、年式から適合候補を確認する入口。" },
      { title: "HKS｜スーパーパワーフロー・レーシングサクションのFAQ", href: "https://www.hks-power.co.jp/aftersupport/faq/spfr_rsr.html", note: "対象フィルターの乾式・湿式、再使用の可否、交換について。" },
      { title: "K&N｜フィルターの手入れ", href: "https://www.knfilters.com/cleaning", note: "対象製品の種類に合った洗浄・乾燥・給油の方法を確認する資料。" },
    ]} />
  </main>;
}
