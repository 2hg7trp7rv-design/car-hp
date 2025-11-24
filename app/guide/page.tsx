// app/guide/page.tsx
import { SectionCard } from "@/components/section-card";

const guideBlocks = [
  {
    title: "新車か中古かを決める前に",
    description:
      "予算だけでなく、保証や安全装備、ライフスタイルとの相性まで含めて整理します。まずは「何年くらい乗るつもりか」「誰とどこへ行くクルマか」を言語化するところから。",
    badge: "BUYING",
  },
  {
    title: "支払い方法とローンの考え方",
    description:
      "頭金ゼロのフルローンが本当に自分に合っているのか、残価設定ローンやリースのメリット・デメリットを整理し、無理のない月々の支払いラインを一緒に考えます。",
    badge: "MONEY",
  },
  {
    title: "下取りと買取の使い分け",
    description:
      "ディーラー下取りと専門店買取、それぞれの強みと弱みを整理し、「今のクルマをどう手放すか」で損をしないための押さえるべきポイントを解説します。",
    badge: "SELLING",
  },
  {
    title: "維持費のざっくりシミュレーション",
    description:
      "税金・保険・車検・タイヤ・消耗品。国産コンパクトから輸入セダンまで、ざっくりとした維持費イメージを持ってから候補車を絞り込むと、後悔のリスクを減らせます。",
    badge: "COST",
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SectionCard
        eyebrow="GUIDE"
        title="買い方・売り方・維持費のリアルガイド"
        highlight="クルマ選びを「感情」と「お金」の両方から整理するための入り口"
        description="このセクションでは、クルマの買い方・売り方・維持費を、日本の実情に合わせてできるだけフラットに解説していきます。営業トークでも口コミの噂話でもなく、数字と経験の両方から「自分に合う選び方」を組み立てるための土台を用意します。"
      />

      <section className="space-y-4">
        <h2 className="serif-font text-lg font-semibold text-slate-900 sm:text-xl">
          まず最初に押さえておきたい4つの視点
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          どんなクルマを選ぶにしても、最初に整理しておくと失敗しにくいのが
          「用途」「お金」「手放し方」「維持費」の4つの視点です。このサイトでは、
          できるだけ専門用語を減らしながら、それぞれを深掘りしていきます。
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {guideBlocks.map((block) => (
            <article
              key={block.title}
              className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/85 p-4 text-sm text-slate-700 shadow-[0_14px_35px_rgba(15,23,42,0.16)] backdrop-blur"
            >
              <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-teal-700">
                <span className="rounded-full bg-teal-50 px-2 py-0.5">
                  {block.badge}
                </span>
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-slate-900">
                {block.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-3 rounded-2xl border border-teal-100/70 bg-teal-50/70 p-4 text-xs text-slate-700 sm:text-sm">
        <h2 className="serif-font text-sm font-semibold text-teal-900">
          今後追加していく予定のコンテンツ
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>年収別・ライフステージ別の「背伸びしすぎないクルマの選び方」</li>
          <li>新車ディーラーとの上手な付き合い方と、値引き交渉の基本スタンス</li>
          <li>個人売買やネットオークションを使うときのリスクと注意点</li>
          <li>輸入車と国産車で変わる「5年後の手放しやすさ」と残価感覚</li>
        </ul>
      </section>
    </main>
  );
}
