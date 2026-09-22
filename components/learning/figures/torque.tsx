import styles from "@/app/learn/learning.module.css";

/**
 * Figures for the engine-torque course.
 *
 * The two charts below are drawn from one illustrative engine so the lessons stay
 * consistent with each other: peak torque 100 N・m at 3,500 rpm, peak power about
 * 53 kW at 6,000 rpm. They are not measurements of a production car.
 */
const TORQUE_CURVE: [rpm: number, torque: number][] = [
  [1000, 70],
  [1500, 80],
  [2000, 88],
  [2500, 94],
  [3000, 98],
  [3500, 100],
  [4000, 99],
  [4500, 97],
  [5000, 94],
  [5500, 90],
  [6000, 84.3],
  [6500, 76],
];
/** kW from N・m and rpm. 9,550 rounds 60,000 / 2π. */
const powerKw = (torque: number, rpm: number) => (torque * rpm) / 9550;
const FINAL_DRIVE = 4.2;
const EFFICIENCY = 0.9;
const TYRE_RADIUS = 0.3;
/** km/h per rpm for a gear ratio of 1. */
const SPEED_PER_RPM = (2 * Math.PI * TYRE_RADIUS * 3.6) / (60 * FINAL_DRIVE);
/** N per (N・m × gear ratio). */
const FORCE_PER_TORQUE = (FINAL_DRIVE * EFFICIENCY) / TYRE_RADIUS;
const GEARS = [
  { name: "1速", ratio: 3.5, color: "#a6c6e4" },
  { name: "3速", ratio: 1.4, color: "#4a83bd" },
  { name: "5速", ratio: 0.85, color: "#1b4a76" },
];

const round = (value: number, digits = 0) =>
  value.toLocaleString("ja-JP", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function TorqueLever() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>同じ力でも、長いほうがよく回る</figcaption>
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

export function TorqueVsRpm() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>同じ軸で見ている、別々の数字</figcaption>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-label="左は軸をどれだけ強くひねるかを表すトルク、右は1分間に何回まわるかを表す回転数を示す図。"
      >
        <defs>
          <marker id="torque-twist-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0 0 L9 4.5 L0 9" fill="#e0506a" />
          </marker>
          <marker id="torque-spin-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0 0 L9 4.5 L0 9" fill="#278b9a" />
          </marker>
        </defs>
        <circle cx="150" cy="112" r="42" fill="#eaf2fa" stroke="#37608c" strokeWidth="3" />
        <text x="150" y="120" textAnchor="middle">軸</text>
        <path
          d="M92 112 A58 58 0 1 1 208 112"
          fill="none"
          stroke="#e0506a"
          strokeWidth="9"
          strokeLinecap="round"
          markerEnd="url(#torque-twist-arrow)"
        />
        <text x="150" y="196" textAnchor="middle">トルク</text>
        <text x="150" y="222" textAnchor="middle" className={styles.svgSmall}>どれだけ強くひねるか（N・m）</text>
        <path d="M300 40 V200" stroke="#d9e4ea" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="450" cy="112" r="42" fill="#eaf2fa" stroke="#37608c" strokeWidth="3" />
        <text x="450" y="120" textAnchor="middle">軸</text>
        <path d="M404 112 A46 46 0 1 1 496 112" fill="none" stroke="#278b9a" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#torque-spin-arrow)" />
        <path d="M392 112 A58 58 0 1 1 508 112" fill="none" stroke="#278b9a" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#torque-spin-arrow)" />
        <path d="M380 112 A70 70 0 1 1 520 112" fill="none" stroke="#278b9a" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#torque-spin-arrow)" />
        <text x="450" y="196" textAnchor="middle">回転数</text>
        <text x="450" y="222" textAnchor="middle" className={styles.svgSmall}>1分間に何回まわるか（rpm）</text>
      </svg>
      <p className={styles.note}>
        片方の値が分かっても、もう片方は決まりません。性能表示に両方が並ぶのはそのためです。
      </p>
    </figure>
  );
}

