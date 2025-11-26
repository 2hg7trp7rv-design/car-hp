// app/guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "ガイド | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険・お金の話など、クルマとの暮らしを少し楽にする実用ガイドをまとめました。",
};

const guideSections = [
  {
    id: "buy",
    label: "買い方のガイド",
    description:
      "初めての一台選びから、乗り換えタイミングの見極め方まで。「失敗しないクルマ選び」の基本を押さえます。",
    topics: [
      "予算の決め方と総支払額の考え方",
      "新車と中古車、どちらが自分向きか",
      "ディーラーと中古車店、それぞれのメリット",
      "試乗のポイントとチェックリスト",
    ],
  },
  {
    id: "own",
    label: "維持費とお金のリアル",
    description:
      "税金・保険・車検・燃料費など、毎月／毎年いくらかかるのかを整理し、「無理のないクルマとの付き合い方」を考えます。",
    topics: [
      "自動車税・重量税・自賠責のざっくり感覚",
      "任意保険の選び方と見直しポイント",
      "車検・点検でかかる費用感",
      "ガソリン車／ディーゼル／ハイブリッドのランニングコスト",
    ],
  },
  {
    id: "sell",
    label: "売り方・乗り換えのコツ",
    description:
      "下取りと買取店の違いや、売るタイミング、残クレやローンが残っている時の注意点などを整理します。",
    topics: [
      "ディーラー下取りと買取専門店の違い",
      "高く売れるタイミングと条件",
      "ローン残債がある車を売るときの流れ",
      "事故歴・修復歴の扱いと相場への影響",
    ],
  },
  {
    id: "trouble",
    label: "トラブル・修理と付き合う",
    description:
      "故障や不具合が出たときに、慌てずに状況を整理して動くための「心構え」と「連絡の順番」をまとめます。",
    topics: [
      "まず確認したいポイント（警告灯・症状・状況）",
      "ディーラーと専門店、どちらに相談するか",
      "見積書の読み方とセカンドオピニオン",
      "保証・延長保証・保険修理の基本",
    ],
  },
  {
    id: "life",
    label: "クルマとの暮らしを整える",
    description:
      "駐車場選びや洗車・コーティング、日常のメンテナンスなど、長く気持ちよく付き合うための小さな工夫を集めます。",
    topics: [
      "駐車場選びで気をつけたいこと",
      "洗車・コーティングの考え方",
      "タイヤ・ホイールの選び方と寿命",
      "日常点検で見ておくと安心なポイント",
    ],
  },
];

export default function GuideIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* ヘッダー */}
        <header className="mb-10 space-y-4 sm:mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub sm:text-xs">
            GUIDE
          </p>
          <h1 className="text-2xl font-semibold tracking-[0.08em] text-text-main sm:text-[26px]">
            クルマとの暮らしを少し楽にする
            <br className="hidden sm:block" />
            実用ガイドのコレクション
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
            「どのクルマを選ぶか」だけでなく、「どう付き合っていくか」まで。
            お金・維持費・売り方・トラブル対応など、オーナー目線で気になるテーマを
            一つずつ整理していく予定です。
          </p>
        </header>

        {/* サマリーカード */}
        <section className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <GlassCard padding="lg" className="h-full">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-text-sub">
                OVERVIEW
              </p>
              <h2 className="text-sm font-semibold tracking-[0.12em] text-text-main sm:text-[15px]">
                「よく分からない」を、少しずつ言葉にする場所
              </h2>
              <p className="text-xs leading-relaxed text-text-sub sm:text-[13px]">
                見積書の見方、ローンや残クレの仕組み、保険の選び方、
                修理の優先順位のつけ方…。クルマの世界には、なんとなく
                聞きづらいけれど、知らないと損をしがちなトピックがたくさんあります。
                ここでは、そうした「グレーゾーンの疑問」を少しずつ解きほぐしていきます。
              </p>
            </div>
          </GlassCard>

          <GlassCard padding="lg" className="h-full">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-2 text-[11px] text-text-sub sm:text-xs">
                <p className="uppercase tracking-[0.22em]">HOW TO USE</p>
                <p>
                  まずは気になるテーマのカードから眺めてみてください。
                  詳細なガイドやコラムが増え次第、このページから直接リンクしていきます。
                </p>
              </div>
              <div className="text-[11px] text-text-sub sm:text-xs">
                <p className="font-medium text-text-main">
                  COLUMNやCARSページとも連動予定
                </p>
                <p className="mt-1">
                  実際のオーナー体験記や特定車種のページとも紐づけ、
                  「気になったクルマのリアルな維持費」なども分かりやすく整理していく計画です。
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* テーマ一覧 */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-text-main sm:text-sm">
              ガイドのテーマ
            </h2>
            <Link
              href="/column"
              className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
            >
              関連コラムを読む
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {guideSections.map((section) => (
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
                  {section.topics.map((topic) => (
                    <li key={topic} className="flex gap-2">
                      <span className="mt-[6px] h-[1px] w-4 flex-none bg-slate-300" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-3 text-[11px] text-text-sub sm:text-xs">
                  <span className="rounded-full bg-white/80 px-3 py-1">
                    今後、詳細ガイドとテンプレート類を順次追加予定
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
