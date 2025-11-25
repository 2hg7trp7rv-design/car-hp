// app/page.tsx
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { GlassCard } from "@/components/GlassCard";

const sections = [
  {
    id: "news",
    label: "NEWS",
    title: "編集コメント付きニュースダイジェスト",
    description:
      "国内外の主要ニュースをピックアップし、要約とひと言コメントを添えてお届けします。",
    href: "/news",
    pill: "最新の動き",
  },
  {
    id: "column",
    label: "COLUMN",
    title: "オーナー目線のストーリーと深掘り解説",
    description:
      "トラブル・修理・メンテナンス・技術・歴史まで、クルマと暮らしの距離が近づく読み物。",
    href: "/column",
    pill: "読み物",
  },
  {
    id: "guide",
    label: "GUIDE",
    title: "買い方・売り方・維持費ガイド",
    description:
      "購入前の不安から、維持費・保険・売却まで。リアルなお金の話を中心に整理していきます。",
    href: "/guide",
    pill: "実用ガイド",
  },
  {
    id: "cars",
    label: "CARS",
    title: "車種データベースと比較の土台",
    description:
      "スペックだけでなく、長所短所・維持費感・トラブル傾向を1台ずつ整理していくデータベース。",
    href: "/cars",
    pill: "車種データ",
  },
];

export default function HomePage() {
  return (
    <main className="pb-16 pt-20 sm:pt-24 md:pt-28">
      <HeroSection />

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body-light text-[10px] tracking-[0.32em] text-text-sub">
              DASHBOARD
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              このサイトでできること
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-text-sub">
            NEWS・COLUMN・GUIDE・CARSの4セクションを弁当箱のように配置し、
            「まずどこを見ればいいか」が一目で分かるダッシュボードです。
          </p>
        </header>

        {/* Bento Grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* NEWS: 横長（2カラム分） */}
          <GlassCard
            as="article"
            className="sm:col-span-2 flex flex-col justify-between p-5 sm:p-6"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                {sections[0].label}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                {sections[0].title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-sub">
                {sections[0].description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-tiffany-50 px-3 py-1 text-[11px] font-medium text-tiffany-700">
                {sections[0].pill}
              </span>
              <Link
                href={sections[0].href}
                className="text-sm font-medium text-tiffany-600 underline-offset-4 hover:underline"
              >
                一覧を見る
              </Link>
            </div>
          </GlassCard>

          {/* COLUMN: 縦長（2行ぶち抜き） */}
          <GlassCard
            as="article"
            className="row-span-2 flex flex-col justify-between p-5 sm:p-6"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                {sections[1].label}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                {sections[1].title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-sub">
                {sections[1].description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                {sections[1].pill}
              </span>
              <Link
                href={sections[1].href}
                className="text-sm font-medium text-tiffany-600 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>
          </GlassCard>

          {/* GUIDE */}
          <GlassCard
            as="article"
            className="flex flex-col justify-between p-5 sm:p-6"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                {sections[2].label}
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
                {sections[2].title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                {sections[2].description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                {sections[2].pill}
              </span>
              <Link
                href={sections[2].href}
                className="text-xs font-medium text-tiffany-600 underline-offset-4 hover:underline"
              >
                GUIDEへ
              </Link>
            </div>
          </GlassCard>

          {/* CARS */}
          <GlassCard
            as="article"
            className="flex flex-col justify-between p-5 sm:p-6"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
                {sections[3].label}
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
                {sections[3].title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-text-sub">
                {sections[3].description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                {sections[3].pill}
              </span>
              <Link
                href={sections[3].href}
                className="text-xs font-medium text-tiffany-600 underline-offset-4 hover:underline"
              >
                CARSへ
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
