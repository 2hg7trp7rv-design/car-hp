import Link from "next/link";
import { referenceMetadata } from "@/lib/learning-metadata";
import { AmazonCandidates, ChoiceHeader, ChoiceSources, ChoiceTalk, CriteriaTable } from "@/components/commerce/ChoiceElements";
import styles from "../choose.module.css";

export const metadata = referenceMetadata(
  "ドラレコの選び方｜録画範囲・夜間映像・駐車電源で比較",
  "前後カメラの画角、夜間の識別、駐車監視の電源、SDカードと取り付け条件。使う場面に合うドラレコを選ぶための比較基準。",
  "/choose/drive-recorder",
);

export default function DriveRecorderChoice() {
  return <main className={styles.page}>
    <ChoiceHeader title="ドライブレコーダー" theme="電装・安全装備" description="まず決めたいのは、どの場面を、どの方向まで残したいか。画素数だけで選ばず、録画の範囲と、取り付けた後の使い方まで比べましょう。" learningHref="/learn/driving-support" learningLabel="カメラと運転支援のしくみを学ぶ" />
    <ChoiceTalk lines={[
      { speaker: "shuna", text: "ドラレコって、画素数が高いものを選べばいいんだよね？" },
      { speaker: "rina", text: "画素数は一つの条件でしかないよ。まず「どの場面を、どの方向まで残したいか」。そこが決まると、比べる項目が絞れるの。" },
    ]} />
    <section id="conditions" className={styles.section}>
      <h2>残したい場面を3つに分ける</h2>
      <ol><li><strong>走行中の前後。</strong> 前後2カメラを候補に、後方カメラの取り付け位置と配線距離も確認します。</li><li><strong>側方や車内も含む範囲。</strong> 前後2カメラで側方まで常に残せるとは限りません。必要な方向が画角に入るか、設置した映像で確かめます。</li><li><strong>エンジンを止めた後。</strong> 駐車監視の録画方式、電源、録画が止まる条件をセットで確認します。</li></ol>
      <p className={styles.note}>すでに録画機能が付いている車は、純正機能の範囲と保存方法を先に確認。足りない場面が分かると、追加する機能を絞れます。</p>
    </section>
    <section id="compare" className={styles.section}>
      <h2>仕様表は、同じ項目で並べる</h2>
      <CriteriaTable caption="候補ごとに確認する6項目" headers={["比較する項目", "見る場所・条件", "判断のポイント"]} rows={[
        ["録画範囲", "前後それぞれの水平・垂直の記録画角", "対角の数字と水平の数字を混ぜない。カメラ数と死角も確認。"],
        ["夜間・明暗差", "夜間の実映像、HDR等の対応、後方ガラスの条件", "高画素だけで識別を保証できない。暗さや反射、スモークの影響を見る。"],
        ["録画時間", "解像度・フレームレート・対応SD容量", "長時間モードで画質や動きの記録がどう変わるか確認。"],
        ["駐車監視", "常時・衝撃・タイムラプス等の方式と必要な電源部品", "必要な前後の時間を残せるか。消費電力と停止条件も含める。"],
        ["記録の管理", "推奨SDカード、点検、保存・再生の手順", "フォーマット不要でも、録画確認やカードの管理は続ける。"],
        ["取り付け", "視界、車両のセンサー、エアバッグ、配線経路", "本体だけでなく、適合する配線部品と取り付け作業も見積もる。"],
      ]} />
      <p>録画時間やHDRの対応には、設定や使用カードの条件が付くことがあります。<a href="https://www.kenwood.com/jp/car/drive-recorders/comparison/">KENWOODの機能比較表</a>のように、表の下の注記まで読むと、同じ条件で比べやすくなります。</p>
      <h3>駐車監視は「何時間」だけで決めない</h3>
      <p>車両の常時電源を使う方式は、エンジン停止中もバッテリーへ負荷がかかります。乗る頻度が少ない、短距離が中心、バッテリーの状態が分からない場合は、電源方式と使用条件を取り付け店に相談しましょう。停止電圧やタイマーがあっても、あらゆる状態でバッテリー上がりを防ぐ保証にはなりません。<a href="https://www.e-comtec.co.jp/0_etc/faq/?category=23">COMTECの駐車監視FAQ</a>も確認できます。</p>
      <h3>取り付け後に、実際の映像を確認する</h3>
      <p>運転の視界や車両カメラの範囲を妨げず、エアバッグの展開にも干渉しない取り付けが必要です。車両と製品双方の取扱説明書に従い、配線を含めて確認します。前後が録れているか、日時が合っているか、必要な映像を保存できるかを、安全に停車した状態で確かめてください。</p>
    </section>
    <section id="next" className={styles.section}>
      <h2>候補を探す前に、条件を一行にする</h2>
      <div className={styles.decision}><h3>たとえば、こんな比較メモ</h3><p>「前後を録画したい。夜間の後方映像を確認する。駐車監視は電源条件を相談して決める。対応SDカードと取り付け費用も含めて比べる。」</p></div>
      <AmazonCandidates offerKey="driveRecorder" contentId="choose-drive-recorder" description="前後2カメラの検索結果へ進みます。候補が見つかったら、型番の取扱説明書と車両への取り付け条件を照らし合わせましょう。" />
      <nav className={styles.related} aria-label="関連する選び方"><Link href="/learn/driving-support">運転支援のしくみへ戻る →</Link><Link href="/choose">ほかの用品の選び方 →</Link></nav>
    </section>
    <ChoiceSources sources={[
      { title: "KENWOOD｜ドライブレコーダー機能比較", href: "https://www.kenwood.com/jp/car/drive-recorders/comparison/", note: "画角・画質・録画モード・カード容量の比較項目と注記。" },
      { title: "COMTEC｜HDR801 取扱説明書（PDF）", href: "https://www.e-comtec.co.jp/manual/drive_recorder/hdr801.pdf", note: "安全上の注意、取り付け、SDカード、駐車監視。記載された設定値は同型番のもの。" },
      { title: "COMTEC｜駐車監視のよくある質問", href: "https://www.e-comtec.co.jp/0_etc/faq/?category=23", note: "車両バッテリーへの負荷と利用条件。具体的な条件は選ぶ機種で確認する。" },
      { title: "KENWOOD｜DRV-D50W 機能ガイド", href: "https://manual.kenwood.com/mt/dvr/drv_d50w/ja-JP/215620491.html", note: "前後録画と、SDメンテナンスフリー機能の対象・使い方。" },
    ]} />
  </main>;
}
