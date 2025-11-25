// app/column/[slug]/reader-shell.tsx
"use client";

import { useEffect, useState } from "react";
import type { ColumnItem } from "@/lib/columns";
import Link from "next/link";

type Props = {
  item: ColumnItem;
};

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function parseBodyToBlocks(body: string): { blocks: (string | Heading)[] } {
  const lines = body.split(/\r?\n/);
  const blocks: (string | Heading)[] = [];

  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push(currentParagraph.join(" "));
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      const text = trimmed.slice(4).trim();
      blocks.push({
        id: `h3-${blocks.length}`,
        text,
        level: 3,
      });
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      const text = trimmed.slice(3).trim();
      blocks.push({
        id: `h2-${blocks.length}`,
        text,
        level: 2,
      });
      return;
    }

    currentParagraph.push(trimmed);
  });

  flushParagraph();

  return { blocks };
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY ?? window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const value = Math.min(1, Math.max(0, scrollTop / docHeight));
      setProgress(value);
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return progress;
}

export default function ColumnReaderShell({ item }: Props) {
  const { blocks } = parseBodyToBlocks(item.body);
  const headings = blocks.filter(
    (b): b is Heading => typeof b !== "string",
  );

  const progress = useReadingProgress();

  const dateLabel = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-slate-50 to-white">
      {/* 読了バー */}
      <div className="fixed inset-x-0 top-0 z-30 h-[3px] bg-slate-200/60">
        <div
          className="h-full bg-tiffany-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:flex-row lg:px-8">
        {/* 本文エリア */}
        <article className="w-full lg:w-[70%]">
          <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
            COLUMN
          </p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {item.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-text-sub">
            {dateLabel && <span>{dateLabel}</span>}
            {item.readMinutes && (
              <span>約{item.readMinutes}分で読めます</span>
            )}
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
              {mapCategoryLabel(item.category)}
            </span>
          </div>

          {/* ドロップキャップ風の一段落 */}
          <div className="mt-6 text-sm leading-relaxed text-text-sub sm:text-[15px]">
            {blocks.map((block, index) => {
              if (typeof block !== "string") {
                if (block.level === 2) {
                  return (
                    <h2
                      key={block.id}
                      id={block.id}
                      className="mt-8 text-base font-semibold text-slate-900 sm:text-lg"
                    >
                      {block.text}
                    </h2>
                  );
                }
                return (
                  <h3
                    key={block.id}
                    id={block.id}
                    className="mt-6 text-sm font-semibold text-slate-900"
                  >
                    {block.text}
                  </h3>
                );
              }

              const text = block;
              if (index === 0 && text.length > 0) {
                const firstChar = text[0];
                const rest = text.slice(1);
                return (
                  <p
                    key={`p-${index}`}
                    className="first-letter-float mt-4 text-sm leading-relaxed text-text-sub sm:text-[15px]"
                  >
                    <span className="first-letter-span">{firstChar}</span>
                    {rest}
                  </p>
                );
              }

              return (
                <p
                  key={`p-${index}`}
                  className="mt-4 text-sm leading-relaxed text-text-sub sm:text-[15px]"
                >
                  {text}
                </p>
              );
            })}
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6">
            <Link
              href="/column"
              className="inline-flex items-center justify-center rounded-full border border-tiffany-400/70 bg-white/80 px-6 py-2 text-xs font-medium tracking-[0.18em] text-tiffany-700 shadow-soft hover:bg-white"
            >
              コラム一覧へ戻る
            </Link>
          </div>
        </article>

        {/* TOCエリア（PCで右カラム） */}
        <aside className="hidden w-[30%] lg:block">
          <div className="sticky top-24 rounded-2xl border border-white/80 bg-white/90 p-4 text-[11px] text-text-sub shadow-soft-card backdrop-blur-md">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
              CONTENTS
            </p>
            {headings.length === 0 ? (
              <p className="mt-3 text-[11px] text-text-sub">
                見出し情報は順次整備していきます。
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className={[
                        "block leading-snug hover:text-tiffany-600",
                        h.level === 2 ? "font-medium" : "pl-3 text-[10px]",
                      ].join(" ")}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .first-letter-float {
          text-indent: 0;
        }
        .first-letter-span {
          float: left;
          margin-right: 6px;
          font-family: var(--font-serif);
          font-size: 2.4em;
          line-height: 0.9;
          font-weight: 600;
          color: #0f172a;
        }
      `}</style>
    </main>
  );
}

function mapCategoryLabel(category: ColumnItem["category"]): string {
  switch (category) {
    case "OWNER_STORY":
      return "オーナーの本音ストーリー";
    case "MAINTENANCE":
      return "メンテナンスとトラブルの裏側";
    case "TECHNICAL":
      return "技術・歴史・ブランドの物語";
    default:
      return "コラム";
  }
}
