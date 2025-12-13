// app/guide/page.tsx
// ─────────────────────────────────────────────────────────────
// GUIDE 一覧ページ
//  - 上部は “世界観＋ガイドの位置づけ” を伝えるヒーロー＆ナビ
//  - 中央はテーマ別のBento（売却/保険/リース/メンテ）へ導く
//  - 下部は検索＆フィルタでガイドを探索する
// ─────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import Link from "next/link";

import { getAllGuides, type GuideItem } from "@/lib/guides";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { GuideCard } from "@/components/guide/GuideCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "GUIDE | CAR BOUTIQUE",
  description:
    "保険・維持費・トラブル・買い方/売り方まで。クルマの意思決定に必要な“実務情報”を、静かな世界観でまとめたガイド集。",
  alternates: {
    canonical: "/guide",
  },
};

type CategoryKey =
  | "ALL"
  | "BASICS"
  | "MAINTENANCE"
  | "MONEY"
  | "BUY"
  | "SELL"
  | "INSURANCE"
  | "LEASE"
  | "CUSTOM"
  | "TROUBLE"
  | "STYLE"
  | "BRAND"
  | "NEWS"
  | "OTHER";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  ALL: "すべて",
  BASICS: "基礎",
  MAINTENANCE: "メンテ",
  MONEY: "お金",
  BUY: "買い方",
  SELL: "売り方",
  INSURANCE: "保険",
  LEASE: "リース",
  CUSTOM: "カスタム",
  TROUBLE: "トラブル",
  STYLE: "スタイル",
  BRAND: "ブランド",
  NEWS: "ニュース",
  OTHER: "その他",
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function pickFeaturedGuides(all: GuideItem[]): GuideItem[] {
  // “収益ピラー”に寄せて、入口になりやすいガイドを上に
  const keywords = [
    "保険",
    "見積",
    "一括",
    "売却",
    "査定",
    "リース",
    "残クレ",
    "維持費",
    "故障",
  ];

  const score = (g: GuideItem) => {
    const t = g.title ?? "";
    const base =
      (g.category === "INSURANCE" ? 12 : 0) +
      (g.category === "LEASE" ? 10 : 0) +
      (g.category === "SELL" ? 10 : 0) +
      (g.category === "MONEY" ? 8 : 0) +
      (g.category === "MAINTENANCE" ? 6 : 0);
    const kw = keywords.reduce((acc, k) => acc + (t.includes(k) ? 2 : 0), 0);
    const recency = (() => {
      const d = new Date(g.publishedAt);
      if (Number.isNaN(d.getTime())) return 0;
      const days = (Date.now() - d.getTime()) / 86400000;
      if (days <= 14) return 6;
      if (days <= 60) return 3;
      return 0;
    })();
    return base + kw + recency;
  };

  return [...all].sort((a, b) => score(b) - score(a)).slice(0, 6);
}

