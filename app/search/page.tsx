import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

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
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-search-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">SEARCH</span>
        </nav>

        <header className="mb-10 space-y-4">
          <Reveal>
            <p className="text-[10px] font-bold tracking-[0.32em] text-tiffany-600">
              SEARCH
            </p>
            <h1 className="serif-heading mt-3 text-3xl text-slate-900">
              サイト内検索
            </h1>
            <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-slate-600 sm:text-[14px]">
              車種名・症状・キーワードで、CARS / GUIDE / COLUMN / NEWS / HERITAGE を横断して探せます。
              <br />
              キーボード: <span className="font-semibold text-slate-800">/</span> または{" "}
              <span className="font-semibold text-slate-800">Ctrl/⌘ + K</span>
            </p>
          </Reveal>
        </header>

        <section>
          <Reveal delay={80}>
            <GlassCard className="border border-slate-200/80 bg-white/80 p-6" padding="none">
              <SearchClient initialQuery={initialQuery} initialType={initialType} />
            </GlassCard>
          </Reveal>
        </section>

        <section className="mt-10">
          <Reveal delay={140}>
            <GlassCard className="border border-slate-200/80 bg-white/70 p-6" padding="none">
              <h2 className="font-serif text-[14px] font-semibold text-slate-900">
                迷ったらここから
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
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
            </GlassCard>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
