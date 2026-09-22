import styles from "@/app/learn/learning.module.css";

export function InspectVsReplace() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>点検は「確かめる」、交換は「替える」</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="点検で状態を確かめ、基準と照らして判断し、必要なときに交換する。交換したあとも点検へ戻る流れを示す図。"
      >
        <defs>
          <marker id="maintenance-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#526682" />
          </marker>
        </defs>
        <rect x="20" y="52" width="150" height="82" rx="18" fill="#eaf2fa" />
        <text x="95" y="88" textAnchor="middle">点検</text>
        <text x="95" y="116" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
          見る・測る
        </text>
        <path d="M174 93 H208" stroke="#526682" strokeWidth="3" markerEnd="url(#maintenance-arrow)" />
        <rect x="212" y="52" width="176" height="82" rx="18" fill="#e4f2f2" />
        <text x="300" y="88" textAnchor="middle">判断</text>
        <text x="300" y="116" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
          取扱説明書の基準と照らす
        </text>
        <path d="M392 93 H426" stroke="#526682" strokeWidth="3" markerEnd="url(#maintenance-arrow)" />
        <rect x="430" y="52" width="150" height="82" rx="18" fill="#fff0ce" />
        <text x="505" y="88" textAnchor="middle">交換</text>
        <text x="505" y="116" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
          必要なときだけ
        </text>
        <path d="M505 138 V176 H95 V142" fill="none" stroke="#526682" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#maintenance-arrow)" />
        <text x="300" y="200" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
          替えたあとも、次の点検へ戻る
        </text>
        <text x="300" y="234" textAnchor="middle" className={styles.svgSmall}>
          「交換したから、しばらく見なくていい」にはならない
        </text>
      </svg>
      <p className={styles.note}>
        考え方の順番を示す図です。点検・整備の項目と時期は、対象車の取扱説明書とメンテナンスノートに従います。
      </p>
    </figure>
  );
}

export function OilLabel() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>「0W-20」は、二つの数字でできている</figcaption>
      <svg
        viewBox="0 0 600 280"
        role="img"
        aria-label="0W-20の表示は、Wの付く数字が低温側の流れやすさ、うしろの数字が高温側の粘りを表す。品質規格の欄は別に読むことを示す図。"
      >
        <rect x="30" y="24" width="540" height="72" rx="16" fill="#eaf2fa" />
        <text x="60" y="70">SAE</text>
        <text x="180" y="70" fill="#1f5f8b" fontWeight="700">0W</text>
        <text x="252" y="70" fill="#5e6f82">-</text>
        <text x="288" y="70" fill="#167d88" fontWeight="700">20</text>
        <text x="420" y="70" className={styles.svgSmall} fill="#5e6f82">
          別の欄に品質規格
        </text>
        <path d="M196 102 L150 140" stroke="#1f5f8b" strokeWidth="2" />
        <text x="30" y="166" className={styles.svgSmall} fill="#1f5f8b">
          低温側：冷えているときの流れやすさ
        </text>
        <text x="30" y="190" className={styles.svgSmall} fill="#5e6f82">
          Wは winter（冬）の頭文字
        </text>
        <path d="M300 102 L336 140" stroke="#167d88" strokeWidth="2" />
        <text x="570" y="166" textAnchor="end" className={styles.svgSmall} fill="#167d88">
          高温側：熱くなったときの粘り
        </text>
        <text x="570" y="190" textAnchor="end" className={styles.svgSmall} fill="#5e6f82">
          数字が大きいほど、かたい側
        </text>
        <rect x="30" y="210" width="540" height="52" rx="14" fill="#fff0ce" />
        <text x="300" y="242" textAnchor="middle" className={styles.svgSmall}>
          粘度が同じでも、品質規格や指定は別の欄。対象車の指定と合わせて読む。
        </text>
      </svg>
      <p className={styles.note}>
        表示の読み分けを示す図です。指定される粘度と規格は車種・年式・エンジンで異なるため、取扱説明書の指定を確認してください。
      </p>
    </figure>
  );
}

export function IntervalConditions() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>距離と期間は、先に来たほうで数える</figcaption>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="交換の目安は距離と期間の両方にあり、先に達したほうで判断する。短距離のくり返しなど使用条件で早まる場合があることを示す図。"
      >
        <text x="30" y="56" className={styles.svgSmall}>距離</text>
        <path d="M100 48 H560" stroke="#c8d3de" strokeWidth="10" strokeLinecap="round" />
        <path d="M100 48 H360" stroke="#1f5f8b" strokeWidth="10" strokeLinecap="round" />
        <circle cx="360" cy="48" r="10" fill="#1f5f8b" />
        <text x="360" y="26" textAnchor="middle" className={styles.svgSmall} fill="#1f5f8b">
          目安に到達
        </text>
        <text x="30" y="124" className={styles.svgSmall}>期間</text>
        <path d="M100 116 H560" stroke="#c8d3de" strokeWidth="10" strokeLinecap="round" />
        <path d="M100 116 H240" stroke="#167d88" strokeWidth="10" strokeLinecap="round" />
        <circle cx="240" cy="116" r="10" fill="#167d88" />
        <text x="240" y="150" textAnchor="middle" className={styles.svgSmall} fill="#167d88">
          まだ途中
        </text>
        <rect x="100" y="176" width="460" height="46" rx="14" fill="#fff0ce" />
        <text x="330" y="205" textAnchor="middle" className={styles.svgSmall}>
          どちらか早いほうで交換する。片方だけを見ない。
        </text>
        <text x="300" y="246" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          短い距離のくり返しや悪路では、目安より早める指定がある
        </text>
      </svg>
      <p className={styles.note}>
        考え方を示す図で、具体的な数値は入れていません。距離・期間・使用条件の指定は、対象車の取扱説明書で確認してください。
      </p>
    </figure>
  );
}
