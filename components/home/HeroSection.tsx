// components/home/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        {/* 左: コピー */}
        <div>
          <p className="font-body-light text-[10px] tracking-[0.32em] text-text-sub">
            THE GARAGE JOURNAL
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            クルマを
            <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
              宝石
            </span>
            のように眺める場所。
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-text-sub md:text-[15px]">
            CAR BOUTIQUEは、ニュースの「その先」にあるストーリーや、
            オーナーの本音、維持費やトラブルのリアルまで含めて、
            上質なUIでゆっくり味わうためのデジタルブティックです。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="font-medium tracking-[0.18em]"
            >
              最新ニュースを見る
            </Button>
            <Link
              href="/cars/bmw-530i-g30"
              className="text-xs font-medium tracking-[0.18em] text-tiffany-700 underline-offset-4 hover:underline"
            >
              BMW 530i G30のページへ
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-[11px] text-text-sub">
            <div>
              <div className="font-semibold tracking-[0.18em] text-slate-700">
                NEWS
              </div>
              <div className="mt-1 text-xs">
                編集コメント付きで毎日数本ピックアップ
              </div>
            </div>
            <div>
              <div className="font-semibold tracking-[0.18em] text-slate-700">
                CARS
              </div>
              <div className="mt-1 text-xs">
                車種ページを比較しやすいテンプレで整理
              </div>
            </div>
          </div>
        </div>

        {/* 右: 画像＋注目カード */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tiffany-50 via-white to-slate-50 shadow-soft-card">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/hero-sedan.jpg"
                alt="ラグジュアリーセダンのサイドビュー"
                fill
                className="object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-6 left-4 right-4 sm:left-auto sm:right-0 sm:w-[70%]">
            <GlassCard className="pointer-events-auto p-4 shadow-soft-card">
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                HIGHLIGHT
              </p>
              <h2 className="mt-2 text-sm font-semibold text-slate-900">
                いま押さえておきたいニュースと、オーナー本音コラム。
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                「とりあえず眺める」だけでも楽しいように、毎日少しずつ
                コンテンツを積み上げていきます。
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                  ニュースダイジェスト
                </span>
                <span className="rounded-full bg-sky-50 px-2 py-1 text-sky-700">
                  コラム
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                  車種データベース
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
