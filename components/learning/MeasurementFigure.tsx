import type { LearningBlock } from "@/lib/learning";
import { chartGeometry } from "@/lib/learning-chart";
import styles from "@/app/learn/learning.module.css";

type Measurements = Extract<LearningBlock, { type: "measurements" }>;
const colors = ["#207d8b", "#e25368", "#4659a4"];
const dashes = [undefined, "7 5", "2 4"];

export function MeasurementFigure({ block }: { block: Measurements }) {
  const { low, high, xs, y } = chartGeometry(block);
  const label = block.yLabel ?? "値";
  const axisLabel = label.includes(`（${block.unit}）`) ? label : `${label}（${block.unit}）`;
  const staggerTicks = xs.some((x, index) => index > 0 && x - xs[index - 1] < (block.rounds[index].length + block.rounds[index - 1].length) * 6);
  const legendStart = staggerTicks ? 300 : 284;
  const height = legendStart + 10 + block.series.length * 24;
  return <figure className={styles.figure}>
    <figcaption>{block.title}</figcaption>
    <p className={styles.note}>{block.note}</p>
    <div className={styles.chartScroll} tabIndex={0} role="region" aria-label={`${block.title}のグラフ`}>
      <svg viewBox={`0 0 550 ${height}`} role="img" aria-label={`${label}、単位${block.unit}。縦軸は${low}から${high}。値は直後の表にも掲載。`}>
        <text x="15" y="24">{axisLabel}</text>
        {[low, (low + high) / 2, high].map(value => <g key={value}>
          <path d={`M72 ${y(value)}H490`} stroke="#d9e4ea" />
          <text x="62" y={y(value) + 5} textAnchor="end">{Number(value.toFixed(2))}</text>
        </g>)}
        <path d="M72 52V224H490" fill="none" stroke="#526682" />
        {block.rounds.map((round, index) => <text key={round} x={xs[index]} y={247 + (staggerTicks && index % 2 ? 17 : 0)} textAnchor="middle">{round}</text>)}
        {block.series.map((series, index) => <g key={series.name}>
          <polyline points={series.values.map((value, point) => `${xs[point]},${y(value)}`).join(" ")} fill="none" stroke={colors[index % colors.length]} strokeWidth="3" strokeDasharray={dashes[index % dashes.length]} />
          {series.values.map((value, point) => <circle key={point} cx={xs[point]} cy={y(value)} r={4 + index} fill={colors[index % colors.length]} />)}
          <path d={`M20 ${legendStart + index * 24}h24`} stroke={colors[index % colors.length]} strokeWidth="3" strokeDasharray={dashes[index % dashes.length]} />
          <text x="54" y={legendStart + 5 + index * 24}>{series.name}</text>
        </g>)}
      </svg>
    </div>
    <p className={styles.note}>横軸：{block.xLabel ?? "比較する条件"}。{block.xValues ? "数値の間隔に合わせて点を配置しています。" : "各条件を等間隔に並べています。"}縦軸：{low}〜{high} {block.unit}{low !== 0 ? "（0からの表示ではありません）" : ""}。点を結ぶ線は、点の間の実測値を示すものではありません。</p>
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="グラフと同じ値の表">
      <table><caption>図と同じ値（{block.unit}）</caption>
        <thead><tr><th scope="col">{block.xLabel ?? "比較する条件"}</th>{block.series.map(series => <th scope="col" key={series.name}>{series.name}</th>)}</tr></thead>
        <tbody>{block.rounds.map((round, index) => <tr key={round}><th scope="row">{round}</th>{block.series.map(series => <td key={series.name}>{series.values[index]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </figure>;
}
