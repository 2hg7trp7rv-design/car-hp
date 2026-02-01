// app/column/[slug]/reader-shell.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { ColumnItem } from "@/lib/columns";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

type Props = { item: ColumnItem };

type Heading = { id: string; text: string; level: 2 | 3 };

type ParagraphBlock = { type: "paragraph"; text: string };
type HeadingBlock = { type: "heading"; heading: Heading };
type ListBlock = { type: "list"; items: string[] };

type Block = ParagraphBlock | HeadingBlock | ListBlock;

// Markdownライクな本文をブロックに分解
// - ## 見出し -> level 2
// - ### 見出し -> level 3
// - "- "で始まる行の連続 -> 箇条書き
// - その他 -> 段落（空行で区切り）
function parseBodyToBlocks(body: string): {
  blocks: Block[];
  headings: Heading[];
} {
  const lines = body.split(/\r?\n/);
  const blocks: Block[] = [];
  const headings: Heading[] = [];

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
      const heading: Heading = {
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
      const heading: Heading = {
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

// 本文内の装飾（URLリンク化 + **強調**のマーク除去）
// - https://〜 を <a> に変換
// - **text** はマークを消しつつ少し強調表示
function inlineNodes(text: string): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  const tokenRegex = /(\*\*.+?\*\*|https?:\/\/[^\s]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const start = match.index;
    const token = match[0];

    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      result.push(
        <span
          key={`${start}-bold`}
          className="font-semibold text-slate-900"
        >
          {inner}
        </span>,
      );
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      result.push(
        <a
          key={`${start}-link`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-tiffany-400/80 underline-offset-2"
        >
          {token}
        </a>,
      );
    } else {
      result.push(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop =
        window.scrollY ?? window.pageYOffset ?? 0;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight <= 0) {
        setProgress(0);
        return;
      }

      setProgress(
        Math.min(1, Math.max(0, scrollTop / docHeight)),
      );
    };

    handler();
    window.addEventListener("scroll", handler, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return progress;
}

function useActiveHeading(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        // 上から少し余白をとって「少し下に来たらその見出し」をアクティブ扱い
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

// OWNER_STORY は扱わず、実質残すのは
//・メンテナンス／トラブル
//・技術・歴史・ブランド
function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "MAINTENANCE":
    case "TROUBLE":
      return "メンテナンス・トラブル";
    case "MONEY":
      return "お金・支払い";
    case "MARKET":
      return "市場・価格動向";
    case "TECHNICAL":
    case "HISTORY":
      return "技術・歴史・ブランド";
    default:
      return "コラム";
  }
}

export default function ColumnReaderShell({ item }: Props) {
  const { blocks, headings } = parseBodyToBlocks(item.body);
  const progress = useReadingProgress();
  const activeHeadingId = useActiveHeading(headings);

  const heroImage = (item as ColumnItem & { heroImage?: string })
    .heroImage;

  // ドロップキャップ用フラグ
  let firstParagraphRendered = false;

  return (
    <main className="min-h-screen bg-site text-text-main">
      {/* 読了プログレスバー（薄いガラスレール × Tiffanyグラデ） */}
      <div className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto h-[3px] max-w-6xl rounded-full bg-slate-900/5 shadow-glass-inner backdrop-blur">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tiffany-300 via-tiffany-400 to-tiffany-600 transition-[width] duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-24 sm:px-6 lg:flex-row lg:gap-16 lg:px-8">
        {/* 読書カード */}
        <article className="w-full lg:w-[68%]">
          <GlassCard
            padding="lg"
            className="relative overflow-hidden border border-white/80 bg-white/95 px-5 py-6 text-text-main shadow-soft lg:px-8 lg:py-8"
          >
            {/* 背景の光 */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 top-[-20%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.18),_transparent_70%)] blur-3xl" />
              <div className="absolute -right-24 bottom-[-30%] h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.18),_transparent_75%)] blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* ラベル行 + メタ */}
              <Reveal>
                <header className="mb-8 border-b border-slate-100 pb-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-[1px] w-6 bg-tiffany-400" />
                      COLUMN
                    </span>
                    <span className="h-[1px] w-6 bg-slate-200" />
                    <span className="text-slate-500">
                      {mapCategoryLabel(item.category)}
                    </span>
                  </div>

                  <h1 className="serif-heading text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-3xl lg:text-[2.2rem]">
                    {item.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    {item.publishedAt && (
                      <span className="rounded-full bg-slate-50 px-3 py-1">
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                    {item.readMinutes && (
                      <span className="rounded-full bg-slate-50 px-3 py-1">
                        約{item.readMinutes}分で読めます
                      </span>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <>
                        <span className="h-[1px] w-6 bg-slate-200" />
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px]"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 4 && (
                            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] text-slate-400">
                              +{item.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </header>
              </Reveal>

              {/* ヒーロー画像（あれば） */}
              {heroImage && (
                <Reveal>
                  <div className="mb-8 overflow-hidden rounded-[1.75rem] border border-slate-100">
                    <img
                      src={heroImage}
                      alt={item.title}
                      className="max-h-[320px] w-full object-cover"
                    />
                  </div>
                </Reveal>
              )}

              {/* 本文 */}
              <div className="mt-4">
                {blocks.map((block, index) => {
                  if (block.type === "heading") {
                    const { heading } = block;
                    const Tag = heading.level === 2 ? "h2" : "h3";
                    const styleClass =
                      heading.level === 2
                        ? "mt-14 mb-6 font-serif text-xl font-medium text-slate-900 sm:text-[1.5rem]"
                        : "mt-9 mb-4 text-sm font-semibold tracking-[0.06em] text-slate-800";

                    return (
                      <Reveal key={heading.id} delay={100}>
                        <Tag id={heading.id} className={styleClass}>
                          {heading.text}
                        </Tag>
                      </Reveal>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <Reveal key={`list-${index}`} delay={80}>
                        <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-slate-800 sm:text-[15px] sm:leading-[1.9rem]">
                          {block.items.map((itemText, idx) => (
                            <li key={`${itemText}-${idx}`} className="flex gap-2">
                              <span className="mt-[7px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                              <span>{inlineNodes(itemText)}</span>
                            </li>
                          ))}
                        </ul>
                      </Reveal>
                    );
                  }

                  // paragraph
                  if (!firstParagraphRendered && block.text.trim().length) {
                    firstParagraphRendered = true;
                    const firstChar = block.text[0];
                    const rest = block.text.slice(1);

                    return (
                      <Reveal key={`p-${index}`} delay={160}>
                        <p className="first-letter-float mt-2 text-[13px] leading-8 text-slate-800 sm:text-[15px] sm:leading-[2rem]">
                          <span className="first-letter-span">
                            {firstChar}
                          </span>
                          {inlineNodes(rest)}
                        </p>
                      </Reveal>
                    );
                  }

                  return (
                    <Reveal key={`p-${index}`} delay={60}>
                      <p className="mt-6 text-[13px] leading-8 text-slate-800 sm:text-[15px] sm:leading-[2rem]">
                        {inlineNodes(block.text)}
                      </p>
                    </Reveal>
                  );
                })}
              </div>

              {/* 戻る導線（PCメイン） */}
              <div className="mt-16 border-t border-slate-100 pt-8">
                <Link
                  href="/column"
                  className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-slate-500 hover:text-tiffany-600"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-tiffany-400 group-hover:bg-tiffany-50/60">
                    ←
                  </span>
                  BACK TO COLUMNS
                </Link>
              </div>
            </div>
          </GlassCard>
        </article>

        {/* 目次（PCのみ） */}
        <aside className="hidden w-[28%] lg:block">
          <div className="sticky top-28 rounded-3xl border border-white/70 bg-white/80 p-6 text-[11px] text-slate-600 shadow-soft backdrop-blur">
            <p className="mb-4 text-[10px] font-bold tracking-[0.25em] text-slate-400">
              CONTENTS
            </p>

            {headings.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                このコラムには見出しが設定されていません。
              </p>
            ) : (
              <ul className="space-y-3">
                {headings.map((h) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={[
                          "block leading-relaxed transition-colors hover:text-tiffany-600",
                          h.level === 2
                            ? "font-medium text-slate-700"
                            : "pl-3 text-slate-500",
                          isActive ? "text-tiffany-700" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {h.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* 小さなヒント */}
            <p className="mt-6 border-t border-slate-100 pt-4 text-[10px] leading-relaxed text-slate-400">
              見出しをクリックすると、該当セクションまでスムーズにジャンプできます。
            </p>
          </div>
        </aside>
      </div>

      {/* ドロップキャップ用のグローバルスタイル（Bodoni × Tiffany） */}
      <style jsx global>{`
        .first-letter-float {
          text-indent: 0;
        }
        .first-letter-span {
          float: left;
          margin-right: 12px;
          margin-top: -4px;
          margin-bottom: -2px;
          font-family: var(--font-bodoni), serif;
          font-size: 3.4em;
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #0abab5;
          text-shadow: 0 12px 30px rgba(10, 186, 181, 0.35);
        }
      `}</style>
    </main>
  );
}
