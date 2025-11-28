"use client";

import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-soft-strong">
      {/* VIDEO BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-70"
          poster="/images/hero-sedan.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* 光のレイヤー：Tiffany × Radial */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.45),_transparent_60%)] blur-3xl" />
          <div className="absolute right-[-20%] bottom-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.9),_transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-900/0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-3xl space-y-7">
          {/* ラベル行 */}
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-tiffany-100 backdrop-blur-xl">
              <span className="h-[1px] w-6 bg-tiffany-300" />
              <span>CAR BOUTIQUE</span>
              <span className="hidden text-[9px] tracking-[0.18em] text-slate-300/80 sm:inline">
                NEWS · CARS DB · COLUMN · GUIDE
              </span>
            </div>
          </Reveal>

          {/* 見出し */}
          <Reveal delay={150}>
            <h1 className="serif-heading text-3xl font-medium leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              クルマの情報を、
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-tiffany-200 via-white to-tiffany-300 bg-clip-text text-transparent">
                静かに整理して選べる場所。
              </span>
            </h1>
          </Reveal>

          {/* 説明テキスト（実務寄り） */}
          <Reveal delay={250}>
            <p className="max-w-xl text-xs leading-relaxed text-slate-200/90 sm:text-sm">
              公式ニュース、実体験に基づくコラム、車種データベース、購入・維持のガイドを
              ひとつのサイトで横断できます。
              <br className="hidden sm:block" />
              「買う・維持する・手放す」を検討するときに、
              落ち着いて情報を確認するためのデジタルブティックです。
            </p>
          </Reveal>

          {/* CTA ボタン + クイックリンク */}
          <Reveal delay={350}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  magnetic
                >
                  <Link href="/cars">OPEN CARS DATABASE</Link>
                </Button>
                <Button
                  asChild
                  variant="glass"
                  size="lg"
                >
                  <Link href="/column">READ COLUMN &amp; GUIDE</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] text-slate-200/80">
                <Link
                  href="/news"
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 tracking-[0.18em] backdrop-blur-sm transition hover:border-tiffany-300 hover:bg-white/10"
                >
                  LATEST NEWS
                </Link>
                <Link
                  href="/guide"
                  className="rounded-full border border-white/10 bg-white/0 px-3 py-1.5 tracking-[0.18em] backdrop-blur-sm transition hover:border-tiffany-200 hover:bg-white/5"
                >
                  OWNERS GUIDE
                </Link>
              </div>
            </div>
          </Reveal>

          {/* 情報タイプのタグライン */}
          <Reveal delay={430}>
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-200/70">
              <span className="rounded-full bg-slate-900/60 px-3 py-1 backdrop-blur">
                ・公式ニュースのリンク集
              </span>
              <span className="rounded-full bg-slate-900/60 px-3 py-1 backdrop-blur">
                ・維持費/トラブルの実例メモ
              </span>
              <span className="rounded-full bg-slate-900/60 px-3 py-1 backdrop-blur">
                ・車種ごとの基本データ
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
