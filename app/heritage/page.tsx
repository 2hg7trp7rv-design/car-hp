// app/heritage/page.tsx
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "HERITAGE | ブランドとモデルの物語 | CAR BOUTIQUE",
  description:
    "BMW、トヨタ、日産などのブランドヒストリーや、代表的なモデルの系譜を静かに眺めるHERITAGEエリア。",
};

const heritageItems = [
  {
    id: "bmw-5-series-lineage",
    title: "BMW 5シリーズ G30までの系譜",
    summary:
      "E39、E60、F10、そしてG30へ。サイズ感やキャラクターの変化、『5シリーズらしさ』がどこにあるのかを整理していきます。",
    pill: "BMW",
  },
  {
    id: "toyota-harrier-evolution",
    title: "トヨタ ハリアーが築いてきた『都会派SUV』というジャンル",
    summary:
      "初代から80系まで、一貫して『都会のラグジュアリーSUV』として進化してきたハリアー。そのポジションの変遷を追いかけます。",
    pill: "TOYOTA",
  },
  {
    id: "gtr-heritage",
    title: "GT-Rというバッジに込められた意味",
    summary:
      "スカイラインGT-Rから現行R35まで。レースでの戦績だけでなく、日本のクルマ文化に与えた影響も含めて、『GT-R』という存在を俯瞰します。",
    pill: "NISSAN",
  },
];

export default function HeritagePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          HERITAGE
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ブランドとモデルの物語
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          技術やスペックの話だけでなく、
          そのブランドやモデルがどんな時代背景の中で生まれ、どう進化してきたのか。
          「なぜこのクルマはそうなっているのか」を紐解くための、ゆっくり眺めるエリアです。
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {heritageItems.map((item) => (
          <GlassCard
            key={item.id}
            as="article"
            interactive
            className="flex h-full flex-col p-4 sm:p-5"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  HERITAGE
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1">
                  {item.pill}
                </span>
              </div>

              <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                {item.title}
              </h2>

              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                {item.summary}
              </p>

              <p className="mt-4 text-[11px] text-text-sub">
                記事本編は順次追加予定です。
              </p>
            </div>
          </GlassCard>
        ))}
      </section>

      <section className="mt-10">
        <GlassCard className="p-4 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
            CONCEPT
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-[13px]">
            HERITAGEでは、いわゆるカタログ的なスペック解説だけでなく、
            「なぜこのクルマに惹かれるのか」「どの世代にどんな意味があったのか」といった、
            もう少し感情寄りの話も含めてまとめていきます。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
