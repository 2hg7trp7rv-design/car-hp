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

import { guides } from "@/data/guides";
import { GlassCard } from "@/components/GlassCard";
import { PageFadeIn } from "@/components/animation/PageFadeIn";
import { Reveal } from "@/components/animation/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideCategoryBadge } from "@/components/ui/guide-category-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "GUIDE | CAR BOUTIQUE",
  description:
    "クルマの買い方・維持費・売却など、ライフサイクル全体を落ち着いて整理するための実用ガイド。お金や手続きまわりを俯瞰しながら、次に何を確認すべきかを静かに整えるためのナビゲーションハブです。",
};

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

type GuideCategory =
  | "BUYING"
  | "SELLING"
  | "FINANCE_COST"
  | "MAINTENANCE"
  | "TROUBLE"
  | "LIFESTYLE";

type GuideTopic = {
  id: string;
  label: string;
  description: string;
  category: GuideCategory;
  icon: string;
  href?: string;
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
    id: "buying",
    label: "BUYING",
    subLabel: "買う前に落ち着いて整理したいこと",
    description:
      "初めての購入・乗り換え・増車など、大きなお金を動かす前に確認しておきたい前提や考え方をコンパクトにまとめたエリアです。",
    icon: "🪙",
    accent: "tiffany",
    gridArea: "buying",
    topics: [
      {
        id: "budget-and-loan",
        label: "予算とローンの組み方",
        description:
          "総額ではなく「毎月のキャッシュフロー」で考えるためのシンプルなフレーム。",
        category: "BUYING",
        icon: "📊",
        href: "/guide/budget-and-loan",
      },
      {
        id: "new-vs-used",
        label: "新車と中古車 どちらが自分向き？",
        description:
          "保証・故障リスク・値下がり幅など、雰囲気ではなく条件で比べるための視点。",
        category: "BUYING",
        icon: "⚖️",
        href: "/guide/new-vs-used",
      },
      {
        id: "spec-vs-grade",
        label: "グレード選びと「装備の優先順位」",
        description:
          "見栄えやカタログの言葉ではなく、日々の使用シーンから逆算して決めるコツ。",
        category: "BUYING",
        icon: "📝",
        href: "/guide/spec-vs-grade",
      },
    ],
  },
  {
    id: "finance-cost",
    label: "FINANCE & COST",
    subLabel: "お金まわりを俯瞰する",
    description:
      "購入費用・維持費・売却時の戻り・保険・税金など、お金の流れを「一枚の紙」に整理するイメージでまとめています。",
    icon: "💸",
    accent: "default",
    gridArea: "finance",
    topics: [
      {
        id: "maintenance-cost-basics",
        label: "維持費の基本内訳",
        description:
          "税金・保険・車検・消耗品など、毎年かかるお金を大まかに把握するためのガイド。",
        category: "FINANCE_COST",
        icon: "📑",
        href: "/guide/maintenance-cost-basics",
      },
      {
        id: "loan-early-repayment",
        label: "ローンの繰り上げ返済を考えるとき",
        description:
          "心理的な安心感と、実際の金利差・手数料をどう比較するかの考え方。",
        category: "FINANCE_COST",
        icon: "⏱️",
        href: "/guide/loan-early-repayment",
      },
      {
        id: "resale-value",
        label: "売却価格をざっくりイメージする",
        description:
          "相場サイトを見る前に、モデルチェンジサイクルや市場のクセを押さえておく理由。",
        category: "FINANCE_COST",
        icon: "📉",
        href: "/guide/resale-value",
      },
    ],
  },
  {
    id: "selling",
    label: "SELLING",
    subLabel: "手放すときに慌てないために",
    description:
      "乗り換え時期の決め方・査定の出し方・名義変更など、手放す前後で必要になる段取りを落ち着いて整理するためのエリアです。",
    icon: "🔁",
    accent: "glass",
    gridArea: "selling",
    topics: [
      {
        id: "timing-of-selling",
        label: "売却タイミングの考え方",
        description:
          "車検前・後・モデルチェンジ前後など、よくある「タイミング論」をどう扱うか。",
        category: "SELLING",
        icon: "🗓️",
        href: "/guide/timing-of-selling",
      },
      {
        id: "trade-in-vs-buyers",
        label: "下取りと買取 どちらを軸にする？",
        description:
          "手間・時間・価格のバランスを、自分のライフスタイルに合わせて選ぶための視点。",
        category: "SELLING",
        icon: "🏷️",
        href: "/guide/trade-in-vs-buyers",
      },
      {
        id: "procedure-checklist",
        label: "名義変更など 手続きチェックリスト",
        description:
          "「何を用意しておけば慌てないか」をコンパクトにまとめたチェックリスト。",
        category: "SELLING",
        icon: "✅",
        href: "/guide/procedure-checklist",
      },
    ],
  },
  {
    id: "maintenance",
    label: "MAINTENANCE",
    subLabel: "日々のケアと点検の基本",
    description:
      "トラブルを未然に防ぐための点検や、ディーラーと街工場の使い分けなど、愛車と長く付き合うための前提を整理します。",
    icon: "🧰",
    accent: "obsidian",
    gridArea: "maintenance",
    topics: [
      {
        id: "dealer-vs-independent",
        label: "ディーラーと専門工場の使い分け",
        description:
          "それぞれの得意分野と費用感をおさえて、相談先を選びやすくするための基礎知識。",
        category: "MAINTENANCE",
        icon: "🏭",
        href: "/guide/dealer-vs-independent",
      },
      {
        id: "maintenance-menu",
        label: "点検・整備メニューを読み解く",
        description:
          "メニュー表を見たときに、どこまでを「今やるか」「次回に回すか」判断しやすくする視点。",
        category: "MAINTENANCE",
        icon: "🧾",
        href: "/guide/maintenance-menu",
      },
      {
        id: "warning-lights",
        label: "警告灯が点いたときの初動",
        description:
          "すぐに止めるべきか・様子見していいのか、ざっくりとした判断の目安を整理します。",
        category: "TROUBLE",
        icon: "🚨",
        href: "/guide/warning-lights",
      },
    ],
  },
  {
    id: "lifestyle",
    label: "LIFESTYLE",
    subLabel: "カーライフの小さな工夫",
    description:
      "家族構成や趣味・通勤スタイルに合わせて、クルマとの付き合い方を少し快適にするためのヒントを集めます。",
    icon: "🌿",
    accent: "default",
    gridArea: "lifestyle",
    topics: [
      {
        id: "child-seat",
        label: "チャイルドシートとクルマ選び",
        description:
          "実際の取り付け・乗せ降ろしのしやすさに直結するポイントを、写真イメージとともに整理。",
        category: "LIFESTYLE",
        icon: "👶",
        href: "/guide/child-seat",
      },
      {
        id: "parking-lifestyle",
        label: "駐車環境から考えるクルマ選び",
        description:
          "立体駐車場・機械式・路上など、駐車環境がクルマ選びに与える影響を俯瞰します。",
        category: "LIFESTYLE",
        icon: "🅿️",
        href: "/guide/parking-lifestyle",
      },
      {
        id: "seasonal-care",
        label: "季節ごとのケアと準備",
        description:
          "冬タイヤ・バッテリー・ウォッシャー液など、季節で変わる「少しだけ気をつけるポイント」。",
        category: "MAINTENANCE",
        icon: "❄️",
        href: "/guide/seasonal-care",
      },
    ],
  },
];

