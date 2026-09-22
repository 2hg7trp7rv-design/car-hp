import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceFrame } from "@/components/learning/ReferenceFrame";
import { getLearningCourses, learningHref } from "@/lib/learning";
import { referenceMetadata } from "@/lib/learning-metadata";
import styles from "./glossary.module.css";

export const metadata: Metadata = referenceMetadata("用語を調べる｜CAR BOUTIQUE JOURNAL", "クルマの記事で出会う言葉を、短い説明と学習回へのリンクで確認できます。", "/glossary");

const terms = [
  ["トルク", "エンジンが回転させる力。回転数との組み合わせで、発進や加速の感じ方を考えます。", "engine-torque"],
  ["過給", "ターボチャージャーなどで吸気を圧縮し、同じ排気量でも多くの空気を取り込む仕組みです。", "engine-torque"],
  ["ダンパー", "ばねの動きを抑え、車体の揺れが収まる速さを整える部品です。", "suspension"],
  ["アライメント", "車輪の向きや角度。タイヤの接地と直進性、偏摩耗に関わります。", "suspension"],
  ["荷重移動", "加減速や旋回で、車の前後左右へタイヤの荷重が移ることです。", "suspension"],
  ["トレッド", "タイヤが路面に触れる外周部分。溝やブロックの形が排水とグリップに関わります。", "tires-brakes"],
  ["摩擦", "タイヤと路面などの接触面で、動きを伝えたり止めたりする力です。", "tires-brakes"],
  ["ABS", "急ブレーキ時に車輪のロックを抑え、操舵を保ちやすくする制御です。", "tires-brakes"],
  ["RMS", "変動する信号の大きさを、エネルギーに対応する平均的な値として表す計算方法です。", "muffler-sound"],
  ["dB", "音圧や信号の比を対数で表す単位。基準値と測定条件を一緒に読みます。", "muffler-sound"],
  ["LAeq", "A特性で重み付けした音のエネルギーを、指定時間で平均した値です。", "muffler-sound"],
  ["ADAS", "衝突被害軽減など、運転を支援する先進運転支援システムの総称です。", "driving-support"],
  ["画角", "カメラが一度に写せる範囲。広いほど範囲は増えますが、対象の見え方も変わります。", "driving-support"],
  ["撥水", "水滴を表面で弾きやすくする性質。素材や施工方法によって持続や手入れが異なります。", "maintenance"],
  ["粘度", "液体の流れにくさ。エンジンオイルでは温度と規格を併せて確認します。", "maintenance"],
  ["空燃比", "燃焼に入る空気と燃料の量の比。エンジンの状態や制御を読む手がかりです。", "air-cleaner"],
  ["MAFセンサー", "吸入空気量を測るセンサー。測定方式や汚れが制御に影響する場合があります。", "air-cleaner"],
  ["圧力損失", "流れが部品を通過するときに失う圧力。フィルターの通気とろ過の両立を考える指標です。", "air-cleaner"],
] as const;

export default function GlossaryPage() {
  const courses = new Map(getLearningCourses().map((course) => [course.slug, course]));
  return <ReferenceFrame><main className={styles.main}>
    <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><span>用語を調べる</span></nav>
    <header className={styles.head}><p>読みながら、気になった言葉を。</p><h1>クルマの用語集</h1><p>短い説明で確認して、詳しく知りたいときは会話と図解のレッスンへ進めます。</p></header>
    <div className={styles.grid}>{terms.map(([term, description, slug]) => { const course = courses.get(slug); const lesson = course?.lessons.find((item) => item.title.includes(term) || item.blocks.some((block) => JSON.stringify(block).includes(term))); const href = lesson ? learningHref(slug, lesson.slug) : learningHref(slug); return <article className={styles.card} key={term}><h2>{term}</h2><p>{description}</p><Link href={href}>{course?.title ?? "関連レッスン"}を読む →</Link></article>; })}</div>
  </main></ReferenceFrame>;
}
