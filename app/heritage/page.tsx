// app/heritage/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "ヘリテージとブランドストーリー | CAR BOUTIQUE",
  description:
    "名車の系譜やブランドの歴史、技術の節目となったモデルを静かに眺めるためのアーカイブ。ニュースやコラムと行き来しながら、クルマの「背景」に触れられるヘリテージページです。",
};

const eras = [
  {
    id: "classic",
    label: "CLASSIC ERA",
    title: "クラシック時代の名車たち",
    description:
      "電子制御が少なかった時代のスポーツカーやラグジュアリーサルーン。ダイレクトなフィーリングと、いま見ても美しい造形を持つモデルたちです。",
    examples: [
      "空冷ポルシェ911や初期のM3/M5など、ピュアスポーツの原点",
      "日本車黄金期を支えたスカイラインGT-Rやスープラ",
      "W124メルセデスや初代レクサスLSなどの耐久名車",
    ],
    linkLabel: "クラシック系のコラムを見る",
    linkHref: "/column?q=クラシック",
  },
  {
    id: "modern",
    label: "MODERN ERA",
    title: "モダンテクノロジーの到来",
    description:
      "ダウンサイジングターボやハイブリッド、電子制御デフなど、性能と効率を両立させるための技術が一気に進化した時代です。",
    examples: [
      "ダウンサイジングターボ＋多段ATの高効率パワートレーン",
      "ハイブリッドや電動化技術による静粛性と燃費の進化",
      "運転支援システムやコネクテッド機能の普及",
    ],
    linkLabel: "技術解説系のコラムを見る",
    linkHref: "/column?category=TECHNICAL",
  },
  {
    id: "future",
    label: "FUTURE ERA",
    title: "これからのヘリテージをつくるクルマ",
    description:
      "いま販売されているモデルの中から、10年後に『あれは名車だったね』と語られそうな一台を探す視点です。",
    examples: [
      "電動化時代の初期EV/PHVフラッグシップモデル",
      "内燃機関として完成度の高い最後の世代といわれるエンジン車",
      "デザインやパッケージングに強い個性を持つニッチモデル",
    ],
    linkLabel: "CARSページで候補を眺める",
    linkHref: "/cars",
  },
];

