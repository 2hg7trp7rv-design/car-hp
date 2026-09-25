import styles from "@/app/learn/learning.module.css";

export function TorqueLever() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>同じ力でも、長いほうが回そうとする作用は大きい</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="同じ30ニュートンの力でも、軸から0.2メートルの位置では6ニュートンメートル、0.4メートルの位置では12ニュートンメートルのトルクになる図。"
      >
        <defs>
          <marker id="torque-lever-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0 0 L9 4.5 L0 9" fill="#e0506a" />
          </marker>
        </defs>
        <g>
          <rect x="70" y="62" width="80" height="16" rx="8" fill="#37608c" />
          <circle cx="70" cy="70" r="22" fill="#eaf2fa" stroke="#37608c" strokeWidth="4" />
          <path d="M150 24 V54" stroke="#e0506a" strokeWidth="4" markerEnd="url(#torque-lever-arrow)" />
          <text x="164" y="36" className={styles.svgSmall}>力 30 N</text>
          <path d="M70 100 H150 M70 94 V106 M150 94 V106" stroke="#526682" strokeWidth="2" />
          <text x="110" y="126" textAnchor="middle" className={styles.svgSmall}>0.2 m</text>
          <rect x="300" y="48" width="230" height="44" rx="14" fill="#eaf2fa" />
          <text x="415" y="78" textAnchor="middle">トルク 6 N・m</text>
        </g>
        <g>
          <rect x="70" y="192" width="160" height="16" rx="8" fill="#37608c" />
          <circle cx="70" cy="200" r="22" fill="#eaf2fa" stroke="#37608c" strokeWidth="4" />
          <path d="M230 154 V184" stroke="#e0506a" strokeWidth="4" markerEnd="url(#torque-lever-arrow)" />
          <text x="244" y="166" className={styles.svgSmall}>力 30 N（同じ）</text>
          <path d="M70 230 H230 M70 224 V236 M230 224 V236" stroke="#526682" strokeWidth="2" />
          <text x="150" y="256" textAnchor="middle" className={styles.svgSmall}>0.4 m（2倍）</text>
          <rect x="300" y="178" width="230" height="44" rx="14" fill="#fff0ce" />
          <text x="415" y="208" textAnchor="middle">トルク 12 N・m</text>
        </g>
        <text x="300" y="288" textAnchor="middle">力（N） × 軸からの距離（m） ＝ トルク（N・m）</text>
      </svg>
      <p className={styles.note}>
        取っ手に直角の力をかけた場合の模式図です。エンジン内部の構造を表した図ではありません。
      </p>
    </figure>
  );
}
