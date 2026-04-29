import type { Metadata } from "next";
import Link from "next/link";

import { ArchivePageHero } from "@/components/archive/ArchivePageHero";
import { ArchiveSectionHeading } from "@/components/archive/ArchiveSectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars } from "@/lib/cars";

import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";

function parseCarsParam(param: unknown): string[] {
  const raw = Array.isArray(param) ? param[0] : param;
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniq(items: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of items) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

type CompareCarIndexItem = {
  slug: string;
  id: string;
  maker?: string;
  name?: string;
  heroImage?: string;

  bodyType?: string;
  segment?: string;
  drive?: string;
  releaseYear?: number;

  priceNew?: string;
  priceUsed?: string;

  engine?: string;
  transmission?: string;
  fuel?: string;
  powerPs?: number;
  torqueNm?: number;

  zeroTo100?: number | string;
  fuelEconomy?: string;

  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  weightKg?: number;

  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  troubleTrends?: string[];
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "COMPARE｜横に置く",
    description:
      "最大3台を横並びで比較し、買ってからの現実（維持費・弱点・傾向）まで要点だけを見る。",
    alternates: {
      canonical: "/compare",
    },
    robots: NOINDEX_ROBOTS,
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const all = await getAllCars();

  const cars: CompareCarIndexItem[] = all.map((car) => ({
    id: car.id,
    slug: car.slug,
    maker: car.maker,
    name: car.name,
    heroImage: car.heroImage ?? undefined,

    bodyType: car.bodyType ?? undefined,
    segment: car.segment ?? undefined,
    drive: car.drive ?? undefined,
    releaseYear: car.releaseYear ?? undefined,

    priceNew: car.priceNew ?? undefined,
    priceUsed: car.priceUsed ?? undefined,

    engine: car.engine ?? undefined,
    transmission: car.transmission ?? undefined,
    fuel: car.fuel ?? undefined,
    powerPs: car.powerPs ?? undefined,
    torqueNm: car.torqueNm ?? undefined,

    zeroTo100: car.zeroTo100 ?? undefined,
    fuelEconomy: car.fuelEconomy ?? undefined,

    lengthMm: car.lengthMm ?? undefined,
    widthMm: car.widthMm ?? undefined,
    heightMm: car.heightMm ?? undefined,
    wheelbaseMm: car.wheelbaseMm ?? undefined,
    weightKg: car.weightKg ?? undefined,

    summary: car.summary ?? undefined,
    strengths: car.strengths ?? undefined,
    weaknesses: car.weaknesses ?? undefined,
    troubleTrends: car.troubleTrends ?? undefined,
  }));

  const sp = (await searchParams) ?? {};

  const validSlugs = new Set(cars.map((car) => car.slug));
  const initialSlugs = uniq(parseCarsParam(sp.cars))
    .filter((slug) => validSlugs.has(slug))
    .slice(0, 3);

  const presetDefs: Array<{ id: string; label: string; slugs: string[] }> = [
    {
      id: "kei-sports",
      label: "軽スポーツ（Alto Works / S660 / Copen）",
      slugs: ["suzuki-alto-works-ha36s", "honda-s660-jw5", "daihatsu-copen-l880k"],
    },
    {
      id: "honda-sports",
      label: "ホンダ名作スポーツ（EK9 / DC2 / AP1）",
      slugs: ["honda-civic-type-r-ek9", "honda-integra-type-r-dc2", "honda-s2000-ap1"],
    },
    {
      id: "jdm-icons",
      label: "国産スポーツの象徴（NA1 / BNR34 / FD3S）",
      slugs: ["honda-nsx-na1", "nissan-skyline-gt-r-bnr34", "mazda-rx-7-fd3s-type-r"],
    },
  ];

  const presets = presetDefs
    .map((preset) => ({
      ...preset,
      slugs: preset.slugs.filter((slug) => validSlugs.has(slug)).slice(0, 3),
    }))
    .filter((preset) => preset.slugs.length >= 2);

  const buildPresetUrl = (slugs: string[]) =>
    `/compare?cars=${slugs.map((slug) => encodeURIComponent(slug)).join(",")}`;

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
        name: "車種比較",
        item: `${getSiteUrl()}/compare`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-compare.webp" noUpscale />
      <JsonLd id="jsonld-compare-breadcrumb" data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24 space-y-10">
        <ArchivePageHero
          eyebrow="比較"
          title="横に置くと、違いが出る。"
          lead="価格、維持費、弱点、傾向まで、同じ面で見比べるためのページです。"
          imageSrc="/images/hero-sedan-q60.webp"
          imageAlt="比較対象として並ぶセダンのイメージ"
          seedKey="compare"
          posterVariant="car"
          align="imageLeft"
          stats={[
            { label: "上限", value: "最大3台", tone: "glow" },
            { label: "比較軸", value: "価格 / 弱点 / 傾向", tone: "fog" },
            { label: "比較", value: "同じ面で見比べる", tone: "wash" },
          ]}
          links={[
            { href: "/cars", label: "車種から選ぶ" },
            { href: "/cars/segments", label: "用途から絞る" },
            { href: "/search", label: "検索から探す" },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="cb-panel p-5 sm:p-6 lg:p-8">
            <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "車種比較" }]} className="mb-6" />

            <ArchiveSectionHeading
              eyebrow="比較"
              title="違いが見える並びにする。"
              className="mb-6 border-t-0 pt-0"
            />

            <CompareClient cars={cars} initialSlugs={initialSlugs} />
          </div>

          <div className="space-y-6">
            {presets.length > 0 ? (
              <section className="cb-panel-muted p-5 sm:p-6">
                <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--text-tertiary)] uppercase">
                  すぐ試せる組み合わせ
                </p>
                <h2 className="mt-4 text-[22px] font-semibold leading-[1.25] tracking-[-0.04em] text-[var(--text-primary)]">
                  すぐ試せる比較セット
                </h2>
                <p className="mt-3 text-[13px] leading-[1.85] text-[var(--text-secondary)]">
                  よく比べられる組み合わせを、そのまま開けます。
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Link key={preset.id} href={buildPresetUrl(preset.slugs)} className="cb-chip">
                      {preset.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="cb-panel p-5 sm:p-6">
              <p className="cb-kicker">関連ページ</p>
              <h2 className="mt-4 text-[22px] font-semibold leading-[1.25] tracking-[-0.04em] text-[var(--text-primary)]">
                候補探しに戻る
              </h2>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/search"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-2)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">検索で候補を探す</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    型式や症状名から横断して候補を拾うページです。
                  </div>
                </Link>
                <Link
                  href="/cars/segments"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-2)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">用途から絞る</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    価格帯や使い方から、候補を狭められます。
                  </div>
                </Link>
                <Link
                  href="/cars"
                  className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.72)] px-4 py-4 transition-colors duration-150 hover:bg-[var(--surface-2)]"
                >
                  <div className="text-[15px] font-medium text-[var(--text-primary)]">車種一覧へ戻る</div>
                  <div className="mt-1 text-[12px] leading-[1.75] text-[var(--text-tertiary)]">
                    候補を一覧で見直したいときに。
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