export function TorqueFeel() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>どこで効いてくるか</figcaption>
      <svg
        viewBox="0 0 600 170"
        role="img"
        aria-label="発進や坂道では低い回転のトルクが、速度が乗ってからの伸びでは高い回転の出力が効くことを示す帯の図。"
      >
        <rect x="40" y="40" width="250" height="52" rx="12" fill="#ffe8ed" />
        <rect x="300" y="40" width="260" height="52" rx="12" fill="#e4f2f2" />
        <text x="165" y="74" textAnchor="middle">発進・坂道</text>
        <text x="430" y="74" textAnchor="middle">速度が乗ってからの伸び</text>
        <text x="165" y="118" textAnchor="middle" className={styles.svgSmall}>低い回転のトルクが効く</text>
        <text x="430" y="118" textAnchor="middle" className={styles.svgSmall}>高い回転の出力が効く</text>
        <path d="M40 142 H556" stroke="#526682" strokeWidth="2" markerEnd="url(#torque-feel-arrow)" />
        <text x="40" y="28" className={styles.svgSmall}>速度・回転数 →</text>
        <defs>
          <marker id="torque-feel-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0 0 L9 4.5 L0 9" fill="#526682" />
          </marker>
        </defs>
      </svg>
      <p className={styles.note}>
        第1回向けの目安です。同じ速度でどちらが強いかはギアの選び方でも変わり、第3回で扱います。
      </p>
    </figure>
  );
}

export function CatalogAnatomy() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>性能表示の1行を、3つに分ける</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label="最高出力53キロワット、斜線、6000回転毎分という表示を、出力の値、区切りの斜線、その値が出る回転数の3つに分解した図。"
      >
        <rect x="30" y="24" width="540" height="68" rx="16" fill="#eaf2fa" />
        <text x="58" y="66">最高出力</text>
        <text x="200" y="66" fill="#1f5f8b" fontWeight="700">53 kW</text>
        <text x="312" y="66" fill="#e0506a" fontWeight="700">／</text>
        <text x="356" y="66" fill="#167d88" fontWeight="700">6,000 rpm</text>
        <path d="M232 100 L186 140" stroke="#1f5f8b" strokeWidth="2" />
        <text x="30" y="168" className={styles.svgSmall}>いちばん大きい出力の値</text>
        <text x="30" y="192" className={styles.svgSmall}>1 PS ≒ 0.735 kW</text>
        <path d="M318 100 V132" stroke="#e0506a" strokeWidth="2" />
        <text x="318" y="154" textAnchor="middle" className={styles.svgSmall}>割り算ではない</text>
        <path d="M420 100 L470 140" stroke="#167d88" strokeWidth="2" />
        <text x="570" y="168" textAnchor="end" className={styles.svgSmall}>その値が出る回転数</text>
        <text x="570" y="192" textAnchor="end" className={styles.svgSmall}>ここを見ないと比べられない</text>
        <text x="300" y="232" textAnchor="middle" className={styles.svgSmall}>
          最大トルクの行も同じ読み方（例：100 N・m ／ 3,500 rpm）
        </text>
      </svg>
      <p className={styles.note}>数値は説明用の例です。実際の値は、見ている車種とグレードの性能表示で確認してください。</p>
    </figure>
  );
}

