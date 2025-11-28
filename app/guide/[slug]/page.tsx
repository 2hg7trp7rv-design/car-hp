// app/guide/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllGuides,
  getGuideBySlug,
  type GuideItem,
} from "@/lib/guides";
import {
  getAllColumns,
  type ColumnItem,
} from "@/lib/columns";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

type HeadingBlock = {
  id: string;
  text: string;
  level: 2 | 3;
};

type ContentBlock =
  | { type: "heading"; heading: HeadingBlock }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

// 日付表示用
function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// ガイドのカテゴリ表示用
function mapCategoryLabel(category: GuideItem["category"]): string {
  switch (category) {
    case "MONEY":
      return "お金・購入計画";
    case "SELL":
      return "売却・乗り換え";
    default:
      return "ガイド";
  }
}

// コラム側のカテゴリ表示用
function mapColumnCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
      return "メンテナンス・トラブル";
    case "TECHNICAL":
      return "ブランド・技術・歴史";
    default:
      return "コラム";
  }
}

// Markdownライクな本文をブロックに分解
// - ## 見出し -> level 2
// - ### 見出し -> level 3
// - "- " で始まる行の連続 -> 箇条書き
// - その他 -> 段落（空行で区切り）
function parseBody(body: string): {
  blocks: ContentBlock[];
  headings: HeadingBlock[];
} {
  const lines = body.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  const headings: HeadingBlock[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: "paragraph",
        text: currentParagraph.join(" "),
      });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({
        type: "list",
        items: [...currentList],
      });
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    // 空行 -> パラグラフ／リストを区切る
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    // 見出し（###）
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = line.slice(4).trim();
      const heading: HeadingBlock = {
        id: `h3-${index}`,
        text,
        level: 3,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    // 見出し（##）
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      const heading: HeadingBlock = {
        id: `h2-${index}`,
        text,
        level: 2,
      };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    // 箇条書き
    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      return;
    }

    // 通常テキスト -> 段落
    flushList();
    currentParagraph.push(line);
  });

  // 残りを反映
  flushParagraph();
  flushList();

  return { blocks, headings };
}

