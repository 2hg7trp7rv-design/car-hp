import type { LearningBlock } from "@/lib/learning";
import styles from "@/app/learn/learning.module.css";
type Measurements=Extract<LearningBlock,{type:"measurements"}>;
const colors=['#207d8b','#e25368','#4659a4'];
export function MeasurementFigure({block}:{block:Measurements}){
 const values=block.series.flatMap(s=>s.values);
 const low=Math.floor(Math.min(...values))-1, high=Math.ceil(Math.max(...values))+1;
 const x=(i:number)=>82+i*380/Math.max(1,block.rounds.length-1);
 const y=(v:number)=>224-(v-low)*162/(high-low);
 const label=block.yLabel??'値';
 return <figure className={styles.figure}><figcaption>{block.title}</figcaption><p className={styles.note}>{block.note}</p>
 <div className={styles.chartScroll} tabIndex={0} role="region" aria-label={`${block.title}のグラフ。横にスクロールできます`}><svg viewBox="0 0 550 340" role="img" aria-label={`${label}、単位${block.unit}。縦軸は${low}から${high}。値は直後の表にも掲載。`}>
 <text x="15" y="24">{label}（{block.unit}）</text>{[low,(low+high)/2,high].map(v=><g key={v}><path d={`M72 ${y(v)}H490`} stroke="#d9e4ea"/><text x="62" y={y(v)+5} textAnchor="end">{Number(v.toFixed(2))}</text></g>)}<path d="M72 52V224H490" fill="none" stroke="#526682"/>
 {block.rounds.map((r,i)=><text key={r} x={x(i)} y="247" textAnchor="middle">{r}</text>)}
 {block.series.map((s,i)=><g key={s.name}><polyline points={s.values.map((v,j)=>`${x(j)},${y(v)}`).join(' ')} fill="none" stroke={colors[i%colors.length]} strokeWidth="3" strokeDasharray={i?'7 5':undefined}/>{s.values.map((v,j)=><circle key={j} cx={x(j)} cy={y(v)} r={4+i} fill={colors[i%colors.length]}/>)}<path d={`M20 ${284+i*17}h24`} stroke={colors[i%colors.length]} strokeWidth="3" strokeDasharray={i?'7 5':undefined}/><text x="54" y={289+i*17}>{s.name}</text></g>)}
 </svg></div><p className={styles.note}>横軸：{block.xLabel??'比較する条件'}。点は各条件の値を示し、線は点同士を結んでいます。</p><div className={styles.tableScroll} tabIndex={0} role="region" aria-label="グラフと同じ値の表"><table><caption>図と同じ値（{block.unit}）</caption><thead><tr><th scope="col">{block.xLabel??'比較する条件'}</th>{block.series.map(s=><th scope="col" key={s.name}>{s.name}</th>)}</tr></thead><tbody>{block.rounds.map((r,i)=><tr key={r}><th scope="row">{r}</th>{block.series.map(s=><td key={s.name}>{s.values[i]}</td>)}</tr>)}</tbody></table></div></figure>;
}
