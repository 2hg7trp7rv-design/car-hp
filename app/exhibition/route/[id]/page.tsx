import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { getExhibitionRoutes } from "@/lib/exhibit/routes";
import { RouteProgress } from "@/components/exhibit/RouteProgress";

export const revalidate = 60 * 60; // 1h

type Params = { id: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getExhibitionRoutes().map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const route = getExhibitionRoutes().find((r) => r.id === params.id);
  if (!route) return { title: "ROUTE｜EXHIBITION｜CAR BOUTIQUE JOURNAL" };

  return {
    title: `${route.title}｜EXHIBITION ROUTE｜CAR BOUTIQUE JOURNAL`,
    description: route.lead,
    alternates: {
      canonical: `/exhibition/route/${encodeURIComponent(route.id)}`,
    },
  };
}

function inferRoomLabel(href: string): string {
  const s = String(href || "");
  if (s === "/" || s.startsWith("/start")) return "START";
  if (s.startsWith("/canvas")) return "CANVAS";
  if (s.startsWith("/cars")) return "CARS";
  if (s.startsWith("/guide")) return "GUIDE";
  if (s.startsWith("/column")) return "COLUMN";
  if (s.startsWith("/heritage")) return "HERITAGE";
  if (s.startsWith("/news")) return "NEWS";
  return "ROOM";
}

export default async function ExhibitionRoutePage({ params }: { params: Params }) {
  const route = getExhibitionRoutes().find((r) => r.id === params.id);
  if (!route) notFound();

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
        name: "EXHIBITION",
        item: `${getSiteUrl()}/exhibition`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: route.title,
        item: `${getSiteUrl()}/exhibition/route/${encodeURIComponent(route.id)}`,
      },
    ],
  };

  const first = route.steps[0];

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground seed={`exhibit-route:${route.id}`} />
      <JsonLd id={`jsonld-exhibit-route-breadcrumb-${route.id}`} data={breadcrumbData} />

      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <Breadcrumb
            items={[
              { label: "HOME", href: "/" },
              { label: "EXHIBITION", href: "/exhibition" },
              { label: route.title },
            ]}
            className="mb-6"
          />

          <header className="mb-8">
            <Reveal>
              <p className="cb-eyebrow text-[#0ABAB5] opacity-100">EXHIBITION ROUTE</p>
              <h1 className="cb-title-display mt-3 text-[clamp(26px,3.2vw,40px)] text-[#222222]">
                {route.title}
              </h1>
              <p className="mt-2 text-[12px] font-semibold tracking-[0.18em] text-[#222222]/55">
                {route.duration}
              </p>
              <p className="cb-lead mt-3 max-w-2xl text-[#222222]/70">{route.lead}</p>
            </Reveal>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" aria-label="Route overview">
            <Reveal delay={60}>
              <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">STEPS</p>
                    <h2 className="mt-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">
                      順番（固定）
                    </h2>
                  </div>
                  {first ? (
                    <Button asChild variant="primary" size="sm" className="h-10 px-5">
                      <Link href={first.href}>この順で読む</Link>
                    </Button>
                  ) : null}
                </div>

                <ol className="mt-6 space-y-3">
                  {route.steps.map((s, idx) => (
                    <li
                      key={s.href}
                      className="rounded-3xl border border-[#222222]/10 bg-white/70 px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                            {String(idx + 1).padStart(2, "0")} · {inferRoomLabel(s.href)}
                          </p>
                          <p className="mt-2 text-[14px] font-semibold tracking-tight text-[#222222]">
                            {s.label}
                          </p>
                          <p className="mt-2 text-[11px] text-[#222222]/55">{s.href}</p>
                        </div>

                        <div className="pt-1">
                          <Button asChild size="sm" variant="outline" className="h-10 px-4">
                            <Link href={s.href}>開く</Link>
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            </Reveal>

            <Reveal delay={120}>
              <div className="space-y-4">
                <RouteProgress route={route} />

                <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
                  <h2 className="font-serif text-[14px] font-semibold text-[#222222]">使い方</h2>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-[#222222]/70">
                    <li>・このページは「順番」を固定するためのチケットです（検索/比較の前に使う）。</li>
                    <li>・各ステップを開いたら、戻って進捗が付く（端末内に保存）。</li>
                    <li>・途中で迷ったら、START または CANVAS に戻して判断軸を再固定。</li>
                  </ul>
                </GlassCard>

                <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
                  <h2 className="font-serif text-[14px] font-semibold text-[#222222]">戻る</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="h-10 px-5">
                      <Link href="/exhibition">EXHIBITIONへ</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-10 px-5">
                      <Link href="/start">STARTへ</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-10 px-5">
                      <Link href="/canvas">CANVASへ</Link>
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