export function TorqueAndPowerCurves() {
  const xMax = 7000;
  const plot = (value: number) => 80 + (value / xMax) * 480;
  const panel = (top: number, height: number, max: number) => ({
    y: (value: number) => top + height - (value / max) * height,
    top,
    bottom: top + height,
  });
  const torque = panel(48, 150, 120);
  const power = panel(288, 150, 60);
  const torquePoints = TORQUE_CURVE.map(([rpm, value]) => `${plot(rpm).toFixed(1)},${torque.y(value).toFixed(1)}`).join(" ");
  const powerPoints = TORQUE_CURVE.map(([rpm, value]) => `${plot(rpm).toFixed(1)},${power.y(powerKw(value, rpm)).toFixed(1)}`).join(" ");
  const peakPower = powerKw(84.3, 6000);
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできるグラフ">
      <figcaption>2つのピークは、別の回転数にある</figcaption>
      <svg
        viewBox="0 0 600 510"
        role="img"
        aria-label={`同じエンジンのトルクと出力のグラフ。トルクは3,500回転で最大100ニュートンメートル、出力は6,000回転で最大約${round(peakPower, 1)}キロワットとなり、ピークの回転数が離れている。値は続く表にも掲載。`}
      >
        {[3500, 6000].map((rpm) => (
          <path
            key={rpm}
            d={`M${plot(rpm)} ${torque.top} V${power.bottom}`}
            stroke={rpm === 3500 ? "#f0b9c4" : "#a8d5d5"}
            strokeWidth="2"
            strokeDasharray="7 6"
          />
        ))}
        <text x="24" y="32" className={styles.svgSmall}>トルク（N・m）</text>
        {[0, 40, 80, 120].map((value) => (
          <g key={value}>
            <path d={`M80 ${torque.y(value)} H560`} stroke="#e4ebf1" strokeWidth="1.5" />
            <text x="70" y={torque.y(value) + 6} textAnchor="end" className={styles.svgSmall}>
              {value}
            </text>
          </g>
        ))}
        <polyline points={torquePoints} fill="none" stroke="#e0506a" strokeWidth="4" strokeLinejoin="round" />
        <circle cx={plot(3500)} cy={torque.y(100)} r="7" fill="#e0506a" stroke="#fff" strokeWidth="3" />
        <text x={plot(3500)} y={torque.y(100) - 16} textAnchor="middle" className={styles.svgSmall}>
          最大トルク 100
        </text>
        <text x="24" y="272" className={styles.svgSmall}>出力（kW）</text>
        {[0, 20, 40, 60].map((value) => (
          <g key={value}>
            <path d={`M80 ${power.y(value)} H560`} stroke="#e4ebf1" strokeWidth="1.5" />
            <text x="70" y={power.y(value) + 6} textAnchor="end" className={styles.svgSmall}>
              {value}
            </text>
          </g>
        ))}
        <polyline points={powerPoints} fill="none" stroke="#1f7f8c" strokeWidth="4" strokeLinejoin="round" />
        <circle cx={plot(6000)} cy={power.y(peakPower)} r="7" fill="#1f7f8c" stroke="#fff" strokeWidth="3" />
        <text x={plot(6000) - 14} y={power.y(peakPower) - 16} textAnchor="end" className={styles.svgSmall}>
          最高出力 {round(peakPower, 1)}
        </text>
        <path d={`M80 ${torque.bottom} H560 M80 ${power.bottom} H560`} stroke="#526682" strokeWidth="2" />
        {[0, 2000, 4000, 6000].map((rpm) => (
          <text key={rpm} x={plot(rpm)} y={power.bottom + 28} textAnchor="middle" className={styles.svgSmall}>
            {round(rpm)}
          </text>
        ))}
        <text x="560" y="502" textAnchor="end" className={styles.svgSmall}>
          回転数（rpm）
        </text>
      </svg>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="グラフと同じ値の表">
        <table>
          <caption>図と同じ値</caption>
          <thead>
            <tr>
              <th scope="col">回転数（rpm）</th>
              <th scope="col">トルク（N・m）</th>
              <th scope="col">出力（kW）</th>
            </tr>
          </thead>
          <tbody>
            {TORQUE_CURVE.map(([rpm, value]) => (
              <tr key={rpm}>
                <th scope="row">{round(rpm)}</th>
                <td>{value}</td>
                <td>{round(powerKw(value, rpm), 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        説明用に作った1台分の例で、実測値ではありません。縦軸はどちらも0から始めています。
      </p>
    </figure>
  );
}

export function DriveForceChain() {
  const force = 100 * 3.5 * FORCE_PER_TORQUE;
  const boxes = [
    { label: "エンジン", value: "100 N・m" },
    { label: "変速機（1速）", value: "×3.5" },
    { label: "最終減速", value: "×4.2" },
    { label: "タイヤ", value: "÷ 0.30 m" },
  ];
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>エンジンのトルクが、タイヤを押す力になるまで</figcaption>
      <svg
        viewBox="0 0 600 250"
        role="img"
        aria-label={`エンジンの100ニュートンメートルが、変速機で3.5倍、最終減速で4.2倍になり、タイヤ半径0.3メートルで割られて約${round(force)}ニュートンの駆動力になる流れ図。`}
      >
        <defs>
          <marker id="drive-chain-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <path d="M0 0 L9 4.5 L0 9" fill="#37608c" />
          </marker>
        </defs>
        {boxes.map((box, index) => {
          const x = 12 + index * 148;
          return (
            <g key={box.label}>
              <rect x={x} y="44" width="126" height="76" rx="16" fill="#eaf2fa" />
              <text x={x + 63} y="76" textAnchor="middle" className={styles.svgSmall}>
                {box.label}
              </text>
              <text x={x + 63} y="104" textAnchor="middle" className={styles.svgSmall} fill="#1f5f8b">
                {box.value}
              </text>
              {index < boxes.length - 1 && (
                <path d={`M${x + 130} 82 H${x + 144}`} stroke="#37608c" strokeWidth="3" markerEnd="url(#drive-chain-arrow)" />
              )}
            </g>
          );
        })}
        <text x="300" y="28" textAnchor="middle" className={styles.svgSmall}>
          伝わるあいだのロス（効率0.9）も入れる
        </text>
        <path d="M519 124 V150" stroke="#37608c" strokeWidth="3" markerEnd="url(#drive-chain-arrow)" />
        <rect x="300" y="156" width="288" height="52" rx="16" fill="#fff0ce" />
        <text x="444" y="190" textAnchor="middle">駆動力 約{round(force)} N</text>
        <text x="300" y="238" textAnchor="middle" className={styles.svgSmall}>
          駆動力 ＝ トルク × 変速比 × 最終減速比 × 効率 ÷ タイヤ半径
        </text>
      </svg>
      <p className={styles.note}>
        変速比・最終減速比・タイヤ半径は説明用の設定です。自分の車で計算するときは諸元表の値に置き換えてください。
      </p>
    </figure>
  );
}

export function DriveForceBySpeed() {
  const xMax = 210;
  const yMax = 5000;
  const left = 96;
  const right = 560;
  const top = 40;
  const bottom = 300;
  const px = (speed: number) => left + (speed / xMax) * (right - left);
  const py = (force: number) => bottom - (force / yMax) * (bottom - top);
  const curves = GEARS.map((gear) => ({
    ...gear,
    points: TORQUE_CURVE.map(([rpm, torque]) => ({
      speed: (SPEED_PER_RPM * rpm) / gear.ratio,
      force: torque * gear.ratio * FORCE_PER_TORQUE,
    })),
  }));
  const at70 = (ratio: number) => {
    const rpm = (70 * ratio) / SPEED_PER_RPM;
    const upper = TORQUE_CURVE.findIndex(([value]) => value >= rpm);
    const [rpmA, torqueA] = TORQUE_CURVE[upper - 1];
    const [rpmB, torqueB] = TORQUE_CURVE[upper];
    const torque = torqueA + ((torqueB - torqueA) * (rpm - rpmA)) / (rpmB - rpmA);
    return { rpm, torque, force: torque * ratio * FORCE_PER_TORQUE, power: powerKw(torque, rpm) };
  };
  const third = at70(1.4);
  const fifth = at70(0.85);
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできるグラフ">
      <figcaption>車速ごとの、タイヤを押す力</figcaption>
      <svg
        viewBox="0 0 600 380"
        role="img"
        aria-label={`1速・3速・5速それぞれの駆動力と車速のグラフ。低いギアほど力は大きく到達速度は低い。70km/hでは3速が約${round(third.force)}ニュートン、5速が約${round(fifth.force)}ニュートン。値は続く表にも掲載。`}
      >
        {[0, 1000, 2000, 3000, 4000, 5000].map((value) => (
          <g key={value}>
            <path d={`M${left} ${py(value)} H${right}`} stroke="#e4ebf1" strokeWidth="1.5" />
            <text x={left - 10} y={py(value) + 6} textAnchor="end" className={styles.svgSmall}>
              {round(value)}
            </text>
          </g>
        ))}
        <path d={`M${px(70)} ${py(0)} V${top}`} stroke="#c8d3de" strokeWidth="2" strokeDasharray="7 6" />
        <text x="24" y="24" className={styles.svgSmall}>駆動力（N）</text>
        {curves.map((curve) => (
          <g key={curve.name}>
            <polyline
              points={curve.points.map((point) => `${px(point.speed).toFixed(1)},${py(point.force).toFixed(1)}`).join(" ")}
              fill="none"
              stroke={curve.color}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <text
              x={px(curve.points[1].speed)}
              y={py(curve.points[1].force) - 14}
              textAnchor="middle"
              className={styles.svgSmall}
              fill={curve.color}
            >
              {curve.name}
            </text>
          </g>
        ))}
        {[
          { name: "3速", data: third, color: GEARS[1].color, dy: -14 },
          { name: "5速", data: fifth, color: GEARS[2].color, dy: 26 },
        ].map((mark) => (
          <g key={mark.name}>
            <circle cx={px(70)} cy={py(mark.data.force)} r="7" fill={mark.color} stroke="#fff" strokeWidth="3" />
            <text x={px(70) + 14} y={py(mark.data.force) + mark.dy} className={styles.svgSmall}>
              {mark.name} 約{round(Math.round(mark.data.force / 10) * 10)} N
            </text>
          </g>
        ))}
        <path d={`M${left} ${py(0)} H${right}`} stroke="#526682" strokeWidth="2" />
        {[0, 50, 100, 150, 200].map((speed) => (
          <text key={speed} x={px(speed)} y={py(0) + 28} textAnchor="middle" className={styles.svgSmall}>
            {speed}
          </text>
        ))}
        <text x={right} y="372" textAnchor="end" className={styles.svgSmall}>
          車速（km/h）
        </text>
      </svg>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="70km/hでの値の表">
        <table>
          <caption>70 km/h で走っているとき</caption>
          <thead>
            <tr>
              <th scope="col">見るもの</th>
              <th scope="col">3速</th>
              <th scope="col">5速</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">エンジン回転数</th>
              <td>約{round(Math.round(third.rpm / 10) * 10)} rpm</td>
              <td>約{round(Math.round(fifth.rpm / 10) * 10)} rpm</td>
            </tr>
            <tr>
              <th scope="row">その回転数のトルク</th>
              <td>約{round(third.torque)} N・m</td>
              <td>約{round(fifth.torque)} N・m</td>
            </tr>
            <tr>
              <th scope="row">そのときの出力</th>
              <td>約{round(third.power)} kW</td>
              <td>約{round(fifth.power)} kW</td>
            </tr>
            <tr>
              <th scope="row">タイヤを押す力</th>
              <td>約{round(Math.round(third.force / 10) * 10)} N</td>
              <td>約{round(Math.round(fifth.force / 10) * 10)} N</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        図5のエンジンに、変速比1速3.5・3速1.4・5速0.85、最終減速4.2、タイヤ半径0.30m、効率0.9を組み合わせた計算です。走行抵抗は含みません。
      </p>
    </figure>
  );
}

export function TorqueCurveShapes() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>トルクカーブの形は、エンジンで違う</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="自然吸気は回転とともになだらかにトルクが増え、過給は低い回転から立ち上がって平らな山を作ることを示す模式図。"
      >
        <path d="M70 250 H560 M70 250 V40" stroke="#526682" strokeWidth="2" />
        <text x="24" y="32" className={styles.svgSmall}>トルク</text>
        <text x="560" y="286" textAnchor="end" className={styles.svgSmall}>回転数 →</text>
        <path
          d="M90 214 C180 186 300 140 390 132 C456 128 520 156 556 196"
          fill="none"
          stroke="#1f5f8b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M90 230 C128 226 154 118 214 112 C324 102 390 106 452 114 C508 122 536 156 556 200"
          fill="none"
          stroke="#e0506a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text x="410" y="160" fill="#1f5f8b" className={styles.svgSmall}>自然吸気</text>
        <text x="300" y="90" fill="#e0506a" className={styles.svgSmall}>過給（ターボ）</text>
        <path d="M172 250 V128" stroke="#c8d3de" strokeWidth="2" strokeDasharray="6 6" />
        <text x="182" y="236" className={styles.svgSmall}>過給が効き始める</text>
        <text x="300" y="286" textAnchor="middle" className={styles.svgSmall}>
          目盛りを省いた模式図です
        </text>
      </svg>
      <p className={styles.note}>
        形の違いを示す図で、特定の車種の実測ではありません。同じ最高出力でも、街中での感じ方はこの形で変わります。
      </p>
    </figure>
  );
}

