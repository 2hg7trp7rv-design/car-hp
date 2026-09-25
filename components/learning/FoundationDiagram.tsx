import type { ReactNode } from "react";
import { DIAGRAM_TEXT } from "@/lib/learning";
import styles from "@/app/learn/learning.module.css";

export type FoundationKind = "four-strokes" | "displacement" | "two-air-paths" | "exhaust-parts" | "suspension-parts" | "tire-markings" | "disc-brake" | "battery-roles";
const ink = "#315675", blue = "#dceff6", pink = "#f9d6df", gold = "#f6dfa1";
function Drawing({ label, children, height = 280 }: { label: string; children: ReactNode; height?: number }) {
  return <svg viewBox={`0 0 320 ${height}`} role="img" aria-label={label} fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} textAnchor="middle" stroke="none" fill={ink}>{children}</text>;
}
function Caption({ children }: { children: ReactNode }) { return <p className={styles.drawingCaption}>{children}</p>; }
export function FoundationDiagram({ kind }: { kind: FoundationKind }) {
  if (kind === "four-strokes") return <figure className={styles.foundationFigure}>
    <figcaption>同じピストンを、四つの場面で見る</figcaption>
    <div className={styles.drawingGrid}>{[
      { title: "① 吸気", down: true, angle: 110, inlet: true, outlet: false, text: "吸気バルブが開き、ピストンが下がる。空気を取り込む。" },
      { title: "② 圧縮", down: false, angle: 300, inlet: false, outlet: false, text: "両方のバルブを閉じ、ピストンが上がる。混合気を圧縮する。" },
      { title: "③ 燃焼・膨張", down: true, angle: 440, inlet: false, outlet: false, text: "点火で燃焼が進み、圧力が上がる。ピストンが押し下げられる。" },
      { title: "④ 排気", down: false, angle: 640, inlet: false, outlet: true, text: "排気バルブが開き、ピストンが上がる。燃焼後のガスを押し出す。" },
    ].map((step, index) => {
      const angle = step.angle * Math.PI / 180;
      const pinX = 160 + 30 * Math.sin(angle), pinY = 228 - 30 * Math.cos(angle);
      const pistonY = pinY - Math.sqrt(115 ** 2 - (pinX - 160) ** 2) - 11;
      return <div key={step.title}><h3>{step.title}</h3><Drawing label={step.text} height={260}>
      <rect x="98" y="60" width="124" height={pistonY - 60} fill={index === 2 ? pink : blue} stroke="none"/>
      <path d="M95 180V60H104M132 60H188M216 60H225V180"/>
      <path d={`M118 30V${step.inlet ? 76 : 60}m-14 0h28M202 30V${step.outlet ? 76 : 60}m-14 0h28`}/>
      <path d="M160 32V58" stroke="#a47423"/><Label x={160} y={22}>点火プラグ</Label>
      {step.inlet && <path d="M57 48H110V68L98 83H111m-6-6 6 6-6 6" stroke="#218696"/>}
      {step.outlet && <path d="M213 88H224L210 68V48H274m-8-8 8 8-8 8" stroke="#c14f69"/>}
      {index === 2 && <path d="m154 60-8 18h12l-7 18 23-25h-13l6-11" fill="#eaaa39" stroke="none"/>}
      <path d={`M160 ${pistonY + 11}L${pinX} ${pinY}L160 228`} strokeWidth="7"/>
      <rect x="98" y={pistonY} width="124" height="22" rx="3" fill={gold}/>
      <circle cx="160" cy="228" r="30"/><circle cx={pinX} cy={pinY} r="4" fill={ink}/><circle cx="160" cy="228" r="4" fill={ink}/>
      <path d={step.down ? "M254 115V158m-8-10 8 10 8-10" : "M254 158V115m-8 10 8-10 8 10"} stroke="#218696"/>
      <Label x={55} y={157}>ピストン</Label><path d={`M82 153L99 ${pistonY + 10}`} strokeWidth="1"/>
    </Drawing><Caption>{step.text}</Caption></div>;})}</div>
    <p className={styles.note}>4ストロークのガソリンエンジンの基本を示す模式図。1気筒の4行程でクランク軸は2回転します。燃料噴射の位置・時期、実際のバルブ開閉時期や点火時期は省略。下の棒が連接棒、その先がクランク軸です。</p>
  </figure>;
  if (kind === "displacement") return <figure className={styles.foundationFigure}><figcaption>数えるのは、ピストンが動く部分の体積</figcaption><div className={styles.drawingGrid}>
    <div><Drawing label="シリンダーの中でピストンが上端から下端まで動く範囲を青く示した断面図。上端より上の燃焼室の空間は排気量に含めない。">
      <path d="M82 220V50H228V220" fill="#fff"/><path d="M85 91H225V185H85Z" fill={blue} stroke="none"/>
      <path d="M85 91H225" strokeDasharray="6 6"/><rect x="85" y="185" width="140" height="24" fill={gold}/><path d="M155 209V257" strokeWidth="8"/>
      <path d="M252 92V185m-6-86 6-7 6 7m-12 79 6 7 6-7"/>
      <Label x={155} y={141}>行程容積</Label><Label x={155} y={35}>上の空間は含めない</Label><Label x={155} y={78}>上端</Label><Label x={155} y={177}>下端</Label>
    </Drawing><Caption>上端と下端の間の体積。エンジン全体の外寸や、燃料を入れる容量ではありません。</Caption></div>
    <div><Drawing label="説明用の4気筒例。1気筒500立方センチメートルを4個合計すると2000立方センチメートル、2.0リットルになる。" height={280}>
      {[0, 1, 2, 3].map(i => <g key={i} transform={`translate(${20 + i * 76} 55)`}><rect width="54" height="100" rx="12" fill={blue}/><path d="M0 68H54"/><Label x={27} y={43}>500</Label><Label x={27} y={62}>cm³</Label></g>)}
      <Label x={160} y={205}>500 × 4 ＝ 2,000cm³</Label><Label x={160} y={240}>＝ 2.0L</Label>
    </Drawing><Caption>各気筒の容積を足した値が総排気量。図の数値は説明用で、特定の車の仕様ではありません。</Caption></div>
  </div></figure>;
  if (kind === "two-air-paths") return <figure className={styles.foundationFigure}><figcaption>同じ「空気のフィルター」でも、行き先が違う</figcaption><div className={styles.drawingGrid}>
    {[{ title: "エンジンが使う空気", destination: "エンジン", filter: "エアクリーナー", color: gold }, { title: "人が過ごす室内の空気", destination: "車内の吹き出し口", filter: "エアコンフィルター", color: blue }].map(item => <div key={item.filter}><h3>{item.title}</h3><Drawing label={`${item.filter}を通る空気は${item.destination}へ進む。`} height={260}>
      <path d="M30 67H104m-9-8 9 8-9 8M218 67H285m-9-8 9 8-9 8" stroke="#218696"/>
      <rect x="112" y="27" width="96" height="80" rx="7" fill={item.color}/>
      <path d="m123 38 12 58 12-58 12 58 12-58 12 58 12-58" strokeWidth="2"/>
      <Label x={160} y={142}>{item.filter}</Label><path d="M285 87V183H244m9-8-9 8 9 8"/>
      <rect x="31" y="165" width="202" height="62" rx="13" fill={item.color}/><Label x={132} y={203}>{item.destination}</Label>
    </Drawing></div>)}
  </div><p className={styles.note}>通路の違いを示す概念図。実車の配置図ではありません。室内側は外気／内気の切り替えがあり、フィルターの位置や装備の有無は車種で異なります。</p></figure>;
  if (kind === "exhaust-parts") return <figure className={styles.foundationFigure}><figcaption>排気の出口までに、違う仕事をする部品がある</figcaption><Drawing label={DIAGRAM_TEXT[kind]} height={380}>
    <rect x="36" y="25" width="108" height="65" rx="12" fill={pink}/><Label x={90} y={65}>エンジン</Label><path d="M144 56H220V123" strokeWidth="14"/>
    <rect x="171" y="122" width="100" height="67" rx="20" fill={gold}/><path d="M188 140H253M188 153H253M188 166H253" strokeWidth="2"/>
    <Label x={87} y={155}>触媒</Label><path d="M115 150H163" strokeWidth="1"/>
    <path d="M221 189V218H106V245" strokeWidth="14"/><path d="M166 218H124m9-8-9 8 9 8" stroke="#fbe2a6"/>
    <rect x="38" y="245" width="140" height="72" rx="17" fill={blue}/><path d="M59 248V291H155V313M85 248V278H172"/>
    <Label x={245} y={278}>消音器</Label><path d="M182 277H207" strokeWidth="1"/>
    <path d="M105 318V348H270m-9-8 9 8-9 8"/><Label x={223} y={371}>車外へ</Label>
  </Drawing><p className={styles.note}>ガソリン車の排気経路を折り返して描いた模式図。消音器内部は一例を単純化。触媒・消音器の数、位置、構造は車ごとに異なります。</p></figure>;
  if (kind === "suspension-parts") return <figure className={styles.foundationFigure}><figcaption>車体と車輪の間を、役割で見分けよう</figcaption><Drawing label={DIAGRAM_TEXT[kind]} height={330}>
    <path d="M25 44H295" strokeWidth="14"/><Label x={160} y={27}>車体側</Label>
    <path d="M110 53V68l-23 14 46 20-46 20 46 20-46 20 23 13V199" stroke="#ba872f" strokeWidth="6"/>
    <path d="M165 52V96" strokeWidth="7"/><rect x="153" y="96" width="24" height="80" rx="5" fill={blue}/><path d="M165 176V199" strokeWidth="7"/>
    <path d="M72 207H201M196 198V264L267 226" strokeWidth="7"/><circle cx="267" cy="226" r="7" fill={ink}/>
    <rect x="42" y="199" width="71" height="94" rx="24" fill="#e2e8ed"/><path d="M56 213V279M70 210V282M86 213V279" strokeWidth="2"/>
    <path d="M20 306H300" strokeWidth="4"/><Label x={52} y={131}>ばね</Label><path d="M74 126H87" strokeWidth="1"/>
    <Label x={241} y={125}>ダンパー</Label><path d="M179 123H200" strokeWidth="1"/>
    <Label x={231} y={289}>アーム</Label><path d="M234 269V248" strokeWidth="1"/>
  </Drawing><p className={styles.note}>役割を分けた配置の模式図で、特定のサスペンション方式の設計図ではありません。ばねとダンパーが同軸の車も、離れた車もあります。アームは車輪を固定して動けなくするのではなく、動ける方向を導きます。</p></figure>;
  if (kind === "tire-markings") return <figure className={styles.foundationFigure}><figcaption>タイヤの横の文字を、一つずつ読む</figcaption><div className={styles.drawingGrid}><div><Drawing label="タイヤの側面に195/65R15 91Hという表示がある例。トレッドは路面と接する外周、ホイールは内側の金属部分。">
    <circle cx="160" cy="130" r="100" fill="#e2e8ed"/><circle cx="160" cy="130" r="53" fill="#fff"/>
    {[0, 72, 144, 216, 288].map(angle => <path key={angle} d="M160 90V115" transform={`rotate(${angle} 160 130)`}/>)}
    <Label x={160} y={64}>195/65R15 91H</Label><Label x={160} y={257}>文字は側面（サイドウォール）</Label>
  </Drawing></div><dl className={styles.diagramKey}>{[["195", "タイヤ幅の呼び（mm）"], ["65", "高さ ÷ 幅 × 100（%）"], ["R", "ラジアル構造"], ["15", "リム径（インチ）"], ["91", "負荷能力の指数。91kgではない"], ["H", "速度記号。推奨走行速度ではない"]].map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl></div><p className={styles.note}>表示の読み方の例。実際の装着可否は車両指定、負荷能力、空気圧、ホイールとの組み合わせで確認します。図の比率は寸法の再現ではありません。</p></figure>;
  if (kind === "disc-brake") return <figure className={styles.foundationFigure}><figcaption>挟む相手はディスク。路面に触れるのはタイヤ</figcaption><div className={styles.drawingGrid}><div><Drawing label="ディスクの断面を左右からパッドが挟む。キャリパーがパッドを押し付ける。" height={280}>
    <path d="M67 210V54H253V210" strokeWidth="16"/><rect x="149" y="91" width="22" height="171" fill={blue}/>
    <rect x="117" y="101" width="23" height="111" rx="4" fill={pink}/><rect x="180" y="101" width="23" height="111" rx="4" fill={pink}/>
    <path d="M82 153H112m-8-8 8 8-8 8M237 153H207m8-8-8 8 8 8" stroke="#c14f69"/>
    <Label x={160} y={31}>キャリパー</Label><Label x={67} y={250}>パッド</Label><path d="M96 244L124 213" strokeWidth="1"/>
    <Label x={245} y={250}>ディスク</Label><path d="M214 244H173" strokeWidth="1"/>
  </Drawing><Caption>車輪と一緒に回るディスクを、パッドが摩擦で減速させます。</Caption></div><div><Drawing label="車体は右に進み、制動中に路面からタイヤが受ける力は左向き。" height={280}>
    <circle cx="160" cy="134" r="80" fill="#e2e8ed"/><circle cx="160" cy="134" r="42" fill={blue}/><rect x="190" y="115" width="17" height="38" fill={pink}/>
    <path d="M33 221H288M191 236H81m10-8-10 8 10 8" strokeWidth="4"/><path d="M55 27H256m-9-8 9 8-9 8"/>
    <Label x={156} y={16}>車が進む向き</Label><Label x={160} y={269}>路面から受ける制動力 ←</Label>
  </Drawing><Caption>タイヤと路面の間で力を伝えられる範囲にも、限りがあります。</Caption></div></div><p className={styles.note}>一般的なディスクブレーキの模式図。ドラムブレーキや回生ブレーキはこの断面図の対象外です。右図の矢印は制動中に路面からタイヤへ働く力を示します。</p></figure>;
  return <figure className={styles.foundationFigure}><figcaption>12Vバッテリーは、電気をためて渡す役</figcaption><div className={styles.drawingGrid}>{[
    { title: "エンジンをかけるとき", top: "12Vバッテリー", bottom: "スターター", text: "蓄えた電気で始動用モーターを回す。制御装置にも電源が必要。" },
    { title: "エンジンが動いているとき", top: "発電機", bottom: "電装品・バッテリー", text: "発電した電気で電装品を動かし、条件に応じてバッテリーを充電する。" },
  ].map(item => <div key={item.title}><h3>{item.title}</h3><Drawing label={item.text} height={210}><rect x="51" y="19" width="218" height="60" rx="10" fill={gold}/><Label x={160} y={56}>{item.top}</Label><path d="M160 84V123m-8-9 8 9 8-9"/><rect x="40" y="133" width="240" height="60" rx="10" fill={blue}/><Label x={160} y={171}>{item.bottom}</Label></Drawing><Caption>{item.text}</Caption></div>)}</div><p className={styles.note}>一般的なエンジン車の概念図。ハイブリッド車・電気自動車では高電圧側から電圧を変えて補機用電源を供給する方式などがあり、始動・充電の構成は同じではありません。</p></figure>;
}
