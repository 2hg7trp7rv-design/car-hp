// components/home/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/80 px-4 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      {/* 背景の装飾レイヤー */}
      <div className="pointer-events-none absolute inset-0">
        {/* 右側に Tiffany ブルーを少し強めたオーバーレイ */}
        <div className="absolute inset-y-0 right-[-10%] w-1/2 bg-gradient-to-l from-tiffany-200/70 via-tiffany-100/40 to-transparent" />
        {/* 柔らかい円形グラデーション */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-tiffany-100/60 blur-3xl" />
        <div className="absolute -bottom-16 right-4 h-40 w-40 rounded-full bg-slate-200/60 blur-2xl" />
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        {/* 左カラム: コピー＋説明＋導線 */}
        <div className="space-y-6">
          <Reveal>
            <p className="text-[10px] font-semibold tracking-[0.32em] text-slate-700">
              CAR BOUTIQUE
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-balance text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-[26px] lg:text-[28px]">
              ニュースとストーリー、
              <br className="hidden sm:block" />
              そして{" "}
              <span className="bg-gradient-to-r from-tiffany-500 to-slate-900 bg-clip-text text-transparent">
                車種データベース
              </span>
              を、
              <br className="hidden sm:block" />
              静かなラグジュアリーブティックのように。
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="max-w-xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
              メーカー発表やメディア記事を追いかけるNEWS、
              オーナー体験やトラブル・技術解説をまとめたCOLUMNとGUIDE、
              そしてスペックと「性格」を整理したCARSページ。
              大人のクルマ好きが、落ち着いて次の一台やこれからの付き合い方を考えられる場所を目指します。
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link
                href="/news"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 font-semibold tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(15,23,42,0.55)] transition hover:bg-slate-800 active:translate-y-[1px]"
              >
                LATEST NEWS
                <span className="ml-1 text-[10px]">→</span>
              </Link>
              <Link
                href="/cars/bmw-530i-g30"
                className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-white/70 px-4 py-2 font-medium tracking-[0.18em] text-slate-900 backdrop-blur transition hover:border-slate-900/30 hover:bg-white"
              >
                愛車BMW 530iを見る
              </Link>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <p className="text-[10px] leading-relaxed tracking-[0.04em] text-slate-500">
              まだ記事は少しずつですが、
              <span className="mx-1 rounded-full bg-slate-900/5 px-2 py-[2px] text-[9px] font-medium tracking-[0.16em] text-slate-700">
                日本語ニュースの丁寧な編集
              </span>
              と
              <span className="mx-1 rounded-full bg-slate-900/5 px-2 py-[2px] text-[9px] font-medium tracking-[0.16em] text-slate-700">
                オーナー目線の本音
              </span>
              を少しずつ増やしていきます。
            </p>
          </Reveal>
        </div>

        {/* 右カラム: ビジュアルカード */}
        <Reveal delay={160}>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-slate-950/95 shadow-[0_28px_80px_rgba(15,23,42,0.85)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-slate-900/10 to-transparent" />
              <div className="relative flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-100/90">
                    FEATURED GARAGE
                  </p>
                  <span className="inline-flex items-center rounded-full bg-slate-100/10 px-3 py-1 text-[9px] font-medium tracking-[0.16em] text-slate-100/80">
                    B48 ENGINE・G30
                  </span>
                </div>

                <div className="relative mt-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent" />
                  <div className="relative flex items-end gap-4 p-3 sm:p-4">
                    <div className="relative h-24 w-40 flex-shrink-0 sm:h-28 sm:w-48">
                      <Image
                        src="/images/hero-sedan.jpg"
                        alt="BMW 5 Series Sedan in a calm boutique-like garage"
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 320px, 60vw"
                        priority
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-50">
                        BMW 530i M Sport (G30)
                      </p>
                      <p className="text-[10px] leading-relaxed text-slate-300/90">
                        高速クルージングと静かな質感を両立した、日常と小さな旅の相棒。
                        実際の維持費やトラブルも、CARSページで少しずつ整理していきます。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-200/80">
                  <p className="tracking-[0.12em]">
                    NEWS・COLUMN・GUIDEから、気になるトピックへすぐアクセスできます。
                  </p>
                  <Link
                    href="/cars"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100/5 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-slate-50 ring-1 ring-slate-100/15 transition hover:bg-slate-100/10"
                  >
                    ほかの車種を見る
                    <span className="text-[9px]">↗</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
