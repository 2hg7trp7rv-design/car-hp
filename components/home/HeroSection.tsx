// components/home/HeroSection.tsx
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
      {/* VIDEO BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-60"
          // 動画がない場合はポスター画像が表示されます
          poster="/images/hero-sedan.jpg"
        >
          {/* 実際の動画ファイルを配置する */}
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* グラデーションオーバーレイ（文字の可読性確保） */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div className="max-w-3xl">
          <Reveal delay={0}>
            <p className="mb-4 flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-tiffany-400">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              CAR BOUTIQUE
            </p>
          </Reveal>

          <Reveal delay={200}>
            <h1 className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-7xl">
              クルマのニュースと
              <br />
              データベースを、一つの画面で。
            </h1>
          </Reveal>

          <Reveal delay={400}>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
              主要モデルのスペック、関連ニュース、解説コラムをまとめて確認できる小さな車メディアです。
              <br className="hidden sm:block" />
              気になる車種やトピックを、必要な情報だけ落ち着いて追えることを目指しています。
            </p>
          </Reveal>

          <Reveal delay={600}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/cars">
                <Button variant="primary" size="lg" magnetic>
                  VIEW CAR DATABASE
                </Button>
              </Link>
              <Link href="/guide">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:border-white hover:bg-white/10"
                >
                  VIEW GUIDES
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
