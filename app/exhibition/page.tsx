import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const revalidate = 60 * 60;

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "主要カテゴリへ直接移動できる一覧ページです。",
  alternates: { canonical: "/exhibition" },
  robots: NOINDEX_ROBOTS,
};

type Room = {
  href: string;
  label: string;
  description: string;
};

const rooms: Room[] = [
  { href: "/", label: "ホーム", description: "トップページへ戻る" },
  { href: "/cars", label: "車種", description: "メーカーや価格帯から候補を探す" },
  { href: "/column", label: "視点", description: "論点や選び方を読む" },
  { href: "/guide", label: "実用", description: "買う前と乗った後を整理する" },
  { href: "/heritage", label: "系譜", description: "背景や転換点をたどる" },
];

export default function ExhibitionPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "カテゴリ一覧", item: `${getSiteUrl()}/exhibition` },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <JsonLd id="jsonld-exhibition-breadcrumb" data={breadcrumbData} />
      <div className="page-shell pb-24 pt-24">
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 shadow-soft-card sm:p-8">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "カテゴリ一覧" }]} className="mb-6" />

          <header className="max-w-2xl">
            <p className="cb-eyebrow text-[var(--accent-base)] opacity-100">カテゴリ一覧</p>
            <h1 className="cb-sans-heading mt-4 text-[30px] leading-[1.22] text-[var(--text-primary)] sm:text-[36px]">
              主要カテゴリの一覧です。
            </h1>
            <p className="cb-lead mt-4 text-[var(--text-secondary)]">
              ホーム・車種・視点・ガイド・歴史へ直接移動。
            </p>
          </header>

          <section aria-label="主要カテゴリ" className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[18px] border border-[var(--border-default)] bg-[var(--surface-2)] p-5 transition-colors duration-150 hover:border-[rgba(27,63,229,0.3)] hover:bg-[rgba(228,219,207,0.58)]"
              >
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">{item.label}</h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
