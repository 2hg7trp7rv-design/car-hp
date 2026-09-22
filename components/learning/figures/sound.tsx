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

export function ExhaustPath() {
  const boxes = [
    { label: "エンジン", note: "排気を送り出す", fill: "#e8eef5" },
    { label: "排気管・触媒", note: "有害な成分を減らす", fill: "#e4f2f2" },
    { label: "消音器", note: "音を抑える", fill: "#fff0ce" },
    { label: "出口", note: "車外へ導く", fill: "#e8eef5" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>排気の道と、それぞれの仕事</figcaption>
      <svg
        viewBox="0 0 600 220"
        role="img"
        aria-label="排気はエンジンから排気管と触媒、消音器を通って出口へ向かう。触媒は有害な成分を減らし、消音器は音を抑えるという別々の仕事をしている図。"
      >
        <defs>
          <marker id="exhaust-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#526682" />
          </marker>
        </defs>
        {boxes.map((box, index) => {
          const x = 8 + index * 150;
          return (
            <g key={box.label}>
              <rect x={x} y="54" width="126" height="78" rx="16" fill={box.fill} />
              <text x={x + 63} y="88" textAnchor="middle" className={styles.svgSmall}>
                {box.label}
              </text>
              <text x={x + 63} y="114" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
                {box.note}
              </text>
              {index < boxes.length - 1 && (
                <path d={`M${x + 130} 93 H${x + 146}`} stroke="#526682" strokeWidth="3" markerEnd="url(#exhaust-arrow)" />
              )}
            </g>
          );
        })}
        <text x="300" y="32" textAnchor="middle" className={styles.svgSmall}>
          排気ガスの流れ →
        </text>
        <text x="300" y="176" textAnchor="middle" className={styles.svgSmall} fill="#167d88">
          浄化は化学反応の仕事、消音は音のエネルギーを減らす仕事。
        </text>
        <text x="300" y="202" textAnchor="middle" className={styles.svgSmall} fill="#167d88">
          静かになっても、排気がきれいになるわけではない。
        </text>
      </svg>
      <p className={styles.note}>
        役割を分けて見るための模式図です。部品の数・配置・一体化のしかたは車両で異なり、ターボなどは省略しています。
      </p>
    </figure>
  );
}

export function SilencerStructures() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる断面図">
      <figcaption>まっすぐな筒でも、空っぽではない</figcaption>
      <svg
        viewBox="0 0 600 320"
        role="img"
        aria-label="ストレート構造は穴を開けた管の周りに吸音材を置き、リアクティブ構造は仕切られた部屋と管をつないで音を抑える。二つの断面を比べた模式図。"
      >
        <text x="20" y="30" className={styles.svgSmall}>ストレート構造の例</text>
        <rect x="20" y="44" width="560" height="92" rx="26" fill="#f2f6fa" stroke="#37608c" strokeWidth="3" />
        <rect x="20" y="58" width="560" height="64" fill="#fff5dd" />
        {Array.from({ length: 26 }, (_, index) => (
          <path key={index} d={`M${36 + index * 21} 58 L${26 + index * 21} 122`} stroke="#e4c98a" strokeWidth="3" />
        ))}
        <path d="M0 76 H600 M0 104 H600" stroke="#37608c" strokeWidth="5" />
        {Array.from({ length: 18 }, (_, index) => (
          <circle key={index} cx={46 + index * 30} cy={90} r="4" fill="#37608c" />
        ))}
        <text x="300" y="96" textAnchor="middle" className={styles.svgSmall} fill="#37608c">
          穴あき管
        </text>
        <text x="300" y="158" textAnchor="middle" className={styles.svgSmall}>
          通路はまっすぐでも、穴から入った音が周りの吸音材で弱められる
        </text>
        <text x="20" y="196" className={styles.svgSmall}>リアクティブ構造の例</text>
        <rect x="20" y="210" width="560" height="92" rx="26" fill="#f2f6fa" stroke="#37608c" strokeWidth="3" />
        <path d="M212 210 V302 M392 210 V302" stroke="#37608c" strokeWidth="3" />
        <path d="M0 242 H262 M162 270 H442 M342 242 H600" stroke="#37608c" strokeWidth="5" fill="none" />
        <text x="116" y="292" textAnchor="middle" className={styles.svgSmall}>部屋1</text>
        <text x="300" y="232" textAnchor="middle" className={styles.svgSmall}>部屋2</text>
        <text x="486" y="292" textAnchor="middle" className={styles.svgSmall}>部屋3</text>
      </svg>
      <p className={styles.note}>
        メーカーが示す構造例を単純化した断面です。寸法や材料で働き方が変わるため、構造名だけで静かさや出力の順位は決まりません。
      </p>
    </figure>
  );
}

