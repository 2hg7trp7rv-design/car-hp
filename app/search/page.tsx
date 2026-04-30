import type { Metadata } from "next";
import Link from "next/link";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getSearchIndex, searchSite } from "@/lib/search";
import type { SearchDoc, SearchDocType, SearchHit } from "@/lib/search/types";

import { SearchClient } from "./search-client";

export const dynamic = "force-dynamic";

type Suggestions = {
  cars: SearchDoc[];
  guide: SearchDoc[];
  column: SearchDoc[];
  news: SearchDoc[];
  heritage: SearchDoc[];
};

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

function normalizeType(input: string): SearchDocType | "all" {
  const t = String(input ?? "").trim().toLowerCase();
  if (!t || t === "all") return "all";
  if (t === "cars" || t === "car") return "cars";
  if (t === "guide" || t === "guides") return "guide";
  if (t === "column" || t === "columns") return "column";
  if (t === "news") return "news";
  if (t === "heritage") return "heritage";
  return "all";
}

function stripInternal<T extends Record<string, any>>(doc: T): Omit<T, "_title" | "_haystack"> {
  const { _title, _haystack, ...pub } = doc as any;
  return pub;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = asString(searchParams?.q).trim();
  const title = q ? `検索: ${q}` : "検索";

  return {
    title,
    description:
      "車種・症状・キーワードで、車種・ガイド・考察・ニュース・系譜を横断して探せます。",
    alternates: {
      canonical: "/search",
    },
    robots: NOINDEX_ROBOTS,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const initialQuery = asString(searchParams?.q);
  const initialType = asString(searchParams?.type);

  const qTrimmed = initialQuery.trim();
  const typeNormalized = normalizeType(initialType);

  let initialResults: SearchHit[] | null = null;
  let initialSuggestions: Suggestions | null = null;
  let initialTookMs: number | null = null;

  const started = Date.now();
  try {
    if (qTrimmed.length > 1) {
      initialResults = await searchSite({ q: qTrimmed, type: typeNormalized, limit: 30 });
    } else {
      const index = await getSearchIndex();

      const pick = (t: SearchDocType, n: number) =>
        index.docs
          .filter((doc) => doc.type === t)
          .slice(0, n)
          .map((doc) => stripInternal(doc));

      initialSuggestions = {
        cars: pick("cars", 6),
        guide: pick("guide", 6),
        column: pick("column", 6),
        news: pick("news", 6),
        heritage: pick("heritage", 6),
      };
    }
  } catch {
    initialResults = null;
    initialSuggestions = null;
  } finally {
    initialTookMs = Date.now() - started;
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "検索",
        item: `${getSiteUrl()}/search`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-search.webp" noUpscale />
      <JsonLd id="jsonld-search-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24 space-y-10">
        <ArchivePageHero
          eyebrow="検索"
          title="SEARCH"
          lead="車種名・症状・維持費・歴史などカテゴリをまたいで検索。ショートカット: / または Ctrl/⌘+K"
          imageSrc="/images/hero-top-desktop.jpeg"
          imageAlt="道路と車のある風景"
          posterVariant="generic"
          seedKey="search"
          stats={[
            { label: "範囲", value: "5カテゴリ横断", tone: "glow" },
            { label: "切替", value: "候補 / 結果を即切替", tone: "fog" },
            { label: "用途", value: "調べ直しの起点", tone: "wash" },
          ]}
          links={[
            { href: "/cars", label: "車種から探す" },
            { href: "/guide", label: "実用を見る" },
            { href: "/column", label: "視点を読む" },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="cb-panel p-5 sm:p-6 lg:p-8">
            <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "検索" }]} className="mb-6" />

            <ArchiveSectionHeading
              eyebrow="横断検索"
              title="SEARCH"
              lead="車種名・症状・維持費・歴史などカテゴリをまたいで検索。"
              className="mb-6 border-t-0 pt-0"
            />

            <SearchClient
              initialQuery={initialQuery}
              initialType={initialType}
              initialResults={initialResults ?? undefined}
              initialSuggestions={initialSuggestions ?? undefined}
              initialTookMs={initialTookMs}
            />
          </div>

          <div className="space-y-6">
            <section className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">検索のコツ</p>
              <h2 className="mt-4 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
                検索のコツ
              </h2>
              <div className="mt-5 space-y-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                <p>車種名だけで広く探し、次に型式やグレードで絞ると抜け漏れが減ります。</p>
                <p>症状で探すときは、警告灯名より部品名や現象名も一緒に試すと結果が増えます。</p>
                <p>カテゴリを迷う場合は「すべて」で始めて、あとから絞り込む方が早いです。</p>
              </div>
            </section>

            <section className="cb-panel-muted p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--text-tertiary)] uppercase">
                関連ページ
              </p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/compare"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-1)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">候補を横に置いて比べる</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    比較表で違いだけを見るページへ。
                  </div>
                </Link>
                <Link
                  href="/site-map"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-1)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">カテゴリ全体から眺める</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    検索語が固まらないときはサイトマップから。
                  </div>
                </Link>
              </div>
            </section>

            <section className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">カテゴリ</p>
              <h2 className="mt-4 text-[22px] font-semibold leading-[1.25] tracking-[-0.04em] text-[var(--text-primary)]">
                カテゴリから見る
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/cars">車種を見る</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/guide">実用を見る</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/column">視点を読む</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/heritage">系譜を読む</Link>
                </Button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
