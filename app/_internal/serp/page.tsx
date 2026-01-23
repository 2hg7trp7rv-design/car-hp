// app/_internal/serp/page.tsx

import type { Metadata } from "next";

import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars, type CarItem } from "@/lib/cars";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { getAllHeritage, type HeritageItem } from "@/lib/heritage";
import {
  buildCarDescription,
  buildCarTitleBase,
  buildColumnDescription,
  buildColumnTitleBase,
  buildGuideDescription,
  buildGuideTitleBase,
  buildHeritageDescription,
  buildHeritageTitleBase,
} from "@/lib/seo/serp";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "SERP Dashboard (Internal)",
  description: "Title/description coverage and length checks (noindex)",
  robots: NOINDEX_ROBOTS,
};

function len(s: unknown): number {
  if (typeof s !== "string") return 0;
  return s.trim().length;
}

type Row = {
  kind: "CARS" | "COLUMN" | "GUIDE" | "HERITAGE";
  slug: string;
  hasSeoTitle: boolean;
  hasSeoDescription: boolean;
  titleLen: number;
  descLen: number;
  title: string;
  description: string;
  url: string;
};

function toRows(base: string, kind: Row["kind"], items: any[]): Row[] {
  return items
    .filter((it) => it && typeof it.slug === "string" && it.slug.trim().length > 0)
    .map((it) => {
      let title = "";
      let description = "";
      if (kind === "CARS") {
        title = buildCarTitleBase(it as CarItem);
        description = buildCarDescription(it as CarItem);
      } else if (kind === "COLUMN") {
        title = buildColumnTitleBase(it as ColumnItem);
        description = buildColumnDescription(it as ColumnItem);
      } else if (kind === "GUIDE") {
        title = buildGuideTitleBase(it as GuideItem);
        description = buildGuideDescription(it as GuideItem);
      } else if (kind === "HERITAGE") {
        title = buildHeritageTitleBase(it as HeritageItem);
        description = buildHeritageDescription(it as HeritageItem);
      }

      const url = `${base}/${kind.toLowerCase()}/${encodeURIComponent(it.slug)}`;
      return {
        kind,
        slug: it.slug,
        hasSeoTitle: len(it.seoTitle) > 0,
        hasSeoDescription: len(it.seoDescription) > 0,
        titleLen: len(title),
        descLen: len(description),
        title,
        description,
        url,
      };
    })
    .sort((a, b) => {
      // 1) seoTitle/seoDescription が無いものを優先
      const aMissing = Number(!a.hasSeoTitle) + Number(!a.hasSeoDescription);
      const bMissing = Number(!b.hasSeoTitle) + Number(!b.hasSeoDescription);
      if (aMissing !== bMissing) return bMissing - aMissing;

      // 2) タイトル/ディスクリプションが長すぎるもの
      const aLong = Number(a.titleLen > 60) + Number(a.descLen > 160);
      const bLong = Number(b.titleLen > 60) + Number(b.descLen > 160);
      if (aLong !== bLong) return bLong - aLong;

      // 3) slug
      return a.slug.localeCompare(b.slug);
    });
}

export default async function InternalSerpDashboardPage() {
  const base = getSiteUrl().replace(/\/+$/, "");

  const [cars, columns, guides, heritage] = await Promise.all([
    getAllCars().catch(() => [] as CarItem[]),
    getAllColumns().catch(() => [] as ColumnItem[]),
    getAllGuides().catch(() => [] as GuideItem[]),
    getAllHeritage().catch(() => [] as HeritageItem[]),
  ]);

  const rows: Row[] = [
    ...toRows(base, "CARS", cars),
    ...toRows(base, "COLUMN", columns),
    ...toRows(base, "GUIDE", guides),
    ...toRows(base, "HERITAGE", heritage),
  ];

  const totals = {
    all: rows.length,
    missingSeoTitle: rows.filter((r) => !r.hasSeoTitle).length,
    missingSeoDescription: rows.filter((r) => !r.hasSeoDescription).length,
    longTitle: rows.filter((r) => r.titleLen > 60).length,
    longDesc: rows.filter((r) => r.descLen > 160).length,
  };

  const top = rows.slice(0, 200);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-500">
          INTERNAL / SERP
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          SERP Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          title/description の “抜け” と “長さ” を一覧で点検する内部ページです。
          （robots: noindex / disallow）
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Summary</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Missing seoTitle</th>
                <th className="py-2 pr-4">Missing seoDescription</th>
                <th className="py-2 pr-4">Title &gt; 60</th>
                <th className="py-2 pr-4">Desc &gt; 160</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr>
                <td className="py-2 pr-4">{totals.all}</td>
                <td className="py-2 pr-4">{totals.missingSeoTitle}</td>
                <td className="py-2 pr-4">{totals.missingSeoDescription}</td>
                <td className="py-2 pr-4">{totals.longTitle}</td>
                <td className="py-2 pr-4">{totals.longDesc}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Rows (top 200)
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          優先度順: missing seo → 長すぎ → slug
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Kind</th>
                <th className="py-2 pr-4">Slug</th>
                <th className="py-2 pr-4">seoTitle</th>
                <th className="py-2 pr-4">seoDesc</th>
                <th className="py-2 pr-4">TitleLen</th>
                <th className="py-2 pr-4">DescLen</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Link</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {top.map((r) => {
                const warnTitle = r.titleLen > 60;
                const warnDesc = r.descLen > 160;

                return (
                  <tr key={`${r.kind}:${r.slug}`} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-4 font-mono text-[12px]">{r.kind}</td>
                    <td className="py-2 pr-4 font-mono text-[12px]">{r.slug}</td>
                    <td className="py-2 pr-4">
                      {r.hasSeoTitle ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          ok
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                          missing
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {r.hasSeoDescription ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          ok
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                          missing
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={warnTitle ? "text-rose-700" : "text-slate-700"}>
                        {r.titleLen}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={warnDesc ? "text-rose-700" : "text-slate-700"}>
                        {r.descLen}
                      </span>
                    </td>
                    <td className="py-2 pr-4 max-w-[360px]">
                      <div className="line-clamp-3">{r.title}</div>
                    </td>
                    <td className="py-2 pr-4 max-w-[420px]">
                      <div className="line-clamp-3">{r.description}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <a
                        className="text-sky-700 underline"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        open
                      </a>
                    </td>
                  </tr>
                );
              })}

              {top.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={9}>
                    none
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
