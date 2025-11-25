// app/design-v2/page.tsx
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

const primaryNav = [
  { href: "/", label: "HOME" },
  { href: "/news", label: "NEWS" },
  { href: "/cars", label: "CARS" },
  { href: "/column", label: "COLUMN" },
  { href: "/guide", label: "GUIDE" },
];

const quickBlocks = [
  {
    title: "今日のクルマニュースを一気読み",
    body: "主要メーカーのリリースや国内メディアの記事から、気になるトピックだけを厳選。要約とひとことコメントで「結局どうなの？」がすぐ分かる。",
    href: "/news",
    linkLabel: "ニュース一覧へ",
  },
  {
    title: "オーナーの本音コラム",
    body: "維持費やトラブル、乗り換えの葛藤まで。カタログには出てこないリアルなオーナー目線の記事を集めました。",
    href: "/column",
    linkLabel: "コラム・ストーリーへ",
  },
  {
    title: "買い方・売り方の実用ガイド",
    body: "ローン残債と下取り、車検と乗り換えのタイミング、中古車の見極め方など、お金とクルマの悩みを整理するガイドを随時追加予定。",
    href: "/guide",
    linkLabel: "ガイドを見る",
  },
];

const carCategories = [
  {
    label: "FRスポーツで運転を楽しむ",
    description:
      "GR86、シルビア、RX-7、S2000、ランエボIXなど、走り好きのためのスポーツ/ラリー系をまとめてピックアップ。",
    cars: [
      { href: "/cars/toyota-gr86-zn8", name: "トヨタ GR86 (ZN8)" },
      { href: "/cars/nissan-silvia-s15", name: "日産 シルビア S15" },
      { href: "/cars/mazda-rx7-fd3s", name: "マツダ RX-7 (FD3S)" },
      { href: "/cars/honda-s2000-ap1-ap2", name: "ホンダ S2000 (AP1/AP2)" },
      { href: "/cars/mitsubishi-lancer-evo-ix-ct9a", name: "ランエボ IX (CT9A)" },
    ],
  },
  {
    label: "プレミアムサルーンとSUV",
    description:
      "BMW 5シリーズ/3シリーズ、X3、クラウンスポーツ、ハリアー、プラドなど「大人が落ち着いて選びたい」クルマたち。",
    cars: [
      { href: "/cars/bmw-530i-g30", name: "BMW 530i G30" },
      { href: "/cars/bmw-320i-g20", name: "BMW 320i G20" },
      { href: "/cars/bmw-x3-g01", name: "BMW X3 G01" },
      { href: "/cars/crown-sport", name: "トヨタ クラウンスポーツ" },
      { href: "/cars/toyota-harrier-80", name: "トヨタ ハリアー 80系" },
      { href: "/cars/toyota-landcruiser-prado-150", name: "トヨタ ランドクルーザー プラド 150系" },
    ],
  },
  {
    label: "ミニバンと軽・コンパクトで暮らしを整える",
    description:
      "アルファード40/30後期、ステップワゴン、N-BOX、プリウス、ノートe-POWERなど、家族と暮らし目線で選びたい定番たち。",
    cars: [
      { href: "/cars/toyota-alphard-40", name: "トヨタ アルファード 40系" },
      { href: "/cars/toyota-alphard-30-late", name: "トヨタ アルファード 30系後期" },
      { href: "/cars/honda-stepwgn-rp6", name: "ホンダ ステップワゴン RP6" },
      { href: "/cars/honda-n-box-jf5", name: "ホンダ N-BOX JF5" },
      { href: "/cars/toyota-prius-60", name: "トヨタ プリウス 60系" },
      { href: "/cars/nissan-note-e13", name: "日産 ノート e-POWER E13" },
    ],
  },
];

const heritageBlocks = [
  {
    title: "90年代〜00年代 国産スポーツの「今」",
    body: "スープラ80、RX-7、シルビア、ランエボ、S2000など、かつて“普通に”買えた名車たちの現行中古相場と維持のリアルを整理していきます。",
  },
  {
    title: "ラグジュアリーミニバンの現在地",
    body: "アルファード30後期から40系への進化、ステップワゴンやセレナとのキャラクターの違いを「移動時間の質」という軸で比較。",
  },
  {
    title: "電動化時代の定番達",
    body: "プリウス60、ノートe-POWER、シビック e:HEV、クラウンスポーツなど、「燃費だけじゃない」電動パワートレインの選び方を整理。",
  },
];

