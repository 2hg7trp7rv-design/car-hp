import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

import { SearchClient } from "./search-client";

type PageProps = {
  searchParams?: {
    q?: string | string[];
    type?: string | string[];
  };
};

function asString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = asString(searchParams?.q).trim();
  const title = q ? `SEARCH｜${q}` : "SEARCH｜サイト内検索";

  return {
    title,
    description:
      "車種・症状・キーワードで、CARS/GUIDE/COLUMN/NEWS/HERITAGE を横断検索します。",
    alternates: {
      canonical: "/search",
    },
    robots: NOINDEX_ROBOTS,
  };
}

export default function SearchPage({ searchParams }: PageProps) {
  const initialQuery = asString(searchParams?.q);
  const initialType = asString(searchParams?.type);

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "SEARCH",
        item: `${getSiteUrl()}/search`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-search.webp" noUpscale />
      <JsonLd id="jsonld-search-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <div className="flex items-center justify-between">
          <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "SEARCH" }]} />
        </div>

        <header className="mt-10 text-center">
          <p className="cb-eyebrow text-[#0ABAB5] opacity-100">SEARCH</p>
          <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[#222222] sm:text-[40px]">
            サイト内検索
          </h1>
          <p className="cb-lead mx-auto mt-5 max-w-2xl text-[#222222]/70">
            車種名・症状・キーワードで、CARS / GUIDE / COLUMN / NEWS / HERITAGE を横断して探せます。
            <br />
            キーボード: <span className="font-semibold text-[#222222]">/</span> または{" "}
            <span className="font-semibold text-[#222222]">Ctrl/⌘ + K</span>
          </p>
        </header>

        <section className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <SearchClient initialQuery={initialQuery} initialType={initialType} />
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <h2 className="text-[14px] font-semibold tracking-[0.12em] text-[#222222]">
              迷ったらここから
            </h2>
            <p className="mt-3 text-[12px] leading-relaxed text-[#222222]/70">
              入口（START）→目的別HUB→比較表、の順に進むと迷いにくいです。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/start">START（入口）</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/cars">CARS（車種DB）</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/guide/hub-import-trouble">困った（症状HUB）</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/guide/hub-sell">売る（売却HUB）</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/news">NEWS（一次情報）</Link>
              </Button>
            </div>
          </div>
        </section>
        </div>

      </div>
    </main>
  );
}
