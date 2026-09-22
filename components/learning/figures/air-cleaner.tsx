import { useId } from "react";
import styles from "@/app/learn/learning.module.css";

export function AirAndFuel() {
  const id = useId().replace(/:/g, "");
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
        <rect x="218" y="177" width="166" height="65" rx="18" fill="#ffe8ed" />
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
}

export function PleatedMedia() {
  const id = useId().replace(/:/g, "");
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

export function InstallationTypes() {
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
            <path d="M10 68 H40 M180 68 H210" stroke="#37608c" strokeWidth="18" />
            <rect x="34" y="22" width="152" height="96" rx="22" fill="#37608c" />
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
}

export function IntakeLayout() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>空気の道と、すき間という近道</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="外の空気が取り入れ口、ダクト、ボックスの中のフィルター、配管を通ってエンジンへ向かう経路と、箱のすき間からフィルターを通らずに入る経路を示す図。"
      >
        <defs>
          <marker id="intake-layout-air" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#37608c" />
          </marker>
          <marker id="intake-layout-leak" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#e0506a" />
          </marker>
        </defs>
        <rect x="8" y="96" width="92" height="64" rx="14" fill="#eaf2fa" />
        <text x="54" y="134" textAnchor="middle" className={styles.svgSmall}>外の空気</text>
        <path d="M104 128 H124" stroke="#37608c" strokeWidth="3" markerEnd="url(#intake-layout-air)" />
        <rect x="128" y="108" width="84" height="40" rx="12" fill="#eaf2fa" />
        <text x="170" y="134" textAnchor="middle" className={styles.svgSmall}>ダクト</text>
        <path d="M216 128 H236" stroke="#37608c" strokeWidth="3" markerEnd="url(#intake-layout-air)" />
        <rect x="240" y="84" width="150" height="88" rx="16" fill="#fff" stroke="#37608c" strokeWidth="3" />
        <path
          d="M268 106 H362 V150 H268 Z M282 106 V150 M296 106 V150 M310 106 V150 M324 106 V150 M338 106 V150 M352 106 V150"
          fill="#fff0ce"
          stroke="#9a6514"
          strokeWidth="3"
        />
        <text x="315" y="196" textAnchor="middle" className={styles.svgSmall}>ボックスとフィルター</text>
        <path d="M394 128 H414" stroke="#37608c" strokeWidth="3" markerEnd="url(#intake-layout-air)" />
        <rect x="418" y="108" width="72" height="40" rx="12" fill="#eaf2fa" />
        <text x="454" y="134" textAnchor="middle" className={styles.svgSmall}>配管</text>
        <path d="M494 128 H514" stroke="#37608c" strokeWidth="3" markerEnd="url(#intake-layout-air)" />
        <rect x="518" y="96" width="74" height="64" rx="14" fill="#eaf2fa" />
        <text x="555" y="134" textAnchor="middle" className={styles.svgSmall}>エンジン</text>
        <path
          d="M252 84 C268 40 360 40 398 108"
          fill="none"
          stroke="#e0506a"
          strokeWidth="3"
          strokeDasharray="9 6"
          markerEnd="url(#intake-layout-leak)"
        />
        <text x="325" y="36" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          シールのすき間を通る空気
        </text>
        <text x="300" y="232" textAnchor="middle" className={styles.svgSmall}>
          赤い道を通った異物は、フィルターに捕まらない
        </text>
      </svg>
      <p className={styles.note}>
        並び順をつかむための概念図です。センサーや弁は省略し、実車の配置・形は車種で異なります。
      </p>
    </figure>
  );
}