// ガイドに関連するコラムを抽出
async function getRelatedColumnsForGuide(
  guide: GuideItem,
): Promise<ColumnItem[]> {
  const allColumns = await getAllColumns();
  const guideTags = new Set(guide.tags ?? []);

  return allColumns
    .map((col) => {
      let score = 0;

      // タグの重なり
      if (col.tags && guideTags.size > 0) {
        const overlap = col.tags.filter((t) => guideTags.has(t)).length;
        if (overlap > 0) {
          score += 2 + overlap * 0.2;
        }
      }

      // ガイドカテゴリと相性の良さでざっくり加点
      if (guide.category === "MONEY") {
        // 維持費・お金系 → メンテナンス／技術どちらも対象になりやすい
        if (col.category === "MAINTENANCE" || col.category === "TECHNICAL") {
          score += 1;
        }
      } else if (guide.category === "SELL") {
        // 売却系 → 技術・歴史寄りの解説と相性がいいことが多い
        if (col.category === "TECHNICAL") {
          score += 1.5;
        }
      }

      // タイトル・サマリのざっくりキーワードマッチ
      const haystack = `${col.title} ${col.summary}`.toLowerCase();
      const words = (guide.title + " " + guide.summary)
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 1);

      if (words.some((w) => haystack.includes(w))) {
        score += 0.5;
      }

      return { col, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.col);
}

// 静的パス生成（Cloudflare Pages の SSG 用）
export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

// メタデータ
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません | CAR BOUTIQUE",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  const title = `${guide.title} | CAR BOUTIQUE`;
  const description =
    guide.summary ||
    "クルマの購入・維持・売却に関する実用情報をまとめたガイドです。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/guide/${encodeURIComponent(
        guide.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  const { blocks, headings } = parseBody(guide.body);
  const relatedColumns = await getRelatedColumnsForGuide(guide);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-slate-800">
            GUIDE
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400 truncate align-middle">
            {guide.title}
          </span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                GUIDE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>{mapCategoryLabel(guide.category)}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {guide.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {guide.readMinutes && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  約 {guide.readMinutes} 分で読めます
                </span>
              )}
              {guide.publishedAt && (
                <>
                  <span className="h-[1px] w-6 bg-slate-200" />
                  <span>最終更新 {formatDate(guide.publishedAt)}</span>
                </>
              )}
              {guide.tags && guide.tags.length > 0 && (
                <>
                  <span className="h-[1px] w-6 bg-slate-200" />
                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>

          {guide.summary && (
            <Reveal delay={220}>
              <p className="mt-5 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
                {guide.summary}
              </p>
            </Reveal>
          )}
        </header>

        {/* 本文＋目次レイアウト */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* 本文エリア */}
          <section className="w-full lg:w-[68%]">
            <GlassCard className="bg-white/90 px-5 py-6 sm:px-6 sm:py-7">
              {blocks.map((block, index) => {
                if (block.type === "heading") {
                  const Tag = block.heading.level === 2 ? "h2" : "h3";
                  const baseClass =
                    block.heading.level === 2
                      ? "mt-10 mb-4 text-base font-semibold tracking-[0.06em] text-slate-900 sm:text-lg"
                      : "mt-7 mb-3 text-sm font-semibold tracking-[0.04em] text-slate-800";

                  return (
                    <Reveal
                      key={block.heading.id}
                      delay={index === 0 ? 0 : 60}
                    >
                      <Tag id={block.heading.id} className={baseClass}>
                        {block.heading.text}
                      </Tag>
                    </Reveal>
                  );
                }

                if (block.type === "list") {
                  return (
                    <Reveal key={`list-${index}`} delay={80}>
                      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-[7px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  );
                }

                // paragraph
                return (
                  <p
                    key={`p-${index}`}
                    className="mt-4 text-sm leading-7 text-slate-700 sm:text-[15px] sm:leading-8"
                  >
                    {block.text}
                  </p>
                );
              })}
            </GlassCard>

            {/* 下部ナビ（SPメイン） */}
            <div className="mt-10 border-t border-slate-100 pt-6 lg:hidden">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                  ←
                </span>
                GUIDE 一覧へ戻る
              </Link>
            </div>
          </section>

          {/* 目次（PC） */}
          <aside className="hidden w-[32%] lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-[11px] text-slate-600 shadow-sm backdrop-blur">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                CONTENTS
              </p>

              {headings.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  このガイドには見出しが設定されていません。
                </p>
              ) : (
                <ul className="space-y-2">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={`block leading-relaxed hover:text-tiffany-600 ${
                          h.level === 3 ? "pl-3 text-slate-500" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">
                    ←
                  </span>
                  GUIDE 一覧に戻る
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* 関連コラム */}
        {relatedColumns.length > 0 && (
          <section className="mt-16">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600">
                このガイドと関連するコラム
              </h2>
              <Link
                href="/column"
                className="text-[11px] text-tiffany-700 underline-offset-4 hover:underline"
              >
                コラム一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedColumns.map((col) => (
                <Link key={col.id} href={`/column/${col.slug}`}>
                  <GlassCard className="h-full bg-white/90 p-4 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                        {mapColumnCategoryLabel(col.category)}
                      </span>
                      {col.readMinutes && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          約{col.readMinutes}分
                        </span>
                      )}
                      {col.publishedAt && (
                        <span className="ml-auto text-[10px] text-slate-400">
                          {formatDate(col.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-slate-900">
                      {col.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-sub">
                      {col.summary}
                    </p>

                    {col.tags && col.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500">
                        {col.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-50 px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                        {col.tags.length > 3 && (
                          <span className="rounded-full bg-slate-50 px-2 py-1">
                            +{col.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
