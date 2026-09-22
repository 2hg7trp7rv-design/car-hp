import styles from "@/app/learn/learning.module.css";

export function BrakeToRoad() {
  const steps = [
    { label: "ペダル", note: "踏む力" },
    { label: "油圧", note: "力を伝える" },
    { label: "パッドと\nローター", note: "こすって減速" },
    { label: "タイヤ", note: "路面へ伝える" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>止まる力は、最後は路面へ渡される</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="ペダルの力が油圧、パッドとローター、タイヤの順に伝わり、最後はタイヤと路面のあいだで受け止められることを示す図。"
      >
        <defs>
          <marker id="brake-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#526682" />
          </marker>
        </defs>
        {steps.map((step, index) => {
          const x = 10 + index * 150;
          const [first, second] = step.label.split("\n");
          return (
            <g key={step.label}>
              <rect x={x} y="50" width="124" height="78" rx="16" fill={index === 3 ? "#fff0ce" : "#eaf2fa"} />
              <text x={x + 62} y={second ? 80 : 88} textAnchor="middle" className={styles.svgSmall}>
                {first}
              </text>
              {second && (
                <text x={x + 62} y="104" textAnchor="middle" className={styles.svgSmall}>
                  {second}
                </text>
              )}
              <text x={x + 62} y={second ? 122 : 110} textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
                {step.note}
              </text>
              {index < steps.length - 1 && (
                <path d={`M${x + 128} 89 H${x + 146}`} stroke="#526682" strokeWidth="3" markerEnd="url(#brake-arrow)" />
              )}
            </g>
          );
        })}
        <path d="M10 176 H590" stroke="#45536a" strokeWidth="6" />
        <path d="M522 132 V168" stroke="#e0506a" strokeWidth="3" markerEnd="url(#brake-arrow)" />
        <text x="300" y="206" textAnchor="middle" className={styles.svgSmall}>
          路面と接しているのは、タイヤの小さな面だけ
        </text>
        <text x="300" y="232" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          ブレーキを強くしても、そこで伝えられる以上の力は路面に渡せない
        </text>
      </svg>
      <p className={styles.note}>
        力の伝わる順番をつかむための模式図です。部品の構成や配置は車両で異なり、制御装置は省略しています。
      </p>
    </figure>
  );
}

export function TirePressure() {
  const panels = [
    { x: 8, title: "低すぎる", shape: "M40 118 Q100 150 160 118", patch: [52, 148], note: "両肩が減りやすい" },
    { x: 205, title: "指定どおり", shape: "M40 118 Q100 128 160 118", patch: [70, 130], note: "接地が安定しやすい" },
    { x: 402, title: "高すぎる", shape: "M40 118 Q100 104 160 118", patch: [88, 112], note: "中央が減りやすい" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>空気圧で、接地の仕方が変わる</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="空気圧が低すぎると両肩、高すぎると中央が接地しやすくなり、指定どおりでは接地が安定しやすいことを示す断面の模式図。"
      >
        {panels.map((panel) => (
          <g key={panel.title} transform={`translate(${panel.x} 0)`}>
            <rect x="10" y="24" width="180" height="140" rx="14" fill="#f5f8fb" />
            <text x="100" y="52" textAnchor="middle" className={styles.svgSmall}>
              {panel.title}
            </text>
            <path d="M40 68 H160 V118 H40 Z" fill="#e8eef5" stroke="#45536a" strokeWidth="3" />
            <path d={panel.shape} fill="none" stroke="#e0506a" strokeWidth="5" />
            <path d={`M${panel.patch[0]} 150 H${panel.patch[1]}`} stroke="#e0506a" strokeWidth="7" />
            <path d="M20 158 H180" stroke="#45536a" strokeWidth="4" />
            <text x="100" y="192" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
              {panel.note}
            </text>
          </g>
        ))}
        <text x="300" y="232" textAnchor="middle" className={styles.svgSmall}>
          指定の空気圧は、運転席ドアの開口部のラベルや取扱説明書にある
        </text>
      </svg>
      <p className={styles.note}>
        接地の違いを誇張した模式図です。実際の接地形状は荷重・速度・タイヤの構造で変わり、減り方だけで原因は決められません。
      </p>
    </figure>
  );
}

export function WearPatterns() {
  const patterns = [
    { title: "両肩が減る", marks: [[46, 1], [154, 1]] },
    { title: "中央が減る", marks: [[100, 1]] },
    { title: "片側だけ減る", marks: [[46, 1]] },
    { title: "まだらに減る", marks: [[56, 0.7], [100, 0.7], [144, 0.7]] },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>減り方の模様は、原因そのものではない</figcaption>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="両肩、中央、片側、まだらという四つの減り方の断面図。模様は手掛かりだが、原因は使用条件と合わせて読む必要があることを示す。"
      >
        {patterns.map((pattern, index) => (
          <g key={pattern.title} transform={`translate(${6 + index * 148} 0)`}>
            <rect x="8" y="26" width="134" height="120" rx="12" fill="#f5f8fb" />
            <path d="M28 60 H122 V110 H28 Z" fill="#e8eef5" stroke="#45536a" strokeWidth="3" />
            {pattern.marks.map(([x, weight]) => (
              <path
                key={x}
                d={`M${x * 0.74 + 8} 60 V${60 + 50 * weight}`}
                stroke="#e0506a"
                strokeWidth="10"
                opacity="0.55"
              />
            ))}
            <text x="75" y="172" textAnchor="middle" className={styles.svgSmall}>
              {pattern.title}
            </text>
          </g>
        ))}
        <text x="300" y="216" textAnchor="middle" className={styles.svgSmall}>
          空気圧、荷重、アライメント、走り方、走行距離。どれも同じ模様を作りうる。
        </text>
        <text x="300" y="242" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          写真1枚で原因を決めず、条件と合わせて読む
        </text>
      </svg>
      <p className={styles.note}>
        赤く塗った部分が減りやすい位置を表す模式図です。実際の判断は、使用条件の確認と、販売店・整備での点検を合わせて行います。
      </p>
    </figure>
  );
}