export function ProximityMeasurement() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>近接排気騒音は、決められた位置で測る</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="排気管の開口部から0.5メートル、排気の方向に対して45度の位置にマイクを置いて測る。回転数の決め方は対象の規程で異なることを示す図。"
      >
        <path d="M60 96 H260 V200 H60 Z" fill="#e8eef5" />
        <path d="M60 96 H180 L230 60 H120 Z" fill="#eef3f8" />
        <circle cx="120" cy="206" r="26" fill="#45536a" />
        <circle cx="120" cy="206" r="10" fill="#c9d3de" />
        <rect x="258" y="150" width="70" height="22" rx="10" fill="#7a8ba0" />
        <text x="150" y="150" textAnchor="middle" className={styles.svgSmall}>車両（後ろ）</text>
        <path d="M330 161 H560" stroke="#526682" strokeWidth="2" strokeDasharray="8 6" />
        <text x="470" y="150" textAnchor="middle" className={styles.svgSmall} fill="#526682">
          排気の方向（軸線）
        </text>
        <path d="M330 161 L470 62" stroke="#e0506a" strokeWidth="3" />
        <path d="M386 161 A56 56 0 0 0 362 118" fill="none" stroke="#e0506a" strokeWidth="2" />
        <text x="398" y="130" className={styles.svgSmall} fill="#e0506a">
          45°
        </text>
        <text x="392" y="88" className={styles.svgSmall} fill="#e0506a">
          0.5 m
        </text>
        <circle cx="482" cy="54" r="16" fill="#e0506a" />
        <path d="M482 70 V104 M466 104 H498" stroke="#45536a" strokeWidth="4" />
        <text x="516" y="60" className={styles.svgSmall}>マイク</text>
        <text x="300" y="248" textAnchor="middle" className={styles.svgSmall}>
          高さは開口部に合わせる。暗騒音や反射も条件のうち。
        </text>
        <text x="300" y="276" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          回転数の決め方と測り方は、絶対値規制車と相対値規制車で別の規程になる。
        </text>
      </svg>
      <p className={styles.note}>
        位置関係をつかむための模式図です。実際の測定は、対象車へ適用する審査事務規程（別添9または別添10）の手順に従います。
      </p>
    </figure>
  );
}

export function AWeighting() {
  const points: [hz: string, weight: number][] = [
    ["31.5", -39.4],
    ["63", -26.2],
    ["125", -16.1],
    ["250", -8.6],
    ["500", -3.2],
    ["1k", 0],
    ["2k", 1.2],
    ["4k", 1],
    ["8k", -1.1],
  ];
  const left = 78;
  const right = 560;
  const zero = 90;
  const scale = 4.2;
  const px = (index: number) => left + (index * (right - left)) / (points.length - 1);
  const py = (weight: number) => zero - weight * scale;
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできるグラフ">
      <figcaption>A特性は、低い音を大きく差し引く</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="A特性の重み付け。31.5ヘルツでは約マイナス39デシベル、125ヘルツで約マイナス16デシベル、1キロヘルツで0、2キロヘルツ付近でわずかにプラスになる曲線。"
      >
        <path d={`M${left} ${py(4)} V${py(-44)}`} stroke="#526682" strokeWidth="2" />
        <path d={`M${left} ${zero} H${right}`} stroke="#526682" strokeWidth="2" />
        <text x="16" y="30" className={styles.svgSmall}>重み（dB）</text>
        {[0, -10, -20, -30, -40].map((value) => (
          <g key={value}>
            <path d={`M${left} ${py(value)} H${right}`} stroke="#e4ebf1" strokeWidth="1.5" />
            <text x={left - 10} y={py(value) + 6} textAnchor="end" className={styles.svgSmall}>
              {value}
            </text>
          </g>
        ))}
        <polyline
          points={points.map(([, weight], index) => `${px(index).toFixed(1)},${py(weight).toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#278b9a"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {points.map(([hz, weight], index) => (
          <g key={hz}>
            <circle cx={px(index)} cy={py(weight)} r="5" fill="#278b9a" />
            <text x={px(index)} y="268" textAnchor="middle" className={styles.svgSmall}>
              {hz}
            </text>
          </g>
        ))}
        <text x={px(0)} y={py(-39.4) - 16} textAnchor="start" className={styles.svgSmall} fill="#278b9a">
          約 −39 dB
        </text>
        <text x={px(5)} y={py(0) - 16} textAnchor="middle" className={styles.svgSmall} fill="#278b9a">
          1 kHz で 0
        </text>
        <text x={right} y="294" textAnchor="end" className={styles.svgSmall}>
          周波数（Hz）
        </text>
        <text x="90" y="250" className={styles.svgSmall} fill="#5e6f82">
          低い音ほど、差し引かれる量が大きい
        </text>
      </svg>
      <p className={styles.note}>
        A特性の重み付けの代表値です。同じ総合レベルでも、低い音が多い音と高い音が多い音では、A特性を通した値の出方が変わります。
      </p>
    </figure>
  );
}
