// app/_internal/column-preview/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getColumnBySlugIncludingNonPublished, type ColumnItem } from "@/lib/columns";
import { evaluateColumnIndexability } from "@/lib/seo/indexability";

export const metadata: Metadata = {
  title: "COLUMN Preview (Internal)",
  description: "Preview draft COLUMN content and structure",
  robots: NOINDEX_ROBOTS,
};

type Props = { params: { slug: string } };

type Heading = { id: string; text: string; level: 2 | 3 };

type ParagraphBlock = { type: "paragraph"; text: string };
type HeadingBlock = { type: "heading"; heading: Heading };
type ListBlock = { type: "list"; items: string[] };

type Block = ParagraphBlock | HeadingBlock | ListBlock;

function parseBodyToBlocks(body: string): { blocks: Block[]; headings: Heading[] } {
  const lines = (body ?? "").split(/\r?\n/);
  const blocks: Block[] = [];
  const headings: Heading[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", text: currentParagraph.join(" ") });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: [...currentList] });
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const text = line.slice(4).trim();
      const heading: Heading = { id: `h3-${index}`, text, level: 3 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      const heading: Heading = { id: `h2-${index}`, text, level: 2 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      return;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      return;
    }

    flushList();
    currentParagraph.push(line);
  });

  flushParagraph();
  flushList();

  return { blocks, headings };
}

function safeLen(input: unknown): number {
  if (typeof input !== "string") return 0;
  return input.trim().length;
}

export default async function ColumnPreviewPage({ params }: Props) {
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  if (!slug) notFound();

  const item = await getColumnBySlugIncludingNonPublished(slug);
  if (!item) notFound();

  const report = evaluateColumnIndexability(item);
  const parsed = parseBodyToBlocks(item.body ?? "");

  const bodyLen = safeLen(item.body);
  const hCount = parsed.headings.length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-500">INTERNAL / COLUMN PREVIEW</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {item.titleJa ?? item.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-700">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            slug: <span className="font-mono">{item.slug}</span>
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">status: {item.status}</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">noindex: {item.noindex ? "true" : ""}</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">bodyLen: {bodyLen}</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">headings: {hCount}</span>

          <Link className="ml-auto text-sky-700 underline" href="/_internal/column-backlog">
            ← Backlog
          </Link>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">公開する時の最短チェック</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <span className="font-semibold">status</span> を <span className="font-mono">published</span> に変更
            </li>
            <li>
              <span className="font-semibold">noindex</span> を外す（<span className="font-mono">false</span> / 未設定）
            </li>
            <li>本文は目安 1200文字以上 + 見出し3つ以上（Indexability Dashboard で確認）</li>
          </ul>
          <p className="mt-2 text-[13px] text-slate-600">
            Indexability 判定: {report.indexable ? "indexable" : "non-indexable"}（理由: {report.reasons.join(", ")}
            ）
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Body Preview</h2>

        <div className="prose prose-slate mt-4 max-w-none">
          {parsed.blocks.map((b, idx) => {
            if (b.type === "heading") {
              if (b.heading.level === 2) {
                return (
                  <h2 key={b.heading.id ?? idx} id={b.heading.id}>
                    {b.heading.text}
                  </h2>
                );
              }
              return (
                <h3 key={b.heading.id ?? idx} id={b.heading.id}>
                  {b.heading.text}
                </h3>
              );
            }

            if (b.type === "list") {
              return (
                <ul key={`list-${idx}`}>
                  {b.items.map((it, i) => (
                    <li key={`${idx}-${i}`}>{it}</li>
                  ))}
                </ul>
              );
            }

            return <p key={`p-${idx}`}>{b.text}</p>;
          })}
        </div>
      </section>

      <div className="mt-6 text-xs text-slate-500">
        <p>
          ※ このページは internal 用（robots: noindex）です。公開ページ（/column/[slug]）は status が published のものだけ表示されます。
        </p>
      </div>
    </main>
  );
}
