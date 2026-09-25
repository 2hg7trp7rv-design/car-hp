import styles from "@/app/learn/learning.module.css";

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

