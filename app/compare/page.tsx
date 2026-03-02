import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

import { getSiteUrl } from "@/lib/site";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { getAllCars } from "@/lib/cars";

import { CompareClient } from "./compare-client";

// クエリ（?cars=...）で比較対象を受け取るため、静的最適化を避ける。
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
  for (const v of items) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
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
  const title = "COMPARE｜車種比較（最大3台）";
  const description =
    "最大3台を横並びで比較し、買ってからの現実（維持費・弱点・傾向）まで判断材料を整理します。";

  return {
    title,
    description,
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

  const cars: CompareCarIndexItem[] = all.map((c) => ({
    id: c.id,
    slug: c.slug,
    maker: c.maker,
    name: c.name,
    heroImage: c.heroImage ?? undefined,

    bodyType: c.bodyType ?? undefined,
    segment: c.segment ?? undefined,
    drive: c.drive ?? undefined,
    releaseYear: c.releaseYear ?? undefined,

    priceNew: c.priceNew ?? undefined,
    priceUsed: c.priceUsed ?? undefined,

    engine: c.engine ?? undefined,
    transmission: c.transmission ?? undefined,
    fuel: c.fuel ?? undefined,
    powerPs: c.powerPs ?? undefined,
    torqueNm: c.torqueNm ?? undefined,

    zeroTo100: c.zeroTo100 ?? undefined,
    fuelEconomy: c.fuelEconomy ?? undefined,

    lengthMm: c.lengthMm ?? undefined,
    widthMm: c.widthMm ?? undefined,
    heightMm: c.heightMm ?? undefined,
    wheelbaseMm: c.wheelbaseMm ?? undefined,
    weightKg: c.weightKg ?? undefined,

    summary: c.summary ?? undefined,
    strengths: c.strengths ?? undefined,
    weaknesses: c.weaknesses ?? undefined,
    troubleTrends: c.troubleTrends ?? undefined,
  }));

  const sp = (await searchParams) ?? {};

  const validSlugs = new Set(cars.map((c) => c.slug));
  const initialSlugs = uniq(parseCarsParam(sp.cars))
    .filter((s) => validSlugs.has(s))
    .slice(0, 3);

  const presetDefs: Array<{ id: string; label: string; slugs: string[] }> = [
    {
      id: "kei-sports",
      label: "軽スポーツ（Alto Works / S660 / Copen）",
      slugs: ["suzuki-alto-works-ha36s", "honda-s660-jw5", "daihatsu-copen-l880k"],
    },
    {
      id: "honda-sports",
      label: "Honda名作スポーツ（EK9 / DC2 / AP1）",
      slugs: ["honda-civic-type-r-ek9", "honda-integra-type-r-dc2", "honda-s2000-ap1"],
    },
    {
      id: "jdm-icons",
      label: "JDMアイコン（NA1 / BNR34 / FD3S）",
      slugs: ["honda-nsx-na1", "nissan-skyline-gt-r-bnr34", "mazda-rx-7-fd3s-type-r"],
    },
  ];

  const presets = presetDefs
    .map((p) => ({
      ...p,
      slugs: p.slugs.filter((s) => validSlugs.has(s)).slice(0, 3),
    }))
    .filter((p) => p.slugs.length >= 2);

  const buildPresetUrl = (slugs: string[]) =>
    `/compare?cars=${slugs.map((s) => encodeURIComponent(s)).join(",")}`;

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
        name: "COMPARE",
        item: `${getSiteUrl()}/compare`,
      },
    ],
  };

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground imageSrc="/images/exhibit/kv-compare.webp" noUpscale />
      <JsonLd id="jsonld-compare-breadcrumb" data={breadcrumbData} />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Breadcrumb items={[{ label: "HOME", href: "/" }, { label: "COMPARE" }]} />
          </div>

          <header className="mt-10 space-y-4">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">COMPARE</p>
              <h1 className="serif-heading mt-4 text-[34px] tracking-[0.08em] text-[#222222] sm:text-[40px]">
                車種比較（最大3台）
              </h1>
              <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">
                候補を横並びで比較して、違いが一目で分かる状態にします。
                <br />
                まずは2台以上選ぶと判断が早いです。
                <br />
                迷ったら <Link className="underline" href="/canvas">Decision Canvas</Link> で候補を絞ってから戻ってください。
              </p>
            </Reveal>
          </header>

          {presets.length > 0 && (
            <section className="mt-8 rounded-2xl border border-[#222222]/10 bg-white/70 p-5">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/70">QUICK PRESETS</p>
              <p className="mt-2 text-[12px] leading-relaxed text-[#222222]/60">
                JavaScript が落ちた場合でも、下のリンクから最低限の比較（読み取り専用）ができます。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <Link
                    key={p.id}
                    href={buildPresetUrl(p.slugs)}
                    className="cb-tap inline-flex items-center rounded-full border border-[#222222]/12 bg-white px-4 py-2 text-[11px] font-semibold text-[#222222]/75 shadow-soft hover:bg-white"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <Reveal delay={80}>
              <GlassCard className="border border-[#222222]/10 bg-white p-6" padding="none">
                <CompareClient cars={cars} initialSlugs={initialSlugs} />
                <noscript>
                  <div className="mt-4 rounded-2xl border border-dashed border-[#222222]/12 bg-white/70 p-5 text-[12px] text-[#222222]/65">
                    比較機能の一部は JavaScript が必要です。
                    <div className="mt-2 text-[11px] text-[#222222]/55">
                      迷ったら <a className="underline" href="/canvas">Decision Canvas</a> で候補を整理してから戻ってください。
                    </div>
                  </div>
                </noscript>
              </GlassCard>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