const makerFocus = [
  {
    id: "bmw",
    maker: "BMW",
    headline: "スポーツセダンの文脈で見るBMW",
    body: "3シリーズや5シリーズを中心に、『実用と走り』のバランスをどう取ってきたかという視点で歴代モデルを眺めます。Mモデルだけでなく、一般グレードの変遷も追いかけていく予定です。",
    linkLabel: "BMW関連のニュース一覧へ",
    linkHref: "/news?maker=BMW",
  },
  {
    id: "toyota",
    maker: "TOYOTA",
    headline: "大衆車から世界戦略車までのトヨタ",
    body: "カローラやクラウン、そしてGRブランドまで。『壊れないクルマ』から『走りも楽しいクルマ』へと振り幅を広げてきたトヨタの流れを、ニュースやコラムと紐づけて整理していきます。",
    linkLabel: "トヨタ車のCARSページを見る",
    linkHref: "/cars?maker=TOYOTA",
  },
];

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-10 space-y-4 sm:mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub sm:text-xs">
            HERITAGE
          </p>
          <h1 className="text-2xl font-semibold tracking-[0.08em] text-text-main sm:text-[26px]">
            名車の系譜とブランドの物語を
            <br className="hidden sm:block" />
            静かに眺めるためのアーカイブ
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
            スペックや新車情報だけでは見えてこない、「クルマの背景」の部分を少しずつ整理していく場所です。
            歴代モデルの流れ、ブランドごとの哲学、技術が大きく変わった転換点などを、
            ニュースやコラム、CARSページと行き来しながら楽しめるようにしていきます。
          </p>
        </header>

        {/* 概要＋使い方カード */}
        <section className="mb-12 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <GlassCard padding="lg" className="h-full">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub sm:text-xs">
                OVERVIEW
              </p>
              <h2 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                「一台」ではなく「流れ」でクルマを見る
              </h2>
              <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                たとえばBMW5シリーズなら、E39・E60・F10・G30といった各世代。
                一台だけを見るのではなく、どう変わってきたかという「連続した流れ」で眺めると、
                そのブランドが何を大事にしてきたかが見えてきます。
              </p>
              <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                HERITAGEでは、そうした系譜や文脈を、コラムやニュースへのリンクと合わせて
                ゆっくり辿っていけるようなアーカイブを目指します。
              </p>
            </div>
          </GlassCard>

          <GlassCard padding="lg" className="h-full">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-2 text-[11px] text-text-sub sm:text-xs">
                <p className="uppercase tracking-[0.22em]">HOW TO USE</p>
                <p>
                  まずは下の「時代別に見る」「メーカーごとに見る」などから、
                  気になる切り口のカードを選んでください。
                  詳細な系譜記事や年表、コラムが増え次第、このページから直接飛べるようにしていきます。
                </p>
              </div>
              <div className="text-[11px] text-text-sub sm:text-xs">
                <p className="font-medium text-text-main">
                  NEWS・COLUMN・CARSのハブとして
                </p>
                <p className="mt-1">
                  「このニュースは、あの世代の後継だな」「このCARSページのモデルは、
                  同じ系譜のどの位置にあるんだろう」といった視点で行き来できるように、
                  各セクションへの導線もここから伸ばしていきます。
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* 時代別カード */}
        <section className="mb-12 space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-text-main sm:text-sm">
              時代別に見るヘリテージ
            </h2>
            <Link
              href="/column?category=TECHNICAL"
              className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
            >
              技術解説や歴史系コラムへ
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {eras.map((era) => (
              <GlassCard
                key={era.id}
                padding="lg"
                interactive
                className="flex h-full flex-col"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-sub">
                    {era.label}
                  </p>
                  <h3 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                    {era.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                    {era.description}
                  </p>
                </div>

                <ul className="mt-4 space-y-1.5 text-[11px] text-text-sub sm:text-xs">
                  {era.examples.map((ex) => (
                    <li key={ex} className="flex gap-2">
                      <span className="mt-[6px] h-[1px] w-4 flex-none bg-slate-300" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 text-[11px] text-text-sub sm:text-xs">
                  <Link
                    href={era.linkHref}
                    className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 underline-offset-4 hover:bg-white hover:underline"
                  >
                    {era.linkLabel}
                    <span className="ml-1 text-[10px]">→</span>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* メーカー別フォーカス */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-text-main sm:text-sm">
              メーカーごとのストーリーで眺める
            </h2>
            <Link
              href="/cars"
              className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
            >
              すべてのCARS一覧へ
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {makerFocus.map((block) => (
              <GlassCard
                key={block.id}
                padding="lg"
                interactive
                className="flex flex-col"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-sub">
                    {block.maker}
                  </p>
                  <h3 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                    {block.headline}
                  </h3>
                  <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                    {block.body}
                  </p>
                </div>

                <div className="mt-4 pt-3 text-[11px] text-text-sub sm:text-xs">
                  <Link
                    href={block.linkHref}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-white underline-offset-4 hover:bg-slate-800"
                  >
                    {block.linkLabel}
                    <span className="ml-1 text-[10px]">→</span>
                  </Link>
                </div>
              </GlassCard>
            ))}

            {/* 汎用ブロック: 将来の拡張の説明 */}
            <GlassCard padding="lg" className="md:col-span-2">
              <div className="flex flex-col gap-3 text-[11px] text-text-sub sm:text-xs md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-text-main">
                    将来的には「系譜年表」や「世代比較」コンテンツと連動
                  </p>
                  <p className="mt-1">
                    たとえばBMW5シリーズやトヨタクラウンなど、主要モデルについては
                    「世代ごとの違い」「中古車として狙い目の年式」などを
                    年表形式でまとめる計画です。
                  </p>
                </div>
                <div>
                  <Link
                    href="/news"
                    className="inline-flex items-center rounded-full border border-tiffany-400/70 bg-white/80 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-tiffany-700 hover:bg-white"
                  >
                    まずはNEWSから最新動向をチェック
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}
