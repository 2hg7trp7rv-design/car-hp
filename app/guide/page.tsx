// app/guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "GUIDE | クルマとの暮らしガイド | CAR BOUTIQUE",
  description:
    "買い方・売り方・維持費・保険・お金の話など、クルマとの暮らしを少し楽にするためのGUIDEをまとめていきます。",
};

const guides = [
  {
    id: "buying-first-imported-car",
    label: "BUYING",
    title: "初めての輸入車を買うときに押さえておきたい5つのポイント",
    summary:
      "『欲しい』だけで決めると後からしんどくなる。保証、整備履歴、維持費、保険、ローンの組み方まで、最初にチェックしておきたい基本事項を整理します。",
    href: "#",
    pill: "購入前チェックリスト",
  },
  {
    id: "maintenance-cost-basics",
    label: "COST",
    title: "維持費の内訳と、家計とのバランスの考え方",
    summary:
      "車検・点検・タイヤ・保険・税金。1年あたり・月あたりのざっくり目安を出しながら、『このクラスのクルマならどのくらいを見ておくと安心か』をまとめていきます。",
    href: "#",
    pill: "維持費の見える化",
  },
  {
    id: "sell-or-keep-decision",
    label: "SELLING",
    title: "手放すか悩んだときに考えたい、3つの判断軸",
    summary:
      "修理費が大きくなってきたときや、ライフスタイルが変わってきたとき。『直して乗る』『売って乗り換える』『一旦クルマを手放す』の判断軸を整理します。",
    href: "#",
    pill: "売却のタイミング",
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          GUIDE
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          クルマとの暮らしガイド
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          買い方・売り方・維持費・保険・お金のこと。
          「かっこいいから欲しい」と思ったあとに付いてくる現実的な部分を、
          オーナー目線でフラットに整理していくエリアです。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <GlassCard
            key={guide.id}
            as="article"
            interactive
            className="flex h-full flex-col p-4 sm:p-5"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  {guide.label}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1">
                  {guide.pill}
                </span>
              </div>

              <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                {guide.title}
              </h2>

              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                {guide.summary}
              </p>

              <div className="mt-4">
                <Link
                  href={guide.href}
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  詳細ガイドは順次公開予定です
                </Link>
              </div>
            </div>
          </GlassCard>
        ))}
      </section>

      <section className="mt-10">
        <GlassCard className="p-4 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
            NOTE
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-[13px]">
            GUIDEコンテンツは、実際のオーナー体験や数値ベースの試算をもとに、
            少しずつ充実させていきます。
            まずはCARSページで気になる車種をチェックしつつ、
            「このクルマを持つと生活がどう変わるか」を一緒に考えていく予定です。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