export function FilterCapture() {
  const fibers = [
    [40, 60],
    [92, 96],
    [56, 132],
    [116, 44],
    [132, 140],
    [80, 168],
  ];
  const panels = [
    { x: 0, title: "ふるい", body: "すき間より大きい粒は、そのまま通れない。" },
    { x: 200, title: "ぶつかる", body: "流れが曲がっても、粒は勢いで繊維へ当たる。" },
    { x: 400, title: "くっつく", body: "触れた粒が、繊維の表面に留まる。" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>細かい網、ではない捕まえ方</figcaption>
      <svg
        viewBox="0 0 600 270"
        role="img"
        aria-label="フィルターが粒子を捕まえる三つの働き。すき間より大きい粒を通さないふるい、流れが曲がっても勢いで繊維に当たる衝突、触れた粒が表面に留まる付着。"
      >
        {panels.map((panel, index) => (
          <g key={panel.title}>
            <rect x={panel.x + 10} y="20" width="180" height="180" rx="16" fill="#f5f8fb" />
            {fibers.map(([cx, cy]) => (
              <circle key={`${panel.title}-${cx}-${cy}`} cx={panel.x + 10 + cx} cy={cy + 20} r="11" fill="#c7d9ea" />
            ))}
            {index === 0 && (
              <>
                <circle cx={panel.x + 76} cy="96" r="14" fill="#e0506a" />
                <path d={`M${panel.x + 20} 96 H${panel.x + 56}`} stroke="#37608c" strokeWidth="3" />
              </>
            )}
            {index === 1 && (
              <>
                <path
                  d={`M${panel.x + 20} 150 C${panel.x + 70} 150, ${panel.x + 80} 112, ${panel.x + 130} 112`}
                  fill="none"
                  stroke="#37608c"
                  strokeWidth="3"
                />
                <path d={`M${panel.x + 20} 150 H${panel.x + 96}`} fill="none" stroke="#e0506a" strokeWidth="3" strokeDasharray="7 5" />
                <circle cx={panel.x + 102} cy="150" r="9" fill="#e0506a" />
              </>
            )}
            {index === 2 && (
              <>
                <path d={`M${panel.x + 20} 76 H${panel.x + 84}`} stroke="#37608c" strokeWidth="3" />
                <circle cx={panel.x + 92} cy="72" r="7" fill="#e0506a" />
                <circle cx={panel.x + 64} cy="128" r="6" fill="#e0506a" />
              </>
            )}
            <text x={panel.x + 100} y="228" textAnchor="middle">
              {panel.title}
            </text>
            <text x={panel.x + 100} y="256" textAnchor="middle" className={styles.svgSmall}>
              {panel.body.length > 16 ? `${panel.body.slice(0, 16)}…` : panel.body}
            </text>
          </g>
        ))}
      </svg>
      <p className={styles.note}>
        繊維の断面を拡大した模式図です。青い線は空気の流れ、赤い丸は粒子。実際の繊維の太さや並びは製品で異なります。
      </p>
    </figure>
  );
}

export function PassThroughAmount() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>0.9ポイントの差と、10倍の差</figcaption>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="同じ100グラムの粉じんを送ったとき、集じん効率99パーセントでは1グラム、99.9パーセントでは0.1グラムが通過し、通過量は10倍違うことを示す図。"
      >
        <text x="300" y="32" textAnchor="middle" className={styles.svgSmall}>
          同じ試験で、粉じん100 g を送ったとき
        </text>
        <rect x="40" y="56" width="230" height="150" rx="16" fill="#f5f8fb" />
        <rect x="330" y="56" width="230" height="150" rx="16" fill="#f5f8fb" />
        <text x="155" y="92" textAnchor="middle">集じん効率 99％</text>
        <text x="445" y="92" textAnchor="middle">集じん効率 99.9％</text>
        <rect x="70" y="140" width="170" height="40" rx="8" fill="#e0506a" />
        <text x="155" y="168" textAnchor="middle" fill="#fff">
          通過 1 g
        </text>
        <rect x="360" y="140" width="17" height="40" rx="6" fill="#e0506a" />
        <text x="470" y="168" textAnchor="middle" className={styles.svgSmall}>
          通過 0.1 g
        </text>
        <text x="300" y="238" textAnchor="middle" className={styles.svgSmall}>
          捕まえた割合の差は0.9ポイント。通ってしまう量は10倍。
        </text>
      </svg>
      <p className={styles.note}>
        赤い帯の長さが通過量です。説明のための計算例で、特定製品の実測ではありません。
      </p>
    </figure>
  );
}

