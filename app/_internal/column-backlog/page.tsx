// app/_internal/column-backlog/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllColumnsIncludingNonPublished, type ColumnItem } from "@/lib/columns";
import { evaluateColumnIndexability } from "@/lib/seo/indexability";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

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
    .map((l) => l.trim())
    .filter((l) => l.startsWith("## ")).length;
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

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="mx-auto max-w-6xl px-5 py-10">
                  <div className="mb-6">
                    <p className="text-[11px] tracking-[0.22em] text-[#222222]/55">INTERNAL / COLUMN BACKLOG</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#222222]">COLUMN Backlog</h1>
                    <p className="mt-1 text-sm text-[#222222]/70">
                      COLUMN の下書き（draft）を一覧で確認する内部ページです。公開したい場合は、
                      <span className="font-semibold"> status を published に変更</span>し、
                      <span className="font-semibold"> noindex を外す</span>うえで本文の質（文字数/構造）を満たしてください。
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[#222222]/80">
                      <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Total: {total}</span>
                      <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Draft: {draft}</span>
                      <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Published: {published}</span>
                      <span className="rounded-full border border-[#222222]/10 bg-white px-3 py-1">Archived: {archived}</span>

                      <Link className="ml-auto text-sky-700 underline" href="/_internal/indexability">
                        Indexability Dashboard →
                      </Link>
                    </div>
                  </div>

                  <section className="rounded-2xl border border-[#222222]/10 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-[#222222]">Items</h2>
                    <p className="mt-1 text-xs text-[#222222]/70">
                      Preview は internal のみ（/column には出ません）。「open」から本文の構造を確認できます。
                    </p>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[1040px] text-[13px]">
                        <thead>
                          <tr className="border-b border-[#222222]/10 text-left text-[#222222]/70">
                            <th className="py-2 pr-4">Slug</th>
                            <th className="py-2 pr-4">Title</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Noindex</th>
                            <th className="py-2 pr-4">Pri</th>
                            <th className="py-2 pr-4">BodyLen</th>
                            <th className="py-2 pr-4">H2</th>
                            <th className="py-2 pr-4">Indexable?</th>
                            <th className="py-2 pr-4">TargetKW</th>
                            <th className="py-2 pr-4">Preview</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#222222]/85">
                          {itemsSorted.map((c) => {
                            const report = evaluateColumnIndexability(c);
                            const bodyLen = safeLen(c.body);
                            const h2 = countH2(c.body ?? "");
                            const targetKw = (c as any).targetKeyword ?? "";

                            return (
                              <tr key={c.slug} className="border-b border-[#222222]/10">
                                <td className="py-2 pr-4 font-mono text-[12px]">{c.slug}</td>
                                <td className="py-2 pr-4">{c.titleJa ?? c.title}</td>
                                <td className="py-2 pr-4">{c.status}</td>
                                <td className="py-2 pr-4">{c.noindex ? "true" : ""}</td>
                                <td className="py-2 pr-4">{c.planPriority ?? ""}</td>
                                <td className="py-2 pr-4">{bodyLen}</td>
                                <td className="py-2 pr-4">{h2}</td>
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
                                    href={`/_internal/column-preview/${encodeURIComponent(c.slug)}`}
                                  >
                                    open
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}

                          {itemsSorted.length === 0 ? (
                            <tr>
                              <td className="py-3 text-[#222222]/55" colSpan={10}>
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
  );}
