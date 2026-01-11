// app/_internal/indexability/page.tsx

import type { Metadata } from "next";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import { getSiteUrl } from "@/lib/site";
import { isIndexableCar, isIndexableColumn } from "@/lib/seo/indexability";

export const metadata: Metadata = {
  title: "Indexability Dashboard (Internal)",
  description: "Indexability / noindex status for CAR BOUTIQUE JOURNAL",
  robots: NOINDEX_ROBOTS,
};

function safeLen(input: unknown): number {
  if (typeof input !== "string") return 0;
  return input.trim().length;
}

function countList(input: unknown): number {
  if (!Array.isArray(input)) return 0;
  return input.filter((x) => typeof x === "string" && x.trim().length > 0).length;
}

export default async function InternalIndexabilityPage() {
  const base = getSiteUrl().replace(/\/+$/, "");

  const [cars, columns, guides, heritage] = await Promise.all([
    getAllCars().catch(() => [] as CarItem[]),
    getAllColumns().catch(() => [] as ColumnItem[]),
    getAllGuides().catch(() => []),
    getAllHeritage().catch(() => []),
  ]);

  const carsWithSlug = cars.filter((c) => c && c.slug);
  const columnsWithSlug = columns.filter((c) => c && c.slug);

  const indexableCars = carsWithSlug.filter((c) => isIndexableCar(c));
  const nonIndexableCars = carsWithSlug.filter((c) => !isIndexableCar(c));

  const indexableColumns = columnsWithSlug.filter((c) => isIndexableColumn(c));
  const nonIndexableColumns = columnsWithSlug.filter((c) => !isIndexableColumn(c));

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-500">
          INTERNAL / INDEXABILITY
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Indexability Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sitemap に出す/出さない、noindex の基準を運用しやすくするための内部ページです。
          （robots: noindex / disallow）
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Counts</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Total (slugあり)</th>
                <th className="py-2 pr-4">Indexable</th>
                <th className="py-2 pr-4">Noindex / Excluded</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">CARS</td>
                <td className="py-2 pr-4">{carsWithSlug.length}</td>
                <td className="py-2 pr-4">{indexableCars.length}</td>
                <td className="py-2 pr-4">{nonIndexableCars.length}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">GUIDE</td>
                <td className="py-2 pr-4">{guides.length}</td>
                <td className="py-2 pr-4">{guides.length}</td>
                <td className="py-2 pr-4">0</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">COLUMN</td>
                <td className="py-2 pr-4">{columnsWithSlug.length}</td>
                <td className="py-2 pr-4">{indexableColumns.length}</td>
                <td className="py-2 pr-4">{nonIndexableColumns.length}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">HERITAGE</td>
                <td className="py-2 pr-4">{heritage.length}</td>
                <td className="py-2 pr-4">{heritage.length}</td>
                <td className="py-2 pr-4">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Non-indexable CARS
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            isIndexableCar = false の車種（sitemap-cars から除外）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">SummaryLen</th>
                  <th className="py-2 pr-4">Strengths</th>
                  <th className="py-2 pr-4">Weak+Trouble</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableCars.map((c) => {
                  const summaryLen = safeLen(`${c.summaryLong ?? ""}\n${c.summary ?? ""}`);
                  const strengths = countList(c.strengths);
                  const concerns = countList(c.weaknesses) + countList(c.troubleTrends);

                  return (
                    <tr key={c.slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{c.slug}</td>
                      <td className="py-2 pr-4">
                        {c.maker} {c.name}
                      </td>
                      <td className="py-2 pr-4">{summaryLen}</td>
                      <td className="py-2 pr-4">{strengths}</td>
                      <td className="py-2 pr-4">{concerns}</td>
                      <td className="py-2 pr-4">
                        <a
                          className="text-sky-700 underline"
                          href={`${base}/cars/${encodeURIComponent(c.slug)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {nonIndexableCars.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      none
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Non-indexable COLUMN
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            isIndexableColumn = false のコラム（sitemap-columns から除外 / 詳細は noindex）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">BodyLen</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableColumns.map((c) => {
                  const bodyLen = safeLen(c.body);
                  return (
                    <tr key={c.slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{c.slug}</td>
                      <td className="py-2 pr-4">{c.title}</td>
                      <td className="py-2 pr-4">{bodyLen}</td>
                      <td className="py-2 pr-4">
                        <a
                          className="text-sky-700 underline"
                          href={`${base}/column/${encodeURIComponent(c.slug)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {nonIndexableColumns.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={4}>
                      none
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