export function AirDensityTemperature() {
  const cold = [
    [26, 24],
    [62, 40],
    [98, 22],
    [134, 44],
    [30, 62],
    [70, 78],
    [110, 62],
    [146, 80],
    [26, 100],
    [64, 114],
    [104, 100],
    [140, 116],
    [44, 134],
    [86, 140],
    [126, 134],
  ];
  const hot = cold.slice(0, 14).map(([x, y], index) => [x + (index % 3) * 6, y - (index % 2) * 5]);
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>同じ大きさの入れもの、同じ圧力</figcaption>
      <svg
        viewBox="0 0 600 280"
        role="img"
        aria-label="同じ圧力・同じ体積で20℃と50℃の空気を比べると、温度が高いほうが中にある空気の質量が少なく、20℃を100としたとき約91になることを示す図。"
      >
        <rect x="50" y="40" width="180" height="170" rx="14" fill="#eef5fb" stroke="#37608c" strokeWidth="3" />
        <rect x="370" y="40" width="180" height="170" rx="14" fill="#fdeeee" stroke="#e0506a" strokeWidth="3" />
        {cold.map(([x, y]) => (
          <circle key={`cold-${x}-${y}`} cx={70 + x} cy={60 + y} r="6" fill="#37608c" />
        ))}
        {hot.map(([x, y]) => (
          <circle key={`hot-${x}-${y}`} cx={390 + x} cy={60 + y} r="6" fill="#e0506a" />
        ))}
        <text x="140" y="30" textAnchor="middle">20℃</text>
        <text x="460" y="30" textAnchor="middle">50℃</text>
        <rect x="50" y="228" width="180" height="26" rx="8" fill="#37608c" />
        <text x="140" y="248" textAnchor="middle" fill="#fff" className={styles.svgSmall}>
          質量 100
        </text>
        <rect x="370" y="228" width="164" height="26" rx="8" fill="#e0506a" />
        <text x="452" y="248" textAnchor="middle" fill="#fff" className={styles.svgSmall}>
          質量 約91
        </text>
        <text x="300" y="120" textAnchor="middle" className={styles.svgSmall}>
          同じ
        </text>
        <text x="300" y="148" textAnchor="middle" className={styles.svgSmall}>
          体積・圧力
        </text>
      </svg>
      <p className={styles.note}>
        理想気体としての説明用の図です。温度は℃に273.15を足した絶対温度で計算し、293.15Kと323.15Kの比で約0.907。
        この比をそのまま出力の低下率にはできません。
      </p>
    </figure>
  );
}

