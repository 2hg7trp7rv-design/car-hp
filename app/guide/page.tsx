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
          "金利 返済期間 売却タイミングを比較しながら判断するときの基本チェックポイント",
        link: "/guide/loan-or-lump-sum",
      },
      {
        id: "maintenance-cost-simulation",
        title: "維持費シミュレーションの基本",
        description:
          "税金 保険 車検 タイヤなどを 月いくら の目安で把握するためのシンプルな考え方",
        link: "/guide/maintenance-cost-simulation",
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
        title: "急がず売るための段取り",
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

type PageProps = {
  searchParams?: SearchParams;
};

// 日付表示用（ISO文字列→YYYY/MM/DD）
function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// ガイドカテゴリ表示用（一覧用のざっくりラベル）
function mapGuideCategoryLabel(
  category?: GuideItem["category"] | null,
): string {
  switch (category) {
    case "MONEY":
      return "お金・維持費";
    case "SELL":
      return "売却・乗り換え";
    case "BUY":
      return "購入計画";
    case "MAINTENANCE_COST":
      return "維持費・お金まわり";
    default:
      return "ガイド";
  }
}

// searchParams→内部用文字列への変換
function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

// 並び替えに使うタイムスタンプ
// - publishedAt 優先
// - なければ updatedAt
function getGuideTimestamp(guide: GuideItem): number {
  if (guide.publishedAt) {
    const t = new Date(guide.publishedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (guide.updatedAt) {
    const t = new Date(guide.updatedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

// 表示用の「主な日付」
// - publishedAt があればそれ
// - なければ updatedAt
function getGuidePrimaryDate(guide: GuideItem): string | null {
  if (guide.publishedAt) return guide.publishedAt;
  if (guide.updatedAt) return guide.updatedAt;
  return null;
}

// ────────────────────────────────────────────
// Page コンポーネント
// ────────────────────────────────────────────

export default async function GuidePage({ searchParams }: PageProps) {
  const allGuides = await getAllGuides();

  // searchParams からフィルタ条件を抽出
  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const categoryFilter = toSingle(searchParams?.category).trim();
  const tagFilter = toSingle(searchParams?.tag).trim();
  const sortKey = toSingle(searchParams?.sort).trim() || "newest";

  const totalGuides = allGuides.length;

  // 実データからカテゴリとタグの一覧を生成
  const categories = Array.from(
    new Set(
      allGuides
        .map((g) => g.category)
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
      const meta = guide as GuideItem & { tags?: string[] | null };
      if (!(meta.tags ?? []).includes(tagFilter)) {
        return false;
      }
    }

    return true;
  });

  // ソート適用
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    if (sortKey === "oldest") {
      return getGuideTimestamp(a) - getGuideTimestamp(b);
    }
    if (sortKey === "title") {
      return a.title.localeCompare(b.title, "ja");
    }
    if (sortKey === "category") {
      const ca = mapGuideCategoryLabel(a.category);
      const cb = mapGuideCategoryLabel(b.category);
      const diff = ca.localeCompare(cb, "ja");
      if (diff !== 0) return diff;
      return getGuideTimestamp(b) - getGuideTimestamp(a);
    }

    // default: newest
    return getGuideTimestamp(b) - getGuideTimestamp(a);
  });

  const filteredCount = sortedGuides.length;
  const hasFilter =
    Boolean(q) ||
    Boolean(categoryFilter) ||
    Boolean(tagFilter) ||
    sortKey !== "newest";

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="container relative max-w-7xl pb-28 pt-24">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">GUIDE</span>
        </nav>

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
                <p className="max-w-xs text-[10px] leading-relaxed text-slate-500">
                  実際のトラブル事例や ブランド 技術の背景は COLUMN セクション側で補足
                </p>
              </div>
            </div>
          </Reveal>

          {/* GUIDE内ナビ（アンカーリンク＋件数表示） */}
          <Reveal delay={260}>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-col gap-1 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:gap-3">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                  GUIDE NAV
                </span>
                <span className="tracking-[0.12em]">
                  全 {totalGuides} 本中{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredCount}
                  </span>{" "}
                  本を表示中
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {guideSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 tracking-[0.16em] text-slate-700 transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                    <span>{section.subLabel}</span>
                    <span className="text-[9px] text-slate-400">
                      ({section.topics.length})
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </header>

        {/* ── フィルタフォーム（検索/カテゴリ/タグ/ソート） ───────────── */}
        <section className="mb-12 rounded-3xl border border-slate-200/70 bg-white/80 px-4 py-4 shadow-soft-card sm:px-6 sm:py-5">
          <form className="flex flex-col gap-4 sm:gap-5" method="GET">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              {/* キーワード検索 */}
              <div className="w-full sm:max-w-md">
                <label
                  htmlFor="q"
                  className="mb-1 block text-[10px] font-semibold tracking-[0.18em] text-slate-500"
                >
                  検索キーワード
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={rawQ}
                  placeholder="例: 維持費 ローン 売却タイミング など"
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 outline-none ring-0 placeholder:text-slate-300 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300"
                />
              </div>

              {/* ソート */}
              <div className="w-full sm:w-52">
                <label
                  htmlFor="sort"
                  className="mb-1 block text-[10px] font-semibold tracking-[0.18em] text-slate-500"
                >
                  並び順
                </label>
                <div className="relative">
                  <select
                    id="sort"
                    name="sort"
                    defaultValue={sortKey || "newest"}
                    className="w-full appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 pr-8 text-[11px] text-slate-800 outline-none ring-0 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300"
                  >
                    <option value="newest">新しい順</option>
                    <option value="oldest">古い順</option>
                    <option value="title">タイトル順</option>
                    <option value="category">カテゴリ順</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* カテゴリ / タグフィルタ */}
            <div className="grid gap-3 text-[11px] sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-1 block text-[10px] font-semibold tracking-[0.18em] text-slate-500"
                >
                  カテゴリで絞り込む
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    defaultValue={categoryFilter || ""}
                    className="w-full appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 pr-8 text-[11px] text-slate-800 outline-none ring-0 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300"
                  >
                    <option value="">すべて</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {mapGuideCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                  「お金・維持費」「売却・乗り換え」など 大まかなテーマ単位での絞り込み
                </p>
              </div>

              <div>
                <label
                  htmlFor="tag"
                  className="mb-1 block text-[10px] font-semibold tracking-[0.18em] text-slate-500"
                >
                  タグで絞り込む
                </label>
                {tags.length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    まだタグ付きのガイドはありません。
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      id="tag"
                      name="tag"
                      defaultValue={tagFilter || ""}
                      className="w-full appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 pr-8 text-[11px] text-slate-800 outline-none ring-0 focus:border-tiffany-400 focus:ring-1 focus:ring-tiffany-300"
                    >
                      <option value="">すべて</option>
                      {tags.map((tag) => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                      ▼
                    </span>
                  </div>
                )}
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                  「残価設定ローン」「車検」「タイヤ」など 気になるキーワードでの絞り込み
                </p>
              </div>
            </div>

            {/* 適用ボタン＋ステータス */}
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                variant="subtle"
                size="sm"
                className="rounded-full px-4 py-2 text-[11px] tracking-[0.16em]"
              >
                条件を適用
              </Button>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  表示中:{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredCount}
                  </span>{" "}
                  / {totalGuides} 本
                </span>
                {hasFilter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                    <span>条件を変更するときは上部を再入力</span>
                  </span>
                )}
              </div>
              {hasFilter && (
                <Link
                  href="/guide"
                  className="text-[10px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  絞り込みをクリア
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* ── Bento Grid: テーマ別ガイド入口 ───────────────────── */}
        <section className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8">
          {guideSections.map((section, index) => {
            const delay = 320 + index * 120;

            const accentStyles: Record<
              NonNullable<GuideSection["accent"]>,
              string
            > = {
              default: "bg-white/80 border-white/60",
              tiffany:
                "bg-gradient-to-br from-tiffany-50 to-white border-tiffany-100",
              obsidian:
                "bg-slate-900 border-slate-800 text-white shadow-soft-strong",
              glass: "bg-white/40 backdrop-blur-md border-white/50",
            };

            const accent = section.accent ?? "default";
            const textMainColor =
              accent === "obsidian" ? "text-white" : "text-slate-900";
            const textSubColor =
              accent === "obsidian" ? "text-slate-300" : "text-text-sub";

            return (
              <div
                key={section.id}
                id={section.id}
                className={section.gridArea ?? "md:col-span-6"}
              >
                <Reveal delay={delay} className="h-full">
                  <GlassCard
                    as="article"
                    padding="none"
                    interactive
                    className={`
                      group relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8 transition-all duration-500
                      ${accentStyles[accent]}
                    `}
                  >
                    {/* ホバー時の光 */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-24 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.25),_transparent_65%)] blur-3xl" />
                    </div>

                    {/* 背景アイコン（大きな透かし） */}
                    <div
                      className={`pointer-events-none absolute -bottom-4 -right-4 select-none text-[120px] font-serif leading-none opacity-[0.05] sm:text-[150px] ${textMainColor}`}
                    >
                      {section.icon}
                    </div>

                    {/* コンテンツ本体 */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                              accent === "obsidian"
                                ? "text-tiffany-300"
                                : "text-tiffany-700"
                            }`}
                          >
                            {section.subLabel}
                          </span>
                          <h2
                            className={`mt-2 serif-heading text-xl font-medium sm:text-2xl ${textMainColor}`}
                          >
                            {section.label}
                          </h2>
                        </div>
                        {/* セクション内の件数バッジ */}
                        <span
                          className={`hidden rounded-full px-3 py-1 text-[10px] tracking-[0.16em] sm:inline-flex ${
                            accent === "obsidian"
                              ? "bg-white/10 text-slate-100"
                              : "bg-white/70 text-slate-600"
                          }`}
                        >
                          {section.topics.length} GUIDES
                        </span>
                      </div>

                      <p
                        className={`max-w-md text-[11px] leading-relaxed ${textSubColor}`}
                      >
                        {section.description}
                      </p>

                      {/* 各トピック→対応する実ガイドへの導線 */}
                      {section.topics.length > 0 && (
                        <ul className="mt-4 space-y-3 text-[11px]">
                          {section.topics.map((topic, topicIndex) => {
                            const content = (
                              <>
                                <div className="mb-0.5 flex items-center gap-2">
                                  <span className="text-[9px] tracking-[0.18em] text-slate-400">
                                    STEP {topicIndex + 1}
                                  </span>
                                  <p
                                    className={`font-semibold ${
                                      accent === "obsidian"
                                        ? "text-slate-50"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {topic.title}
                                  </p>
                                </div>
                                <p
                                  className={`text-[11px] leading-relaxed ${
                                    accent === "obsidian"
                                      ? "text-slate-300"
                                      : "text-text-sub"
                                  }`}
                                >
                                  {topic.description}
                                </p>
                              </>
                            );

                            return (
                              <li
                                key={topic.id}
                                className="flex items-start gap-2"
                              >
                                <span
                                  className={`mt-[7px] h-[3px] w-8 rounded-full ${
                                    accent === "obsidian"
                                      ? "bg-tiffany-400/80"
                                      : "bg-tiffany-300"
                                  }`}
                                />
                                <div>
                                  {topic.link ? (
                                    <Link
                                      href={topic.link}
                                      className="group/link inline-block"
                                    >
                                      <div className="inline-flex items-end gap-1">
                                        <span className="relative">
                                          {/* 下線アニメーション */}
                                          <span className="absolute -bottom-0.5 left-0 h-[1px] w-full origin-left scale-x-0 bg-tiffany-400 transition-transform duration-300 group-hover/link:scale-x-100" />
                                          <span className="relative">
                                            {content}
                                          </span>
                                        </span>
                                        <span
                                          className={`mb-0.5 text-[9px] ${
                                            accent === "obsidian"
                                              ? "text-tiffany-300"
                                              : "text-tiffany-500"
                                          }`}
                                        >
                                          → READ GUIDE
                                        </span>
                                      </div>
                                    </Link>
                                  ) : (
                                    content
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </GlassCard>
                </Reveal>
              </div>
            );
          })}
        </section>

        {/* ── 実ガイド一覧（動的データ） ──────────────────────── */}
        <section className="mt-16 sm:mt-20">
          <Reveal delay={640}>
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

          {sortedGuides.length === 0 ? (
            <Reveal delay={680}>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-6 text-[11px] text-slate-500">
                現在公開中のガイドはなし 今後追加予定
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedGuides.map((guide, index) => {
                const primaryDate = getGuidePrimaryDate(guide);
                return (
                  <Reveal key={guide.id} delay={680 + index * 40}>
                    <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                      <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                            {mapGuideCategoryLabel(guide.category)}
                          </span>
                          {primaryDate && (
                            <span className="ml-auto text-[10px] text-slate-400">
                              {formatDate(primaryDate)}
                            </span>
                          )}
                        </div>

                        <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                          {guide.title}
                        </h3>

                        {guide.summary && (
                          <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-text-sub">
                            {guide.summary}
                          </p>
                        )}
                      </GlassCard>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 下部CTA：GUIDEと他セクションの関係性を明示 ───────────── */}
        <section className="mt-24 lg:mt-28">
          <Reveal delay={800}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft-strong sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(10,186,181,0.36),_transparent_60%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.85),_transparent_65%)]" />
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04]" />

              <div className="relative z-10 flex flex-col items-center">
                <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                  INFORMATION
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
                    className="min-w-[160px] rounded-full px-6 py-3 text-[11px] tracking-[0.18em]"
                  >
                    <Link href="/cars">CAR DATABASE</Link>
                  </Button>
                  <Button
                    asChild
                    variant="glass"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-white/30 bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-100 backdrop-blur-sm hover:bg-white/10"
                  >
                    <Link href="/column">READ COLUMNS</Link>
                  </Button>
                  <Button
                    asChild
                    variant="subtle"
                    size="sm"
                    className="min-w-[160px] rounded-full border border-white/10 bg-transparent px-6 py-3 text-[11px] tracking-[0.18em] text-slate-200 hover:bg-white/5"
                  >
                    <Link href="/news">NEWS FEED</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
