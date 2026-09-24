import { useId } from "react";
import type { LearningBlock } from "@/lib/learning";
import styles from "@/app/learn/learning.module.css";
import { FoundationDiagram } from "./FoundationDiagram";
export function LearningDiagram({
  kind,
}: {
  kind: Extract<LearningBlock, { type: "diagram" }>["kind"];
}) {
  const id = useId().replace(/:/g, "");
  if (kind === "four-strokes" || kind === "displacement" || kind === "two-air-paths" || kind === "exhaust-parts" || kind === "suspension-parts" || kind === "tire-markings" || kind === "disc-brake" || kind === "battery-roles") return <FoundationDiagram kind={kind}/>;
  if (kind === "sound-rms") {
    const wave = Array.from({ length: 181 }, (_, i) => `${40+i*2.8},${125-65*Math.sin(i*Math.PI/30)}`).join(" ");
    return <figure className={styles.diagram}><figcaption>波の高さと、RMSは違う</figcaption><svg viewBox="0 0 600 285" role="img" aria-label="正弦波の説明用模式図。縦軸は相対音圧、横軸は時間。瞬時値は正負に変化するが、二乗してから平均するRMSは正の値になる。">
    <text x="25" y="27">音圧（相対値）</text><path d="M40 48V210M40 125H570" fill="none" stroke="#60758b"/>
    <polyline points={wave} fill="none" stroke="#278b9a" strokeWidth="3"/>
    <path d="M40 79H550" stroke="#e05b70" strokeWidth="2" strokeDasharray="6 5"/>
    <text x="550" y="70" textAnchor="end" className={styles.svgSmall}>RMS（正弦波の振幅 ÷ √2）</text>
    <text x="565" y="147" textAnchor="end" className={styles.svgSmall}>時間 →</text>
    <text x="22" y="130" textAnchor="middle" className={styles.svgSmall}>0</text>
    <text x="300" y="240" textAnchor="middle" className={styles.svgSmall}>二乗する → 平均する → 平方根を取る</text></svg><p className={styles.note}>説明用の正弦波。実際の排気音の実測ではありません。正負に振れる音圧を、そのまま足して平均する方法とは異なります。</p></figure>;
  }
  if (kind === "installation-types")
    return (
      <figure className={styles.figure}>
        <figcaption>交換する場所と、囲いの違い</figcaption>
        <div className={styles.installations}>
          <div>
            <svg
              viewBox="0 0 220 140"
              role="img"
              aria-label="純正の箱の中の平らなフィルターを交換"
            >
              <rect
                x="24"
                y="20"
                width="172"
                height="100"
                rx="16"
                fill="#eaf2fa"
                stroke="#37608c"
                strokeWidth="3"
              />
              <path
                d="M48 48 H172 V93 H48 Z M60 48 V93 M76 48 V93 M92 48 V93 M108 48 V93 M124 48 V93 M140 48 V93 M156 48 V93"
                fill="#fff0ce"
                stroke="#9a6514"
                strokeWidth="3"
              />
            </svg>
            <strong>純正交換型</strong>
            <p>元の箱を使い、フィルターを替える。</p>
          </div>
          <div>
            <svg
              viewBox="0 0 220 140"
              role="img"
              aria-label="フィルターを囲う専用の箱ごと交換"
            >
              <path
                d="M10 68 H40 M180 68 H210"
                stroke="#37608c"
                strokeWidth="18"
              />
              <rect
                x="34"
                y="22"
                width="152"
                height="96"
                rx="22"
                fill="#37608c"
              />
              <path
                d="M63 51 H157 V89 H63 Z M78 51 V89 M94 51 V89 M110 51 V89 M126 51 V89 M142 51 V89"
                fill="#fff0ce"
                stroke="#9a6514"
                strokeWidth="3"
              />
            </svg>
            <strong>密閉型のキット</strong>
            <p>専用の囲いも含めて交換。図は中身が見える断面。</p>
          </div>
          <div>
            <svg
              viewBox="0 0 220 140"
              role="img"
              aria-label="周囲を箱で囲わない円すい形フィルターの例"
            >
              <path d="M156 70 H210" stroke="#37608c" strokeWidth="18" />
              <path
                d="M45 25 L158 50 V90 L45 115 Z M45 40 L158 56 M45 55 L158 63 M45 70 H158 M45 85 L158 77 M45 100 L158 84"
                fill="#fff0ce"
                stroke="#9a6514"
                strokeWidth="3"
              />
            </svg>
            <strong>露出型のキット</strong>
            <p>フィルターを箱で囲わない。形は円すい・キノコ状など。</p>
          </div>
        </div>
        <p className={styles.note}>
          代表的な装着形態の模式図。実際の形状や部品構成は製品ごとに異なり、この図は性能の優劣を示しません。
        </p>
      </figure>
    );
  if (kind === "air-and-fuel")
    return (
      <figure
        className={styles.diagram}
        tabIndex={0}
        role="region"
        aria-label="横にスクロールできる概念図"
      >
        <figcaption>空気と燃料は、別の入口から</figcaption>
        <svg
          viewBox="0 0 600 270"
          role="img"
          aria-labelledby={`${id}-air-fuel-title ${id}-air-fuel-desc`}
        >
          <title id={`${id}-air-fuel-title`}>
            外の空気はエアクリーナーを経由し、燃料は別の経路でエンジンへ入る
          </title>
          <desc id={`${id}-air-fuel-desc`}>
            エアクリーナーで異物を減らした空気と、燃料を使ってエンジンが力を生む概念図。
          </desc>
          <defs>
            <marker
              id={`${id}-air-arrow`}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8" fill="#37608c" />
            </marker>
          </defs>
          <rect x="16" y="42" width="136" height="84" rx="18" fill="#eaf2fa" />
          <text x="84" y="90" textAnchor="middle">
            外の空気
          </text>
          <path
            d="M158 84 H205"
            stroke="#37608c"
            strokeWidth="3"
            markerEnd={`url(#${id}-air-arrow)`}
          />
          <rect x="218" y="42" width="166" height="84" rx="18" fill="#fff0ce" />
          <text x="301" y="78" textAnchor="middle">
            エアクリーナー
          </text>
          <text x="301" y="108" textAnchor="middle" className={styles.svgSmall}>
            異物を減らす
          </text>
          <path
            d="M390 84 H435"
            stroke="#37608c"
            strokeWidth="3"
            markerEnd={`url(#${id}-air-arrow)`}
          />
          <rect x="448" y="42" width="136" height="84" rx="18" fill="#eaf2fa" />
          <text x="516" y="90" textAnchor="middle">
            エンジン
          </text>
          <rect
            x="218"
            y="177"
            width="166"
            height="65"
            rx="18"
            fill="#ffe8ed"
          />
          <text x="301" y="218" textAnchor="middle">
            燃料
          </text>
          <path
            d="M390 210 H516 V135"
            fill="none"
            stroke="#37608c"
            strokeWidth="3"
            markerEnd={`url(#${id}-air-arrow)`}
          />
        </svg>
        <p className={styles.note}>
          役割をつかむための概念図。燃料はエアクリーナーを通りません。実車の配管位置・噴射位置は車種で異なります。
        </p>
      </figure>
    );
  return (
    <figure
      className={styles.diagram}
      tabIndex={0}
      role="region"
      aria-label="横にスクロールできる概念図"
    >
      <figcaption>折りひだで、広いろ材を小さな箱へ</figcaption>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-labelledby={`${id}-pleats-title ${id}-pleats-desc`}
      >
        <title id={`${id}-pleats-title`}>
          ろ材を折り畳むことで、限られた幅に長い材料を収める
        </title>
        <desc id={`${id}-pleats-desc`}>
          平らなろ材と、同じ幅の中に折りひだを繰り返したろ材の断面を比較する概念図。
        </desc>
        <rect x="12" y="35" width="250" height="145" rx="18" fill="#eaf2fa" />
        <rect x="338" y="35" width="250" height="145" rx="18" fill="#fff0ce" />
        <text x="137" y="76" textAnchor="middle">
          平らに置く
        </text>
        <text x="463" y="76" textAnchor="middle">
          折り畳んで入れる
        </text>
        <path d="M32 125 H242" fill="none" stroke="#37608c" strokeWidth="6" />
        <path
          d="M358 145 L378 100 L398 145 L418 100 L438 145 L458 100 L478 145 L498 100 L518 145 L538 100 L558 145 L568 122"
          fill="none"
          stroke="#9a6514"
          strokeWidth="6"
        />
        <text x="300" y="215" textAnchor="middle" className={styles.svgSmall}>
          外形の幅が同じでも、収められるろ材の面積は変わる
        </text>
      </svg>
      <p className={styles.note}>
        断面を単純化した模式図。数値・寸法・集じん性能を比較する実測図ではありません。
      </p>
    </figure>
  );
}