export function TurboIntakePath() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>エンジンの手前にも、回る羽根がある</figcaption>
      <svg
        viewBox="0 0 600 280"
        role="img"
        aria-label="吸気はフィルターからコンプレッサーの羽根、冷却器を通ってエンジンへ入り、排気は別の経路でタービンを回す。二つの羽根は同じ軸でつながっている図。"
      >
        <defs>
          <marker id="turbo-air" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#37608c" />
          </marker>
          <marker id="turbo-exhaust" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#9a6514" />
          </marker>
        </defs>
        <text x="20" y="28" className={styles.svgSmall} fill="#37608c">吸気</text>
        <rect x="14" y="44" width="104" height="52" rx="14" fill="#fff0ce" />
        <text x="66" y="76" textAnchor="middle" className={styles.svgSmall}>フィルター</text>
        <path d="M122 70 H162" stroke="#37608c" strokeWidth="3" markerEnd="url(#turbo-air)" />
        <circle cx="210" cy="70" r="42" fill="#eaf2fa" stroke="#37608c" strokeWidth="3" />
        <path d="M210 34 L222 70 L210 106 L198 70 Z M176 58 L210 70 L176 82 Z M244 58 L210 70 L244 82 Z" fill="#37608c" />
        <text x="210" y="134" textAnchor="middle" className={styles.svgSmall}>コンプレッサー</text>
        <path d="M254 70 H296" stroke="#37608c" strokeWidth="3" markerEnd="url(#turbo-air)" />
        <rect x="300" y="44" width="96" height="52" rx="14" fill="#eaf2fa" />
        <text x="348" y="76" textAnchor="middle" className={styles.svgSmall}>冷却器</text>
        <path d="M400 70 H440" stroke="#37608c" strokeWidth="3" markerEnd="url(#turbo-air)" />
        <rect x="444" y="30" width="140" height="180" rx="16" fill="#e8eef5" />
        <text x="514" y="126" textAnchor="middle">エンジン</text>
        <path d="M210 116 V174" stroke="#7a8ba0" strokeWidth="8" />
        <text x="222" y="152" className={styles.svgSmall} fill="#5e6f82">同じ軸</text>
        <circle cx="210" cy="216" r="42" fill="#f7efe1" stroke="#9a6514" strokeWidth="3" />
        <path d="M210 180 L222 216 L210 252 L198 216 Z M176 204 L210 216 L176 228 Z M244 204 L210 216 L244 228 Z" fill="#9a6514" />
        <text x="210" y="274" textAnchor="middle" className={styles.svgSmall}>タービン</text>
        <path d="M444 200 H256" stroke="#9a6514" strokeWidth="3" markerEnd="url(#turbo-exhaust)" />
        <text x="350" y="192" textAnchor="middle" className={styles.svgSmall} fill="#9a6514">排気</text>
        <path d="M166 216 H110" stroke="#9a6514" strokeWidth="3" markerEnd="url(#turbo-exhaust)" />
        <text x="96" y="222" textAnchor="end" className={styles.svgSmall} fill="#9a6514">外へ</text>
        <text x="66" y="112" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          ここで捕まえ損ねた異物が
        </text>
        <text x="66" y="132" textAnchor="middle" className={styles.svgSmall} fill="#e0506a">
          高速の羽根に当たる
        </text>
      </svg>
      <p className={styles.note}>
        吸気側と排気側の道を分けた概念図です。排気が空気と混ざってコンプレッサーを通るわけではありません。構成は車種で異なります。
      </p>
    </figure>
  );
}