export function TwoPointsTwoCurves() {
  return (
    <figure className={styles.diagram} tabIndex={0} role="region" aria-label="横にスクロールできる図">
      <figcaption>性能表示の2点からは、形は決まらない</figcaption>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label="最大トルクの点と、最高出力のときのトルクの点。その2点を通る曲線には、平らな形と尖った形の両方がありうることを示す図。"
      >
        <path d="M80 250 H560 M80 250 V40" stroke="#526682" strokeWidth="2" />
        <text x="24" y="32" className={styles.svgSmall}>トルク</text>
        <text x="560" y="286" textAnchor="end" className={styles.svgSmall}>回転数 →</text>
        <path
          d="M100 206 C168 132 240 108 300 108 C380 108 430 116 480 130 C520 142 544 162 556 184"
          fill="none"
          stroke="#167d88"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M100 222 C210 212 276 118 300 108 C340 96 400 118 480 130 C516 140 540 170 556 202"
          fill="none"
          stroke="#e0506a"
          strokeWidth="4"
          strokeDasharray="10 7"
          strokeLinecap="round"
        />
        <circle cx="300" cy="108" r="8" fill="#fff" stroke="#233e60" strokeWidth="3" />
        <circle cx="480" cy="130" r="8" fill="#fff" stroke="#233e60" strokeWidth="3" />
        <text x="300" y="88" textAnchor="middle" className={styles.svgSmall}>
          最大トルク 100 N・m ／ 3,500 rpm
        </text>
        <text x="556" y="116" textAnchor="end" className={styles.svgSmall}>
          最高出力のときの約84 N・m
        </text>
        <text x="110" y="270" fill="#167d88" className={styles.svgSmall}>広い台地型</text>
        <text x="230" y="270" fill="#e0506a" className={styles.svgSmall}>尖った山型</text>
        <text x="556" y="270" textAnchor="end" className={styles.svgSmall}>どちらも同じ2点を通る</text>
      </svg>
      <p className={styles.note}>
        性能表示の2点は通っても、あいだの形は別物です。扱いやすさを比べるなら、メーカーの性能曲線や条件を書いた実測を見ます。
      </p>
    </figure>
  );
}
