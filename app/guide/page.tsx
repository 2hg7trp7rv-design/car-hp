// app/guide/page.tsx
// ────────────────────────────────────────────
// GUIDE 一覧ページ（実用系コンテンツのハブ）
//
// 役割:
//  - 「買い方・維持費・売却」などお金/段取り系ガイドの一覧ページ
//  - 上部は “世界観＋ガイドの位置づけ” を伝えるヒーロー＆ナビ
//  - 中央はテーマ別のBentoグリッド（静的な「入口」）
//  - 下部は実データから生成されるガイド一覧（検索/絞り込み/ソート対応）
//  - NEWS/COLUMN/CARS との役割分担を明示し、回遊の起点にする
//
// 今後の拡張前提:
//  - guideSections は手動定義→将来的に guides.json 側のメタ情報で自動生成してもよい
//  - GuideItem に level / isFeatured などを生やしたら、下部一覧の表示スタイルを変える想定
//  - NEWS/COLUMN/CARS とのクロスリンクを増やすときは、一番下のCTAブロックを拡張
// ────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { getAllGuides, type GuideItem } from "@/lib/guides";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "GUIDE | CAR BOUTIQUE",
  description:
    "買い方 売り方 維持費 保険 税金など クルマとの付き合い方を整理するための実用ガイド集",
};

// ────────────────────────────────────────────
// UI用の静的セクション定義
//   - ここは「テーマ別の入口」の役割
//   - 実データ(guides.json)とは独立しているが、リンクを張れば実ガイドにも接続可能
// ────────────────────────────────────────────

type GuideTopic = {
  id: string;
  title: string;
  description: string;
  link?: string; // 紐づく実ガイドがある場合のみ
};

type GuideSection = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  icon: string;
  accent?: "default" | "tiffany" | "obsidian" | "glass";
  gridArea?: string;
  topics: GuideTopic[];
};

// 実ガイド記事へのリンク付きセクション（お金/売却などのテーマ別入口）
const guideSections: GuideSection[] = [
  {
    id: "buy",
    icon: "◎",
    label: "買い方・選び方のこと",
    subLabel: "BUYING",
    description:
      "予算の決め方 グレードやオプションの選び方 試乗のポイントなど 購入前に落ち着いて整理したいテーマをまとめたエリア",
    accent: "default",
    gridArea: "md:col-span-7 lg:col-span-7 lg:row-span-2",
    topics: [
      {
        id: "first-purchase",
        title: "はじめてのクルマ購入",
        description:
          "軽自動車 コンパクトカー ミニバン 輸入車 それぞれの「向き不向き」を整理する",
        link: "/guide/first-car-buying",
      },
      {
        id: "test-drive",
        title: "試乗でチェックしたいポイント",
        description:
          "乗り心地や静粛性だけでなく シート ポジション 視界の印象をメモしておく",
        link: "/guide/how-to-test-drive",
      },
      {
        id: "configuration",
        title: "グレードとオプションの考え方",
        description:
          "リセールと満足度のバランスを見ながら 「つける / つけない」を決めるための視点",
        link: "/guide/grade-and-options",
      },
    ],
  },
  {
    id: "money",
    icon: "¥",
    label: "お金と維持費のこと",
    subLabel: "FINANCE & COST",
    description:
      "ローン 残価設定ローン 保険 税金など クルマにかかる費用の全体像を整理するためのガイド",
    accent: "tiffany",
    gridArea: "md:col-span-7 lg:col-span-7 lg:row-span-2",
    topics: [
      {
        id: "loan-or-lump-sum",
        title: "ローン or 一括 どちらが良いか考えるときの基準",
        description:
          "金利 返済期間 売却タイミングを比較しながら判断するためのシンプルなフレーム",
        link: "/guide/loan-or-lump-sum",
      },
      {
        id: "maintenance-cost",
        title: "維持費のざっくり計算方法",
        description:
          "税金 保険 車検 整備費用を 年間いくらくらいかかりそうか見積もる",
        link: "/guide/maintenance-cost",
      },
      {
        id: "insurance",
        title: "自動車保険の選び方",
        description:
          "対人対物 無制限は前提として どこからが「付けすぎ」かを考える",
        link: "/guide/car-insurance-basics",
      },
    ],
  },
  {
    id: "sell",
    icon: "↔",
    label: "手放すときのポイント",
    subLabel: "SELLING",
    description:
      "乗り換えや売却を検討するときに確認しておきたい 査定 買取 下取りの違いや注意点を整理",
    accent: "obsidian",
    gridArea: "md:col-span-5 lg:col-span-5 lg:row-span-2",
    topics: [
      {
        id: "selling-without-rush",
        title: "慌てない売却のための段取り",
        description:
          "下取り 買取 個人売買の特徴とメリット デメリットを整理し スケジュールに余裕を持たせるための基本手順",
        link: "/guide/selling-without-rush",
      },
    ],
  },
];

