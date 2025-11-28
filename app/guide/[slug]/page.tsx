// app/guide/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

type GuideSlug =
  | "loan-or-lump-sum"
  | "maintenance-cost-simulation"
  | "selling-without-rush";

type GuideSection = {
  id: string;
  label: string;
  summary?: string;
  paragraphs: string[];
  bullets?: string[];
};

type GuideContent = {
  slug: GuideSlug;
  title: string;
  lead: string;
  categoryLabel: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  sections: GuideSection[];
};

// ---- ガイド本文データ --------------------------------------------------

const guides: Record<GuideSlug, GuideContent> = {
  "loan-or-lump-sum": {
    slug: "loan-or-lump-sum",
    title: "ローンか一括か。支払い方法を選ぶときの考え方",
    lead:
      "「現金一括のほうが正解」「ローンはもったいない」といった一般論だけでは、自分の家計に合った判断はできません。ここでは、金利負担だけでなく、手元資金・今後のライフイベント・出口戦略を含めて整理するための基本的な視点をまとめます。",
    categoryLabel: "お金と支払い計画",
    updatedAt: "2025-03-01",
    readingTimeMinutes: 8,
    sections: [
      {
        id: "basic-differences",
        label: "ローンと一括の「違い」を整理する",
        summary:
          "まずは感覚ではなく、仕組みとリスクの違いを冷静に見ておきます。",
        paragraphs: [
          "ローンと一括の違いは「金利が付くかどうか」だけに見えますが、実際にはキャッシュフローとリスクの置きどころが大きく変わります。",
          "一括購入の場合、支払いは一度きりで、その後は維持費だけを考えればよい状態になります。その代わり、まとまった現金が一度に減るため、急な出費やライフイベントへの備えが薄くなる可能性があります。",
          "ローンを利用する場合、手元資金を残したままクルマを先に手に入れられますが、金利負担と毎月の支払いが固定されます。将来の収入にある程度の見通しがあるかどうかが重要です。"
        ],
        bullets: [
          "一括：総支払額は最も少ないが、手元資金が大きく減る",
          "ローン：総支払額は増えるが、手元資金を厚く残せる",
          "どちらが「正しい」かではなく、家計全体のバランスで見る"
        ]
      },
      {
        id: "check-cash",
        label: "一括を検討するときのチェックポイント",
        summary: "「現金があるかどうか」ではなく、「残しておくべき額はいくらか」を基準に考えます。",
        paragraphs: [
          "一括購入を検討するときは、「今いくら持っているか」ではなく、「購入後にいくら残るか」を見ることが大切です。特に、生活防衛資金（数か月〜半年分の生活費）と、近い将来に予定されている大きな出費（教育費、引っ越し、住宅関連など）は優先して確保しておく必要があります。",
          "クルマは基本的に価値が減っていく資産です。現金をほぼすべてクルマに変えてしまうと、売却しない限り現金化できない状態になり、急な支出に対応しづらくなります。"
        ],
        bullets: [
          "購入後も、生活費 3〜6か月分程度の現金は残せるか",
          "今後 3年以内に大きな出費イベントが控えていないか",
          "クルマは「いつでも売ればいい」と言える状態か（市場流動性やローンの残債を含めて）"
        ]
      },
      {
        id: "loan-points",
        label: "ローンを使う場合に押さえておきたいこと",
        summary: "金利だけでなく、期間・残価設定・繰上げ返済のしやすさを確認します。",
        paragraphs: [
          "ローンを選ぶ場合、「金利 ○%」という表記だけで判断するのは危険です。支払総額に影響するのは、金利・借入期間・残価設定の有無など複数の要素です。",
          "残価設定ローンは、月々の支払いを抑えられる代わりに、最終回支払い時に「乗り換える／買い取る／返却する」のいずれかを選ぶ必要があります。数年後の自分の生活や、クルマの使い方の変化も踏まえて、どの選択肢を取りやすいかを想像しておくと安心です。",
          "また、繰上げ返済の可否と手数料も重要です。ボーナスや収入の変化に応じて早めに返済できる仕組みがあれば、金利負担を抑えつつ柔軟に対応できます。"
        ],
        bullets: [
          "支払総額（車両本体 + 手数料 + 金利）を数字で比較する",
          "残価設定ローンの場合、満了時の3つの選択肢を事前にイメージしておく",
          "繰上げ返済の条件（手数料・回数制限など）を確認する"
        ]
      },
      {
        id: "exit-strategy",
        label: "出口戦略を決めてから支払い方法を選ぶ",
        summary: "「何年乗るつもりか」「途中で手放したくなったときにどうするか」を先に決めておきます。",
        paragraphs: [
          "支払い方法は、クルマとの付き合い方とセットで考えると整理しやすくなります。例えば「3〜5年で乗り換える可能性が高い」のか、「故障やライフステージの変化がない限り、長く乗るつもり」なのかによって、最適なプランは変わります。",
          "短期間で乗り換える前提なら、残価設定ローンやリースのような「出口が最初から決まっている」プランがフィットするケースもあります。逆に、長く乗るつもりなら、シンプルな元利均等ローンや、余裕があれば一括に近づける形での繰上げ返済が候補になります。",
          "どの場合でも、「途中で手放したくなったときに、ローン残債と査定額のバランスがどうなりそうか」をざっくりイメージしておくと、後から慌てにくくなります。"
        ],
        bullets: [
          "自分は何年くらい乗るつもりかを、ざっくり決めておく",
          "途中売却時にローン残債がいくら残りそうか、販売店に相談しておく",
          "「乗り換え前提」か「乗りつぶし前提」かで、最適なプランが変わる"
        ]
      }
    ]
  },

  "maintenance-cost-simulation": {
    slug: "maintenance-cost-simulation",
    title: "維持費をざっくり月いくらで把握する",
    lead:
      "クルマの維持費は「思ったよりかかる」と感じることが多い一方で、要素ごとに分解してみると、大枠のイメージはそれほど複雑ではありません。ここでは、税金・保険・車検・消耗品などをシンプルな枠組みに分けて、月額ベースで把握するための考え方を説明します。",
    categoryLabel: "維持費とランニングコスト",
    updatedAt: "2025-03-01",
    readingTimeMinutes: 9,
    sections: [
      {
        id: "cost-components",
        label: "クルマの維持費を構成する主な要素",
        summary: "まずは「何にお金がかかっているのか」を整理します。",
        paragraphs: [
          "クルマの維持費は、大きく「毎年必ずかかる固定費」と「状態や使い方によって変動する費用」に分けられます。個別の項目を細かく覚えるよりも、この2つのグループで考えるほうが家計に落とし込みやすくなります。",
          "固定費には、自動車税・自賠責保険・任意保険の基本料・駐車場代などが含まれます。変動費には、ガソリンや電気代、タイヤ・オイルなどの消耗品、経年や走行距離に応じた修理費用などが含まれます。"
        ],
        bullets: [
          "固定費：税金、自賠責、任意保険、駐車場代 など",
          "変動費：燃料代、消耗品、突発的な修理費 など",
          "まずは「年間でいくらかかっているか」を把握するところから始める"
        ]
      },
      {
        id: "annual-to-monthly",
        label: "年単位の費用を月額に変換する",
        summary:
          "車検や税金のような「たまに大きくかかる費用」は、月割りにして考えると負担感が整理しやすくなります。",
        paragraphs: [
          "車検や自動車税のように、数年に一度まとまった金額が発生する費用は、そのタイミングだけを見ると負担が大きく感じられます。しかし、実際には日々の利用の積み重ねの結果として支払っている費用なので、月額に変換して考えると、家計とのバランスが取りやすくなります。",
          "たとえば、2年ごとの車検で 20万円かかっているなら、単純に月あたり約 8,000〜9,000円とみなすことができます。そこに自動車税、任意保険、駐車場代などを同じように月額換算して足し合わせると、「このクルマに乗るための最低限の固定コスト」が見えてきます。"
        ],
        bullets: [
          "車検費用 ÷ 24か月、自動車税 ÷ 12か月 という形で月額換算する",
          "任意保険・駐車場代などは、すでに月額で見ている場合が多い",
          "「クルマを持っているだけで毎月いくらかかっているか」を先に把握する"
        ]
      },
      {
        id: "maintenance-patterns",
        label: "メンテナンス費用のざっくり3パターン",
        summary:
          "輸入車や年式の古いクルマでは、数年単位で見たときのメンテナンスパターンをイメージしておくと安心です。",
        paragraphs: [
          "メンテナンス費用は、年によってばらつきがあります。ある年はオイル交換と簡単な消耗品だけで済む一方で、別の年には足回りや電子制御系の修理でまとまった金額が発生することもあります。",
          "そこで、年間の平均値ではなく「数年に一度、大きめの出費がある前提」で考えると、現実に近いイメージが持ちやすくなります。たとえば、3〜4年に一度 20〜30万円規模の整備が入ると仮定して、その分を月額に按分しておくと、心理的な余裕につながります。"
        ],
        bullets: [
          "年1〜2回の軽めのメンテナンスのみで済む年",
          "数年に一度、足回りや冷却系などでまとまった整備が発生する年",
          "突発的なトラブルに備えて、年間○万円程度の「予備枠」を用意しておく"
        ]
      },
      {
        id: "make-simple-model",
        label: "自分用のシンプルな維持費モデルを作る",
        summary:
          "細かい項目をすべて把握する必要はなく、ざっくりモデルを1つ持っておくことが大切です。",
        paragraphs: [
          "最終的には、細かな項目ごとの金額よりも、「このクルマに乗っていると月いくらくらいかかるのか」という一つの数字を持っていることが重要です。そこから、家賃や教育費、貯蓄などとのバランスを見て、今の生活に無理がないかを判断します。",
          "たとえば「固定費として月3万円、燃料や細かいメンテナンスで月1〜1.5万円、たまの大きな修理に備えて月1万円を積み立てる」というように、自分なりのモデルを作り、実際の支出と定期的に照らし合わせてみると、感覚がぶれにくくなります。"
        ],
        bullets: [
          "固定費 + 変動費 + 突発費の「合計月額」を1つの数字にまとめる",
          "実際の支出と年1回程度比較して、モデルを調整する",
          "この数字が、今後数年のライフプランと両立できるかを確認する"
        ]
      }
    ]
  },

  "selling-without-rush": {
    slug: "selling-without-rush",
    title: "急いで売らないための、乗り換え準備の進め方",
    lead:
      "クルマを手放すタイミングで慌てて決めてしまうと、条件の比較や情報収集に十分な時間を割けません。ここでは、下取り・買取・売却を検討するときに、数か月前から準備しておくとよいポイントを整理します。",
    categoryLabel: "売却・乗り換えの段取り",
    updatedAt: "2025-03-01",
    readingTimeMinutes: 7,
    sections: [
      {
        id: "start-early",
        label: "売却を意識したら、まず何をするか",
        summary:
          "「そろそろ乗り換えようか」と感じたタイミングから、少しずつ情報を集め始めます。",
        paragraphs: [
          "クルマを手放すときに「時間がなくて、言われた条件で決めるしかなかった」とならないためには、早めに準備を始めることが何より重要です。具体的には、乗り換えを意識した時点から、現時点での相場感と、自分のクルマの状態を把握しておくと余裕が生まれます。",
          "最近の査定サービスでは、走行距離や年式、グレードを入力するだけでおおよその買取価格帯が分かるものも増えています。必ずしも申し込みまで進める必要はなく、相場の「レンジ」を知るだけでも十分です。"
        ],
        bullets: [
          "オンラインで同じ車種・年式・走行距離の売り出し価格をざっと眺める",
          "過去の整備記録や車検証・保証書の場所を確認しておく",
          "乗り換え時期の希望（◯年◯月ごろ）を家族とも共有しておく"
        ]
      },
      {
        id: "compare-channels",
        label: "下取り・買取・売却の違いを押さえる",
        summary:
          "それぞれのメリット・デメリットを知ったうえで、自分に合いそうな選択肢を絞り込みます。",
        paragraphs: [
          "ディーラー下取りは、新車や認定中古車への乗り換えとセットで話が進むため、手続きが簡単でスケジュールも組みやすいのが特徴です。一方で、買取専門店や複数査定サービスに比べると、査定額が控えめになるケースもあります。",
          "買取専門店は、査定額が比較的高く出やすい代わりに、店舗ごとの条件比較や日程調整が必要になります。複数社の査定を一度に申し込めるサービスもありますが、短期間に多くの連絡が来ることによるストレスも考慮する必要があります。",
          "個人売買は、条件次第で最も高く売れる可能性がある一方で、トラブル対応や名義変更の手続きなど、すべてを自分で管理する負担が大きくなります。"
        ],
        bullets: [
          "下取り：手続きが簡単でスケジュールを合わせやすい",
          "買取：金額が出やすいが、店舗・サービスの比較が必要",
          "個人売買：高く売れる可能性はあるが、手間とリスクも大きい"
        ]
      },
      {
        id: "prepare-car",
        label: "査定前にやっておきたい準備",
        summary:
          "高額なカスタムをする必要はなく、プラス評価とマイナス評価の差を小さくすることを意識します。",
        paragraphs: [
          "査定額を大きく上げるための特別なテクニックよりも、「減点されるポイントを減らす」ことを意識するほうが現実的です。車内のゴミや不要物を片付け、簡単な洗車や車内清掃をしておくだけでも、印象は変わります。",
          "純正パーツから変更している部分がある場合は、可能であれば純正パーツも一緒に保管しておき、査定時に提示できるようにしておくと、評価が安定しやすくなります。また、過去の整備履歴が分かる書類がそろっていると、「きちんとメンテナンスされてきたクルマ」と判断されやすくなります。"
        ],
        bullets: [
          "車内外の簡単なクリーニングをして、マイナス印象を減らす",
          "純正ホイールやマフラーなどは可能な限り保管し、査定時に提示する",
          "整備手帳・領収書などをひとまとめにしておき、点検・修理履歴を説明できるようにする"
        ]
      },
      {
        id: "schedule",
        label: "スケジュールに余裕を持たせる",
        summary:
          "売却と納車のタイミングを調整しておくと、移動手段に困らずに次の一台を選べます。",
        paragraphs: [
          "乗り換えのときにもっとも慌ただしくなりやすいのが、「今のクルマの引き渡し」と「次のクルマの納車」のタイミングです。ここに余裕がないと、条件比較や試乗の時間が十分に取れず、結果的に「とりあえず即納できるクルマで決めてしまう」ことになりかねません。",
          "理想は、売却・下取りの予定日から逆算して、1〜2か月ほど前から候補車種のリストアップと試乗を始めておくことです。そのうえで、納車が遅れた場合の代車やレンタカーの手配など、移動手段の代替案もあらかじめ確認しておくと安心です。"
        ],
        bullets: [
          "売却予定日から逆算して、1〜2か月前には候補車種の検討を始める",
          "納車までの代替移動手段（家族のクルマ、レンタカー等）を事前に確認しておく",
          "「いつまでに決めなければならないか」の期限を自分で把握しておく"
        ]
      }
    ]
  }
};

