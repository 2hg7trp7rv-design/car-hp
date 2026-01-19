import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "START｜目的から探す（買う・困った・売る/維持）",
  description:
    "買う・困った・売る/維持。いまの目的から、読む順番と次の一歩だけを最短で案内します。",
  alternates: {
    canonical: "/start",
  },
};

export default function StartPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "START",
        item: `${getSiteUrl()}/start`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-start-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">START</span>
        </nav>

        <header className="mb-12 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              START
            </p>
            <h1 className="serif-heading mt-3 text-3xl text-slate-900">
              いまの目的から探す
            </h1>
            <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              ここは“入口”です。<br />
              迷ったら、読む順番（固定6本） → 比較表 → 行動の入口、の順で進めばOK。
            </p>
          </Reveal>
        </header>

        <section className="mb-6">
          <Reveal delay={60}>
            <GlassCard className="border border-slate-200/80 bg-white/80" padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">SEARCH</p>
                  <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-slate-900">
                    サイト内検索
                  </h2>
                  <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-slate-600">
                    車種・症状・キーワードで、CARS / GUIDE / COLUMN / NEWS / HERITAGE を横断検索します。
                  </p>
                </div>

                <form
                  action="/search"
                  method="get"
                  className="flex w-full max-w-xl items-center gap-2"
                >
                  <input
                    name="q"
                    placeholder="例：BMW 3シリーズ / タイミングチェーン / ドラレコ"
                    className="h-10 w-full rounded-full border border-slate-200 bg-white/80 px-4 text-[12px] text-slate-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-tiffany-400/60"
                  />
                  <Button type="submit" variant="primary" size="sm" className="h-10 px-5">
                    検索
                  </Button>
                </form>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="xs">
                  <Link href="/search?q=BMW">BMW</Link>
                </Button>
                <Button asChild variant="outline" size="xs">
                  <Link href="/search?q=ベンツ">ベンツ</Link>
                </Button>
                <Button asChild variant="outline" size="xs">
                  <Link href="/search?q=故障">故障</Link>
                </Button>
                <Button asChild variant="outline" size="xs">
                  <Link href="/search?q=査定">査定</Link>
                </Button>
              </div>
            </GlassCard>
          </Reveal>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Reveal delay={80}>
            <GlassCard className="h-full border border-slate-200/80 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">BUY</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-slate-900">
                買う（比較・見極め）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                候補選び → 総額 → 支払い方法までを最短で整理。
              </p>

              <div className="mt-5 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/guide/hub-usedcar">中古車検索HUBへ</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/guide/hub-loan">ローン/支払いHUBへ</Link>
                </Button>
              </div>

              <div className="mt-5 text-[11px] text-slate-500">
                迷いが残る人は「中古車検索 → ローン」の順が速いです。
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={120}>
            <GlassCard className="h-full border border-slate-200/80 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">TROUBLE</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-slate-900">
                困った（警告灯・始動・異音）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                まずは症状を切り分けて、余計な出費を避けます。
              </p>

              <div className="mt-5 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/guide/hub-import-trouble">症状別の入口（トラブルHUB）</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/column?category=MAINTENANCE">整備/トラブルのCOLUMN</Link>
                </Button>
              </div>

              <div className="mt-5 text-[11px] text-slate-500">
                “いま困っている”場合は、比較より先に手順を固めるのが安全です。
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={160}>
            <GlassCard className="h-full border border-slate-200/80 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-500">SELL / MAINTAIN</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-slate-900">
                売る/維持（保険・手続き・費用）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                準備 → 同条件で比較 → タイミング判断。
              </p>

              <div className="mt-5 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/guide/hub-sell">売却HUBへ</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/guide/insurance">自動車保険HUBへ</Link>
                </Button>
              </div>

              <div className="mt-5 text-[11px] text-slate-500">
                “急いで決める”ほど損が出やすいので、条件を揃えて比較します。
              </div>
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-12">
          <Reveal delay={200}>
            <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
              <h2 className="font-serif text-[14px] font-semibold text-slate-900">迷ったときの最短ルート</h2>
              <ol className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-600">
                <li>
                  1. <span className="font-semibold text-slate-800">読む順番（固定6本）</span>を先に読む
                </li>
                <li>
                  2. <span className="font-semibold text-slate-800">比較表</span>で条件を揃える
                </li>
                <li>
                  3. 最後に <span className="font-semibold text-slate-800">行動の入口</span>へ進む
                </li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide/hub-usedcar#reading">買う：読む順番</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide/hub-loan#reading">支払い：読む順番</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide/insurance#reading">保険：読む順番</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide/hub-sell#reading">売却：読む順番</Link>
                </Button>
              </div>
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
