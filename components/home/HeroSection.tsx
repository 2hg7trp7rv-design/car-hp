// components/home/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-tiffany-100 via-white to-white px-4 py-10 shadow-soft-card sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      {/* 背景の装飾レイヤー */}
      <div className="pointer-events-none absolute inset-0">
        {/* 右側に Tiffany ブルーを少し強めたオーバーレイ */}
        <div className="absolute inset-y-0 right-[-10%] w-1/2 bg-gradient-to-l from-tiffany-200/70 via-tiffany-100/40 to-transparent" />
        {/* 柔らかい円形グラデーション */}
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-tiffany-100/60 blur-3xl" />
        <div className="absolute -bottom-16 right-4 h-40 w-40 rounded-full bg-slate-200/60 blur-2xl" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
        {/* 左カラム: コピー＋説明＋導線 */}
        <div className="space-y-6">
          <p className="text-[10px] font-semibold tracking-[0.32em] text-slate-700">
            CAR BOUTIQUE
          </p>
          <h1 className="text-balance text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-[26px] lg:text-[28px]">
            ニュースとストーリー、
            <br className="hidden sm:block" />
            そして車種データベースを
            <span className="inline-block bg-gradient-to-r from-tiffany-500 to-tiffany-700 bg-clip-text text-transparent">
              静かなブティックのようなUI
            </span>
            で。
          </h1>
          <p className="max-w-xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
            メーカー発表やメディア記事を追いかけるNEWS、
            オーナー体験や技術解説をじっくり読めるCOLUMNとGUIDE、
            そしてスペックと「性格」を整理したCARSページ。
            大人のクルマ好きが、落ち着いて次の一台やこれからの付き合い方を考えられる場所を目指します。
          </p>

          {/* 主要導線のボタン群 */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              href="/news"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 font-medium tracking-[0.2em] text-white transition hover:bg-slate-800"
            >
              NEWSをひらく
            </Link>
            <Link
              href="/cars"
              className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 font-medium tracking-[0.2em] text-slate-900 backdrop-blur hover:border-slate-900/30"
            >
              CARS一覧へ
            </Link>
          </div>

          {/* 4セクションのミニ概要行 */}
          <div className="mt-4 grid gap-2 text-[10px] text-text-sub sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="mt-[4px] h-[6px] w-[6px] rounded-full bg-slate-900" />
              <div>
                <p className="font-semibold tracking-[0.22em] text-slate-700">
                  NEWS
                </p>
                <p className="mt-1 leading-relaxed">
                  主要メーカーとメディアの記事を、要約と一言コメント付きで整理していく予定です。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-[4px] h-[6px] w-[6px] rounded-full bg-tiffany-500" />
              <div>
                <p className="font-semibold tracking-[0.22em] text-slate-700">
                  COLUMN & GUIDE
                </p>
                <p className="mt-1 leading-relaxed">
                  オーナー体験、トラブルや維持費、お金の話などを、
                  生活目線で整理していく読み物エリアです。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-[4px] h-[6px] w-[6px] rounded-full bg-slate-400" />
              <div>
                <p className="font-semibold tracking-[0.22em] text-slate-700">
                  CARS
                </p>
                <p className="mt-1 leading-relaxed">
                  スペックだけでなく、「性格」「弱点」「維持費感」まで。
                  将来の比較機能のベースになる車種ページを増やしていきます。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-[4px] h-[6px] w-[6px] rounded-full bg-slate-500" />
              <div>
                <p className="font-semibold tracking-[0.22em] text-slate-700">
                  HERITAGE
                </p>
                <p className="mt-1 leading-relaxed">
                  名車の系譜やブランドの歴史を、「世代の流れ」で静かに眺めるアーカイブとして整備していきます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム: ヒーロー画像カード */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/hero-sedan.jpg"
                alt="ラグジュアリーセダンのイメージ"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-[10px] tracking-[0.28em] text-slate-200">
                CURATED CAR STORIES
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-white sm:text-[15px]">
                試乗記だけでは分からない、
                <br className="hidden sm:block" />
                「オーナーになってから」の物語も少しずつ。
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-200/90">
                実際のトラブルや修理、維持費のリアルな数字などは、
                コラムやガイドの形でゆっくり足していきます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
