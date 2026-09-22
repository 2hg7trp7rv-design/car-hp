import styles from "@/app/learn/learning.module.css";

const wave = (damping: number, amplitude = 52) =>
  Array.from({ length: 121 }, (_, index) => {
    const t = index / 20;
    const y = amplitude * Math.exp(-damping * t) * Math.cos(t * 2.2);
    return `${(80 + index * 4).toFixed(1)},${(0 - y).toFixed(1)}`;
  }).join(" ");

export function SpringAndDamper() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>段差のあと、揺れはどう収まる</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="ばねだけでは段差のあとの上下動が長く続き、ダンパーが組み合わさると数回で収まることを示す模式図。"
      >
        <g transform="translate(0 84)">
          <path d="M70 0 H560" stroke="#c8d3de" strokeWidth="2" strokeDasharray="6 6" />
          <polyline points={wave(0.05)} fill="none" stroke="#e0506a" strokeWidth="3.5" strokeLinejoin="round" />
          <text x="20" y="6" className={styles.svgSmall}>ばねだけ</text>
        </g>
        <g transform="translate(0 226)">
          <path d="M70 0 H560" stroke="#c8d3de" strokeWidth="2" strokeDasharray="6 6" />
          <polyline points={wave(0.62)} fill="none" stroke="#278b9a" strokeWidth="3.5" strokeLinejoin="round" />
          <text x="20" y="6" className={styles.svgSmall}>ばね＋ダンパー</text>
        </g>
        <text x="80" y="26" className={styles.svgSmall}>段差</text>
        <path d="M74 32 V52" stroke="#526682" strokeWidth="2" />
        <text x="560" y="290" textAnchor="end" className={styles.svgSmall}>時間 →</text>
        <text x="300" y="166" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          ばねは戻す力を出すが、止める仕事はしない
        </text>
      </svg>
      <p className={styles.note}>
        上下動の収まり方を比べる模式図です。振れ幅や回数は、車両・速度・段差の大きさで変わります。
      </p>
    </figure>
  );
}

export function HardRideCauses() {
  const causes = [
    { label: "ばね", note: "縮みにくさ" },
    { label: "ダンパー", note: "動きの止めやすさ" },
    { label: "タイヤ", note: "空気圧・扁平率" },
    { label: "ブッシュなど", note: "ゴム部品の硬さ" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>「硬い」と感じる入口は、ひとつではない</figcaption>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="段差からの入力が、ばね・ダンパー・タイヤ・ゴム部品のどれを通っても硬いという感想になりうることを示す図。"
      >
        <defs>
          <marker id="hard-ride-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#526682" />
          </marker>
        </defs>
        <rect x="8" y="98" width="104" height="60" rx="14" fill="#eaf2fa" />
        <text x="60" y="134" textAnchor="middle" className={styles.svgSmall}>段差・路面</text>
        {causes.map((cause, index) => {
          const y = 24 + index * 58;
          return (
            <g key={cause.label}>
              <path d={`M116 128 C160 128, 170 ${y + 22}, 214 ${y + 22}`} fill="none" stroke="#526682" strokeWidth="2" markerEnd="url(#hard-ride-arrow)" />
              <rect x="222" y={y} width="180" height="44" rx="12" fill="#fff0ce" />
              <text x="252" y={y + 28} className={styles.svgSmall}>{cause.label}</text>
              <text x="394" y={y + 28} textAnchor="end" className={styles.svgSmall} fill="#5e6f82">
                {cause.note}
              </text>
              <path d={`M406 ${y + 22} C450 ${y + 22}, 460 128, 496 128`} fill="none" stroke="#526682" strokeWidth="2" markerEnd="url(#hard-ride-arrow)" />
            </g>
          );
        })}
        <rect x="504" y="98" width="88" height="60" rx="14" fill="#ffe8ed" />
        <text x="548" y="134" textAnchor="middle" className={styles.svgSmall}>「硬い」</text>
        <text x="300" y="250" textAnchor="middle" className={styles.svgSmall}>
          同じ感想でも、入口が違えば直し方も変わる
        </text>
      </svg>
      <p className={styles.note}>
        感想を確認できる言葉に分けるための図です。どれが効いているかは、条件をそろえた確認で切り分けます。
      </p>
    </figure>
  );
}

export function DamperVelocity() {
  const left = 90;
  const right = 552;
  const bottom = 236;
  const top = 44;
  const vMax = 1.2;
  const fMax = 2400;
  const px = (v: number) => left + (v / vMax) * (right - left);
  const py = (f: number) => bottom - (f / fMax) * (bottom - top);
  const curve = Array.from({ length: 41 }, (_, index) => {
    const v = (index / 40) * vMax;
    const force = v < 0.15 ? v * 6000 : 900 + (v - 0.15) * 1300;
    return `${px(v).toFixed(1)},${py(force).toFixed(1)}`;
  }).join(" ");
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできるグラフ">
      <figcaption>横軸は、車の速さではない</figcaption>
      <svg
        viewBox="0 0 600 310"
        role="img"
        aria-label="ダンパーの減衰力特性の模式図。横軸はダンパーが伸び縮みする速さで、0.1メートル毎秒あたりまでの低速域と、その先の高速域で傾きが変わる。"
      >
        <path d={`M${left} ${top} V${bottom} H${right}`} fill="none" stroke="#526682" strokeWidth="2" />
        <text x="18" y="32" className={styles.svgSmall}>減衰力（N）</text>
        <rect x={left} y={top} width={px(0.15) - left} height={bottom - top} fill="#eef5fb" />
        <polyline points={curve} fill="none" stroke="#278b9a" strokeWidth="4" strokeLinejoin="round" />
        {[0, 0.3, 0.6, 0.9, 1.2].map((v) => (
          <text key={v} x={px(v)} y={bottom + 26} textAnchor="middle" className={styles.svgSmall}>
            {v.toFixed(1)}
          </text>
        ))}
        <text x={right} y="302" textAnchor="end" className={styles.svgSmall}>
          ピストン速度（m/s）
        </text>
        <text x={px(0.075)} y={top + 24} textAnchor="middle" className={styles.svgSmall} fill="#1f5f8b">
          低速域
        </text>
        <text x={px(0.7)} y={top + 24} textAnchor="middle" className={styles.svgSmall} fill="#1f5f8b">
          高速域
        </text>
        <text x={px(0.16)} y={py(1900)} className={styles.svgSmall} fill="#5e6f82">
          ゆっくりの動き＝うねり・ロール
        </text>
        <text x={px(0.16)} y={py(1600)} className={styles.svgSmall} fill="#5e6f82">
          速い動き＝段差の鋭い入力
        </text>
      </svg>
      <p className={styles.note}>
        目盛りは説明用の模式図です。横軸はダンパーが伸び縮みする速さで、走行速度ではありません。区切り方や単位は資料ごとに確認します。
      </p>
    </figure>
  );
}
