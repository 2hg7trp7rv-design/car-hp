import Image from "next/image";
import styles from "@/app/learn/learning.module.css";

/** An original explanatory drawing: airflow only, not a vehicle assembly drawing. */
export function AirFilterFigure() {
  return <figure className={styles.airFigure}>
    <figcaption>エアクリーナーのはたらき</figcaption>
    <div className={styles.airSteps}>
      <div><strong>外の空気</strong><svg viewBox="0 0 100 130" role="img" aria-label="空気に混ざったほこりや砂の粒子">
        {Array.from({length:24},(_,i)=><circle key={i} cx={10+(i*37)%80} cy={8+(i*29)%113} r={i%3+2} fill={i%2?'#b2b8c0':'#737d8b'}/>)}
      </svg><p>ほこり・砂など</p></div>
      <span aria-hidden="true">→</span>
      <div><strong>フィルター</strong><svg viewBox="0 0 115 130" role="img" aria-label="折りひだのあるろ材が異物を捕まえる">
        <path d="M12 23 90 8 104 17 104 108 27 125 12 116Z" fill="#c5cdd1" stroke="#36475e" strokeWidth="2"/>
        <path d="M23 28 91 14 91 104 23 117Z" fill="#f9efd3" stroke="#726856" strokeWidth="2"/>
        {Array.from({length:10},(_,i)=><path key={i} d={`M${27+i*6} ${27-i*1.2}v86l3-2v-85`} fill="none" stroke="#9d9075" strokeWidth="1.5"/>)}
      </svg><p>異物を捕まえる</p></div>
      <span aria-hidden="true">→</span>
      <div><strong>エンジン</strong><Image src="/images/cbj/topic-icons/engine-basics.png" alt="エアクリーナーを通った空気を使うエンジン" width={192} height={192} sizes="(max-width:600px) 90px, 150px"/><p>きれいにした空気</p></div>
    </div>
    <p className={styles.note}>役割を示す模式図。微粒子をすべて除去する意味ではありません。</p>
  </figure>;
}
