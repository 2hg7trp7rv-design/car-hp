import Link from "next/link";
import { referenceMetadata } from "@/lib/learning-metadata";
import { AmazonCandidates, ChoiceHeader, ChoiceSources, CriteriaTable } from "@/components/commerce/ChoiceElements";
import styles from "../choose.module.css";

export const metadata = referenceMetadata(
  "洗車用品の選び方｜塗装・コーティングと使い方で比較",
  "中性シャンプー、スポンジ、拭き取りクロス、簡易コーティング。車の素材と施工状態、希釈やすすぎ方から必要な用品を選びます。",
  "/choose/car-wash",
);

export default function CarWashChoice() {
  return <main className={styles.page}>
    <ChoiceHeader title="洗車用品" theme="メンテナンス" description="最初から洗剤を何種類もそろえる必要はありません。洗う場所と表面の状態に合うものを選び、汚れを落として、すすぎ、水滴を拭き取るところまでを準備しましょう。" learningHref="/learn/maintenance" learningLabel="車の指定と点検の考え方を学ぶ" />
    <section id="conditions" className={styles.section}>
      <h2>ボディの状態を、先に確認</h2>
      <ol><li><strong>どこを洗う？</strong> 塗装面、ガラス、樹脂、ホイールは、製品が使える場所を分けて確認します。</li><li><strong>何が施工されている？</strong> コーティング、ワックス、フィルムなどがあれば、その施工元の手入れ指定を優先します。</li><li><strong>特別な仕上げや傷みはある？</strong> つや消し塗装、再塗装、劣化した塗膜などは、通常の「全色対応」だけで判断せず、車両・施工元と用品双方の適合を確認します。</li></ol>
      <p className={styles.note}>「中性」「ノーコンパウンド」「コーティング車対応」は別々の情報。中性という言葉だけで、あらゆる素材や被膜へ使えるとは決められません。</p>
    </section>
    <section id="compare" className={styles.section}>
      <h2>洗う・すすぐ・拭くを一組で考える</h2>
      <CriteriaTable caption="まず比較したい用品と表示" headers={["用品", "確認する表示・状態", "選ぶときの考え方"]} rows={[
        ["カーシャンプー", "用途、液性、研磨成分の有無、施工面への適合、希釈率", "日常の汚れを洗う目的から選ぶ。強い洗浄力だけを求めない。"],
        ["スポンジ・洗浄用クロス", "塗装面に適した用途と清潔な状態", "砂などを抱えたままこすらない。足回り用とボディ用を分けて管理。"],
        ["拭き取りクロス", "水滴を吸い取る用途、清潔さ、扱いやすい大きさ", "洗った後に水滴を残さず作業できる枚数を用意。"],
        ["簡易コーティング", "施工できる素材、既存被膜との適合、濡れた面・乾いた面の指定", "洗浄剤の代わりにはしない。必要性と施工条件が分かってから追加。"],
      ]} />
      <p>たとえば<a href="https://www.surluster.jp/product/bodycare/carshampoo/">シュアラスターのカーシャンプー1000</a>は、中性・ノーコンパウンドの希釈タイプですが、再塗装車や劣化した塗膜への使用は避けるよう案内されています。「全色対応」と使用上の注意を、一緒に読むことが大切です。</p>
      <h3>洗剤の濃さと、乾く前のすすぎ</h3>
      <p>最初に水で砂やホコリを流し、製品に指定された割合で希釈して洗います。濃くすればよいとは考えず、泡や液剤が残らないようすすぎ、水滴を拭き取ります。熱いボディや炎天下、液剤を付けたままの長時間放置を避ける注意は、<a href="https://www.soft99shop.com/Form/Product/ProductDetail.aspx?cat=103210&pid=04265&shop=0">ソフト99のシャンプー説明</a>でも確認できます。</p>
      <p>希釈率は製品ごとに違います。バケツ洗い向けの数値を、そのままフォームガンへ流用しないでください。道具側と洗剤側の指定を合わせて確認します。</p>
      <h3>落ちない汚れは、こする前に種類を確かめる</h3>
      <p>普通の洗車で落ちないからといって、研磨剤や別のクリーナーを次々に重ねないこと。汚れなのか被膜の傷みなのか、素材と施工状態を確認し、分からなければ施工店へ相談しましょう。今のコーティングの手入れ指定がある場合は、追加のコーティング剤が必要かも確認します。</p>
    </section>
    <section id="next" className={styles.section}>
      <h2>いま必要なものから、そろえる</h2>
      <div className={styles.decision}><h3>最初の比較メモ</h3><p>「自分の塗装とコーティングに適合するシャンプー。指定の希釈で使う。洗う道具と拭くクロスは清潔に分ける。簡易コーティングは施工元の指定を確認してから。」</p></div>
      <AmazonCandidates offerKey="carWash" contentId="choose-car-wash" description="中性シャンプー・簡易コーティングの検索結果へ進みます。用途と施工面への適合を製品ごとに確認し、必要な用品を選びましょう。" />
      <nav className={styles.related} aria-label="関連する選び方"><Link href="/learn/maintenance">点検と手入れの考え方へ戻る →</Link><Link href="/choose">ほかの用品の選び方 →</Link></nav>
    </section>
    <ChoiceSources sources={[
      { title: "SurLuster｜カーシャンプー1000", href: "https://www.surluster.jp/product/bodycare/carshampoo/", note: "中性・ノーコンパウンド、希釈、すすぎ、拭き取り、使用できない状態とフォームガンの注意。" },
      { title: "ソフト99｜コーティング施工車専用メンテナンスシャンプー", href: "https://www.soft99shop.com/Form/Product/ProductDetail.aspx?cat=103210&pid=04265&shop=0", note: "用途、予洗い、希釈、すすぎと道具の手入れ。希釈率は対象製品固有の指定。" },
      { title: "SurLuster｜ゼロウォーターの使い方", href: "https://shop.surluster.jp/products/zerowater", note: "簡易コーティングの施工面と、塗り伸ばし・拭き上げの製品例。全製品共通の施工手順にはしない。" },
    ]} />
  </main>;
}
