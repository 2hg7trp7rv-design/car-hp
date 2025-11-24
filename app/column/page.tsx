// app/column/page.tsx
import { SectionCard } from "@/components/section-card";

const columnCategories = [
  {
    title: "オーナーの本音ストーリー",
    description:
      "実際にオーナーとして乗っているからこそ分かる、カタログでは伝わらない「良さ」と「引っかかるところ」。長距離出張、街乗り中心、家族メインなど、使い方別のリアルを集めます。",
  },
  {
    title: "メンテナンスとトラブルの裏側",
    description:
      "故障や警告灯が点いた瞬間の不安、ディーラーと専門店の見積もりの違いなど、実体験ベースで「何が起きていたのか」をできるだけ分かりやすく解説していきます。",
  },
  {
    title: "技術・歴史・ブランドの物語",
    description:
      "エンジン、シャシー、デザイン哲学。クルマの裏側には、開発陣のこだわりや時代背景が必ずあります。難しい話をできるだけ噛みくだいて、物語として楽しめる形に整理します。",
  },
];

export default function ColumnPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SectionCard
        eyebrow="COLUMN"
        title="オーナー目線のコラムと物語"
        highlight="数字だけでは語れない、「クルマと人との距離感」の話を中心に"
        description="ここでは、スペック表やニュースでは見えてこない「オーナーの本音」「ちょっとマニアックな技術の話」「ブランドやモデルの背景にあるストーリー」を扱っていきます。少し長めだけれど、読み終わったあとにそのクルマが少し身近に感じられるようなコラムを目指します。"
      />

      <section className="space-y-4">
        <h2 className="serif-font text-lg font-semibold text-slate-900 sm:text-xl">
          どんなコラムを増やしていくか
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {columnCategories.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/85 p-4 text-sm text-slate-700 shadow-[0_14px_35px_rgba(15,23,42,0.16)] backdrop-blur"
            >
              <h3 className="mb-2 text-[15px] font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-xs text-slate-700 sm:text-sm">
        <h2 className="serif-font text-sm font-semibold text-slate-900">
          COLUMNとNEWS・CARSとの関係
        </h2>
        <p className="leading-relaxed">
          NEWSでは日々の動きを短く追いかけ、CARSでは車種ごとの情報を整理します。
          COLUMNでは、そのどちらにも入りきらない「体験」や「背景」を扱うことで、
          サイト全体としてクルマを立体的に捉えられるようにしていきます。
        </p>
      </section>
    </main>
  );
}
