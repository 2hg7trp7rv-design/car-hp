import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
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
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-start.webp" noUpscale />
      <JsonLd id="jsonld-start-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          {/* パンくず */}
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "START" }]} className="mb-6" />

          <header className="mb-12 space-y-4">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">
                START
              </p>
              <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,38px)] text-[#222222]">
                いまの目的から探す
              </h1>
              <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-[#222222]/70 sm:text-[14px]">
                ここは“入口”です。<br />
                迷ったら、HOME / CARS / GUIDE / COLUMN / HERITAGE の中から、いまの目的に近い棚へ入ってください。
              </p>
            </Reveal>
          </header>

        {/* インライン主ナビ — 主要カテゴリだけに絞る */}
        <nav aria-label="主要導線" className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/", label: "HOME" },
              { href: "/cars", label: "CARS" },
              { href: "/guide", label: "GUIDE" },
              { href: "/column", label: "COLUMN" },
              { href: "/heritage", label: "HERITAGE" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="cb-tap inline-flex items-center rounded-full border border-[#222222]/12 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#222222]/75 shadow-soft transition hover:border-[#0ABAB5]/35 hover:text-[#0ABAB5]"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <section className="mb-8 rounded-2xl border border-[#222222]/10 bg-white/70 p-4 shadow-soft">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
            TOOLS
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/65">
            NEWS や横断ツールは、SITE MAP の TOOLS からまとめて入れます。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/site-map#tools">TOOLSを見る</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/news">NEWSを見る</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Reveal delay={80}>
            <GlassCard className="h-full border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">BUY</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#222222]">
                買う（比較・見極め）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">
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

              <div className="mt-5 text-[11px] text-[#222222]/55">
                迷いが残る人は「中古車検索 → ローン」の順が速いです。
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={120}>
            <GlassCard className="h-full border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">TROUBLE</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#222222]">
                困った（警告灯・始動・異音）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">
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

              <div className="mt-5 text-[11px] text-[#222222]/55">
                “いま困っている”場合は、比較より先に手順を固めるのが安全です。
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={160}>
            <GlassCard className="h-full border border-[#222222]/10 bg-white/80 p-6" padding="none">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">SELL / MAINTAIN</p>
              <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#222222]">
                売る/維持（保険・手続き・費用）
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/70">
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

              <div className="mt-5 text-[11px] text-[#222222]/55">
                “急いで決める”ほど損が出やすいので、条件を揃えて比較します。
              </div>
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-12">
          <Reveal delay={200}>
            <GlassCard className="border border-[#222222]/10 bg-white/70 p-6" padding="none">
              <h2 className="font-serif text-[14px] font-semibold text-[#222222]">迷ったときの見方</h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                <li>
                  <span className="font-semibold text-[#222222]/85">GUIDE</span> で手順を読む
                </li>
                <li>
                  <span className="font-semibold text-[#222222]/85">COLUMN</span> で判断材料を増やす
                </li>
                <li>
                  車そのものを見る時は <span className="font-semibold text-[#222222]/85">CARS</span> へ進む
                </li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide">GUIDE一覧へ</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/column">COLUMN一覧へ</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/cars">CARS一覧へ</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/heritage">HERITAGE一覧へ</Link>
                </Button>
              </div>
            </GlassCard>
          </Reveal>
        </section>
        </div>
      </div>
    </main>
  );
}