export function FilterStates() {
  const panels = [
    { x: 10, title: "目詰まり", note: "通り道がふさがる" },
    { x: 205, title: "劣化・破損", note: "ろ材が裂ける" },
    { x: 400, title: "シール不良", note: "横をすり抜ける" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>「汚れている」と「傷んでいる」は別</figcaption>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-label="目詰まり、劣化・破損、シール不良という三つの状態の断面。目詰まりは通り道がふさがり、破損はろ材が裂け、シール不良は縁のすき間から空気が回り込む。"
      >
        {panels.map((panel) => (
          <g key={panel.title}>
            <rect x={panel.x} y="24" width="190" height="130" rx="14" fill="#f5f8fb" />
            <text x={panel.x + 95} y="192" textAnchor="middle">
              {panel.title}
            </text>
            <text x={panel.x + 95} y="220" textAnchor="middle" className={styles.svgSmall}>
              {panel.note}
            </text>
          </g>
        ))}
        <path
          d="M40 56 H160 V122 H40 Z M58 56 V122 M76 56 V122 M94 56 V122 M112 56 V122 M130 56 V122 M148 56 V122"
          fill="#fff0ce"
          stroke="#9a6514"
          strokeWidth="3"
        />
        <path d="M40 56 H160 V78 H40 Z" fill="#8a7a63" />
        <path
          d="M235 56 H355 V122 H235 Z M253 56 V122 M271 56 V122 M289 56 V122 M307 56 V122 M325 56 V122 M343 56 V122"
          fill="#fff0ce"
          stroke="#9a6514"
          strokeWidth="3"
        />
        <path d="M286 52 L300 90 L286 126" fill="none" stroke="#e0506a" strokeWidth="5" />
        <rect x="424" y="44" width="150" height="90" rx="10" fill="#fff" stroke="#37608c" strokeWidth="3" />
        <path
          d="M446 68 H552 V114 H446 Z M464 68 V114 M482 68 V114 M500 68 V114 M518 68 V114 M536 68 V114"
          fill="#fff0ce"
          stroke="#9a6514"
          strokeWidth="3"
        />
        <path d="M430 60 C470 44 520 44 556 60" fill="none" stroke="#e0506a" strokeWidth="4" strokeDasharray="8 5" />
      </svg>
      <p className={styles.note}>
        断面を単純化した模式図です。点検や整備は、車両と製品の説明書に従ってください。
      </p>
    </figure>
  );
}

export function AirAndInformation() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる概念図">
      <figcaption>空気の流れと、情報の流れ</figcaption>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="空気はフィルターからセンサーを通ってエンジンへ流れ、センサーの測定値はECUへ、ECUの指示は燃料噴射装置へ届く。空気の流れと情報の流れは別であることを示す図。"
      >
        <defs>
          <marker id="air-info-air" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#37608c" />
          </marker>
          <marker id="air-info-signal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8" fill="#167d88" />
          </marker>
        </defs>
        <text x="16" y="30" className={styles.svgSmall} fill="#37608c">空気の流れ</text>
        <rect x="14" y="48" width="112" height="54" rx="14" fill="#fff0ce" />
        <text x="70" y="82" textAnchor="middle" className={styles.svgSmall}>フィルター</text>
        <path d="M130 76 H170" stroke="#37608c" strokeWidth="3" markerEnd="url(#air-info-air)" />
        <rect x="174" y="48" width="118" height="54" rx="14" fill="#eaf2fa" />
        <text x="233" y="82" textAnchor="middle" className={styles.svgSmall}>センサー</text>
        <path d="M296 76 H336" stroke="#37608c" strokeWidth="3" markerEnd="url(#air-info-air)" />
        <rect x="340" y="48" width="118" height="54" rx="14" fill="#eaf2fa" />
        <text x="399" y="82" textAnchor="middle" className={styles.svgSmall}>配管</text>
        <path d="M462 76 H502" stroke="#37608c" strokeWidth="3" markerEnd="url(#air-info-air)" />
        <rect x="506" y="48" width="80" height="54" rx="14" fill="#e8eef5" />
        <text x="546" y="82" textAnchor="middle" className={styles.svgSmall}>エンジン</text>
        <path d="M233 106 V150" stroke="#167d88" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#air-info-signal)" />
        <rect x="170" y="156" width="126" height="54" rx="14" fill="#e4f2f2" />
        <text x="233" y="190" textAnchor="middle" className={styles.svgSmall}>ECU</text>
        <path d="M300 182 H352" stroke="#167d88" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#air-info-signal)" />
        <rect x="356" y="156" width="150" height="54" rx="14" fill="#e4f2f2" />
        <text x="431" y="190" textAnchor="middle" className={styles.svgSmall}>燃料噴射装置</text>
        <path d="M506 176 H546 V110" stroke="#e0506a" strokeWidth="3" markerEnd="url(#air-info-air)" fill="none" />
        <text x="566" y="140" textAnchor="end" className={styles.svgSmall} fill="#e0506a">燃料</text>
        <text x="300" y="242" textAnchor="middle" className={styles.svgSmall}>
          実線は空気、破線は情報と指示。配管を替えると、センサーが見る流れ方が変わる。
        </text>
      </svg>
      <p className={styles.note}>
        情報の流れを分けて見るための概念図です。空気がECUの中を流れるわけではありません。センサーの方式や制御は車両で異なります。
      </p>
    </figure>
  );
}
