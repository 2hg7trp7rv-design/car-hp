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
  guide: SearchDoc[];
  column: SearchDoc[];
};

type SearchPageParams = {
  q?: string | string[];
  type?: string | string[];
};

type PageProps = {
  searchParams?: Promise<SearchPageParams>;
};

async function resolveSearchParams(searchParams?: Promise<SearchPageParams>): Promise<SearchPageParams> {
  return (await searchParams) ?? {};
}

function asString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function normalizeType(input: string): SearchDocType | "all" {
  const t = String(input ?? "").trim().toLowerCase();
  if (!t || t === "all") return "all";
  if (t === "guide" || t === "guides") return "guide";
  if (t === "column" || t === "columns") return "column";
  return "all";
}

function stripInternal<T extends Record<string, unknown>>(doc: T): Omit<T, "_title" | "_haystack"> {
  const { _title, _haystack, ...pub } = doc as T & { _title?: string; _haystack?: string };
  return pub;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const q = asString(resolvedSearchParams.q).trim();
  const title = q ? `検索: ${q}` : "検索｜CAR BOUTIQUE JOURNAL";

  return {
    title,
    description: "症状・部品・使い方のキーワードで、ガイドとコラムを横断して探せます。",
    alternates: {
      canonical: `${getSiteUrl()}/search`,
    },
    robots: NOINDEX_ROBOTS,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const initialQuery = asString(resolvedSearchParams.q);
  const initialType = asString(resolvedSearchParams.type);

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
        guide: pick("guide", 6),
        column: pick("column", 6),
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
          lead="症状・部品・使い方のキーワードで、ガイドとコラムを横断して検索。ショートカット: / または Ctrl/⌘+K"
          imageSrc="/images/hero-top-desktop.jpeg"
          imageAlt="道路と車のある風景"
          posterVariant="generic"
          seedKey="search"
          stats={[
            { label: "範囲", value: "2カテゴリ横断", tone: "moss" },
            { label: "切替", value: "候補 / 結果を即切替", tone: "slate" },
            { label: "用途", value: "調べ直しの起点", tone: "clay" },
          ]}
          links={[
            { href: "/guide", label: "ガイドを読む" },
            { href: "/column", label: "コラムを読む" },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="cb-panel p-5 sm:p-6 lg:p-8">
            <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "検索" }]} className="mb-6" />

            <ArchiveSectionHeading
              eyebrow="サイト内検索"
              title="SEARCH"
              lead="症状・部品・使い方のキーワードで、ガイドとコラムを横断して検索。"
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
                <p>症状で探すときは、警告灯名だけでなく、部品名や現象名も一緒に試すと結果が増えます。</p>
                <p>使い方で探すときは「駐車監視」「乗り心地」「純正戻し」など、目的語を足すと探しやすくなります。</p>
                <p>カテゴリを迷う場合は「すべて」で始めて、あとから絞り込む方が早いです。</p>
              </div>
            </section>

            <section className="cb-panel-muted p-5 sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--text-tertiary)] uppercase">
                関連ページ
              </p>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/guide"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-1)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">ガイドから探す</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    判断順や確認項目を中心に探す入口です。
                  </div>
                </Link>
                <Link
                  href="/site-map"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-1)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">サイト全体から眺める</div>
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
                  <Link href="/guide">ガイドを読む</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/column">コラムを読む</Link>
                </Button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
