// app/heritage/page.tsx
export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "ヘリテージと名車たち | CAR BOUTIQUE",
  description:
    "ブランドの歴史や名車のストーリーを、静かなデジタルブティックのような世界観でたどるための入り口です。",
};

const heritageSections = [
  {
    id: "brand",
    label: "ブランドの物語",
    description:
      "BMW・メルセデス・ポルシェ・トヨタなど、主要ブランドの成り立ちや哲学、代表的なモデルの系譜をゆっくり紐解いていきます。",
    notes: [
      "ブランドごとの「らしさ」を生むデザインと走りの思想",
      "ロゴやグリル、テールランプなどアイコンの変遷",
      "名作エンジンやシャシーにまつわるエピソード",
    ],
  },
  {
    id: "iconic",
    label: "アイコン的なモデルたち",
    description:
      "スカイラインGT-R、80スープラ、初代NSX、E39 5シリーズなど、時代を象徴するモデルを一台ずつ丁寧に取り上げます。",
    notes: [
      "当時のライバルとの関係性と立ち位置",
      "レースやモータースポーツでの実績",
      "現在の中古車市場での価値と評価",
    ],
  },
  {
    id: "era",
    label: "時代で振り返るクルマ史",
    description:
      "80年代のハイソカー、90年代のスポーツカーブーム、2000年代以降の環境対応など、時代ごとの空気とクルマの関係を並べて眺めます。",
    notes: [
      "社会や景気とクルマの関係性",
      "安全・環境規制がデザインに与えた影響",
      "日本独自の文化（VIP、ドリフト、軽自動車など）",
    ],
  },
  {
    id: "design",
    label: "デザインディテールの愉しみ",
    description:
      "ヘッドライトやテールの造形、インテリアの素材、メーターやスイッチの配置など、「写真を眺めているだけで楽しい部分」に少し寄り道します。",
    notes: [
      "世代ごとのデザインモチーフの変化",
      "インテリアの素材感と色使い",
      "ホイールやエンブレムなど、細部のこだわり",
    ],
  },
];

export default function HeritageIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-10 space-y-4 sm:mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub sm:text-xs">
            HERITAGE
          </p>
          <h1 className="text-2xl font-semibold tracking-[0.08em] text-text-main sm:text-[26px]">
            ブランドの歴史と、
            <br className="hidden sm:block" />
            名車たちのストーリーをゆっくり辿る
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
            スペックや新車価格だけでは見えてこない、「そのクルマが愛されてきた理由」や
            「ブランドが積み重ねてきた文脈」を静かに並べていくセクションです。
            まずは主要ブランドと、時代を象徴する数台から少しずつ増やしていきます。
          </p>
        </header>

        {/* コンセプトカード */}
        <section className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <GlassCard padding="lg" className="h-full">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub">
                CONCEPT
              </p>
              <h2 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                「カタログでは分からない部分」だけを、ゆっくり眺める場所
              </h2>
              <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                走りの良さや装備の充実度も大事ですが、
                長く好きでいられるクルマには、必ずどこかに「物語」があります。
                デザイン、音、匂い、当時の時代背景…。
                そういった要素を、できるだけ静かでフラットな目線で集めていきます。
              </p>
            </div>
          </GlassCard>

          <GlassCard padding="lg" className="h-full">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-2 text-[11px] text-text-sub sm:text-xs">
                <p className="uppercase tracking-[0.22em]">RELATION</p>
                <p>
                  CARSセクションの車種ページや、COLUMNの技術・歴史系記事と連動させながら、
                  一つのブランドや一台のクルマを、立体的に眺められるようにしていく予定です。
                </p>
              </div>
              <div className="space-y-2 text-[11px] text-text-sub sm:text-xs">
                <p className="font-medium text-text-main">まずは少数精鋭から</p>
                <p>
                  いきなり全ブランド・全車種を網羅するのではなく、
                  思い入れの強い数台から、丁寧に記事を増やしていく方針です。
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* セクション一覧 */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-text-main sm:text-sm">
              これから増やしていくコンテンツの軸
            </h2>
            <Link
              href="/cars"
              className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
            >
              車種ページから名車を探す
            </Link>
          </div>

        <div className="grid gap-4 md:grid-cols-2">
          {heritageSections.map((section) => (
            <GlassCard
              key={section.id}
              padding="lg"
              interactive
              className="flex flex-col"
            >
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-text-sub">
                  {section.id.toUpperCase()}
                </p>
                <h3 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                  {section.label}
                </h3>
                <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                  {section.description}
                </p>
              </div>

              <ul className="mt-4 space-y-1.5 text-[11px] text-text-sub sm:text-xs">
                {section.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="mt-[6px] h-[1px] w-4 flex-none bg-slate-300" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 text-[11px] text-text-sub sm:text-xs">
                <span className="rounded-full bg-white/80 px-3 py-1">
                  まずは数本のロングコラムから、順次追加予定
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
        </section>
      </div>
    </main>
  );
}
