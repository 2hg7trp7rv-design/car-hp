// app/design-v2/page.tsx
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function DesignV2Home() {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        {/* ヒーロー */}
        <section className="mb-10 sm:mb-16">
          <p className="text-xs tracking-[0.35em] uppercase text-text-sub">
            CAR BOUTIQUE
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            ラグジュアリーなクルマ時間のための
            <br className="hidden sm:block" />
            デジタル・ブティック
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-sub">
            ニュースも、コラムも、車種データも。
            情報の「量」ではなく、体験の「質」で選びたい人のためのクルマメディア。
          </p>
        </section>

        {/* Bento Grid */}
        <section className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          {/* NEWS 大きめカード */}
          <GlassCard className="sm:col-span-2 sm:row-span-1">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-text-sub">
                  NEWS
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  いま動いているクルマのニュース
                </h2>
                <p className="mt-2 text-xs text-text-sub leading-relaxed">
                  主要メーカーの公式情報から独自ピックアップまで。
                  「結局どういう意味のニュースなのか」を一言で添えて整理します。
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/news"
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-tiffanySoft underline-offset-4 hover:underline"
                >
                  VIEW NEWS
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* COLUMN 縦長カード */}
          <GlassCard className="sm:row-span-2">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-text-sub">
                  COLUMN
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  オーナーの本音と物語
                </h2>
                <p className="mt-2 text-xs text-text-sub leading-relaxed">
                  トラブル、修理、出会いと別れ。
                  スペック表には載らない「クルマとの関係」を少し深く掘り下げます。
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/column"
                  className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-tiffanySoft underline-offset-4 hover:underline"
                >
                  VIEW COLUMNS
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* GUIDE カード */}
          <GlassCard className="sm:col-span-1 sm:row-span-1">
            <p className="text-[10px] tracking-[0.25em] text-text-sub">
              GUIDE
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              お金と維持のリアル
            </h2>
            <p className="mt-2 text-xs text-text-sub leading-relaxed">
              購入、売却、維持費、保険。
              クルマと暮らしのお金まわりを、できるだけ分かりやすく整理します。
            </p>
            <div className="mt-3 flex justify-end">
              <Link
                href="/guide"
                className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-tiffanySoft underline-offset-4 hover:underline"
              >
                VIEW GUIDES
              </Link>
            </div>
          </GlassCard>

          {/* CARS カード */}
          <GlassCard className="sm:col-span-1 sm:row-span-1">
            <p className="text-[10px] tracking-[0.25em] text-text-sub">
              CARS
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              一台ずつ、深く知る
            </h2>
            <p className="mt-2 text-xs text-text-sub leading-relaxed">
              スペック、性格、維持のしやすさ、トラブル傾向。
              「カタログのその先」に踏み込んだ車種データベースを目指します。
            </p>
            <div className="mt-3 flex justify-end">
              <Link
                href="/cars"
                className="text-xs font-semibold tracking-[0.18em] uppercase text-brand-tiffanySoft underline-offset-4 hover:underline"
              >
                VIEW CARS
              </Link>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
