"use client";

import { useEffect, useState } from "react";
import type { ColumnItem } from "@/lib/columns";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

type Props = { item: ColumnItem; };
type Heading = { id: string; text: string; level: 2 | 3; };

function parseBodyToBlocks(body: string) {
  const lines = body.split(/\r?\n/);
  const blocks: (string | Heading) =;
  let currentParagraph: string =;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push(currentParagraph.join(" "));
      currentParagraph =;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); return; }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({ id: `h3-${blocks.length}`, text: trimmed.slice(4).trim(), level: 3 });
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({ id: `h2-${blocks.length}`, text: trimmed.slice(3).trim(), level: 2 });
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
      const scrollTop = window.scrollY |

| window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) { setProgress(0); return; }
      setProgress(Math.min(1, Math.max(0, scrollTop / docHeight)));
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  },);
  return progress;
}

export default function ColumnReaderShell({ item }: Props) {
  const { blocks } = parseBodyToBlocks(item.body);
  const headings = blocks.filter((b): b is Heading => typeof b!== "string");
  const progress = useReadingProgress();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-white">
      {/* 読了プログレスバー */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-slate-100">
        <div className="h-full bg-gradient-to-r from-tiffany-300 to-tiffany-500 transition-[width] duration-100 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-24 sm:px-6 lg:flex-row lg:gap-16 lg:px-8">
        <article className="w-full lg:w-[68%]">
          <Reveal>
            <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.32em] text-tiffany-600">
              <span className="h-[1px] w-6 bg-tiffany-300" />COLUMN
            </div>
            <h1 className="mt-4 font-serif text-2xl font-semibold leading-relaxed tracking-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">
              {item.title}
            </h1>
          </Reveal>

          <div className="mt-8">
            {blocks.map((block, index) => {
              if (typeof block!== "string") {
                const Tag = block.level === 2? "h2" : "h3";
                const styleClass = block.level === 2 
                 ? "mt-12 mb-6 font-serif text-xl font-medium text-slate-900 sm:text-2xl"
                  : "mt-8 mb-4 text-base font-semibold tracking-wide text-slate-800";
                return <Reveal key={block.id} delay={100}><Tag id={block.id} className={styleClass}>{block.text}</Tag></Reveal>;
              }

              // ドロップキャップ：最初の段落の1文字目
              if (index === 0 && block.length > 0) {
                const firstChar = block;
                const rest = block.slice(1);
                return (
                  <Reveal key={index} delay={200}>
                    <p className="first-letter-float mt-4 text-sm leading-8 text-slate-600 sm:text-[16px] sm:leading-[2rem]">
                      <span className="first-letter-span">{firstChar}</span>{rest}
                    </p>
                  </Reveal>
                );
              }
              return <p key={index} className="mt-6 text-sm leading-8 text-slate-600 sm:text-[16px] sm:leading-[2rem]">{block}</p>;
            })}
          </div>

          <div className="mt-16 border-t border-slate-100 pt-10">
            <Link href="/column" className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-slate-500 hover:text-tiffany-600">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition group-hover:border-tiffany-400">←</span> BACK TO COLUMNS
            </Link>
          </div>
        </article>

        {/* 目次（PCのみ） */}
        <aside className="hidden w-[28%] lg:block">
          <div className="sticky top-32 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-md">
            <p className="mb-4 text-[10px] font-bold tracking-[0.25em] text-slate-400">CONTENTS</p>
            <ul className="space-y-3">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className={`block text-[11px] transition-colors hover:text-tiffany-600 ${h.level === 2? "font-medium text-slate-700" : "pl-3 text-slate-500"}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <style jsx global>{`
       .first-letter-float { text-indent: 0; }
       .first-letter-span {
          float: left; margin-right: 12px; margin-top: -6px; margin-bottom: -2px;
          font-family: var(--font-serif), serif; font-size: 3.8em; line-height: 0.85;
          font-weight: 500; color: #0ABAB5;
        }
      `}</style>
    </main>
  );
}
