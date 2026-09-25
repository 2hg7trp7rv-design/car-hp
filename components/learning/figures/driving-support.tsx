import styles from "@/app/learn/learning.module.css";

export function SensingChain() {
  // note は枠幅（172）に収まる長さで書く。切り詰めると述語が落ちて意味が通らない。
  const stages = [
    { label: "検知", note: "情報を集める", fill: "#eaf2fa" },
    { label: "判断", note: "支援するかを決める", fill: "#e4f2f2" },
    { label: "支援", note: "ブレーキなどで助ける", fill: "#fff0ce" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>集める、決める、助ける</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="運転支援は、検知・判断・支援の三段で働く。どの段でも条件から外れれば働かないことがあることを示す図。"
      >
        <defs>
          <marker id="sensing-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#526682" />
          </marker>
        </defs>
        {stages.map((stage, index) => {
          const x = 14 + index * 196;
          return (
            <g key={stage.label}>
              <rect x={x} y="46" width="172" height="92" rx="18" fill={stage.fill} />
              <text x={x + 86} y="82" textAnchor="middle">
                {stage.label}
              </text>
              <text x={x + 86} y="112" textAnchor="middle" className={styles.svgSmall} fill="#5e6f82">
                {stage.note}
              </text>
              {index < stages.length - 1 && (
                <path d={`M${x + 176} 92 H${x + 192}`} stroke="#526682" strokeWidth="3" markerEnd="url(#sensing-arrow)" />
              )}
              <path d={`M${x + 86} 142 V168`} stroke="#e0506a" strokeWidth="2" strokeDasharray="6 5" />
              <text x={x + 86} y="190" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
                条件から外れると
              </text>
              <text x={x + 86} y="212" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
                ここで止まる
              </text>
            </g>
          );
        })}
        <text x="300" y="240" textAnchor="middle" className={styles.svgSmall}>
          運転の主役は運転者。支援が働かない場面がある前提で使う。
        </text>
      </svg>
      <p className={styles.note}>
        働きを分けて見るための図です。搭載するセンサーや機能の名前、作動条件は車種・グレードで異なります。
      </p>
    </figure>
  );
}

export function CameraAndRadar() {
  const columns = [
    {
      x: 18,
      title: "カメラ",
      fill: "#eaf2fa",
      good: ["形や色を見分ける", "車線や標識を読む"],
      hard: ["逆光・夜・悪天", "汚れやくもり"],
    },
    {
      x: 306,
      title: "レーダー",
      fill: "#e4f2f2",
      good: ["距離をつかむ", "近づく速さをつかむ"],
      hard: ["形の見分け", "取り付け面の汚れ・変形"],
    },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>得意なことが、違う</figcaption>
      <svg
        viewBox="0 0 600 290"
        role="img"
        aria-label="カメラは形や車線を見分けることが得意で逆光や汚れに弱く、レーダーは距離や近づく速さをつかむことが得意で形の見分けが苦手であることを比べた図。"
      >
        {columns.map((column) => (
          <g key={column.title} transform={`translate(${column.x} 0)`}>
            <rect x="0" y="24" width="276" height="224" rx="18" fill={column.fill} />
            <text x="138" y="62" textAnchor="middle">
              {column.title}
            </text>
            <text x="24" y="104" className={styles.svgSmall} fill="#167d88">
              得意
            </text>
            {column.good.map((line, index) => (
              <text key={line} x="70" y={104 + index * 26} className={styles.svgSmall}>
                {line}
              </text>
            ))}
            <text x="24" y="176" className={styles.svgSmall} fill="#e0506a">
              苦手
            </text>
            {column.hard.map((line, index) => (
              <text key={line} x="70" y={176 + index * 26} className={styles.svgSmall}>
                {line}
              </text>
            ))}
          </g>
        ))}
        <text x="300" y="278" textAnchor="middle" className={styles.svgSmall}>
          組み合わせる車種もあるが、片方が全部を代われるわけではない
        </text>
      </svg>
      <p className={styles.note}>
        代表的な傾向の整理です。搭載するセンサーの種類・数・作動条件は車種で異なるため、対象車の取扱説明書で確認します。
      </p>
    </figure>
  );
}

