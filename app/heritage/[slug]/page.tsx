// app/heritage/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllHeritageNodes,
  getHeritageNodeBySlug,
  type HeritageNode,
} from "@/lib/heritage";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

// 静的パス生成（SSG）
export async function generateStaticParams() {
  const nodes = getAllHeritageNodes();
  return nodes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const node = getHeritageNodeBySlug(params.slug);

  if (!node) {
    return {
      title: "HERITAGE が見つかりません | CAR BOUTIQUE",
      description: "指定された HERITAGE ページが見つかりませんでした。",
    };
  }

  const baseTitle =
    node.kind === "ERA"
      ? node.title
      : `${node.brand} | ${node.tagline}`;

  const description =
    node.kind === "ERA"
      ? node.description
      : node.summary;

  return {
    title: `${baseTitle} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: baseTitle,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/heritage/${encodeURIComponent(
        node.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title: baseTitle,
      description,
    },
  };
}

// シンプルな段落分割ヘルパー（空行で区切る）
function splitBody(body?: string): string[] {
  if (!body) return [];
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function HeritageDetailPage({
  params,
}: PageProps) {
  const node = getHeritageNodeBySlug(params.slug);

  if (!node) {
    notFound();
  }

  const paragraphs = splitBody(node.body);
  const isEra = node.kind === "ERA";

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/heritage" className="hover:text-slate-800">
            HERITAGE
          </Link>
          <span className="mx-2">/</span>
          <span className="truncate align-middle text-slate-400">
            {isEra ? node.title : `${node.brand} ${node.tagline}`}
          </span>
        </nav>

        {/* ヘッダー */}
        <Reveal>
          <header className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                HERITAGE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>
                {isEra ? "ERA STORY" : "BRAND STORY"}
              </span>
            </div>

            <div className="space-y-2">
              {isEra ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {node.year}
                    {node.periodJa && <> / {node.periodJa}</>}
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {node.title}
                  </h1>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {node.brand}
                    {node.focusYears && <> / {node.focusYears}</>}
                  </p>
                  <h1 className="serif-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {node.tagline}
                  </h1>
                </>
              )}

              <p className="max-w-2xl text-[12px] leading-relaxed text-text-sub sm:text-sm">
                {isEra ? node.description : node.summary}
              </p>
            </div>

            {/* タグ（ERA のみ） */}
            {isEra && node.tags && node.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-50 px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </Reveal>

        {/* 本文 */}
        <Reveal delay={80}>
          <GlassCard className="bg-white/92 px-5 py-6 text-sm leading-7 text-slate-700 sm:px-6 sm:py-7 sm:text-[15px] sm:leading-8">
            {paragraphs.length === 0 ? (
              <p className="text-xs text-slate-400">
                詳細テキストは、順次追加予定です。
              </p>
            ) : (
              paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "" : "mt-4"}>
                  {p}
                </p>
              ))
            )}
          </GlassCard>
        </Reveal>

        {/* 下部ナビ */}
        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-slate-100 pt-6 text-[11px]">
          <Link
            href="/heritage"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
              ←
            </span>
            HERITAGE 一覧へ戻る
          </Link>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
            <Link
              href="/cars"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
            >
              CARS と照らし合わせる
            </Link>
            <Link
              href="/column"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 tracking-[0.16em] hover:border-tiffany-300"
            >
              COLUMN で関連テーマを読む
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