// ---- メタデータ --------------------------------------------------------

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = params.slug as GuideSlug;
  const guide = guides[slug];

  if (!guide) {
    return {
      title: "ガイドが見つかりません | CAR BOUTIQUE",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  const description = guide.lead;

  return {
    title: `${guide.title} | GUIDE | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${guide.title} | GUIDE | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/guide/${encodeURIComponent(slug)}`,
    },
    twitter: {
      card: "summary",
      title: `${guide.title} | GUIDE | CAR BOUTIQUE`,
      description,
    },
  };
}

// ---- ページ本体 --------------------------------------------------------

export default async function GuideDetailPage({ params }: PageProps) {
  const slug = params.slug as GuideSlug;
  const guide = guides[slug];

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-20 sm:px-6 lg:flex-row lg:gap-16 lg:px-8">
        {/* 記事エリア */}
        <article className="w-full lg:w-[68%]">
          {/* パンくず */}
          <nav
            className="mb-4 text-[11px] text-slate-500"
            aria-label="パンくずリスト"
          >
            <Link href="/" className="hover:text-slate-800">
              HOME
            </Link>
            <span className="mx-1.5 text-slate-300">/</span>
            <Link href="/guide" className="hover:text-slate-800">
              GUIDE
            </Link>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="text-slate-400">DETAIL</span>
          </nav>

          {/* ヘッダー */}
          <Reveal>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.28em] text-tiffany-600">
              <span className="h-[1px] w-6 bg-tiffany-300" />
              <span>{guide.categoryLabel.toUpperCase()}</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-3xl lg:text-[2.1rem]">
              {guide.title}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {guide.updatedAt && (
                <span>
                  更新日{" "}
                  <time dateTime={guide.updatedAt}>
                    {guide.updatedAt}
                  </time>
                </span>
              )}
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>読む目安 {guide.readingTimeMinutes}分</span>
            </div>
          </Reveal>

          {/* リード文 */}
          <Reveal delay={200}>
            <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-[15px] sm:leading-[1.9]">
              {guide.lead}
            </p>
          </Reveal>

          {/* 各セクション */}
          <div className="mt-10 space-y-10">
            {guide.sections.map((section, idx) => (
              <Reveal key={section.id} delay={260 + idx * 80}>
                <section id={section.id}>
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    {section.label}
                  </h2>
                  {section.summary && (
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                      {section.summary}
                    </p>
                  )}

                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px] sm:leading-[1.9]">
                    {section.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {section.bullets && section.bullets.length > 0 && (
                    <GlassCard className="mt-4 border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[12px] text-slate-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {section.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </GlassCard>
                  )}
                </section>
              </Reveal>
            ))}
          </div>

          {/* 戻る */}
          <div className="mt-16 border-t border-slate-100 pt-8">
            <Link
              href="/guide"
              className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-tiffany-400">
                ←
              </span>
              GUIDE 一覧へ戻る
            </Link>
          </div>
        </article>

        {/* 目次エリア（PC） */}
        <aside className="hidden w-full max-w-xs lg:block">
          <div className="sticky top-24 space-y-4">
            <GlassCard className="border border-slate-200/70 bg-white/90 p-5 text-[11px]">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-slate-400">
                CONTENTS
              </p>
              <ul className="space-y-2">
                {guide.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-[11px] text-slate-700 transition-colors hover:text-tiffany-600"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="border border-slate-200/70 bg-white/90 p-5 text-[11px]">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-slate-400">
                RELATED LINKS
              </p>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/column"
                    className="text-slate-700 underline-offset-4 hover:text-tiffany-600 hover:underline"
                  >
                    コラム一覧（技術・メンテナンス）
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cars"
                    className="text-slate-700 underline-offset-4 hover:text-tiffany-600 hover:underline"
                  >
                    車種データベースで候補を確認
                  </Link>
                </li>
              </ul>
            </GlassCard>
          </div>
        </aside>
      </div>
    </main>
  );
}