// ────────────────────────────────────────────
// searchParams / フィルタ関連ユーティリティ
// ────────────────────────────────────────────

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  tag?: string | string[];
  sort?: string | string[];
};

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function getGuideTimestamp(guide: GuideItem): number {
  const fallback = guide.createdAt ?? guide.updatedAt ?? guide.date;
  if (!fallback) return 0;
  return new Date(fallback).getTime() || 0;
}

// ────────────────────────────────────────────
// ページ本体
// ────────────────────────────────────────────

export default async function GuidePage({ searchParams }: { searchParams?: SearchParams }) {
  const allGuides = await getAllGuides();

  const qRaw = toSingle(searchParams?.q);
  const categoryRaw = toSingle(searchParams?.category);
  const tagRaw = toSingle(searchParams?.tag);
  const sortRaw = toSingle(searchParams?.sort);

  const q = normalize(qRaw);
  const categoryFilter = normalize(categoryRaw);
  const tagFilter = normalize(tagRaw);
  const sort = sortRaw === "old" ? "old" : "new";

  const categories = Array.from(
    new Set(
      allGuides
        .map((g) => g.category as GuideItem["category"])
        .filter(
          (c): c is NonNullable<GuideItem["category"]> =>
            typeof c === "string" && c.length > 0,
        ),
    ),
  ).sort();

  const tags = Array.from(
    new Set(
      allGuides.flatMap((g) => {
        const meta = g as GuideItem & { tags?: string[] | null };
        return meta.tags ?? [];
      }),
    ),
  ).sort((a, b) => a.localeCompare(b, "ja"));

  // フィルタ適用
  const filteredGuides = allGuides.filter((guide) => {
    // キーワード検索
    if (q) {
      const meta = guide as GuideItem & {
        tags?: string[] | null;
        body?: string | null;
      };

      const haystack = [
        guide.title,
        guide.summary ?? "",
        meta.body ?? "",
        (meta.tags ?? []).join(" "),
        guide.category ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    // カテゴリ絞り込み
    if (categoryFilter && guide.category !== categoryFilter) {
      return false;
    }

    // タグ絞り込み
    if (tagFilter) {
      const meta = guide as GuideItem & {
        tags?: string[] | null;
      };

      if (!(meta.tags ?? []).includes(tagRaw)) {
        return false;
      }
    }

    return true;
  });

  // ソート適用
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    const ta = getGuideTimestamp(a);
    const tb = getGuideTimestamp(b);

    if (sort === "old") {
      return ta - tb;
    }

    // デフォルト: 新しい順
    return tb - ta;
  });

  const totalCount = sortedGuides.length;
  const totalAll = allGuides.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5FBFF] via-[#F7FAFB] to-[#F3F5F7]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
        {/* パンくず */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[10px] font-medium tracking-[0.24em] text-slate-400">
            <Link href="/" className="hover:text-slate-700">
              HOME
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700">GUIDE</span>
          </nav>
        </div>

        {/* ── ヒーローブロック ─────────────────────── */}
        <section className="mb-14 lg:mb-20">
          {/* 上段: タイトル＋概要 */}
          <Reveal>
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              <span className="inline-flex h-[7px] w-[7px] items-center justify-center rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(16,185,129,0.35)]" />
              <span>CAR BOUTIQUE · NEWS · COLUMNS · DATABASE</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="serif-heading text-4xl font-medium leading-[1.1] text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              GUIDE
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-xs font-medium leading-loose text-text-sub sm:text-sm">
                車に関するお得な情報をコンパクトに
              </p>

              {/* 関連コンテンツへの導線（Glassボタン） */}
              <div className="flex flex-col items-start gap-3 text-[11px] sm:items-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-300 bg-white/70 px-5 py-2 tracking-[0.2em]"
                >
                  <Link href="/column">VIEW COLUMNS</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* GUIDE内ナビ（アンカーリンク＋件数表示） */}
          <Reveal delay={260}>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-[10px] text-slate-500 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-col gap-1 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:gap-3">
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-50">
                  GUIDE NAV
                </span>
                <span>
                  全{" "}
                  <span className="font-semibold text-slate-800">{totalAll}</span>{" "}
                  本中{" "}
                  <span className="font-semibold text-slate-800">
                    {totalCount}
                  </span>{" "}
                  本を表示中
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="#sections"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:bg-slate-200"
                >
                  <span>THEMES</span>
                </a>
                <a
                  href="#index"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:bg-slate-200"
                >
                  <span>INDEX</span>
                </a>
                <a
                  href="#list"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:bg-slate-200"
                >
                  <span>ALL GUIDES</span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Bento グリッド（テーマ別入口） ───────────── */}
        <section id="sections" className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-12">
          {guideSections.map((section) => (
            <Reveal key={section.id}>
              <GlassCard className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:col-span-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-[9px] font-semibold tracking-[0.22em] text-slate-100">
                      <span>{section.icon}</span>
                      <span>{section.subLabel}</span>
                    </div>
                    <h2 className="serif-heading text-base text-slate-900 sm:text-lg">
                      {section.label}
                    </h2>
                    <p className="max-w-md text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                      {section.description}
                    </p>
                  </div>

                  <div className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 px-2 py-1 text-[9px] font-semibold tracking-[0.22em] text-slate-500 md:inline-flex">
                    <span>GUIDE</span>
                    <span className="h-[18px] w-[1px] bg-slate-200" />
                    <span>{section.topics.length} TOPICS</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {section.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={topic.link ?? "#"}
                      className="group inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-50 shadow-sm ring-1 ring-slate-900/5 hover:bg-slate-900"
                    >
                      <span className="translate-y-[0.5px]">→</span>
                      <span>{topic.title}</span>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </section>

        {/* ── GUIDE INDEX（一覧＋フィルタ） ───────────── */}
        <section id="index" className="mb-16 lg:mb-20">
          <Reveal>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
                  GUIDE INDEX
                </p>
                <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                  すべての実用ガイド一覧
                </h2>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
                公開日の新しい順に並んでいます 気になるテーマを選んでください
              </p>
            </div>
          </Reveal>

          {/* フィルタ UI（簡易版） */}
          <Reveal delay={120}>
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-[10px] text-slate-500 shadow-soft sm:px-6">
              <span>キーワード・カテゴリ・タグで絞り込み</span>
            </div>
          </Reveal>

          {/* 一覧 */}
          {sortedGuides.length === 0 ? (
            <Reveal delay={680}>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-6 text-[11px] text-slate-500">
                現在公開中のガイドはなし 今後追加予定
              </div>
            </Reveal>
          ) : (
            <div id="list" className="space-y-3">
              {sortedGuides.map((guide) => (
                <Reveal key={guide.slug}>
                  <article className="group rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-[11px] text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-300 hover:shadow-[0_18px_40px_rgba(56,189,248,0.18)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-slate-50">
                            GUIDE
                          </span>
                          {guide.category && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px]">
                              {guide.category}
                            </span>
                          )}
                        </div>
                        <h3 className="serif-heading text-sm text-slate-900">
                          <Link
                            href={`/guide/${guide.slug}`}
                            className="group-hover:underline group-hover:decoration-[1.5px] group-hover:underline-offset-[3px]"
                          >
                            {guide.title}
                          </Link>
                        </h3>
                        {guide.summary && (
                          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                            {guide.summary}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{guide.dateLabel}</span>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/90 text-[11px] text-slate-50 shadow-sm">
                          →
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