export default async function GuideIndexPage() {
  const allGuides = await getAllGuides();
  const featured = pickFeaturedGuides(allGuides);

  // Category list (from data)
  const categories = (Object.keys(CATEGORY_LABELS) as CategoryKey[]).filter(
    (k) => k !== "ALL",
  );

  // Simple search/filter on client would be nicer,
  // but this page keeps it "static-ish" and relies on user scrolling.
  // (We can add client search later if needed.)
  const grouped: Record<CategoryKey, GuideItem[]> = {
    ALL: allGuides,
    BASICS: [],
    MAINTENANCE: [],
    MONEY: [],
    BUY: [],
    SELL: [],
    INSURANCE: [],
    LEASE: [],
    CUSTOM: [],
    TROUBLE: [],
    STYLE: [],
    BRAND: [],
    NEWS: [],
    OTHER: [],
  };

  for (const g of allGuides) {
    const k = (g.category ?? "OTHER") as CategoryKey;
    if (grouped[k]) grouped[k].push(g);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      {/* HERO */}
      <Reveal delay={70}>
        <header className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/85 px-6 py-10 shadow-soft-card sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(135,206,235,0.18),transparent_55%),radial-gradient(circle_at_82%_18%,rgba(64,224,208,0.18),transparent_60%),radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.35),transparent_50%)]" />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              PRACTICAL LIBRARY
            </p>
            <h1 className="serif-heading mt-4 text-3xl text-slate-900 sm:text-4xl">
              GUIDE
            </h1>
            <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              保険・維持費・トラブル・買い方/売り方まで。
              クルマの意思決定に必要な“実務情報”を、静かな世界観でまとめたガイド集です。
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/guide/insurance"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                保険（比較）
              </Link>
              <Link
                href="/guide/lease"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                リース（定額）
              </Link>
              <Link
                href="/guide/maintenance"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                メンテ用品
              </Link>
              <Link
                href="#all-guides"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:text-tiffany-700"
              >
                すべて見る
              </Link>
            </div>
          </div>
        </header>
      </Reveal>

      {/* FEATURED */}
      <Reveal delay={120}>
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                FEATURED
              </p>
              <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
                まずはこの6本
              </h2>
            </div>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
              “迷うところ”から読めばOK
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g, idx) => (
              <Reveal key={g.slug} delay={150 + idx * 40}>
                <GuideCard guide={g} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* BENTO */}
      <Reveal delay={140}>
        <section className="mt-14">
          <div className="mb-5">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              THEMES
            </p>
            <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
              テーマ別の入口
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Reveal delay={160}>
              <Link href="/guide/insurance" className="lg:col-span-6">
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="h-full border border-slate-100 bg-white/85 shadow-soft-card transition hover:-translate-y-[1px] hover:border-tiffany-100"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    INSURANCE
                  </p>
                  <h3 className="serif-heading mt-2 text-lg text-slate-900">
                    自動車保険：比較の前提を揃える
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                    年齢条件・運転者範囲・車両保険・免責…。
                    ここを揃えるだけで見積もりの精度が上がります。
                  </p>
                </GlassCard>
              </Link>
            </Reveal>

            <Reveal delay={180}>
              <Link href="/guide/lease" className="lg:col-span-6">
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="h-full border border-slate-100 bg-white/85 shadow-soft-card transition hover:-translate-y-[1px] hover:border-tiffany-100"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    LEASE
                  </p>
                  <h3 className="serif-heading mt-2 text-lg text-slate-900">
                    定額リース：条件の読み方
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                    月額より先に、走行距離・返却精算・中途解約・メンテ範囲を確認。
                    “総額”で比較するのがコツです。
                  </p>
                </GlassCard>
              </Link>
            </Reveal>

            <Reveal delay={200}>
              <Link href="/guide/maintenance" className="lg:col-span-5">
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="h-full border border-slate-100 bg-white/85 shadow-soft-card transition hover:-translate-y-[1px] hover:border-tiffany-100"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    MAINTENANCE
                  </p>
                  <h3 className="serif-heading mt-2 text-lg text-slate-900">
                    メンテ用品：まず揃える定番
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                    洗車・車内・ドラレコ・バッテリー対策。
                    必要になりやすい順に、薄く揃えるのが現実的です。
                  </p>
                </GlassCard>
              </Link>
            </Reveal>

            <Reveal delay={220}>
              <Link href="/guide#all-guides" className="lg:col-span-7">
                <GlassCard
                  padding="lg"
                  magnetic={false}
                  className="h-full border border-slate-100 bg-white/85 shadow-soft-card transition hover:-translate-y-[1px] hover:border-tiffany-100"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    ALL GUIDES
                  </p>
                  <h3 className="serif-heading mt-2 text-lg text-slate-900">
                    すべてのGUIDEを探す
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
                    テーマ別の入口から、目的に近い記事へショートカットできます。
                    下の一覧からも直接探せます。
                  </p>
                </GlassCard>
              </Link>
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* ALL */}
      <Reveal delay={160}>
        <section id="all-guides" className="mt-14">
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
              ALL GUIDES
            </p>
            <h2 className="serif-heading mt-2 text-xl text-slate-900 sm:text-2xl">
              全ガイド
            </h2>
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-600 sm:text-[13px]">
              カテゴリ別にまとめています。気になるテーマから拾ってください。
            </p>
          </div>

          <div className="space-y-12">
            {(["INSURANCE", "LEASE", "MONEY", "MAINTENANCE", ...categories] as CategoryKey[])
              .filter((k, idx, arr) => arr.indexOf(k) === idx)
              .map((catKey) => {
                const items =
                  catKey === "ALL"
                    ? grouped.ALL
                    : (grouped[catKey] ?? []);

                if (!items || items.length === 0) return null;

                // sort by publishedAt desc
                const sorted = [...items].sort((a, b) => {
                  const da = new Date(a.publishedAt).getTime();
                  const db = new Date(b.publishedAt).getTime();
                  return db - da;
                });

                return (
                  <div key={catKey}>
                    <div className="mb-4 flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                          CATEGORY
                        </p>
                        <h3 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                          {CATEGORY_LABELS[catKey]}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                        {sorted.length} articles
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {sorted.slice(0, 12).map((g, idx) => (
                        <Reveal key={g.slug} delay={120 + idx * 20}>
                          <GuideCard guide={g} />
                        </Reveal>
                      ))}
                    </div>

                    {sorted.length > 12 && (
                      <div className="mt-4">
                        <GlassCard
                          padding="md"
                          magnetic={false}
                          className="border border-slate-100 bg-white/80 text-center shadow-soft"
                        >
                          <p className="text-[11px] leading-relaxed text-slate-600">
                            このカテゴリには{" "}
                            <span className="font-semibold text-slate-900">
                              {sorted.length}
                            </span>{" "}
                            本あります。今後、検索/フィルタを追加して探索性を上げます。
                          </p>
                        </GlassCard>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
