// app/heritage/page.tsx
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "HERITAGE | CAR BOUTIQUE",
  description:
    "ブランドの系譜や名車のストーリーを静かに味わうためのヘリテージ・アーカイブ。",
};

type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  image?: string;
  tags?: string[];
};

// ★ ここが `TimelineEvent =,` になっていてビルドエラーだったので修正
const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: "1970s",
    title: "欧州セダンが「長距離移動の道具」から「ラグジュアリー」へ",
    description:
      "高速道路網の整備とともに、欧州セダンは単なる移動手段から、移動時間そのものを楽しむための「サロン」へ変化していきました。",
    // image: "/images/heritage/e12.jpg"
    tags: ["EUROPE", "SEDAN"],
  },
  {
    year: "1990s",
    title: "電子制御と安全技術の進化",
    description:
      "ABS、エアバッグ、トラクションコントロールなど、今では当たり前の安全装備が高級車から普及し始めた時代。",
    tags: ["TECHNOLOGY", "SAFETY"],
  },
  {
    year: "2010s",
    title: "ダウンサイジングターボと電動化のはじまり",
    description:
      "排気量を抑えつつもトルクフルな走りを実現するダウンサイジングターボと、マイルドハイブリッド／EVが同時に進行。",
    tags: ["POWERTRAIN", "ECO"],
  },
  {
    year: "2020s",
    title: "デジタル体験としてのクルマ",
    description:
      "コネクテッドサービスやOTAアップデートにより、購入後も進化し続ける「デジタルプロダクト」としての性格が強まりつつあります。",
    tags: ["DIGITAL", "FUTURE"],
  },
];

export default function HeritagePage() {
  return (
    <main className="min-h-screen bg-site pb-20 pt-10 sm:pb-28 sm:pt-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ヒーロー */}
        <Reveal>
          <header className="space-y-4 border-b border-slate-200/70 pb-8">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
              HERITAGE
            </p>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                静かな熱量を受け継ぐ、名車たちの系譜。
              </h1>
              <p className="max-w-3xl text-[12px] leading-relaxed text-slate-600">
                ここでは、スペックの大小では測れない「空気感」や「哲学」に焦点を当てて、
                クルマの歴史をゆっくりたどっていきます。
              </p>
            </div>
          </header>
        </Reveal>

        {/* タイムライン */}
        <section className="mt-12 space-y-6">
          <Reveal>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
              TIMELINE
            </h2>
          </Reveal>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 hidden w-px bg-slate-200 sm:block" />

            <div className="space-y-6">
              {TIMELINE_DATA.map((event, index) => (
                <Reveal key={`${event.year}-${event.title}`} delay={index * 0.05}>
                  <GlassCard
                    as="article"
                    padding="lg"
                    className="relative border border-slate-200/80 bg-white/92 sm:ml-6"
                  >
                    <div className="absolute -left-[9px] top-5 hidden h-4 w-4 rounded-full border border-slate-300 bg-white sm:block" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="sm:w-32">
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-500">
                          {event.year}
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-serif text-lg font-medium tracking-tight text-slate-900">
                          {event.title}
                        </h3>
                        <p className="text-[12px] leading-relaxed text-slate-600">
                          {event.description}
                        </p>
                        {event.tags && event.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] tracking-[0.16em] text-slate-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* クロージングメッセージ */}
        <section className="mt-16">
          <Reveal>
            <GlassCard
              padding="lg"
              className="border border-slate-200/80 bg-white/95"
            >
              <p className="text-[12px] leading-relaxed text-slate-600">
                HERITAGE セクションでは、今後ブランド別の系譜や、
                1台のクルマを深掘りするロングインタビュー、
                オーナーの記憶に残るエピソードなどを少しずつアーカイブしていきます。
              </p>
              <p className="mt-3 text-[11px] text-slate-400">
                「このモデルの系譜をまとめてほしい」といったリクエストがあれば、
                COLUMN や CARS と連動した特集として企画していきます。
              </p>
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
