// app/design-v2/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "Design V2 Preview | CAR BOUTIQUE",
  description:
    "CAR BOUTIQUEの次期デザインコンセプトをまとめたプレビューページです。",
};

export default function DesignV2Page() {
  return (
    <main className="min-h-screen pb-16">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden border-b border-white/40 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.35),_transparent_50%),_linear-gradient(to_right,_#f5fbff,_#ffffff)]">
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
          <div className="absolute -left-[25%] top-[-10%] h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
          <div className="absolute left-[40%] top-[10%] h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
          <div className="absolute -right-[15%] bottom-[-10%] h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-soft-card backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              CAR BOUTIQUE Design V2
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              静かな高級ブティックの世界観を
              <br className="hidden sm:block" />
              車好きのためのデジタルガレージへ
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-slate-700 sm:text-base">
              このページは、次期トップページ案やニュース・車種ページのデザイン指針を
              一覧できる「デザイン仕様メモ」の役割を持つプレイグラウンドです。
              実装中のコンポーネントをここで並べて確認しながら、全体のトーンと情報量の
              バランスを整えていきます。
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 shadow-soft-card">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Tiffanyブルー×ホワイトのグラデーション
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 shadow-soft-card">
                情報密度と余白のバランス検証用
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GlassCard as="article" className="relative overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                トップページ
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                ヒーロー＋ダッシュボード構成
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                ニュース・コラム・ガイド・車種データベースへの入り口を
                一画面で見渡せる構成。視線誘導を意識した縦三分割レイアウトを採用。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                  ヒーローコピー
                </span>
                <span className="rounded-full bg-sky-50 px-2 py-1 text-sky-700">
                  注目ニュースカード
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                  サイトの使い方ガイド
                </span>
              </div>
            </GlassCard>

            <GlassCard as="article" className="relative overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                ニュース
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                タブ切り替え＋絞り込み
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                メーカーやカテゴリ別にニュースを切り替えられるタブ構成。
                カード表示と情報密度の高いリスト表示を将来的に切り替えられる前提で設計。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                  メーカー・タグフィルタ
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                  編集コメント付き要約
                </span>
              </div>
            </GlassCard>

            <GlassCard as="article" className="relative overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Cars
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                車種データベースと比較の土台
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                1台ごとの「性格解説」「長所短所」「維持費感」「トラブル傾向」を
                まとめるテンプレートを前提としたレイアウト。将来の比較機能を見据えた
                情報粒度で設計。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                  車種テンプレ
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                  スペック＋ストーリー
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 詳細セクション群 */}
      <section className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 lg:mt-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8">
        <GlassCard as="section" className="space-y-4">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-slate-500">
            レイアウトルール
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            CAR BOUTIQUEでは、全ページで共通する「骨格」を先に決めた上で、
            セクションごとの世界観を調整していきます。
          </p>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
            <li>・余白は一般的なニュースサイトより一段階多めに確保する</li>
            <li>・視線の流れは左上から右下へ、三段構成を基本とする</li>
            <li>・スマホでの縦スクロール前提で、ファーストビューに役割を集中させる</li>
            <li>・情報量は「日本の自動車メディアの7〜8割」程度を目安に調整</li>
          </ul>
          <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900">
            現状の実装では、トップページとニュースページにこのルールを先行適用し、
            Cars・Column・Guideへ段階的に展開していきます。
          </div>
        </GlassCard>

        <GlassCard as="section" className="space-y-4">
          <h2 className="text-sm font-semibold tracking-[0.16em] text-slate-500">
            確認用リンク
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <div className="text-[11px] font-medium text-slate-500">
                現在のトップページ
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                /（トップ）
                <span aria-hidden>↗</span>
              </Link>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">
                ニュース一覧（タブ付き）
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                /news
                <span aria-hidden>↗</span>
              </Link>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">
                車種一覧（Carsデータベース）
              </div>
              <Link
                href="/cars"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                /cars
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            デザイン検証の際は、上記リンク先とこのページを行き来しながら、
            コンポーネントの統一感や情報量の差を確認していく前提です。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
