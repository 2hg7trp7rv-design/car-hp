//  app/used/page.tsx
import { SectionCard } from "@/components/section-card";

const usedBlocks = [
  {
    title: "まずは「予算」と「リスク許容度」を決める",
    description:
      "年式や走行距離、保証の有無などによって、中古車のリスクとコストは大きく変わります。「多少トラブル覚悟で安く乗りたい」のか「多少高くても安心重視」なのか、スタンスを明確にするところから始めます。",
    badge: "STEP 1",
  },
  {
    title: "買う場所ごとの特徴を知る",
    description:
      "ディーラー中古車、認定中古車、専門店、一般中古車店、個人売買。それぞれの得意分野と注意点を整理し、自分の候補車に合う買い方を選びやすくしていきます。",
    badge: "STEP 2",
  },
  {
    title: "チェックすべきポイントを絞り込む",
    description:
      "事故歴や修復歴だけでなく、タイヤ、ブレーキ、足回り、電装系など、見落とされがちなポイントも含めて「ここだけは見ておきたい」という項目をまとめていきます。",
    badge: "STEP 3",
  },
];

export default function UsedPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SectionCard
        eyebrow="USED CAR GUIDE"
        title="中古車選びのリアルと付き合い方"
        highlight="価格だけで判断しないための、中古車との向き合い方を整理する"
        description="このセクションでは、中古車を選ぶときに押さえておきたいポイントや、ディーラー・専門店・個人売買など買う場所ごとの違い、輸入車と国産車で変わるリスクの大きさなどを、できるだけ具体的に整理していきます。単に「安く買う」のではなく、「自分にとって気持ちよく付き合える中古車」を見つけるための視点を提供します。"
      />

      <section className="space-y-4">
        <h2 className="serif-font text-lg font-semibold text-slate-900 sm:text-xl">
          中古車選びで大事にしたい3つのステップ
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {usedBlocks.map((block) => (
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

      <section className="mt-2 space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-xs text-slate-700 sm:text-sm">
        <h2 className="serif-font text-sm font-semibold text-slate-900">
          今後予定している具体的なコンテンツ
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>走行距離と年式の「落としどころ」を考えるための目安表</li>
          <li>輸入車中古を狙うときに押さえたいメンテナンスコストのイメージ</li>
          <li>試乗時にチェックしたいポイントと、試乗ができないときの代替方法</li>
          <li>保証内容の読み解き方と、延長保証を付けるかどうかの判断軸</li>
        </ul>
      </section>
    </main>
  );
}