export default function DesignV2Page() {
  return (
    <main className="min-h-[100svh] bg-gradient-to-r from-[#e4f6f6] via-white to-white text-text-main">
      {/* 上部ナビゲーション */}
      <header className="border-b border-white/60 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="font-serif text-[18px] tracking-[0.25em] uppercase text-slate-900"
          >
            CAR BOUTIQUE
          </Link>
          <nav className="hidden gap-6 text-[12px] tracking-[0.24em] text-text-sub md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 md:flex-row md:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <p className="font-body-light text-[11px] tracking-[0.3em] text-text-sub uppercase">
            CURATED CAR JOURNAL
          </p>
          <h1 className="font-serif text-3xl leading-[1.35] text-slate-900 sm:text-4xl md:text-[40px]">
            大人のクルマ好きが、
            <br />
            静かに読みふけるための
            <br />
            小さなオンラインガレージ。
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-text-sub">
            カタログスペックだけでは見えてこない、
            日常とクルマのちょうどいい距離感。
            新車ニュースから、長く付き合うための維持・トラブルのリアル、
            そして将来の「次の一台」まで。
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/news"
              className="rounded-full bg-slate-900 px-6 py-2 text-[12px] tracking-[0.18em] text-white transition-opacity hover:opacity-80"
            >
              最新ニュースをチェック
            </Link>
            <Link
              href="/cars"
              className="rounded-full border border-slate-300 bg-white/60 px-6 py-2 text-[12px] tracking-[0.18em] text-slate-800 hover:border-slate-500"
            >
              車種からじっくり探す
            </Link>
          </div>

          <div className="mt-4 grid gap-3 text-[11px] text-text-sub sm:grid-cols-3">
            <div>
              <div className="font-body-light tracking-[0.2em] text-slate-500">
                NEWS
              </div>
              <div className="mt-1 text-[12px]">
                主要メディアのRSSをもとに、要約＋ひとことコメントで整理。
              </div>
            </div>
            <div>
              <div className="font-body-light tracking-[0.2em] text-slate-500">
                COLUMN
              </div>
              <div className="mt-1 text-[12px]">
                オーナー目線の体験談や、トラブル・修理のリアルを中心に。
              </div>
            </div>
            <div>
              <div className="font-body-light tracking-[0.2em] text-slate-500">
                CARS DB
              </div>
              <div className="mt-1 text-[12px]">
                名車から現行車まで、少しずつ「使える車種データベース」に。
              </div>
            </div>
          </div>
        </div>

        {/* 右側：カードの束 */}
        <div className="flex-1 space-y-4">
          <GlassCard className="shadow-soft-card">
            <p className="font-body-light text-[10px] tracking-[0.25em] text-text-sub uppercase">
              TODAY&apos;S PICK
            </p>
            <h2 className="mt-2 font-serif text-[20px] leading-snug text-slate-900">
              「今、気になるクルマ」を
              <br />
              シーン別にゆっくり眺める。
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-text-sub">
              走りのFRスポーツ、家族と過ごすミニバン、
              ほどよくプレミアムなSUV。
              いま気になる実在のクルマ達を、編集目線でグルーピングして紹介します。
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-white/70 px-3 py-1">
                FRスポーツ
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                プレミアムサルーン
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                ミニバン
              </span>
              <span className="rounded-full bg-white/70 px-3 py-1">
                軽・コンパクト
              </span>
            </div>
          </GlassCard>

          <div className="grid gap-3 md:grid-cols-2">
            <GlassCard className="shadow-soft-card">
              <div className="text-[11px] font-body-light tracking-[0.22em] text-slate-500">
                OWNER&apos;S GARAGE
              </div>
              <div className="mt-1 font-serif text-[15px] text-slate-900">
                BMW 530i G30で
                <br />
                Dセグセダンの良さを探る
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                実際のオーナーとしての視点で、
                高速道路・街乗り・トラブル・維持費まで少しずつ記事化していきます。
              </p>
              <Link
                href="/cars/bmw-530i-g30"
                className="mt-3 inline-flex text-[11px] tracking-[0.18em] text-slate-900 underline-offset-4 hover:underline"
              >
                530iの車種ページを見る
              </Link>
            </GlassCard>

            <GlassCard className="shadow-soft-card">
              <div className="text-[11px] font-body-light tracking-[0.22em] text-slate-500">
                COMING FEATURE
              </div>
              <div className="mt-1 font-serif text-[15px] text-slate-900">
                「次の一台」を
                <br />
                比べて選べるページへ
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                近い将来、2台比較や条件検索、
                「マイガレージ」的な機能を備えたクルマDBへ育てていく予定です。
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ダッシュボード的な入口セクション */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-[20px] text-slate-900">
            まずは、ここから。
          </h2>
          <p className="text-[11px] text-text-sub">
            「今知りたいこと」別に、入り口を用意しました。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickBlocks.map((block) => (
            <GlassCard key={block.title} className="shadow-soft-card">
              <h3 className="font-serif text-[15px] leading-snug text-slate-900">
                {block.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                {block.body}
              </p>
              <Link
                href={block.href}
                className="mt-3 inline-flex text-[11px] tracking-[0.18em] text-slate-900 underline-offset-4 hover:underline"
              >
                {block.linkLabel}
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 車種カテゴリーセクション */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-[20px] text-slate-900">
            テーマ別に眺める「実在のクルマ」たち
          </h2>
          <Link
            href="/cars"
            className="text-[11px] tracking-[0.18em] text-text-sub underline-offset-4 hover:underline"
          >
            車種一覧へ
          </Link>
        </div>

        <div className="space-y-4">
          {carCategories.map((cat) => (
            <GlassCard key={cat.label} className="shadow-soft-card">
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <div className="md:w-[40%]">
                  <div className="text-[11px] font-body-light tracking-[0.22em] text-slate-500">
                    CAR THEME
                  </div>
                  <h3 className="mt-1 font-serif text-[16px] text-slate-900">
                    {cat.label}
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                    {cat.description}
                  </p>
                </div>
                <div className="md:flex-1">
                  <div className="grid grid-cols-1 gap-1 text-[12px] sm:grid-cols-2">
                    {cat.cars.map((car) => (
                      <Link
                        key={car.href}
                        href={car.href}
                        className="flex items-center justify-between rounded-md border border-transparent px-2 py-1 hover:border-slate-300 hover:bg-white/60"
                      >
                        <span>{car.name}</span>
                        <span className="text-[10px] text-text-sub">
                          詳しく見る →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ヘリテージ／長期企画セクション */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-[20px] text-slate-900">
            これから深掘りしていくテーマ
          </h2>
          <p className="text-[11px] text-text-sub">
            まだ途中の企画も含め、少しずつ記事を追加していきます。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {heritageBlocks.map((item) => (
            <GlassCard key={item.title} className="shadow-soft-card">
              <h3 className="font-serif text-[15px] text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-text-sub">
                {item.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>
    </main>
  );
}
