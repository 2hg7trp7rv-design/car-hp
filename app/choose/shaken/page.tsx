import Link from "next/link";
import { referenceMetadata } from "@/lib/learning-metadata";
import {
  ChoiceFigure,
  ChoiceHeader,
  ChoiceSources,
  ChoiceTalk,
  CriteriaTable,
  ServiceCandidates,
} from "@/components/commerce/ChoiceElements";
import { ShakenCostFigure } from "@/components/commerce/ShakenCostFigure";
import styles from "../choose.module.css";

export const metadata = referenceMetadata(
  "車検はどこで受ける？｜費用の内訳・日数・OBD検査で比べる",
  "検査の基準はどこでも同じ。変わるのは整備の範囲と預ける日数です。法定費用と整備費用の内訳、受け先ごとの向き不向き、2024年10月に始まったOBD検査まで。",
  "/choose/shaken",
);

export default function ShakenChoice() {
  return <main className={styles.page}>
    <ChoiceHeader
      title="車検の受け先"
      theme="メンテナンス"
      description="検査の基準はどこで受けても同じです。変わるのは、整備をどこまでやるか、何日預けるか、どこまで自分で手配するか。先に優先順位を1つ決めると、見積もりを比べやすくなります。"
      learningHref="/learn/maintenance"
      learningLabel="点検と交換のちがいを学ぶ"
    />
    <ChoiceTalk lines={[
      { speaker: "shuna", text: "車検って、どこで受けても同じじゃないの？ やる検査は同じでしょ？" },
      { speaker: "rina", text: "検査の基準は同じだよ。変わるのは、整備をどこまでやるか、何日預かるか、手続きを誰がやるか。だから見積もりの「どこが違うか」で選ぶの。" },
    ]} />
    <section id="conditions" className={styles.section}>
      <h2>何を優先するか、先に1つ決める</h2>
      <ol>
        <li><strong>費用を抑えたい。</strong> 整備の範囲を相談できる受け先を選び、見積もりの内訳を項目ごとに見ます。</li>
        <li><strong>預ける日数を短くしたい。</strong> 当日や短時間で終える受け先があります。代車の有無と、部品交換が出たときの扱いも確認します。</li>
        <li><strong>気になる不調も相談したい。</strong> 車種に詳しい受け先だと、症状の切り分けから話せます。検査に通すことと、不調を直すことは別の作業です。</li>
        <li><strong>自分で手配できる。</strong> 自分で検査場へ持ち込む方法もあります。日程の確保と、事前の点検整備は自分の責任になります。</li>
      </ol>
      <p className={styles.note}>
        「安い」と「必要な整備をしていない」は別です。見分けるところは金額の合計ではなく、内訳に何が入っているか。
      </p>
    </section>
    <section id="compare" className={styles.section}>
      <h2>同じなのは検査。変わるのは整備と手間</h2>
      <ChoiceFigure
        caption="車検で払うお金は、2つに分かれる"
        note="内訳の考え方を示す図で、金額の比率を表すものではありません。法定費用は車種・重量・期間などの条件で決まり、検査手数料は受け方によって変わることがあります。"
      >
        <ShakenCostFigure />
      </ChoiceFigure>
      <CriteriaTable
        caption="受け先ごとの、向き不向き"
        headers={["受け先", "向いている場面", "見るところ"]}
        rows={[
          ["ディーラー", "その車種の整備実績を重視したいとき。保証や記録を残したいとき。", "見積もりの整備項目、代車、預かり日数。"],
          ["整備工場", "不調の相談も一緒にしたいとき。付き合いを続けたいとき。", "指定工場か認証工場か、部品の選び方の説明。"],
          ["車検専門店", "日数と費用を抑えたいとき。", "その場でできる整備の範囲、追加整備が出たときの連絡方法。"],
          ["自分で持ち込む", "手間をかけられて、点検整備も自分で用意できるとき。", "予約の取り方、必要書類、通らなかったときの再検査。"],
        ]}
      />
      <h3>2024年10月から、電子的な検査（OBD検査）が加わった</h3>
      <p>
        自動ブレーキなどの先進安全技術が正しく働くかを、車載の記録から確かめる検査です。国土交通省の案内では、
        <strong>2021年10月1日以降の新型車</strong>（輸入車は2022年10月1日以降）を対象に、
        <strong>2024年10月1日以降の車検</strong>（輸入車は2025年10月1日以降）で実施されます。
        自分の車が対象かどうかは、受け先に確認してください。
      </p>
      <p>
        つまり、先進安全装備の警告灯が点いたままなら、その整備が先になります。
        <Link href="/learn/driving-support">センサーが何を見ているか</Link>を知っておくと、
        「どこが検知できていないか」を相談しやすくなります。
      </p>
      <h3>法定点検と車検は、別のもの</h3>
      <p>
        車検はその時点で保安基準に適合しているかの検査、法定点検は決められた項目を定期的に点検する整備です。
        同じ機会にまとめて行うことが多いので、見積もりでは<strong>どちらの費用なのか</strong>を分けて読みます。
        検査に通ったことは、次の2年間の状態を保証するものではありません。
      </p>
    </section>
    <section id="next" className={styles.section}>
      <h2>予約の前に、条件を一行にする</h2>
      <div className={styles.decision}>
        <h3>たとえば、こんな比較メモ</h3>
        <p>「費用を抑えたい。預けるのは2日まで。警告灯が1つ点いているので、その相談もしたい。追加整備が出たら、作業前に連絡がほしい。」</p>
      </div>
      <ServiceCandidates
        offerKey="shaken"
        contentId="choose-shaken"
        heading="決めた条件で、受け先を探す"
        description="地域と日程から、車検の予約先を比べられます。見積もりが出たら、上の図の右側（整備・代行の費用）を項目ごとに見比べてください。"
        label="車検の予約先を比べる"
        note="外部サイトへ移動します。表示される費用や条件は、各店舗の掲載内容をご確認ください。"
      />
      <nav className={styles.related} aria-label="関連する選び方">
        <Link href="/learn/maintenance">点検とオイル選びを学ぶ →</Link>
        <Link href="/choose">ほかの選び方 →</Link>
      </nav>
    </section>
    <ChoiceSources sources={[
      { title: "国土交通省｜自動車検査登録総合ポータルサイト", href: "https://www.jidoushatouroku-portal.mlit.go.jp/jidousha/kensatoroku/", note: "検査・登録の制度と手続きの入口。手数料や必要書類は、ここから対象の手続きを確認する。" },
      { title: "国土交通省｜自動車の点検・整備", href: "https://www.mlit.go.jp/jidosha/jidosha/tenkenseibi/", note: "日常点検と定期点検の考え方。車検とは別に、点検整備の義務が定められている。" },
      { title: "国土交通省｜自動車の電子的な検査（OBD検査）について", href: "https://www.mlit.go.jp/jidosha/jidosha_OBD.html", note: "対象車と開始時期。令和3年10月1日以降の新型車を対象に、令和6年10月1日以降の車検で実施（輸入車は1年後）。" },
    ]} />
  </main>;
}
