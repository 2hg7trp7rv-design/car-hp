import styles from "@/app/learn/learning.module.css";

export function SoundRms() {
  const wave = Array.from(
    { length: 181 },
    (_, index) => `${40 + index * 2.8},${125 - 65 * Math.sin((index * Math.PI) / 30)}`,
  ).join(" ");
  return (
    <figure className={styles.diagram}>
      <figcaption>波の高さと、RMSは違う</figcaption>
      <svg
        viewBox="0 0 600 285"
        role="img"
        aria-label="正弦波の説明用模式図。縦軸は相対音圧、横軸は時間。瞬時値は正負に変化するが、二乗してから平均するRMSは正の値になる。"
      >
        <text x="25" y="27">音圧（相対値）</text>
        <path d="M40 48V210M40 125H570" fill="none" stroke="#60758b" />
        <polyline points={wave} fill="none" stroke="#278b9a" strokeWidth="3" />
        <path d="M40 79H550" stroke="#e05b70" strokeWidth="2" strokeDasharray="6 5" />
        <text x="550" y="70" textAnchor="end" className={styles.svgSmall}>
          RMS（正弦波の振幅 ÷ √2）
        </text>
        <text x="565" y="147" textAnchor="end" className={styles.svgSmall}>
          時間 →
        </text>
        <text x="22" y="130" textAnchor="middle" className={styles.svgSmall}>
          0
        </text>
        <text x="300" y="240" textAnchor="middle" className={styles.svgSmall}>
          二乗する → 平均する → 平方根を取る
        </text>
      </svg>
      <p className={styles.note}>
        説明用の正弦波。実際の排気音の実測ではありません。正負に振れる音圧を、そのまま足して平均する方法とは異なります。
      </p>
    </figure>
  );
}
