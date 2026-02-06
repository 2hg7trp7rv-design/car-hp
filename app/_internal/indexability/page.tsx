// app/_internal/indexability/page.tsx

import type { Metadata } from "next";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";
import type { GuideItem, HeritageItem } from "@/lib/content-types";
import { getSiteUrl } from "@/lib/site";
import {
  evaluateCarIndexability,
  evaluateColumnIndexability,
  evaluateGuideIndexability,
  evaluateHeritageIndexability,
  isIndexableCar,
  isIndexableColumn,
  isIndexableGuide,
  isIndexableHeritage,
} from "@/lib/seo/indexability";

export const metadata: Metadata = {
  title: "Indexability Dashboard (Internal)",
  description: "Indexability / noindex status for CAR BOUTIQUE JOURNAL",
  robots: NOINDEX_ROBOTS,
};

function safeLen(input: unknown): number {
  if (typeof input !== "string") return 0;
  return input.trim().length;
}

function shortenReasons(reasons: string[], max = 3): string {
  if (!reasons.length) return "";
  const head = reasons.slice(0, max).join(", ");
  return reasons.length > max ? `${head} …(+${reasons.length - max})` : head;
}

export default async function InternalIndexabilityPage() {
  const base = getSiteUrl().replace(/\/+$/, "");

  const [cars, columns, guides, heritage] = await Promise.all([
    getAllCars().catch(() => [] as CarItem[]),
    getAllColumns().catch(() => [] as ColumnItem[]),
    getAllGuides().catch(() => [] as GuideItem[]),
    getAllHeritage().catch(() => [] as HeritageItem[]),
  ]);

  const carsWithSlug = cars.filter((c) => c && c.slug);
  const columnsWithSlug = columns.filter((c) => c && c.slug);
  const guidesWithSlug = guides.filter((g) => g && (g as any).slug);
  const heritageWithSlug = heritage.filter((h) => h && (h as any).slug);

  const indexableCars = carsWithSlug.filter((c) => isIndexableCar(c));
  const nonIndexableCars = carsWithSlug.filter((c) => !isIndexableCar(c));

  const indexableColumns = columnsWithSlug.filter((c) => isIndexableColumn(c));
  const nonIndexableColumns = columnsWithSlug.filter((c) => !isIndexableColumn(c));

  const indexableGuides = guidesWithSlug.filter((g) => isIndexableGuide(g as any));
  const nonIndexableGuides = guidesWithSlug.filter((g) => !isIndexableGuide(g as any));

  const indexableHeritage = heritageWithSlug.filter((h) => isIndexableHeritage(h as any));
  const nonIndexableHeritage = heritageWithSlug.filter((h) => !isIndexableHeritage(h as any));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
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
          <table className="w-full min-w-[760px] text-sm">
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
                <td className="py-2 pr-4">{guidesWithSlug.length}</td>
                <td className="py-2 pr-4">{indexableGuides.length}</td>
                <td className="py-2 pr-4">{nonIndexableGuides.length}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4">COLUMN</td>
                <td className="py-2 pr-4">{columnsWithSlug.length}</td>
                <td className="py-2 pr-4">{indexableColumns.length}</td>
                <td className="py-2 pr-4">{nonIndexableColumns.length}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">HERITAGE</td>
                <td className="py-2 pr-4">{heritageWithSlug.length}</td>
                <td className="py-2 pr-4">{indexableHeritage.length}</td>
                <td className="py-2 pr-4">{nonIndexableHeritage.length}</td>
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
            isIndexableCar = false の車種（sitemap-cars から除外 / 詳細は noindex）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[840px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">ContentLen</th>
                  <th className="py-2 pr-4">BodyLen</th>
                  <th className="py-2 pr-4">Reasons</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableCars.map((c) => {
                  const report = evaluateCarIndexability(c);
                  return (
                    <tr key={c.slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{c.slug}</td>
                      <td className="py-2 pr-4">
                        {c.maker} {c.name}
                      </td>
                      <td className="py-2 pr-4">{report.metrics.contentLen ?? 0}</td>
                      <td className="py-2 pr-4">{report.metrics.bodyLen ?? 0}</td>
                      <td className="py-2 pr-4">{shortenReasons(report.reasons)}</td>
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
            Non-indexable GUIDE
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            isIndexableGuide = false の記事（sitemap-guides から除外 / 詳細は noindex）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[840px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">BodyLen</th>
                  <th className="py-2 pr-4">Reasons</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableGuides.map((g: any) => {
                  const report = evaluateGuideIndexability(g);
                  const slug = String(g.slug || "");
                  return (
                    <tr key={slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{slug}</td>
                      <td className="py-2 pr-4">{g.title}</td>
                      <td className="py-2 pr-4">{report.metrics.bodyLen ?? safeLen(g.body)}</td>
                      <td className="py-2 pr-4">{shortenReasons(report.reasons)}</td>
                      <td className="py-2 pr-4">
                        <a
                          className="text-sky-700 underline"
                          href={`${base}/guide/${encodeURIComponent(slug)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {nonIndexableGuides.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
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
            Non-indexable HERITAGE
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            isIndexableHeritage = false の読み物（sitemap-heritage から除外 / 詳細は noindex）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[840px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">BodyLen</th>
                  <th className="py-2 pr-4">Reasons</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableHeritage.map((h: any) => {
                  const report = evaluateHeritageIndexability(h);
                  const slug = String(h.slug || "");
                  return (
                    <tr key={slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{slug}</td>
                      <td className="py-2 pr-4">{h.title}</td>
                      <td className="py-2 pr-4">{report.metrics.bodyLen ?? safeLen(h.body)}</td>
                      <td className="py-2 pr-4">{shortenReasons(report.reasons)}</td>
                      <td className="py-2 pr-4">
                        <a
                          className="text-sky-700 underline"
                          href={`${base}/heritage/${encodeURIComponent(slug)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {nonIndexableHeritage.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
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
            <table className="w-full min-w-[840px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">BodyLen</th>
                  <th className="py-2 pr-4">Reasons</th>
                  <th className="py-2 pr-4">Link</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {nonIndexableColumns.map((c) => {
                  const report = evaluateColumnIndexability(c);
                  return (
                    <tr key={c.slug} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-[12px]">{c.slug}</td>
                      <td className="py-2 pr-4">{c.title}</td>
                      <td className="py-2 pr-4">{report.metrics.bodyLen ?? safeLen(c.body)}</td>
                      <td className="py-2 pr-4">{shortenReasons(report.reasons)}</td>
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
                    <td className="py-3 text-slate-500" colSpan={5}>
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
