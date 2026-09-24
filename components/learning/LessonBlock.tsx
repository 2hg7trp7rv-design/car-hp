import Image from "next/image";
import type { LearningBlock as Block } from "@/lib/learning";
import { DIAGRAM_TEXT } from "@/lib/learning";
import { LearningDiagram } from "./LearningDiagram";
import { MeasurementFigure } from "./MeasurementFigure";
import styles from "@/app/learn/learning.module.css";
export function LessonBlock({block}:{block:Block}){
 if(block.type==='heading')return <h2 id={block.id} className={styles.lessonSectionTitle}>{block.title}</h2>;
 if(block.type==='dialogue') return <div className={styles.dialogue} data-dialogue-speaker={block.speaker}><Image src={`/images/cbj/learning/${block.speaker}.webp`} alt="" width={72} height={72} sizes="72px"/><div><strong>{block.speaker==='shuna'?'シュナ':'莉奈'}</strong><p>{block.text}</p></div></div>;
 if(block.type==='diagram')return <div className={styles.figureWrap}><LearningDiagram kind={block.kind}/><p className={styles.diagramDescription}>{block.title??DIAGRAM_TEXT[block.kind]}{block.note?` ${block.note}`:''}</p></div>;
 if(block.type==='measurements')return <MeasurementFigure block={block}/>;
 if(block.type==='flow')return <figure className={styles.figure}><figcaption>{block.title}</figcaption><ol className={styles.flow}>{block.steps.map(s=><li key={s.title}><strong>{s.title}</strong><p>{s.body}</p></li>)}</ol><p className={styles.note}>{block.note}</p></figure>;
 return <figure className={styles.figure}><figcaption>{block.title}</figcaption><div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`${block.title}。横にスクロールできます`}><table><thead><tr>{block.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{block.rows.map((r,i)=><tr key={i}>{r.map((v,j)=>j===0?<th key={j} scope="row">{v}</th>:<td key={j}>{v}</td>)}</tr>)}</tbody></table></div><p className={styles.note}>{block.note}</p></figure>;
}
