import type { Metadata } from "next";
import Link from "next/link";

import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { getAllColumnsIncludingNonPublished, type ColumnItem } from "@/lib/columns";
import {
  countDecisionMarkdownHeadings,
  getDecisionColumnAuditBody,
  getDecisionColumnStats,
  isDecisionColumn,
} from "@/lib/decision-article";
import { evaluateColumnIndexability } from "@/lib/seo/indexability";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "COLUMN Backlog (Internal)",
  description: "Draft / planned COLUMN inventory and outlines",
  robots: NOINDEX_ROBOTS,
};

function safeLen(input: unknown): number {
  if (typeof input !== "string") return 0;
  return input.trim().length;
}

function countH2(body: string): number {
  const src = (body ?? "").toString().replace(/\r\n/g, "\n");
  return src
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## ")).length;
}

function getDecisionMetrics(item: ColumnItem) {
  if (!isDecisionColumn(item)) {
    return {
      layoutVariant: item.layoutVariant ?? "legacy",
      generatedBodyLen: safeLen(item.body),
      generatedHeadings: countH2(item.body ?? ""),
      keyPointsCount: 0,
      checkpointsCount: 0,
      faqCount: 0,
      detailSectionsCount: 0,
      detailBlocksCount: 0,
    };
  }

  const auditBody = getDecisionColumnAuditBody(item);
  const stats = getDecisionColumnStats(item);

  return {
    layoutVariant: item.layoutVariant ?? "decision-v1",
    generatedBodyLen: auditBody.length,
    generatedHeadings: countDecisionMarkdownHeadings(auditBody),
    keyPointsCount: stats.keyPointsCount,
    checkpointsCount: stats.checkpointsCount,
    faqCount: stats.faqCount,
    detailSectionsCount: stats.detailSectionsCount,
    detailBlocksCount: stats.detailBlocksCount,
  };
}

export default async function ColumnBacklogPage() {
  const items = await getAllColumnsIncludingNonPublished().catch(() => [] as ColumnItem[]);

  const itemsSorted = [...items].sort((a, b) => {
    const pa = a.planPriority ?? 999;
    const pb = b.planPriority ?? 999;
    if (pa !== pb) return pa - pb;
    return (a.slug ?? "").localeCompare(b.slug ?? "");
  });

  const total = itemsSorted.length;
  const draft = itemsSorted.filter((x) => x.status === "draft").length;
  const published = itemsSorted.filter((x) => x.status === "published").length;
  const archived = itemsSorted.filter((x) => x.status === "archived").length;
  const decisionCount = itemsSorted.filter((x) => isDecisionColumn(x)).length;

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 p-6 text-[#222222] shadow-soft-card backdrop-blur sm:p-8">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <div className="mb-6">
              <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">INTERNAL / COLUMN BACKLOG</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#222222]">COLUMN Backlog</h1>
              <p className="mt-1 text-sm text-[#222222]/70">
                decision-v1 への移行状況と、indexability に効く構造要素をまとめて確認する内部ページです。
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[#222222]/80">
                <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Total: {total}</span>
                <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Draft: {draft}</span>
                <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Published: {published}</span>
                <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Archived: {archived}</span>
                <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Decision: {decisionCount}</span>

                <Link className="ml-auto text-sky-700 underline" href="/_internal/indexability">
                  Indexability Dashboard →
                </Link>
              </div>
            </div>

            <section className="rounded-2xl border border-[#222222]/10 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#222222]">Items</h2>
              <p className="mt-1 text-xs text-[#222222]/70">
                公開 Column は decision-v1 前提で、一覧も generated body 指標を主に見ます。互換用の非 decision data があれば raw body 指標で補助表示します。
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1560px] text-[13px]">
                  <thead>
                    <tr className="border-b border-[#222222]/10 text-left text-[#222222]/70">
                      <th className="py-2 pr-4">Slug</th>
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Variant</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Noindex</th>
                      <th className="py-2 pr-4">Pri</th>
                      <th className="py-2 pr-4">GenLen</th>
                      <th className="py-2 pr-4">Headings</th>
                      <th className="py-2 pr-4">Key</th>
                      <th className="py-2 pr-4">Check</th>
                      <th className="py-2 pr-4">FAQ</th>
                      <th className="py-2 pr-4">Sections</th>
                      <th className="py-2 pr-4">Blocks</th>
                      <th className="py-2 pr-4">Indexable?</th>
                      <th className="py-2 pr-4">TargetKW</th>
                      <th className="py-2 pr-4">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#222222]/85">
                    {itemsSorted.map((item) => {
                      const report = evaluateColumnIndexability(item);
                      const metrics = getDecisionMetrics(item);
                      const targetKw = (item as ColumnItem & { targetKeyword?: string | null }).targetKeyword ?? "";

                      return (
                        <tr key={item.slug} className="border-b border-[#222222]/10 align-top">
                          <td className="py-2 pr-4 font-mono text-[12px]">{item.slug}</td>
                          <td className="py-2 pr-4">{item.titleJa ?? item.title}</td>
                          <td className="py-2 pr-4">{metrics.layoutVariant}</td>
                          <td className="py-2 pr-4">{item.status}</td>
                          <td className="py-2 pr-4">{item.noindex ? "true" : ""}</td>
                          <td className="py-2 pr-4">{item.planPriority ?? ""}</td>
                          <td className="py-2 pr-4">{metrics.generatedBodyLen}</td>
                          <td className="py-2 pr-4">{metrics.generatedHeadings}</td>
                          <td className="py-2 pr-4">{metrics.keyPointsCount}</td>
                          <td className="py-2 pr-4">{metrics.checkpointsCount}</td>
                          <td className="py-2 pr-4">{metrics.faqCount}</td>
                          <td className="py-2 pr-4">{metrics.detailSectionsCount}</td>
                          <td className="py-2 pr-4">{metrics.detailBlocksCount}</td>
                          <td className="py-2 pr-4">
                            {report.indexable ? (
                              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">yes</span>
                            ) : (
                              <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">no</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">{targetKw}</td>
                          <td className="py-2 pr-4">
                            <Link
                              className="text-sky-700 underline"
                              href={`/_internal/column-preview/${encodeURIComponent(item.slug)}`}
                            >
                              open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}

                    {itemsSorted.length === 0 ? (
                      <tr>
                        <td className="py-3 text-[#222222]/55" colSpan={16}>
                          none
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