// カテゴリ表示名
function getCategoryLabel(category: GuideCategory): string {
  switch (category) {
    case "BUYING":
      return "買い方・選び方";
    case "SELLING":
      return "売却・乗り換え";
    case "FINANCE_COST":
      return "お金・維持費";
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル・リスク";
    case "LIFESTYLE":
      return "ライフスタイル";
    default:
      return "ガイド";
  }
}

// searchParams→内部用文字列への変換
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

// ────────────────────────────────────────────
// コンポーネント本体
// ────────────────────────────────────────────

type GuidePageProps = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
    sort?: string | string[];
  };
};

export default function GuidePage({ searchParams }: GuidePageProps) {
  const rawQ = toSingle(searchParams?.q);
  const rawCategory = toSingle(searchParams?.category);
  const rawSort = toSingle(searchParams?.sort);

  const normalizedQ = normalize(rawQ);
  const normalizedCategory = normalize(rawCategory);
  const normalizedSort = normalize(rawSort || "new");

  // フィルタリング
  const filteredGuides = guides
    .filter((guide) => {
      // カテゴリ絞り込み
      if (normalizedCategory) {
        if (guide.category.toLowerCase() !== normalizedCategory) {
          return false;
        }
      }

      // キーワード検索
      if (normalizedQ) {
        const haystack = [
          guide.title,
          guide.description,
          guide.categoryLabel,
          guide.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedQ)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // ソート
      if (normalizedSort === "old") {
        return a.date.localeCompare(b.date);
      }

      // デフォルトは新しい順
      return b.date.localeCompare(a.date);
    });

  const totalCount = filteredGuides.length;
  const totalAll = guides.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5FBFF] via-[#F7FAFB] to-[#F3F5F7]">
      <PageFadeIn>
        {/* パンくず＋タブナビ */}
        <div className="border-b border-white/60 bg-white/60 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-[10px] font-medium tracking-[0.24em] text-slate-400">
              <Link href="/" className="hover:text-slate-700">
                HOME
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">GUIDE</span>
            </nav>

            <nav className="hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:flex">
              <Link
                href="/news"
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-700"
              >
                NEWS
              </Link>
              <span className="h-[18px] w-[1px] bg-slate-200" />
              <Link
                href="/column"
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-700"
              >
                COLUMN
              </Link>
              <span className="h-[18px] w-[1px] bg-slate-200" />
              <Link
                href="/cars"
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-700"
              >
                CARS
              </Link>
              <span className="h-[18px] w-[1px] bg-slate-200" />
              <Link
                href="/heritage"
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-700"
              >
                HERITAGE
              </Link>
            </nav>
          </div>
        </div>

        {/* コンテンツラッパー */}
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          {/* ── ヒーローブロック ─────────────────────── */}
          <section className="mb-14 lg:mb-20">
            {/* 上段: タイトル＋概要 */}
            <Reveal>
              <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                <span className="inline-flex h-[7px] w-[7px] items-center justify-center rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(16,185,129,0.35)]" />
                <span>CAR BOUTIQUE · NEWS · COLUMNS · DATABASE</span>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <nav className="mb-6 text-[11px] font-semibold tracking-[0.18em] text-slate-400 sm:text-[10px]">
                <span className="mr-2 text-slate-500">HOME</span>
                <span className="mx-1 text-slate-300">/</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-200">
                  GUIDE
                </span>
              </nav>
            </Reveal>

            {/* ── ページヘッダー ────────────────────────── */}
            <header className="mb-10 space-y-6 sm:mb-14 lg:mb-16">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="h-[1px] w-8 bg-tiffany-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-tiffany-600">
                    CAR BOUTIQUE GUIDE
                  </p>
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
                      variant="glass"
                      size="sm"
                      magnetic
                      className="rounded-full px-5 py-2 tracking-[0.2em]"
                    >
                      <Link href="/column">VIEW COLUMNS</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>

              {/* GUIDE内ナビ（アンカーリンク＋件数表示） */}
              <Reveal delay={260}>
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-[10px] text-slate-500 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-50">
                      GUIDE NAV
                    </span>
                    <span className="text-[10px] text-slate-500">
                      全{" "}
                      <span className="font-semibold text-slate-800">
                        {totalAll}
                      </span>{" "}
                      本中{" "}
                      <span className="font-semibold text-slate-800">
                        {totalCount}
                      </span>{" "}
                      本を表示中
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href="#index"
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:bg-slate-200"
                    >
                      <span>INDEX</span>
                    </a>
                    <a
                      href="#sections"
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-700 hover:bg-slate-200"
                    >
                      <span>THEMES</span>
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
            </header>

            {/* ── Bento グリッド（テーマ別入口） ───────────── */}
            <Reveal delay={320}>
              <section
                id="sections"
                className="grid grid-cols-1 gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:grid-cols-12 sm:p-5 lg:p-6"
              >
                {guideSections.map((section) => (
                  <GlassCard
                    key={section.id}
                    className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100/70 bg-gradient-to-b from-white/90 to-slate-50/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)] sm:col-span-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-[9px] font-semibold tracking-[0.22em] text-slate-100">
                          <span>{section.icon}</span>
                          <span>{section.label}</span>
                        </div>
                        <h2 className="serif-heading text-base text-slate-900 sm:text-lg">
                          {section.subLabel}
                        </h2>
                        <p className="max-w-md text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                          {section.description}
                        </p>
                      </div>

                      <div className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 px-2 py-1 text-[9px] font-semibold tracking-[0.22em] text-slate-500 sm:inline-flex">
                        <span>GUIDE</span>
                        <span className="h-[18px] w-[1px] bg-slate-200" />
                        <span>{section.topics.length} TOPICS</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {section.topics.map((topic) => (
                        <Link
                          key={topic.id}
                          href={topic.href ?? "#"}
                          className="group inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-50 shadow-sm ring-1 ring-slate-900/5 hover:bg-slate-900"
                        >
                          <span className="translate-y-[0.5px]">{topic.icon}</span>
                          <span>{topic.label}</span>
                        </Link>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </section>
            </Reveal>
          </section>

          {/* ── GUIDE INDEX（検索・絞り込み・ソート） ───────── */}
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

            <Reveal delay={80}>
              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 p-4 text-[11px] shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                {/* キーワード検索 */}
                <form className="flex flex-1 flex-wrap items-center gap-3">
                  <div className="w-full sm:w-64">
                    <label
                      htmlFor="q"
                      className="mb-1 block text-[9px] font-semibold tracking-[0.18em] text-slate-500"
                    >
                      検索キーワード
                    </label>
                    <input
                      id="q"
                      name="q"
                      defaultValue={rawQ}
                      placeholder="例: 維持費 ローン 売却タイミング など"
                      className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-300 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300"
                    />
                  </div>

                  {/* カテゴリ */}
                  <div className="w-full sm:w-44">
                    <label
                      htmlFor="category"
                      className="mb-1 block text-[9px] font-semibold tracking-[0.18em] text-slate-500"
                    >
                      CATEGORY
                    </label>
                    <Select name="category" defaultValue={normalizedCategory || "all"}>
                      <SelectTrigger className="h-8 w-full rounded-full border border-slate-200/80 bg-slate-50/80 px-3 text-[11px] text-slate-800 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300">
                        <SelectValue placeholder="すべて" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-slate-100/80 bg-white/95 text-[11px] shadow-soft">
                        <SelectItem value="all">すべて</SelectItem>
                        <SelectItem value="buying">買い方・選び方</SelectItem>
                        <SelectItem value="selling">売却・乗り換え</SelectItem>
                        <SelectItem value="finance_cost">お金・維持費</SelectItem>
                        <SelectItem value="maintenance">メンテナンス</SelectItem>
                        <SelectItem value="trouble">トラブル・リスク</SelectItem>
                        <SelectItem value="lifestyle">ライフスタイル</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ソート */}
                  <div className="w-full sm:w-52">
                    <label
                      htmlFor="sort"
                      className="mb-1 block text-[9px] font-semibold tracking-[0.18em] text-slate-500"
                    >
                      SORT
                    </label>
                    <Select name="sort" defaultValue={normalizedSort || "new"}>
                      <SelectTrigger className="h-8 w-full rounded-full border border-slate-200/80 bg-slate-50/80 px-3 text-[11px] text-slate-800 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300">
                        <SelectValue placeholder="新しい順" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-slate-100/80 bg-white/95 text-[11px] shadow-soft">
                        <SelectItem value="new">新しい順</SelectItem>
                        <SelectItem value="old">古い順</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200/80 bg-white/80 px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em]"
                    >
                      APPLY
                    </Button>
                  </div>
                </form>
              </div>
            </Reveal>

            {/* 絞り込み結果 */}
            <Reveal delay={120}>
              <div
                id="list"
                className="space-y-3 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:p-4 lg:p-5"
              >
                {filteredGuides.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-[11px] text-slate-500">
                    <p>条件に合うガイドが見つかりませんでした。</p>
                    <p>キーワードかカテゴリを少しゆるめてみてください。</p>
                  </div>
                ) : (
                  filteredGuides.map((guide) => (
                    <article
                      key={guide.slug}
                      className="group flex flex-col gap-3 rounded-xl border border-slate-100/80 bg-gradient-to-r from-white via-slate-50/80 to-slate-50/40 px-3 py-3 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-200/80 hover:shadow-[0_18px_40px_rgba(56,189,248,0.18)] sm:flex-row sm:items-center sm:px-4 sm:py-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200/80 bg-white/80 px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-slate-600"
                          >
                            GUIDE
                          </Badge>

                          <GuideCategoryBadge category={guide.category} />
                        </div>

                        <h3 className="serif-heading text-sm text-slate-900 sm:text-base">
                          <Link
                            href={`/guide/${guide.slug}`}
                            className="group-hover:underline group-hover:decoration-[1.5px] group-hover:underline-offset-[3px]"
                          >
                            {guide.title}
                          </Link>
                        </h3>

                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:text-[11px]">
                          {guide.description}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span>{guide.dateLabel}</span>
                          {guide.readTime && (
                            <>
                              <span className="h-[14px] w-[1px] bg-slate-200" />
                              <span>{guide.readTime}</span>
                            </>
                          )}
                          {guide.tags && guide.tags.length > 0 && (
                            <>
                              <span className="h-[14px] w-[1px] bg-slate-200" />
                              <span className="flex flex-wrap gap-1">
                                {guide.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:w-44 sm:flex-col sm:items-end sm:justify-center">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/90 text-[11px] text-slate-50 shadow-sm">
                            →
                          </span>
                          <span className="sm:hidden">詳細を見る</span>
                        </div>

                        <div className="hidden text-right text-[10px] text-slate-400 sm:block">
                          <p className="font-semibold uppercase tracking-[0.2em]">
                            READ
                          </p>
                          <p>ガイドの詳細へ</p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </Reveal>
          </section>

          {/* ── NEWS / COLUMN / CARS への回遊ブロック ────── */}
          <Reveal>
            <section className="rounded-3xl border border-slate-900/15 bg-slate-950/95 px-6 py-8 text-center text-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.65)] sm:px-10 sm:py-10">
              <div className="mx-auto max-w-3xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                  <span className="inline-flex h-[7px] w-[7px] items-center justify-center rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,0.45)]" />
                  <span>MORE STORIES</span>
                </span>
                <h3 className="serif-heading mb-6 text-2xl text-white sm:text-3xl">
                  ガイドと NEWS COLUMN CARS の関係
                </h3>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    variant="primary"
                    size="sm"
                    magnetic
                    className="rounded-full px-5 py-2 text-[11px] tracking-[0.18em]"
                  >
                    <Link href="/news">NEWS FEED</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-700 bg-white/5 px-5 py-2 text-[11px] tracking-[0.18em] text-slate-100 hover:bg-white/10"
                  >
                    <Link href="/column">COLUMN PICK</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="min-w-[160px] rounded-full border-slate-700 bg-white/5 px-5 py-2 text-[11px] tracking-[0.18em] text-slate-200 hover:bg-white/5"
                  >
                    <Link href="/cars">CARS DATABASE</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-slate-700/60 bg-white/5 px-5 py-2 text-[11px] tracking-[0.18em] text-slate-200 hover:bg-white/5"
                  >
                    <Link href="/news">NEWS FEED</Link>
                  </Button>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
      </PageFadeIn>
    </main>
  );
}
